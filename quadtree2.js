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
              if (!window.Vec2) { throw new Error('Vec2 is a requirement'); }
              return window.Vec2;
            },
            function(){
              return require('vec2');
            }),

    // Forward decleration of Quadtree2
    Quadtree2;

Quadtree2 = function Quadtree2(size, limit) {
  var id,

      // Inserted object keys.
      k = {
        p  : 'pos_',
        r  : 'rad_',
        R  : 'rot_',
        id : false
      },

      // Validation definitions
      validate = {
        isNumber : function isNumber(param) {
          if ('number' !== typeof param) {
            throw new Error('NaN - not a Number');
          }
        },

        isString : function isString(param) {
          if (typeof val !== 'string') {
            throw new Error('NaS - not a String');
          }
        },

        isVec2 : function isVec2(param) {
          if ('object' !== typeof param || !(param instanceof Vec2)) {
            throw new Error('NaV - not a Vec2');
          }
        },

        isDefined : function isDefined(param) {
          if (param === undefined) {
            throw new Error('ND - not defined');
          }
        },

        isObject : function isObject(param) {
          if ('object' !== typeof param) {
            throw new Error('NaO - not an Object');
          }
        },

        hasKey : function hasKey(obj, key) {
          if ( Object.keys(obj).indexOf(key) === -1 ) {
            throw new Error('HNK - has no key: ' + key);
          }
        },

        byCallbackObject : function byCallbackObject(obj, cbObj, keyTable) {
          var key;
          for (key in cbObj) {
            if (keyTable !== undefined) {
              cbObj[key](obj[keyTable[key]]);
            } else {
              cbObj[key](obj[key]);
            }
          }
        }
      },

      // Container for private data.
      data = { map_ : {}, count_ : 0, ids_ : 0, meta_ : { shapes : {} } },

      // Property definitions.
      constraints = {
        data : {
          necessary : {
            size_  : validate.isVec2,
            limit_ : validate.isNumber
          }
        },

        k : {
          necessary : {
            p : validate.isVec2
          },

          circle : {
            necessary : {
              r : validate.isNumber
            },
          },

          rect : {
            necessary : {
              R : validate.isNumber
            },
          }
        }
      },

      // Private function definitions.
      fns = {
        nextId : function nextId() {
          return ++data.ids_;
        },

        init : function init() {
          validate.byCallbackObject(data, constraints.data.necessary);
        },

        checkInit : function checkInit(init) {
          if (init && !data.inited_) { fns.init(); }
          return data.inited_;
        },

        checkObjectKeys : function checkObjectKeys(obj) {
          validate.isDefined(obj);
          validate.isObject(obj);
          validate.byCallbackObject(obj, constraints.k.necessary, k);

          if (k.id) { validate.isNumber(obj[k.id]); }
        }
      },

      // Public function definitions
      publicFns = {
        getLimit : function getLimit() {
          return data.limit_;
        },

        setLimit : function setLimit(limit) {
          if (limit === undefined) { return; }

          validate.isNumber(limit);

          data.limit_ = limit;
        },

        getCount : function getCount() {
          return data.count_;
        },

        setObjectKey : function setObjectKey(key, val) {
          validate.hasKey(k, key);
          validate.isString(k, val);

          k[key] = val;
        },

        getSize : function getSize() {
          return data.size_.clone();
        },

        setSize : function setSize(size) {
          if (size === undefined) { return; }

          validate.isVec2(size);

          data.size_ = size.clone();
        },

        addObject : function addObject(obj) {
          fns.checkInit(true);
          fns.checkObjectKeys(obj);
          data.count_++;
        }
      };


  // Generate public functions.
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
