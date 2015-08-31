var Vec2                = require('vec2'),
    Quadtree2Helper     = require('./quadtree2helper'),
    Quadtree2Inspector  = require('./quadtree2inspector'),
    Quadtree2Validator  = require('./quadtree2validator'),
    Quadtree2Quadrant   = require('./quadtree2quadrant'),
    Quadtree2;

Quadtree2 = function Quadtree2(config) {
  var
    size,
    root,
    inspector,
    levelLimit,
    objectLimit,
    quadrantSizeLimit,
    qt              = this,
    idKey           = 'id',
    posKey          = 'pos',
    radKey          = 'rad',
    autoObjectId    = 1,
    quadrantId      = 1,
    validator       = new Quadtree2Validator(),
    objects         = {},
    objectQuadrants = {},

    nextQuadrantId = function nextQuadrantId() {
      var id = quadrantId;

      quadrantId += 4;

      return id;
    },

    getSmallestIntersectingQuadrants = function getSmallestIntersectingQuadrants(object, quadrant, result) {
      if (!quadrant.intersects(object[posKey], object[radKey])) {
        return;
      }

      var
        i,
        children      = quadrant.getChildren(),
        childrenCount = children && children.length;

      if (childrenCount) {
        for (i = 0; i < childrenCount; i++) {
          getSmallestIntersectingQuadrants(object, children[i], result);
        }
      } else {
        result[quadrant.id_] = quadrant;
      }

      return result;
    },

    removeObjectFromQuadrant = function removeObjectFromQuadrant(object, quadrant) {
      quadrant.removeObject(object[idKey]);

      delete objectQuadrants[object[idKey]][quadrant.id_];

      // Call refactor only from leaf quadrants.
      if (quadrant.parent_ && !quadrant.hasChildren()) {
        refactorSubtree(quadrant.parent_);
      }
    },

    removeObjectFromQuadrants = function removeObjectFromQuadrants(object, quadrants) {
      var id;

      if (quadrants === undefined) {
        quadrants = objectQuadrants[object[idKey]];
      }

      for (id in quadrants) {
        removeObjectFromQuadrant(object, quadrants[id]);
      }
    },

    addObjectToQuadrant = function addObjectToQuadrant(object, quadrant) {
      var id = object[idKey];

      if (objectQuadrants[id] === undefined) {
        objectQuadrants[id] = {};
      }

      objectQuadrants[id][quadrant.id_] = quadrant;

      quadrant.addObject(id, object);
    },

    removeQuadrantObjects = function removeQuadrantObjects(quadrant) {
      var
        i,
        removed,
        removedObjects = quadrant.removeObjects([], 1);

      for (i = 0; i < removedObjects.length; i++) {
        removed = removedObjects[i];

        delete objectQuadrants[removed.object[idKey]][removed.quadrant.id_];
      }

      return removedObjects;
    },

    populateQuadrant = function populateQuadrant(object, quadrant) {
        var i,
            id,
            smallestQuadrants,
            removes,
            removed;

        if (!quadrant) {
          quadrant = root;
        }

        if (quadrant.hasChildren()) {
          // Get smallest quadrants which intersect.
          smallestQuadrants = getSmallestIntersectingQuadrants(object, quadrant, {});

          for (id in smallestQuadrants) {
            // Propagate further to children
            populateQuadrant(object, smallestQuadrants[id]);
          }

        } else if (quadrant.size_.x <= object[radKey] || quadrant.getObjectCount() < objectLimit || quadrant.size_.x < quadrantSizeLimit.x ) {
          // Has no children but still got place, so store it.
          addObjectToQuadrant(object, quadrant);
        } else {
          // Got no place so lets make children.
          quadrant.makeChildren(nextQuadrantId());

          // Remove all the stored objects until the parent.
          removes = removeQuadrantObjects(quadrant);
          removes.push({
            'object'   : object,
            'quadrant' : quadrant
          });

          // Recalculate all objects which were stored before.
          for (i = 0; i < removes.length; i++) {
            removed = removes[i];

            populateQuadrant(removed.object, removed.quadrant);
          }
        }
    },

    addObject = function addObject(object) {
      var id = object[idKey];

      if (autoObjectId && !id) {
        id = object[idKey] = autoObjectId++;
      }

      if (objects[id]) {
        throw new Error('usedId');
      }

      objects[id] = object;

      populateQuadrant(object);

      return object;
    },

    addObjects = function addObjects(objects) {
      return objects.forEach(addObject);
    },

    removeObject = function removeObject(objectToRemove) {
      var id = objectToRemove[idKey];

      removeObjectFromQuadrants(objectToRemove);

      delete objects[id];
    },

    removeObjectById = function removeObjectById(id) {
      var object = objects[id];

      return removeObject(object);
    },

    removeObjects = function removeObjects(objectsToRemove) {
      return objectsToRemove.forEach(removeObject);
    },

    hasCollision = function hasCollision(objectA, objectB) {
      return objA[k.r] + objB[k.r] > objA[k.p].distance(objB[k.p]);
    },

    getCollidables = function getCollidables(object) {
      var
        i,
        id,
        quadrant,
        children,
        childrenCount,
        quadrants = objectQuadrants[object[idKey]],
        result    = {
          'objects'   : {},
          'quadrants' : {}
        };

      // TODO this could be improved as objects can be now
      // only on leaf nodes.
      for (id in quadrants) {
        quadrant = quadrants[id];
        quadrant.getObjectsUp(result);

        children      = quadrant.children_;
        childrenCount = children.length;

        for (i = 0; i < childrenCount; i++) {
          children[i].getObjectsDown(result);
        }
      }

      // Remove the original object from the results.
      delete result.objects[object[idKey]];

      return result.objects;
    },

    refactorSubtree = function refactorSubtree(quadrant) {
      var i,
          id,
          count,
          child,
          object;

      if (quadrant.refactoring_) { return; }

      //
      // On the first outer call from removeObjectFromQuadrant, quadrant
      // points on a leaf node. Need to make sure this does have only
      // LEAF node siblings, so we check each of them for children.
      //
      for (i = 0; i < quadrant.children_.length; i++) {
        child = quadrant.children_[i];

        if (child.hasChildren()) {
          return;
        }
      }

      // At this point it is sure, that none of the children quadrant
      // has children itself, so all of the objects are inside the quadrant
      // or directly in its children.
      count = quadrant.getObjectCountForLimit();

      if (count > objectLimit) {
        return;
      }

      quadrant.refactoring_ = true;

      for (i = 0; i < quadrant.children_.length; i++) {
        child = quadrant.children_[i];

        for (id in child.objects_) {
          object = child.objects_[id];

          // The child quadrant has no childs, so this won't be a recursive call.
          removeObjectFromQuadrant(object, child);

          addObjectToQuadrant(object, quadrant);
        }
      }

      quadrant.looseChildren();

      quadrant.refactoring_ = false;

      if (quadrant.parent_) {
        refactorSubtree(quadrant.parent_);
      }
    },

    getCollidings = function getCollidings(object) {
      var
        id,
        otherObject,
        objects = getCollidables(object);

      for (id in objects) {
        otherObject = objects[id];

        // Check if the two object are farer apart, than they size.
        if (otherObject[posKey].distance(object[posKey]) > otherObject[radKey] + object[radKey]) {
          delete objects[id];
        }
      }

      return objects;
    },

    //
    // TODO this could be made much more faster w/o using arrayDiffs.
    //
    updateObjectQuadrants = function updateObjectQuadrants(object) {
      var oldQuadrants  = objectQuadrants[object[idKey]],
          newQuadrants  = getSmallestIntersectingQuadrants(object, root, {}),
          oldIds        = Quadtree2Helper.getIdsOfObjects(oldQuadrants),
          newIds        = Quadtree2Helper.getIdsOfObjects(newQuadrants),
          diffIds       = Quadtree2Helper.arrayDiffs(oldIds, newIds),
          removeIds     = diffIds[0],
          addIds        = diffIds[1],
          i;

      for (i = 0; i < addIds.length; i++) {
        populateQuadrant(object, newQuadrants[addIds[i]]);
      }

      for (i = 0; i < removeIds.length; i++) {
        if (!oldQuadrants[removeIds[i]]) { continue; }
        removeObjectFromQuadrant(object, oldQuadrants[removeIds[i]]);
      }
    },

    updateObject = function updateObject(objectToUpdate) {
      return updateObjectQuadrants(objectToUpdate);
    },

    updateObjectById = function updateObjectById(id) {
      var object = objects[id];

      return updateObject(object);
    },

    updateObjects = function updateObjects(objectsToUpdate) {
      return objectsToUpdate.forEach(updateObject);
    },

    inspect = function inspect() {
      var data = {
            'root'            : root,
            'idKey'           : idKey,
            'config'          : config,
            'objects'         : objects,
            'objectQuadrants' : objectQuadrants
          };

      if (!inspector) {
        data.qt = qt;
        inspector = new Quadtree2Inspector(data);
        delete data.qt;
      }

      return inspector;
    },

    setKey = function setKey(type, value) {
      if (type === 'id') {
        autoObjectId  = 0;
        idKey         = value;
      } else if(type === 'pos') {
        posKey = value;
      } else if(type === 'rad') {
        radKey = value;
      }
    },

    init = function init(config) {
      size        = config.size;
      objectLimit = config.objectLimit || 4;
      levelLimit  = config.levelLimit  || 6;

      validator.isVec2(size,          'size');
      validator.isNumber(objectLimit, 'objectLimit');
      validator.isNumber(levelLimit,  'levelLimit');

      root              = new Quadtree2Quadrant(new Vec2(0,0), size.clone(), 1);
      quadrantSizeLimit = size.clone().divide(Math.pow(2, levelLimit));
    };

  init(config);

  this.addObject        = addObject;
  this.addObjects       = addObjects;
  this.getCollidables   = getCollidables;
  this.getCollidings    = getCollidings;
  this.updateObject     = updateObject;
  this.updateObjectById = updateObjectById;
  this.updateObjects    = updateObjects;
  this.removeObject     = removeObject;
  this.removeObjectById = removeObjectById;
  this.removeObjects    = removeObjects;
  this.setKey           = setKey;
  this.inspect          = inspect;

  return this;
};

module.exports = Quadtree2;
