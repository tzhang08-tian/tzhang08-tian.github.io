const W = 700, H = 450;
let inset = 90;              // 矩形内口子
let balls = [];
const BALL_COUNT = 10;

// 波纹参数
const RIPPLE_RISE_FRAMES = 15;
const RIPPLE_DECAY_FRAMES = 70;
const RIPPLE_DELAY_FRAMES = 3;
const FREQ_START = 12.0;
const FREQ_END   = 4.0;
const AMP_MAX    = 10.0;
const NOISE_SCALE = 0.6;

function setup() {
  createCanvas(W, H);
  noStroke();
  initBalls();               // ✅ 生成小球
}

function draw() {
  background(50);
  drawTank();
  for (let b of balls) {
    updateBall(b);
    drawBall(b);
  }
}

/* ---------- Tank ---------- */
function drawTank() {
  const colTop    = color(200,220,255,160);
  const colSide   = color(180,200,240,120);
  const colBottom = color(150,170,220,180);

  const x1=inset,     y1=inset;      // 左上
  const x2=W-inset,   y2=inset;      // 右上
  const x3=W-inset,   y3=H-inset;    // 右下
  const x4=inset,     y4=H-inset;    // 左下

  fill(colBottom); quad(x4,y4, x3,y3,  W,H,  0,H);
  fill(colSide);   quad(0,0,   x1,y1,  x4,y4, 0,H);
  fill(colSide);   quad(W,0,   W,H,    x3,y3, x2,y2);
  fill(colTop);    quad(0,0,   W,0,    x2,y2, x1,y1);
}

/* ---------- Helpers: 反弹 + 波纹 ---------- */
// 小写 reflect（统一大小写）
const reflect = (p, v, lo, hi) => {
  let c = false;
  if (p < lo) { p = lo; v *= -1; c = true; }
  if (p > hi) { p = hi; v *= -1; c = true; }
  return [p, v, c];
};

const rippleReset = r => Object.assign(r, {
  active:true, life:0, delay:RIPPLE_DELAY_FRAMES,
  freq:FREQ_START, phase:random(TAU), seed:random(1000), _ampNow:0
});

const rippleStep = r => {
  if (!r.active) { r._ampNow = 0; return; }
  r.life++;
  let amp = 0;                         // ✅ 用同一个小写 amp
  if (r.life > r.delay) {
    const t = r.life - r.delay;
    const rise  = constrain(t / RIPPLE_RISE_FRAMES, 0, 1);
    const decay = exp(-(max(0, t - RIPPLE_RISE_FRAMES)) / RIPPLE_DECAY_FRAMES);
    amp = AMP_MAX * easeOutQuad(rise) * decay;
    const u = constrain(t / (RIPPLE_RISE_FRAMES + RIPPLE_DECAY_FRAMES), 0, 1);
    r.freq  = lerp(FREQ_START, FREQ_END, easeOutQuad(u));
    r.phase += 0.18;
    if (amp < 0.05 && r.life > r.delay + RIPPLE_RISE_FRAMES) r.active = false;
  }
  r._ampNow = amp;
};

/* ---------- Balls ---------- */
function initBalls() {
  balls.length = 0;
  for (let i = 0; i < BALL_COUNT; i++) {
    const z = random(0.2, 1.0), r = lerp(10, 38, z);
    const xmin = inset + r, xmax = W - inset - r;
    const ymin = inset + r, ymax = H - inset - r;
    balls.push({
      x: random(xmin, xmax),
      y: random(ymin, ymax),
      vx: random([-1, 1]) * lerp(2.0, 5.0, z),
      vy: random([-1, 1]) * lerp(2.0, 5.0, z),
      r, z,
      shade: floor(lerp(120, 255, z)),
      ripple: { active:false, life:9999, delay:0, phase:random(TAU), freq:FREQ_END, seed:random(1000), _ampNow:0 }
    });
  }
}

function updateBall(b) {
  b.x += b.vx; b.y += b.vy;

  const xmin = inset + b.r, xmax = W - inset - b.r;
  const ymin = inset + b.r, ymax = H - inset - b.r;

  let c; [b.x, b.vx, c] = reflect(b.x, b.vx, xmin, xmax);
  let c2; [b.y, b.vy, c2] = reflect(b.y, b.vy, ymin, ymax);
  if (c || c2) rippleReset(b.ripple);

  rippleStep(b.ripple);
}

function drawBall(b) {
  push(); translate(b.x, b.y); fill(b.shade); noStroke();
  const { _ampNow: amp = 0, freq = FREQ_END, phase = 0, seed = 0 } = b.ripple;

  if (amp <= 0.001) {
    circle(0, 0, b.r * 2);
  } else {
    beginShape();
    const steps = 96;
    for (let i = 0; i < steps; i++) {
      const a = (i / steps) * TAU;
      const n = noise(seed + cos(a) * NOISE_SCALE, seed + sin(a) * NOISE_SCALE);
      const dr = sin(a * freq + phase + n * TAU * 0.25) * amp * (0.6 + 0.4 * n);
      const rr = max(2, b.r + dr);
      vertex(cos(a) * rr, sin(a) * rr);
    }
    endShape(CLOSE);
  }
  pop();
}

/* ---------- Easing ---------- */
function easeOutQuad(t){ return 1 - (1 - t) * (1 - t); }
