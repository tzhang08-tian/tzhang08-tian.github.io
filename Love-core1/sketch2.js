new p5((p) => {
  // sketch2 - flower.js 改进版（实例模式）

  // ---------------------------------------------
  // 全局变量
  // ---------------------------------------------
  let bg;                 // 背景图片
  let particles = [];     // 噪点粒子数组

  const COLS = 3;         // 背景被切成 3 列
  const ROWS = 3;         // 背景被切成 3 行

  let order;                  // 当前背景拼图的顺序
  let lastShuffleTime = 0;    // 上一次重排时间
  let shuffleInterval = 5000; // 每 5 秒重排一次（可调整）

  let cnv;                // 画布引用（导出图片要用）
  let exportBtn;          // 导出按钮

  // 马赛克块大小（可以调整）
  const MOSAIC_SIZE = 10;  // 10 像素一块，越大越粗糙

  // ---------------------------------------------
  // 预加载：加载背景图片
  // ---------------------------------------------
  p.preload = function() {
    bg = p.loadImage("IMG_7489.jpg");
  };

  // ---------------------------------------------
  // 初始化：画布、粒子生成、初始拼图顺序
  // ---------------------------------------------
  p.setup = function() {
    const container = document.getElementById('p5-2');
    const w = (container && container.offsetWidth) ? container.offsetWidth : 900;
    const h = (container && container.offsetHeight) ? container.offsetHeight : 700;
    cnv = p.createCanvas(w, h);

    // 初始化噪点粒子（动态 grain）
    for (let i = 0; i < 200; i++) { // 噪点数量
      particles.push({
        x: p.random(p.width),
        y: p.random(p.height),
        speed: p.random(0.1, 0.3), // 速度移动区间，越大越快
        alpha: p.random(90, 100)   // 透明度区间，越大越亮
      });
    }

    // 初始化 0~8 数组
    order = p.shuffle([...Array(COLS * ROWS).keys()]);

    // 创建“一键导出照片”按钮
    exportBtn = p.createButton('导出当前画面');
    exportBtn.position(20, 20);          // 窗口左上角位置（可以自己改）
    exportBtn.style('padding', '8px 12px');
    exportBtn.style('font-size', '14px');
    exportBtn.style('border-radius', '4px');
    exportBtn.style('border', 'none');
    exportBtn.style('background', '#ffffffaa');
    exportBtn.style('cursor', 'pointer');
    exportBtn.mousePressed(saveFrameImage);
  };

  // ---------------------------------------------
  // 主循环：绘制背景 + 绘制粒子
  // ---------------------------------------------
  p.draw = function() {
    // 每一帧都画粒子（动态移动）
    drawGrain();

    // 如果距离上次重排超过设定的毫秒数 → 重新排列
    if (p.millis() - lastShuffleTime > shuffleInterval) {
      shuffleBackground();
      lastShuffleTime = p.millis();
    }

    applyMosaic(MOSAIC_SIZE);
  };

  function saveFrameImage() {
    // 文件名：frame_00001.png 这种
    p.saveCanvas(cnv, 'frame_' + p.nf(p.frameCount, 5), 'png');
  }

  // ---------------------------------------------
  // 功能：随机重新排列背景拼图
  // ---------------------------------------------
  function shuffleBackground() {
    if (!bg) return;

    // 更新随机排列（0~8）
    order = p.shuffle([...Array(COLS * ROWS).keys()]);

    // 计算每个块的大小
    let tileW = p.width / COLS;
    let tileH = p.height / ROWS;

    // 根据背景原图实际分辨率来切割
    let srcW = bg.width / COLS;
    let srcH = bg.height / ROWS;

    let k = 0;

    // 绘制 3×3 的背景拼贴
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        let idx = order[k++];  // 当前格子的源图编号

        // 背景原图的裁切区域（sx, sy）
        let sx = (idx % COLS) * srcW;
        let sy = p.floor(idx / COLS) * srcH;

        // 显示到画布的位置（dx, dy）
        let dx = c * tileW;
        let dy = r * tileH;

        // 从背景图裁切一块并画到画布上
        p.image(bg, dx, dy, tileW, tileH, sx, sy, srcW, srcH);
      }
    }
  }

  // ---------------------------------------------
  // 功能：绘制动态 grain（与背景完全独立）
  // ---------------------------------------------
  function drawGrain() {
    p.noStroke();

    for (let prt of particles) {
      p.fill(255, prt.alpha);
      p.rect(prt.x, prt.y, 1.5, 2);

      // 让粒子向下飘动（流动感）
      prt.y += prt.speed;

      // 超出底部就从顶部回收
      if (prt.y > p.height) prt.y = 0;
    }
  }

  // 马赛克转换：把当前画面按小块重绘成像素块
  // ---------------------------------------------
  function applyMosaic(tileSize) {
    // 遍历整个画布，每 tileSize 像素为一块
    for (let y = 0; y < p.height; y += tileSize) {
      for (let x = 0; x < p.width; x += tileSize) {
        // 取这一块中心点的颜色
        let sx = x + tileSize / 2;
        let sy = y + tileSize / 2;

        sx = p.constrain(sx, 0, p.width - 1);
        sy = p.constrain(sy, 0, p.height - 1);

        let c = p.get(sx, sy); // [r, g, b, a]

        // 用这个颜色画一个实心矩形块
        p.fill(c[0], c[1], c[2], c[3]);
        p.noStroke();
        p.rect(x, y, tileSize, tileSize);
      }
    }
  }

  p.windowResized = function() {
    const container = document.getElementById('p5-2');
    const w = (container && container.offsetWidth) ? container.offsetWidth : p.width;
    const h = (container && container.offsetHeight) ? container.offsetHeight : p.height;
    p.resizeCanvas(w, h);
    // 重新触发一次重排以适配新尺寸
    lastShuffleTime = 0;
  };
}, 'p5-2');