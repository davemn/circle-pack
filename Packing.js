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
  
  var weights = this.circles.reduce(function(radii, circle){
    radii.push(circle.r);
    return radii;
  }, []);
  
  // 
  // while(this.objectiveFn(weights) > .001){
  //   weights = ?;
  // }
  
  targetRadii = numeric.uncmin(this.getError.bind(this), weights).solution;
  
  // ...
  
  targetRadii.forEach(function(radius, i){
    this.circles[i].setPropTarget('r', radius, animDuration);
  }.bind(this));
};

module.exports = Packing;