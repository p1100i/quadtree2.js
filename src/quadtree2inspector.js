var
  Vec2 = require('vec2'),
  Quadtree2Inspector;

Quadtree2Inspector = function Quadtree2Inspector(data) {
  var
    qt,
    root,
    idKey,
    config,
    objects,
    objectQuadrants,

    log = '',

    getQuadrantCount = function getQuadrantCount(object) {
      if (object) { return Object.keys(objectQuadrants[object[idKey]]).length; }
      return 1 + root.getChildCount(true);
    },

    getObjectCount = function getObjectCount() {
      return Object.keys(objects).length;
    },

    magnify = function magnify(number, factor) {
      return factor ? factor * number : number;
    },

    stringifyVec2ConstructorCall = function stringifyVec2ConstructorCall(vec, factor) {
      return 'new Vec2(' + magnify(vec.x, factor) + ', ' + magnify(vec.y, factor) + ')';
    },

    stringifyAddObjectCall = function stringifyAddObjectCall(object, factor) {
      var
        command = '',
        posParams = stringifyVec2ConstructorCall(object.pos, factor);

      command += 'o = {\n' +
                 '  pos : ' + posParams + ',\n' +
                 '  rad : ' + magnify(object.rad, factor) + ' \n' +
                 '};\n\n';

      command += 'qt.addObject(o);\n';
      command += 'os[o.id] = o;\n\n';

      return command;
    },

    stringifyRemoveObjectCall = function stringifyRemoveObjectCall(object) {
      return 'qt.removeObjectById(' + object.id + ');\n\n';
    },

    stringifyMoveObjectCall = function stringifyMoveObjectCall(object, position) {
      var
        command = '';

      command += 'o = os[' + object.id + '];\n';
      command += 'o.pos.x = ' + position.x + ';\n';
      command += 'o.pos.y = ' + position.y + ';\n\n';

      return command;
    },

    stringifyUpdateObjectCall = function stringifyUpdateObjectCall(object) {
      return 'qt.updateObjectById(' + object.id + ');\n\n';
    },

    stringifyConstructorCall = function stringifyConstructorCall(factor) {
      var
        command     = 'os = {};\n\n',
        sizeParams  = stringifyVec2ConstructorCall(config.size, factor);

      command += 'qt = new Quadtree2({\n' +
                 '  size         : ' + sizeParams          + ',\n' +
                 '  objectLimit  : ' + config.objectLimit  + ',\n' +
                 '  levelLimit   : ' + config.levelLimit   + ' \n' +
                 '});\n\n';

      return command;
    },

    getRebuildingCommand = function getRebuildingCommand(factor) {
      var
        id,
        object,
        command = stringifyConstructorCall(factor);

      for (id in objects) {
        object    = objects[id];
        command  += stringifyAddObjectCall(object, factor);
      }

      return command;
    },

    addLog = function addLog(message) {
      log += message;
    },

    getLog = function getLog() {
      return stringifyConstructorCall() + log;
    },

    wrapObjectManipulation = function wrapObjectManipulation(fnName, stringifier) {
      var
        self  = this,
        fn    = qt[fnName];

      qt[fnName] = function objectManipulationWrap(object) {
        addLog(stringifier(object));

        fn(object);
      };
    },

    init = function init(data) {
      qt              = data.qt;
      root            = data.root;
      idKey           = data.idKey;
      config          = data.config;
      objects         = data.objects;
      objectQuadrants = data.objectQuadrants;

      wrapObjectManipulation('addObject',     stringifyAddObjectCall);
      wrapObjectManipulation('removeObject',  stringifyRemoveObjectCall);
      wrapObjectManipulation('updateObject',  stringifyUpdateObjectCall);
    };

  init(data);

  this.data                           = data;
  this.addLog                         = addLog;
  this.getLog                         = getLog;
  this.getObjectCount                 = getObjectCount;
  this.getQuadrantCount               = getQuadrantCount;
  this.getRebuildingCommand           = getRebuildingCommand;
  this.stringifyVec2ConstructorCall   = stringifyVec2ConstructorCall;
  this.stringifyAddObjectCall         = stringifyAddObjectCall;
  this.stringifyMoveObjectCall        = stringifyMoveObjectCall;
  this.stringifyUpdateObjectCall      = stringifyUpdateObjectCall;
  this.stringifyConstructorCall       = stringifyConstructorCall;
};

module.exports = Quadtree2Inspector;
