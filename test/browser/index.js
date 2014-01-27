window.onload = function () {
  app = {
    w_          : 500,
    h_          : 500,
    limit_      : 4,
    chance_     : 50,
    addChance_  : 70,
    moveChance_ : 10,
    movedObj_   : null,
    change_     : false,
    autoAdd_    : true,
    autoMove_   : false,
    objCount_   : 0,
    quadCount_  : 0,
    rerender_   : false,
    $autoAdd    : document.getElementById('app-autoAdd'),
    $autoAdd_   : document.getElementById('app-autoAdd_'),
    $autoMove   : document.getElementById('app-autoMove'),
    $autoMove_  : document.getElementById('app-autoMove_'),
    $movedObj   : document.getElementById('app-movedObj'),
    $movedObj_  : document.getElementById('app-movedObj_'),
    $graphics_  : document.getElementById('app-graphics_'),
    $objCount_  : document.getElementById('app-objCount_'),
    $quadCount_ : document.getElementById('app-quadCount_')
  };

  app.qt        = new Quadtree2(new Vec2(app.w_, app.h_), app.limit_, undefined, true);
  app.renderer  = PIXI.autoDetectRenderer(app.w_, app.h_);
  app.stage     = new PIXI.Stage(0xEFEFEF, true);
  app.graphics  = new PIXI.Graphics();

  app.update = function update() {
    if (app.autoAdd_) {
      app.addObjectRandomly();
    }

    if (app.autoMove_) {
      app.addAndMoveObject();
    }

    if (app.change_) {
      app.info();
      app.redraw();
      app.change_ = false;
      if (app.autoMove_ && app.movedObj_) {
        app.qt.updateObjects([app.movedObj_.id_]);
      }
    }

    app.renderer.render(app.stage);
  };

  app.info = function info() {
    app.quadCount_ = app.qt.getQuadrantCount();
    app.objCount_  = app.qt.getQuadrantObjectCount();

    app.$objCount_.innerHTML  = app.objCount_;
    app.$quadCount_.innerHTML = app.quadCount_;
    app.$autoAdd_.innerHTML   = app.autoAdd_;
    app.$autoMove_.innerHTML  = app.autoMove_;
  }

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
    }
  };

  app.change = function change(key) {
    if(key) app[key+'_'] = !app[key+'_'];
    app.change_ = true;
  };

  app.chance = function chance(chance) {
    return Math.random() * 100 < ( chance || app.chance_ );
  };

  app.addObjectRandomly = function addObjectRandomly() {
    if(app.chance(app.addChance_)) {
      app.qt.addObject(app.createRandomObject());
      app.change();
    }
  };

  app.addAndMoveObject = function addAndMoveObject() {
    if(!app.movedObj_) { return; }
    app.movedObj_.pos_.x++;
    app.movedObj_.pos_.y++;
    app.change();
  };

  app.movedObj = function movedObj() {
    app.movedObj_ = app.createRandomObject();
    app.qt.addObject(app.movedObj_);
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
      app.graphics.lineStyle(2, 0xee2900, 1);
      app.graphics.drawCircle(o.pos_.x, o.pos_.y, o.rad_);
    }
  };

  app.autoAdd = function autoAdd() {
    app.change('autoAdd');
  };

  app.autoMove = function autoMove() {
    app.change('autoMove');
  };

  app.start = function start() {
    app.$graphics_.appendChild(app.renderer.view);
    app.qt.debug(true);
    app.renderer.view.style.display = 'block';
    app.stage.addChild(app.graphics);
    app.rerender_ = setInterval(function(){ app.update() }, 60);
    app.$autoAdd.onclick = app.autoAdd;
    app.$autoMove.onclick = app.autoMove;
    app.$movedObj.onclick = app.movedObj;
  };

  app.start();
  app.redraw();
}
