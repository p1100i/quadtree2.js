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
    Quadtree2Quadrant,
    Quadtree2Validator;

Quadtree2Quadrant = function Quadtree2Quadrant(leftTop, size) {
  this.leftTop_   = leftTop.clone();
  this.children_  = [];
  this.objects_   = [];

  this.setSize(size);
};

Quadtree2Quadrant.prototype = {
  setSize : function setSize(size) {
    if(!size) { return; }
    this.size_        = size;
    this.rad_         = size.multiply(0.5, true);
    this.center_      = this.leftTop_.add(this.rad_, true);

    this.leftBot_     = this.leftTop_.clone();
    this.leftBot_.y  += size.y;
    this.rightTop_    = this.leftTop_.clone();
    this.rightTop_.x += size.x;
    this.rightBot_    = this.leftTop_.add(size, true);

    this.leftMid_     = this.center_.clone();
    this.leftMid_.x   = this.leftTop_.x;
    this.topMid_      = this.center_.clone();
    this.topMid_.y    = this.leftTop_.y;
  },

  makeChildren : function makeChildren() {
    if (this.children_.length > 0) { return false; }

    this.children_.push(
      new Quadtree2Quadrant(this.leftTop_,  this.rad_),
      new Quadtree2Quadrant(this.topMid_,   this.rad_),
      new Quadtree2Quadrant(this.leftMid_,  this.rad_),
      new Quadtree2Quadrant(this.center_,   this.rad_)
    );

    return true;
  },

  cleanObjects : function cleanObjects() {
    this.objects_ = this.objects_.filter(function(o){ return o === undefined; });
  },

  addObject : function addObject(obj) {
    this.objects_.push(obj);
  },

  removeObjects : function removeObjects() {
    var result = this.objects_;
    this.objects_ = [];
    return result;
  },

  intersectingChildren : function intersectingChildren(pos, rad) {
    return this.children_.filter(function(child) {
      return child.intersects(pos, rad);
    });
  },

  intersects : function intersects(pos, rad) {
    var dist = pos.subtract(this.center_, true).abs(),
        cornerDist;

    if (dist.x > this.rad_.x + rad) { return false; }
    if (dist.y > this.rad_.y + rad) { return false; }

    if (dist.x <= this.rad_.x) { return true; }
    if (dist.y <= this.rad_.y) { return true; }

    cornerDistSq = Math.pow(dist.x, 2) + Math.pow(dist.y, 2);
    return cornerDistSq <= Math.pow(rad, 2);
  },

  hasChildren : function hasChildren() {
    return this.getChildCount() !== 0;
  },

  getChildCount : function getChildCount(recursive) {
    var count = this.children_.length;

    if (recursive) {
      this.children_.forEach(function(child) {
        count += child.getChildCount(recursive);
      });
    }

    return count;
  },

  getObjectCount : function getObjectCount(recursive) {
    var count = this.objects_.length;

    if (recursive) {
      this.children_.forEach(function(child) {
        count += child.getObjectCount(recursive);
      });
    }

    return count;
  },

  getChildren : function getChildren(recursive, result) {
    if (!result) result = [];

    result.push.apply(result, this.children_);

    if (recursive) {
      this.children_.forEach(function(child) {
        child.getChildren(recursive, result);
      });
    }

    return result;
  }
};

Quadtree2 = function Quadtree2(size, limit, idKey) {
  var id,

      // Container for private data.
      data = {
        root_     : new Quadtree2Quadrant(new Vec2(0,0)),
        objects_  : {},
        ids_      : 0,
        autoId_   : true,
        inited_   : false,
        limit_    : undefined,
        size_     : undefined,
        shapes_   : {}
      },

      validator = new Quadtree2Validator(),

      // Inserted object keys.
      k = {
        p  : 'pos_',
        r  : 'rad_',
        R  : 'rot_',
        id : 'id_'
      },

      // Property definitions.
      constraints = {
        data : {
          necessary : {
            size_  : validator.isVec2,
            limit_ : validator.isNumber
          }
        },

        k : {
          necessary : {
            p : validator.isVec2
          },

          c : {
            necessary : {
              r : validator.isNumber
            },
          },

          r : {
            necessary : {
              R : validator.isNumber
            },
          }
        }
      },

      // Private function definitions.
      fns = {
        nextId : function nextId() {
          return ++data.ids_;
        },

        hasCollision : function hasCollision(objA, objB) {
          if (fns.getObjShape(objA) !== 'c' || fns.getObjShape(objB) !== 'c') {
            thrower('NIY', 'Collision handling does not work for rects YET!');
          }
          return objA[k.r] + objB[k.r] > objA[k.p].distance(objB[k.p]);
        },

        getSmallestQuadrants : function getSmallestQuadrants(obj, quadrant, smallestQuadrants, checked) {
          var i,
              intersectingChildQuadrants;

          if (!quadrant)          { quadrant = data.root_; }
          if (!smallestQuadrants) { smallestQuadrants = []; }

          intersectingChildQuadrants = quadrant.intersectingChildren(obj[k.p], obj[k.r]);

          // Also true if there were no children
          if (intersectingChildQuadrants.length === quadrant.getChildCount()) {
            if (checked || quadrant.intersects(obj[k.p], obj[k.r])) {
              smallestQuadrants.push(quadrant);
            }
          } else {
            for (i in intersectingChildQuadrants) {
              fns.getSmallestQuadrants(
                obj,
                intersectingChildQuadrants[i],
                smallestQuadrants,
                true
              );
            }
          }

          return smallestQuadrants;
        },

        // Supposes that the quadrant is the smallest one without children
        // or with children whom all intersect the obj.
        addObjToQuadrant : function addObjToQuadrant(obj, quadrant) {
          var addByQuadrant,
              addByObj,
              smallestQs,
              objs;

          if (!quadrant) { quadrant = data.root_; }

          if (quadrant.hasChildren()) {
            // Get smallest quadrants which intersect.
            smallestQs = fns.getSmallestQuadrants(obj, quadrant);

            if (smallestQs.length === 1 && smallestQs[0] === quadrant) {
              // If its myself because all my children would intersect with
              // it, then no point storing the obj in children => addObject.
              quadrant.addObject(obj);

            } else {
              // Propagate further to children
              addByQuadrant = function(q) { fns.addObjToQuadrant(obj, q); };
              smallestQs.forEach(addByQuadrant);
            }

          } else if (quadrant.getObjectCount() < data.limit_) {
            // Has no children but still got place, so store it.
            quadrant.addObject(obj);

          } else {
            // Got no place so lets make children.
            quadrant.makeChildren();

            // Remove all the stored objects.
            objs = quadrant.removeObjects();
            objs.push(obj);

            // Recalculate all objects which were stored before.
            addByObj = function(o) { fns.addObjToQuadrant(o, quadrant); };
            objs.forEach(addByObj);
          }

        },

        getCollisionsInQuadrant : function getCollisionsInQuadrant(quadrant, objects) {
          var i,
              j,
              clonedObjects,
              collidedObjects = [];

          if (!quadrant)  { quadrant = data.root_; }
          if (!objects)   { objects = []; }

          objects.push.apply(objects, quadrant.objects_);

          if (quadrant.children_.length === 0) {
            for (i = 0; i < objects.length; i++) {
              for (j = i + 1; j < objects.length; j++) {
                if (fns.hasCollision(objects[i], objects[j])) {
                  collidedObjects.push([objects[i], objects[j]]);
                }
              }
            }
          }

          for (i in quadrant.children_) {
            clonedObjects = objects.slice(0);
            collidedObjects.concat(fns.getCollisionInQuadrant(quadrant.children_[i], clonedObjects));
          }

          return collidedObjects;
        },

        init : function init() {
          validator.byCallbackObject(data, constraints.data.necessary);

          data.root_.setSize(data.size_.clone());

          data.inited_ = true;
        },

        checkInit : function checkInit(init) {
          if (init && !data.inited_) { fns.init(); }
          return data.inited_;
        },

        checkObjectKeys : function checkObjectKeys(obj) {
          validator.isDefined(obj[k.id], k.id);
          validator.hasNoKey(data.objects_, obj[k.id], k.id);

          validator.byCallbackObject(obj, constraints.k.necessary, k);

          validator.byCallbackObject(
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

          validator.isDefined(obj[key], key);

          data.shapes_[obj[k.id]] = rect ? 'r' : 'c';
        },

        getObjShape : function getObjShape(obj) {
          return data.shapes_[obj[k.id]];
        }
      },

      // Debug functions
      debugFns = {
        getQuadrants: function getQuadrants() {
          return data.root_.getChildren(true, [data.root_]);
        },

        getLeafQuadrants : function getLeafQuadrants() {
          return debugFns.getQuadrants().filter(function(q){
            return !q.hasChildren();
          });
        }
      },

      // Public function definitions
      publicFns = {
        getLimit : function getLimit() {
          return data.limit_;
        },

        setLimit : function setLimit(limit) {
          if (limit === undefined) { return; }

          validator.isNumber(limit, 'limit_');

          data.limit_ = limit;
        },

        setObjectKey : function setObjectKey(key, val) {
          validator.fnFalse(fns.checkInit);
          if (val === undefined) { return; }

          validator.hasKey(k, key, key);
          validator.isString(val, key);

          if (key === 'id') { data.autoId_ = false; }
          k[key] = val;
        },

        getSize : function getSize() {
          return data.size_.clone();
        },

        setSize : function setSize(size) {
          if (size === undefined) { return; }

          validator.isVec2(size, 'size_');

          data.size_ = size.clone();
        },

        addObjects : function addObject(objs) {
          objs.forEach(function(obj) {
            publicFns.addObject(obj);
          });
        },

        addObject : function addObject(obj) {
          var i,
              smallestQs;

          validator.isDefined(obj, 'obj');
          validator.isObject(obj, 'obj');

          fns.checkInit(true);
          fns.setObjId(obj);
          fns.setObjShape(obj);
          fns.checkObjectKeys(obj);

          fns.addObjToQuadrant(obj);

          data.objects_[obj[k.id]] = obj;
        },

        getCollidedObjects : function getCollidedObjects() {
          var result = [];

          fns.checkInit(true);

          return fns.getCollisionsInQuadrant();
        },

        getCount : function getCount() {
          return Object.keys(data.objects_).length;
        },

        getQuadrantCount : function getQuadrantCount() {
          return 1 + data.root_.getChildCount(true);
        },

        getQuadrantObjectCount : function getQuadrantObjectCount() {
          return data.root_.getObjectCount(true);
        },

        debug : function debug(val) {
          var id;

          if(val !== undefined){
            data.debug_ = val;

            // For testing purpose allow exposing private functions.
            fns.checkInit(true);
            for (id in debugFns)  { this[id] = debugFns[id]; }
            for (id in fns)       { this[id] = fns[id]; }
          }

          return data.debug_;
        }
      };

  // Generate public functions.
  for (id in publicFns) { this[id] = publicFns[id]; }

  this.setSize(size);
  this.setLimit(limit);
  this.setObjectKey('id', idKey);
};

Quadtree2Validator = function Quadtree2Validator() {};

Quadtree2Validator.prototype = {
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

injector(function () {
  window.Quadtree2 = Quadtree2;
},
function() {
  module.exports = Quadtree2;
});
