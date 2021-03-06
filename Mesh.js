/*
let m = new Mesh();
m.addVertex(10,0);
m.addVertex(0,50);
m.addVertex(60,60);
m.addVertex(70,10);
m.triangulate();
*/

const Delaunay = require('delaunay-fast');

function Mesh(){
  this._vertices = []; // flat arra, every 2 elems represents a vertex position
  this._vertexCount = 0;
  this._edges = [];
  this._faces = [];
  this._needsTriangulation = true;
}

Mesh.prototype.addVertex = function(x,y, noTriangulate){
  this._vertices.push(x);
  this._vertices.push(y);
  this._vertexCount++;
  this._needsTriangulation = true;
  
  if(!noTriangulate)
    this.triangulate();
};

Mesh.prototype.setTriangulation = function(edges, faces){
  this._edges = edges;
  this._faces = faces;
  this._needsTriangulation = false;
};

Mesh.prototype.vertexCount = function(){
  return this._vertexCount;
};

Mesh.prototype.triangulate = function(){
  if(!this._needsTriangulation)
    return;
  
// <<<
  // this._faces = earcut(this._vertices);
// ---  
  // Convert flat array of vertices into count(V)x2 2D array
  var vChunked = [];
  for (var chunkI=0; chunkI < this._vertices.length; chunkI+=2) {
    vChunked.push(this._vertices.slice(chunkI,chunkI+2));
  }
  this._faces = Delaunay.triangulate(vChunked);
  
  // Flatten the resulting count(F)x3 2D array
  this._faces = this._faces.reduce(function(a, b){
    return a.concat(b);
  }, []);
// >>>
  
  // Can't just use `Array(n).fill([])` or `Array(n).map(e => [])`, see:
  // http://stackoverflow.com/a/20333755
  this._edges = Array.apply(null, {length: this._vertexCount}).map(function() { return []; });
  
  // debugger;
  var a, b;
  for(var i=0; i < this._faces.length; i+=3){
    for(var vI=0; vI < 3; vI++){
      a = this._faces[i+vI];
      b = this._faces[i+((vI+1)%3)];
      // console.log('  '+a+' ('+(typeof a)+') <-> '+b+ ' ('+(typeof b)+')');
      this._edges[a].push(b);
      this._edges[b].push(a);
      // debugger;
    }
  }
  // TODO remove dupes in adjacency lists
  this._edges = this._edges.map(function(edges){
    return edges.filter(function(vert, i, self){
      return i === self.indexOf(vert);
    });
  });
  
  this._needsTriangulation = false;
};

Mesh.prototype.avgDistToNeighbors = function(vertexI){
  if(vertexI < 0 || vertexI >= this._vertexCount){
    console.log('Attempt to access out-of-bounds vertex.');
    return;
  }
  
  var adjacent = this._edges[vertexI];
  var adjacentDist = [];
  
  if(adjacent.length === 0)
    return null;
  
  var x = this._vertices[vertexI*2], y = this._vertices[vertexI*2 + 1];
  var nX, nY;
  
  for(var neighborI=0; neighborI < adjacent.length; neighborI++){
    nX = this._vertices[adjacent[neighborI]*2];
    nY = this._vertices[adjacent[neighborI]*2 + 1];
    adjacentDist.push(Math.sqrt((nX-x)*(nX-x) + (nY-y)*(nY-y)));
  }
  
  var sum = adjacentDist.reduce(function(sum, dist){
    return sum + dist;
  }, 0);
  
  return sum / adjacent.length;
};

Mesh.prototype.distToNeighbor = function(vertexI, neighborVertexI){
  if(vertexI < 0 || vertexI >= this._vertexCount){
    console.log('Attempt to access out-of-bounds vertex.');
    return;
  }
  
  if(this._edges[vertexI].indexOf(neighborVertexI) < 0)
    return; // neighbor was not in list of adjacent vertices
  
  var x = this._vertices[vertexI*2];
  var y = this._vertices[vertexI*2 + 1];
  
  var nX = this._vertices[neighborVertexI*2];
  var nY = this._vertices[neighborVertexI*2 + 1];
  
  return Math.sqrt((nX-x)*(nX-x) + (nY-y)*(nY-y));
};

// http://stackoverflow.com/a/919661
// https://en.wikipedia.org/wiki/Pairing_function#Cantor_pairing_function
function computeId(a, b){
  if(a > b){
    var temp = a;
    a = b;
    b = temp;
  }
  return .5*(a+b)*(a+b+1)+b;
}

Mesh.prototype.draw = function(ctx){
  ctx.save();
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'orange';
  
  var edgeDict = {}; // keep track of the edges we've already drawn
  var edgeId;
  var from, to; // just vertex indices, not actual coordinates!

  for(var i=0; i < this._vertexCount; i++){
    for(var adjI=0; adjI < this._edges[i].length; adjI++){
      // [0,1],[1,2],[2,0]
      // edgeId = computeId(this._faces[i+adjI], this._faces[(i+adjI+1)%3]);
      from = i;
      to = this._edges[i][adjI];
      edgeId = computeId(from, to);
      
      if(edgeId in edgeDict)
        continue;
      
      edgeDict[edgeId] = true;
      
      ctx.beginPath();
      ctx.moveTo(this._vertices[from*2], this._vertices[from*2+1]);
      ctx.lineTo(this._vertices[to*2], this._vertices[to*2+1]);
      ctx.stroke();
    }
  }
  
  ctx.restore();
};

Mesh.prototype.getVertexAt = function(i){
  return {
    x: this._vertices[i*2],
    y: this._vertices[i*2+1],
    neighbors: this._edges[i].slice() // defensive copy
  };
};

Mesh.prototype.forEachVertex = function(ctx, cb){
  var vert;
  for(var i=0; i < this._vertexCount; i++){
    cb.call(ctx, this.getVertexAt(i), i);
  }
};

Mesh.prototype.adjacencyMatrix = function(){
  var row;
  var adjacentI, adjacent;
  
  var mat = this._edges.reduce(function(mat, adjacencies){
    row = Array(this._vertexCount).fill(0);
    
    for(adjacentI = 0; adjacentI < adjacencies.length; adjacentI++){
      adjacent = adjacencies[adjacentI];
      row[adjacent] = 1;
    }
    mat.push(row);
    return mat;
  }.bind(this), []);
  
  return mat;
};

Mesh.prototype.isAdjacent = function(vertexI, neighborVertexI){
  if(vertexI < 0 || vertexI >= this._vertexCount){
    console.log('Attempt to access out-of-bounds vertex.');
    return;
  }
  
  return (this._edges[vertexI].indexOf(neighborVertexI) >= 0);
};

module.exports = Mesh;