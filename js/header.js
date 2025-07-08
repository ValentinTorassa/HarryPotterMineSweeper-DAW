// Header loader
document.addEventListener('DOMContentLoaded', function() {
    // Load header
    fetch('components/header.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('header-placeholder').innerHTML = data;
            
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
});

function initializeModeToggle() {
    const toggleBtn = document.getElementById('toggleModeBtn');
    const musicBtn = document.getElementById('musicToggleBtn');
    
    // Initialize mode from localStorage
    const savedMode = localStorage.getItem('theme') || 'dark';
    document.documentElement.className = savedMode === 'light' ? 'light-mode' : '';
    toggleBtn.textContent = savedMode === 'light' ? '🌙' : '☀️';
    
    // Mode toggle event
    toggleBtn.addEventListener('click', function() {
        const isLightMode = document.documentElement.classList.contains('light-mode');
        if (isLightMode) {
            document.documentElement.classList.remove('light-mode');
            toggleBtn.textContent = '☀️';
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.add('light-mode');
            toggleBtn.textContent = '🌙';
            localStorage.setItem('theme', 'light');
        }
    });
    
    // Music toggle (if exists)
    if (typeof toggleMusic === 'function') {
        musicBtn.addEventListener('click', toggleMusic);
    }
}