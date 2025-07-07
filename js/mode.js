(function() {
  // Modo claro/oscuro
  var btn = document.getElementById('toggleModeBtn');
  var html = document.documentElement;

  if (localStorage.getItem('colorMode') === 'light') {
    html.classList.add('light-mode');
    btn.textContent = '☀️';
  }

  btn.addEventListener('click', function () {
    html.classList.toggle('light-mode');
    if (html.classList.contains('light-mode')) {
      btn.textContent = '☀️';
      localStorage.setItem('colorMode', 'light');
    } else {
      btn.textContent = '🌙';
      localStorage.setItem('colorMode', 'dark');
    }
  });

  // --- Lógica para música ---
  var musicBtn = document.getElementById('musicToggleBtn');
  // soundGame está definido globalmente en main.js
  var soundGame = window.soundGame || (typeof soundGame !== 'undefined' ? soundGame : null);

  // Estado persistente
  var musicEnabled = localStorage.getItem('musicEnabled');
  if (musicEnabled === null) musicEnabled = "1";
  musicEnabled = musicEnabled === "1";

  function updateMusicBtnIcon() {
    if (!musicBtn) return;
    musicBtn.textContent = musicEnabled ? "🔊" : "🔈";
  }

  function setMusic(enable) {
    musicEnabled = enable;
    localStorage.setItem('musicEnabled', enable ? "1" : "0");
    updateMusicBtnIcon();
    if (soundGame) {
      if (musicEnabled) {
        soundGame.loop = true;
        soundGame.play();
      } else {
        soundGame.pause();
        soundGame.currentTime = 0;
      }
    }
  }

  if (musicBtn) {
    updateMusicBtnIcon();
    musicBtn.addEventListener('click', function() {
      setMusic(!musicEnabled);
    });
  }

  // Arranca la música si corresponde al primer click
  document.addEventListener("click", function autoPlayMusic() {
    if (musicEnabled && soundGame) {
      soundGame.loop = true;
      soundGame.play();
    }
    document.removeEventListener("click", autoPlayMusic);
  });

  // Si está desactivada
  if (!musicEnabled && soundGame) {
    soundGame.pause();
    soundGame.currentTime = 0;
  }

})();
