// sketch1 - spin.js 改进版（实例模式）
new p5((p) => {
  let bg1, bg2;
  let bg1Rot, bg2Rot;
  let angle1 = 0;
  let angle2 = 0;
  let order1 = [];
  let order2 = [];
  let dots = [];
  let frameCounter = 0;
  
  const COLS1 = 3;
  const ROWS1 = 3;
  const COLS2 = 2;
  const ROWS2 = 2;
  const DOT_COUNT = 50;
  const MAX_STACK = 200;
  const SHUFFLE_INTERVAL = 4;
  
  let stackCount = 0;

  p.preload = function() {
    try {
      bg1 = p.loadImage("111.png", function() {}, function() {
        console.warn("Failed to load bg1 image");
        bg1 = null;
      });
      bg2 = p.loadImage("999.png", function() {}, function() {
        console.warn("Failed to load bg2 image");
        bg2 = null;
      });
    } catch(e) {
      console.warn("Preload error:", e);
    }
  };

  p.setup = function() {
    let container = document.getElementById('p5-1');
    let w = container.offsetWidth || 500;
    let h = container.offsetHeight || 400;
    p.createCanvas(w, h);
    p.pixelDensity(1);
    p.frameRate(5);
    p.noStroke();

    bg1Rot = p.createGraphics(bg1 ? bg1.width : 500, bg1 ? bg1.height : 400);
    bg2Rot = p.createGraphics(bg2 ? bg2.width : 500, bg2 ? bg2.height : 400);
    bg1Rot.imageMode(p.CENTER);
    bg2Rot.imageMode(p.CENTER);

    initOrderArrays();
    initDots();
    p.background(255);
  };

  function initOrderArrays() {
    order1 = [];
    order2 = [];
    for (let i = 0; i < COLS1 * ROWS1; i++) {
      order1.push(i);
    }
    for (let i = 0; i < COLS2 * ROWS2; i++) {
      order2.push(i);
    }
  }

  function initDots() {
    dots = [];
    for (let i = 0; i < DOT_COUNT; i++) {
      dots.push({
        x: p.random(-p.width, p.width),
        y: p.random(p.height),
        speed: p.random(1, 3),
        r: p.random(5, 15)
      });
    }
  }

  p.draw = function() {
    frameCounter++;

    if (stackCount === 0) {
      p.background(255);
    }

    angle1 += 0.005;
    angle2 -= 0.007;

    updateRotatedBg(bg1, bg1Rot, angle1);
    updateRotatedBg(bg2, bg2Rot, angle2);

    if (frameCounter % SHUFFLE_INTERVAL === 0) {
      p.shuffle(order1, true);
      p.shuffle(order2, true);
    }

    drawTiledLayer(bg1Rot, COLS1, ROWS1, order1, 120);
    drawTiledLayer(bg2Rot, COLS2, ROWS2, order2, 100);
    drawDots();
    applyMosaic(MOSAIC_SIZE);

    stackCount++;
    if (stackCount >= MAX_STACK) {
      stackCount = 0;
    }
  };

  function updateRotatedBg(img, g, angle) {
    if (!img) return;
    g.clear();
    g.push();
    g.translate(g.width / 2, g.height / 2);
    g.rotate(angle);
    g.image(img, 0, 0);
    g.pop();
  }

  function drawTiledLayer(rotImg, cols, rows, orderArr, alphaVal) {
    if (!rotImg) return;

    let tileW = p.width / cols;
    let tileH = p.height / rows;
    let srcW = rotImg.width / cols;
    let srcH = rotImg.height / rows;
    let k = 0;

    p.tint(255, alphaVal);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let idx = orderArr[k++];
        let sx = (idx % cols) * srcW;
        let sy = p.floor(idx / cols) * srcH;
        let dx = c * tileW;
        let dy = r * tileH;

        p.image(rotImg, dx, dy, tileW, tileH, sx, sy, srcW, srcH);
      }
    }

    p.noTint();
  }

  function drawDots() {
    for (let d of dots) {
      let sx = p.constrain(d.x, 0, p.width - 1);
      let sy = p.constrain(d.y, 0, p.height - 1);
      let c = p.get(sx, sy);

      p.fill(c[0], c[1], c[2], 220);
      p.circle(d.x, d.y, d.r * 2);

      d.x += d.speed;

      if (d.x > p.width + d.r) {
        d.x = -d.r;
        d.y = p.random(p.height);
        d.speed = p.random(1, 3);
      }
    }
  }

  function applyMosaic(tileSize) {
    for (let y = 0; y < p.height; y += tileSize) {
      for (let x = 0; x < p.width; x += tileSize) {
        let sx = x + tileSize / 2;
        let sy = y + tileSize / 2;

        sx = p.constrain(sx, 0, p.width - 1);
        sy = p.constrain(sy, 0, p.height - 1);

        let c = p.get(sx, sy);
        p.fill(c[0], c[1], c[2], c[3]);
        p.noStroke();
        p.rect(x, y, tileSize, tileSize);
      }
    }
  }

  p.windowResized = function() {
    let container = document.getElementById('p5-1');
    let w = container ? container.offsetWidth || 500 : 500;
    let h = container ? container.offsetHeight || 400 : 400;
    p.resizeCanvas(w, h);
    // if graphics depend on size, could re-create them here
  };
}, 'p5-1');
