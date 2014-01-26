(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
Quadtree2 = require('./src/quadtree2');

},{"./src/quadtree2":3}],2:[function(require,module,exports){
;(function inject(clean, precision, undef) {

  function Vec2(x, y) {
    if (!(this instanceof Vec2)) {
      return new Vec2(x, y);
    }

    if('object' === typeof x && x) {
      this.y = x.y || 0;
      this.x = x.x || 0;
      return;
    }

    this.x = Vec2.clean(x || 0);
    this.y = Vec2.clean(y || 0);
  }

  Vec2.prototype = {
    change : function(fn) {
      if (fn) {
        if (this.observers) {
          this.observers.push(fn);
        } else {
          this.observers = [fn];
        }
      } else if (this.observers) {
        for (var i=this.observers.length-1; i>=0; i--) {
          this.observers[i](this);
        }
      }

      return this;
    },

    ignore : function(fn) {
      if (this.observers) {
        var o = this.observers, l = o.length;
        while(l--) {
          o[l] === fn && o.splice(l, 1);
        }
      }
      return this;
    },

    // set x and y
    set: function(x, y, silent) {
      if('number' != typeof x) {
        silent = y;
        y = x.y;
        x = x.x;
      }
      if(this.x === x && this.y === y)
        return this;

      this.x = Vec2.clean(x);
      this.y = Vec2.clean(y);

      if(silent !== false)
        return this.change();
    },

    // reset x and y to zero
    zero : function() {
      return this.set(0, 0);
    },

    // return a new vector with the same component values
    // as this one
    clone : function() {
      return new Vec2(this.x, this.y);
    },

    // negate the values of this vector
    negate : function(returnNew) {
      if (returnNew) {
        return new Vec2(-this.x, -this.y);
      } else {
        return this.set(-this.x, -this.y);
      }
    },

    // Add the incoming `vec2` vector to this vector
    add : function(vec2, returnNew) {
      if (!returnNew) {
        this.x += vec2.x; this.y += vec2.y;
        return this.change();
      } else {
        // Return a new vector if `returnNew` is truthy
        return new Vec2(
          this.x + vec2.x,
          this.y + vec2.y
        );
      }
    },

    // Subtract the incoming `vec2` from this vector
    subtract : function(vec2, returnNew) {
      if (!returnNew) {
        this.x -= vec2.x; this.y -= vec2.y;
        return this.change();
      } else {
        // Return a new vector if `returnNew` is truthy
        return new Vec2(
          this.x - vec2.x,
          this.y - vec2.y
        );
      }
    },

    // Multiply this vector by the incoming `vec2`
    multiply : function(vec2, returnNew) {
      var x,y;
      if ('number' !== typeof vec2) { //.x !== undef) {
        x = vec2.x;
        y = vec2.y;

      // Handle incoming scalars
      } else {
        x = y = vec2;
      }

      if (!returnNew) {
        return this.set(this.x * x, this.y * y);
      } else {
        return new Vec2(
          this.x * x,
          this.y * y
        );
      }
    },

    // Rotate this vector. Accepts a `Rotation` or angle in radians.
    //
    // Passing a truthy `inverse` will cause the rotation to
    // be reversed.
    //
    // If `returnNew` is truthy, a new
    // `Vec2` will be created with the values resulting from
    // the rotation. Otherwise the rotation will be applied
    // to this vector directly, and this vector will be returned.
    rotate : function(r, inverse, returnNew) {
      var
      x = this.x,
      y = this.y,
      cos = Math.cos(r),
      sin = Math.sin(r),
      rx, ry;

      inverse = (inverse) ? -1 : 1;

      rx = cos * x - (inverse * sin) * y;
      ry = (inverse * sin) * x + cos * y;

      if (returnNew) {
        return new Vec2(rx, ry);
      } else {
        return this.set(rx, ry);
      }
    },

    // Calculate the length of this vector
    length : function() {
      var x = this.x, y = this.y;
      return Math.sqrt(x * x + y * y);
    },

    // Get the length squared. For performance, use this instead of `Vec2#length` (if possible).
    lengthSquared : function() {
      var x = this.x, y = this.y;
      return x*x+y*y;
    },

    // Return the distance betwen this `Vec2` and the incoming vec2 vector
    // and return a scalar
    distance : function(vec2) {
      var x = this.x - vec2.x;
      var y = this.y - vec2.y;
      return Math.sqrt(x*x + y*y);
    },

    // Convert this vector into a unit vector.
    // Returns the length.
    normalize : function(returnNew) {
      var length = this.length();

      // Collect a ratio to shrink the x and y coords
      var invertedLength = (length < Number.MIN_VALUE) ? 0 : 1/length;

      if (!returnNew) {
        // Convert the coords to be greater than zero
        // but smaller than or equal to 1.0
        return this.set(this.x * invertedLength, this.y * invertedLength);
      } else {
        return new Vec2(this.x * invertedLength, this.y * invertedLength);
      }
    },

    // Determine if another `Vec2`'s components match this one's
    // also accepts 2 scalars
    equal : function(v, w) {
      if (w === undef) {
        w = v.y;
        v = v.x;
      }

      return (Vec2.clean(v) === this.x && Vec2.clean(w) === this.y);
    },

    // Return a new `Vec2` that contains the absolute value of
    // each of this vector's parts
    abs : function(returnNew) {
      var x = Math.abs(this.x), y = Math.abs(this.y);

      if (returnNew) {
        return new Vec2(x, y);
      } else {
        return this.set(x, y);
      }
    },

    // Return a new `Vec2` consisting of the smallest values
    // from this vector and the incoming
    //
    // When returnNew is truthy, a new `Vec2` will be returned
    // otherwise the minimum values in either this or `v` will
    // be applied to this vector.
    min : function(v, returnNew) {
      var
      tx = this.x,
      ty = this.y,
      vx = v.x,
      vy = v.y,
      x = tx < vx ? tx : vx,
      y = ty < vy ? ty : vy;

      if (returnNew) {
        return new Vec2(x, y);
      } else {
        return this.set(x, y);
      }
    },

    // Return a new `Vec2` consisting of the largest values
    // from this vector and the incoming
    //
    // When returnNew is truthy, a new `Vec2` will be returned
    // otherwise the minimum values in either this or `v` will
    // be applied to this vector.
    max : function(v, returnNew) {
      var
      tx = this.x,
      ty = this.y,
      vx = v.x,
      vy = v.y,
      x = tx > vx ? tx : vx,
      y = ty > vy ? ty : vy;

      if (returnNew) {
        return new Vec2(x, y);
      } else {
        return this.set(x, y);
      }
    },

    // Clamp values into a range.
    // If this vector's values are lower than the `low`'s
    // values, then raise them.  If they are higher than
    // `high`'s then lower them.
    //
    // Passing returnNew as true will cause a new Vec2 to be
    // returned.  Otherwise, this vector's values will be clamped
    clamp : function(low, high, returnNew) {
      var ret = this.min(high, true).max(low);
      if (returnNew) {
        return ret;
      } else {
        return this.set(ret.x, ret.y);
      }
    },

    // Perform linear interpolation between two vectors
    // amount is a decimal between 0 and 1
    lerp : function(vec, amount) {
      return this.add(vec.subtract(this, true).multiply(amount), true);
    },

    // Get the skew vector such that dot(skew_vec, other) == cross(vec, other)
    skew : function() {
      // Returns a new vector.
      return new Vec2(-this.y, this.x);
    },

    // calculate the dot product between
    // this vector and the incoming
    dot : function(b) {
      return Vec2.clean(this.x * b.x + b.y * this.y);
    },

    // calculate the perpendicular dot product between
    // this vector and the incoming
    perpDot : function(b) {
      return Vec2.clean(this.x * b.y - this.y * b.x);
    },

    // Determine the angle between two vec2s
    angleTo : function(vec) {
      return Math.atan2(this.perpDot(vec), this.dot(vec));
    },

    // Divide this vector's components by a scalar
    divide : function(vec2, returnNew) {
      var x,y;
      if ('number' !== typeof vec2) {
        x = vec2.x;
        y = vec2.y;

      // Handle incoming scalars
      } else {
        x = y = vec2;
      }

      if (x === 0 || y === 0) {
        throw new Error('division by zero')
      }

      if (isNaN(x) || isNaN(y)) {
        throw new Error('NaN detected');
      }

      if (returnNew) {
        return new Vec2(this.x / x, this.y / y);
      }

      return this.set(this.x / x, this.y / y);
    },

    isPointOnLine : function(start, end) {
      return (start.y - this.y) * (start.x - end.x) ===
             (start.y - end.y) * (start.x - this.x);
    },

    toArray: function() {
      return [this.x, this.y];
    },

    fromArray: function(array) {
      return this.set(array[0], array[1]);
    },
    toJSON: function () {
      return {x: this.x, y: this.y};
    },
    toString: function() {
      return '(' + this.x + ', ' + this.y + ')';
    }
  };

  Vec2.fromArray = function(array) {
    return new Vec2(array[0], array[1]);
  };

  // Floating point stability
  Vec2.precision = precision || 8;
  var p = Math.pow(10, Vec2.precision);

  Vec2.clean = clean || function(val) {
    if (isNaN(val)) {
      throw new Error('NaN detected');
    }

    if (!isFinite(val)) {
      throw new Error('Infinity detected');
    }

    if(Math.round(val) === val) {
      return val;
    }

    return Math.round(val * p)/p;
  };

  Vec2.inject = inject;

  if(!clean) {
    Vec2.fast = inject(function (k) { return k; });

    // Expose, but also allow creating a fresh Vec2 subclass.
    if (typeof module !== 'undefined' && typeof module.exports == 'object') {
      module.exports = Vec2;
    } else {
      window.Vec2 = window.Vec2 || Vec2;
    }
  }
  return Vec2;
})();



},{}],3:[function(require,module,exports){
// jshint maxlen: 120

var Vec2                = require('vec2'),
    Quadtree2Helper     = require('./quadtree2helper'),
    Quadtree2Validator  = require('./quadtree2validator'),
    Quadtree2Quadrant   = require('./quadtree2quadrant'),
    Quadtree2;

Quadtree2 = function Quadtree2(size, limit, idKey) {
  var id,

      // Container for private data.
      data = {
        root_      : new Quadtree2Quadrant(new Vec2(0,0)),
        objects_   : {},
        ids_       : 0,
        autoId_    : true,
        inited_    : false,
        limit_     : undefined,
        size_      : undefined,
        shapes_    : {},
        quadrants_ : {}
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
            Quadtree2Helper.thrower('NIY', 'Collision handling does not work for rects YET!');
          }
          return objA[k.r] + objB[k.r] > objA[k.p].distance(objB[k.p]);
        },

        getSmallestQuadrants : function getSmallestQuadrants(obj, quadrant, smallestQuadrants, checked) {
          var i,
              intersectingChildQuadrants;

          if (!quadrant)          { quadrant = data.root_; }
          if (!smallestQuadrants) { smallestQuadrants = {}; }

          intersectingChildQuadrants = quadrant.intersectingChildren(obj[k.p], obj[k.r]);

          // Also true if there were no children
          if (intersectingChildQuadrants.length === quadrant.getChildCount()) {
            if (checked || quadrant.intersects(obj[k.p], obj[k.r])) {
              smallestQuadrants[quadrant.id_] = quadrant;
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

        updateObjectQuadrants : function updateObjectQuadrants(obj) {
          var oldQuadrants = data.quadrants_[obj[k.id]],
              newQuadrants = fns.getSmallestQuadrants(obj),
              newIds       = Object.keys(newQuadratns).sort(),
              oldIds       = Object.keys(oldQuadratns).sort(),
              removeIds,
              addIds;

          if(newIds === oldIds) { return; }

          removeIds = arrayDiff();
        },

        addObjectToQuadrant : function addObjectToQuadrant(obj, quadrant) {
          var id = obj[k.id];
          if(data.quadrants_[id] === undefined) data.quadrants_[id] = {};
          data.quadrants_[id][quadrant.id_] = quadrant;
          quadrant.addObject(id, obj);
        },

        // Supposes that the quadrant is the smallest one without children
        // or with children whom all intersect the obj.
        addObjectToSubtree : function addObjectToSubtree(obj, quadrant) {
          var id,
              addBySubtree,
              smallestQs,
              objs;

          if (!quadrant) { quadrant = data.root_; }

          if (quadrant.hasChildren()) {
            // Get smallest quadrants which intersect.
            smallestQs = fns.getSmallestQuadrants(obj, quadrant);

            for (id in smallestQs) {
              if (smallestQs[id] === quadrant) {
                // If its myself because all my children would intersect with
                // it, then no point storing the obj in children => addObject.
                fns.addObjectToQuadrant(obj, quadrant);
                return;
              }
              // Propagate further to children
              fns.addObjectToSubtree(obj, smallestQs[id]);
            }

          } else if (quadrant.getObjectCount() < data.limit_) {
            // Has no children but still got place, so store it.
            fns.addObjectToQuadrant(obj, quadrant);

          } else {
            // Got no place so lets make children.
            quadrant.makeChildren();

            // Remove all the stored objects.
            objs = quadrant.removeObjects();
            objs[obj[k.id]] = obj;

            // Recalculate all objects which were stored before.
            for (id in objs) { fns.addObjectToSubtree(objs[id], quadrant); }
          }
        },

        getObjectCollisionsInQuadrant : function getObjectCollisionsInQuadrant(quadrant) {
            var idA,
                idB,
                objects = quadrant.getObjects(true),
                collidedObjectPairs = [],
                checkedIds = [];

            for (idA in objects) {
              checkedIds.push(idA);

              for (idB in objects) {
                if (checkedIds.indexOf(idB) !== -1) { continue; }

                if (fns.hasCollision(objects[idA], objects[idB])) {
                  collidedObjectPairs.push([objects[idA], objects[idB]]);
                }
              }
            }

            return collidedObjectPairs;
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

          fns.addObjectToSubtree(obj);

          data.objects_[obj[k.id]] = obj;
        },

        getCollidedObjects : function getCollidedObjects() {
          var result = [];

          fns.checkInit(true);

          return fns.getObjectCollisionsInQuadrant(data.root_);
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

module.exports = Quadtree2;

},{"./quadtree2helper":4,"./quadtree2quadrant":5,"./quadtree2validator":6,"vec2":2}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
var Quadtree2Quadrant = function Quadtree2Quadrant(leftTop, size, id) {
  this.leftTop_     = leftTop.clone();
  this.children_    = [];
  this.objects_     = {};
  this.objectCount_ = 0;
  this.id_          = id || 0;

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
      new Quadtree2Quadrant(this.leftTop_,  this.rad_, ++this.id_),
      new Quadtree2Quadrant(this.topMid_,   this.rad_, ++this.id_),
      new Quadtree2Quadrant(this.leftMid_,  this.rad_, ++this.id_),
      new Quadtree2Quadrant(this.center_,   this.rad_, ++this.id_)
    );

    return true;
  },

  addObject : function addObject(id, obj) {
    this.objectCount_++;
    this.objects_[id] = obj;
  },

  removeObjects : function removeObjects() {
    var result = this.objects_;
    this.objects_ = {};
    this.objectCount_ = 0;
    return result;
  },

  removeObject : function removeObject(id) {
    var result = this.objects_[id];
    this.objectCount_--;
    delete(this.objects_[id]);
    return result;
  },

  getObjectCount : function getObjectCount(recursive) {
    var result = this.objectCount_;

    if (recursive) {
      this.children_.forEach(function(child) {
        result += child.getObjectCount(recursive);
      });
    }
    
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

  getChildren : function getChildren(recursive, result) {
    if (!result) result = [];

    result.push.apply(result, this.children_);

    if (recursive) {
      this.children_.forEach(function(child) {
        child.getChildren(recursive, result);
      });
    }

    return result;
  },

  getObjects : function getObjects(recursive, result) {
    var id;

    if (!result) result = {};

    for (id in this.objects_) {
      result[id] = this.objects_[id];
    }

    if (recursive) {
      this.children_.forEach(function(child) {
        child.getObjects(recursive, result);
      });
    }

    return result;
  }
};

module.exports = Quadtree2Quadrant;

},{}],6:[function(require,module,exports){
var Vec2                = require('vec2'),
    Quadtree2Helper     = require('./quadtree2helper'),
    Quadtree2Validator  = function Quadtree2Validator() {};

Quadtree2Validator.prototype = {
  isNumber : function isNumber(param, key) {
    if ('number' !== typeof param) {
      Quadtree2Helper.thrower('NaN', 'Not a Number', key);
    }
  },

  isString : function isString(param, key) {
    if (!(typeof param === 'string' || param instanceof String)) {
      Quadtree2Helper.thrower('NaS', 'Not a String', key);
    }
  },

  isVec2 : function isVec2(param, key) {
    var throwIt = false;

    throwIt = 'object' !== typeof param || param.x === undefined || param.y === undefined;

    if(throwIt) {
      Quadtree2Helper.thrower('NaV', 'Not a Vec2', key);
    }
  },

  isDefined : function isDefined(param, key) {
    if (param === undefined) {
      Quadtree2Helper.thrower('ND', 'Not defined', key);
    }
  },

  isObject : function isObject(param, key) {
    if ('object' !== typeof param) {
      Quadtree2Helper.thrower('NaO', 'Not an Object', key);
    }
  },

  hasKey : function hasKey(obj, k, key) {
    if ( Object.keys(obj).indexOf(k) === -1 ) {
      Quadtree2Helper.thrower('OhnK', 'Object has no key', key + k);
    }
  },

  hasNoKey : function hasNoKey(obj, k, key) {
    if ( Object.keys(obj).indexOf(k) !== -1 ) {
      Quadtree2Helper.thrower('OhK', 'Object has key', key + k);
    }
  },

  fnFalse : function fn(cb) {
    if(cb()) {
      Quadtree2Helper.thrower('FarT', 'function already returns true', Quadtree2Helper.fnName(cb));
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

module.exports = Quadtree2Validator;

},{"./quadtree2helper":4,"vec2":2}]},{},[1])