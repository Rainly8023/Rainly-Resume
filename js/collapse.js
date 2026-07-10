export function initCollapseMode() {
  const btn = document.createElement('button');
  btn.textContent = '千万别按 💀';
  Object.assign(btn.style, {
    position: 'fixed', bottom: '20px', left: '20px', zIndex: '9999',
    background: '#d32f2f', color: 'white', border: 'none', borderRadius: '4px',
    padding: '8px 12px', fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--font-body)',
    boxShadow: '0 4px 12px rgba(211, 47, 47, 0.4)'
  });
  document.body.appendChild(btn);

  btn.addEventListener('click', () => {
    btn.remove();
    if (!window.Matter) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js';
      script.onload = startCollapse;
      document.body.appendChild(script);
    } else {
      startCollapse();
    }
  });

  function startCollapse() {
    const Engine = Matter.Engine,
          Render = Matter.Render,
          Runner = Matter.Runner,
          Bodies = Matter.Bodies,
          Composite = Matter.Composite,
          Mouse = Matter.Mouse,
          MouseConstraint = Matter.MouseConstraint;

    const engine = Engine.create();
    const render = Render.create({
      element: document.body,
      engine: engine,
      options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
        background: 'transparent'
      }
    });
    
    Render.canvas.style.position = 'fixed';
    Render.canvas.style.top = '0';
    Render.canvas.style.left = '0';
    Render.canvas.style.zIndex = '9998';
    Render.canvas.style.pointerEvents = 'none'; // Will handle mouse via original DOM or Matter Mouse

    // We will replace DOM elements with Matter bodies, or just draw rectangles
    // To make it fun, we hide the actual DOM elements and spawn physical bodies with their screenshot or color.
    // For simplicity without html2canvas, we'll spawn physical blocks of the same color/size as DOM cards and buttons.
    
    const elementsToCollapse = document.querySelectorAll('.blog-card, .about-card, .kawaii-card, .kawaii-btn, img');
    const bodies = [];
    
    elementsToCollapse.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      
      const body = Bodies.rectangle(
        rect.left + rect.width / 2, 
        rect.top + rect.height / 2, 
        rect.width, 
        rect.height, 
        { 
          render: {
            fillStyle: window.getComputedStyle(el).backgroundColor || '#f8bbd0',
            strokeStyle: '#ff4081',
            lineWidth: 2
          },
          restitution: 0.6,
          friction: 0.1
        }
      );
      bodies.push(body);
      el.style.visibility = 'hidden'; // Hide original
    });

    // Add boundaries
    const ground = Bodies.rectangle(window.innerWidth/2, window.innerHeight + 50, window.innerWidth, 100, { isStatic: true });
    const wallLeft = Bodies.rectangle(-50, window.innerHeight/2, 100, window.innerHeight, { isStatic: true });
    const wallRight = Bodies.rectangle(window.innerWidth + 50, window.innerHeight/2, 100, window.innerHeight, { isStatic: true });

    Composite.add(engine.world, [...bodies, ground, wallLeft, wallRight]);

    // Add mouse interaction
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false }
      }
    });
    Composite.add(engine.world, mouseConstraint);
    
    // Enable pointer events for interaction
    Render.canvas.style.pointerEvents = 'auto';

    Render.run(render);
    const runner = Runner.create();
    Runner.run(runner, engine);
  }
}
