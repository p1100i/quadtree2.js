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
        shapes_ : {}
      },

      // Inserted object keys.
      k = {
        p  : 'pos_',
        r  : 'rad_',
        R  : 'rot_',
        id : 'id_'
      },

      // A verbose exception generator helper.
      thrower = function thrower(code, message, key) {
        var error = code;

        if(key)             { error += '_' + key; }
        if(message)         { error += ' - '; }
        if(message && key)  { error += key + ': '; }
        if(message)         { error += message; }

        throw new Error(error);
      },

      // Validation definitions
      validate = {
        isNumber : function isNumber(param, key) {
          if ('number' !== typeof param) {
            thrower('NaN', 'Not a Number', key);
          }
        },

        isString : function isString(param, key) {
          if (!(typeof param === 'string' || param instanceof String)) {
            thrower('NaS', 'Not a String', key);
          }
        },

        isVec2 : function isVec2(param, key) {
          var throwIt = false;

          throwIt = 'object' !== typeof param || !(param instanceof Vec2);
          throwIt = throwIt || param.x === undefined || param.y === undefined;

          if(throwIt) {
            thrower('NaV', 'Not a Vec2', key);
          }
        },

        isDefined : function isDefined(param, key) {
          if (param === undefined) {
            thrower('ND', 'Not defined', key);
          }
        },

        isObject : function isObject(param, key) {
          if ('object' !== typeof param) {
            thrower('NaO', 'Not an Object', key);
          }
        },

        isUniqId : function isUniqId(id, key) {
          if (data.map_[id] !== undefined) {
            thrower('OaA', 'Object already added', key);
          }
        },

        isNotInited : function isNotInited(key) {
          if (data.inited_) {
            thrower('QaI', 'Quadtree2 already inited', key);
          }
        },

        hasKey : function hasKey(obj, k, key) {
          if ( Object.keys(obj).indexOf(k) === -1 ) {
            thrower('OhnK', 'Object has no key: ' + k, key);
          }
        },

        byCallbackObject : function byCallbackObject(obj, cbObj, keyTable) {
          var key;
          for (key in cbObj) {
            if (keyTable !== undefined) {
              cbObj[key](obj[keyTable[key]], keyTable[key]);
            } else {
              cbObj[key](obj[key], key);
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

          c : {
            necessary : {
              r : validate.isNumber
            },
          },

          r : {
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
          validate.isDefined(obj[k.id], k.id);
          validate.isUniqId(obj[k.id], obj[k.id]);

          validate.byCallbackObject(obj, constraints.k.necessary, k);

          validate.byCallbackObject(
            obj,
            constraints.k[fns.getObjShape(obj)].necessary,
            k
          );
        },

        setObjId : function setObjId(obj) {
          if (data.autoId_) {
            obj[k.id] = fns.nextId();
          }
        },

        setObjShape : function setObjShape(obj) {
          var rect = obj[k.r] === undefined,
              key  = rect ? k.R : k.r;

          validate.isDefined(obj[key], key);

          data.shapes_[obj[k.id]] = rect ? 'r' : 'c';
        },

        getObjShape : function getObjShape(obj) {
          return data.shapes_[obj[k.id]];
        }
      },

      // Public function definitions
      publicFns = {
        getLimit : function getLimit() {
          return data.limit_;
        },

        setLimit : function setLimit(limit) {
          if (limit === undefined) { return; }

          validate.isNumber(limit, 'limit_');

          data.limit_ = limit;
        },

        getCount : function getCount() {
          return data.count_;
        },

        setObjectKey : function setObjectKey(key, val) {
          validate.isNotInited();
          if (val === undefined) { return; }

          validate.hasKey(k, key, key);
          validate.isString(val, key);

          if (key === 'id') data.autoId_ = false;
          k[key] = val;
        },

        getSize : function getSize() {
          return data.size_.clone();
        },

        setSize : function setSize(size) {
          if (size === undefined) { return; }

          validate.isVec2(size, 'size_');

          data.size_ = size.clone();
        },

        addObject : function addObject(obj) {
          validate.isDefined(obj, 'obj');
          validate.isObject(obj, 'obj');

          fns.checkInit(true);
          fns.setObjId(obj);
          fns.setObjShape(obj);
          fns.checkObjectKeys(obj);

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
