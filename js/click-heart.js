// js/click-heart.js — 点击空白处产生爱心/星星爆散

export function startClickHearts(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return () => {};
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};

  const ctx = canvas.getContext('2d');
  let w, h;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const particles = [];
  const MAX_PARTICLES = 200;

  function resize() {
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  function heartPath(cx, cy, s) {
    ctx.beginPath();
    const top = cy - s * 0.4;
    ctx.moveTo(cx, top + s);
    ctx.bezierCurveTo(cx - s, top + s*0.6, cx - s, top - s*0.3, cx, top);
    ctx.bezierCurveTo(cx + s, top - s*0.3, cx + s, top + s*0.6, cx, top + s);
    ctx.closePath();
  }

  function starPath(cx, cy, s) {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
      const outerR = s;
      const innerR = s * 0.4;
      i === 0 ? ctx.moveTo(cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR)
             : ctx.lineTo(cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR);
      ctx.lineTo(cx + Math.cos(angle + Math.PI/5) * innerR, cy + Math.sin(angle + Math.PI/5) * innerR);
    }
    ctx.closePath();
  }

  let animationId;
  let running = false;
  let paused = false;
  let lastTime = performance.now();

  function startLoop() {
    if (running) return;
    running = true;
    lastTime = performance.now();
    animationId = requestAnimationFrame(draw);
  }

  function stopLoop() {
    running = false;
    cancelAnimationFrame(animationId);
    ctx.clearRect(0, 0, w, h);
  }

  function burst(x, y) {
    if (particles.length >= MAX_PARTICLES) return;
    const count = 12;
    const isHeart = Math.random() < 0.6;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
      const speed = Math.random() * 3 + 1.5;
      particles.push({
        x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 2,
        life: 1, decay: Math.random() * 0.015 + 0.01,
        size: Math.random() * 8 + 4,
        isHeart, rotation: Math.random() * Math.PI * 2,
        color: ['#f8bbd0','#f48fb1','#c5cae9','#fff9c4','#ce93d8'][Math.floor(Math.random()*5)],
      });
    }
    if (!running && !paused) startLoop();
  }

  function onClick(e) {
    if (e.target.closest('a, button, .photo-card, .blog-card, .gallery-detail, .kawaii-btn')) return;
    burst(e.clientX, e.clientY);
  }
  document.addEventListener('click', onClick);

  function draw(timestamp) {
    const dt = Math.min((timestamp - lastTime) / 16, 3);
    lastTime = timestamp;
    ctx.clearRect(0, 0, w, h);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 0.04 * dt;
      p.life -= p.decay; p.rotation += 0.05 * dt;
      if (p.life <= 0) { particles.splice(i, 1); continue; }

      ctx.save();
      ctx.globalAlpha = p.life * 0.7;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      if (p.isHeart) heartPath(0, 0, p.size * p.life);
      else starPath(0, 0, p.size * p.life);
      ctx.fill();
      ctx.restore();
    }

    // Stop loop when no particles left
    if (particles.length === 0) {
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
      if (particles.length > 0) startLoop();
    }
  }
  document.addEventListener('visibilitychange', onVisibilityChange);

  return () => {
    cancelAnimationFrame(animationId);
    window.removeEventListener('resize', resize);
    document.removeEventListener('click', onClick);
    document.removeEventListener('visibilitychange', onVisibilityChange);
  };
}
