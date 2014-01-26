var Quadtree2Helper = {
  fnName : function fnName(fn) {
    var ret = fn.toString();
    ret = ret.substr('function '.length);
    ret = ret.substr(0, ret.indexOf('('));
    return ret;
  },

  // A verbose exception generator helper.
  thrower : function thrower(code, message, key) {
    var error = code;

    if(key)             { error += '_' + key; }
    if(message)         { error += ' - '; }
    if(message && key)  { error += key + ': '; }
    if(message)         { error += message; }

    throw new Error(error);
  },

  sortedArrayDiffs : function sortedArrayDiffs(arrA, arrB) {
    var i,
        j = 0,
        retA = [],
        retB = [];

    for (i = 0; i < arrA.length; i++) {
      if (arrB[j] < arrA[i]) {
        for (; arrB[j] < arrA[i] && j < arrB.length; j++) {
        }
      }

      if (arrA[i] === arrB[j]) {
        j++;
        continue;
      }
    }
    return arrA.filter(function(e) {return arrB.indexOf(e) < 0;});
  }
};

module.exports = Quadtree2Helper;
