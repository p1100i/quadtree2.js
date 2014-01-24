var Quadtree2 = require('../quadtree2'),
    Vec2      = require('vec2'),
    assert    = require('assert'),
    should    = require('should'),
    factory;

factory = function factory(){
  return new Quadtree2(new Vec2(2,3), 4);
};

describe('Quadtree2', function(){
  describe('constructor', function(){
    it('should throw with inproper arguments', function(){
      (function() { Quadtree2(2,3); }).should.throw();
    });

    it('should not throw with proper arguments', function(){
      (function() { Quadtree2(new Vec2(2,3), 4); }).should.not.throw();
    });

    it('sets width and height if they are passed', function() {
      var qt = factory();
      qt.addObject(1);
    });
  });

  describe('#getSize', function(){
    it('returns just a clone of the size', function() {
      var qt    = factory(),
          size  = qt.getSize();

      size.x = 5;

      qt.getSize().x.should.not.eql(5);
      qt.getSize().x.should.eql(2);
    });
  });
});
