export function initKonami() {
  const konamiCode = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'b', 'a'
  ];
  let konamiPosition = 0;

  document.addEventListener('keydown', (e) => {
    if (e.key === konamiCode[konamiPosition]) {
      konamiPosition++;
      if (konamiPosition === konamiCode.length) {
        triggerEasterEgg();
        konamiPosition = 0;
      }
    } else {
      konamiPosition = 0;
    }
  });

  function triggerEasterEgg() {
    // Dispatch a custom event so other scripts (like sakura-petals) can react
    const event = new CustomEvent('konami-egg');
    document.dispatchEvent(event);
    
    // Add visual feedback
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.background = 'radial-gradient(circle, rgba(255,0,100,0.4) 0%, rgba(255,0,0,0) 70%)';
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '9999';
    overlay.style.transition = 'opacity 1s';
    document.body.appendChild(overlay);

    setTimeout(() => {
      overlay.style.opacity = '0';
      setTimeout(() => overlay.remove(), 1000);
    }, 4000);
  }
}
