/*
let m = new Mesh();
m.addVertex(10,0);
m.addVertex(0,50);
m.addVertex(60,60);
m.addVertex(70,10);
m.triangulate();
*/

const earcut = require('earcut'); // https://github.com/mapbox/earcut
const _ = require('lodash');

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

Mesh.prototype.vertexCount = function(){
  return this._vertexCount;
};

Mesh.prototype.triangulate = function(){
  if(!this._needsTriangulation)
    return;
  
  this._faces = earcut(this._vertices);
  
  this._edges = Array(this._vertexCount).fill([]);
  var a, b;
  for(var i=0; i < this._faces.length; i+=3){
    for(var vI=0; vI < 3; vI++){
      a = this._faces[i+vI];
      b = this._faces[(i+vI+1)%3];
      this._edges[a].push(b);
      this._edges[b].push(a);
    }
  }
  
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

module.exports = Mesh;