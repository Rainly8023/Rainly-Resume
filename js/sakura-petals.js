// js/sakura-petals.js — 樱花花瓣 + 星星 Canvas 动画

export function startPetals(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let w, h, petals = [], stars = [];
  const isMobile = window.innerWidth < 768;
  const petalCount = isMobile ? 15 : 30;
  const starCount = isMobile ? 20 : 50;

  function resize() {
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    stars = Array.from({length: starCount}, () => createStar());
  }
  resize();
  window.addEventListener('resize', resize);

  const PETAL_PATHS = [
    (x, y, s) => { ctx.beginPath(); ctx.ellipse(x, y, s*5, s*2.5, 0.4, 0, Math.PI*2); ctx.fill(); },
    (x, y, s) => { ctx.beginPath(); ctx.ellipse(x, y, s*4, s*3, 0, 0, Math.PI*2); ctx.fill(); },
  ];

  function createPetal() {
    return {
      x: Math.random() * w, y: -20,
      size: Math.random() * 6 + 4,
      speed: Math.random() * 1.2 + 0.5,
      drift: Math.random() * 0.6 - 0.3,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.02 + 0.005,
      opacity: Math.random() * 0.4 + 0.15,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: Math.random() * 0.02 - 0.01,
      color: Math.random() < 0.7
        ? `rgba(248,187,208,` : `rgba(197,202,233,`,
      shape: Math.floor(Math.random() * PETAL_PATHS.length),
    };
  }

  function createStar() {
    const starX = Math.random() * w;
    const starY = Math.random() * h;
    return {
      x: starX, y: starY, size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.6 + 0.1,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      phase: Math.random() * Math.PI * 2,
    };
  }

  for (let i = 0; i < petalCount; i++) {
    const p = createPetal(); p.y = Math.random() * h; petals.push(p);
  }
  for (let i = 0; i < starCount; i++) stars.push(createStar());

  let lastTime = performance.now();
  let animationId;

  function draw(timestamp) {
    const dt = Math.min((timestamp - lastTime) / 16, 3);
    lastTime = timestamp;
    ctx.clearRect(0, 0, w, h);

    // stars
    stars.forEach(s => {
      s.opacity += Math.sin(timestamp * 0.001 * s.twinkleSpeed * 30 + s.phase) * 0.003;
      s.opacity = Math.max(0.05, Math.min(0.7, s.opacity));
      ctx.fillStyle = `rgba(255,249,196,${s.opacity})`;
      ctx.beginPath();
      const cx = s.x, cy = s.y, sz = s.size;
      ctx.moveTo(cx, cy - sz*2);
      ctx.lineTo(cx + sz*0.5, cy - sz*0.5);
      ctx.lineTo(cx + sz*2, cy);
      ctx.lineTo(cx + sz*0.5, cy + sz*0.5);
      ctx.lineTo(cx, cy + sz*2);
      ctx.lineTo(cx - sz*0.5, cy + sz*0.5);
      ctx.lineTo(cx - sz*2, cy);
      ctx.lineTo(cx - sz*0.5, cy - sz*0.5);
      ctx.closePath(); ctx.fill();
    });

    // petals
    petals.forEach(p => {
      p.y += p.speed * dt;
      p.x += p.drift * dt + Math.sin(p.wobble) * 0.5 * dt;
      p.wobble += p.wobbleSpeed * dt;
      p.rotation += p.rotSpeed * dt;
      if (p.y > h + 30) { Object.assign(p, createPetal()); p.y = -30; }

      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color + p.opacity + ')';
      PETAL_PATHS[p.shape](0, 0, p.size);
      ctx.restore();
    });

    animationId = requestAnimationFrame(draw);
  }
  animationId = requestAnimationFrame(draw);

  return () => {
    cancelAnimationFrame(animationId);
    window.removeEventListener('resize', resize);
  };
}
