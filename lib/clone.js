var shallowClone = function(src){
  var dest = {};
  for (var prop in src) {
    dest[prop] = src[prop];
  }
  return dest;
};

module.exports = {
  shallowClone: shallowClone
};
