export function startStars(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });
  let width, height;
  let stars = [];
  let animationFrameId;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initStars();
  }

  function initStars() {
    stars = [];
    const numStars = Math.floor((width * height) / 8000);
    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.5 + 0.5,
        dx: (Math.random() - 0.5) * 0.5,
        dy: (Math.random() - 0.5) * 0.5,
        alpha: Math.random(),
        da: (Math.random() * 0.02) + 0.005,
      });
    }
  }

  let paused = false;

  function draw() {
    if (paused) return;
    ctx.clearRect(0, 0, width, height);
    stars.forEach(star => {
      star.x += star.dx;
      star.y += star.dy;
      star.alpha += star.da;

      if (star.alpha <= 0 || star.alpha >= 1) {
        star.da = -star.da;
      }
      
      if (star.x < 0) star.x = width;
      if (star.x > width) star.x = 0;
      if (star.y < 0) star.y = height;
      if (star.y > height) star.y = 0;

      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
      ctx.fill();
    });
    animationFrameId = requestAnimationFrame(draw);
  }

  function onVisibilityChange() {
    if (document.hidden) {
      cancelAnimationFrame(animationFrameId);
      paused = true;
    } else if (paused) {
      paused = false;
      animationFrameId = requestAnimationFrame(draw);
    }
  }

  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', onVisibilityChange);
  resize();
  draw();

  return () => {
    window.removeEventListener('resize', resize);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    cancelAnimationFrame(animationFrameId);
  };
}
