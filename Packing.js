const numeric = require('numeric');
const Circle = require('./Circle');

function Packing(mesh){  
  this.mesh = mesh;
  this.mesh.triangulate();
  
  this.circles = [];
  var c;
  this.mesh.forEachVertex(this, function(vert, i){
    c = new Circle(vert.x, vert.y, this.mesh.avgDistToNeighbors(i)*.5);
    // c.setPropTarget('r', this.mesh.avgDistToNeighbors(i)*.5, 1);
    this.circles.push(c);
  });
}

// sum of squared residuals at vertex i, given a circle radius at i of `weight`
Packing.prototype.getErrorAt = function(i, weight){
  var vert = this.mesh.getVertexAt(i);
  
  var n;
  var meshDist, radiusDist;
  var residuals = [];
  
  for(var neighborI=0; neighborI < vert.neighbors.length; neighborI++){
    n = this.circles[vert.neighbors[neighborI]];

    meshDist = this.mesh.distToNeighbor(i, vert.neighbors[neighborI]);
    residuals.push((meshDist - n.r) - weight);
  }
  var ssr = residuals.reduce(function(ssr, e){ // sum of squared residuals
    return ssr + (e*e);
  },0);
  
  // squared error of the current radius against its neighbors
  return { ssr: ssr, count: residuals.length };
};

// mean squared error across all vertices
Packing.prototype.getError = function(weights){
  if(!weights){
    weights = this.circles.reduce(function(radii, circle){
      radii.push(circle.r);
      return radii;
    }, []);
  }
  
  var totalSSR = 0;
  var err;
  var observationCount = 0;
  
  for(var i=0; i < this.mesh.vertexCount(); i++){
    // totalMse += this.getErrorAt(i);
    err = this.getErrorAt(i, weights[i]);
    totalSSR += err.ssr;
    observationCount += err.count;
  }
  
  return totalSSR / observationCount;
};

Packing.prototype.getCircles = function(){
  return this.circles;
};

Packing.prototype.refineOver = function(animDuration){
  // find a radius that minimizes the error for the current vertex
  // find a radius, newRadius := avg(distToNeighbor) - avg(radiusOfNeighbor)
  var targetRadii = Array(this.mesh.vertexCount()).fill(0);
  
  // <<<
  // var weights = this.circles.reduce(function(radii, circle){
  //   radii.push(circle.r);
  //   return radii;
  // }, []);
  // 
  // targetRadii = numeric.uncmin(this.getError.bind(this), weights).solution;
  // ---
  var A = this.mesh.adjacencyMatrix();
  
  // convert to upper-triangular to improve LP sol'n speed
  for(var i=0; i < A.length; i++){
    A[i].fill(0, 0, i+1);
  }
  
  // Split rows, (1) [0 1 1 0] => [1 1 0 0][1 0 1 0],
  // i.e. separate into two-variable inequalities.
  A = A.reduce(function(coeff, row, i){
    var newRow;
    
    for(var colI=0; colI < row.length; colI++){
      if(row[colI] === 0)
        continue;
      
      newRow = Array(row.length).fill(0);
      newRow[i] = 1;
      newRow[colI] = 1;
      coeff.push(newRow);
    }
    
    return coeff;
  }, []);
  
  // negative to maximize objective fn (instead of Numeric JS' minimize)
  var c = Array(this.mesh.vertexCount()).fill(-1);

  // vector of mesh distances, each entry is right half of an inequality.
  var b = A.map(function(row){
    var vI = row.indexOf(1); // first 1 in the row indicates the current vertex
    var nI = row.indexOf(1, vI+1); // last 1 in the row indicates its neighbor
    return this.mesh.distToNeighbor(vI, nI);
  }.bind(this));
  
  var lp = numeric.solveLP(c,A,b);
  console.log('Linear programming result := ');
  console.log(lp);
  
  targetRadii = lp.solution;
  // >>>
  
  targetRadii.forEach(function(radius, i){
    this.circles[i].setPropTarget('r', radius, animDuration);
  }.bind(this));
};

module.exports = Packing;