var Quadtree2Helper = require('../src/quadtree2helper'),
    assert          = require('assert'),
    should          = require('should'),
    shortArr        = [3,1,2],
    shortSortedArr  = [1,2,3],
    longArr         = [5,6,7,4,3,8,9],
    longSortedArr   = [3,4,5,6,7,8,9];

describe('Quadtree2Helper', function(){
  describe('.arrayDiffs', function(){
    context('with two empty arrays', function() {
      it('should return an array of two empty array', function() {
        Quadtree2Helper.arrayDiffs([], []).should.eql([[], []]);
      });
    });

    context('with arrays of same content', function() {
      it('should return an array of two empty array', function() {
        Quadtree2Helper.arrayDiffs(shortSortedArr, shortArr).should.eql([[], []]);
      });

      it('should return an array of two empty array', function() {
        Quadtree2Helper.arrayDiffs(longSortedArr, longArr).should.eql([[], []]);
      });
    });

    context('with arrays of different content', function() {
      it('should return only the different content', function() {
        Quadtree2Helper.arrayDiffs(shortSortedArr, [1]).should.eql([[2,3], []]);
      });

      it('should return only the different content', function() {
        Quadtree2Helper.arrayDiffs(shortSortedArr, longArr).should.eql([[1,2], [4,5,6,7,8,9]]);
      });

      it('should return only the different content', function() {
        Quadtree2Helper.arrayDiffs(longArr, [9, 5, 1, 10]).should.eql([[3,4,6,7,8], [1, 10]]);
      });
    });
  });
});
