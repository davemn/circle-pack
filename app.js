const window = require('global/window');
const document = require('global/document');
const $ = window.$;

const Canvas = require('./Canvas');
const Circle = require('./Circle');

// ---

$(document).ready(function(evt) {
  var canvas = new Canvas({
    $canvas: $('#canvas-input'),
    aspectRatio: 4/3
  });
  
  canvas.add(new Circle(50,50,30));
  canvas.loop();
});