document.addEventListener('DOMContentLoaded', function () {
    initializeModeAndMusic();
});

function initializeModeAndMusic() {
    const html = document.documentElement;
    const toggleBtn = document.getElementById('toggleModeBtn');
    const musicBtn = document.getElementById('musicToggleBtn');

    // === MODO CLARO/OSCURO ===
    const savedMode = localStorage.getItem('colorMode') || 'dark';
    if (savedMode === 'light') {
        html.classList.add('light-mode');
        toggleBtn && (toggleBtn.textContent = '☀️');
    } else {
        html.classList.remove('light-mode');
        toggleBtn && (toggleBtn.textContent = '🌙');
    }

    toggleBtn?.addEventListener('click', function () {
        const isLight = html.classList.toggle('light-mode');
        localStorage.setItem('colorMode', isLight ? 'light' : 'dark');
        toggleBtn.textContent = isLight ? '☀️' : '🌙';
    });

    // === MÚSICA ===
    let soundGame = window.soundGame;
    if (!soundGame && typeof Audio !== 'undefined') {
        soundGame = new Audio("assets/sounds/harryPotterSound.mp3");
        soundGame.loop = true;
        window.soundGame = soundGame;
    }

    let musicEnabled = localStorage.getItem('musicEnabled');
    if (musicEnabled === null) musicEnabled = "1";
    musicEnabled = musicEnabled === "1";

    // Exponer función global para efectos de sonido que respete la config
    window.playSound = function (path) {
        if (!musicEnabled) return;
        const fx = new Audio(path);
        fx.play().catch(e => console.warn("No se pudo reproducir efecto:", e));
    };

    function updateMusicIcon() {
        if (musicBtn) {
            musicBtn.textContent = musicEnabled ? "🔊" : "🔈";
        }
    }

    function applyMusicState() {
        updateMusicIcon();
        localStorage.setItem('musicEnabled', musicEnabled ? "1" : "0");
        if (soundGame) {
            if (musicEnabled) {
                soundGame.loop = true;
                soundGame.play().catch(e => console.warn('Audio bloqueado:', e));
            } else {
                soundGame.pause();
                soundGame.currentTime = 0;
            }
        }
    }

    musicBtn?.addEventListener('click', () => {
        musicEnabled = !musicEnabled;
        applyMusicState();
    });

    // Reproduce música tras la primera interacción si está habilitada
    let hasInteracted = false;
    function startMusicOnInteraction() {
        if (!hasInteracted && musicEnabled && soundGame) {
            hasInteracted = true;
            soundGame.play().catch(e => console.warn('Audio bloqueado:', e));
        }
    }

    document.addEventListener("click", startMusicOnInteraction, { once: true });
    document.addEventListener("keydown", startMusicOnInteraction, { once: true });

    applyMusicState();
}
