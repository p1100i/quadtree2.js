# Quadtree2.js
is a Node.js package / JavaScript implementation of two dimensional quadtree for collision detection.

## About
A quadtree is a scaling data structure for collision detection. You can find theory on the [WIKI][wiki]. I've exported the project for client side use with the help of [browserify][browserify]. Issues/PRs are welcome, please follow [git flow][gitflow] branching model.

A simple example usecase would be a little two dimensional game, with some moving objects like bullet and players. You wan'na know when a collision occours. Well you could easly just compare each objects position with each other, but if there is a lot of them, that is not the right thing.

Upon adding objects to the quadtree you either specify the unique number identifier attribute of the objects, e.g.: id, or the quadtree itself will assing that property to them.

## Install
- Browser
  - include the [quadtree2.min.js][minified]
- Node.js
  - `var Vec2 = require('vec2');`
  - `var Quadtree2 = require('quadtree2');`

## Use

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

## License
[MIT License][git-LICENSE]

  [git-LICENSE]: LICENSE
  [browser-test]: test/browser/index.html
  [minified]: quadtree2.min.js
  [wiki]: http://en.wikipedia.org/wiki/Quadtree
  [browserify]: http://browserify.org/
  [gitflow]: https://github.com/nvie/gitflow
