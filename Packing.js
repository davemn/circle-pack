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
  
  this.mesh.forEachVertex(this, function(vert, i){
  // <<<
  //  var cur = this.circles[i];
  //  var n;
  //  var nR = [];
  //  
  //  for(var neighborI=0; neighborI < vert.neighbors.length; neighborI++){
  //    n = this.circles[vert.neighbors[neighborI]];
  //    // ...
  //    // radiusDist = cur.r + n.r;
  //    // err.push(meshDist - radiusDist);
  //    nR.push(n.r);
  //  }
  // ---
  //  var outer = this;
  //  var avgR = vert.neighbors.reduce(function(accR, neighborI){
  //    return accR + outer.circles[neighborI].r;
  //  },0);
  //  avgR = avgR / vert.neighbors.length;
  //  
  //  avgD = this.mesh.avgDistToNeighbors(i);
  //  targetRadii[i] = avgD - avgR;
  // ---
  //  var outer = this;
  //  var maxNeighbor = vert.neighbors.reduce(function(max, neighborI){
  //    if(outer.circles[neighborI].r > max.r)
  //      return {i: neighborI, r: outer.circles[neighborI].r};
  //    else
  //      return max;
  //  }, {i:-1, r:-1});
  //  
  //  var meshDist = this.mesh.distToNeighbor(i, maxNeighbor.i);
  //  targetRadii[i] = meshDist - maxNeighbor.r;
  // ---
    var cur = this.circles[i]; // current circle
    // TODO Need to find `r` that minimizes err(r)
    this._err(vert, i, cur.r);
  // >>>
  });
  
  targetRadii.forEach(function(radius, i){
    this.circles[i].setPropTarget('r', radius, animDuration);
  }.bind(this));
};

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

module.exports = Packing;