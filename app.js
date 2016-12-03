const window = require('global/window');
const document = require('global/document');
const $ = window.$;

const Time = require('./Time');
const Canvas = require('./Canvas');
const Packing = require('./Packing');
const Mesh = require('./Mesh');

// ---

$(document).ready(function(evt) {
  var canvas = new Canvas({
    $canvas: $('#canvas-input'),
    aspectRatio: 4/3
  });
    
  // ---
    
  canvas.beforeLoop(function factory(){
    var errorThreshold = .001;
    var animDuration = 1; // seconds
    var animStart = -1;
    
    var States = {
      REFINE: 1,
      ANIMATE: 2,
      DONE: 4,
    };
    var state = States.REFINE;
    
    return function(){
      switch(state){
        case States.REFINE:
          if(packing.getError() > errorThreshold){
            packing = packing.refineOver(animDuration);
            // packing.solve(1); // alt., (100, .001)
            
            animStart = -1;
            state = States.ANIMATE;
          }
          else
            state = States.DONE;
          break;
        case States.ANIMATE:
          if(animStart < 0)
            animStart = Time.time;

          if(Time.time - animStart > animDuration)
            state = States.REFINE;
          break;
        case States.DONE:
          break;
      }
    };
  });
  
  var mesh = new Mesh();

  // mesh.addVertex(0,0,true);
  // mesh.addVertex(50,0,true);
  // mesh.addVertex(0,50,true);
  // mesh.addVertex(50,50,true);
  mesh.addVertex(10,0,true);
  mesh.addVertex(0,50,true);
  mesh.addVertex(60,60,true);
  mesh.addVertex(70,10,true);
  mesh.triangulate();
  
  console.log(mesh.vertexCount() + ' Vertices');
  console.log(mesh._vertices);
  console.log('Faces');
  console.log(mesh._faces);
  console.log('Edges');
  console.log(mesh._edges);
  
  canvas.add(mesh);  

  var packing = new Packing(mesh);
  canvas.add(packing.getCircles());
  
  canvas.loop();
});