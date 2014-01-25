// jshint maxlen: 120

// Helper function for using both in NodeJS and browser.
var injector = function injector(cbBrowser, cbNodeJS){
      if (typeof module !== 'undefined' && typeof module.exports == 'object') {
        return cbNodeJS();
      } else {
        return cbBrowser();
      }
    },

    // Requiring the Vec2 class
    Vec2 =  injector(function() {
              if (!window.Vec2) { throw new Error('Vec2 is a requirement'); }
              return window.Vec2;
            },
            function(){
              return require('vec2');
            }),

    // Forward decleration of Quadtree2* classes

    fnName = function fnName(fn) {
      var ret = fn.toString();
      ret = ret.substr('function '.length);
      ret = ret.substr(0, ret.indexOf('('));
      return ret;
    },

    // A verbose exception generator helper.
    thrower = function thrower(code, message, key) {
      var error = code;

      if(key)             { error += '_' + key; }
      if(message)         { error += ' - '; }
      if(message && key)  { error += key + ': '; }
      if(message)         { error += message; }

      throw new Error(error);
    },

    Quadtree2,
    Quadtree2Node,
    Quadtree2Helper;

Quadtree2Helper = function Quadtree2Helper() {};

Quadtree2Helper.prototype = {
  isNumber : function isNumber(param, key) {
    if ('number' !== typeof param) {
      thrower('NaN', 'Not a Number', key);
    }
  },

  isString : function isString(param, key) {
    if (!(typeof param === 'string' || param instanceof String)) {
      thrower('NaS', 'Not a String', key);
    }
  },

  isVec2 : function isVec2(param, key) {
    var throwIt = false;

    throwIt = 'object' !== typeof param || !(param instanceof Vec2);
    throwIt = throwIt || param.x === undefined || param.y === undefined;

    if(throwIt) {
      thrower('NaV', 'Not a Vec2', key);
    }
  },

  isDefined : function isDefined(param, key) {
    if (param === undefined) {
      thrower('ND', 'Not defined', key);
    }
  },

  isObject : function isObject(param, key) {
    if ('object' !== typeof param) {
      thrower('NaO', 'Not an Object', key);
    }
  },

  hasKey : function hasKey(obj, k, key) {
    if ( Object.keys(obj).indexOf(k) === -1 ) {
      thrower('OhnK', 'Object has no key', key + k);
    }
  },

  hasNoKey : function hasNoKey(obj, k, key) {
    if ( Object.keys(obj).indexOf(k) !== -1 ) {
      thrower('OhK', 'Object has key', key + k);
    }
  },

  fnFalse : function fn(cb) {
    if(cb()) {
      thrower('FarT', 'function already returns true', fnName(cb));
    }
  },

  byCallbackObject : function byCallbackObject(obj, cbObj, keyTable) {
    var key;
    for (key in cbObj) {
      if (keyTable !== undefined) {
        cbObj[key](obj[keyTable[key]], keyTable[key]);
      } else {
        cbObj[key](obj[key], key);
      }
    }
  }
};

Quadtree2Node = function Quadtree2Node() {
  this.children = [];
};

Quadtree2 = function Quadtree2(size, limit, idKey, exposePrivateFns) {
  var id,

      // Container for private data.
      data = {
        root_     : new Quadtree2Node(),
        objects_  : {},
        count_    : 0,
        ids_      : 0,
        autoId_   : true,
        inited_   : false,
        limit_    : undefined,
        size_     : undefined,
        shapes_   : {}
      },

      helper    = new Quadtree2Helper(),

      // Inserted object keys.
      k = {
        p  : 'pos_',
        r  : 'rad_',
        R  : 'rot_',
        id : 'id_'
      },


      // Validation definitions

      // Property definitions.
      constraints = {
        data : {
          necessary : {
            size_  : helper.isVec2,
            limit_ : helper.isNumber
          }
        },

        k : {
          necessary : {
            p : helper.isVec2
          },

          c : {
            necessary : {
              r : helper.isNumber
            },
          },

          r : {
            necessary : {
              R : helper.isNumber
            },
          }
        }
      },

      // Private function definitions.
      fns = {
        nextId : function nextId() {
          return ++data.ids_;
        },

        getSmallestNode : function getSmallestNode(obj, node) {
          var id;

          if (!node) { node = this.root_; }

          if (node.children.length === 0) { return node; }

          for (id in node.children) {
            // if (node covers obj)
            // return getSmallestNode(obj, node.children[id]);
          }

          return node;
        },

        init : function init() {
          helper.byCallbackObject(data, constraints.data.necessary);

          data.inited_ = true;
        },

        checkInit : function checkInit(init) {
          if (init && !data.inited_) { fns.init(); }
          return data.inited_;
        },

        checkObjectKeys : function checkObjectKeys(obj) {
          helper.isDefined(obj[k.id], k.id);
          helper.hasNoKey(data.objects_, obj[k.id], k.id);

          helper.byCallbackObject(obj, constraints.k.necessary, k);

          helper.byCallbackObject(
            obj,
            constraints.k[fns.getObjShape(obj)].necessary,
            k
          );
        },

        setObjId : function setObjId(obj) {
          if (data.autoId_) {
            obj[k.id] = fns.nextId();
          }
        },

        setObjShape : function setObjShape(obj) {
          var rect = obj[k.r] === undefined,
              key  = rect ? k.R : k.r;

          helper.isDefined(obj[key], key);

          data.shapes_[obj[k.id]] = rect ? 'r' : 'c';
        },

        getObjShape : function getObjShape(obj) {
          return data.shapes_[obj[k.id]];
        }
      },

      // Public function definitions
      publicFns = {
        getLimit : function getLimit() {
          return data.limit_;
        },

        setLimit : function setLimit(limit) {
          if (limit === undefined) { return; }

          helper.isNumber(limit, 'limit_');

          data.limit_ = limit;
        },

        getCount : function getCount() {
          return data.count_;
        },

        setObjectKey : function setObjectKey(key, val) {
          helper.fnFalse(fns.checkInit);
          if (val === undefined) { return; }

          helper.hasKey(k, key, key);
          helper.isString(val, key);

          if (key === 'id') data.autoId_ = false;
          k[key] = val;
        },

        getSize : function getSize() {
          return data.size_.clone();
        },

        setSize : function setSize(size) {
          if (size === undefined) { return; }

          helper.isVec2(size, 'size_');

          data.size_ = size.clone();
        },

        addObjects : function addObject(objs) {
          objs.forEach(function(obj) {
            publicFns.addObject(obj);
          });
        },

        addObject : function addObject(obj) {
          helper.isDefined(obj, 'obj');
          helper.isObject(obj, 'obj');

          fns.checkInit(true);
          fns.setObjId(obj);
          fns.setObjShape(obj);
          fns.checkObjectKeys(obj);

          //  1. find the smallest quadrant Q where the obj O can still fit
          //  2. if Q has more objects then limit
          //    2.1 if any object would fit into a subquadrant of Q then break it
          //      2.1.1 recalculate all objects in Q for the subquadrants
          //        2.1.1.1 if all of them comes into the same subquadrant then repeat
          //        2.1.1.2 for those who dont fit, they stay on Q
          //    2.2 if non of them fits there is no point breaking up
          //  3. insert O into Q objects
            
          data.objects_[obj[k.id]] = obj;
          data.count_++;
        },

        getCollidedObjects : function getCollidedObjects() {
          var result = [],
              id;

          fns.checkInit(true);

          for (id in data.objects_) {
            result.push(data.objects_[id]);
          }

          return result;
        }
      };


  // Generate public functions.
  for (id in publicFns) {
    this[id] = publicFns[id];
  }

  // For testing purpose allow exposing private functions.
  if (exposePrivateFns) {
    for (id in fns) {
      this[id] = fns[id];
    }
  }

  this.setSize(size);
  this.setLimit(limit);
  this.setObjectKey('id', idKey);
};

injector(function () {
  window.Quadtree2 = Quadtree2;
},
function() {
  module.exports = Quadtree2;
});
