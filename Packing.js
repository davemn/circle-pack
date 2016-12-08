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

// mean square error at vertex i
Packing.prototype.getErrorAt = function(i){
  var vert = this.mesh.getVertexAt(i);
  
  var cur = this.circles[i];
  var n;
  var meshDist, radiusDist;
  var err = [];
  
  for(var neighborI=0; neighborI < vert.neighbors.length; neighborI++){
    n = this.circles[vert.neighbors[neighborI]];

    meshDist = Math.sqrt((n.x-cur.x)*(n.x-cur.x) + (n.y-cur.y)*(n.y-cur.y))
    radiusDist = cur.r + n.r;
    err.push(meshDist - radiusDist);
  }
  var mse = err.reduce(function(mse, e){ // mean squared error of the current radius against its neighbors
    return mse + (e*e);
  },0);
  
  return mse / err.length;
};

// sum of the mean square error at each vertex
Packing.prototype.getError = function(){
  var totalMse = 0;
  
  for(var i=0; i < this.mesh.vertexCount(); i++){
    totalMse += this.getErrorAt(i);
  }
  
  return totalMse;
};

Packing.prototype.getCircles = function(){
  return this.circles;
};

Packing.prototype.refineOver = function(animDuration){
  // find a radius that minimizes the error for the current vertex
  // find a radius, newRadius := avg(distToNeighbor) - avg(radiusOfNeighbor)
  var targetRadii = Array(this.mesh.vertexCount()).fill(0);
  
  var weights = this.circles.reduce(function(radii, circle){
    radii.push(circle.r);
    return radii;
  }, []);
  
  if(!this.objectiveFn)
    this.objectiveFn = this._objectiveFactory(this.mesh);
  // 
  // while(this.objectiveFn(weights) > .001){
  //   weights = ?;
  // }
  
  targetRadii = numeric.uncmin(this.objectiveFn, weights).solution;
  
  // ...
  
  targetRadii.forEach(function(radius, i){
    this.circles[i].setPropTarget('r', radius, animDuration);
  }.bind(this));
};

// Sum of squares error at a given vertex, and a given weight (`curR`)
Packing.prototype._err = function(vert, i, curR){
  var n; // neighboring circle
  var meshDist; // mesh distance between current vertex and neighbor
  var residuals = []; // residual := difference between the actual value of the dependent variable and the value predicted by the model
  
  for(var neighborI=0; neighborI < vert.neighbors.length; neighborI++){
    n = this.circles[vert.neighbors[neighborI]];
    meshDist = this.mesh.distToNeighbor(i, vert.neighbors[neighborI]);
    // y = meshDist - n.r, or actual space available along edge to neighbor
    // f(x,b) = curR, or current best fit
    residuals.push((meshDist - n.r) - curR);
  }
  var sumSquareResiduals = residuals.reduce(function(sum, residual){
    return sum + (residual*residual);
  }, 0);
  return sumSquareResiduals;
};

Packing.prototype._objectiveFactory = function(mesh){
  return function(weights){
    var err = [];
    mesh.forEachVertex(this, function(vert, i){
      err.push(this._err(vert, i, weights[i]));
    });  
    
    var errSum = err.reduce(function(sum, e){
      return sum + e;
    }, 0);
    
    return errSum;
  }.bind(this);
};

module.exports = Packing;