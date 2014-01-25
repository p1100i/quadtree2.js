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

Quadtree2 = function Quadtree2(size, limit, idKey) {
  var id,

      // Container for private data.
      data = {
        map_    : {},
        count_  : 0,
        ids_    : 0,
        autoId_ : true,
        inited_ : false,
        limit_  : undefined,
        size_   : undefined,
        meta_   : { shapes : {} }
      },

      // Inserted object keys.
      k = {
        p  : 'pos_',
        r  : 'rad_',
        R  : 'rot_',
        id : 'id_'
      },

      // Validation definitions
      validate = {
        isNumber : function isNumber(param) {
          if ('number' !== typeof param) {
            throw new Error('NaN - Not a Number');
          }
        },

        isString : function isString(param) {
          if (!(typeof param === 'string' || param instanceof String)) {
            throw new Error('NaS - Not a String');
          }
        },

        isVec2 : function isVec2(param) {
          var throwIt = false;

          throwIt = 'object' !== typeof param || !(param instanceof Vec2);
          throwIt = throwIt || param.x === undefined || param.y === undefined;

          if(throwIt) {
            throw new Error('NaV - Not a Vec2');
          }
        },

        isDefined : function isDefined(param) {
          if (param === undefined) {
            throw new Error('ND - Not defined');
          }
        },

        isObject : function isObject(param) {
          if ('object' !== typeof param) {
            throw new Error('NaO - Not an Object');
          }
        },

        isUniqId : function isUniqId(id) {
          if (data.map_[id] !== undefined) {
            throw new Error('OaA - Object already added');
          }
        },

        isNotInited : function isNotInited() {
          if (data.inited_) {
            throw new Error('QaI - Quadtree2 already inited');
          }
        },

        hasKey : function hasKey(obj, key) {
          if ( Object.keys(obj).indexOf(key) === -1 ) {
            throw new Error('OhnK - Object has no key: ' + key);
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

          data.inited_ = true;
        },

        checkInit : function checkInit(init) {
          if (init && !data.inited_) { fns.init(); }
          return data.inited_;
        },

        checkObjectKeys : function checkObjectKeys(obj) {
          validate.isDefined(obj);
          validate.isObject(obj);
          validate.byCallbackObject(obj, constraints.k.necessary, k);

          if (!data.autoId_) {
            validate.isDefined(obj[k.id]);
            validate.isUniqId(obj[k.id]);
          }
        },

        setObjId : function setObjId(obj) {
          if(data.autoId_) {
            obj[k.id] = fns.nextId();
          }
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
          validate.isNotInited();
          if (val === undefined) { return; }

          validate.hasKey(k, key);
          validate.isString(val);

          if (key === 'id') data.autoId_ = false;
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
          fns.setObjId(obj);

          validate.isUniqId(obj[k.id]);

          data.map_[obj[k.id]] = obj;
          data.count_++;
        }
      };


  // Generate public functions.
  for (id in publicFns) {
    this[id] = publicFns[id];
  }

  this.setSize(size);
  this.setLimit(limit);
  this.setObjectKey('id', idKey);
};

injector(function () {
  window.Quadtree2 = Quadtree2;
},
function() {
  module.exports = Quadtree2;
});
