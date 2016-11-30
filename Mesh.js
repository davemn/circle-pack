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
  this._vertices = [];
  this._vertexCount = 0;
  this._edges = [];
  this._faces = [];
}

Mesh.prototype.addVertex = function(x,y){
  this._vertices.push(x);
  this._vertices.push(y);
  this._vertexCount++;
};

Mesh.prototype.triangulate = function(){
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
};

Mesh.prototype.avgDistToNeighbors = function(){
  
};

module.exports = Mesh;