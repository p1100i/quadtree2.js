var Quadtree2 = require('../quadtree2'),
    assert    = require('assert'),
    should    = require('should');

describe('Quadtree2', function(){
  describe('constructor', function(){
    it('should throw without proper arguments', function(){
      (function() { Quadtree2(2,3); }).should.throw();
    });

    it('should not throw with proper arguments', function(){
      (function() { Quadtree2(new Vec2(2,3), 4); }).should.throw();
    });

    it('sets width and height if they are passed', function() {
    });
  });
});

