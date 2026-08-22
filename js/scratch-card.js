// js/scratch-card.js — 刮刮乐小组件

export function initScratchCard() {
  const html = `
    <!-- Floating Scratch Badge -->
    <div id="scratch-toggle-btn" style="position: fixed; bottom: 24px; left: 24px; z-index: 999; background: var(--card-bg); backdrop-filter: var(--glass-blur); border: 2px solid var(--sakura-pink); border-radius: var(--radius-full); padding: 8px 16px; display: flex; align-items: center; gap: 8px; box-shadow: var(--shadow-float); cursor: pointer; transition: all 0.3s var(--ease-bounce);">
      <span style="font-size: 18px;">🎁</span>
      <span style="font-family: var(--font-hand); font-size: 13px; color: var(--sakura-pink); font-weight: bold;">刮开有惊喜</span>
    </div>

    <!-- Scratch Modal Box -->
    <div id="scratch-modal-box" style="position: fixed; bottom: 80px; left: 24px; z-index: 1000; width: 220px; border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow-float); background: var(--card-bg); backdrop-filter: var(--glass-blur); border: 2px solid var(--sakura-pink); display: none; flex-direction: column; align-items: center; animation: modalPop 0.3s var(--ease-bounce);">
      <div style="padding: 10px 14px; font-family: var(--font-hand); color: var(--sakura-pink); font-weight: bold; text-align: center; font-size: 14px; display: flex; justify-content: space-between; align-items: center; width: 100%; border-bottom: 1px solid var(--sakura-pink-20);">
        <span>✨ 少女刮刮乐</span>
        <button id="scratch-close-btn" style="background: none; border: none; font-size: 16px; color: var(--text-muted); cursor: pointer;">✕</button>
      </div>
      <div style="position: relative; width: 190px; height: 230px; margin: 12px 0 14px; border-radius: var(--radius-sm); overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.15);">
        <img src="https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&q=80" style="position: absolute; top:0; left:0; width:100%; height:100%; object-fit: cover;" alt="Secret Anime Girl">
        <canvas id="scratch-canvas" style="position: absolute; top:0; left:0; width:100%; height:100%;"></canvas>
      </div>
    </div>
    <style>
      @keyframes modalPop {
        0% { opacity: 0; transform: translateY(20px) scale(0.9); }
        100% { opacity: 1; transform: translateY(0) scale(1); }
      }
      #scratch-toggle-btn:hover {
        transform: translateY(-4px) scale(1.05);
        box-shadow: 0 10px 30px var(--sakura-glow);
      }
    </style>
  `;
  document.body.insertAdjacentHTML('beforeend', html);

  const toggleBtn = document.getElementById('scratch-toggle-btn');
  const modalBox = document.getElementById('scratch-modal-box');
  const closeBtn = document.getElementById('scratch-close-btn');
  const canvas = document.getElementById('scratch-canvas');
  const ctx = canvas.getContext('2d');

  let isOpen = false;
  let isInitialized = false;

  function initCanvas() {
    if (isInitialized) return;
    isInitialized = true;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Silver coating
    ctx.fillStyle = '#b0bec5';
    ctx.fillRect(0, 0, rect.width, rect.height);
    
    // Pattern text
    ctx.fillStyle = '#78909c';
    ctx.font = 'bold 16px "Noto Sans SC", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✨ 刮开有惊喜 ✨', rect.width / 2, rect.height / 2);
  }

  toggleBtn.addEventListener('click', () => {
    isOpen = !isOpen;
    modalBox.style.display = isOpen ? 'flex' : 'none';
    if (isOpen) {
      setTimeout(initCanvas, 50);
    }
  });

  closeBtn.addEventListener('click', () => {
    isOpen = false;
    modalBox.style.display = 'none';
  });

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
    ctx.arc(x, y, 18, 0, Math.PI * 2);
    ctx.fill();
  }

  canvas.addEventListener('mousedown', startDraw);
  canvas.addEventListener('mousemove', draw);
  window.addEventListener('mouseup', stopDraw);

  canvas.addEventListener('touchstart', startDraw, { passive: true });
  canvas.addEventListener('touchmove', draw, { passive: true });
  window.addEventListener('touchend', stopDraw);
}
