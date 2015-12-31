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
  
  exports.instance.prototype.drawCircle = function(x, y, radius){
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0,2*Math.PI);
    this.ctx.stroke();
    this.ctx.fill();
  };
  
  exports.instance.prototype._randomPacking = function(){
    // v2
    //  (β)
    //      (γ) v3
    //  (α)
    // v1
    
    var r1 = Math.random() * 30;
    var r2 = Math.random() * 30;
    var r3 = Math.random() * 30;
    
    console.log('r1 = ' + r1);
    console.log('r2 = ' + r2);
    console.log('r3 = ' + r3);
    
    var a = r2+r3;
    var b = r1+r3;
    var c = r1+r2;
    
    var α = Math.acos((b*b + c*c - a*a)/(2*b*c));
    var β = Math.acos((a*a + c*c - b*b)/(2*a*c));
    var γ = Math.PI - α - β;
    
    console.log('α = ' + (α/Math.PI)*180);
    console.log('β = ' + (β/Math.PI)*180);
    console.log('γ = ' + (γ/Math.PI)*180);
    console.log('α + β + γ = ' + (α+β+γ));
    
    var x3 = (r1+r2) * Math.sin(α) * Math.sin(β) / Math.sin(α+β);
    var y3 = Math.sqrt(b*b - x3*x3);
    
    this.ctx.translate(50,50);
      
    // place the first vertex at the origin
    this.drawCircle(0,0, r1);
    
    // place the second vertex at (0, c)
    this.drawCircle(0,c, r2);
    
    // place the third vertex at (x3, y3)
    this.drawCircle(x3,y3, r3);
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
    
    this._randomPacking();
        
    //       .
    //      / \
    //     z   z
    //    /     \
    //   x       y
    //  /         \
    // . - x - y - .
    
    // θ = x y + ^2 x z + ^2 + y z + ^2 - 2 x y + * x z + * / arccos
    // Derive:
    // c ^2 == a ^2 b ^2 + 2 a * b * γ cos * -
    // αβγ
    // 
    // c^2 = a^2 + b^2 - 2ab*(cos γ)
    // 
    // randomly assign a radius to each vertex
    // // for each vertex:
    // //   check the length of the legs, if they match that of the existing triangle, exit loop
    // //   set the radius to the average radius of its neighbors
    
    // Compute sizes of circles required for tangency, if placed at vertices
    
    // problem := determine an angle θ, knowing only the radii of the circles at the vertices
    // inverse problem := determine the radii of the circles at the vertices, knowing only the angles θ
    
    // x1 = tri[0]
    // y1 = tri[1]
    // 
    // x2 = tri[2]
    // y2 = tri[3]
    // 
    // x3 = tri[4]
    // y3 = tri[5]
    
    
    this.ctx.restore();
  };
})(jQuery, window.GraphCanvas = {});