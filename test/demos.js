var Quadtree2   = require('../src/quadtree2'),
    Vec2        = require('vec2'),
    assert      = require('assert'),
    should      = require('should');

describe('Quadtree2', function(){
  context('with object in the middle', function() {
    it('should not return all other objects as possible colliding', function() {
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
      qt.addObject(o10);

      qt.debug(true);

      var quadrantIds = Object.keys(qt.data_.quadrants_[o10.id_]);
      quadrantIds.should.not.containEql('1');
      qt.getPossibleCollisionsForObject(o10).should.eql({ 3 : o3, 4 : o4, 2 : o2, 9 : o9 });
    });
  });

  context('with object in the middle', function() {
    it('should return correct possible colliding objects', function() {
      var qt = new Quadtree2(new Vec2(500, 500), 4);
      var o1 = { pos_ : new Vec2(119, 393.5), rad_ : 10 };
      qt.addObject(o1);
      var o2 = { pos_ : new Vec2(333, 429.5), rad_ : 11 };
      qt.addObject(o2);
      var o3 = { pos_ : new Vec2(390, 428.5), rad_ : 13 };
      qt.addObject(o3);
      var o4 = { pos_ : new Vec2(397, 95.5), rad_ : 14 };
      qt.addObject(o4);
      var o5 = { pos_ : new Vec2(373, 71.5), rad_ : 7 };
      qt.addObject(o5);
      var o6 = { pos_ : new Vec2(28, 64.5), rad_ : 2 };
      qt.addObject(o6);
      var o7 = { pos_ : new Vec2(251, 251.5), rad_ : 20 };
      qt.addObject(o7);

      qt.getPossibleCollisionsForObject(o7).should.eql({ 1 : o1, 2 : o2, 3 : o3, 4 : o4, 5 : o5, 6 : o6 });
    });
  });

  context('with object in the middle', function() {
    it('should return all the possible colliding objects', function() {
      var qt = new Quadtree2(new Vec2(500, 500), 4);
      var o1 = { pos_ : new Vec2(99, 75.5), rad_ : 20 };
      qt.addObject(o1);
      var o2 = { pos_ : new Vec2(397, 76.5), rad_ : 19 };
      qt.addObject(o2);
      var o3 = { pos_ : new Vec2(139, 372.5), rad_ : 15 };
      qt.addObject(o3);
      var o4 = { pos_ : new Vec2(425, 427.5), rad_ : 11 };
      qt.addObject(o4);
      var o5 = { pos_ : new Vec2(439, 339.5), rad_ : 7 };
      qt.addObject(o5);
      var o6 = { pos_ : new Vec2(251, 251.5), rad_ : 9 };
      qt.addObject(o6);
      var o7 = { pos_ : new Vec2(287, 337.5), rad_ : 20 };
      qt.addObject(o7);
      var o8 = { pos_ : new Vec2(335, 294.5), rad_ : 17 };
      qt.addObject(o8);

      qt.debug(true);

      qt.getPossibleCollisionsForObject(o6).should.eql({ 1 : o1, 2 : o2, 3 : o3, 7 : o7, 8 : o8 });
    });
  });
});
