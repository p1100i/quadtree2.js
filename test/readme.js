var Quadtree2 = require('../src/quadtree2'),
    Vec2      = require('vec2'),
    assert    = require('assert'),
    should    = require('should');

describe('README', function() {
  context('with the example', function() {
    it('should work', function() {
      // BEG README

      var // Variable to store positions
          collisions,

          // This will initialize a quadtree with a 100x100 resolution,
          // with an object limit of 3 inside a quadrant.
          qt = new Quadtree2(new Vec2(100, 100), 3),

          // The objects we will add to the quadtree.
          objects = [
            {
              pos_ : new Vec2(20, 20),
              rad_ : 3
            },
            {
              pos_ : new Vec2(21, 21),
              rad_ : 3
            },
            {
              pos_ : new Vec2(50, 50),
              rad_ : 40
            },
            {
              pos_ : new Vec2(70, 70),
              rad_ : 2
            }
          ];

      // Insert the objects into the quadtree.
      qt.addObjects(objects);

      // Get the collsision in an array of arrays [[objA, objB], ... ]
      collisions = qt.getCollidedObjects();
      // END README

      collisions.should.containEql([objects[0], objects[1]]);
      collisions.should.containEql([objects[0], objects[2]]);
      collisions.should.containEql([objects[1], objects[2]]);
      collisions.should.containEql([objects[2], objects[3]]);
    });
  });
});
