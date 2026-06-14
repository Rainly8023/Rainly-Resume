// js/ripple.js — 鼠标水波纹 Canvas 叠加层
let canvas, ctx;
let ripples = [];
let mouseX = -100, mouseY = -100;
let mouseMoving = false;
let idleTimeout;
let animFrameId;
let lastTime = 0;

const RIPPLE_LIFETIME = 1800; // ms
const RIPPLE_MAX_RADIUS = 80;
const RIPPLE_INTERVAL = 120; // ms between ripple spawns
let lastRippleTime = 0;

export function initRipple(canvasEl) {
  canvas = canvasEl;
  ctx = canvas.getContext('2d');
  resize();
  window.addEventListener('resize', resize);

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('click', onClick);

  lastTime = performance.now();
  animFrameId = requestAnimationFrame(render);
}

function resize() {
  canvas.width = canvas.clientWidth * window.devicePixelRatio;
  canvas.height = canvas.clientHeight * window.devicePixelRatio;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
}

function onMouseMove(e) {
  mouseX = e.clientX;
  mouseY = e.clientY;
  mouseMoving = true;

  clearTimeout(idleTimeout);
  idleTimeout = setTimeout(() => { mouseMoving = false; }, 2000);

  const now = performance.now();
  if (now - lastRippleTime > RIPPLE_INTERVAL) {
    lastRippleTime = now;
    spawnRipple(mouseX, mouseY, 0.3);
  }
}

function onClick(e) {
  spawnRipple(e.clientX, e.clientY, 0.8);
}

function spawnRipple(x, y, intensity = 0.5) {
  ripples.push({
    x, y,
    radius: 0,
    maxRadius: RIPPLE_MAX_RADIUS * (0.7 + intensity * 0.6),
    opacity: 0.5 * intensity,
    startTime: performance.now(),
  });

  if (ripples.length > 30) {
    ripples = ripples.slice(-30);
  }
}

function render(now) {
  animFrameId = requestAnimationFrame(render);
  lastTime = now;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!mouseMoving && ripples.length === 0) {
    return;
  }

  ripples = ripples.filter(r => {
    const elapsed = now - r.startTime;
    if (elapsed > RIPPLE_LIFETIME) return false;

    const progress = Math.max(0, Math.min(1, elapsed / RIPPLE_LIFETIME));
    r.radius = r.maxRadius * easeOutCubic(progress);
    const alpha = r.opacity * (1 - progress);

    if (alpha < 0.01) return false;

    const safeRadius = Math.max(0.001, r.radius);

    ctx.beginPath();
    ctx.arc(r.x, r.y, safeRadius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(74,157,138,${alpha})`;
    ctx.lineWidth = 1.5 * (1 - progress);
    ctx.stroke();

    const innerAlpha = alpha * 0.4;
    if (innerAlpha > 0.01) {
      ctx.beginPath();
      ctx.arc(r.x, r.y, safeRadius * 0.6, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(74,157,138,${innerAlpha})`;
      ctx.lineWidth = 1 * (1 - progress);
      ctx.stroke();
    }

    return true;
  });
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

export function destroyRipple() {
  if (animFrameId) cancelAnimationFrame(animFrameId);
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('click', onClick);
}
