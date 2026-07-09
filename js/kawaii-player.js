export function initMusicPlayer() {
  const playerHTML = `
    <div id="kawaii-player" style="position: fixed; bottom: 20px; right: 20px; z-index: 1000; background: var(--card-bg); backdrop-filter: blur(10px); border: 2px solid var(--sakura-pink); border-radius: 30px; padding: 10px 15px; display: flex; align-items: center; gap: 10px; box-shadow: var(--shadow-card); cursor: pointer; transition: transform 0.3s var(--ease-bounce);">
      <div id="kp-icon" style="font-size: 24px; animation: spin 4s linear infinite; animation-play-state: paused;">💿</div>
      <div id="kp-info" style="display: flex; flex-direction: column;">
        <span style="font-family: var(--font-hand); font-size: 14px; color: var(--sakura-pink); font-weight: bold; line-height: 1.2;">BGM</span>
        <span style="font-size: 10px; color: var(--text-light);">Click to Play</span>
      </div>
      <audio id="kp-audio" loop src="https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3"></audio>
    </div>
    <style>
      @keyframes spin { 100% { transform: rotate(360deg); } }
      #kawaii-player:hover { transform: scale(1.05) translateY(-5px); }
    </style>
  `;

  document.body.insertAdjacentHTML('beforeend', playerHTML);

  const player = document.getElementById('kawaii-player');
  const audio = document.getElementById('kp-audio');
  const icon = document.getElementById('kp-icon');
  const info = player.querySelector('#kp-info span:last-child');
  
  let isPlaying = false;

  player.addEventListener('click', () => {
    if (isPlaying) {
      audio.pause();
      icon.style.animationPlayState = 'paused';
      info.textContent = 'Paused';
    } else {
      audio.play().catch(e => console.log('Audio play blocked', e));
      icon.style.animationPlayState = 'running';
      info.textContent = 'Playing 🎵';
    }
    isPlaying = !isPlaying;
  });
}
