var ArrayUtil = {
  format: function(data){
    var _data, _cols, _rows;
    
    if(!Array.isArray(data))
      throw new Error('Matrix (ctor): Must give dimensions, or an array to read');
    
    if(!Array.isArray(data[0])) { // 1D
      _data = data.slice();
      _cols = 1;
    }
    else { // 2D
      _data = data.map(function(row){
        return row.slice();
      });
      _cols = _data[0].length;
    }
    
    _rows = _data.length;
    
    // - actually format -
    
    var line;
    
    for(var r=0; r < _rows; r++){
      line = '[ ';
      
      if(_cols === 1){
        var str = _data[r] + '';
        str = '  '.substring(0, 2 - str.length) + str;
        line += str + ' ';
      }
      else {
        for(var c=0; c < _cols; c++){      
          var str = _data[r][c] + '';
          str = '  '.substring(0, 2 - str.length) + str;
          line += str + ' ';
        }
      }

      line += ']';
      console.log(line);
    }
  }
};

module.exports = ArrayUtil;