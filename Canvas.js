function Canvas(opts){
  var $canvas = opts.$canvas;
  
  this.relMousePos = {x:0, y:0};
  
  // - Size & setup drawing environment ---
  this.canvas = $canvas.get(0);
  this.ctx = this.canvas.getContext('2d');
  this._q = []; // queue of drawables (objects with a draw() method)
  this._isLoop = false;
  this._beforeDraw = []; // append-only queue of functions to be called at the start of draw()
  
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
  if(Array.isArray(drawable)){
    for(var i=0; i < drawable.length; i++){
      this._q.push(drawable[i]);
    }
  }
  else
    this._q.push(drawable);
};

Canvas.prototype.draw = function(){
  for(var i=0; i < this._beforeDraw.length; i++){
    this._beforeDraw[i]();
  }
  
  this.ctx.save();
  this.ctx.lineWidth = 1;
  
  this.ctx.fillStyle = 'white';
  this.ctx.fillRect(0,0, this.canvas.width,this.canvas.height);
  
  for(i=0; i < this._q.length; i++){
    this._q[i].draw(this.ctx, this.canvas);
  }
  
  if(this._isLoop)
    requestAnimationFrame(this.draw);
};

Canvas.prototype.loop = function(){
  this._isLoop = true;
  requestAnimationFrame(this.draw);
};

Canvas.prototype.noLoop = function(){
  this._isLoop = false;
};

Canvas.prototype.beforeLoop = function(cb){
  this._beforeDraw.push(cb);
};

module.exports = Canvas;