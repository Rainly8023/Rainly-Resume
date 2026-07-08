// js/blog-render.js — 博客 Markdown 渲染 + 列表/详情切换
/* global marked */

const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

let posts = [];

export async function loadPosts() {
  try {
    const res = await fetch('/content/posts/index.json');
    if (res.ok) {
      posts = await res.json();
      return posts;
    }
  } catch { /* fall through to fallback */ }

  // Fallback sample posts
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
  return posts;
}

export function renderBlogList(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (posts.length === 0) {
    container.innerHTML = '<div class="blog-hero"><h2>还没有文章 🌸</h2></div>';
    return;
  }

  const featured = posts[0];
  const rest = posts.slice(1);

  let html = `
    <div class="blog-hero">
      <div class="ribbon">✦ 最新記事 ✦</div>
      <h2>Rainly Blog</h2>
      <div class="featured" onclick="window.location.hash='#/post/${escapeHtml(featured.slug)}'" style="cursor:pointer">
        <img src="${escapeHtml(featured.image)}" alt="${escapeHtml(featured.title)}" loading="lazy">
        <h3>${escapeHtml(featured.title)}</h3>
        <p style="color:var(--text-light);font-size:13px;margin-top:6px">${escapeHtml(featured.date)} · ${(featured.tags||[]).map(escapeHtml).join(' / ')}</p>
        <p style="color:var(--text-light);font-size:14px;margin-top:10px;line-height:1.8">${escapeHtml(featured.summary)}</p>
      </div>
    </div>
    <div class="ornament-divider">✦ もっと読む ✦</div>
    <div class="blog-grid" id="blog-grid"></div>
  `;
  container.innerHTML = html;

  const grid = document.getElementById('blog-grid');
  if (!grid) return;

  rest.forEach((post, i) => {
    const card = document.createElement('div');
    card.className = 'blog-card reveal';
    card.style.animationDelay = (i * 0.1) + 's';
    card.onclick = () => { window.location.hash = `#/post/${post.slug}`; };
    card.innerHTML = `
      <img class="card-img" src="${escapeHtml(post.image)}" alt="${escapeHtml(post.title)}" loading="lazy">
      <div class="card-body">
        <h3>${escapeHtml(post.title)}</h3>
        <div class="meta">${escapeHtml(post.date)} · ${(post.tags||[]).map(escapeHtml).join(' / ')}</div>
        <div class="summary">${escapeHtml(post.summary)}</div>
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
    container.innerHTML = '<div class="blog-detail"><h1>文章不存在 😿</h1><a href="/blog.html" class="kawaii-btn">← 返回博客</a></div>';
    return;
  }

  // Load full markdown content
  let bodyHtml = `<p>${post.summary}</p>`;
  try {
    const res = await fetch(`/content/posts/${slug}.md`);
    if (res.ok) {
      const md = await res.text();
      const content = md.replace(/^---[\s\S]*?---\n?/, '').trim();
      if (typeof marked !== 'undefined' && marked.parse) {
        bodyHtml = marked.parse(content);
      }
    }
  } catch { /* use summary fallback */ }

  document.title = `${post.title} · Rainly Blog`;

  container.innerHTML = `
    <div class="blog-detail reveal">
      ${post.image ? `<img class="cover" src="${escapeHtml(post.image)}" alt="${escapeHtml(post.title)}">` : ''}
      <h1>${escapeHtml(post.title)}</h1>
      <div class="date">${escapeHtml(post.date)} · ${(post.tags||[]).map(escapeHtml).join(' / ')}</div>
      <div class="content">${bodyHtml}</div>
      <div style="margin-top:40px;text-align:center">
        <a href="/blog.html" class="kawaii-btn purple">← 返回列表</a>
      </div>
    </div>
    <div class="progress-bar" id="progress-bar"></div>
  `;

  // Reading progress bar
  const progressBar = document.getElementById('progress-bar');
  if (progressBar) {
    // Remove any previously attached scroll handler to prevent leaks
    if (window._blogScrollHandler) {
      window.removeEventListener('scroll', window._blogScrollHandler);
    }
    const onScroll = () => {
      const scrollH = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollH > 0 ? window.scrollY / scrollH : 0;
      progressBar.style.transform = `scaleX(${progress})`;
    };
    window._blogScrollHandler = onScroll;
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  import('./scroll-reveal.js').then(m => m.initScrollReveal());
}
