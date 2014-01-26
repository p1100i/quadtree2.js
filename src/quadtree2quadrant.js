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
