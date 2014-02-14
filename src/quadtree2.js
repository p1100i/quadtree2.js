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

          if (count > data.limit_) { return; }

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
              newQuadrants  = fns.getSmallestQuadrants(obj),
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
              fns.populateSubtree(obj, smallestQs[id]);
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
            for (id in objs) { fns.populateSubtree(objs[id], quadrant); }
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
          validator.isDefined(obj, 'obj');
          validator.isObject(obj, 'obj');

          fns.checkInit(true);
          fns.setObjId(obj);
          fns.setObjShape(obj);
          fns.checkObjectKeys(obj);

          fns.populateSubtree(obj);

          data.objects_[obj[k.id]] = obj;
        },

        removeObject : function removeObject(id) {
          fns.removeObjectFromQuadrants(data.objects_[id]);

          delete data.objects_[id];
        },

        updateObjects : function updateObjects(ids) {
          var i;

          for(i = 0; i < ids.length; i++) {
            fns.updateObjectQuadrants(data.objects_[ids[i]]);
          }
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

            this.data_ = data;
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
