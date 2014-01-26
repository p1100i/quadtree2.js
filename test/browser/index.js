window.onload = function () {
  app = {
    w : 500,
    h : 500,
    limit  : 4,
    chance : 10,
    $objCount   : document.getElementById('objcount'),
    $quadCount  : document.getElementById('quadcount')
  };

  app.qt        = new Quadtree2(new Vec2(app.w, app.h), app.limit, undefined, true);
  app.renderer  = PIXI.autoDetectRenderer(app.w, app.h);
  app.stage     = new PIXI.Stage(0xEFEFEF, true);
  app.graphics  = new PIXI.Graphics();

  app.update = function update() {
    app.addObjectRandomly(app.chance);
    if (app.change) {
      app.info();
      app.redraw();
      app.change = false;
    }
    app.renderer.render(app.stage);
  };

  app.info = function info() {
    app.$objCount.innerHTML = 'Objects: ' + app.qt.getQuadrantObjectCount();
    app.$quadCount.innerHTML = 'Quadrants: ' + app.qt.getQuadrantCount();
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

  app.addObjectRandomly = function addObjectRandomly(chance) {
    if(Math.random() * 100 < chance){
      app.qt.addObject(app.createRandomObject());
      app.change = true;
    }
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

  app.start = function start() {
    document.body.appendChild(app.renderer.view);
    app.qt.debug(true);
    app.renderer.view.style.display = 'block';
    app.stage.addChild(app.graphics);
    app.rerender = setInterval(function(){ app.update() }, 60);

  };

  app.start();
  app.redraw();
}
