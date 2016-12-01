const window = require('global/window');
const document = require('global/document');
const $ = window.$;

const Canvas = require('./Canvas');
const Time = require('./Time');
const Circle = require('./Circle');

// ---

var Smooth = {
  Constant: function(val){
    return function(time){ return val; }
  },
  Linear: function(duration, from, to){
    var startTime = Time.time;
    
    return function(time){
      if(time - startTime > duration){
        return to;
      }
      
      var progress = (time - startTime) / duration;
      return (1-progress)*from + progress*to;
    };
  }
};

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
              vert.circle.getRadius = Smooth.Linear(animDuration, prev.weight, vert.weight);
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
  var packing = new Packing(mesh, circles);
  canvas.add(packing);
  
  canvas.loop();
});