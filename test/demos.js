var Quadtree2   = require('../src/quadtree2'),
    Vec2        = require('vec2'),
    assert      = require('assert'),
    should      = require('should');

describe('Quadtree2', function(){
  context('with object in the middle', function() {
    it('should not return all other objects as possible colliding', function(){
      var qt = new Quadtree2(new Vec2(500, 500), 4);
      var o1 = { pos_ : new Vec2(472, 276), rad_ : 8 };
      qt.addObject(o1);
      var o2 = { pos_ : new Vec2(142, 407), rad_ : 20 };
      qt.addObject(o2);
      var o3 = { pos_ : new Vec2(44, 43), rad_ : 8 };
      qt.addObject(o3);
      var o4 = { pos_ : new Vec2(437, 46), rad_ : 12 };
      qt.addObject(o4);
      var o5 = { pos_ : new Vec2(457, 462), rad_ : 14 };
      qt.addObject(o5);
      var o6 = { pos_ : new Vec2(406, 464), rad_ : 13 };
      qt.addObject(o6);
      var o7 = { pos_ : new Vec2(409, 414), rad_ : 20 };
      qt.addObject(o7);
      var o8 = { pos_ : new Vec2(459, 410), rad_ : 18 };
      qt.addObject(o8);
      var o9 = { pos_ : new Vec2(325, 329), rad_ : 19 };
      qt.addObject(o9);
      var o10 = { pos_ : new Vec2(250, 251), rad_ : 11 };

      qt.debug(true);
      qt.addObject(o10);

      var quadrantIds = Object.keys(qt.data_.quadrants_[o10.id_]);
      quadrantIds.should.not.containEql('1');
      qt.getPossibleCollisionsForObject(o10).should.eql({ 3 : o3, 4 : o4, 2 : o2, 9 : o9 });
    });
  });
});
