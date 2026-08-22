// js/collapse.js — 物理重力坍塌彩蛋 (Matter.js)

export function initCollapseMode() {
  // Only inject if not already injected
  if (document.getElementById('collapse-egg-btn')) return;

  const btn = document.createElement('button');
  btn.id = 'collapse-egg-btn';
  btn.textContent = '物理坍塌 💀';
  btn.title = '触发重力坍塌物理特效';
  Object.assign(btn.style, {
    position: 'fixed', bottom: '86px', left: '24px', zIndex: '998',
    background: 'rgba(211, 47, 47, 0.85)', color: 'white', border: 'none', borderRadius: 'var(--radius-full)',
    padding: '6px 14px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'var(--font-body)',
    boxShadow: '0 4px 12px rgba(211, 47, 47, 0.3)', backdropFilter: 'blur(8px)',
    transition: 'all 0.3s var(--ease-bounce)', opacity: '0.6'
  });

  btn.addEventListener('mouseenter', () => { btn.style.opacity = '1'; btn.style.transform = 'scale(1.08)'; });
  btn.addEventListener('mouseleave', () => { btn.style.opacity = '0.6'; btn.style.transform = 'scale(1)'; });

  document.body.appendChild(btn);

  btn.addEventListener('click', () => {
    btn.remove();
    if (window.showKawaiiToast) window.showKawaiiToast('⚠️ 空间重力紊乱中... 坍塌启动！', '💥');
    
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
    Render.canvas.style.pointerEvents = 'none';

    const elementsToCollapse = document.querySelectorAll('.blog-card, .about-card, .kawaii-card, .kawaii-btn, .fortune-card, .polaroid-card, img');
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
            strokeStyle: '#ec407a',
            lineWidth: 2
          },
          restitution: 0.6,
          friction: 0.1
        }
      );
      bodies.push(body);
      el.style.visibility = 'hidden';
    });

    // Boundaries
    const ground = Bodies.rectangle(window.innerWidth/2, window.innerHeight + 50, window.innerWidth, 100, { isStatic: true });
    const wallLeft = Bodies.rectangle(-50, window.innerHeight/2, 100, window.innerHeight, { isStatic: true });
    const wallRight = Bodies.rectangle(window.innerWidth + 50, window.innerHeight/2, 100, window.innerHeight, { isStatic: true });

    Composite.add(engine.world, [...bodies, ground, wallLeft, wallRight]);

    // Mouse interaction
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false }
      }
    });
    Composite.add(engine.world, mouseConstraint);
    
    Render.canvas.style.pointerEvents = 'auto';

    Render.run(render);
    const runner = Runner.create();
    Runner.run(runner, engine);
  }
}
