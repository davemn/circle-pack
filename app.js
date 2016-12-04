const window = require('global/window');
const document = require('global/document');
const $ = window.$;

const Time = require('./Time');
const Canvas = require('./Canvas');
const Packing = require('./Packing');
const Mesh = require('./Mesh');

// ---

function solutionAnimationFactory(scene){
  var errorThreshold = .001;
  var animDuration = 1; // seconds
  var animStart = -1;
  
  var States = {
    REFINE: 1,
    ANIMATE: 2,
    DONE: 4,
  };
  var state = States.REFINE;
  var scene = scene;
  
  return function solutionAnimation(){
    var curErr;
    switch(state){
      case States.REFINE:
        curErr = scene.packing.getError();
        console.log('Current error := ' + curErr + ', threshold ' + errorThreshold);
        if(curErr > errorThreshold){
          console.log('  Refining solution ...');
          scene.packing.refineOver(animDuration);
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
        console.log('Done.');
        break;
    }
  };
}

$(document).ready(function(evt) {
  var canvas = new Canvas({
    $canvas: $('#canvas-input'),
    aspectRatio: 4/3
  });
    
  // ---
  
  var scene = {
    mesh: new Mesh(),
    packing: null,
    circles: null
  };
  
  // mesh.addVertex(0,0,true);
  // mesh.addVertex(50,0,true);
  // mesh.addVertex(0,50,true);
  // mesh.addVertex(50,50,true);
  scene.mesh.addVertex(10,0,true);
  scene.mesh.addVertex(0,50,true);
  scene.mesh.addVertex(60,60,true);
  scene.mesh.addVertex(70,10,true);
  scene.mesh.triangulate();
  
  console.log(scene.mesh.vertexCount() + ' Vertices');
  console.log(scene.mesh._vertices);
  console.log('Faces');
  console.log(scene.mesh._faces);
  console.log('Edges');
  console.log(scene.mesh._edges);
  
  canvas.add(scene.mesh);
  
  scene.packing = new Packing(scene.mesh);
  scene.circles = scene.packing.getCircles();
  canvas.add(scene.circles);
  
  // ---
    
  canvas.beforeLoop(solutionAnimationFactory(scene));
  
  canvas.loop();
});