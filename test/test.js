var Quadtree2 = require('../quadtree2'),
    Vec2      = require('vec2'),
    assert    = require('assert'),
    should    = require('should'),
    factory;

factory = function factory(size, limit){
  if (arguments.length < 1) {
    size = new Vec2(2,3);
    if (arguments.length < 2) limit = 4;
  }

  return new Quadtree2(size, limit);
};

describe('Quadtree2', function(){
  describe('constructor', function(){
    context('with inproper arguments', function() {
      it('should throw', function(){
        (function() { factory(1,2); }).should.throw();
      });

      it('should throw', function(){
        (function() { factory(new Vec(2,3), null); }).should.throw();
      });
    });

    context('with proper arguments', function() {
      it('should not throw', function(){
        (function() { factory(new Vec2(2,3), 4); }).should.not.throw();
      });
    });

    context('without limit', function() {
      it('should not throw', function() {
        (function() { factory(new Vec2(2,3), undefined); }).should.not.throw();
      });
    });
  });

  describe('#getSize', function(){
    it('should return just a clone of the size', function() {
      var qt    = factory(),
          size  = qt.getSize();

      size.x = 5;

      qt.getSize().x.should.not.eql(5);
      qt.getSize().x.should.eql(2);
    });
  });

  describe('#addRect', function(){
    it('should increase the object count', function() {
      var qt = factory();

      qt.getCount().should.eql(0);
      qt.addRect();
      qt.getCount().should.eql(1);
    });
  });
});
