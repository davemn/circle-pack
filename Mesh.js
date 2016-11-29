/*
let m = new Mesh();
m.addVertex(10,0);
m.addVertex(0,50);
m.addVertex(60,60);
m.addVertex(70,10);
m.triangulate();
*/

const earcut = require('earcut'); // https://github.com/mapbox/earcut

function Mesh(){
  this._vertices = [];
  this._edges = [];
  this._faces = [];
}

Mesh.prototype.addVertex = function(x,y){
  this._vertices.push(x);
  this._vertices.push(y);
};

Mesh.prototype.triangulate = function(){
  this._faces = earcut(this._vertices);
  
  var edgeDict = {};
  var edgeId;
  // TODO fix incorrect link between adjacent faces (e.g. [4 8 3 7 6 1], the code below creates an edge between 3 & 7)
  // TODO fix missing link between first & last verts in triangle
  for(var i=0; i < this._faces.length; i++){
    if(i === this._faces.length-1)
      break;
    
    edgeId = this._faces[i] ^ this._faces[i+1]; // XOR
    if(!edgeDict[edgeId])
      edgeDict[edgeId] = [this._faces[i], this._faces[i+1]];
    else {
      edgeDict[edgeId].push(this._faces[i]);
      edgeDict[edgeId].push(this._faces[i+1]);
    }
  }
  // remove duplicate indexes (http://stackoverflow.com/a/28762098)
  for(edgeId in edgeDict){
    edgeDict[edgeId] = edgeDict[edgeId].filter(function(elem, pos) {
      return edgeDict[edgeId].indexOf(elem) == pos;
    }); 
    edgeDict[edgeId].sort();
  }
  
  // TODO flatten edgeDict into array of pairs
  // this._edges = ...;
};

Mesh.prototype.avgDistToNeighbors = function(){
  
};

module.exports = Mesh;