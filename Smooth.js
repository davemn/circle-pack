const Time = require('./Time');

exports.Constant = function(val){
  return function(time){ return val; }
};

exports.Linear = function(duration, from, to){
  var startTime = Time.time;
  
  return function(time){
    if(time - startTime > duration){
      return to;
    }
    
    var progress = (time - startTime) / duration;
    return (1-progress)*from + progress*to;
  };
};