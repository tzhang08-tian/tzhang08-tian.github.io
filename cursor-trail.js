(function () {
  const style = document.createElement('style');
  style.textContent = `
    .cursor-ascii-particle {
      position: fixed;
      pointer-events: none;
      z-index: 9999;
      font-family: monospace;
      font-weight: bold;
      color: #555;
      will-change: transform, opacity;
    }
  `;
  document.head.appendChild(style);

  const CHARS = ['#', '@', '%', '*', '+', '=', '-', '/', '\\', '|', '.', ':', '~', '^', '$', '&', '<', '>'];

  let lastX = null;
  let lastY = null;

  document.addEventListener('mousemove', (e) => {
    if (lastX === null) {
      lastX = e.clientX;
      lastY = e.clientY;
      return;
    }
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;

    const dist = Math.hypot(dx, dy);
    if (dist < 2) return;
    if (Math.random() > 0.5) return; // thin out the spawn rate

    const char = CHARS[Math.floor(Math.random() * CHARS.length)];
    const el = document.createElement('span');
    el.className = 'cursor-ascii-particle';
    el.textContent = char;
    el.style.left = e.clientX + 'px';
    el.style.top = e.clientY + 'px';
    el.style.fontSize = (10 + Math.random() * 10) + 'px';
    document.body.appendChild(el);

    // fires away opposite to the cursor's travel direction, with a little angular jitter
    const angle = Math.atan2(-dy, -dx) + (Math.random() - 0.5) * 0.6;
    const travel = 30 + Math.random() * 40;
    const tx = Math.cos(angle) * travel;
    const ty = Math.sin(angle) * travel;

    const anim = el.animate([
      { transform: 'translate(-50%, -50%) translate(0, 0)', opacity: 1 },
      { transform: `translate(-50%, -50%) translate(${tx}px, ${ty}px)`, opacity: 0 }
    ], {
      duration: 600 + Math.random() * 400,
      easing: 'ease-out'
    });
    anim.onfinish = () => el.remove();
  });
})();
