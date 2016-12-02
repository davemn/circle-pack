const window = require('global/window');
const document = require('global/document');
const $ = window.$;

const Time = require('./Time');
const Canvas = require('./Canvas');
const Circle = require('./Circle');
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
          if(packing.error > errorThreshold){
            packing = packing.refine();
            // packing.solve(1); // alt., (100, .001)
            
            packing.forEachVertex(function(prev, vert){
              vert.circle.setPropTarget('r', vert.weight, animDuration);
              // call in Circle::draw(), as getRadius(Time.time);
            });
            
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
  
  // TODO define mesh, circles
// <<<
  // var packing = new Packing(mesh, circles);
  // canvas.add(packing);
// ---
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
  
  // Mesh.prototype.addVertex = function(x,y, noTriangulate){
  // Mesh.prototype.triangulate = function(){
  canvas.add(mesh);
// >>>

  // function Circle(x,y,radius){
  var c = new Circle(200,200, 80);
  c.setPropTarget('r', 120, 2);
  canvas.add(c);
  
  canvas.loop();
});