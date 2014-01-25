// jshint maxlen: 120

var Quadtree2 = require('../quadtree2'),
    Vec2      = require('vec2'),
    assert    = require('assert'),
    should    = require('should'),
    oFactory,
    qtFactory,
    qtFactoryWithObjects;

oFactory = function oFactory(id, pos, radius, rotation) {
  var r = {
    id_   : id  || 1,
    pos_  : pos || new Vec2(2,3)
  };

  if(radius) {
    r.rad_ = radius;
  } else {
    r.rot_ = rotation || 1.2;
  }

  return r;
};

qtFactory = function qtFactory(size, limit, idKey, objects){
  if (!size)  { size = new Vec2(100, 100); }
  if (!limit) { limit = 4; }

  var qt = new Quadtree2(size, limit);

  if (objects && objects.length > 0) {
    objects.forEach(function(o){
      qt.addObject(o);
    });
  }

  return qt;
};

qtFactoryWithObjects = function qtFactoryWithObjects(size, limit, idKey, objects) {
  objects = objects || [oFactory(1), oFactory(2, undefined, 3)];

  return qtFactory(size, limit, idKey, objects);
};

describe('Quadtree2', function(){
  describe('constructor', function(){
    context('with inproper arguments', function() {
      it('should throw NaV_size_', function(){
        Quadtree2.bind(null, 1,2).should.throw(/^NaV_size_/);
      });

      it('should throw NaN_limit_', function(){
        Quadtree2.bind(null, new Vec2(2,3), null).should.throw(/^NaN_limit_/);
      });
    });

    context('with proper arguments', function() {
      it('should not throw', function(){
        Quadtree2.bind(null, new Vec2(2,3), 4).should.not.throw();
      });
    });

    context('without limit', function() {
      it('should not throw', function() {
        Quadtree2.bind(null, new Vec2(2,3), undefined).should.not.throw();
      });
    });
  });

  describe('#getSize', function(){
    it('should return just a clone of the size', function() {
      var qt    = qtFactory(new Vec2(2, 3)),
          size  = qt.getSize();

      size.x = 5;

      qt.getSize().x.should.not.eql(5);
      qt.getSize().x.should.eql(2);
    });
  });

  describe('#addObject', function(){
    context('with inproper arguments', function() {
      it('should throw ND_obj', function() {
        var qt = qtFactory();
        qt.addObject.should.throw(/^ND_obj/);
      });

      it('should throw NaO_obj', function() {
        var qt = qtFactory();
        qt.addObject.bind(null, 1).should.throw(/^NaO_obj/);
      });

      it('should throw ND_rot_', function() {
        var qt = qtFactory(),
            o  = { pos_ : new Vec2(1,2) };

        qt.addObject.bind(null, o).should.throw(/^ND_rot_/);
      });

      it('should throw NaN_rad_', function() {
        var qt = qtFactory(),
            o  = { pos_ : new Vec2(1,2), rad_ : 'x' };

        qt.addObject.bind(null, o).should.throw(/^NaN_rad_/);
      });
    });

    context('with obj id based configuration', function() {
      context('without obj id defined', function() {
        it('should throw ND_id_', function() {
          var qt = qtFactory(),
              o  = { pos_ : new Vec2(1,2), rad_ : 3 };

          qt.setObjectKey('id', 'id_');
          qt.addObject.bind(null, o).should.throw(/^ND_id_/);
        });
      });

      context('with used obj id', function() {
        it('should throw OhK_x', function() {
          var qt = qtFactory(),
              o1 = oFactory(),
              o2 = oFactory();

          o2.id_ = o1.id_ = 'x';

          qt.setObjectKey('id', 'id_');
          qt.addObject.bind(null, o1).should.not.throw();
          qt.addObject.bind(null, o2).should.throw(/^OhK_id_x/);
        });
      });
    });

    it('should increase the object count', function() {
      var qt = qtFactory(),
          o  = oFactory();

      qt.getCount().should.eql(0);
      qt.addObject(o);
      qt.getCount().should.eql(1);
    });

    it('should assign auto id to the object', function() {
      var qt = qtFactory(),
          o1 = { pos_ : new Vec2(1,2), rad_ : 3 };
          o2 = { pos_ : new Vec2(1,2), rad_ : 3 };

      qt.addObjects([o1, o2]);

      o1.id_.should.not.eql(undefined);
      o2.id_.should.eql(2);
    });
  });

  describe('#setObjectKey', function(){
    context('with inited Quadtree2', function() {
      it('should throw FarT', function() {
        var qt = qtFactoryWithObjects();

        qt.setObjectKey.bind(null, 'p', 'newPos_').should.throw(/^FarT_checkInit/);
      });
    });
  });

  describe('#getCollidedObjects', function(){
    context('with non-colliding objects', function() {
      it('should return an empty array', function() {
        var qt = qtFactory(),
            o1 = oFactory(null, new Vec2(20,20), 5),
            o2 = oFactory(null, new Vec2(42,52), 5);

        qt.addObjects([o1, o2]);

        //qt.getCollidedObjects().should.eql([]);
      });
    });

    context('with some colliding objects', function() {
      it('should return the two objects', function() {
        var qt = qtFactory(),
            o1 = oFactory(null, new Vec2(20,20), 5),
            o2 = oFactory(null, new Vec2(22,22), 5),
            o3 = oFactory(null, new Vec2(32,42), 5);

        qt.addObjects([o1, o2, o3]);

        //qt.getCollidedObjects().should.containDeep([o1, o2]);
        //qt.getCollidedObjects().should.not.containEql(o3);
      });
    });
  });
});
