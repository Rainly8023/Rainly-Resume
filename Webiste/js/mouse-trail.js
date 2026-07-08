// js/mouse-trail.js — 鼠标移动时的彩色粒子尾迹

export function startMouseTrail(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return () => {};
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};

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

  function onMouseMove(e) {
    mouseX = e.clientX; mouseY = e.clientY;
    if (!running && !paused) startLoop();
  }
  function onMouseLeave() { mouseX = -100; mouseY = -100; }
  function onTouchMove(e) {
    mouseX = e.touches[0].clientX; mouseY = e.touches[0].clientY;
    if (!running && !paused) startLoop();
  }
  function onTouchEnd() { mouseX = -100; mouseY = -100; }

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseleave', onMouseLeave);
  document.addEventListener('touchmove', onTouchMove, { passive: true });
  document.addEventListener('touchend', onTouchEnd);

  const colors = ['#f8bbd0','#c5cae9','#fff9c4','#b2ebf2','#f48fb1','#ce93d8'];
  let lastEmit = 0;
  let lastTime = performance.now();
  let animationId;
  let paused = false;
  let running = false;

  function startLoop() {
    if (running) return;
    running = true;
    lastTime = performance.now();
    animationId = requestAnimationFrame(draw);
  }

  function stopLoop() {
    running = false;
    cancelAnimationFrame(animationId);
  }

  function draw(timestamp) {
    const dt = Math.min((timestamp - lastTime) / 16, 3);
    lastTime = timestamp;
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
      t.x += t.vx * dt; t.y += t.vy * dt;
      t.life -= t.decay;
      if (t.life <= 0) { trails.splice(i, 1); continue; }
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.size * t.life, 0, Math.PI * 2);
      const r = parseInt(t.color.slice(1,3),16), g = parseInt(t.color.slice(3,5),16), b = parseInt(t.color.slice(5,7),16);
      ctx.fillStyle = `rgba(${r},${g},${b},${t.life * 0.6})`;
      ctx.fill();
    }

    // Stop loop when no trails left and mouse is away
    if (trails.length === 0 && (mouseX <= 0 || mouseY <= 0)) {
      stopLoop();
      return;
    }

    animationId = requestAnimationFrame(draw);
  }

  // Pause when page is not visible
  function onVisibilityChange() {
    if (document.hidden) {
      cancelAnimationFrame(animationId);
      paused = true;
      running = false;
    } else if (paused) {
      paused = false;
      if (trails.length > 0) startLoop();
    }
  }
  document.addEventListener('visibilitychange', onVisibilityChange);

  return () => {
    cancelAnimationFrame(animationId);
    window.removeEventListener('resize', resize);
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseleave', onMouseLeave);
    document.removeEventListener('touchmove', onTouchMove);
    document.removeEventListener('touchend', onTouchEnd);
    document.removeEventListener('visibilitychange', onVisibilityChange);
  };
}
