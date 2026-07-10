const REPO = 'Rainly8023/Rainly-Resume';
const BRANCH = 'main';

let token = localStorage.getItem('gh_token') || '';
let gallerySha = '';
let galleryData = [];

const loginSec = document.getElementById('login-section');
const dashboard = document.getElementById('dashboard');
const tokenInput = document.getElementById('gh-token');
const statusText = document.getElementById('upload-status');

if (token) {
  initDashboard();
}

document.getElementById('login-btn').addEventListener('click', () => {
  token = tokenInput.value.trim();
  if (token) {
    localStorage.setItem('gh_token', token);
    initDashboard();
  }
});

document.getElementById('logout-btn').addEventListener('click', () => {
  localStorage.removeItem('gh_token');
  location.reload();
});

async function api(path, method = 'GET', body = null) {
  const opts = {
    method,
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`https://api.github.com/repos/${REPO}${path}`, opts);
  if (res.status === 401) {
    alert('Token无效或过期，请重新登录！');
    localStorage.removeItem('gh_token');
    location.reload();
  }
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function initDashboard() {
  loginSec.style.display = 'none';
  dashboard.style.display = 'block';
  await loadGallery();
}

async function loadGallery() {
  try {
    const data = await api(`/contents/content/gallery.json?ref=${BRANCH}`);
    gallerySha = data.sha;
    // content is base64 encoded
    const jsonStr = decodeURIComponent(escape(atob(data.content)));
    galleryData = JSON.parse(jsonStr);
    renderGallery();
  } catch (err) {
    alert('加载画廊失败: ' + err.message);
  }
}

function renderGallery() {
  const container = document.getElementById('gallery-list');
  container.innerHTML = '';
  galleryData.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = 'gallery-item';
    div.innerHTML = `
      <img src="${item.image.startsWith('http') ? item.image : '..' + item.image}" alt="">
      <h4 style="margin:5px 0;">${item.title}</h4>
      <p style="font-size:12px; color:gray;">${item.description}</p>
      <button class="kawaii-btn delete-btn" data-idx="${index}" style="padding: 5px 10px; font-size:12px;">🗑 删除</button>
    `;
    container.appendChild(div);
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      if (!confirm('确定要删除这张图片吗？')) return;
      const idx = e.target.getAttribute('data-idx');
      galleryData.splice(idx, 1);
      await saveGalleryData('Delete photo');
    });
  });
}

async function saveGalleryData(commitMsg) {
  statusText.textContent = '正在更新配置...';
  try {
    const newContent = btoa(unescape(encodeURIComponent(JSON.stringify(galleryData, null, 2))));
    const res = await api('/contents/content/gallery.json', 'PUT', {
      message: `cms: ${commitMsg}`,
      content: newContent,
      sha: gallerySha,
      branch: BRANCH
    });
    gallerySha = res.content.sha;
    renderGallery();
    statusText.textContent = '更新成功！';
    setTimeout(() => statusText.textContent = '', 3000);
  } catch (e) {
    alert('更新失败: ' + e.message);
    statusText.textContent = '';
  }
}

function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]); // remove data:image/...;base64,
    reader.onerror = error => reject(error);
  });
}

document.getElementById('upload-btn').addEventListener('click', async () => {
  const fileInput = document.getElementById('new-img-file');
  const title = document.getElementById('new-title').value.trim();
  const desc = document.getElementById('new-desc').value.trim();
  
  if (!fileInput.files[0] || !title) {
    return alert('请选择图片并填写标题！');
  }

  const file = fileInput.files[0];
  const ext = file.name.split('.').pop();
  const filename = `img_${Date.now()}.${ext}`;
  const filepath = `images/gallery/${filename}`;

  statusText.textContent = '正在上传图片...';
  
  try {
    const base64Str = await getBase64(file);
    await api(`/contents/${filepath}`, 'PUT', {
      message: `cms: upload ${filename}`,
      content: base64Str,
      branch: BRANCH
    });

    const newPhoto = {
      id: Date.now().toString(),
      title: title,
      image: `/${filepath}`,
      description: desc || '',
      color: '#fce4ec',
      tags: []
    };

    galleryData.unshift(newPhoto);
    await saveGalleryData('Add new photo');
    
    // clear form
    fileInput.value = '';
    document.getElementById('new-title').value = '';
    document.getElementById('new-desc').value = '';

  } catch (e) {
    alert('上传失败: ' + e.message);
    statusText.textContent = '';
  }
});
