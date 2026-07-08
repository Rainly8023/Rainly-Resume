// js/init.js — 公共页面效果初始化
import { startPetals } from './sakura-petals.js';
import { startClickHearts } from './click-heart.js';

function createOverlayCanvas(id, zIndex) {
  const c = document.createElement('canvas');
  c.id = id;
  Object.assign(c.style, {
    position: 'fixed', top: '0', left: '0',
    width: '100%', height: '100%',
    zIndex: String(zIndex), pointerEvents: 'none'
  });
  return c;
}

export function initEffects(options = {}) {
  const cleanupFns = [];

  // Sakura petals on bg canvas
  cleanupFns.push(startPetals('bg-canvas'));

  // Click hearts canvas
  const heartCanvas = createOverlayCanvas('heart-canvas', 3);
  document.body.appendChild(heartCanvas);
  cleanupFns.push(startClickHearts('heart-canvas'));

  // Optional: mouse trail (only on index page)
  if (options.mouseTrail) {
    import('./mouse-trail.js').then(({ startMouseTrail }) => {
      const trailCanvas = createOverlayCanvas('trail-canvas', 1);
      document.body.appendChild(trailCanvas);
      cleanupFns.push(startMouseTrail('trail-canvas'));
    });
  }

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    cleanupFns.forEach(fn => fn?.());
  });

  return cleanupFns;
}
