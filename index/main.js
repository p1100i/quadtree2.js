var Main;

Main = function Main() {
  var
    Vec2            = window.Vec2,
    Quadtree2       = window.Quadtree2,
    PIXI            = window.PIXI,
    stage           = new PIXI.Container(),
    graphics        = new PIXI.Graphics(),
    fontScale       = new PIXI.Point(0.5, 0.5),
    fontTranslator  = new Vec2(-4, -8),

    colors = {
      'app' : {
        'background' : 0x353535
      },

      'quadrant' : {
        'text'  : 0xffff00,
        'line'  : 0x00d900
      },

      'object' : {
        'text'  : 0x00ffff,
        'line'  : 0xa3a3a3
      }
    },

    rendererParams  = {
      'backgroundColor' : colors.app.background
    },

    quadtreeParams = {
      'size'        : new Vec2(500, 500),
      'objectLimit' : 4,
      'levelLimit'  : 6
    },

    params = {
      'drawText'  : true,
      'maxRad'    : 30,
      'minRad'    : 10
    },

    renderer        = PIXI.autoDetectRenderer(quadtreeParams.size.x, quadtreeParams.size.y, rendererParams),
    $graphics       = $('#graphics'),
    $logButton      = $('#log-info'),
    $logContent     = $('#log'),
    $actionButton   = $('#action'),
    $actionContent  = $('#action-content'),

    texts = {},

    actions,
    actionObject,
    quadtree,
    inspector,
    updater,
    changed,
    selectedObject,

    setChanged = function setChanged(newChanged) {
      if (newChanged === undefined) {
        newChanged = true;
      }

      changed = !!newChanged;
    },

    toggleStage = function toggleStage() {
      $graphics.toggleClass('hidden');
    },

    toggleLog = function toggleLog() {
      var log = inspector.getLog();

      log = log.replace(/(?:\r\n|\r|\n)/g, '<br />');

      $logContent.toggleClass('hidden').html(log);
    },

    drawText = function drawText(id, body, position, fill) {
      if (texts[id] || !params.drawText) {
        return;
      }

      var
        text = new PIXI.Text(body);

      // position    = position.add(fontTranslator, true);
      text.x      = position.x;
      text.y      = position.y;
      text.scale  = fontScale;
      text.anchor = new PIXI.Point(0.5, 0.5);

      if (fill) {
        text.style  = {
          'fill': fill
        };
      }

      texts[id] = text;

      stage.addChild(text);

      return text;
    },

    drawObject = function drawObject(object) {
      graphics.lineStyle(2, colors.object.line, 1);

      graphics.drawCircle(object.pos.x, object.pos.y, object.rad);

      drawText('o' + object.id, object.id, object.pos, colors.object.text);
    },

    drawQuadrant = function drawQuadrant(quadrant) {
      graphics.lineStyle(2, colors.quadrant.line, 0.3);

      graphics.moveTo(quadrant.leftTop_.x,  quadrant.leftTop_.y);
      graphics.lineTo(quadrant.rightTop_.x, quadrant.rightTop_.y);
      graphics.lineTo(quadrant.rightBot_.x, quadrant.rightBot_.y);
      graphics.lineTo(quadrant.leftBot_.x,  quadrant.leftBot_.y);
      graphics.lineTo(quadrant.leftTop_.x,  quadrant.leftTop_.y);

      drawText('q' + quadrant.id_, quadrant.id_, quadrant.center_, colors.quadrant.text);
    },

    getQuadrants = function getQuadrants() {
      return inspector.data.root.getChildren(true, [inspector.data.root]);
    },

    getObjects = function getObjects() {
      var
        result = {
          'objects'   : {},
          'quadrants' : {}
        };

      inspector.data.root.getObjectsDown(result);

      return result && result.objects || {};
    },

    drawObjects = function drawObjects() {
      var
        id,
        objects = getObjects();

      for (id in objects) {
        drawObject(objects[id]);
      }
    },

    drawQuadrants = function drawQuadrants() {
      var
        id,
        quadrants = getQuadrants();

      for (id in quadrants) {
        drawQuadrant(quadrants[id]);
      }
    },

    clearTexts = function clearTexts() {
      var
        text,
        textId;

      for (textId in texts) {
        text = texts[textId];

        stage.removeChild(text);
        text.destroy();

        delete texts[textId];
      }
    },

    clearGraphics = function clearGraphics() {
      graphics.clear();
    },

    clear = function clear() {
      clearGraphics();
      clearTexts();
    },

    redraw = function redraw() {
      clear();

      drawQuadrants();
      drawObjects();

      renderer.render(stage);
    },

    update = function update() {
      if (changed) {
        redraw();
        setChanged(false);
      }
    },

    getQuadtree = function getQuadtree() {
      return quadtree;
    },

    setQuadtree = function setQuadtree(newQuadtree) {
      clear();

      quadtree  = newQuadtree;
      inspector = quadtree.inspect();

      setChanged();
    },

    vectorFromMouseEvent = function vectorFromMouseEvent(e) {
      var off = $graphics.parent().offset(); 

      return new Vec2(e.pageX - off.left, e.pageY - off.top);
    },

    getClosestObject = function getClosestObject(position) {
      var
        id,
        closest,
        closestObject,
        object,
        distance,
        objects = getObjects();

      for (id in objects) {
        object    = objects[id];
        distance  = object.pos.distance(position);

        if (distance < closest || closest === undefined) {
          closest       = distance;
          closestObject = object;
        }

      }

      return closestObject;
    },

    addObject = function addObject(position) {
      quadtree.addObject({
        'pos' : position,
        'rad' : Math.floor(Math.max(Math.random() * params.maxRad, params.minRad)) 
      });

      setChanged();
    },

    removeObject = function removeObject(position) {
      var
        closestObject = getClosestObject(position);

      if (!closestObject) {
        return;
      }

      quadtree.removeObject(closestObject)

      setChanged();
    },

    moveObject = function moveObject(object, position) {
      var log = inspector.stringifyMoveObjectCall(object, position);

      inspector.addLog(log);

      object.pos.x = position.x;
      object.pos.y = position.y;

      quadtree.updateObject(object);

      setChanged();
    },

    setSelectedObject = function setSelectedObject(position) {
      if (selectedObject || !position) {
        selectedObject = undefined;
        return;
      }

      selectedObject = getClosestObject(position);
    },

    toggleSelectedObject = function toggleSelectedObject(position) {
      setSelectedObject(position);
    },

    setNextAction = function setNextAction(newActionIndex) {
      var
        actionIndex;

      if (newActionIndex === undefined) {
        actionIndex = (actions.indexOf(actionObject) + 1) % actions.length;
      } else {
        actionIndex = newActionIndex;
      }

      actionObject = actions[actionIndex];

      $actionContent.text(actionObject.title);
    }

    onMouseClickGraphics = function onMouseClickGraphics(e) {
      var
        mouseVec = vectorFromMouseEvent(e);

      actionObject.handler(mouseVec);
    },

    onMouseMoveGraphics = function onMouseMoveGraphics(e) {
      var
        mouseVec = vectorFromMouseEvent(e);

      if (selectedObject) {
        moveObject(selectedObject, mouseVec);
      }
    },

    onMouseOutGraphics = function onMouseOutGraphics() {
      setSelectedObject(false);
    },

    onMouseClickAction = function onMouseClickAction() {
      setNextAction();
    },

    init = function init() {
      $graphics.on('mousemove',   onMouseMoveGraphics);
      $graphics.on('mouseout',    onMouseOutGraphics);
      $graphics.on('click',       onMouseClickGraphics);
      $actionButton.on('click',   onMouseClickAction);
      $logButton.on('click',      toggleLog);

      // Set up graphics and append stuff to stage.
      $graphics.append(renderer.view);
      renderer.view.style.display = 'block';
      stage.addChild(graphics);

      toggleStage();

      setQuadtree(new Quadtree2(quadtreeParams));

      // Start the updater.
      updater = setInterval(update, 60);

      actions = [
        {
          'title'   : 'add',
          'handler' : addObject
        },

        {
          'title'   : 'remove',
          'handler' : removeObject
        },

        {
          'title'   : 'move',
          'handler' : toggleSelectedObject
        },
      ];

      setNextAction(0);
    };

  this.setQuadtree  = setQuadtree;
  this.getQuadtree  = getQuadtree;
  this.clear        = clear;

  init();
};

window.onload = function onload() {
  window.main = new Main();
};
