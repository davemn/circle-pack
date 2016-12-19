const window = require('global/window');
const document = require('global/document');
const $ = window.$;

const Time = require('./Time');
const Canvas = require('./Canvas');
const Packing = require('./Packing');
const Mesh = require('./Mesh');
const Circle = require('./Circle');

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
      // <<<
      //  curErr = scene.packing.getError();
      //  console.log('Current error := ' + curErr + ', threshold ' + errorThreshold);
      //  if(curErr > errorThreshold){
      //    console.log('  Refining solution ...');
      //    scene.packing.refineOver(animDuration);
      //    // packing.solve(1); // alt., (100, .001)
      //    
      //    animStart = -1;
      //    state = States.ANIMATE;
      //  }
      //  else
      //    state = States.DONE;
      // ---
        scene.packing.refineOver(animDuration);
        state = States.DONE;
      // >>>
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
  
// <<<
  scene.mesh.addVertex(59.42, 292.05,true);
  scene.mesh.addVertex(62.12, 172.34,true);
  scene.mesh.addVertex(34.04, 316.94,true);
  scene.mesh.addVertex(282.96, 166.96,true);
  
  var faces = [0, 2, 3, 1, 0, 3, 2, 0, 1];
  var edges = [
    [2, 3, 1],
    [0, 3, 2],
    [0, 3, 1],
    [2, 0, 1],
  ];
  
  scene.mesh.setTriangulation(edges, faces);
// ---
  // // Ported from Matlab:
  // // https://www.mathworks.com/matlabcentral/answers/158357-create-random-points-in-a-rectangular-domain-but-with-minimum-separation-distance#answer_154888
  // var x = Array.apply(null, {length: 1e4}).map(function(){ return Math.random(); });
  // var y = Array.apply(null, {length: 1e4}).map(function(){ return Math.random(); });
  // 
  // var minAllowableDistance = 0.05;
  // var numberOfPoints = 4;
  // // Initialize first point.
  // var keeper = [{x: x[0], y: y[0]}];
  // // Try dropping down more points.
  // for (var k=2; k <= numberOfPoints; k++){
  //   // Get a trial point.
  //   var thisX = x[k-1];
  //   var thisY = y[k-1];
  //   // See how far this is away from existing keeper points.
  //   var distances = keeper.reduce(function(distances, keeperP){
  //     distances.push(Math.sqrt((thisX-keeperP.x)*(thisX-keeperP.x) + (thisY-keeperP.y)*(thisY-keeperP.y)));
  //     return distances;
  //   }, []);
  //   var minDistance = Math.min.apply(null, distances);
  //   if (minDistance >= minAllowableDistance){
  //     keeper.push({x: thisX, y: thisY});
  //   }
  // }
  // 
  // console.log(keeper.length+' point(s) generated.');
  // 
  // keeper.map(function(p){
  //   scene.mesh.addVertex(p.x * canvas.canvas.width, p.y * canvas.canvas.height,true);
  // });
// >>>
  
  scene.mesh.triangulate();
  
  console.log(scene.mesh.vertexCount() + ' Vertices');
  console.log(scene.mesh._vertices);
  console.log('Faces');
  console.log(scene.mesh._faces);
  console.log('Edges');
  console.log(scene.mesh._edges);
  
  canvas.add(scene.mesh);
  
// <<<
  // scene.packing = new Packing(scene.mesh);
  // scene.circles = scene.packing.getCircles();
  // canvas.add(scene.circles);
  // 
  // // ---
  //   
  // canvas.beforeLoop(solutionAnimationFactory(scene));
// ---
  // Minimize p = -a - b - c - d subject to
  // a + b <= 119.74
  // a + c <= 35.56
  // a + d <= 256.16
  // b + c <= 147.31
  // b + d <= 220.9
  // c + d <= 290.62

  // numericjs     Zweig simplex (http://www.zweigmedia.com/RealWorld/simplex.html)
  // 13.82     vs. 3.995
  // 105.86    vs. 115.745
  // 21.73     vs. 31.565
  // 115.04    vs. 105.155
  
  // var radii = [13.82, 105.86, 21.73, 115.04]; // obj fn := 256.45
  var radii = [3.995, 115.745, 31.565, 105.155]; // obj fn := 256.46

  scene.mesh.forEachVertex(this, function(vert, i){
    var c = new Circle(vert.x, vert.y, radii[i]);
    canvas.add(c);
  });
// >>>
  
  canvas.loop();
});