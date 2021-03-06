// Vector2.Lerp = function(a, b, t){
//   t = Math.max(t, 0);
//   t = Math.min(t, 1);
//   
//   var heading = Vector2.Subtract(b, a);
//   heading = Vector2.Scale(heading, t);
//   
//   return Vector2.Add(a, heading);
// };

// // Movement speed in units/sec.
// var speed = 1.0;
// 
// // Time when the movement started.
// private var startTime: float;
// 
// // Total distance between the markers.
// private var journeyLength: float;  
// 
// function Start() {
//   // Keep a note of the time the movement started.
//   startTime = Time.time;
//   
//   // Calculate the journey length.
//   journeyLength = Vector3.Distance(startMarker.position, endMarker.position);
// }
// 
// // Follows the target position like with a spring
// function Update () {
//   // Distance moved = time * speed.
//   var distCovered = (Time.time - startTime) * speed;
//   
//   // Fraction of journey completed = current distance divided by total distance.
//   var fracJourney = distCovered / journeyLength;
//   
//   // Set our position as a fraction of the distance between the markers.
//   transform.position = Vector3.Lerp(startMarker.position, endMarker.position, fracJourney);
// }

const window = require('global/window');
const Time = require('./Time');
const Smooth = require('./Smooth');

function Circle(x,y,radius){
  this.x = x;
  this.y = y;
  this.r = radius;
  
  // Make sure `this` is always correct in methods that are used as callbacks
  this.draw = this.draw.bind(this);
}

Circle.prototype.setPropTarget = function(propName, targetVal, duration){
  if(!(propName in this))
    return;
  
  var interpFn = Smooth.Linear(duration, this[propName], targetVal);
  
  Object.defineProperty(this, propName, {
    enumerable: true,
    get: function(){ return interpFn(Time.time); },
    set: function(val){
      interpFn = Smooth.Constant(val);
    }
  });
};

Circle.prototype.draw = function(ctx){
  ctx.save();
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'red';
  ctx.fillStyle = 'white';
  
  ctx.beginPath();
  var r = Math.max(1, Math.floor(this.r));
  ctx.arc(this.x, this.y, r, 0,2*Math.PI);
  ctx.stroke();
  // ctx.fill();
  
  ctx.restore();
};

module.exports = Circle;