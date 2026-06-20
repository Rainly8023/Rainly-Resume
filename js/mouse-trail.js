// js/mouse-trail.js — 鼠标移动时的彩色粒子尾迹

export function startMouseTrail(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let w, h;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const trails = [];
  const maxTrails = 40;
  let mouseX = -100, mouseY = -100;
  const isMobile = window.innerWidth < 768;

  function resize() {
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });
  document.addEventListener('mouseleave', () => { mouseX = -100; mouseY = -100; });
  document.addEventListener('touchmove', e => {
    mouseX = e.touches[0].clientX; mouseY = e.touches[0].clientY;
  }, { passive: true });
  document.addEventListener('touchend', () => { mouseX = -100; mouseY = -100; });

  const colors = ['#f8bbd0','#c5cae9','#fff9c4','#b2ebf2','#f48fb1','#ce93d8'];
  let lastEmit = 0;

  function draw(timestamp) {
    ctx.clearRect(0, 0, w, h);

    if (mouseX > 0 && mouseY > 0 && timestamp - lastEmit > 25 && trails.length < maxTrails && !isMobile) {
      trails.push({
        x: mouseX, y: mouseY,
        vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2,
        life: 1, decay: Math.random() * 0.02 + 0.015,
        size: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
      lastEmit = timestamp;
    }

    for (let i = trails.length - 1; i >= 0; i--) {
      const t = trails[i];
      t.x += t.vx; t.y += t.vy;
      t.life -= t.decay;
      if (t.life <= 0) { trails.splice(i, 1); continue; }
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.size * t.life, 0, Math.PI * 2);
      const alpha = Math.floor(t.life * 0.6 * 255).toString(16).padStart(2, '0');
      ctx.fillStyle = t.color + alpha;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
}
