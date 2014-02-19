# Quadtree2.js
is a Node.js package / JavaScript implementation of two dimensional quadtree for collision detection.

[![Build Status][travis-img-src]][travis-a-href]

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

```javascript
var // Variable to save the collisions
    alicesCollisions,
    bobsCollisions,
    bobsDeadlyCollisions,

    // This will initialize a quadtree with a 100x100 resolution,
    // with an object limit of 3 inside a quadrant.
    quadtree = new Quadtree2(new Vec2(100, 100), 3),

    // Alice will be staying fierce in the top left ...
    alice = {
      pos_ : new Vec2(20, 20),
      rad_ : 3
    },

    // ... with his rocket luncher, gonna try to shoot bob ...
    rocket = {
        pos_ : new Vec2(20, 20),
        rad_ : 5
    },

    // ... however there is a bunker on the field ...
    bunker = {
      pos_ : new Vec2(50, 50),
      rad_ : 10
    },

    // ... will it save bob?
    bob = {
      pos_ : new Vec2(80, 80),
      rad_ : 3
    };


// Add all of our beloved character to the quadtree.
quadtree.addObjects([alice, rocket, bunker, bob]);

// On the start Alice collides with her own rocket.
alicesCollisions = quadtree.getCollisionsForObject(alice);
// Object.keys(alicesCollisions).length;
// >> 1;

// Bob is just sitting and waiting.
bobsCollisions = quadtree.getCollisionsForObject(bob);
// Object.keys(bobsCollisions).length;
// >> 0;

// The rocket flys over to bob
rocket.pos_.x = 78;
rocket.pos_.y = 78;

// Update our data structure
quadtree.updateObject(rocket);

// Lets get the deadly hit
bobsDeadlyCollisions = quadtree.getCollisionsForObject(bob);
// Object.keys(bobsDeadlyCollisions).length;
// >> 1;
```

## License
[MIT License][git-LICENSE]

  [git-LICENSE]: LICENSE
  [travis-img-src]: https://travis-ci.org/burninggramma/quadtree2.js.png?branch=master
  [travis-a-href]: https://travis-ci.org/burninggramma/quadtree2.js
  [browser-test]: https://github.com/burninggramma/quadtree2.js/blob/master/test/browser/index.html
  [minified]: https://github.com/burninggramma/quadtree2.js/blob/master/quadtree2.min.js
  [wiki]: http://en.wikipedia.org/wiki/Quadtree
  [browserify]: http://browserify.org/
  [gitflow]: https://github.com/nvie/gitflow
