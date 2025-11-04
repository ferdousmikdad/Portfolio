// Main Application Controller
document.addEventListener('DOMContentLoaded', function() {
    console.log('Portfolio loaded successfully!');

    // Initialize SoundManager first
    SoundManager.init();

    // Initialize all modules
    initNavigation();
    initGame();
    initSoundToggle();
    initPlayGameButton();
    initContactButton();
    initCustomCursor();

    // Set initial page
    navigateTo('home');
});

// Sound Manager Module
const SoundManager = (function() {
    // Private variables
    let audioContext = null;
    let soundEnabled = true;
    let audioElements = {};
    let userInteracted = false;
    
    // Initialize audio context
    function initAudioContext() {
        if (!audioContext) {
            try {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                console.log('AudioContext initialized successfully');
            } catch (error) {
                console.error('Failed to initialize AudioContext:', error);
                soundEnabled = false;
                return false;
            }
        }
        
        // Resume context if suspended
        if (audioContext.state === 'suspended') {
            audioContext.resume().then(() => {
                console.log('AudioContext resumed successfully');
            }).catch(error => {
                console.error('Failed to resume AudioContext:', error);
            });
        }
        
        return true;
    }
    
    // Load audio files
    function loadAudioFiles() {
        try {
            // Create audio elements
            audioElements.mepac = new Audio('assets/audio/mepac.mp3');
            audioElements.background = new Audio('assets/audio/background.mp3');
            audioElements.button = new Audio('assets/audio/button.mp3');
            audioElements.pacmanEat = new Audio('assets/audio/pacmaneat.mp3');
            
            // Set volume levels
            audioElements.mepac.volume = 0.5;
            audioElements.background.volume = 0.3;
            audioElements.button.volume = 0.5;
            audioElements.pacmanEat.volume = 0.5;
            
            // Set background audio to loop
            audioElements.background.loop = true;
            
            // Preload audio files
            Object.values(audioElements).forEach(audio => {
                audio.preload = 'auto';
                audio.addEventListener('error', function(e) {
                    console.error(`Error loading audio file: ${audio.src}`, e);
                });
            });
            
            console.log('Audio files loaded successfully');
            return true;
        } catch (error) {
            console.error('Failed to load audio files:', error);
            soundEnabled = false;
            return false;
        }
    }
    
    // Play sound function
    function playSound(soundName) {
        if (!soundEnabled) return false;

        const audio = audioElements[soundName];
        if (!audio) {
            console.error(`Sound not found: ${soundName}`);
            return false;
        }

        try {
            // Initialize audio context if needed
            if (!audioContext) {
                initAudioContext();
            }

            // Reset audio to beginning
            audio.currentTime = 0;

            // Set user interaction flag if this is called from a user event
            setUserInteracted();

            // Play the audio
            const playPromise = audio.play();

            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log(`Playing audio: ${soundName}`);
                }).catch(error => {
                    console.error(`Audio play failed for ${soundName}:`, error);

                    // Try to resume audio context if it's suspended
                    if (audioContext && audioContext.state === 'suspended') {
                        audioContext.resume().then(() => {
                            audio.play().catch(e => {
                                console.error(`Audio play failed after resuming context for ${soundName}:`, e);
                            });
                        }).catch(e => {
                            console.error('Error resuming AudioContext:', e);
                        });
                    }
                });
            }

            return true;
        } catch (error) {
            console.error(`Error playing sound ${soundName}:`, error);
            return false;
        }
    }
    
    // Stop background audio
    function stopBackgroundAudio() {
        const backgroundAudio = audioElements.background;
        if (backgroundAudio && !backgroundAudio.paused) {
            try {
                backgroundAudio.pause();
                backgroundAudio.currentTime = 0;
                console.log('Background audio stopped');
                return true;
            } catch (error) {
                console.error('Error stopping background audio:', error);
                return false;
            }
        }
        return false;
    }
    
    // Toggle sound on/off
    function toggleSound() {
        soundEnabled = !soundEnabled;
        console.log(`Sound ${soundEnabled ? 'enabled' : 'disabled'}`);

        // Update global soundOn variable for backward compatibility
        window.soundOn = soundEnabled;

        if (!soundEnabled) {
            stopBackgroundAudio();
        }

        return soundEnabled;
    }
    
    // Check if sound is enabled
    function isSoundEnabled() {
        return soundEnabled;
    }
    
    // Set user interaction flag
    function setUserInteracted() {
        if (!userInteracted) {
            userInteracted = true;
            console.log('User interaction detected - audio can now play');

            // Initialize audio context on first interaction
            if (!audioContext) {
                initAudioContext();
            }

            // Try to resume audio context if it's suspended
            if (audioContext && audioContext.state === 'suspended') {
                audioContext.resume().then(() => {
                    console.log('AudioContext resumed successfully');
                }).catch(error => {
                    console.error('Failed to resume AudioContext:', error);
                });
            }

            // Update global soundOn variable for backward compatibility
            window.soundOn = soundEnabled;
        }
    }
    
    // Public API
    return {
        init: function() {
            const success = loadAudioFiles();
            if (success) {
                // Set up user interaction listeners (persist for better audio handling)
                const interactionEvents = ['click', 'touchstart', 'keydown'];
                interactionEvents.forEach(event => {
                    document.addEventListener(event, setUserInteracted);
                });

                // Initialize global soundOn variable
                window.soundOn = soundEnabled;
            }
            return success;
        },
        
        play: playSound,
        stopBackground: stopBackgroundAudio,
        toggle: toggleSound,
        isEnabled: isSoundEnabled,
        setUserInteracted: setUserInteracted
    };
})();

// Legacy functions for backward compatibility
function playSound(audioElement) {
    if (typeof audioElement === 'string') {
        return SoundManager.play(audioElement);
    } else if (window.soundOn && audioElement) {
        try {
            audioElement.currentTime = 0;
            const playPromise = audioElement.play();
            
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log(`Playing audio: ${audioElement.src}`);
                }).catch(error => {
                    console.error('Audio play failed:', error);
                    
                    if (window.audioContext && window.audioContext.state === 'suspended') {
                        window.audioContext.resume().then(() => {
                            audioElement.play().catch(e => {
                                console.error('Audio play failed after resuming context:', e);
                            });
                        }).catch(e => {
                            console.error('Error resuming AudioContext:', e);
                        });
                    }
                });
            }
        } catch (error) {
            console.error('Error playing sound:', error);
        }
    }
}

function stopBackgroundAudio() {
    return SoundManager.stopBackground();
}

// Initialize Custom Cursor
function initCustomCursor() {
    document.body.style.cursor = "url('assets/images/cursor.svg') 3 3, auto";
    
    const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a, input, textarea, .text-gray-400, .text-gray-300, .text-lg, .text-sm, .text-xl, .text-3xl, .text-4xl');
    textElements.forEach(element => {
        element.style.cursor = "url('assets/images/cursor.svg') 3 3, text";
    });
    
    const buttonElements = document.querySelectorAll('button, .nav-bottom-item, .nav-link, .project-nav-arrow, #playGameBtn, #soundToggleBottom, #startGame, #startGame2, #prevProject, #nextProject, #prevProject2, #nextProject2');
    buttonElements.forEach(element => {
        element.style.cursor = "url('assets/images/cursor.svg') 3 3, pointer";
    });
    
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) {
                        node.style.cursor = "url('assets/images/cursor.svg') 3 3, auto";
                        
                        if (node.matches('p, h1, h2, h3, h4, h5, h6, span, a, input, textarea, .text-gray-400, .text-gray-300, .text-lg, .text-sm, .text-xl, .text-3xl, .text-4xl')) {
                            node.style.cursor = "url('assets/images/cursor.svg') 3 3, text";
                        }
                        
                        if (node.matches('button, .nav-bottom-item, .nav-link, .project-nav-arrow, #playGameBtn, #soundToggleBottom, #startGame, #startGame2, #prevProject, #nextProject, #prevProject2, #nextProject2')) {
                            node.style.cursor = "url('assets/images/cursor.svg') 3 3, pointer";
                        }
                        
                        const childElements = node.querySelectorAll('*');
                        childElements.forEach(child => {
                            child.style.cursor = "url('assets/images/cursor.svg') 3 3, auto";
                            
                            if (child.matches('p, h1, h2, h3, h4, h5, h6, span, a, input, textarea, .text-gray-400, .text-gray-300, .text-lg, .text-sm, .text-xl, .text-3xl, .text-4xl')) {
                                child.style.cursor = "url('assets/images/cursor.svg') 3 3, text";
                            }
                            
                            if (child.matches('button, .nav-bottom-item, .nav-link, .project-nav-arrow, #playGameBtn, #soundToggleBottom, #startGame, #startGame2, #prevProject, #nextProject, #prevProject2, #nextProject2')) {
                                child.style.cursor = "url('assets/images/cursor.svg') 3 3, pointer";
                            }
                        });
                    }
                });
            }
        });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
}

// Sound Toggle Functionality
function initSoundToggle() {
    console.log('Initializing sound toggle...');

    const soundToggleBottom = document.getElementById('soundToggleBottom');
    const soundOnIconBottom = document.getElementById('soundOnIconBottom');
    const soundOffIconBottom = document.getElementById('soundOffIconBottom');

    if (!soundToggleBottom || !soundOnIconBottom || !soundOffIconBottom) {
        console.error('Sound toggle elements not found:', {
            soundToggleBottom: !!soundToggleBottom,
            soundOnIconBottom: !!soundOnIconBottom,
            soundOffIconBottom: !!soundOffIconBottom
        });
        return;
      }

    console.log('All sound toggle elements found');

    // Remove restrictive check - let the toggle work even if sound system isn't fully initialized yet
    
    // Set initial state based on SoundManager
    updateSoundIcons();
    
    // Add click event listener
    soundToggleBottom.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();

        console.log('Sound toggle clicked');

        // Ensure user interaction is set before toggling
        SoundManager.setUserInteracted();

        // Toggle sound using SoundManager
        const newSoundState = SoundManager.toggle();
        console.log('Sound toggled to:', newSoundState ? 'ON' : 'OFF');

        // Update icons based on new state
        updateSoundIcons();

        // Play button sound when turning sound on (with a small delay)
        if (newSoundState) {
            setTimeout(() => {
                SoundManager.play('button');
            }, 100);
        }
    });
    
    // Function to update sound icons based on current state
    function updateSoundIcons() {
        const soundEnabled = SoundManager.isEnabled();
        console.log('Updating sound icons, sound enabled:', soundEnabled);

        if (soundEnabled) {
            soundOnIconBottom.classList.remove('hidden');
            soundOffIconBottom.classList.add('hidden');
            console.log('Showing sound ON icon');
        } else {
            soundOnIconBottom.classList.add('hidden');
            soundOffIconBottom.classList.remove('hidden');
            console.log('Showing sound OFF icon');
        }
    }
    
    // Expose sound state to window for backward compatibility
    window.soundOn = SoundManager.isEnabled();

    // Also expose the update function for external calls
    window.updateSoundIcons = updateSoundIcons;

    console.log('Sound toggle initialized successfully with state:', SoundManager.isEnabled() ? 'ON' : 'OFF');
}

// Play Game Button Functionality
function initPlayGameButton() {
    const playGameBtn = document.getElementById('playGameBtn');
    
    function updateButtonText() {
        const homePage = document.getElementById('homePage');
        const workPage = document.getElementById('workPage');
        
        if (!homePage.classList.contains('hidden')) {
            if (window.gameStarted) {
                playGameBtn.textContent = 'reset game';
            } else {
                playGameBtn.textContent = 'play game';
            }
        } else if (!workPage.classList.contains('hidden')) {
            if (window.gameStarted2) {
                playGameBtn.textContent = 'reset game';
            } else {
                playGameBtn.textContent = 'play game';
            }
        }
    }
    
    updateButtonText();
    
    const observer = new MutationObserver(updateButtonText);
    observer.observe(document.getElementById('homePage'), { attributes: true, attributeFilter: ['class'] });
    observer.observe(document.getElementById('workPage'), { attributes: true, attributeFilter: ['class'] });
    
    playGameBtn.addEventListener('click', function() {
        // Use SoundManager for button sound
        if (SoundManager.isEnabled()) {
            SoundManager.play('button');
        }
        
        SoundManager.stopBackground();
        
        const homePage = document.getElementById('homePage');
        const workPage = document.getElementById('workPage');
        
        if (!homePage.classList.contains('hidden')) {
            if (window.gameStarted) {
                window.resetGame();
                setTimeout(updateButtonText, 100);
            } else {
                window.startGameHandler();
                setTimeout(updateButtonText, 100);
            }
        } else if (!workPage.classList.contains('hidden')) {
            if (window.gameStarted2) {
                window.resetGame2();
                setTimeout(updateButtonText, 100);
            } else {
                window.startGameHandler2();
                setTimeout(updateButtonText, 100);
            }
        }
    });
}

// Play Eat Sound
function playEatSound() {
    SoundManager.play('pacmanEat');
}

// Contact Button Functionality
function initContactButton() {
    const contactButton = document.querySelector('[data-page="contact"]');
    
    if (contactButton) {
        contactButton.addEventListener('click', function() {
            // Use SoundManager for button sound
            if (SoundManager.isEnabled()) {
                SoundManager.play('button');
            }
            
            SoundManager.stopBackground();
        });
    }
}

// Create Mepac Bubble Effect
function createMepacBubbleEffect() {
    const mepacAvatar = document.querySelector('.mepac-moving');
    if (!mepacAvatar) return;
    
    const rect = mepacAvatar.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    for (let i = 0; i < 15; i++) {
        setTimeout(() => {
            const bubble = document.createElement('div');
            bubble.className = 'bubble';
            
            const size = Math.random() * 25 + 15;
            bubble.style.width = `${size}px`;
            bubble.style.height = `${size}px`;
            
            const offsetX = (Math.random() - 0.5) * 60;
            const offsetY = (Math.random() - 0.5) * 60;
            bubble.style.left = `${centerX + offsetX}px`;
            bubble.style.top = `${centerY + offsetY}px`;
            
            document.body.appendChild(bubble);
            
            setTimeout(() => {
                bubble.classList.add('bubble-animate');
            }, 10);
            
            setTimeout(() => {
                bubble.remove();
            }, 2000);
        }, i * 100);
    }
    
    SoundManager.play('mepac');
}

// Create Bubble Effect
function createBubbleEffect() {
    const mepacAvatar = document.querySelector('.mepac-moving');
    if (!mepacAvatar) return;
    
    const rect = mepacAvatar.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    for (let i = 0; i < 10; i++) {
        setTimeout(() => {
            const bubble = document.createElement('div');
            bubble.className = 'bubble';
            
            const size = Math.random() * 20 + 10;
            bubble.style.width = `${size}px`;
            bubble.style.height = `${size}px`;
            
            const offsetX = (Math.random() - 0.5) * 40;
            const offsetY = (Math.random() - 0.5) * 40;
            bubble.style.left = `${centerX + offsetX}px`;
            bubble.style.top = `${centerY + offsetY}px`;
            
            document.body.appendChild(bubble);
            
            setTimeout(() => {
                bubble.classList.add('bubble-animate');
            }, 10);
            
            setTimeout(() => {
                bubble.remove();
            }, 2000);
        }, i * 50);
    }
    
    SoundManager.play('mepac');
}

// Export for other modules
window.playSound = playSound;
window.stopBackgroundAudio = stopBackgroundAudio;
window.playEatSound = playEatSound;
window.createBubbleEffect = createBubbleEffect;
window.SoundManager = SoundManager;

// Debug function to test sound system
window.testSound = function(soundName) {
    console.log('Testing sound:', soundName);
    console.log('Sound enabled:', SoundManager.isEnabled());
    console.log('User interacted:', window.userInteracted);
    console.log('Audio context state:', SoundManager.audioContext ? SoundManager.audioContext.state : 'not initialized');
    return SoundManager.play(soundName);
};

// Debug function to test sound toggle specifically
window.testSoundToggle = function() {
    console.log('=== Sound Toggle Debug Info ===');
    console.log('SoundToggleBottom element:', !!document.getElementById('soundToggleBottom'));
    console.log('SoundOnIconBottom element:', !!document.getElementById('soundOnIconBottom'));
    console.log('SoundOffIconBottom element:', !!document.getElementById('soundOffIconBottom'));
    console.log('SoundManager.isEnabled():', SoundManager.isEnabled());
    console.log('window.soundOn:', window.soundOn);
    console.log('Current icon states:');
    console.log('  Sound ON icon hidden:', document.getElementById('soundOnIconBottom')?.classList.contains('hidden'));
    console.log('  Sound OFF icon hidden:', document.getElementById('soundOffIconBottom')?.classList.contains('hidden'));
    console.log('================================');
};