/* 2D matrices */
function Matrix(opts){
  if(!Array.isArray(opts))
    throw new Error('Matrix (ctor): Must give dimensions, or an array to read');
  
  if(!Array.isArray(opts[0])) { // 1D
    this._data = opts.slice();
    this._cols = 1;
  }
  else { // 2D
    this._data = opts.map(function(row){
      return row.slice();
    });
    this._cols = this._data[0].length;
  }
  
  this._rows = this._data.length;
}

Matrix.prototype.format = function(){
  var line;
  
  for(var r=0; r < this._rows; r++){
    line = '[ ';
    
    if(this._cols === 1){
      var str = this._data[r] + '';
      str = '  '.substring(0, 2 - str.length) + str;
      line += str + ' ';
    }
    else {
      for(var c=0; c < this._cols; c++){      
        var str = this._data[r][c] + '';
        str = '  '.substring(0, 2 - str.length) + str;
        line += str + ' ';
      }
    }

    line += ']';
    console.log(line);
  }
};

module.exports = Matrix;