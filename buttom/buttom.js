document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".allBalls");
  const balls = container.querySelectorAll(
    ".a, .b, .c, .d, .e, .f, .g, .h, .i, .j, .k, .l, .m, .n, .o, .p, .q, .x, .y, .z"
  );
  const cr = container.getBoundingClientRect();

  // 每个小球的数据对象
  const data = Array.from(balls).map(el => {
    const r = el.getBoundingClientRect();
    const radius = el.offsetWidth / 2 || 30;
    el.style.position = "absolute";
    return {
      el,
      x: r.left - cr.left,
      y: r.top - cr.top,
      vx: (Math.random() - 0.5) * 6,
      vy: Math.random() * 2,
      radius,
      paused: false // 给每个球单独加 paused 状态
    };
  });

  const gravity = 0, bounce = 1, friction = 1;

  // ===== 点击交互控制 =====
  data.forEach(b => {
    if (b.el.matches(".a, .b, .c, .d")) { // 只有这几个球能点击暂停
      b.el.addEventListener("click", () => {
        b.paused = !b.paused;              // 切换单个小球的暂停状态
        b.el.classList.toggle("active", b.paused); // 加/去 .active 样式
      });
    }
  });

  // ===== tick 循环 =====
  function tick() {
    const W = container.clientWidth, H = container.clientHeight;

    data.forEach(b => {
      if (b.paused) return; // 如果这个球暂停，跳过运动更新

      b.vy += gravity;
      b.x += b.vx;
      b.y += b.vy;

      if (b.y + b.radius * 2 > H) { b.y = H - b.radius * 2; b.vy *= -bounce; }
      if (b.y < 0) { b.y = 0; b.vy *= -bounce; }
      if (b.x + b.radius * 2 > W) { b.x = W - b.radius * 2; b.vx *= -bounce; }
      if (b.x < 0) { b.x = 0; b.vx *= -bounce; }

      b.vx *= friction;
      b.vy *= friction;

      b.el.style.left = b.x + "px";
      b.el.style.top = b.y + "px";
    });

    requestAnimationFrame(tick);
  }
  tick();
});
