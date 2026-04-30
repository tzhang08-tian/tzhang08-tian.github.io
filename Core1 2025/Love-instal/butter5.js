// ==== 蝴蝶停靠 + 三阶段扇翅 + 旋转 + 马赛克滤镜 ====

let butterfly1;
let butterfly2;
let butterflyRestAlt;

// 单体状态改为多体数组
let butterflies = []; // [{ x,y,targetX,targetY,state,restFrames,angle,currentEdge,useAlt }]

let x, y;
let targetX, targetY;
let state = "moving";
let restFrames = 0;

let mosaicSize = 8; // 恢复马赛克：设置为非0的块大小（可根据需要调整）

// ⭐ 旋转角度（一定要先声明）
let angle = 0;

// 记录当前目标是否是“边缘目标”，以及该边的坐标约束
let currentEdge = null; // { side: 'top'|'right'|'bottom'|'left', rect: DOMRect, px:number, py:number }
// 新增：是否使用备用停靠图像的标志
let useAltRestImage = false;
// 新增：是否已安排自动重启
let refreshScheduled = false;

function preload() {
  butterfly1 = loadImage("01.png");
  butterfly2 = loadImage("02.png");
  butterflyRestAlt = loadImage("03.png"); // 新增：加载停靠时使用的图片
}

function setup() {
  pixelDensity(1);
  const cnv = createCanvas(windowWidth, windowHeight); // 适应视窗
  imageMode(CENTER);

  // 让蝴蝶画布固定覆盖视窗，并位于雨之下、其余内容之上
  cnv.position(0, 0);
  cnv.style('position', 'fixed');
  cnv.style('top', '0');
  cnv.style('left', '0');
  cnv.style('z-index', '950');       // 雨是 1000，这里略低
  cnv.style('pointer-events', 'none'); // 不阻挡交互
  cnv.style('background', 'transparent'); // 新增：确保画布CSS背景透明

  x = width / 2;
  y = height / 2;

  // 新增：初始化三个蝴蝶
  butterflies = Array.from({ length: 3 }, (_, i) => ({
    x: width * (0.3 + 0.2 * i),
    y: height * (0.3 + 0.2 * i),
    targetX: width / 2,
    targetY: height / 2,
    state: "moving",
    restFrames: 0,
    angle: 0,
    currentEdge: null,
    useAlt: false,
    restRotOffset: 0,      // 新增：停靠时旋转偏移
    restRotSpeed: 0,        // 新增：停靠时旋转速度
    restInstant: false, // 新增：是否在停靠时直接全角度旋转
    // 新增：记录本轮是否完成过一次停靠
    restCount: 0
  }));
  butterflies.forEach(b => pickNewTargetFor(b));
}

function draw() {
  clear();
  // 逐个更新与绘制
  for (const b of butterflies) {
    if (b.state === "moving") {
      moveTowardsTargetFor(b);
    } else if (b.state === "resting") {
      handleRestingFor(b);
    }

    // 更新朝向
    const dx = b.targetX - b.x;
    const dy = b.targetY - b.y;
    b.angle = atan2(dy, dx) + PI / 2;

    // 绘制
    drawButterflyFor(b);
  }

  if (mosaicSize > 0) applyMosaic();

  // 新增：所有蝴蝶本轮都停靠过一次后，安排新一轮
  if (!refreshScheduled && butterflies.length > 0 && butterflies.every(b => (b.restCount || 0) >= 1)) {
    refreshScheduled = true;
    setTimeout(resetAnimationCycle, 800); // 略微停顿后重启
  }
}

// =================== 绘制（多体） ===================
function drawButterflyFor(b) {
  if (b.state === "moving") {
    let cycle = 8;
    let phase = frameCount % cycle;
    push();
    translate(b.x, b.y);
    rotate(b.angle);
    if (phase < cycle / 3) {
      image(butterfly1, 0, 0, 405, 405); // 270 -> 405
    } else if (phase < (2 * cycle) / 3) {
      let sx = 0.9, sy = 0.85;
      scale(sx, sy);
      image(butterfly1, 0, 0, 405, 405); // 270 -> 405
    } else {
      image(butterfly2, 0, 0, 405, 405); // 270 -> 405
    }
    pop();
  } else {
    push();
    translate(b.x, b.y);
    const extra = b.restRotOffset; // 无论即时或缓慢，都使用偏移
    rotate(b.angle + extra);
    if (b.useAlt && butterflyRestAlt) {
      image(butterflyRestAlt, 0, 0, 330, 450); // 220x300 -> 330x450
    } else {
      image(butterfly1, 0, 0, 300, 450); // 200x300 -> 300x450
    }
    pop();
  }
}

// =================== 运动 / 停靠（多体） ===================
function moveTowardsTargetFor(b) {
  let d = dist(b.x, b.y, b.targetX, b.targetY);
  if (d > 2) {
    b.x = lerp(b.x, b.targetX, 0.12);
    b.y = lerp(b.y, b.targetY, 0.12);
  } else {
    if (b.currentEdge) {
      const r = b.currentEdge.rect;
      switch (b.currentEdge.side) {
        case 'top':    b.y = r.top;    b.x = b.currentEdge.px; break;
        case 'right':  b.x = r.right;  b.y = b.currentEdge.py; break;
        case 'bottom': b.y = r.bottom; b.x = b.currentEdge.px; break;
        case 'left':   b.x = r.left;   b.y = b.currentEdge.py; break;
      }
      b.x = constrain(b.x, 0, width);
      b.y = constrain(b.y, 0, height);
    }
    b.useAlt = (random() < 0.4); // 40% 使用 03.png

    // 新增：每次停靠时，随机选择“即时全角度旋转”或沿用缓慢旋转
    b.restInstant = (random() < 0.6); // 比例可调：60% 即时全角度旋转
    if (b.restInstant) {
      b.restRotOffset = random(0, TWO_PI); // 直接随机一个全角度
      b.restRotSpeed  = 0;                 // 即时旋转不再缓慢变化
    } else if (b.useAlt) {
      // 缓慢旋转仅在 03.png 时启用
      b.restRotOffset = random(-PI / 6, PI / 6);
      b.restRotSpeed  = random(-PI / 360, PI / 360);
    } else {
      b.restRotOffset = 0;
      b.restRotSpeed  = 0;
    }

    b.state = "resting";
    b.restFrames = int(random(30, 80));
  }
}

function handleRestingFor(b) {
  b.restFrames--;
  if (b.currentEdge) {
    const r = b.currentEdge.rect;
    switch (b.currentEdge.side) {
      case 'top':    b.y = r.top;    b.x = b.currentEdge.px; break;
      case 'right':  b.x = r.right;  b.y = b.currentEdge.py; break;
      case 'bottom': b.y = r.bottom; b.x = b.currentEdge.px; break;
      case 'left':   b.x = r.left;   b.y = b.currentEdge.py; break;
    }
    b.x = constrain(b.x, 0, width);
    b.y = constrain(b.y, 0, height);
  }

  // 仅在非即时模式且使用 03.png 时缓慢旋转；即时模式保持固定偏移
  if (!b.restInstant && b.useAlt) {
    b.restRotOffset += b.restRotSpeed;
    b.restRotOffset = constrain(b.restRotOffset, -PI / 4, PI / 4);
  }

  if (b.restFrames <= 0) {
    // 新增：累计本轮停靠次数
    b.restCount = (b.restCount || 0) + 1;

    b.useAlt = false;
    b.restInstant = false;
    b.restRotOffset = 0;
    b.restRotSpeed  = 0;
    pickNewTargetFor(b);
    b.state = "moving";
  }
}

// 新增：自动重启一轮（重新定位并清空停靠状态）
function resetAnimationCycle() {
  for (const b of butterflies) {
    b.x = random(width * 0.15, width * 0.85);
    b.y = random(height * 0.15, height * 0.85);
    b.targetX = width / 2;
    b.targetY = height / 2;
    b.state = "moving";
    b.restFrames = 0;
    b.angle = 0;
    b.currentEdge = null;
    b.useAlt = false;
    b.restRotOffset = 0;
    b.restRotSpeed = 0;
    b.restInstant = false;
    b.restCount = 0;
    pickNewTargetFor(b);
  }
  refreshScheduled = false;
}

// =================== 目标选择（多体） ===================
function pickNewTargetFor(b) {
  const frames = getFrameRects();
  if (frames.length === 0) {
    b.currentEdge = null;
    b.targetX = random(100, width - 100);
    b.targetY = random(100, height - 100);
    return;
  }
  const chosen = random(frames);
  const edgePt = randomEdgePoint(chosen.rect);
  const pt = viewportToCanvas(edgePt);
  b.targetX = constrain(pt.x, 0, width);
  b.targetY = constrain(pt.y, 0, height);
  b.currentEdge = {
    side: edgePt.side,
    rect: chosen.rect,
    px: b.targetX,
    py: b.targetY
  };
}

// 获取所有 p5 容器的边界（视窗坐标）
function getFrameRects() {
  const ids = ['p5-1', 'p5-2', 'p5-3', 'p5-4'];
  const rects = [];
  for (const id of ids) {
    const el = document.getElementById(id);
    if (!el) continue;
    const r = el.getBoundingClientRect();
    rects.push({ id, rect: r });
  }
  return rects;
}

// 在某个矩形的边缘选取一个随机点（视窗坐标）
function randomEdgePoint(rect) {
  const edge = floor(random(4));
  let x = 0, y = 0, side = 'top';
  switch (edge) {
    case 0:
      x = rect.left + random(rect.width);
      y = rect.top;
      side = 'top';
      break;
    case 1:
      x = rect.right;
      y = rect.top + random(rect.height);
      side = 'right';
      break;
    case 2:
      x = rect.left + random(rect.width);
      y = rect.bottom;
      side = 'bottom';
      break;
    case 3:
      x = rect.left;
      y = rect.top + random(rect.height);
      side = 'left';
      break;
  }
  return { x, y, side };
}

// 将视窗坐标转换为画布坐标（画布固定覆盖视窗，因此一致）
function viewportToCanvas(pt) {
  // canvas 位于 (0,0) fixed，全屏覆盖，坐标相同
  return { x: pt.x, y: pt.y };
}

// =================== 马赛克滤镜 ===================
function applyMosaic() {
  loadPixels();

  for (let yy = 0; yy < height; yy += mosaicSize) {
    for (let xx = 0; xx < width; xx += mosaicSize) {
      let index = (yy * width + xx) * 4;

      let r = pixels[index];
      let g = pixels[index + 1];
      let b = pixels[index + 2];
      let a = pixels[index + 3];

      for (let dy = 0; dy < mosaicSize; dy++) {
        for (let dx = 0; dx < mosaicSize; dx++) {
          let x2 = xx + dx;
          let y2 = yy + dy;
          if (x2 < width && y2 < height) {
            let i = (y2 * width + x2) * 4;
            pixels[i]     = r;
            pixels[i + 1] = g;
            pixels[i + 2] = b;
            pixels[i + 3] = a;
          }
        }
      }
    }
  }

  updatePixels();
}

// 新增：窗口尺寸变化时自适应
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // 约束并重新选目标
  for (const b of butterflies) {
    b.x = constrain(b.x, 0, width);
    b.y = constrain(b.y, 0, height);
    pickNewTargetFor(b);
  }
}
