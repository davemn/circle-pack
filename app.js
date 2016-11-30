const window = require('global/window');
const document = require('global/document');
const $ = window.$;

const Canvas = require('./Canvas');

// ---

$(document).ready(function(evt) {
  var canvas = new Canvas({
    $canvas: $('#canvas-input'),
    aspectRatio: 4/3
  });
  
  canvas.drawGraph();
});