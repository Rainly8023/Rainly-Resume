# Kawaii 二次元个人站 · 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 从零重建二次元 Kawaii 风格个人网站——3D 拍立得画廊 + 少女漫画风博客 + CMS

**Architecture:** 纯静态多页面（SPA 式 hash 路由），Three.js 驱动 3D 画廊，marked.js 渲染博客，Decap CMS 管理内容。所有库 CDN 加载，零构建步骤。

**Tech Stack:** Vanilla HTML/CSS/JS, Three.js 0.160 CDN, GSAP 3.12 CDN, marked.js CDN, Decap CMS

---

### Task 1: 清理旧项目文件

**Files:**
- Remove: all tracked files except `.git/`, `.gitignore`, `CNAME`, `.nojekyll`

- [ ] **Step 1: 删除所有旧文件，保留 Git 基础设施**

```bash
cd /Volumes/Soft/Webiste
rm -rf css js travel content admin .tina .claude .superpowers node_modules package.json package-lock.json vercel.json index.html travel.html docs
```

- [ ] **Step 2: 创建新项目目录结构**

```bash
mkdir -p css js content/posts content/settings images/gallery images/posts admin
```

- [ ] **Step 3: 验证结构**

```bash
ls -la
# Expected: .git .gitignore CNAME .nojekyll admin/ content/ css/ images/ js/
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "chore: clear old project, scaffold new kawaii site structure"
```

---

### Task 2: 全局 CSS 样式

**Files:**
- Create: `css/kawaii.css`

- [ ] **Step 1: 编写全局 Kawaii CSS**

```css
/* css/kawaii.css — Kawaii 二次元全局样式 */

/* ═══════════ CSS Variables ═══════════ */
:root {
  --sakura-pink: #f8bbd0;
  --sakura-light: #fce4ec;
  --lavender: #c5cae9;
  --lavender-light: #e8eaf6;
  --cream-yellow: #fff9c4;
  --sky-blue: #b2ebf2;
  --sky-light: #e0f7fa;
  --bg: #fafafa;
  --text: #5d4037;
  --text-light: #8d6e63;
  --card-bg: rgba(255,255,255,0.85);
  --glass-bg: rgba(255,255,255,0.6);
  --glass-border: rgba(255,255,255,0.8);
  --shadow-soft: 0 4px 20px rgba(248,187,208,0.2);
  --shadow-card: 0 8px 32px rgba(149,117,205,0.15);
  --radius-sm: 8px;
  --radius: 16px;
  --radius-lg: 24px;
  --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
  --font-display: 'Noto Serif SC', 'Georgia', serif;
  --font-body: 'Noto Sans SC', -apple-system, sans-serif;
  --font-hand: 'Klee One', 'ZCOOL KuaiLe', cursive;
}

/* ═══════════ Reset ═══════════ */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html { background: var(--bg); scroll-behavior: smooth; overflow-x: hidden; }

body {
  font-family: var(--font-body);
  color: var(--text);
  background: var(--bg);
  min-height: 100vh;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}

/* ═══════════ Canvas Background Layer ═══════════ */
#bg-canvas {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  z-index: 0; pointer-events: none;
}

/* ═══════════ Navigation ═══════════ */
.kawaii-nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 32px;
  background: rgba(250,250,250,0.75);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(248,187,208,0.25);
}
.kawaii-nav .nav-brand {
  font-family: var(--font-hand); font-size: 20px;
  color: var(--sakura-pink); text-decoration: none;
  letter-spacing: 2px;
}
.kawaii-nav .nav-links { display: flex; gap: 24px; }
.kawaii-nav .nav-links a {
  font-size: 13px; color: var(--text-light); text-decoration: none;
  letter-spacing: 1px; position: relative; padding: 4px 0;
  transition: color 0.3s;
}
.kawaii-nav .nav-links a::after {
  content: ''; position: absolute; bottom: -2px; left: 0; width: 0; height: 2px;
  background: var(--sakura-pink); border-radius: 1px;
  transition: width 0.3s var(--ease-bounce);
}
.kawaii-nav .nav-links a:hover { color: var(--sakura-pink); }
.kawaii-nav .nav-links a:hover::after { width: 100%; }
.kawaii-nav .nav-links a.active { color: var(--sakura-pink); }
.kawaii-nav .nav-links a.active::after { width: 100%; }

/* ═══════════ Page Container ═══════════ */
.page { position: relative; z-index: 1; min-height: 100vh; }

/* ═══════════ Buttons ═══════════ */
.kawaii-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 12px 28px; border-radius: 50px; border: 2px solid var(--sakura-pink);
  background: white; color: var(--sakura-pink);
  font-family: var(--font-body); font-size: 14px; letter-spacing: 2px;
  cursor: pointer; text-decoration: none;
  transition: all 0.3s var(--ease-bounce);
  box-shadow: 0 2px 12px rgba(248,187,208,0.15);
}
.kawaii-btn:hover {
  background: var(--sakura-pink); color: white;
  transform: translateY(-3px) scale(1.03);
  box-shadow: 0 8px 28px rgba(248,187,208,0.35);
}
.kawaii-btn.purple { border-color: var(--lavender); color: #7c6ba0; }
.kawaii-btn.purple:hover { background: var(--lavender); color: #5c4d80; }

/* ═══════════ Cards ═══════════ */
.kawaii-card {
  background: var(--card-bg); border-radius: var(--radius);
  border: 1px solid rgba(248,187,208,0.2);
  box-shadow: var(--shadow-soft);
  padding: 24px; transition: all 0.4s var(--ease-bounce);
}
.kawaii-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-card);
  border-color: rgba(248,187,208,0.4);
}

/* ═══════════ Blog Magazine Cards ═══════════ */
.blog-card {
  background: white; border-radius: var(--radius);
  overflow: hidden; border: 1px solid rgba(248,187,208,0.2);
  box-shadow: var(--shadow-soft);
  transition: all 0.4s var(--ease-bounce);
  cursor: pointer;
}
.blog-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 48px rgba(149,117,205,0.2);
  border-color: rgba(248,187,208,0.4);
}
.blog-card .card-img {
  width: 100%; height: 200px; object-fit: cover;
  transition: transform 0.6s;
}
.blog-card:hover .card-img { transform: scale(1.05); }
.blog-card .card-body { padding: 20px; }
.blog-card .card-body h3 {
  font-family: var(--font-display); font-size: 18px;
  color: var(--text); margin-bottom: 8px;
}
.blog-card .card-body .meta {
  font-size: 12px; color: var(--text-light); letter-spacing: 1px;
  margin-bottom: 10px;
}
.blog-card .card-body .summary {
  font-size: 13px; color: var(--text-light); line-height: 1.8;
}

/* ═══════════ Ornament Divider ═══════════ */
.ornament-divider {
  display: flex; align-items: center; gap: 12px;
  max-width: 600px; margin: 32px auto;
  font-family: var(--font-hand); font-size: 13px;
  color: var(--sakura-pink); letter-spacing: 3px;
}
.ornament-divider::before, .ornament-divider::after {
  content: '✦'; flex: 1; height: 1px;
  background: linear-gradient(to right, transparent, var(--sakura-pink), transparent);
  color: transparent;
}

/* ═══════════ Ribbon ═══════════ */
.ribbon {
  display: inline-block; position: relative;
  padding: 6px 24px;
  background: linear-gradient(135deg, var(--sakura-light), var(--lavender-light));
  font-family: var(--font-hand); font-size: 13px;
  letter-spacing: 2px; color: var(--text);
  border-radius: 3px;
}
.ribbon::before, .ribbon::after {
  content: ''; position: absolute; top: 50%;
  width: 12px; height: 12px; transform: translateY(-50%) rotate(45deg);
}
.ribbon::before { left: -6px; background: var(--sakura-light); }
.ribbon::after { right: -6px; background: var(--lavender-light); }

/* ═══════════ Hero Section ═══════════ */
.hero {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; min-height: 100vh; text-align: center;
  position: relative; z-index: 2;
}
.hero h1 {
  font-family: var(--font-hand); font-size: clamp(48px, 10vw, 96px);
  color: var(--sakura-pink); letter-spacing: 6px;
  animation: breathe 3s ease-in-out infinite;
  text-shadow: 0 0 40px rgba(248,187,208,0.3);
}
@keyframes breathe {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.85; transform: scale(1.02); }
}
.hero .subtitle {
  font-family: var(--font-display); font-size: 16px;
  color: var(--text-light); letter-spacing: 6px;
  margin-top: 16px;
}
.hero-nav { display: flex; gap: 16px; margin-top: 40px; flex-wrap: wrap; justify-content: center; }

/* ═══════════ Gallery Page ═══════════ */
#gallery-canvas {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 0;
}
.gallery-info {
  position: fixed; bottom: 40px; left: 50%; transform: translateX(-50%);
  z-index: 10; text-align: center;
  font-size: 12px; color: var(--text-light); letter-spacing: 2px;
  opacity: 0.7;
}
.gallery-detail {
  position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
  z-index: 20; background: var(--glass-bg); backdrop-filter: blur(20px);
  border-radius: var(--radius-lg); border: 1px solid var(--glass-border);
  padding: 32px; max-width: 500px; width: 90%; text-align: center;
  box-shadow: 0 20px 60px rgba(149,117,205,0.25);
  display: none; /* shown via JS */
}
.gallery-detail img { width: 100%; border-radius: var(--radius-sm); margin-bottom: 16px; }
.gallery-detail h3 { font-family: var(--font-hand); font-size: 24px; color: var(--sakura-pink); }
.gallery-detail p { font-size: 14px; color: var(--text-light); margin-top: 8px; line-height: 1.8; }

/* ═══════════ Blog List Page ═══════════ */
.blog-hero {
  padding: 140px 40px 60px; text-align: center;
}
.blog-hero h2 {
  font-family: var(--font-display); font-size: clamp(32px, 6vw, 56px);
  color: var(--sakura-pink); letter-spacing: 4px;
}
.blog-hero .featured {
  margin-top: 40px; max-width: 800px; margin-left: auto; margin-right: auto;
}
.blog-hero .featured img {
  width: 100%; max-height: 400px; object-fit: cover; border-radius: var(--radius);
  box-shadow: var(--shadow-card);
}
.blog-hero .featured h3 {
  margin-top: 16px; font-family: var(--font-display); font-size: 24px;
}
.blog-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 28px; max-width: 1100px; margin: 0 auto; padding: 0 32px 80px;
}

/* ═══════════ Blog Detail Page ═══════════ */
.blog-detail { max-width: 720px; margin: 0 auto; padding: 140px 24px 80px; }
.blog-detail .cover { width: 100%; border-radius: var(--radius); margin-bottom: 32px; }
.blog-detail h1 { font-family: var(--font-display); font-size: 36px; color: var(--text); }
.blog-detail .date { font-size: 13px; color: var(--text-light); margin: 12px 0 32px; }
.blog-detail .content { font-size: 15px; line-height: 2; color: var(--text); }
.blog-detail .content p { margin-bottom: 20px; }
.blog-detail .content img { max-width: 100%; border-radius: var(--radius-sm); }
.progress-bar {
  position: fixed; top: 0; left: 0; height: 3px;
  background: linear-gradient(to right, var(--sakura-pink), var(--lavender));
  z-index: 200; transform-origin: left; transform: scaleX(0);
}

/* ═══════════ About Page ═══════════ */
.about-container { display: flex; align-items: center; justify-content: center; min-height: 100vh; }
.about-card {
  background: var(--glass-bg); backdrop-filter: blur(20px);
  border-radius: var(--radius-lg); border: 1px solid var(--glass-border);
  padding: 48px; max-width: 420px; width: 90%; text-align: center;
  box-shadow: 0 20px 60px rgba(149,117,205,0.2);
}
.about-card .avatar {
  width: 120px; height: 120px; border-radius: 50%; object-fit: cover;
  border: 4px solid var(--sakura-pink);
  box-shadow: 0 0 30px rgba(248,187,208,0.4);
}
.about-card h3 { font-family: var(--font-hand); font-size: 28px; margin-top: 20px; }
.about-card .bio { font-size: 14px; color: var(--text-light); margin: 12px 0 20px; line-height: 1.8; }
.about-card .tags { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; margin-bottom: 24px; }
.about-card .tags span {
  padding: 4px 14px; border-radius: 20px; font-size: 12px;
  background: var(--sakura-light); color: var(--sakura-pink);
}
.about-card .social-links { display: flex; gap: 16px; justify-content: center; }

/* ═══════════ Scroll Reveal ═══════════ */
.reveal { opacity: 0; transform: translateY(30px); transition: all 0.8s ease; }
.reveal.visible { opacity: 1; transform: translateY(0); }

/* ═══════════ Utility ═══════════ */
.hidden { display: none !important; }

/* ═══════════ Mobile ═══════════ */
@media (max-width: 768px) {
  .kawaii-nav { padding: 10px 16px; }
  .kawaii-nav .nav-links { gap: 14px; }
  .kawaii-nav .nav-links a { font-size: 11px; }
  .blog-grid { grid-template-columns: 1fr; padding: 0 16px 60px; }
  .hero-nav { flex-direction: column; align-items: center; }
}
```

- [ ] **Step 2: Commit**

```bash
git add css/kawaii.css && git commit -m "feat: add global kawaii CSS styles"
```

---

### Task 3: 共享 JS 模块 — 花瓣粒子 + 鼠标尾迹 + 点击爱心 + 滚动淡入

**Files:**
- Create: `js/sakura-petals.js`
- Create: `js/mouse-trail.js`
- Create: `js/click-heart.js`
- Create: `js/scroll-reveal.js`

- [ ] **Step 1: 编写花瓣粒子系统**

```javascript
// js/sakura-petals.js — 樱花花瓣 + 星星 Canvas 动画

export function startPetals(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let w, h, petals = [], stars = [];
  const isMobile = window.innerWidth < 768;
  const petalCount = isMobile ? 15 : 30;
  const starCount = isMobile ? 20 : 50;

  function resize() {
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  // petal shapes
  const PETAL_PATHS = [
    (x, y, s) => { ctx.beginPath(); ctx.ellipse(x, y, s*5, s*2.5, 0.4, 0, Math.PI*2); ctx.fill(); },
    (x, y, s) => { ctx.beginPath(); ctx.ellipse(x, y, s*4, s*3, 0, 0, Math.PI*2); ctx.fill(); },
  ];

  function createPetal() {
    return {
      x: Math.random() * w, y: -20,
      size: Math.random() * 6 + 4,
      speed: Math.random() * 1.2 + 0.5,
      drift: Math.random() * 0.6 - 0.3,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.02 + 0.005,
      opacity: Math.random() * 0.4 + 0.15,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: Math.random() * 0.02 - 0.01,
      color: Math.random() < 0.7
        ? `rgba(248,187,208,` : `rgba(197,202,233,`,
      shape: Math.floor(Math.random() * PETAL_PATHS.length),
    };
  }

  function createStar() {
    const starX = Math.random() * w;
    const starY = Math.random() * h;
    return {
      x: starX, y: starY, size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.6 + 0.1,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      phase: Math.random() * Math.PI * 2,
    };
  }

  for (let i = 0; i < petalCount; i++) {
    const p = createPetal(); p.y = Math.random() * h; petals.push(p);
  }
  for (let i = 0; i < starCount; i++) stars.push(createStar());

  let lastTime = performance.now();

  function draw(timestamp) {
    const dt = Math.min((timestamp - lastTime) / 16, 3);
    lastTime = timestamp;
    ctx.clearRect(0, 0, w, h);

    // stars
    stars.forEach(s => {
      s.opacity += Math.sin(timestamp * 0.001 * s.twinkleSpeed * 30 + s.phase) * 0.003;
      s.opacity = Math.max(0.05, Math.min(0.7, s.opacity));
      ctx.fillStyle = `rgba(255,249,196,${s.opacity})`;
      ctx.beginPath();
      // 4-point star
      const cx = s.x, cy = s.y, sz = s.size;
      ctx.moveTo(cx, cy - sz*2);
      ctx.lineTo(cx + sz*0.5, cy - sz*0.5);
      ctx.lineTo(cx + sz*2, cy);
      ctx.lineTo(cx + sz*0.5, cy + sz*0.5);
      ctx.lineTo(cx, cy + sz*2);
      ctx.lineTo(cx - sz*0.5, cy + sz*0.5);
      ctx.lineTo(cx - sz*2, cy);
      ctx.lineTo(cx - sz*0.5, cy - sz*0.5);
      ctx.closePath(); ctx.fill();
    });

    // petals
    petals.forEach(p => {
      p.y += p.speed * dt;
      p.x += p.drift * dt + Math.sin(p.wobble) * 0.5 * dt;
      p.wobble += p.wobbleSpeed * dt;
      p.rotation += p.rotSpeed * dt;
      if (p.y > h + 30) { Object.assign(p, createPetal()); p.y = -30; }

      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color + p.opacity + ')';
      PETAL_PATHS[p.shape](0, 0, p.size);
      ctx.restore();
    });

    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
}
```

- [ ] **Step 2: 编写鼠标尾迹**

```javascript
// js/mouse-trail.js — 鼠标移动时的彩色粒子尾迹

export function startMouseTrail(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let w, h;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const trails = [];
  const maxTrails = 40;
  let mouseX = -100, mouseY = -100;
  const isMobile = window.innerWidth < 768;

  function resize() {
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });
  document.addEventListener('mouseleave', () => { mouseX = -100; mouseY = -100; });
  // touch
  document.addEventListener('touchmove', e => {
    mouseX = e.touches[0].clientX; mouseY = e.touches[0].clientY;
  }, { passive: true });
  document.addEventListener('touchend', () => { mouseX = -100; mouseY = -100; });

  const colors = ['#f8bbd0','#c5cae9','#fff9c4','#b2ebf2','#f48fb1','#ce93d8'];
  let lastEmit = 0;

  function draw(timestamp) {
    ctx.clearRect(0, 0, w, h);

    if (mouseX > 0 && mouseY > 0 && timestamp - lastEmit > 25 && trails.length < maxTrails && !isMobile) {
      trails.push({
        x: mouseX, y: mouseY,
        vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2,
        life: 1, decay: Math.random() * 0.02 + 0.015,
        size: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
      lastEmit = timestamp;
    }

    for (let i = trails.length - 1; i >= 0; i--) {
      const t = trails[i];
      t.x += t.vx; t.y += t.vy;
      t.life -= t.decay;
      if (t.life <= 0) { trails.splice(i, 1); continue; }
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.size * t.life, 0, Math.PI * 2);
      const alpha = Math.floor(t.life * 0.6 * 255).toString(16).padStart(2, '0');
      ctx.fillStyle = t.color + alpha;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
}
```

- [ ] **Step 3: 编写点击爱心爆散**

```javascript
// js/click-heart.js — 点击空白处产生爱心/星星爆散

export function startClickHearts(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let w, h;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const particles = [];

  function resize() {
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  function heartPath(cx, cy, s) {
    ctx.beginPath();
    const top = cy - s * 0.4;
    ctx.moveTo(cx, top + s);
    ctx.bezierCurveTo(cx - s, top + s*0.6, cx - s, top - s*0.3, cx, top);
    ctx.bezierCurveTo(cx + s, top - s*0.3, cx + s, top + s*0.6, cx, top + s);
    ctx.closePath();
  }

  function starPath(cx, cy, s) {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
      const outerR = s;
      const innerR = s * 0.4;
      i === 0 ? ctx.moveTo(cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR)
             : ctx.lineTo(cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR);
      ctx.lineTo(cx + Math.cos(angle + Math.PI/5) * innerR, cy + Math.sin(angle + Math.PI/5) * innerR);
    }
    ctx.closePath();
  }

  function burst(x, y) {
    const count = 12;
    const isHeart = Math.random() < 0.6;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
      const speed = Math.random() * 3 + 1.5;
      particles.push({
        x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 2,
        life: 1, decay: Math.random() * 0.015 + 0.01,
        size: Math.random() * 8 + 4,
        isHeart, rotation: Math.random() * Math.PI * 2,
        color: ['#f8bbd0','#f48fb1','#c5cae9','#fff9c4','#ce93d8'][Math.floor(Math.random()*5)],
      });
    }
  }

  document.addEventListener('click', e => {
    if (e.target.closest('a, button, .photo-card, .blog-card, .gallery-detail')) return;
    burst(e.clientX, e.clientY);
  });

  function draw(timestamp) {
    ctx.clearRect(0, 0, w, h);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy; p.vy += 0.04;
      p.life -= p.decay; p.rotation += 0.05;
      if (p.life <= 0) { particles.splice(i, 1); continue; }

      ctx.save();
      ctx.globalAlpha = p.life * 0.7;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      if (p.isHeart) heartPath(0, 0, p.size * p.life);
      else starPath(0, 0, p.size * p.life);
      ctx.fill();
      ctx.restore();
    }
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
}
```

- [ ] **Step 4: 编写滚动淡入**

```javascript
// js/scroll-reveal.js — Intersection Observer 滚动淡入

export function initScrollReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}
```

- [ ] **Step 5: Commit**

```bash
git add js/sakura-petals.js js/mouse-trail.js js/click-heart.js js/scroll-reveal.js
git commit -m "feat: add shared JS modules — petals, mouse trail, click hearts, scroll reveal"
```

---

### Task 4: 首页 (`index.html`)

**Files:**
- Create: `index.html`

- [ ] **Step 1: 编写首页 HTML**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rainly · 星空入口</title>
  <meta name="description" content="Rainly 的二次元小站 —— 美少女画廊 & 博客">
  <meta name="theme-color" content="#fce4ec">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌸</text></svg>">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500&family=Noto+Serif+SC:wght@200;300;400&family=Klee+One&family=ZCOOL+KuaiLe&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/kawaii.css">
</head>
<body>

  <canvas id="bg-canvas"></canvas>

  <nav class="kawaii-nav">
    <a href="/" class="nav-brand">🌸 Rainly</a>
    <div class="nav-links">
      <a href="/" class="active">首页</a>
      <a href="/gallery">画廊</a>
      <a href="/blog">博客</a>
      <a href="/about">关于</a>
    </div>
  </nav>

  <div class="hero">
    <h1>Rainly</h1>
    <p class="subtitle">✦ 星と花の小世界 ✦</p>
    <div class="hero-nav">
      <a href="/gallery" class="kawaii-btn">🌸 美少女画廊</a>
      <a href="/blog" class="kawaii-btn purple">📖 博客</a>
      <a href="/about" class="kawaii-btn">💝 关于我</a>
    </div>
  </div>

  <script type="importmap">
  { "imports": { "three": "https://unpkg.com/three@0.160.0/build/three.module.js" } }
  </script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"
    integrity="sha384-g4NTh/Iv5PPU4xPyhEWqPcwtNXOvdaDI8LLnyYfyNZOjKJeYQyjzQ9X5275eBjpt"
    crossorigin="anonymous"></script>

  <script type="module">
    import { startPetals } from './js/sakura-petals.js';
    import { startMouseTrail } from './js/mouse-trail.js';
    import { startClickHearts } from './js/click-heart.js';

    startPetals('bg-canvas');
    // share same canvas for trail and hearts
    const trailCanvas = document.createElement('canvas');
    trailCanvas.id = 'trail-canvas';
    Object.assign(trailCanvas.style, { position:'fixed', top:'0', left:'0', width:'100%', height:'100%', zIndex:'1', pointerEvents:'none' });
    document.body.appendChild(trailCanvas);
    startMouseTrail('trail-canvas');

    const heartCanvas = document.createElement('canvas');
    heartCanvas.id = 'heart-canvas';
    Object.assign(heartCanvas.style, { position:'fixed', top:'0', left:'0', width:'100%', height:'100%', zIndex:'3', pointerEvents:'none' });
    document.body.appendChild(heartCanvas);
    startClickHearts('heart-canvas');
  </script>
</body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add index.html && git commit -m "feat: add home page with sakura petals and hero"
```

---

### Task 5: 画廊页 — Three.js 3D 拍立得旋转木马

**Files:**
- Create: `js/gallery-3d.js`
- Create: `gallery.html`

- [ ] **Step 1: 编写 Three.js 画廊核心逻辑**

```javascript
// js/gallery-3d.js — Three.js 3D 拍立得旋转木马

import * as THREE from 'three';

export function initGallery(containerId, photos) {
  const container = document.getElementById(containerId);
  if (!container || photos.length === 0) return;

  const w = window.innerWidth, h = window.innerHeight;
  const isMobile = w < 768;

  // Scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xfafafa);

  // Camera
  const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100);
  camera.position.set(0, 0.5, isMobile ? 8 : 7);
  camera.lookAt(0, 0, 0);

  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  // Lights
  const ambientLight = new THREE.AmbientLight(0xfff0f5, 1.5);
  scene.add(ambientLight);
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
  dirLight.position.set(2, 5, 5);
  scene.add(dirLight);
  const pinkLight = new THREE.PointLight(0xf8bbd0, 1.5, 20);
  pinkLight.position.set(-3, 1, 3);
  scene.add(pinkLight);
  const purpleLight = new THREE.PointLight(0xc5cae9, 1.2, 20);
  purpleLight.position.set(3, -1, -2);
  scene.add(purpleLight);

  // Particles (background stars in 3D)
  const starsGeo = new THREE.BufferGeometry();
  const starsCount = 200;
  const starsPositions = new Float32Array(starsCount * 3);
  for (let i = 0; i < starsCount * 3; i += 3) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    const r = 12 + Math.random() * 8;
    starsPositions[i] = r * Math.sin(phi) * Math.cos(theta);
    starsPositions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
    starsPositions[i + 2] = r * Math.cos(phi);
  }
  starsGeo.setAttribute('position', new THREE.BufferAttribute(starsPositions, 3));
  const starsMat = new THREE.PointsMaterial({ color: 0xf8bbd0, size: 0.08, transparent: true, opacity: 0.6 });
  const stars = new THREE.Points(starsGeo, starsMat);
  scene.add(stars);

  // Polaroid cards group
  const ringGroup = new THREE.Group();
  scene.add(ringGroup);
  const radius = isMobile ? 3.5 : 4.5;

  const cards = [];
  const textureLoader = new THREE.TextureLoader();

  photos.forEach((photo, i) => {
    const angle = (i / photos.length) * Math.PI * 2;

    // Polaroid card group
    const cardGroup = new THREE.Group();

    // White polaroid background
    const cardW = 1.6, cardH = 2.0;
    const whiteGeo = new THREE.PlaneGeometry(cardW, cardH);
    const whiteMat = new THREE.MeshPhongMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const whiteMesh = new THREE.Mesh(whiteGeo, whiteMat);
    whiteMesh.castShadow = true;
    whiteMesh.receiveShadow = true;
    cardGroup.add(whiteMesh);

    // Photo area (top portion of polaroid)
    const photoH = cardW * 0.9; // square-ish photo
    const photoGeo = new THREE.PlaneGeometry(cardW - 0.2, photoH);
    const photoMat = new THREE.MeshPhongMaterial({
      color: photo.color || '#e8eaf6',
      side: THREE.DoubleSide,
    });
    const photoMesh = new THREE.Mesh(photoGeo, photoMat);
    photoMesh.position.y = (cardH - photoH) / 2 - 0.08;
    photoMesh.position.z = 0.01;
    cardGroup.add(photoMesh);

    // Load real photo texture if URL provided
    if (photo.image) {
      textureLoader.load(photo.image, tex => {
        photoMat.map = tex;
        photoMat.color.set(0xffffff);
        photoMat.needsUpdate = true;
      });
    }

    // Position on ring
    cardGroup.position.x = Math.cos(angle) * radius;
    cardGroup.position.z = Math.sin(angle) * radius;
    cardGroup.lookAt(0, 0, 0);
    cardGroup.rotateY(Math.PI); // face outward

    cardGroup.userData = { photo, index: i, angle, radius };
    ringGroup.add(cardGroup);
    cards.push(cardGroup);
  });

  // Interaction
  let isDragging = false, prevX = 0, prevY = 0;
  let rotationY = 0, rotationX = 0;
  let targetRotationY = 0, targetRotationX = 0;
  let autoRotate = true;
  let autoSpeed = 0.003;
  let selectedCard = null;

  renderer.domElement.addEventListener('pointerdown', e => {
    isDragging = true; prevX = e.clientX; prevY = e.clientY;
    autoRotate = false;
    renderer.domElement.style.cursor = 'grabbing';
  });

  window.addEventListener('pointerup', () => {
    isDragging = false;
    renderer.domElement.style.cursor = 'grab';
    setTimeout(() => { if (!isDragging && !selectedCard) autoRotate = true; }, 2000);
  });

  window.addEventListener('pointermove', e => {
    if (!isDragging) return;
    const dx = e.clientX - prevX, dy = e.clientY - prevY;
    targetRotationY += dx * 0.005;
    targetRotationX += dy * 0.003;
    targetRotationX = Math.max(-0.5, Math.min(0.5, targetRotationX));
    prevX = e.clientX; prevY = e.clientY;
  });

  renderer.domElement.addEventListener('wheel', e => {
    e.preventDefault();
    if (selectedCard) return;
    targetRotationY += e.deltaX * 0.005 || e.deltaY * 0.003;
    autoRotate = false;
    setTimeout(() => { if (!isDragging && !selectedCard) autoRotate = true; }, 2000);
  });

  // Click to select/unselect card
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  renderer.domElement.addEventListener('click', e => {
    if (isDragging) return;
    mouse.x = (e.clientX / w) * 2 - 1;
    mouse.y = -(e.clientY / h) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(cards, true);

    if (intersects.length > 0) {
      let cardObj = intersects[0].object;
      while (cardObj && !cardObj.userData.photo) cardObj = cardObj.parent;
      if (cardObj && cardObj.userData.photo) {
        if (selectedCard === cardObj) {
          deselectCard();
        } else {
          selectCard(cardObj);
        }
      }
    } else if (selectedCard) {
      deselectCard();
    }
  });

  function selectCard(card) {
    selectedCard = card;
    autoRotate = false;
    const detail = document.getElementById('gallery-detail');
    if (detail) {
      const p = card.userData.photo;
      detail.querySelector('img').src = p.image || '';
      detail.querySelector('h3').textContent = p.title || '';
      detail.querySelector('p').textContent = p.description || '';
      detail.style.display = 'block';
    }
    // Animate camera to look at card
    const target = card.position.clone();
    ringGroup.localToWorld(target);
    const camTarget = target.clone().multiplyScalar(1.3);
    gsap.to(camera.position, { x: camTarget.x, y: camTarget.y, z: camTarget.z, duration: 0.8, ease: 'power2.out' });
  }

  function deselectCard() {
    selectedCard = null;
    const detail = document.getElementById('gallery-detail');
    if (detail) detail.style.display = 'none';
    gsap.to(camera.position, { x: 0, y: 0.5, z: isMobile ? 8 : 7, duration: 0.8, ease: 'power2.out' });
    setTimeout(() => { if (!isDragging) autoRotate = true; }, 1000);
  }

  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') deselectCard();
  });

  renderer.domElement.style.cursor = 'grab';

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);

    if (autoRotate) {
      targetRotationY += autoSpeed;
    }

    // Smooth lerp
    rotationY += (targetRotationY - rotationY) * 0.05;
    rotationX += (targetRotationX - rotationX) * 0.05;

    ringGroup.rotation.y = rotationY;
    ringGroup.rotation.x = rotationX;

    // Hover scale effect via raycaster on each frame
    mouse.x = (mouse.x || 0); mouse.y = (mouse.y || 0);
    raycaster.setFromCamera(mouse, camera);
    const hoverIntersects = raycaster.intersectObjects(cards, true);
    cards.forEach(c => {
      const isHovered = hoverIntersects.some(h => {
        let obj = h.object;
        while (obj) { if (obj === c) return true; obj = obj.parent; }
        return false;
      });
      const targetScale = isHovered && !selectedCard ? 1.08 : (c === selectedCard ? 1.15 : 1);
      const currentScale = c.scale.x;
      c.scale.setScalar(currentScale + (targetScale - currentScale) * 0.1);
    });

    stars.rotation.y += 0.0003;
    stars.rotation.x += 0.0001;

    renderer.render(scene, camera);
  }

  // Handle resize
  window.addEventListener('resize', () => {
    const nw = window.innerWidth, nh = window.innerHeight;
    camera.aspect = nw / nh;
    camera.updateProjectionMatrix();
    renderer.setSize(nw, nh);
  });

  // Track mouse for hover
  window.addEventListener('mousemove', e => {
    if (!isDragging) {
      mouse.x = (e.clientX / w) * 2 - 1;
      mouse.y = -(e.clientY / h) * 2 + 1;
    }
  });

  animate();
  return { selectCard, deselectCard, ringGroup };
}
```

- [ ] **Step 2: 编写画廊页面 HTML**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>美少女画廊 · Rainly</title>
  <meta name="theme-color" content="#fce4ec">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌸</text></svg>">
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500&family=Noto+Serif+SC:wght@200;300;400&family=Klee+One&family=ZCOOL+KuaiLe&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/kawaii.css">
</head>
<body>

  <canvas id="bg-canvas"></canvas>

  <nav class="kawaii-nav">
    <a href="/" class="nav-brand">🌸 Rainly</a>
    <div class="nav-links">
      <a href="/">首页</a>
      <a href="/gallery" class="active">画廊</a>
      <a href="/blog">博客</a>
      <a href="/about">关于</a>
    </div>
  </nav>

  <div id="gallery-container"></div>

  <div class="gallery-info">🖱 拖拽旋转 · 滚轮缩放 · 点击查看 · Esc 关闭</div>

  <div class="gallery-detail" id="gallery-detail">
    <img src="" alt="">
    <h3></h3>
    <p></p>
    <button class="kawaii-btn" onclick="document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'}))" style="margin-top:16px">✕ 关闭</button>
  </div>

  <script type="importmap">
  { "imports": { "three": "https://unpkg.com/three@0.160.0/build/three.module.js" } }
  </script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"
    integrity="sha384-g4NTh/Iv5PPU4xPyhEWqPcwtNXOvdaDI8LLnyYfyNZOjKJeYQyjzQ9X5275eBjpt"
    crossorigin="anonymous"></script>

  <script type="module">
    import { startPetals } from './js/sakura-petals.js';
    import { startClickHearts } from './js/click-heart.js';
    import { initGallery } from './js/gallery-3d.js';

    startPetals('bg-canvas');

    const heartCanvas = document.createElement('canvas');
    heartCanvas.id = 'heart-canvas';
    Object.assign(heartCanvas.style, { position:'fixed', top:'0', left:'0', width:'100%', height:'100%', zIndex:'3', pointerEvents:'none' });
    document.body.appendChild(heartCanvas);
    startClickHearts('heart-canvas');

    // Load gallery data
    fetch('/content/gallery.json')
      .then(r => r.json())
      .then(photos => initGallery('gallery-container', photos))
      .catch(() => {
        // Fallback demo data
        initGallery('gallery-container', [
          { id:'1', title:'桜と共に', image:'https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?w=400&q=80', description:'春风拂过，花瓣落在肩头。', color:'#fce4ec' },
          { id:'2', title:'星の記憶', image:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80', description:'夜空中的星光，像是过去的记忆。', color:'#e8eaf6' },
          { id:'3', title:'夢の彼方', image:'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=400&q=80', description:'在梦的彼岸，有无限的可能。', color:'#f3e5f5' },
          { id:'4', title:'虹色の街', image:'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&q=80', description:'雨后的城市，彩虹横跨天际。', color:'#e0f7fa' },
          { id:'5', title:'月の光', image:'https://images.unsplash.com/photo-1505144808419-1957a94ca61e?w=400&q=80', description:'月光洒落，温柔了整个世界。', color:'#fff9c4' },
          { id:'6', title:'花の約束', image:'https://images.unsplash.com/photo-1490750967868-88aa4b3b2b2a?w=400&q=80', description:'花开的季节，想起我们的约定。', color:'#fce4ec' },
        ]);
      });
  </script>
</body>
</html>
```

- [ ] **Step 3: Commit**

```bash
git add js/gallery-3d.js gallery.html && git commit -m "feat: add 3D polaroid carousel gallery with Three.js"
```

---

### Task 6: 博客页 — 少女漫画风

**Files:**
- Create: `js/blog-render.js`
- Create: `blog.html`

- [ ] **Step 1: 编写博客渲染逻辑**

```javascript
// js/blog-render.js — 博客 Markdown 渲染 + 列表/详情切换

let posts = [];

export async function loadPosts() {
  try {
    // Fetch post index
    const res = await fetch('/content/posts/index.json');
    if (res.ok) {
      posts = await res.json();
    }
  } catch {
    // Fallback: sample posts
    posts = [
      {
        slug: 'hello-world',
        title: 'はじめまして · 初次见面',
        date: '2026-06-20',
        image: 'https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?w=600&q=80',
        tags: ['日記', '自己紹介'],
        summary: '欢迎来到我的小站！这里会记录我喜欢的照片、旅行的记忆和日常的碎碎念。'
      },
      {
        slug: 'sakura-diary',
        title: '桜の日記 · 樱花日记',
        date: '2026-03-15',
        image: 'https://images.unsplash.com/photo-1490750967868-88aa4b3b2b2a?w=600&q=80',
        tags: ['桜', '春', '日記'],
        summary: '春天来了，樱花开了。走在铺满花瓣的小路上，整个世界都是粉色的。'
      },
      {
        slug: 'summer-fireworks',
        title: '夏の花火 · 夏日烟火',
        date: '2026-07-28',
        image: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=600&q=80',
        tags: ['夏', '花火', '旅行'],
        summary: '穿上浴衣，去看了一场花火大会。夜空中绽放的烟花，转瞬即逝却美得让人想哭。'
      },
      {
        slug: 'autumn-cafe',
        title: '秋の喫茶店 · 秋日咖啡',
        date: '2025-10-10',
        image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&q=80',
        tags: ['秋', '日常', '美食'],
        summary: '在街角发现了一家超可爱的猫咪咖啡馆。栗子蒙布朗和抹茶拿铁，秋天的完美组合。'
      },
    ];
  }
  return posts;
}

export function renderBlogList(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const featured = posts[0];
  const rest = posts.slice(1);

  let html = `
    <div class="blog-hero">
      <div class="ribbon">✦ 最新記事 ✦</div>
      <h2>Rainly Blog</h2>
      <div class="featured" onclick="window.location.hash='#/post/${featured.slug}'">
        <img src="${featured.image}" alt="${featured.title}" loading="lazy">
        <h3>${featured.title}</h3>
        <p style="color:var(--text-light);font-size:13px;margin-top:6px">${featured.date} · ${(featured.tags||[]).join(' / ')}</p>
        <p style="color:var(--text-light);font-size:14px;margin-top:10px;line-height:1.8">${featured.summary}</p>
      </div>
    </div>
    <div class="ornament-divider">✦ もっと読む ✦</div>
    <div class="blog-grid" id="blog-grid"></div>
  `;
  container.innerHTML = html;

  const grid = document.getElementById('blog-grid');
  rest.forEach((post, i) => {
    const card = document.createElement('div');
    card.className = 'blog-card reveal';
    card.style.animationDelay = (i * 0.1) + 's';
    card.onclick = () => window.location.hash = `#/post/${post.slug}`;
    card.innerHTML = `
      <img class="card-img" src="${post.image}" alt="${post.title}" loading="lazy">
      <div class="card-body">
        <h3>${post.title}</h3>
        <div class="meta">${post.date} · ${(post.tags||[]).join(' / ')}</div>
        <div class="summary">${post.summary}</div>
      </div>
    `;
    grid.appendChild(card);
  });

  // Trigger scroll reveal
  import('./scroll-reveal.js').then(m => m.initScrollReveal());
}

export async function renderBlogDetail(containerId, slug) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const post = posts.find(p => p.slug === slug);
  if (!post) {
    container.innerHTML = '<div class="blog-detail"><h1>文章不存在 😿</h1><a href="/blog" class="kawaii-btn">← 返回博客</a></div>';
    return;
  }

  // Load full markdown content
  let bodyHtml = `<p>${post.summary}</p>`;
  try {
    const res = await fetch(`/content/posts/${slug}.md`);
    if (res.ok) {
      const md = await res.text();
      const content = md.replace(/^---[\s\S]*?---\n?/, '').trim();
      bodyHtml = window.marked.parse(content);
    }
  } catch { /* use summary */ }

  document.title = `${post.title} · Rainly Blog`;

  container.innerHTML = `
    <div class="blog-detail reveal">
      ${post.image ? `<img class="cover" src="${post.image}" alt="${post.title}">` : ''}
      <h1>${post.title}</h1>
      <div class="date">${post.date} · ${(post.tags||[]).join(' / ')}</div>
      <div class="content">${bodyHtml}</div>
      <div style="margin-top:40px;text-align:center">
        <a href="/blog" class="kawaii-btn purple">← 返回列表</a>
      </div>
    </div>
    <div class="progress-bar" id="progress-bar"></div>
  `;

  // Reading progress bar
  const progressBar = document.getElementById('progress-bar');
  window.addEventListener('scroll', () => {
    const scrollH = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollH > 0 ? window.scrollY / scrollH : 0;
    progressBar.style.transform = `scaleX(${progress})`;
  }, { passive: true });

  import('./scroll-reveal.js').then(m => m.initScrollReveal());
}
```

- [ ] **Step 2: 编写博客页面 HTML**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>博客 · Rainly</title>
  <meta name="theme-color" content="#fce4ec">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌸</text></svg>">
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500&family=Noto+Serif+SC:wght@200;300;400&family=Klee+One&family=ZCOOL+KuaiLe&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/kawaii.css">
</head>
<body>

  <canvas id="bg-canvas"></canvas>

  <nav class="kawaii-nav">
    <a href="/" class="nav-brand">🌸 Rainly</a>
    <div class="nav-links">
      <a href="/">首页</a>
      <a href="/gallery">画廊</a>
      <a href="/blog" class="active">博客</a>
      <a href="/about">关于</a>
    </div>
  </nav>

  <div id="blog-content"></div>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/marked/12.0.0/marked.min.js"
    integrity="sha384-6ZIOBtf1R3Sg1LVsZLvh2Yzk7KLT7KLsU1DkXh2JhH8N5fN9xJ2Tn5Lp3B6f2LXp"
    crossorigin="anonymous"></script>

  <script type="module">
    import { startPetals } from './js/sakura-petals.js';
    import { startClickHearts } from './js/click-heart.js';
    import { loadPosts, renderBlogList, renderBlogDetail } from './js/blog-render.js';

    startPetals('bg-canvas');

    const heartCanvas = document.createElement('canvas');
    heartCanvas.id = 'heart-canvas';
    Object.assign(heartCanvas.style, { position:'fixed', top:'0', left:'0', width:'100%', height:'100%', zIndex:'3', pointerEvents:'none' });
    document.body.appendChild(heartCanvas);
    startClickHearts('heart-canvas');

    function route() {
      const hash = window.location.hash;
      const match = hash.match(/^#\/post\/(.+)$/);
      if (match) {
        renderBlogDetail('blog-content', match[1]);
      } else {
        renderBlogList('blog-content');
      }
    }

    await loadPosts();
    route();
    window.addEventListener('hashchange', route);
  </script>
</body>
</html>
```

- [ ] **Step 3: Commit**

```bash
git add js/blog-render.js blog.html && git commit -m "feat: add magazine-style blog with SPA routing"
```

---

### Task 7: 关于我页面

**Files:**
- Create: `about.html`

- [ ] **Step 1: 编写关于页 HTML**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>关于我 · Rainly</title>
  <meta name="theme-color" content="#fce4ec">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌸</text></svg>">
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500&family=Noto+Serif+SC:wght@200;300;400&family=Klee+One&family=ZCOOL+KuaiLe&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/kawaii.css">
</head>
<body>

  <canvas id="bg-canvas"></canvas>

  <nav class="kawaii-nav">
    <a href="/" class="nav-brand">🌸 Rainly</a>
    <div class="nav-links">
      <a href="/">首页</a>
      <a href="/gallery">画廊</a>
      <a href="/blog">博客</a>
      <a href="/about" class="active">关于</a>
    </div>
  </nav>

  <div class="about-container">
    <div class="about-card reveal">
      <img class="avatar" src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200&h=200&fit=crop&crop=face" alt="avatar" id="profile-avatar">
      <h3 id="profile-name">Rainly</h3>
      <div class="tags" id="profile-tags">
        <span>🌸 二次元</span><span>💻 程序员</span><span>✈️ 旅行</span>
      </div>
      <p class="bio" id="profile-bio">用脚步重新认识自己住的这个世界。<br>喜欢拍照、写代码、看动漫。</p>
      <div class="social-links">
        <a href="https://github.com/Rainly8023" target="_blank" class="kawaii-btn purple" style="padding:8px 20px;font-size:12px">🐙 GitHub</a>
        <a href="mailto:hi@carterthyia.cloud" class="kawaii-btn" style="padding:8px 20px;font-size:12px">💌 Email</a>
      </div>
    </div>
  </div>

  <script type="module">
    import { startPetals } from './js/sakura-petals.js';
    import { startClickHearts } from './js/click-heart.js';
    import { initScrollReveal } from './js/scroll-reveal.js';

    startPetals('bg-canvas');

    const heartCanvas = document.createElement('canvas');
    heartCanvas.id = 'heart-canvas';
    Object.assign(heartCanvas.style, { position:'fixed', top:'0', left:'0', width:'100%', height:'100%', zIndex:'3', pointerEvents:'none' });
    document.body.appendChild(heartCanvas);
    startClickHearts('heart-canvas');

    initScrollReveal();

    // Load profile from CMS data
    fetch('/content/settings/profile.json')
      .then(r => r.json())
      .then(data => {
        if (data.nickname) document.getElementById('profile-name').textContent = data.nickname;
        if (data.bio) document.getElementById('profile-bio').textContent = data.bio;
        if (data.avatar) document.getElementById('profile-avatar').src = data.avatar;
      })
      .catch(() => { /* use defaults */ });
  </script>
</body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add about.html && git commit -m "feat: add about page with collection card style"
```

---

### Task 8: 内容数据 + CMS 配置

**Files:**
- Create: `content/gallery.json`
- Create: `content/posts/index.json`
- Create: `content/settings/profile.json`
- Update: `admin/config.yml`

- [ ] **Step 1: 创建画廊数据**

```json
[
  {
    "id": "1",
    "title": "桜と共に",
    "image": "https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?w=400&q=80",
    "description": "春风拂过，花瓣落在肩头。",
    "color": "#fce4ec",
    "tags": ["桜", "春"]
  },
  {
    "id": "2",
    "title": "星の記憶",
    "image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80",
    "description": "夜空中的星光，像是过去的记忆。",
    "color": "#e8eaf6",
    "tags": ["星", "夜"]
  },
  {
    "id": "3",
    "title": "夢の彼方",
    "image": "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=400&q=80",
    "description": "在梦的彼岸，有无限的可能。",
    "color": "#f3e5f5",
    "tags": ["夢", "幻想"]
  },
  {
    "id": "4",
    "title": "虹色の街",
    "image": "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&q=80",
    "description": "雨后的城市，彩虹横跨天际。",
    "color": "#e0f7fa",
    "tags": ["虹", "街"]
  },
  {
    "id": "5",
    "title": "月の光",
    "image": "https://images.unsplash.com/photo-1505144808419-1957a94ca61e?w=400&q=80",
    "description": "月光洒落，温柔了整个世界。",
    "color": "#fff9c4",
    "tags": ["月", "夜"]
  },
  {
    "id": "6",
    "title": "花の約束",
    "image": "https://images.unsplash.com/photo-1490750967868-88aa4b3b2b2a?w=400&q=80",
    "description": "花开的季节，想起我们的约定。",
    "color": "#fce4ec",
    "tags": ["花", "約束"]
  }
]
```

- [ ] **Step 2: 创建博客索引**

```json
[
  {
    "slug": "hello-world",
    "title": "はじめまして · 初次见面",
    "date": "2026-06-20",
    "image": "https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?w=600&q=80",
    "tags": ["日記", "自己紹介"],
    "summary": "欢迎来到我的小站！这里会记录我喜欢的照片、旅行的记忆和日常的碎碎念。"
  },
  {
    "slug": "sakura-diary",
    "title": "桜の日記 · 樱花日记",
    "date": "2026-03-15",
    "image": "https://images.unsplash.com/photo-1490750967868-88aa4b3b2b2a?w=600&q=80",
    "tags": ["桜", "春", "日記"],
    "summary": "春天来了，樱花开了。走在铺满花瓣的小路上，整个世界都是粉色的。"
  },
  {
    "slug": "summer-fireworks",
    "title": "夏の花火 · 夏日烟火",
    "date": "2026-07-28",
    "image": "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=600&q=80",
    "tags": ["夏", "花火", "旅行"],
    "summary": "穿上浴衣，去看了一场花火大会。夜空中绽放的烟花，转瞬即逝却美得让人想哭。"
  },
  {
    "slug": "autumn-cafe",
    "title": "秋の喫茶店 · 秋日咖啡",
    "date": "2025-10-10",
    "image": "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&q=80",
    "tags": ["秋", "日常", "美食"],
    "summary": "在街角发现了一家超可爱的猫咪咖啡馆。栗子蒙布朗和抹茶拿铁，秋天的完美组合。"
  }
]
```

- [ ] **Step 3: 更新 CMS 配置**

```yaml
# admin/config.yml — Decap CMS for Kawaii Site
backend:
  name: github
  repo: Rainly8023/Rainly-Resume
  branch: main

site_url: https://carterthyia.cloud
media_folder: images/uploads
public_folder: /images/uploads
locale: zh_Hans

collections:
  - name: gallery
    label: "美少女画廊"
    label_singular: "照片"
    editor:
      preview: false
    files:
      - label: "画廊数据"
        name: gallery_data
        file: content/gallery.json
        fields:
          - label: "照片列表"
            name: photos
            widget: list
            fields:
              - { label: "标题", name: title, widget: string }
              - { label: "图片URL", name: image, widget: string }
              - { label: "描述", name: description, widget: text }
              - { label: "主题色", name: color, widget: string, default: "#fce4ec" }
              - { label: "标签", name: tags, widget: list }

  - name: blog
    label: "博客"
    label_singular: "文章"
    folder: content/posts
    create: true
    slug: "{{slug}}"
    editor:
      preview: false
    fields:
      - { label: "标题", name: title, widget: string }
      - { label: "日期", name: date, widget: datetime }
      - { label: "封面图", name: image, widget: string }
      - { label: "标签", name: tags, widget: list }
      - { label: "摘要", name: summary, widget: text }
      - { label: "正文", name: body, widget: markdown }

  - name: settings
    label: "网站设置"
    editor:
      preview: false
    files:
      - label: "个人信息"
        name: profile
        file: content/settings/profile.json
        fields:
          - { label: "昵称", name: nickname, widget: string }
          - { label: "头像URL", name: avatar, widget: string }
          - { label: "简介", name: bio, widget: text }
          - label: "社交链接"
            name: social
            widget: object
            fields:
              - { label: "GitHub", name: github, widget: string }
              - { label: "Twitter", name: twitter, widget: string }
              - { label: "邮箱", name: email, widget: string }
```

- [ ] **Step 4: Commit**

```bash
git add content/gallery.json content/posts/index.json admin/config.yml && git commit -m "feat: add content data and update CMS config"
```

---

### Task 9: 更新 .nojekyll 和最终整理

**Files:**
- Verify: `.nojekyll`, `CNAME`, `.gitignore` exist
- Remove: old admin/index.html if needed
- Check all links and dependencies

- [ ] **Step 1: 确保关键文件存在**

```bash
touch .nojekyll
```

- [ ] **Step 2: 确认文件列表**

```bash
cd /Volumes/Soft/Webiste && find . -maxdepth 3 -not -path './.git/*' -not -path './node_modules/*' -type f | sort
```

Expected output:
```
./.gitignore
./.nojekyll
./CNAME
./about.html
./admin/config.yml
./blog.html
./content/gallery.json
./content/posts/index.json
./content/settings/profile.json
./css/kawaii.css
./gallery.html
./index.html
./js/blog-render.js
./js/click-heart.js
./js/gallery-3d.js
./js/mouse-trail.js
./js/sakura-petals.js
./js/scroll-reveal.js
```

- [ ] **Step 3: Final commit and push**

```bash
git add -A
git commit -m "feat: complete kawaii anime site — 4 pages, 3D gallery, magazine blog, CMS"
git push origin main
```
