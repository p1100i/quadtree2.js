/*jshint loopfunc: true */
var Vec2 = require('vec2'),
    Quadtree2;

Quadtree2 = function Quadtree2(size, limit) {
  var id,

      // Container for private data.
      data = {},

      // Functions will be exported without init check.
      initFns = {
        getLimit : function getLimit(){
          return data.limit_;
        },

        setLimit : function setLimit(limit){
          if (limit === undefined) return;

          if ('number' !== typeof limit)
            throw new Error('Parameter should be a number');

          data.limit_ = limit;
        },

        getSize : function getSize(){
          return data.size_.clone();
        },

        setSize : function setSize(size){
          if (size === undefined) return;

          if (!(size instanceof Vec2))
            throw new Error('Parameter should be an instance of Vec2');

          data.size_ = size.clone();
        },

        init : function init() {
          // TODO should check every property is set.
        }
      },

      // Functions will be exported together with init check.
      runFns = {
        addObject : function addObject(id){
          // TODO implement me!
        }
      };

  initFns.setSize(size);
  initFns.setLimit(limit);

  for (id in initFns) {
    this[id] = initFns[id];
  }

  for (id in runFns) {
    this[id] = function() {
      if (!data.inited_) this.init();
      runFns[id].apply(this, arguments);
    };
  }
};

module.exports = Quadtree2;
