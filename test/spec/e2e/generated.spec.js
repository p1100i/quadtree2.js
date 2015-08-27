var Quadtree2 = require('../../../src/quadtree2'),
    Vec2      = require('vec2'),
    assert    = require('assert'),
    should    = require('should');

describe('Quadtree2 - e2e - generated', function(){
  describe('.getCollidables()', function(){
    context('with object in the middle - A', function() {
      it('should not return all other objects as possible colliding', function() {
        var qt = new Quadtree2({
          'size'        : new Vec2(500, 500),
          'objectLimit' : 4
        });

        var o1 = { pos : new Vec2(472, 276), rad : 8 };
        qt.addObject(o1);
        var o2 = { pos : new Vec2(142, 407), rad : 20 };
        qt.addObject(o2);
        var o3 = { pos : new Vec2(44, 43), rad : 8 };
        qt.addObject(o3);
        var o4 = { pos : new Vec2(437, 46), rad : 12 };
        qt.addObject(o4);
        var o5 = { pos : new Vec2(457, 462), rad : 14 };
        qt.addObject(o5);
        var o6 = { pos : new Vec2(406, 464), rad : 13 };
        qt.addObject(o6);
        var o7 = { pos : new Vec2(409, 414), rad : 20 };
        qt.addObject(o7);
        var o8 = { pos : new Vec2(459, 410), rad : 18 };
        qt.addObject(o8);
        var o9 = { pos : new Vec2(325, 329), rad : 19 };
        qt.addObject(o9);
        var o10 = { pos : new Vec2(250, 251), rad : 11 };
        qt.addObject(o10);

        qt.getCollidables(o10).should.eql({ 3 : o3, 4 : o4, 2 : o2, 9 : o9 });
      });
    });

    context('with object in the middle - B', function() {
      it('should return correct possible colliding objects', function() {
        var qt = new Quadtree2({
          'size'        : new Vec2(500, 500),
          'objectLimit' : 4
        });

        var o1 = { pos : new Vec2(119, 393.5), rad : 10 };
        qt.addObject(o1);
        var o2 = { pos : new Vec2(333, 429.5), rad : 11 };
        qt.addObject(o2);
        var o3 = { pos : new Vec2(390, 428.5), rad : 13 };
        qt.addObject(o3);
        var o4 = { pos : new Vec2(397, 95.5), rad : 14 };
        qt.addObject(o4);
        var o5 = { pos : new Vec2(373, 71.5), rad : 7 };
        qt.addObject(o5);
        var o6 = { pos : new Vec2(28, 64.5), rad : 2 };
        qt.addObject(o6);
        var o7 = { pos : new Vec2(251, 251.5), rad : 20 };
        qt.addObject(o7);

        qt.getCollidables(o7).should.eql({ 1 : o1, 2 : o2, 3 : o3, 4 : o4, 5 : o5, 6 : o6 });
      });
    });

    context('with object in the middle - C', function() {
      it('should return all the possible colliding objects', function() {
        var qt = new Quadtree2({
          'size'        : new Vec2(500, 500),
          'objectLimit' : 4
        });

        var o1 = { pos : new Vec2(99, 75.5), rad : 20 };
        qt.addObject(o1);
        var o2 = { pos : new Vec2(397, 76.5), rad : 19 };
        qt.addObject(o2);
        var o3 = { pos : new Vec2(139, 372.5), rad : 15 };
        qt.addObject(o3);
        var o4 = { pos : new Vec2(425, 427.5), rad : 11 };
        qt.addObject(o4);
        var o5 = { pos : new Vec2(439, 339.5), rad : 7 };
        qt.addObject(o5);
        var o6 = { pos : new Vec2(251, 251.5), rad : 9 };
        qt.addObject(o6);
        var o7 = { pos : new Vec2(287, 337.5), rad : 20 };
        qt.addObject(o7);
        var o8 = { pos : new Vec2(335, 294.5), rad : 17 };
        qt.addObject(o8);

        qt.getCollidables(o6).should.eql({ 1 : o1, 2 : o2, 3 : o3, 7 : o7, 8 : o8 });
      });
    });

    context('with object in the middle - D', function() {
      it('should refactor itself', function() {
        var qt = new Quadtree2({
          'size'        : new Vec2(500, 500),
          'objectLimit' : 4
        });

        var o1 = { pos : new Vec2(106, 80.5), rad : 7 };
        qt.addObject(o1);
        var o2 = { pos : new Vec2(345, 86.5), rad : 6 };
        qt.addObject(o2);
        var o3 = { pos : new Vec2(102, 473.5), rad : 2 };
        qt.addObject(o3);
        var o4 = { pos : new Vec2(397, 473.5), rad : 11 };
        qt.addObject(o4);
        var o5 = { pos : new Vec2(425, 441.5), rad : 15 };
        qt.addObject(o5);
        var o6 = { pos : new Vec2(250, 251.5), rad : 20 };
        qt.addObject(o6);
        var o7 = { pos : new Vec2(274, 343.5), rad : 6 };
        qt.addObject(o7);
        var o8 = { pos : new Vec2(326, 340.5), rad : 17 };
        qt.addObject(o8);
        var o9 = { pos : new Vec2(338, 301.5), rad : 20 };
        qt.addObject(o9);

        qt.getCollidables(o6).should.eql({ 1 : o1, 2 : o2, 3 : o3, 7 : o7, 8 : o8, 9 : o9 });
      });
    });

    context('with moving objects', function() {
      it('should refactor itself', function() {
        var qt = new Quadtree2({
          'size'        : new Vec2(500, 500),
          'objectLimit' : 4
        });

        var o1 = { pos : new Vec2(37, 413.5), rad : 4 };
        qt.addObject(o1);
        var o2 = { pos : new Vec2(27, 302.5), rad : 12 };
        qt.addObject(o2);
        var o3 = { pos : new Vec2(185, 320.5), rad : 10 };
        qt.addObject(o3);
        var o4 = { pos : new Vec2(118, 464.5), rad : 12 };
        qt.addObject(o4);
        var o5 = { pos : new Vec2(277, 441.5), rad : 2 };
        qt.addObject(o5);
        var o6 = { pos : new Vec2(364, 191.5), rad : 19 };
        qt.addObject(o6);
        var o7 = { pos : new Vec2(285, 58.5), rad : 14 };
        qt.addObject(o7);
        var o8 = { pos : new Vec2(143, 58.5), rad : 5 };
        qt.addObject(o8);
        var o9 = { pos : new Vec2(51, 101.5), rad : 18 };
        qt.addObject(o9);
        var o10 = { pos : new Vec2(104, 204.5), rad : 9 };
        qt.addObject(o10);
        var o11 = { pos : new Vec2(186, 194.5), rad : 18 };
        qt.addObject(o11);
        var o12 = { pos : new Vec2(386, 316.5), rad : 18 };
        qt.addObject(o12);
        var o13 = { pos : new Vec2(488, 418.5), rad : 20 };
        qt.addObject(o13);
        var o14 = { pos : new Vec2(370, 455.5), rad : 3 };
        qt.addObject(o14);
        o12.pos = new Vec2(394, 333.5);
        o12.pos = new Vec2(394, 333.5);
        qt.updateObject(o12);
        o12.pos = new Vec2(394, 334.5);
        o12.pos = new Vec2(393, 335.5);
        o12.pos = new Vec2(392, 337.5);
        qt.updateObject(o12);
        o12.pos = new Vec2(391, 338.5);
        o12.pos = new Vec2(390, 339.5);
        o12.pos = new Vec2(388, 341.5);
        o12.pos = new Vec2(386, 343.5);
        o12.pos = new Vec2(384, 343.5);
        o12.pos = new Vec2(379, 347.5);
        o12.pos = new Vec2(372, 348.5);
        o12.pos = new Vec2(368, 350.5);
        qt.updateObject(o12);
        o12.pos = new Vec2(364, 352.5);
        o12.pos = new Vec2(362, 352.5);
        o12.pos = new Vec2(362, 353.5);
        o12.pos = new Vec2(360, 353.5);
        o12.pos = new Vec2(358, 355.5);
        o12.pos = new Vec2(354, 358.5);
        o12.pos = new Vec2(350, 361.5);
        qt.updateObject(o12);
        o12.pos = new Vec2(343, 364.5);
        o12.pos = new Vec2(331, 368.5);
        o12.pos = new Vec2(319, 372.5);
        o12.pos = new Vec2(307, 376.5);
        o12.pos = new Vec2(295, 379.5);
        o12.pos = new Vec2(284, 383.5);
        o12.pos = new Vec2(275, 387.5);
        o12.pos = new Vec2(271, 387.5);
        qt.updateObject(o12);
        o12.pos = new Vec2(267, 387.5);
        o12.pos = new Vec2(263, 388.5);
        o12.pos = new Vec2(261, 388.5);
        o12.pos = new Vec2(256, 388.5);
        o12.pos = new Vec2(251, 388.5);
        o12.pos = new Vec2(244, 388.5);
        o12.pos = new Vec2(238, 388.5);
        qt.updateObject(o12);
        o12.pos = new Vec2(232, 388.5);
        o12.pos = new Vec2(225, 388.5);
        o12.pos = new Vec2(217, 388.5);
        o12.pos = new Vec2(210, 390.5);
        o12.pos = new Vec2(205, 390.5);
        o12.pos = new Vec2(204, 390.5);
        o12.pos = new Vec2(203, 390.5);
        qt.updateObject(o12);
        o12.pos = new Vec2(202, 390.5);
        o12.pos = new Vec2(201, 390.5);
        qt.updateObject(o12);
        o12.pos = new Vec2(200, 390.5);
        o12.pos = new Vec2(199, 390.5);
        qt.updateObject(o12);
        o12.pos = new Vec2(201, 390.5);
        o12.pos = new Vec2(202, 390.5);
        o12.pos = new Vec2(203, 390.5);
        o12.pos = new Vec2(206, 389.5);
        qt.updateObject(o12);
        o12.pos = new Vec2(209, 388.5);
        o12.pos = new Vec2(216, 386.5);
        o12.pos = new Vec2(229, 383.5);
        o12.pos = new Vec2(244, 380.5);
        o12.pos = new Vec2(259, 373.5);
        o12.pos = new Vec2(276, 368.5);
        o12.pos = new Vec2(293, 362.5);
        o12.pos = new Vec2(312, 355.5);
        qt.updateObject(o12);
        o12.pos = new Vec2(329, 348.5);
        o12.pos = new Vec2(340, 346.5);
        o12.pos = new Vec2(351, 343.5);
        o12.pos = new Vec2(358, 340.5);
        o12.pos = new Vec2(359, 340.5);
        qt.updateObject(o12);

        qt.getCollidables(o3).should.eql({ 1 : o1, 2 : o2, 4 : o4 });
      });
    });

    context('with moving objects on quadrant corners', function() {
      it('should not remove necessary quadrant', function() {
        var qt = new Quadtree2({
          'size'        : new Vec2(500, 500),
          'objectLimit' : 4
        });

        var o1 = { pos : new Vec2(300, 463.79999542), rad : 16 };
        qt.addObject(o1);
        var o2 = { pos : new Vec2(314, 328.79999542), rad : 4 };
        qt.addObject(o2);
        var o3 = { pos : new Vec2(170, 322.79999542), rad : 6 };
        qt.addObject(o3);
        var o4 = { pos : new Vec2(170, 440.79999542), rad : 3 };
        qt.addObject(o4);
        var o5 = { pos : new Vec2(424, 461.79999542), rad : 4 };
        qt.addObject(o5);
        var o6 = { pos : new Vec2(439, 325.79999542), rad : 18 };
        qt.addObject(o6);
        var o7 = { pos : new Vec2(40, 306.79999542), rad : 14 };
        qt.addObject(o7);
        var o8 = { pos : new Vec2(36, 443.79999542), rad : 4 };
        qt.addObject(o8);
        var o9 = { pos : new Vec2(181, 41.79999542), rad : 17 };
        qt.addObject(o9);
        var o10 = { pos : new Vec2(59, 42.79999542), rad : 13 };
        qt.addObject(o10);
        var o11 = { pos : new Vec2(33, 116.79999542), rad : 17 };
        qt.addObject(o11);
        var o12 = { pos : new Vec2(318, 25.79999542), rad : 7 };
        qt.addObject(o12);
        var o13 = { pos : new Vec2(440, 30.79999542), rad : 2 };
        qt.addObject(o13);
        var o14 = { pos : new Vec2(477, 130.79999542), rad : 1 };
        qt.addObject(o14);

        o9.pos = new Vec2(250, 100);
        qt.updateObject(o9);

        var o15 = { pos : new Vec2(385, 39), rad : 17 };
        qt.addObject(o15);

        o9.pos = new Vec2(250, 270);
        qt.updateObject(o9);

        qt.getCollidables(o9).should.eql({ 2 : o2, 3 : o3 });

        o9.pos = new Vec2(250, 265);
        qt.updateObject(o9);

        qt.getCollidables(o9).should.eql({ 2 : o2, 3 : o3, 10 : o10, 11 : o11 });

        o9.pos = new Vec2(250, 264.79999542);
        qt.updateObject(o9);

        qt.getCollidables(o9).should.eql({ 2 : o2, 3 : o3, 10 : o10, 11 : o11 });
      });
    });
  });
});
