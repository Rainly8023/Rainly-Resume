export function initScratchCard() {
  const html = `
    <div id="scratch-container" style="position: fixed; bottom: 40px; left: 40px; z-index: 100; width: 200px; height: 280px; border-radius: 12px; overflow: hidden; box-shadow: var(--shadow-card); background: var(--card-bg); border: 2px solid var(--sakura-pink); display: flex; flex-direction: column; align-items: center;">
      <div style="padding: 10px; font-family: var(--font-hand); color: var(--sakura-pink); font-weight: bold; text-align: center; font-size: 14px; background: rgba(255,255,255,0.8); width: 100%;">刮开有惊喜 ✨</div>
      <div style="position: relative; width: 180px; height: 220px; margin-bottom: 10px; border-radius: 8px; overflow: hidden; box-shadow: inset 0 0 10px rgba(0,0,0,0.1);">
        <img src="https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&q=80" style="position: absolute; top:0; left:0; width:100%; height:100%; object-fit: cover;" alt="Secret Anime Girl">
        <canvas id="scratch-canvas" style="position: absolute; top:0; left:0; width:100%; height:100%;"></canvas>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', html);

  const canvas = document.getElementById('scratch-canvas');
  const ctx = canvas.getContext('2d');
  
  // Set canvas size to match CSS size
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  // Fill with silver coating
  ctx.fillStyle = '#b0bec5';
  ctx.fillRect(0, 0, rect.width, rect.height);
  
  // Add some pattern text to the coating
  ctx.fillStyle = '#90a4ae';
  ctx.font = 'bold 20px "Noto Sans SC"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('SCRATCH ME', rect.width / 2, rect.height / 2);

  let isDrawing = false;

  function getPos(e) {
    const r = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - r.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - r.top;
    return { x, y };
  }

  function startDraw(e) {
    isDrawing = true;
    draw(e);
  }

  function stopDraw() {
    isDrawing = false;
  }

  function draw(e) {
    if (!isDrawing) return;
    const { x, y } = getPos(e);
    
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();
  }

  canvas.addEventListener('mousedown', startDraw);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDraw);
  canvas.addEventListener('mouseleave', stopDraw);

  canvas.addEventListener('touchstart', startDraw, { passive: true });
  canvas.addEventListener('touchmove', draw, { passive: true });
  canvas.addEventListener('touchend', stopDraw);
}
