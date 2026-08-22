// js/blog-render.js — 博客 Markdown 渲染 + 实时搜索/标签过滤 + 互动功能
/* global marked */

const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

let posts = [];
let activeTag = '全部';
let searchQuery = '';

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

  // Collect all unique tags
  const tagsSet = new Set(['全部']);
  posts.forEach(p => (p.tags || []).forEach(t => tagsSet.add(t)));
  const allTags = Array.from(tagsSet);

  const tagsHtml = allTags.map(tag => `
    <button class="tag-btn ${tag === activeTag ? 'active' : ''}" data-tag="${escapeHtml(tag)}">${escapeHtml(tag)}</button>
  `).join('');

  let html = `
    <div class="blog-hero">
      <div class="ribbon">✦ 随笔与日常 ✦</div>
      <h2>Rainly's Journal</h2>
      <p style="color:var(--text-light);font-size:14px;margin-top:6px;">记录日常微光、旅行风物与二次元的美好碎碎念</p>
      
      <!-- Search & Tags Filter -->
      <div class="blog-toolbar">
        <div class="blog-search-box">
          <span class="search-icon">🔍</span>
          <input type="text" class="blog-search-input" id="blog-search" placeholder="搜索文章标题、内容或标签..." value="${escapeHtml(searchQuery)}">
        </div>
        <div class="blog-tags-filter" id="blog-tags-bar">
          ${tagsHtml}
        </div>
      </div>
    </div>
    <div class="blog-grid" id="blog-grid"></div>
  `;
  container.innerHTML = html;

  // Filter posts logic
  function filterAndRenderCards() {
    const grid = document.getElementById('blog-grid');
    if (!grid) return;

    const filtered = posts.filter(post => {
      const matchTag = activeTag === '全部' || (post.tags && post.tags.includes(activeTag));
      const query = searchQuery.trim().toLowerCase();
      const matchQuery = !query || 
        post.title.toLowerCase().includes(query) || 
        post.summary.toLowerCase().includes(query) ||
        (post.tags && post.tags.some(t => t.toLowerCase().includes(query)));
      return matchTag && matchQuery;
    });

    if (filtered.length === 0) {
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--text-muted);">🍃 没有找到相关文章呢，换个关键词试试吧~</div>';
      return;
    }

    grid.innerHTML = '';
    filtered.forEach((post, i) => {
      const card = document.createElement('div');
      card.className = 'blog-card reveal';
      card.style.animationDelay = (i * 0.08) + 's';
      card.onclick = () => { window.location.hash = `#/post/${post.slug}`; };
      
      const tagsBadges = (post.tags || []).map(t => `<span style="background:var(--sakura-light);color:var(--sakura-pink);padding:2px 8px;border-radius:10px;font-size:11px;">#${escapeHtml(t)}</span>`).join(' ');

      card.innerHTML = `
        <div class="card-img-wrap">
          <img class="card-img" src="${escapeHtml(post.image)}" alt="${escapeHtml(post.title)}" loading="lazy">
        </div>
        <div class="card-body">
          <div class="meta">
            <span>📅 ${escapeHtml(post.date)}</span>
            <span>·</span>
            <span>${tagsBadges}</span>
          </div>
          <h3>${escapeHtml(post.title)}</h3>
          <div class="summary">${escapeHtml(post.summary)}</div>
          <div style="font-size:13px;color:var(--sakura-pink);font-weight:600;display:flex;align-items:center;gap:4px;">
            阅读全文 →
          </div>
        </div>
      `;
      grid.appendChild(card);
    });

    import('./scroll-reveal.js').then(m => m.initScrollReveal());
  }

  filterAndRenderCards();

  // Search event
  const searchInput = document.getElementById('blog-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      filterAndRenderCards();
    });
  }

  // Tag filter events
  const tagsBar = document.getElementById('blog-tags-bar');
  if (tagsBar) {
    tagsBar.addEventListener('click', (e) => {
      const btn = e.target.closest('.tag-btn');
      if (!btn) return;
      activeTag = btn.dataset.tag;
      tagsBar.querySelectorAll('.tag-btn').forEach(b => b.classList.toggle('active', b.dataset.tag === activeTag));
      filterAndRenderCards();
    });
  }
}

export async function renderBlogDetail(containerId, slug) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const post = posts.find(p => p.slug === slug);
  if (!post) {
    container.innerHTML = '<div class="blog-detail" style="text-align:center;"><h1>文章不存在 😿</h1><p style="margin:20px 0;color:var(--text-light);">可能已经被移动或删除</p><a href="/blog.html" class="kawaii-btn">← 返回博客列表</a></div>';
    return;
  }

  let bodyHtml = `<p>${post.summary}</p>`;
  let wordCount = post.summary.length;

  try {
    const res = await fetch(`/content/posts/${slug}.md`);
    if (res.ok) {
      const md = await res.text();
      const content = md.replace(/^---[\s\S]*?---\n?/, '').trim();
      wordCount = content.length;
      if (typeof marked !== 'undefined' && marked.parse) {
        bodyHtml = marked.parse(content);
      }
    }
  } catch { /* use summary fallback */ }

  const readingTime = Math.max(1, Math.ceil(wordCount / 350));
  const postLikeKey = `rainly-post-likes-${slug}`;
  let likeCount = parseInt(localStorage.getItem(postLikeKey) || '12', 10);

  document.title = `${post.title} · Rainly Blog`;

  const tagsBadges = (post.tags || []).map(t => `<span style="background:var(--sakura-light);color:var(--sakura-pink);padding:3px 10px;border-radius:12px;font-size:12px;">#${escapeHtml(t)}</span>`).join(' ');

  container.innerHTML = `
    <div class="blog-detail reveal">
      ${post.image ? `<img class="cover" src="${escapeHtml(post.image)}" alt="${escapeHtml(post.title)}">` : ''}
      <h1>${escapeHtml(post.title)}</h1>
      <div class="detail-meta">
        <span>📅 发布于 ${escapeHtml(post.date)}</span>
        <span>⏱️ 约 ${readingTime} 分钟阅读 (${wordCount} 字)</span>
        <div>${tagsBadges}</div>
      </div>
      <div class="content">${bodyHtml}</div>
      
      <!-- Interactive Action Bar -->
      <div class="blog-actions-bar">
        <button class="like-btn" id="post-like-btn">💖 点赞支持 (<span id="post-like-count">${likeCount}</span>)</button>
        <button class="kawaii-btn sm purple" id="post-share-btn">🔗 分享文章</button>
      </div>

      <div style="margin-top:40px;text-align:center">
        <a href="/blog.html" class="kawaii-btn purple">← 返回文章列表</a>
      </div>
    </div>
    <div class="progress-bar" id="progress-bar"></div>
  `;

  // Like button logic
  const likeBtn = document.getElementById('post-like-btn');
  const likeCountSpan = document.getElementById('post-like-count');
  let hasLiked = false;

  likeBtn.addEventListener('click', () => {
    if (!hasLiked) {
      likeCount++;
      hasLiked = true;
      localStorage.setItem(postLikeKey, likeCount);
      likeCountSpan.textContent = likeCount;
      likeBtn.style.background = '#ff4081';
      likeBtn.style.color = '#fff';
      if (window.showKawaiiToast) window.showKawaiiToast('谢谢你的支持与喜欢！💖', '🌸');
    } else {
      if (window.showKawaiiToast) window.showKawaiiToast('你已经为这篇文章点过赞啦 ✨', '💝');
    }
  });

  // Share button logic
  const shareBtn = document.getElementById('post-share-btn');
  shareBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      if (window.showKawaiiToast) window.showKawaiiToast('文章链接已复制到剪贴板 📋', '✨');
    }).catch(() => {
      if (window.showKawaiiToast) window.showKawaiiToast('分享链接：' + window.location.href, '🔗');
    });
  });

  // Reading progress bar
  const progressBar = document.getElementById('progress-bar');
  if (progressBar) {
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
