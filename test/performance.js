var Quadtree2   = require('../src/quadtree2'),
    Vec2        = require('vec2'),
    assert      = require('assert'),
    should      = require('should'),
    logTime     = function(time) {
      //console.log(time[0] + ' s, ' + ((time[1] / 1e6).toFixed(4)) + ' ms');
    };


describe('Quadtree2', function(){
  context('with a lot of objects', function() {
    it('should be faster then the trivial solution', function() {
      var i,
          time,
          qt,
          objects     = [],
          collisions  = {},
          checkCount  = 0,
          skip        = true,
          params      = {
            gameSize        : new Vec2(100000, 100000),
            maxObjectRad    : 20,
            objectCount     : 1000,
            percentOfQuery  : 100
          };

      if (skip) {
        return;
      }

      for (i = 0; i < params.objectCount; i++) {
        objects.push({
          id_   : i + 1,
          rad_  : ~~(Math.random() * params.maxObjectRad),
          q_    : (Math.random() * 100) < params.percentOfQuery,
          pos_  : new Vec2(
            ~~(Math.random() * params.gameSize.x),
            ~~(Math.random() * params.gameSize.y)
          )
        });
      }

      // Start timer
      time = process.hrtime();

      collisions.trivial = {};

      for (i = 0; i < objects.length; i++) {
        if (objects[i].q_) {
          collisions.trivial[objects[i].id_] = {};

          for (j = 0; j < objects.length; j++) {
            if (i === j) continue;

            checkCount++;
            if (objects[i].rad_ + objects[j].rad_ > objects[i].pos_.distance(objects[j].pos_)) {
              collisions.trivial[objects[i].id_][objects[j].id_] = objects[j];
            }
          }
        }
      }

      time = process.hrtime(time);

      logTime(time);

      //console.log('checked: ' + checkCount + ' time(s)');

      collisions.qt = {};


      qt = new Quadtree2(params.gameSize, 2, 8);
      qt.debug(true);

      for (i = 0; i < objects.length; i++) {
        qt.addObject(objects[i]);
      }

      time = process.hrtime();

      for (i = 0; i < objects.length; i++) {
        if (objects[i].q_) {
          collisions.qt[objects[i].id_] = qt.getCollisionsForObject(objects[i]);
        }
      }

      time = process.hrtime(time);

      logTime(time);
      //console.log('checked: ' + qt.data_.tmp_.checkCount_ + ' time(s)');
    });
  });
});

