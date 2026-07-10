export function initTilt() {
  function applyTilt() {
    const cards = document.querySelectorAll('.blog-card:not(.js-tilt), .about-card:not(.js-tilt), .kawaii-card:not(.js-tilt)');
    if (cards.length > 0 && window.VanillaTilt) {
      VanillaTilt.init(cards, {
        max: 15,
        speed: 400,
        glare: true,
        "max-glare": 0.4,
        scale: 1.02
      });
      cards.forEach(c => c.classList.add('js-tilt'));
    }
  }

  if (!window.VanillaTilt) {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/vanilla-tilt/1.8.0/vanilla-tilt.min.js';
    script.onload = () => {
      applyTilt();
      const observer = new MutationObserver(applyTilt);
      observer.observe(document.body, { childList: true, subtree: true });
    };
    document.body.appendChild(script);
  } else {
    applyTilt();
    const observer = new MutationObserver(applyTilt);
    observer.observe(document.body, { childList: true, subtree: true });
  }
}
