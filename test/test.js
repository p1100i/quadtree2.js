var Quadtree2 = require('../quadtree2'),
    Vec2      = require('vec2'),
    assert    = require('assert'),
    should    = require('should'),
    oFactory,
    qtFactory,
    qtFactoryWithObjects;

oFactory = function oFactory(id, pos) {
  return {
    id_   : id  || 1 ,
    pos_  : pos || new Vec2(2,3)
  };
};

qtFactory = function qtFactory(size, limit, objects){
  if (arguments.length < 1) {
    size = new Vec2(2,3);
    if (arguments.length < 2) limit = 4;
  }

  var qt = new Quadtree2(size, limit);

  if (objects && objects.length > 0) {
    objects.forEach(function(o){
      qt.addObject(o);
    });
  }

  return qt;
};

qtFactoryWithObjects = function qtFactoryWithObjects(size, limit, objects){
  objects = objects || [oFactory(), oFactory()];

  return qtFactory(size, limit, objects);
};

describe('Quadtree2', function(){
  describe('constructor', function(){
    context('with inproper arguments', function() {
      it('should throw NaV', function(){
        Quadtree2.bind(null, 1,2).should.throw(/^NaV/);
      });

      it('should throw NaN', function(){
        Quadtree2.bind(null, new Vec2(2,3), null).should.throw(/^NaN/);
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
      var qt    = qtFactory(),
          size  = qt.getSize();

      size.x = 5;

      qt.getSize().x.should.not.eql(5);
      qt.getSize().x.should.eql(2);
    });
  });

  describe('#addObject', function(){
    context('with inproper arguments', function() {
      it('should throw ND', function() {
        var qt = qtFactory();
        qt.addObject.should.throw(/^ND/);
      });

      it('should throw NaO', function() {
        var qt = qtFactory();
        qt.addObject.bind(null, 1).should.throw(/^NaO/);
      });
    });

    context('with obj id based configuration', function() {
      context('without obj id defined', function() {
        it('should throw ND', function() {
          var qt = qtFactory(),
              o  = { pos_ : new Vec2(1,2) };

          qt.setObjectKey('id', 'id_');
          qt.addObject.bind(null, o).should.throw(/^ND/);
        });
      });

      context('with used obj id', function() {
        it('should throw OaA', function() {
          var qt = qtFactory(),
              o1 = { pos_ : new Vec2(1,2), id_ : 'x' },
              o2 = { pos_ : new Vec2(2,3), id_ : 'x' };

          qt.setObjectKey('id', 'id_');
          qt.addObject.bind(null, o1).should.not.throw();
          qt.addObject.bind(null, o2).should.throw(/^OaA/);
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
  });

  describe('#setObjectKey', function(){
    context('with inited Quadtree2', function() {
      it('should throw QaI', function() {
        var qt = qtFactory(),
            o  = oFactory();

        qt.addObject(o);
        qt.setObjectKey.bind(null, 'p', 'newPos_').should.throw(/^QaI/);
      });
    });
  });
});
