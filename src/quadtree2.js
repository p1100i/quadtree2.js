var Vec2                = require('vec2'),
    Quadtree2Helper     = require('./quadtree2helper'),
    Quadtree2Validator  = require('./quadtree2validator'),
    Quadtree2Quadrant   = require('./quadtree2quadrant'),
    Quadtree2;

Quadtree2 = function Quadtree2(size, quadrantObjectsLimit, quadrantLevelLimit) {
  var id,

      // Container for private data.
      data = {
        objects_     : {},
        quadrants_   : {},
        ids_         : 1,
        quadrantIds_ : 1,
        autoId_      : true,
        inited_      : false,
        size_        : undefined,
        root_        : undefined,
        quadrantObjectsLimit_ : undefined,
        quadrantLevelLimit_   : undefined,
        quadrantSizeLimit_    : undefined
      },

      validator = new Quadtree2Validator(),

      // Inserted object keys.
      k = {
        p  : 'pos_',
        r  : 'rad_',
        id : 'id_'
      },

      // Property definitions.
      constraints = {
        data : {
          necessary : {
            size_                 : validator.isVec2,
            quadrantObjectsLimit_ : validator.isNumber,
            quadrantLevelLimit_   : validator.isNumber
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
          }
        }
      },

      // Private function definitions.
      fns = {
        nextId : function nextId() {
          return data.ids_++;
        },

        nextQuadrantId : function nextQuadrantId(sum) {
          var id = data.quadrantIds_;
          data.quadrantIds_ += sum || 4;

          return id;
        },

        hasCollision : function hasCollision(objA, objB) {
          return objA[k.r] + objB[k.r] > objA[k.p].distance(objB[k.p]);
        },

        getSmallestIntersectingQuadrants : function getSmallestIntersectingQuadrants(obj, quadrant, result) {
          var i,
              id,
              children;

          if (!quadrant)  { quadrant = data.root_; }
          if (!result)    { result = {}; }

          if (!quadrant.intersects(obj[k.p], obj[k.r])) { return; }

          children = quadrant.getChildren();

          if (children.length) {
            for (i = 0; i < children.length; i++) {
              getSmallestIntersectingQuadrants(obj, children[i], result);
            }
          } else {
            result[quadrant.id_] = quadrant;
          }

          return result;
        },

        removeQuadrantObjects : function removeQuadrantObjects(quadrant) {
          var id;
              result = quadrant.removeObjects();

          for (id in result) {
            delete data.quadrants_[id][quadrant.id_];
          }

          return result;
        },

        removeObjectFromQuadrants : function removeObjectFromQuadrants(obj, quadrants) {
          var id;

          if (quadrants === undefined) { quadrants = data.quadrants_[obj[k.id]]; }

          for (id in quadrants) { fns.removeObjectFromQuadrant(obj, quadrants[id]); }
        },

        removeObjectFromQuadrant : function removeObjectFromQuadrant(obj, quadrant) {
          quadrant.removeObject(obj[k.id]);

          delete data.quadrants_[obj[k.id]][quadrant.id_];

          if (quadrant.hasChildren() || !quadrant.parent_) { return; }

          fns.refactorSubtree(quadrant.parent_);
        },

        refactorSubtree : function refactorSubtree(quadrant) {
          var i,
              id,
              count,
              child,
              obj;

          if (quadrant.refactoring_) { return; }

          // Lets check for children.
          for (i = 0; i < quadrant.children_.length; i++) {
            child = quadrant.children_[i];

            if (child.hasChildren()) {
              return;
            }
          }

          count = quadrant.getObjectCount(true, true);

          if (count > data.quadrantObjectsLimit_) { return; }

          quadrant.refactoring_ = true;

          for (i = 0; i < quadrant.children_.length; i++) {
            child = quadrant.children_[i];

            for (id in child.objects_) {
              obj = child.objects_[id];
              fns.removeObjectFromQuadrant(obj, child);
              fns.addObjectToQuadrant(obj, quadrant);
            }
          }

          quadrant.looseChildren();

          quadrant.refactoring_ = false;

          if (!quadrant.parent_) { return; }

          fns.refactorSubtree(quadrant.parent_);
        },

        updateObjectQuadrants : function updateObjectQuadrants(obj) {
          var oldQuadrants  = data.quadrants_[obj[k.id]],
              newQuadrants  = fns.getSmallestIntersectingQuadrants(obj),
              oldIds        = Object.keys(oldQuadrants),
              newIds        = Object.keys(newQuadrants),
              diffIds       = Quadtree2Helper.arrayDiffs(oldIds, newIds),
              removeIds     = diffIds[0],
              addIds        = diffIds[1],
              i;

          for (i = 0; i < addIds.length; i++) {
            fns.populateSubtree(obj, newQuadrants[addIds[i]]);
          }

          for (i = 0; i < removeIds.length; i++) {
            if (!oldQuadrants[removeIds[i]]) { continue; }
            fns.removeObjectFromQuadrant(obj, oldQuadrants[removeIds[i]]);
          }
        },

        addObjectToQuadrant : function addObjectToQuadrant(obj, quadrant) {
          var id = obj[k.id];
          if (data.quadrants_[id] === undefined) data.quadrants_[id] = {};
          data.quadrants_[id][quadrant.id_] = quadrant;
          quadrant.addObject(id, obj);
        },

        populateSubtree : function populateSubtree(obj, quadrant) {
          var id,
              addBySubtree,
              smallestQs,
              intersectingChildren,
              objs;

          if (!quadrant) { quadrant = data.root_; }

          if (quadrant.hasChildren()) {
            // Get smallest quadrants which intersect.
            smallestQs = fns.getSmallestIntersectingQuadrants(obj, quadrant);

            for (id in smallestQs) {
              if (smallestQs[id] === quadrant) {
                // If its myself because all my children would intersect with
                // it, then no point storing the obj in children => addObject.
                fns.addObjectToQuadrant(obj, quadrant);
                return;
              }
              // Propagate further to children
              fns.populateSubtree(obj, smallestQs[id]);
            }

          } else if (quadrant.getObjectCount() < data.quadrantObjectsLimit_ || quadrant.size_.x < data.quadrantSizeLimit_.x ) {
            // Has no children but still got place, so store it.
            fns.addObjectToQuadrant(obj, quadrant);

          } else {
            // Got no place so lets make children.
            quadrant.makeChildren(fns.nextQuadrantId());

            // Remove all the stored objects.
            objs = fns.removeQuadrantObjects(quadrant);
            objs[obj[k.id]] = obj;

            // Recalculate all objects which were stored before.
            for (id in objs) { fns.populateSubtree(objs[id], quadrant); }
          }
        },

        init : function init() {
          var divider;

          if (!data.quadrantLevelLimit_) data.quadrantLevelLimit_ = 10;

          validator.byCallbackObject(data, constraints.data.necessary);

          data.root_ = new Quadtree2Quadrant(new Vec2(0,0), data.size_.clone(), fns.nextQuadrantId(1));

          divider = Math.pow(2, data.quadrantLevelLimit_);
          data.quadrantSizeLimit_ = data.size_.clone().divide(divider);

          data.inited_ = true;
        },

        checkInit : function checkInit(init) {
          if (init && !data.inited_) { fns.init(); }
          return data.inited_;
        },

        checkObjectKeys : function checkObjectKeys(obj) {
          validator.isNumber(obj[k.id], k.id);
          validator.isNumber(obj[k.r], k.r);
          validator.hasNoKey(data.objects_, obj[k.id], k.id);
          validator.byCallbackObject(obj, constraints.k.necessary, k);
        },

        setObjId : function setObjId(obj) {
          if (data.autoId_ && !obj[k.id]) {
            obj[k.id] = fns.nextId();
          }
        },

        removeObjectById : function removeObjectById(id) {
          validator.hasKey(data.objects_, id, k.id);

          fns.removeObjectFromQuadrants(data.objects_[id]);

          delete data.objects_[id];
        },

        updateObjectById : function updateObjectById(id) {
          validator.hasKey(data.objects_, id, k.id);

          fns.updateObjectQuadrants(data.objects_[id]);
        },

        getObjectsByObject : function getObjectsByObject(obj) {
          var key,
              result = {
                quadrants : {},
                objects   : {}
              };

          for (key in data.quadrants_[obj[k.id]]) {
            data.quadrants_[obj[k.id]][key].getObjects(result);
          }

          delete result.objects[obj[k.id]];

          return result.objects;
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
        getQuadrantObjectsLimit: function getQuadrantObjectsLimit() {
          return data.quadrantObjectsLimit_;
        },

        setQuadrantObjectsLimit : function getQuadrantObjectsLimit(quadrantObjectsLimit) {
          if (quadrantObjectsLimit === undefined) { return; }

          validator.isNumber(quadrantObjectsLimit, 'quadrantObjectsLimit_');

          data.quadrantObjectsLimit_ = quadrantObjectsLimit;
        },

        getQuadrantLevelLimit : function getQuadrantLevelLimit() {
          return data.quadrantLevelLimit_;
        },

        setQuadrantLevelLimit: function setQuadrantLevelLimit(quadrantLevelLimit) {
          if (quadrantLevelLimit === undefined) { return; }

          validator.isNumber(quadrantLevelLimit, 'quadrantLevelLimit_');

          data.quadrantLevelLimit_ = quadrantLevelLimit;
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
          validator.isDefined(obj, 'obj');
          validator.isObject(obj, 'obj');

          fns.checkInit(true);
          fns.setObjId(obj);
          fns.checkObjectKeys(obj);

          fns.populateSubtree(obj);

          data.objects_[obj[k.id]] = obj;
        },

        removeObjects : function removeObjects(objs) {
          var i;

          for (i = 0; i < objs.length; i++) {
            publicFns.removeObject(objs[i]);
          }
        },

        removeObject : function removeObject(obj) {
          fns.checkInit(true);
          validator.hasKey(obj, k.id, k.id);

          fns.removeObjectById(obj[k.id]);
        },

        updateObjects : function updateObjects(objs) {
          var i;

          for(i = 0; i < objs.length; i++) {
            publicFns.updateObject(objs[i]);
          }
        },

        updateObject : function updateObject(obj) {
          fns.checkInit(true);
          validator.hasKey(obj, k.id, k.id);

          fns.updateObjectById(obj[k.id]);
        },

        getPossibleCollisionsForObject : function getPossibleCollisionsForObject(obj) {
          fns.checkInit(true);
          validator.hasKey(obj, k.id, k.id);

          return fns.getObjectsByObject(obj);
        },

        getCollisionsForObject : function getCollisionsForObject(obj) {
          var id, objects;

          fns.checkInit(true);
          validator.hasKey(obj, k.id, k.id);

          objects = fns.getObjectsByObject(obj);

          for (id in objects) {
            if (!fns.hasCollision(obj, objects[id])) { delete objects[id]; }
          }

          return objects;
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

            this.data_ = data;
          }

          return data.debug_;
        }
      };

  // Generate public functions.
  for (id in publicFns) { this[id] = publicFns[id]; }

  this.setSize(size);
  this.setQuadrantObjectsLimit(quadrantObjectsLimit);
  this.setQuadrantLevelLimit(quadrantLevelLimit);
};

module.exports = Quadtree2;
