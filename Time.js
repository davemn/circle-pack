exports.deltaTime = 0;
exports.time = 0; // time since start of game, in seconds, accurate to 1 ms
exports.frameCount = 0;

// 1 ms accuracy
function msToSec(ms){
  return +(Math.round(ms) + 'e-3');
}

function step(){
  // perf.now() returns millis, e.g. 1200.001 = 1.2 secs + 1/1000 ms
  var frameStart = msToSec(performance.now());
  
  exports.deltaTime = frameStart - exports.time;
  exports.time = frameStart;
  
  exports.frameCount++;
  requestAnimationFrame(step);
}

requestAnimationFrame(step);