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

Mesh.prototype.triangulate = function(){
  this._faces = earcut(this._vertices);
  
  var edgeDict = {};
  var edgeId;
  
  for(var i=0; i < this._faces.length; i+=3){
    for(var vI=0; vI < 3; vI++){
      // [0,1],[1,2],[2,0]
      edgeId = computeId(this._faces[i+vI], this._faces[(i+vI+1)%3]);
      
      if(!(edgeId in edgeDict)){
        edgeDict[edgeId] = [this._faces[i+vI], this._faces[(i+vI+1)%3]];
        // sort in ascending numeric order
        // if(edgeDict[edgeId][0] > edgeDict[edgeId][1]){
        //   var temp = edgeDict[edgeId][0];
        //   edgeDict[edgeId][0] = edgeDict[edgeId][1];
        //   edgeDict[edgeId][1] = temp;
        // }
      }
    }
  }
  
  // TODO flatten edgeDict into array of adjacencies
  // edgeDict = {
  //   25:  [1, 3],
  //   16:  [2, 9],
  //   81:  [0, 1],
  //   19:  [2, 3],
  //   ...
  // }
  // =>
  // [
  //   [0, 1],
  //   [1, 3, 0, 1],
  //   [2, 9, 2, 3],
  //   [1, 3, 2, 3],
  //   ...
  // ]
  // =>
  // [
  //   [1],
  //   [3, 0],
  //   [9, 3],
  //   [1, 2],
  //   ...
  // ]
  
  var edgeList = _.reduce(edgeDict, function(result, edge){
    var greatestVertIdx = Math.max(edge[0], edge[1]);
    if(greatestVertIdx >= result.length){
      // fill result up to (and including) the highest vertex in this edge, with empty arrays (one per vertex)
      _.concat(result, _.fill(Array(greatestVertIdx + 1 - result.length), []));
    }
    
    result[edge[0]].push(edge[0], edge[1]);
    result[edge[1]].push(edge[0], edge[1]);
    return result;
  }, []);
  
  this._edges = _.map(edgeList, function(edges,i){
    return _.filter(edges, function(v){ return v !== i });
  });
};

Mesh.prototype.avgDistToNeighbors = function(){
  
};

module.exports = Mesh;