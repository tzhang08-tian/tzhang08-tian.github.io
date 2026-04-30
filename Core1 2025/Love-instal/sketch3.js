// sketch3 - map.js 改进版（实例模式）
new p5((p) => {
  let W, H;
  let TILE = 7;
  let cols, rows;
  let bg = [];
  let revealed = [];
  let frontier = [];
  let whiteColors, greens, yellowGreens, reds;
  let edgeBrown;
  let deepStripeColors;
  let allRevealed = false;
  let lastRefreshTime = 0;
  const refreshInterval = 8000; // 8秒自动刷新
  // 新增：控制只在完成揭示后安排一次刷新
  let refreshScheduled = false;

  // 新增：树条纹区域的格子记录与蓝点
  let treeStripeCells = [];
  let blueDots = [];
  const BLUE_DOT_COUNT_MAX = 40;     // 总蓝点上限（密度不大）
  const BLUE_DOT_MIN_DIST = 14;      // 点之间的最小距离（像素）
  const BLUE_DOT_RADIUS = 3;         // 半径
  const BLUE_DOT_ALPHA = 200;        // 透明度

  p.setup = function() {
    let container = document.getElementById('p5-3');
    W = container.offsetWidth;
    H = container.offsetHeight;
    
    p.createCanvas(W, H);
    p.noStroke();
    p.pixelDensity(1);
    p.frameRate(30);

    cols = p.floor(W / TILE);
    rows = p.floor(H / TILE);

    whiteColors = [
      p.color(255, 255, 240),
      p.color(245, 245, 230),
      p.color(224, 235, 255),
      p.color(200, 246, 255)
    ];

    greens = [
      p.color(40, 60, 35),
      p.color(60, 85, 45),
      p.color(90, 120, 65),
      p.color(125, 150, 100)
    ];

    yellowGreens = [
      p.color(180, 175, 120),
      p.color(195, 190, 140),
      p.color(210, 205, 160),
      p.color(225, 220, 175)
    ];

    reds = [
      p.color(150, 70, 30),
      p.color(190, 110, 55)
    ];

    edgeBrown = p.color(150, 80, 30);

    deepStripeColors = [
      p.color(9, 56, 22),
      p.color(2, 29, 9),
      p.color(32, 64, 6)
    ];

    for (let r = 0; r < rows; r++) {
      bg[r] = [];
      revealed[r] = [];
      for (let c = 0; c < cols; c++) {
        revealed[r][c] = false;
      }
    }
    frontier = [];
    allRevealed = false;

    generateBackground();
    generateTreeStripe();
    generateDarkStripe();
    generateCenterBlobs();

    // 新增：根据树条纹区域生成蓝点
    rebuildBlueDots();

    lastRefreshTime = p.millis();
  };

  p.draw = function() {
    p.background(255);

    if (!allRevealed) {
      expandRandomFromEllipses();
    }

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (revealed[r][c]) {
          p.fill(bg[r][c]);
        } else {
          p.fill(0);
        }
        p.rect(c * TILE, r * TILE, TILE, TILE);
      }
    }

    // 新增：绘制树条纹区域的零散蓝色点
    p.noStroke();
    p.fill(30, 120, 255, BLUE_DOT_ALPHA);
    for (const d of blueDots) {
      p.circle(d.x, d.y, BLUE_DOT_RADIUS * 2);
    }

    if (allRevealed) {
      p.noLoop();
    }
  };

  function expandRandomFromEllipses() {
    let maxNew = 2000;
    let created = 0;

    if (frontier.length === 0) {
      allRevealed = true;
      // 新增：仅在完成揭示后安排一次延时刷新
      if (!refreshScheduled) {
        refreshScheduled = true;
        setTimeout(() => {
          doRefresh();
        }, refreshInterval);
      }
      return;
    }

    for (let i = 0; i < maxNew; i++) {
      if (frontier.length === 0) break;

      let idx = p.floor(p.random(frontier.length));
      let cell = frontier[idx];
      let r = cell[0];
      let c = cell[1];

      let neighbors = [
        [1, 0], [-1, 0], [0, 1], [0, -1],
        [1, 1], [1, -1], [-1, 1], [-1, -1]
      ];

      let dir = p.random(neighbors);
      let nr = r + dir[0];
      let nc = c + dir[1];

      if (
        nr >= 0 && nr < rows &&
        nc >= 0 && nc < cols &&
        !revealed[nr][nc]
      ) {
        revealed[nr][nc] = true;
        frontier.push([nr, nc]);
        created++;
      }

      if (p.random() < 0.05) {
        frontier.splice(idx, 1);
      }
    }

    if (created === 0 && frontier.length === 0) {
      allRevealed = true;
      // 新增：在这一分支也安排一次延时刷新
      if (!refreshScheduled) {
        refreshScheduled = true;
        setTimeout(() => {
          doRefresh();
        }, refreshInterval);
      }
    }
  }

  // 新增：封装一次刷新流程，只在揭示完成后调用
  function doRefresh() {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        revealed[r][c] = false;
      }
    }
    frontier = [];
    allRevealed = false;

    generateBackground();
    generateTreeStripe();
    generateDarkStripe();
    generateCenterBlobs();

    rebuildBlueDots();

    refreshScheduled = false;
    lastRefreshTime = p.millis();
    p.loop();
  }

  function generateBackground() {
    let scale = 0.02;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let n = p.noise(c * scale, r * scale);

        if (n < 0.50) {
          bg[r][c] = pickGreen(c, r);
        } else if (n < 0.80) {
          bg[r][c] = p.random(yellowGreens);
        } else if (n < 0.84) {
          bg[r][c] = p.random(reds);
        } else {
          bg[r][c] = pickGreen(c, r);
        }
      }
    }
  }

  function pickGreen(c, r) {
    let idx = p.floor(p.random(4));
    let contiguous = (p.random() < 0.9);

    if (contiguous) {
      let gNoise = p.noise(c * 0.04, r * 0.04);
      if (gNoise < 0.55) {
        return greens[idx];
      } else {
        return greens[(idx + 1) % 4];
      }
    } else {
      return p.random(greens);
    }
  }

  function generateDarkStripe() {
    let steps = 200 + p.random(500);
    let thickness = p.random(4, 15);

    let x = p.random(cols);
    let y = p.random(rows);

    for (let i = 0; i < steps; i++) {
      let angle = p.noise(i * 0.02) * p.TWO_PI * 2;
      x += p.cos(angle) * 1.2;
      y += p.sin(angle) * 1.2;

      x = p.constrain(x, 0, cols - 1);
      y = p.constrain(y, 0, rows - 1);

      for (let t = -thickness; t <= thickness; t++) {
        for (let u = -thickness; u <= thickness; u++) {
          let distNoise = p.noise((x + t) * 0.3, (y + u) * 0.3) * thickness;

          if (t * t + u * u < (thickness + distNoise)) {
            let cx = p.floor(x + t);
            let cy = p.floor(y + u);

            if (cx >= 0 && cx < cols && cy >= 0 && cy < rows) {
              if (p.random() < 0.8) {
                bg[cy][cx] = p.random(greens);
              } else {
                bg[cy][cx] = p.random(reds);
              }
            }
          }
        }
      }
    }
  }

  function generateTreeStripe() {
    // 新增：每次生成前清空记录
    treeStripeCells = [];

    let vertical = p.random() < 0.5;
    let center;
    let length;
    let baseHalfWidth;
    let noiseScale = 0.3;
    let widthJitter = 2;

    if (vertical) {
      center = p.random(cols * 0.2, cols * 0.8);
      length = rows;
      baseHalfWidth = p.random(2, 5);

      for (let r = 0; r < length; r++) {
        let offset = (p.noise(r * noiseScale) - 0.5) * 6.0;
        let cx = center + offset;

        let halfW = baseHalfWidth + (p.noise(100 + r * noiseScale) - 0.5) * widthJitter;

        for (let dx = -halfW; dx <= halfW; dx++) {
          let c = p.floor(cx + dx);
          if (c >= 0 && c < cols) {
            bg[r][c] = p.random(deepStripeColors);
            // 记录树条纹格子
            treeStripeCells.push({ r, c });
          }
        }
      }

    } else {
      center = p.random(rows * 0.2, rows * 0.8);
      length = cols;
      baseHalfWidth = p.random(2, 30);

      for (let c = 0; c < length; c++) {
        let offset = (p.noise(c * noiseScale) - 0.5) * 6.0;
        let ry = center + offset;

        let halfW = baseHalfWidth + (p.noise(200 + c * noiseScale) - 0.5) * widthJitter;

        for (let dy = -halfW; dy <= halfW; dy++) {
          let r = p.floor(ry + dy);
          if (r >= 0 && r < rows) {
            bg[r][c] = p.random(deepStripeColors);
            // 记录树条纹格子
            treeStripeCells.push({ r, c });
          }
        }
      }
    }

    // 去重：防止同一格子被多次记录
    const seen = new Set();
    treeStripeCells = treeStripeCells.filter(({ r, c }) => {
      const key = r + ',' + c;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // 新增：根据树条纹格子重建蓝点（简单拒绝采样，保证最小间距）
  function rebuildBlueDots() {
    blueDots = [];
    if (treeStripeCells.length === 0) return;

    // 目标蓝点数与条纹格子数相关，且不超过上限
    const targetCount = Math.min(BLUE_DOT_COUNT_MAX, Math.floor(treeStripeCells.length * 0.08)); // 密度较小

    let attempts = 0;
    const maxAttempts = targetCount * 50;

    while (blueDots.length < targetCount && attempts < maxAttempts) {
      attempts++;
      // 随机选一个树条纹格子，在其格子内随机摆放
      const cell = p.random(treeStripeCells);
      const baseX = cell.c * TILE;
      const baseY = cell.r * TILE;
      const x = baseX + p.random(0, TILE);
      const y = baseY + p.random(0, TILE);

      // 距离检查，确保不相连
      let ok = true;
      for (let i = 0; i < blueDots.length; i++) {
        const dx = x - blueDots[i].x;
        const dy = y - blueDots[i].y;
        if (dx * dx + dy * dy < BLUE_DOT_MIN_DIST * BLUE_DOT_MIN_DIST) {
          ok = false;
          break;
        }
      }
      if (ok) {
        blueDots.push({ x, y });
      }
    }
  }

  function generateCenterBlobs() {
    let numEllipses = 1;
    let interior = [];
    let edgeDist = [];

    for (let r = 0; r < rows; r++) {
      interior[r] = [];
      edgeDist[r] = [];
      for (let c = 0; c < cols; c++) {
        interior[r][c] = false;
        edgeDist[r][c] = Infinity;
      }
    }

    let edgeFactor   = 0.10;
    let edgeBandMax  = 0.14;

    for (let e = 0; e < numEllipses; e++) {
      let cx = W / 2;
      let cy = H / 2;

      let fillColor = p.random(whiteColors);

      // 椭圆尺寸根据容器大小自适应，不超过边界
      let maxA = W * 0.25;  // 最宽不超过容器宽度的 25%
      let maxB = H * 0.25;  // 最高不超过容器高度的 25%

      let a, b;
      let type = p.floor(p.random(4));

      if (type === 0) {
        a = p.random(maxA * 0.2, maxA * 0.45);
        b = p.random(maxB * 0.2, maxB * 0.45);
      } else if (type === 1) {
        a = p.random(maxA * 0.6, maxA);
        b = p.random(maxB * 0.2, maxB * 0.5);
      } else if (type === 2) {
        a = p.random(maxA * 0.2, maxA * 0.5);
        b = p.random(maxB * 0.6, maxB);
      } else {
        a = p.random(maxA * 0.3, maxA * 0.9);
        b = p.random(maxB * 0.3, maxB * 0.9);
      }

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          let x = (c + 0.5) * TILE;
          let y = (r + 0.5) * TILE;

          let ell = ((x - cx) * (x - cx)) / (a * a) +
                    ((y - cy) * (y - cy)) / (b * b);

          if (ell < 1.0) {
            interior[r][c] = true;

            bg[r][c] = fillColor;

            if (!revealed[r][c]) {
              revealed[r][c] = true;
              frontier.push([r, c]);
            }

          } else if (ell >= 1.0 && ell < 1.0 + edgeBandMax) {
            let d = ell - 1.0;
            if (d < edgeDist[r][c]) {
              edgeDist[r][c] = d;
            }
          }
        }
      }
    }

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!interior[r][c] && edgeDist[r][c] < edgeFactor) {
          bg[r][c] = edgeBrown;
        }
      }
    }
  }
  
  p.windowResized = function() {
    let container = document.getElementById('p5-3');
    let Wnew = container ? container.offsetWidth || W : W;
    let Hnew = container ? container.offsetHeight || H : H;
    W = Wnew; H = Hnew;
    p.resizeCanvas(W, H);
    cols = p.floor(W / TILE);
    rows = p.floor(H / TILE);
    // Reinitialize arrays to match new size
    bg = [];
    revealed = [];
    for (let r = 0; r < rows; r++) {
      bg[r] = [];
      revealed[r] = [];
      for (let c = 0; c < cols; c++) revealed[r][c] = false;
    }
    frontier = [];
    allRevealed = false;
    generateBackground();
    generateTreeStripe();
    generateDarkStripe();
    generateCenterBlobs();

    // 新增：尺寸变化后重建蓝点
    rebuildBlueDots();

    p.loop();
  };
}, 'p5-3');
