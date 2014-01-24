/*jshint loopfunc: true */

// Helper function for using both in NodeJS and browser.
var injector = function injector(cbBrowser, cbNodeJS){
      if (typeof module !== 'undefined' && typeof module.exports == 'object') {
        return cbNodeJS();
      } else {
        return cbBrowser();
      }
    },

    // Requiring the Vec2 class
    Vec2 =  injector(function() {
              if (!window.Vec2) throw new Error('Vec2 is a requirement');
            },
            function(){
              return require('vec2');
            }),

    // Forward decleration of Quadtree2
    Quadtree2;

Quadtree2 = function Quadtree2(size, limit) {
  var id,

      // Container for private data.
      data = {},

      // Property definitions
      constraints = {
        data : {
          necessary : ['size', 'limit']
        }
      },

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

          if('object' !== typeof size || !(size instanceof Vec2))
            throw new Error('Parameter should be an instance of Vec2');

          data.size_ = size.clone();
        },

        init : function init() {
          var i;

          for(i in constraints.data.necessary) {
            if (data[constraints.data.necessary[i] + '_'] === undefined)
              throw new Error('Can not work without the necessary properties');
          }
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

injector(function () {
  window.Quadtree2 = Quadtree2;
},
function() {
  module.exports = Quadtree2;
});
