var shallowClone = null;

try {
  var nodeV8clone = require('node-v8-clone');
  shallowClone = function(obj){
    return nodeV8clone.clone(obj, false);
  };
} catch(err){
  shallowClone = function(src){
    var dest = {};
    for (var prop in src) {
      dest[prop] = src[prop];
    }
    return dest;
  };
}

module.exports = {
  shallowClone: shallowClone
};