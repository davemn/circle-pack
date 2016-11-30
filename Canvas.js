function Canvas(opts){
  var $canvas = opts.$canvas;
  
  this.relMousePos = {x:0, y:0};
  
  // - Size & setup drawing environment ---
  this.canvas = $canvas.get(0);
  this.ctx = this.canvas.getContext('2d');
  this._q = []; // queue of drawables (objects with a draw() method)
  this._isLoop = false;
  
  // ---
  
  if(opts.aspectRatio){
    var width = $canvas.parent('.canvas-container').width();
    var height = width / opts.aspectRatio;
    
    // Don't set canvas size using CSS properties! Will result in pixel scaling instead of viewport scaling.
    // http://stackoverflow.com/a/331462
    this.canvas.width  = width;
    this.canvas.height = height;
  }
  
  $canvas.mousemove({outerThis:this, canvas:this.canvas, ctx:this.ctx}, this._updateMousePos);
  
  // Make sure `this` is always correct in methods that are used as callbacks
  this.draw = this.draw.bind(this);
};
  
// Ala http://stackoverflow.com/a/17130415
Canvas.prototype._updateMousePos = function(evt){
  // evt.pageX, evt.pageY // use instead of client[X|Y] or offset[X|Y]!
  // jQuery normalizes page[X|Y], but we need viewport-relative 
  var outerThis = evt.data.outerThis;
  var canvas = evt.data.canvas;
  var ctx = evt.data.ctx;
  
  var rect = canvas.getBoundingClientRect();
  
  // mouse position relative to the top-left of the canvas
  outerThis.relMousePos.x = evt.clientX - rect.left;
  outerThis.relMousePos.y = evt.clientY - rect.top;
};

Canvas.prototype.add = function(drawable){
  this._q.push(drawable);
};

Canvas.prototype.draw = function(){
  this.ctx.save();
  this.ctx.lineWidth = 1;
  
  this.ctx.fillStyle = 'white';
  this.ctx.fillRect(0,0, this.canvas.width,this.canvas.height);
  
  for(var i=0; i < this._q.length; i++){
    this._q[i].draw(this.ctx, this.canvas);
  }
  
  if(this._isLoop)
    requestAnimationFrame(this.draw);
};

Canvas.prototype.loop = function(){
  this._isLoop = true;
  requestAnimationFrame(this.draw);
};

Canvas.prototype.drawCircle = function(x, y, radius){
  this.ctx.beginPath();
  this.ctx.arc(x, y, radius, 0,2*Math.PI);
  this.ctx.stroke();
  this.ctx.fill();
};

Canvas.prototype.drawGraph = function(){
  this.ctx.save();
  this.ctx.lineWidth = 1;
  
  this.ctx.fillStyle = 'white';
  this.ctx.fillRect(0,0, this.canvas.width,this.canvas.height);
  
  var tri = [
      Math.random() * this.canvas.width, Math.random() * this.canvas.height,
      Math.random() * this.canvas.width, Math.random() * this.canvas.height,
      Math.random() * this.canvas.width, Math.random() * this.canvas.height
  ];
  
  // Draw edges
  this.ctx.strokeStyle = 'black';
  this.ctx.beginPath();
  this.ctx.moveTo(tri[0], tri[1]);
  this.ctx.lineTo(tri[2], tri[3]);
  this.ctx.lineTo(tri[4], tri[5]);
  this.ctx.closePath();
  this.ctx.stroke();
  
  // Draw vertices
  this.ctx.lineWidth = 2;
  this.ctx.strokeStyle = 'red';
  this.ctx.fillStyle = 'white';
  
  for(var vertI=0; vertI < 3; vertI++){
    this.ctx.beginPath();
    this.ctx.arc(tri[vertI*2], tri[vertI*2 + 1], 4, 0,2*Math.PI);
    this.ctx.stroke();
    this.ctx.fill();
  }
  
  this.ctx.restore();
};

module.exports = Canvas;