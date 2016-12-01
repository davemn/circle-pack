// var packing = new Packing(mesh, circles);
function Packing(mesh, circles){
  this.error = ?;
  
  this.mesh = mesh;
  this.mesh.triangulate();
}

Packing.prototype.refine = function(){
  
};

// packing.forEachVertex(function(prev, vert)
Packing.prototype.forEachVertex = function(fn){
  // vert.circle.getRadius = Smooth.Linear(animDuration, prev.weight, vert.weight);
};
  
  
Packing.prototype.draw = function(ctx){
  
};

module.exports = Packing;