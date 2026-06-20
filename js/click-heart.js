// js/click-heart.js — 点击空白处产生爱心/星星爆散

export function startClickHearts(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let w, h;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const particles = [];

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

  function burst(x, y) {
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
  }

  document.addEventListener('click', e => {
    if (e.target.closest('a, button, .photo-card, .blog-card, .gallery-detail, .kawaii-btn')) return;
    burst(e.clientX, e.clientY);
  });

  function draw(timestamp) {
    ctx.clearRect(0, 0, w, h);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy; p.vy += 0.04;
      p.life -= p.decay; p.rotation += 0.05;
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
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
}
