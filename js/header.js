// Header loader
document.addEventListener('DOMContentLoaded', function() {
    // Check if header placeholder exists (for dynamic header loading)
    const headerPlaceholder = document.getElementById('header-placeholder');
    
    if (headerPlaceholder) {
        // Load header dynamically
        fetch('components/header.html')
            .then(response => response.text())
            .then(data => {
                headerPlaceholder.innerHTML = data;
                
                // Update contact link based on current page
                const contactLink = document.getElementById('contactLink');
                if (window.location.pathname.includes('contact.html')) {
                    contactLink.href = 'index.html';
                    contactLink.textContent = 'Volver al Juego';
                }
                
                // Initialize mode toggle functionality
                initializeModeToggle();
            })
            .catch(error => console.error('Error loading header:', error));
    } else {
        // Header is already in DOM (like contact.html), just initialize mode toggle
        initializeModeToggle();
    }
});

function initializeModeToggle() {
    const toggleBtn = document.getElementById('toggleModeBtn');
    const musicBtn = document.getElementById('musicToggleBtn');
    
    // Initialize theme mode from localStorage
    const savedMode = localStorage.getItem('colorMode') || 'dark';
    if (savedMode === 'light') {
        document.documentElement.classList.add('light-mode');
        toggleBtn.textContent = '☀️';
    } else {
        toggleBtn.textContent = '🌙';
    }
    
    // Theme toggle event
    toggleBtn.addEventListener('click', function() {
        document.documentElement.classList.toggle('light-mode');
        if (document.documentElement.classList.contains('light-mode')) {
            toggleBtn.textContent = '☀️';
            localStorage.setItem('colorMode', 'light');
        } else {
            toggleBtn.textContent = '🌙';
            localStorage.setItem('colorMode', 'dark');
        }
    });
    
    // Music functionality
    let soundGame = window.soundGame;
    if (!soundGame && typeof Audio !== 'undefined') {
        soundGame = new Audio("assets/sounds/harryPotterSound.mp3");
        window.soundGame = soundGame;
    }
    
    let musicEnabled = localStorage.getItem('musicEnabled');
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
                soundGame.play().catch(e => console.log('Audio play prevented:', e));
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
    
    // Autoplay music on first user interaction if enabled
    let hasInteracted = false;
    function startMusicOnInteraction() {
        if (!hasInteracted && musicEnabled && soundGame) {
            hasInteracted = true;
            soundGame.loop = true;
            soundGame.play().catch(e => console.log('Audio play prevented:', e));
            document.removeEventListener("click", startMusicOnInteraction);
            document.removeEventListener("keydown", startMusicOnInteraction);
        }
    }
    
    document.addEventListener("click", startMusicOnInteraction);
    document.addEventListener("keydown", startMusicOnInteraction);
    
    // If music is disabled, ensure it's paused
    if (!musicEnabled && soundGame) {
        soundGame.pause();
        soundGame.currentTime = 0;
    }
}