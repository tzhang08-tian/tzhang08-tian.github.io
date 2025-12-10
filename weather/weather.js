// —— 用来储存背景的 HSB 色相、饱和度、亮度 ——
let bgHue, bgSat, bgBri;
// New: day/night state and brightness factor
let isNight = false;
// Day is slightly brighter (>1), night is darker (<1)
let nightFactor = 1.08; // was 1.15, reduce daytime boost

// —— 画布对象（方便以后移动或控制） ——
let cnv;

let lat, lon;
let cityName = "";
let country = "";
let temperature, wind, precipitation;
// New: track humidity (0–100)
let humidity;

// New: particles that float across the screen
let particles = [];
const PARTICLE_COUNT = 100; // was 20
// New: per-line floating data (replace static buffer approach)
let lines = [];
// Remove fixed LINE_COUNT; use dynamic count driven by humidity
// const LINE_COUNT = 50; // deprecated

// New: darker curved line layer (drawn below the existing light floating lines)
let darkLines = [];
const DARK_LINE_COUNT = 500;

// Helper: map humidity (0–100) to line count
function humidityToLineCount(h) {
  const hClamped = Math.min(100, Math.max(0, Number(h) || 0));
  const minLines = 10;
  const maxLines = 120;
  return Math.round(minLines + (hClamped / 100) * (maxLines - minLines));
}

// Map humidity (0–100) to particle count
function humidityToParticleCount(h) {
  const hClamped = Math.min(100, Math.max(0, Number(h) || 0));
  const minPts = 40;   // fewer dots when dry
  const maxPts = 200;  // more dots when humid
  return Math.round(minPts + (hClamped / 100) * (maxPts - minPts));
}

// New: build darker curved lines once
function buildDarkLines() {
  darkLines = [];
  for (let i = 0; i < DARK_LINE_COUNT; i++) {
    // start near/in canvas
    const sx = random(-100, width + 100);
    const sy = random(-100, height + 100);
    // direction and length ~500
    const ang = random(360);
    const len = 1500;
    const ex = sx + cos(ang) * len;
    const ey = sy + sin(ang) * len;
    // control points to form a curve (Bezier)
    const midX = (sx + ex) / 2;
    const midY = (sy + ey) / 2;
    const bend = random(-80, 80);
    const cx1 = midX + bend * cos(ang + 90);
    const cy1 = midY + bend * sin(ang + 90);
    const cx2 = midX + bend * cos(ang - 90);
    const cy2 = midY + bend * sin(ang - 90);
    darkLines.push({ sx, sy, cx1, cy1, cx2, cy2, ex, ey });
  }
}

// New: create lines with dynamic count based on humidity
function buildLines() {
  lines = [];
  const count = humidityToLineCount(humidity);
  for (let i = 0; i < count; i++) {
    const cx = random(-200, width + 200);
    const cy = random(-200, height + 200);
    const ang = random(360);
    const L = 1000;
    const dx = cos(ang) * L;
    const dy = sin(ang) * L;
    // endpoints
    const x1 = cx - dx, y1 = cy - dy;
    const x2 = cx + dx, y2 = cy + dy;
    // floating params (per-line)
    const phase = random(TWO_PI);
    const amp = random(2, 10);        // pixels
    const speed = random(0.015, 0.035); // radians/frame
    lines.push({ x1, y1, x2, y2, phase, amp, speed });
  }
}

// Rebuild particles to match current humidity-driven count
function rebuildParticles() {
  const target = humidityToParticleCount(humidity);
  const current = particles.length;
  if (target === current) return;

  // grow: add new particles
  if (target > current) {
    const add = target - current;
    for (let i = 0; i < add; i++) {
      const ang = random(360);
      const dirX = cos(ang);
      const dirY = sin(ang);
      particles.push({
        x: random(width),
        y: random(height),
        w: random(20, 40),
        h: random(15, 70),
        a: random(0, 180),
        va: random(-0.4, 0.4),
        dirX,
        dirY,
        baseSpeed: random(0.2, 1.0),
        speed: 0.2,
        hue: random(0, 360),
        sat: random(20, 40),
        bri: random(60, 100),
        alpha: random(30, 80)
      });
    }
    // match palette
    recolorParticles();
    return;
  }

  // shrink: remove excess particles
  particles.splice(target);
}

function setup() {

  /* ---------------------------------------------------
     创建一个会根据屏幕大小自动调整的右侧画布
     windowWidth * 0.6 = 占浏览器宽度的 60%
     windowHeight * 0.9 = 占浏览器高度的 90%
     --------------------------------------------------- */
  cnv = createCanvas(windowWidth, windowHeight); // fullscreen canvas

  // —— 把画布放进 HTML 里的 id="sketch-holder" 这个 div 区域 ——
  cnv.parent('sketch-holder');

  /* ---------------------------------------------------
     p5.js 的基础设置
     --------------------------------------------------- */
  colorMode(HSB, 360, 100, 100);  // 使用 HSB 色彩模式：0~360色相，0~100饱和度、亮度
  angleMode(DEGREES);             // 角度模式改成“度数”（默认是弧度）
  frameRate(60);                   // 每秒刷新 1 次（也就是 draw 每秒跑一次）
  noStroke();                     // 默认图形没有描边

  /* ---------------------------------------------------
     为背景随机生成一个配色（静态背景）
     --------------------------------------------------- */
  bgHue = random(0, 90);          // 色相：偏暖
  bgSat = random(15, 35);         // 饱和度偏低
  bgBri = random(45, 70);         // 亮度中间偏亮

  // —— 绘制一次静态背景（初始化用） ——
  drawBackground();
  // build persistent layers
  buildLines();
  // New: build darker curved lines layer
  buildDarkLines();

  // New: create particles once (direction unit + base speed)
  particles = Array.from({ length: PARTICLE_COUNT }, () => {
    const ang = random(360);
    const dirX = cos(ang);
    const dirY = sin(ang);
    return {
      x: random(width),
      y: random(height),
      // Change: broaden ellipse size range (smaller min, larger max)
      w: random(20, 40),
      h: random(15, 70),
      a: random(0, 180),
      va: random(-0.4, 0.4),
      // movement direction (unit vector) and base speed
      dirX,
      dirY,
      baseSpeed: random(0.2, 1.0),
      // current speed factor (scaled by wind)
      speed: 0.2,
      // color
      hue: random(0, 360),
      sat: random(20, 40),
      bri: random(60, 100),
      alpha: random(30, 80)
    };
  });
  // New: after particles are created, recolor and then size by humidity
  recolorParticles();
  rebuildParticles();
}


function draw() {

  /* ---------------------------------------------------
     每次 draw() 重新“清空”画布并绘制背景
     保持背景是静态的（不会随机变化）
     --------------------------------------------------- */
  drawBaseFill();

  // New: render the darker curved lines UNDER the light floating lines
  // Slightly darker and more saturated than bg
  stroke(
    bgHue,
    min(bgSat + 3, 100), // higher saturation
    max(bgBri - 3, 0)    // darker
  );
  strokeWeight(4);
  noFill();
  for (const d of darkLines) {
    bezier(d.sx, d.sy, d.cx1, d.cy1, d.cx2, d.cy2, d.ex, d.ey);
  }

  // Existing: light floating lines (above dark lines)
  stroke(bgHue, min(bgSat + 10, 50), min(bgBri + 10, 90));
  strokeWeight(9);
  noFill();
  for (const ln of lines) {
    // vertical offset based on time; each line uses its own phase/speed/amp
    const t = frameCount;
    const oy = Math.sin(ln.phase + t * ln.speed) * ln.amp;
    line(ln.x1, ln.y1 + oy, ln.x2, ln.y2 + oy);
  }

  // Animate and render particles
  noStroke();
  for (const p of particles) {
    // update
    p.x += p.dirX * p.speed;
    p.y += p.dirY * p.speed;
    p.a += p.va;

    // wrap around screen
    if (p.x < -200) p.x = width + 200;
    if (p.x > width + 200) p.x = -200;
    if (p.y < -200) p.y = height + 200;
    if (p.y > height + 200) p.y = -200;

    // draw
    push();
    translate(p.x, p.y);
    rotate(p.a);
    fill(p.hue, p.sat, p.bri, p.alpha);
    // Change: draw square/rectangle instead of ellipse
    rect(0, 0, p.w, p.h);
    pop();
  }
}

// New: repaint only the base fill (no lines)
function drawBaseFill() {
  // apply day/night scaling to brightness
  const bri = constrain(bgBri * nightFactor, 0, 100);
  background(bgHue, bgSat, bri);
}


/* ---------------------------------------------------
   绘制“线条背景”（这是你的静态背景系统）
   --------------------------------------------------- */
function drawBackground() {
  // base fill with day/night scaling
  const bri = constrain(bgBri * nightFactor, 0, 100);
  background(bgHue, bgSat, bri);
}


/* ---------------------------------------------------
   当浏览器窗口大小改变时自动调整画布尺寸
   让整体保持响应式布局
   --------------------------------------------------- */
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  drawBackground();
  // Rebuild lines using current humidity-driven count
  buildLines();
  buildDarkLines();
}



function updateDisplay() {
  const loc = document.getElementById("locationInfo");
  const wea = document.getElementById("weatherInfo");

  if (!loc || !wea) {
    console.warn("找不到 locationInfo 或 weatherInfo 元素");
    return;
  }

  loc.innerHTML = `
    <span class="label">City:</span> ${cityName || "..."}<br>
    <span class="label">Country:</span> ${country || "..."}<br>
    <span class="label">Longitude:</span> ${lat?.toFixed?.(4) || "..."}<br>
    <span class="label">Latitude:</span> ${lon?.toFixed?.(4) || "..."}
  `;

  // 默认降雨量显示为 0
  const precipText = Number.isFinite(precipitation) ? precipitation : 0;

  wea.innerHTML = `
    <span class="label">Temperature (°C):</span> ${Number.isFinite(temperature) ? Math.round(temperature) : "..."}<br>
    <span class="label">Wind Speed (m/s):</span> ${Number.isFinite(wind) ? Math.round(wind) : "..."}<br>
    <span class="label">Precipitation (mm):</span> ${precipText}
  `;
}




function getCityName(lat, lon) {
  const url =
    `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=你的APIkey`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      console.log("city raw data:", data);  // 🔍 调试用：看看浏览器里打印了什么

      if (Array.isArray(data) && data.length > 0) {
        cityName = data[0].name;
        country = data[0].country;

        updateDisplay(); // ⭐ 关键：拿到城市后一定要调用
      }
    })
    .catch(err => console.error(err));
}

// Update: map temperature to background color by ranges
function applyTemperatureToBackground(tempC) {
  if (!Number.isFinite(tempC)) return;

  if (tempC < -10) {
    // deep blue
    bgHue = 220; bgSat = 60; bgBri = 55;
  } else if (tempC < 0) {
    // light blue
    bgHue = 200; bgSat = 40; bgBri = 75;
  } else if (tempC < 10) {
    // light green
    bgHue = 160; bgSat = 35; bgBri = 80;
  } else if (tempC < 20) {
    // deep green
    bgHue = 140; bgSat = 65; bgBri = 60;
  } else if (tempC < 25) {
    // yellow-green
    bgHue = 75; bgSat = 60; bgBri = 80;
  } else if (tempC < 30) {
    // yellow
    bgHue = 55; bgSat = 70; bgBri = 85;
  } else {
    // orange
    bgHue = 30; bgSat = 70; bgBri = 85;
  }
}

// Map wind speed (m/s) to pixels per frame
function windSpeedToPixelsPerFrame(w) {
  const ws = Math.max(0, Number(w) || 0);
  // 0 m/s -> ~0.05 px/frame (almost still), 20 m/s -> ~3 px/frame, clamp
  const minPx = 0.05, maxPx = 3.0, maxMs = 30;
  const t = Math.min(ws / maxMs, 1);
  return minPx + t * (maxPx - minPx);
}

// New: expose a global setter to apply wind speed to particle motion
window.setSketchWindSpeed = function(windMs) {
  const pxPerFrame = windSpeedToPixelsPerFrame(windMs);
  for (const p of particles) {
    p.speed = pxPerFrame * p.baseSpeed;
  }
};

// Keep temperature-based background update immediate
window.setSketchTemperature = function(tempC) {
  if (!Number.isFinite(tempC)) return;
  temperature = tempC;
  applyTemperatureToBackground(tempC);
  // refresh fill with new palette
  drawBackground();
  // rebuild lines to use new stroke color
  buildLines();
  // New: rebuild darker curved lines to update color palette
  buildDarkLines();
  // New: recolor particles to match new background hue
  recolorParticles();
};

// New: day/night setter (isDay: 1 or 0, boolean acceptable)
window.setSketchDayNight = function(isDay) {
  // Open‑Meteo: 1 = day, 0 = night
  const dayFlag = Boolean(Number(isDay));
  isNight = !dayFlag;



  // 白天黑夜区别brighten day, darken night — narrower gap
  nightFactor = isNight ? 0.85 : 1.08; // was 0.6 / 1.15
  // refresh background immediately
  drawBackground();
};

// New: expose a global setter to apply humidity -> light line count
window.setSketchHumidity = function(h) {
  humidity = Math.min(100, Math.max(0, Number(h) || 0));
  buildLines();
  // New: adjust particle count with humidity
  rebuildParticles();
};

// Replace: fetch current weather using Open‑Meteo (no API key required)
async function fetchWeather(lat, lon) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${Number(lat).toFixed(4)}&longitude=${Number(lon).toFixed(4)}&current_weather=true&hourly=precipitation,windspeed_10m,relativehumidity_2m`;
    const res = await fetch(url);
    if (!res.ok) {
      console.warn("Open‑Meteo 响应异常:", res.status, res.statusText);
      precipitation = 0;
      // keep previous humidity; if undefined, default to 0
      if (!Number.isFinite(humidity)) humidity = 0;
      updateDisplay();
      return;
    }
    const data = await res.json();

    const current = data.current_weather || {};
    temperature = Number(current.temperature);
    wind = Number.isFinite(current.windspeed)
      ? Number(current.windspeed)
      : Number(data?.hourly?.windspeed_10m?.[0]);

    // Nearest hour precipitation (mm)
    let precip = 0;
    const hourly = data.hourly || {};
    const times = hourly.time || [];
    const precArr = hourly.precipitation || [];
    const humArr = hourly.relativehumidity_2m || [];
    let idx = 0;
    if (Array.isArray(times) && times.length) {
      const now = Date.now();
      let best = 1e15;
      for (let i = 0; i < times.length; i++) {
        const d = new Date(times[i]).getTime();
        const diff = Math.abs(now - d);
        if (diff < best) { best = diff; idx = i; }
      }
    }
    const pVal = Number(precArr?.[idx]);
    if (Number.isFinite(pVal)) precip = pVal;
    precipitation = Number(precip.toFixed(2));

    // Humidity (% 0–100)
    const hVal = Number(humArr?.[idx]);
    if (Number.isFinite(hVal)) {
      humidity = hVal;
      // update line count when humidity changes
      window.setSketchHumidity(humidity);
    }

    // New: apply day/night from current weather if available
    if (current.is_day != null && window.setSketchDayNight) {
      window.setSketchDayNight(current.is_day);
    }

    if (Number.isFinite(temperature)) window.setSketchTemperature(temperature);
    if (Number.isFinite(wind)) window.setSketchWindSpeed(wind);

    updateDisplay();
  } catch (err) {
    console.error("获取 Open‑Meteo 天气失败:", err);
    precipitation = 0;
    if (!Number.isFinite(humidity)) humidity = 0;
    updateDisplay();
  }
}

// New: convenience initializer to get city + weather
async function initWeatherFlow(latValue, lonValue) {
  lat = latValue;
  lon = lonValue;
  getCityName(lat, lon);
  await fetchWeather(lat, lon);
}

// Helper: wrap hue to [0, 360)
function wrapHue(h) {
  let x = Number(h) || 0;
  x %= 360;
  if (x < 0) x += 360;
  return x;
}

// Helper: hue near base within ±delta
function randomHueNear(baseHue, delta = 50) {
  const off = random(-delta, delta);
  return wrapHue(baseHue + off);
}

// Helper: hue outside ±delta range (contrast)
function randomHueOutside(baseHue, delta = 50) {
  // pick a hue in the remaining arc, bias to be clearly different
  const gapStart = wrapHue(baseHue - delta);
  const gapEnd = wrapHue(baseHue + delta);
  // choose randomly either segment [gapEnd, gapStart) on the circle
  // implement by picking a random hue and rejecting if within gap
  let h = random(0, 360);
  const within =
    (gapStart < gapEnd && h >= gapStart && h <= gapEnd) ||
    (gapStart > gapEnd && (h >= gapStart || h <= gapEnd));
  if (within) {
    // push it out of gap by shifting ±(delta+10)
    h = wrapHue(h + (random() < 0.5 ? (delta + 10) : -(delta + 10)));
  }
  return wrapHue(h);
}

// Apply background-dependent particle hues:
// 100% of particles within bgHue ± (50 * 0.3) = ±15
function recolorParticles() {
  if (!Array.isArray(particles) || particles.length === 0) return;
  const delta = 50 * 0.3; // 30% of the ±50 range => ±15

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    p.hue = randomHueNear(bgHue, delta);
    p.sat = random(20, 40);
    p.bri = random(60, 100);
    // keep alpha as is
  }
}

