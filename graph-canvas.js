(function($, exports){
  exports.ANIMATION_SHOW = 'show';
  
  exports.instance = function(opts){
    var $canvas = opts.$canvas;
    
    this.relMousePos = {x:0, y:0};
    
    this.swatchSize = 20;
    this.swatchPadding = 8;
    
    // - Size & setup drawing environment ---
    this.canvas = $canvas.get(0);
    this.ctx = this.canvas.getContext('2d');
    
    // ---
    
    if(opts.aspectRatio){
      var width = $canvas.parent('.canvas-container').width();
      var height = width / opts.aspectRatio;
      
      // Don't set canvas size using CSS properties! Will result in pixel scaling instead of viewport scaling.
      // http://stackoverflow.com/a/331462
      this.canvas.width  = width;
      this.canvas.height = height;
    }
    
    // - Create animation queues (triggered with play method) ---
  
    $(this.canvas).velocity(
      { opacity: 1, top: '0%' },
      {
        duration: 1000,
        queue: exports.ANIMATION_SHOW
      }
    );
    
    $canvas.mousemove({outerThis:this, canvas:this.canvas, ctx:this.ctx}, this._updateMousePos);
        
    // - Draw dynamic elements ---
    // requestAnimationFrame(updateCanvas);
  };
    
  // Ala http://stackoverflow.com/a/17130415
  exports.instance.prototype._updateMousePos = function(evt){
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
  
  // exports.instance.prototype.drawSwatchGrid = function(swatches, x, y){
  //   // ctx.fillStyle = 'green';
  //   // ctx.strokeStyle = 'green';
  //   // ctx.lineWidth
  // 
  //   // ctx.lineWidth = 1;
  //   // ctx.strokeRect(8.5, 8.5, 20,20);
  //   
  //   this.ctx.clearRect(0,0, this.canvas.width,this.canvas.height);
  //   
  //   this.ctx.save();
  //   this.ctx.lineWidth = 1;
  //   
  //   this.ctx.fillStyle = 'white';
  //   this.ctx.fillRect(0,0, this.canvas.width,this.canvas.height);
  //   
  //   var curPos = {x: x, y: y};
  //   
  //   var swatchI=0;
  //   for(var swatch in swatches){
  //     if(swatchI !== 0 && (swatchI%7) === 0){ // start new row
  //       curPos.x = x;
  //       curPos.y += this.swatchSize + this.swatchPadding;
  //     }
  //   
  //     this.ctx.fillStyle = 'rgb('+swatches[swatch][0]+','+swatches[swatch][1]+','+swatches[swatch][2]+')';
  //     this.ctx.fillRect(curPos.x, curPos.y, this.swatchSize, this.swatchSize);
  //     
  //     this.ctx.strokeRect(curPos.x, curPos.y, this.swatchSize, this.swatchSize);
  //     
  //     curPos.x += this.swatchSize + this.swatchPadding;
  //    
  //     swatchI++;
  //   }
  //   
  //   this.ctx.restore();
  // };
  
  exports.instance.prototype.play = function(animationName){
    $(this.canvas).dequeue(animationName);
  };
  
  exports.instance.prototype.drawGraph = function(){
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
})(jQuery, window.GraphCanvas = {});