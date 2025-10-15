window.addEventListener("load", () => {
  const canvas = document.getElementById("pattern");
  const ctx = canvas.getContext("2d");

  const bgColor = document.getElementById("bgColor");
  const vLineColor = document.getElementById("vLineColor");
  const hLineColor = document.getElementById("hLineColor");
  const lineThickness = document.getElementById("lineThickness");
  const cellSize = document.getElementById("cellSize");
  const blurAmount = document.getElementById("blurAmount");

  // 离屏画布
  const off = document.createElement("canvas");
  const offCtx = off.getContext("2d");

  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    off.width = canvas.width;
    off.height = canvas.height;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    offCtx.setTransform(1, 0, 0, 1, 0, 0);
    offCtx.scale(dpr, dpr);
  }

  function drawGrid() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const bg = bgColor.value;
    const vColor = vLineColor.value;
    const hColor = hLineColor.value;
    const lt = parseInt(lineThickness.value);
    const cs = parseInt(cellSize.value);
    const blur = parseInt(blurAmount.value);

    // 清除离屏画布
    offCtx.clearRect(0, 0, w, h);

    // 背景
    offCtx.fillStyle = bg;
    offCtx.fillRect(0, 0, w, h);

    // 绘制竖线
    offCtx.strokeStyle = vColor;
    offCtx.lineWidth = lt;
    for (let x = 0; x <= w; x += cs) {
      offCtx.beginPath();
      offCtx.moveTo(x, 0);
      offCtx.lineTo(x, h);
      offCtx.stroke();
    }

    // 绘制横线
    offCtx.strokeStyle = hColor;
    for (let y = 0; y <= h; y += cs) {
      offCtx.beginPath();
      offCtx.moveTo(0, y);
      offCtx.lineTo(w, y);
      offCtx.stroke();
    }

    // 主画布上绘制（可模糊）
    ctx.clearRect(0, 0, w, h);
    if (blur > 0) {
      ctx.filter = `blur(${blur}px)`;
    } else {
      ctx.filter = "none";
    }
    ctx.drawImage(off, 0, 0, w, h);
    ctx.filter = "none"; // 恢复状态
  }

  function update() {
    resizeCanvas();
    drawGrid();
  }

  window.addEventListener("resize", update);
  [bgColor, vLineColor, hLineColor, lineThickness, cellSize, blurAmount].forEach(el =>
    el.addEventListener("input", update)
  );

  update();
});
