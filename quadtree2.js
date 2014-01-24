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
      data = { map_ : {}, count_ : 0 },

      // Property definitions
      constraints = {
        data : {
          necessary : ['size', 'limit']
        }
      },

      // Private function definitions
      fns = {
        init : function init() {
          var i;

          for(i in constraints.data.necessary) {
            if (data[constraints.data.necessary[i] + '_'] === undefined)
              throw new Error('Can not work without the necessary properties');
          }
        },

        checkInit : function checkInit() {
          if (!data.inited_) fns.init();
        }
      },

      // Public function definitions
      publicFns = {
        getLimit : function getLimit(){
          return data.limit_;
        },

        setLimit : function setLimit(limit){
          if (limit === undefined) return;

          if ('number' !== typeof limit)
            throw new Error('Parameter should be a number');

          data.limit_ = limit;
        },

        getCount : function getCount() {
          return data.count_;
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

        addRect : function addRect(id, origin, size, rotation) {
          fns.checkInit();
          data.count_++;
        },

        addCircle : function addCircle(id, origin, radius) {
          fns.checkInit();
          throw new Error('Not implemented');
        }
      };


  // Generate initialization functions.
  for (id in publicFns) {
    this[id] = publicFns[id];
  }

  this.setSize(size);
  this.setLimit(limit);
};

injector(function () {
  window.Quadtree2 = Quadtree2;
},
function() {
  module.exports = Quadtree2;
});
