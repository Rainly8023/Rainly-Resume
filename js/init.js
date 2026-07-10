import { startPetals } from './sakura-petals.js';
import { startStars } from './star-field.js';
import { startClickHearts } from './click-heart.js';
import { initMusicPlayer } from './kawaii-player.js';
import { initTilt } from './tilt.js';
import { initKonami } from './konami.js';
import { initCollapseMode } from './collapse.js';

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

  // Theme logic (Day/Night)
  const hour = new Date().getHours();
  const isNight = hour >= 18 || hour < 6;

  if (isNight) {
    document.documentElement.setAttribute('data-theme', 'dark');
    cleanupFns.push(startStars('bg-canvas'));
  } else {
    document.documentElement.removeAttribute('data-theme');
    cleanupFns.push(startPetals('bg-canvas'));
  }

  // Click hearts canvas
  const heartCanvas = createOverlayCanvas('heart-canvas', 3);
  document.body.appendChild(heartCanvas);
  cleanupFns.push(startClickHearts('heart-canvas'));

  // Init Music Player
  initMusicPlayer();
  
  // Init Tilt Cards
  initTilt();

  // Init Konami Code
  initKonami();
  
  // Init Collapse Mode
  initCollapseMode();

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

  // Register Service Worker for PWA
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(err => {
        console.log('SW registration failed: ', err);
      });
    });
  }

  return cleanupFns;
}
