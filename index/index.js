window.onload = function () {
  app = {
    w_              : 500,
    h_              : 500,
    limit_          : 4,
    chance_         : 50,
    addChance_      : 70,
    closestObj_     : null,
    oldClosestObj_  : null,
    movedObj_       : null,
    change_         : false,
    autoAdd_        : true,
    mouseAction_    : 0,
    objCount_       : 0,
    quadCount_      : 0,
    objects_        : {},
    rerender_       : false,
    $app            : document.getElementById('app'),
    $autoAdd        : document.getElementById('app-autoAdd'),
    $autoAdd_       : document.getElementById('app-autoAdd_'),
    $mouseAction    : document.getElementById('app-mouseAction'),
    $mouseAction_   : document.getElementById('app-mouseAction_'),
    $graphics_      : document.getElementById('app-graphics_'),
    $objCount_      : document.getElementById('app-objCount_'),
    $quadCount_     : document.getElementById('app-quadCount_')
  };

  app.qt        = new Quadtree2(new Vec2(app.w_, app.h_), app.limit_, undefined, true);
  app.renderer  = PIXI.autoDetectRenderer(app.w_, app.h_);
  app.stage     = new PIXI.Stage(0x353535, true);
  app.graphics  = new PIXI.Graphics();

  app.mouseActionTranslation = function mouseActionTranslation() {
    return {
      0 : 'add',
      1 : 'remove',
      2 : 'move'
    }[app.mouseAction_];
  };

  app.getClosestObjectToPoint = function getClosestObjectToPoint(point) {
    var id,
        obj,
        dist,
        firstKey    = Object.keys(app.objects_)[0],
        closestObj  = firstKey && app.objects_[firstKey],
        closestDist = !closestObj || closestObj.pos_.distance(point);

    if (!closestObj) { return; }

    for (id in app.objects_) {
      obj   = app.objects_[id];
      dist  = obj.pos_.distance(point);
      if (dist < closestDist) {
        closestDist = dist;
        closestObj = obj;
      }
    }

    return closestObj;
  };

  app.handleMouseClick = function handleMouseClick(e) {
    var point = new Vec2(e.offsetX, e.offsetY);

    switch (app.mouseAction_) {

    case 0:
      app.addObject({ pos_ : point, rad_ : ~~(Math.random() * 4) + 1 });
      break;
    case 1:
      app.removeObject(app.closestObj_);
      break;
    case 2:
      app.movedObj_       = app.movedObj_ ? null : app.closestObj_;
      app.movedObj_.pos_  = point;
      // TODO Add drag.
      break;
    }

    app.change();
    e.stopPropagation();
  };

  app.handleMouseMove = function handleMouseMove(e) {
    var point = new Vec2(e.offsetX, e.offsetY);

    app.closestObj_ = app.getClosestObjectToPoint(point);

    if (app.movedObj_) {
      app.movedObj_.pos_ = point;
    }

    if (app.oldClosestObj_ && app.oldClosestObj_ != app.closestObj_) {
      app.oldClosestObj_.c_ = undefined;
      app.closestObj_.c_ = '0xee2323';
    }

    app.oldClosestObj_ = app.closestObj_;

    app.change();
  };

  app.update = function update() {
    if (app.autoAdd_) {
      app.addObject();
    }

    if (app.change_) {
      app.info();
      app.redraw();
      if (app.movedObj_) {
        app.qt.updateObject(app.movedObj_);
      }
      if (app.movedObj_) {
      }
      app.change_ = false;
    }

    app.renderer.render(app.stage);
  };

  app.info = function info() {
    app.quadCount_ = app.qt.getQuadrantCount();
    app.objCount_  = app.qt.getQuadrantObjectCount();

    app.$objCount_.innerHTML    = app.objCount_;
    app.$quadCount_.innerHTML   = app.quadCount_;
    app.$autoAdd_.innerHTML     = app.autoAdd_;
    app.$mouseAction_.innerHTML = app.mouseActionTranslation();
  };

  app.redraw = function redraw() {
    app.graphics.clear();
    app.qt.getQuadrants().forEach(function(quadrant){
      app.drawQuadrant(quadrant);
    });
  };

  app.createRandomObject = function createRandomObject() {
    var s = app.qt.getSize();
    return {
      pos_ : new Vec2(~~(Math.random() * s.x), ~~(Math.random() * s.y)),
      rad_ : ~~(Math.random() * 4) + 1
    };
  };

  app.change = function change(key) {
    if(key) app[key+'_'] = !app[key+'_'];
    app.change_ = true;
  };

  app.chance = function chance(percent) {
    return Math.random() * 100 < ( percent || app.chance_ );
  };

  app.addObject = function addObject(obj) {
    if(obj || app.chance(app.addChance_)) {
      obj = obj || app.createRandomObject();
      app.qt.addObject(obj);
      app.objects_[obj.id_] = obj;
      app.change();
    }
  };

  app.removeObject = function removeObject(obj) {
    app.qt.removeObject(obj);
    delete app.objects_[obj.id_];
    app.change();
  };

  app.drawQuadrant = function drawQuadrant(quadrant) {
    var id, o;
    app.graphics.lineStyle(2, 0x00d900, 1);
    app.graphics.moveTo(quadrant.leftTop_.x,  quadrant.leftTop_.y);
    app.graphics.lineTo(quadrant.rightTop_.x, quadrant.rightTop_.y);
    app.graphics.lineTo(quadrant.rightBot_.x, quadrant.rightBot_.y);
    app.graphics.lineTo(quadrant.leftBot_.x,  quadrant.leftBot_.y);
    app.graphics.lineTo(quadrant.leftTop_.x,  quadrant.leftTop_.y);
    for (id in quadrant.objects_) {
      o = quadrant.objects_[id];
      app.graphics.lineStyle(2, o.c_ || 0xd3d3d3, 1);
      app.graphics.drawCircle(o.pos_.x, o.pos_.y, o.rad_);
    }
  };

  app.autoAdd = function autoAdd() {
    app.change('autoAdd');
  };

  app.mouseAction = function mouseAction() {
    app.mouseAction_++;
    app.mouseAction_ = app.mouseAction_ % 3;
    app.change();
  };

  app.start = function start() {
    app.$graphics_.appendChild(app.renderer.view);
    app.qt.debug(true);
    app.renderer.view.style.display = 'block';
    app.stage.addChild(app.graphics);
    app.rerender_ = setInterval(function(){ app.update(); }, 60);
    app.$autoAdd.onclick       = app.autoAdd;
    app.$mouseAction.onclick   = app.mouseAction;
    app.$graphics_.onclick     = app.handleMouseClick;
    app.$graphics_.onmousemove = app.handleMouseMove;
  };

  app.start();
  app.redraw();

};
