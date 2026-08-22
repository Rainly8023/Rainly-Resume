// js/kawaii-player.js — 二次元黑胶唱片浮动音乐播放器

export function initMusicPlayer() {
  if (document.getElementById('kawaii-player')) return;

  const playerHTML = `
    <div id="kawaii-player" title="点击播放 / 暂停音乐">
      <div class="vinyl-disc" id="kp-vinyl">
        <div class="vinyl-core"></div>
      </div>
      <div class="player-info-wrap" id="kp-info">
        <span class="player-title">恶作剧</span>
        <span class="player-subtitle" id="kp-status">点击播放 🎵</span>
      </div>
      <audio id="kp-audio" loop preload="none" src="/content/ezuoju.mp3"></audio>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', playerHTML);

  const player = document.getElementById('kawaii-player');
  const audio = document.getElementById('kp-audio');
  const vinyl = document.getElementById('kp-vinyl');
  const statusEl = document.getElementById('kp-status');

  let isPlaying = false;

  player.addEventListener('click', (e) => {
    e.stopPropagation();
    if (isPlaying) {
      audio.pause();
      vinyl.style.animationPlayState = 'paused';
      statusEl.textContent = '已暂停 ⏸️';
      if (window.showKawaiiToast) window.showKawaiiToast('音乐已暂停', '💿');
    } else {
      audio.play().then(() => {
        vinyl.style.animationPlayState = 'running';
        statusEl.textContent = '正在播放 🎵';
        if (window.showKawaiiToast) window.showKawaiiToast('正在播放：恶作剧 🎵', '🎶');
      }).catch(err => {
        console.log('Audio autoplay blocked or failed', err);
        if (window.showKawaiiToast) window.showKawaiiToast('请再次点击以允许播放音乐 🎵', '🎧');
      });
    }
    isPlaying = !isPlaying;
  });
}
