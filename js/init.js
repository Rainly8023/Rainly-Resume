// js/init.js — 全站特效与交互总入口

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

// ═══════════ Global Toast Utility ═══════════
export function showKawaiiToast(message, icon = '🌸') {
  let container = document.getElementById('kawaii-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'kawaii-toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'kawaii-toast';
  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'all 0.3s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px) scale(0.9)';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}
window.showKawaiiToast = showKawaiiToast;

// ═══════════ Back to Top Button ═══════════
function initBackToTop() {
  let btn = document.getElementById('back-to-top');
  if (!btn) {
    btn = document.createElement('button');
    btn.id = 'back-to-top';
    btn.setAttribute('aria-label', '回到顶部');
    btn.innerHTML = '🌸';
    btn.title = '回到顶部';
    document.body.appendChild(btn);
  }

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showKawaiiToast('飞回顶部啦 🚀', '✨');
  });

  window.addEventListener('scroll', () => {
    if (window.scrollY > 280) {
      btn.classList.add('show');
    } else {
      btn.classList.remove('show');
    }
  }, { passive: true });
}

// ═══════════ Mobile Nav Auto-Close ═══════════
function initMobileNav() {
  const hamburger = document.querySelector('.kawaii-nav .hamburger');
  const navLinks = document.querySelector('.kawaii-nav .nav-links');
  if (!hamburger || !navLinks) return;

  // Close when clicking nav link
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
    });
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.kawaii-nav') && navLinks.classList.contains('open')) {
      navLinks.classList.remove('open');
    }
  });
}

// ═══════════ Main Init Function ═══════════
export function initEffects(options = {}) {
  const cleanupFns = [];

  // Theme Logic (Persisted in localStorage + Fallback to Time)
  const savedTheme = localStorage.getItem('rainly-theme');
  const hour = new Date().getHours();
  const isNightByTime = hour >= 18 || hour < 6;
  const currentTheme = savedTheme || (isNightByTime ? 'dark' : 'light');

  let bgCleanup = null;

  function applyTheme(theme, isUserAction = false) {
    if (bgCleanup) {
      bgCleanup();
      bgCleanup = null;
    }

    const toggleBtn = document.querySelector('.theme-toggle-btn');
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      if (toggleBtn) toggleBtn.innerHTML = '🌙';
      bgCleanup = startStars('bg-canvas');
      if (isUserAction) showKawaiiToast('已切换为暗夜星空模式 🌙', '✨');
    } else {
      document.documentElement.removeAttribute('data-theme');
      if (toggleBtn) toggleBtn.innerHTML = '☀️';
      bgCleanup = startPetals('bg-canvas');
      if (isUserAction) showKawaiiToast('已切换为日间樱花模式 🌸', '🌸');
    }
  }

  // Set initial theme
  applyTheme(currentTheme, false);

  // Mount Theme Toggle Button in Navigation
  const nav = document.querySelector('.kawaii-nav');
  if (nav && !document.querySelector('.theme-toggle-btn')) {
    let rightWrap = nav.querySelector('.nav-right');
    if (!rightWrap) {
      rightWrap = document.createElement('div');
      rightWrap.className = 'nav-right';
      nav.appendChild(rightWrap);
    }
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'theme-toggle-btn';
    toggleBtn.setAttribute('aria-label', '切换深色/浅色模式');
    toggleBtn.title = '切换模式';
    toggleBtn.innerHTML = currentTheme === 'dark' ? '🌙' : '☀️';

    toggleBtn.addEventListener('click', () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const newTheme = isDark ? 'light' : 'dark';
      localStorage.setItem('rainly-theme', newTheme);
      applyTheme(newTheme, true);
    });

    rightWrap.appendChild(toggleBtn);
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

  // Init Back to Top
  initBackToTop();

  // Init Mobile Nav helper
  initMobileNav();

  // Optional: mouse trail
  if (options.mouseTrail) {
    import('./mouse-trail.js').then(({ startMouseTrail }) => {
      const trailCanvas = createOverlayCanvas('trail-canvas', 1);
      document.body.appendChild(trailCanvas);
      cleanupFns.push(startMouseTrail('trail-canvas'));
    });
  }

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    if (bgCleanup) bgCleanup();
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
