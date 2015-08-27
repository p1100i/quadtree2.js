var
  Quadtree2   = require('../../../src/quadtree2'),
  Vec2        = require('vec2'),
  should      = require('should'),

  objectKey = function objectKey(x, y, rad) {
    return 'o' + x + '_' + y + '_' + rad;
  },

  objectFactory = function objectFactory(pos, rad) {
    return {
      'pos' : pos,
      'rad' : rad
    };

    return r;
  },

  objectContainerFactory = function objectContainerFactory(container, params) {
    var
      i,
      pos,
      key,
      param;

    for (i = 0; i < params.length; i++) {
      param     = params[i];
      pos       = new Vec2(param[0], param[1]);
      rad       = param[2];
      key       = objectKey(pos.x, pos.y, rad);

      container[key] = objectFactory(pos, rad);
    }

    return container;
  };

describe('Quadtree2 - unit', function () {
  beforeEach(function() {
    var
      i,
      j,
      qt,
      qtSmallLimit,
      qtBigLimit,
      o             = {},
      defaultOSize  = 1,
      defaultQtSize = 100,

      getObjects = function getObjects(from, to) {
        var
          key,
          object,
          objects = [];

        for (i = from; i <= to; i++) {
          for (j = from; j <= to; j++) {
            key     = objectKey(i, j, defaultOSize);
            object  = o[key];

            if (object) {
              objects.push(object);
            }
          }
        }

        return objects;
      };

    qt = new Quadtree2({
      'size'        : new Vec2(defaultQtSize, defaultQtSize),
      'objectLimit' : 2
    });

    qtSmallLimit = new Quadtree2({
      'size'        : new Vec2(defaultQtSize, defaultQtSize),
      'objectLimit' : 1
    });

    qtBigLimit = new Quadtree2({
      'size'        : new Vec2(80, 80),
      'objectLimit' : 10
    });

    o = {};

    objectContainerFactory(o, [
        [10, 11, 2],
        [20, 20, 5],
        [22, 22, 5],
        [42, 52, 5],
        [50, 52, 30],
        [62, 62, 5],
        [62, 82, 5],
        [25, 25, 2],
        [75, 25, 2],
        [25, 75, 2],
        [75, 75, 2],
        [50, 50, 2],
        [99, 99, 1]
    ]);

    for (i = 1; i < defaultQtSize - 1; i += 2) {
      for (j = 1; j < defaultQtSize - 1; j += 2) {
        objectContainerFactory(o, [[i, j, defaultOSize]]);
      }
    }

    this.o            = o;
    this.qt           = qt;
    this.qtSmallLimit = qtSmallLimit;
    this.qtBigLimit   = qtBigLimit;
    this.getObjects   = getObjects;
  });

  describe('#ctor', function () {
    context('with improper arguments', function () {
      it('should throw NaV_size', function () {
        Quadtree2.bind(null, {
          'size' : 1
        }).should.throw(/^NaV_size/);
      });

      it('should throw NaN_objectLimit', function () {
        Quadtree2.bind(null, {
          'size'        : new Vec2(2,3),
          'objectLimit' : 'string'
        }).should.throw(/^NaN_objectLimit/);
      });
    });

    context('with proper arguments', function () {
      it('should not throw', function () {
        Quadtree2.bind(null, {
          'size'        : new Vec2(2,3),
          'objectLimit' : 4
        }).should.not.throw();
      });
    });

    context('without limit', function () {
      it('should not throw', function () {
        Quadtree2.bind(null, {
          'size' : new Vec2(2,3)
        }).should.not.throw();
      });
    });
  });

  describe('.addObject()', function(){
    context('with objects having no id', function() {
      beforeEach(function() {
        this.qt.addObject(this.o.o25_25_2);
        this.qt.addObject(this.o.o50_50_2);
      });

      it('should auto assign id to them', function() {
        this.o.o25_25_2.id.should.not.eql(undefined);
        this.o.o50_50_2.id.should.eql(2);
      });

      it('should increase the object count', function() {
        this.qt.inspect().getObjectCount().should.eql(2);
      });

      it('should increase the quadrant count', function() {
        this.qt.inspect().getQuadrantCount().should.eql(1);

        this.qt.addObject(this.o.o20_20_5);

        this.qt.inspect().getQuadrantCount().should.eql(9);

        this.qt.addObjects([
          this.o.o42_52_5,
          this.o.o10_11_2,
        ]);

        this.qt.inspect().getQuadrantCount().should.eql(17);
      });
    });

    context('with objects placed on quadrant borders', function() {
      it('should split up quadrants properly', function() {
        this.qtSmallLimit.addObjects([
          this.o.o1_1_1,
          this.o.o25_25_2
        ]);

        this.qtSmallLimit.inspect().getObjectCount().should.eql(2);
        this.qtSmallLimit.inspect().getQuadrantCount().should.eql(13);

        this.qtSmallLimit.addObjects([
          this.o.o25_75_2,
          this.o.o75_25_2,
          this.o.o75_75_2
        ]);

        this.qtSmallLimit.inspect().getObjectCount().should.eql(5);
        this.qtSmallLimit.inspect().getQuadrantCount().should.eql(13);
      });
    });

    context('with a lot of objects', function() {
      it('should have the right quadrant count', function() {
        var objects = this.getObjects(0, 10);

        this.qtBigLimit.addObjects(objects);
        this.qtBigLimit.inspect().getObjectCount().should.eql(25);
        this.qtBigLimit.inspect().getQuadrantCount().should.eql(17);
      });
    });
  });

  describe('.updateObject()', function(){
    beforeEach(function () {
      this.qt.addObjects([
          this.o.o20_20_5,
          this.o.o25_25_2,
          this.o.o25_75_2,
          this.o.o75_25_2,
          this.o.o75_75_2
      ]);
    });

    context('with moving object into a full quadrant', function() {
      it('should increase the quadrants count', function() {
        this.qt.inspect().getQuadrantCount().should.eql(5);
        this.qt.addObject(this.o.o99_99_1);
        this.qt.inspect().getQuadrantCount().should.eql(5);

        this.o.o99_99_1.pos.set(20, 20);

        this.qt.updateObject(this.o.o99_99_1);

        this.qt.inspect().getQuadrantCount().should.eql(21);
      });
    });

    context('with an already multiplied quadrant', function() {
      beforeEach(function () {
        this.qt.inspect().getQuadrantCount().should.eql(5);
        this.qt.addObject(this.o.o1_1_1);
        this.qt.inspect().getQuadrantCount().should.eql(13);
      });

      context('with moving object out of it', function() {
        it('should decrease the quadrants count', function() {
          this.o.o1_1_1.pos.set(90, 90);
          this.qt.updateObject(this.o.o1_1_1);
          this.qt.inspect().getQuadrantCount().should.eql(5);
        });
      });

      context('with moving object out of the quadtree', function() {
        it('should decrease the quadrants count', function() {
          this.o.o1_1_1.pos.set(-90, -90);
          this.qt.updateObject(this.o.o1_1_1);

          this.qt.inspect().getQuadrantCount().should.eql(5);
        });
      });

      context('with moving object on the border of the quadtree in the same quadrant', function() {
        it('should not decrease the quadrants count', function() {
          this.o.o1_1_1.pos.set(0, 0);
          this.qt.updateObject(this.o.o1_1_1);

          this.qt.inspect().getQuadrantCount().should.eql(13);
        });
      });

      context('with moving object on the border of the quadtree in a different quadrant', function() {
        it('should not decrease the quadrants count', function() {
          this.o.o1_1_1.pos.set(52, 0);
          this.qt.updateObject(this.o.o1_1_1);

          this.qt.inspect().getQuadrantCount().should.eql(5);
        });
      });
    });
  });

  describe('.removeObject()', function(){
    beforeEach(function () {
      this.qtSmallLimit.addObjects([
          this.o.o1_1_1,
          this.o.o25_25_2,
          this.o.o25_75_2,
          this.o.o75_25_2,
          this.o.o75_75_2
      ]);

      this.qtSmallLimit.inspect().getObjectCount().should.eql(5);

      this.originalQuadrantCount = this.qtSmallLimit.inspect().getQuadrantCount();
    });

    it('should dereference the removed object', function() {
      this.qtSmallLimit.removeObject(this.o.o1_1_1);
      this.qtSmallLimit.inspect().getObjectCount().should.eql(4);
    });

    it('should refactor quadrants up recursively', function() {
      this.qtSmallLimit.addObject(this.o.o5_5_1);

      this.qtSmallLimit.inspect().getQuadrantCount().should.eql(21);
      this.qtSmallLimit.removeObject(this.o.o5_5_1);
      this.qtSmallLimit.inspect().getQuadrantCount().should.eql(this.originalQuadrantCount);
    });
  });

  describe('.getCollidables()', function(){
    context('with few trivial objects', function() {
      it('should return those in the same quadrant tree', function() {
        this.qt.addObjects([
            this.o.o25_25_2,
            this.o.o50_50_2,
            this.o.o75_75_2
        ]);

        this.qt.getCollidables(this.o.o50_50_2).should.eql({
          '1' : this.o.o25_25_2,
          '3' : this.o.o75_75_2
        });
      });
    });

    context('with fewer objects than the limit', function() {
      it('should return all inserted objects', function() {
        this.qtBigLimit.addObjects([
            this.o.o20_20_5,
            this.o.o42_52_5,
            this.o.o10_11_2
        ]);

        this.qtBigLimit.getCollidables(this.o.o20_20_5).should.eql({
          '2' : this.o.o42_52_5,
          '3' : this.o.o10_11_2
        });
      });
    });

    context('with non-colliding objects', function() {
      it('should <TODO>', function() {
        this.qt.addObjects([
            this.o.o20_20_5,
            this.o.o42_52_5,
            this.o.o10_11_2,
            this.o.o50_52_30,
            this.o.o62_62_5,
            this.o.o62_82_5,
            this.o.o22_22_5
        ]);

        this.qt.getCollidables(this.o.o20_20_5).should.eql({
          '7' : this.o.o22_22_5,
        });
      });
    });
  });

  describe('.getCollidings()', function(){
    context('with already placed in objects', function () {
      it('should return ', function () {
        this.qt.addObjects([
          this.o.o20_20_5,
          this.o.o42_52_5
        ]);

        this.qt.getCollidings(this.o.o20_20_5).should.eql({});
      });
    });
  });
});
