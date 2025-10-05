// Navigation Controller

let currentPage = 'home';

// Initialize Navigation
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-bottom-item');
    const playGameBtn = document.getElementById('playGameBtn');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Bottom navigation items
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            // Stop background audio if playing
            stopBackgroundAudio();
            
            // Play button sound if sound is enabled
            if (window.soundOn && window.buttonAudio) {
                try {
                    window.buttonAudio.currentTime = 0; // Reset to beginning
                    window.buttonAudio.play().catch(e => console.log('Button audio play failed:', e));
                } catch (error) {
                    console.error('Error playing button sound:', error);
                }
            }
            
            const page = this.dataset.page;
            navigateTo(page);
        });
    });
    
    // Play game button
    if (playGameBtn) {
        playGameBtn.addEventListener('click', function() {
            // Stop background audio if playing
            stopBackgroundAudio();
            
            // Play button sound if sound is enabled
            if (window.soundOn && window.buttonAudio) {
                try {
                    window.buttonAudio.currentTime = 0; // Reset to beginning
                    window.buttonAudio.play().catch(e => console.log('Button audio play failed:', e));
                } catch (error) {
                    console.error('Error playing button sound:', error);
                }
            }
            
            navigateTo('home');
            // Trigger game start if on home page
            setTimeout(() => {
                const startGameBtn = document.getElementById('startGame');
                if (startGameBtn && !startGameBtn.classList.contains('hidden')) {
                    // Focus on game area
                    document.getElementById('gameGrid').scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 300);
        });
    }
    
    // Contact page back links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Stop background audio if playing
            stopBackgroundAudio();
            
            // Play button sound if sound is enabled
            if (window.soundOn && window.buttonAudio) {
                try {
                    window.buttonAudio.currentTime = 0; // Reset to beginning
                    window.buttonAudio.play().catch(e => console.log('Button audio play failed:', e));
                } catch (error) {
                    console.error('Error playing button sound:', error);
                }
            }
            
            const page = this.dataset.page;
            if (page) {
                navigateTo(page);
            }
        });
    });
}

// Navigate to Page
function navigateTo(page) {
    currentPage = page;
    
    // Hide all pages
    document.getElementById('homePage').classList.add('hidden');
    document.getElementById('workPage').classList.add('hidden');
    document.getElementById('contactPage').classList.add('hidden');
    
    // Update navigation active state
    const navItems = document.querySelectorAll('.nav-bottom-item');
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === page) {
            item.classList.add('active');
        }
    });
    
    // Show selected page
    if (page === 'home') {
        const homePage = document.getElementById('homePage');
        homePage.classList.remove('hidden');
        homePage.classList.add('flex', 'fade-in');
        
        // Reset the home page game if it exists
        if (window.resetGame) {
            window.resetGame();
        }
    } else if (page === 'work') {
        const workPage = document.getElementById('workPage');
        workPage.classList.remove('hidden');
        workPage.classList.add('flex', 'fade-in');
        
        // Initialize work gallery when work page is loaded
        if (window.initWorkGallery) {
            window.initWorkGallery();
        }
    } else if (page === 'contact') {
        const contactPage = document.getElementById('contactPage');
        contactPage.classList.remove('hidden');
        contactPage.classList.add('fade-in');
    }
}

// Export for use in other modules
window.initNavigation = initNavigation;
window.navigateTo = navigateTo;