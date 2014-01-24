var Vec2 = require('vec2'),
    Quadtree2;

Quadtree2 = function Quadtree2(size, limit) {
  if (!(size instanceof Vec2))
    throw new Error('First arg should be an instance of Vec2');

  if ('number' !== typeof limit)
    throw new Error('Second arg should be a number');

  var data = {},
      addObject = function addObject(){
      };

  this.addObject = addObject;
};

module.exports = Quadtree2;
