class SoundManager {
    constructor() {
        // Private variables
        this.audioContext = null;
        this.soundEnabled = true;
        this.audioElements = {};
        this.userInteracted = false;
        
        // Initialize the sound system (but don't create AudioContext yet)
        this.init();
    }
    
    // Initialize audio context
    initAudioContext() {
        if (!this.audioContext) {
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                console.log('AudioContext initialized successfully');
            } catch (error) {
                console.error('Failed to initialize AudioContext:', error);
                this.soundEnabled = false;
                return false;
            }
        }
        
        // Resume context if suspended
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume().then(() => {
                console.log('AudioContext resumed successfully');
            }).catch(error => {
                console.error('Failed to resume AudioContext:', error);
            });
        }
        
        return true;
    }
    
    // Load audio files
    loadAudioFiles() {
        try {
            // Create audio elements
            this.audioElements.mepac = new Audio('/audio/mepac.mp3');
            this.audioElements.background = new Audio('/audio/background.mp3');
            this.audioElements.button = new Audio('/audio/button.mp3');
            this.audioElements.pacmanEat = new Audio('/audio/pacmaneat.mp3');
            
            // Set volume levels
            this.audioElements.mepac.volume = 0.5;
            this.audioElements.background.volume = 0.3;
            this.audioElements.button.volume = 0.5;
            this.audioElements.pacmanEat.volume = 0.5;
            
            // Set background audio to loop
            this.audioElements.background.loop = true;
            
            // Preload audio files
            Object.values(this.audioElements).forEach(audio => {
                audio.preload = 'auto';
                audio.addEventListener('error', function(e) {
                    console.error(`Error loading audio file: ${audio.src}`, e);
                });
            });
            
            console.log('Audio files loaded successfully');
            return true;
        } catch (error) {
            console.error('Failed to load audio files:', error);
            this.soundEnabled = false;
            return false;
        }
    }
    
    // Play sound function
    playSound(soundName) {
        if (!this.soundEnabled || !this.userInteracted) return false;
        
        const audio = this.audioElements[soundName];
        if (!audio) {
            console.error(`Sound not found: ${soundName}`);
            return false;
        }
        
        try {
            // Initialize audio context if needed
            if (!this.audioContext) {
                this.initAudioContext();
            }
            
            // Reset audio to beginning
            audio.currentTime = 0;
            
            // Play the audio
            const playPromise = audio.play();
            
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log(`Playing audio: ${audio.src}`);
                }).catch(error => {
                    console.error(`Audio play failed for ${soundName}:`, error);
                    
                    // Try to resume audio context if it's suspended
                    if (this.audioContext && this.audioContext.state === 'suspended') {
                        this.audioContext.resume().then(() => {
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
    
    // Alias for playSound method to match usage in components
    play(soundName) {
        return this.playSound(soundName);
    }
    
    // Alias for stopBackgroundAudio to match usage in components
    stopBackground() {
        return this.stopBackgroundAudio();
    }
    
    // Stop background audio
    stopBackgroundAudio() {
        const backgroundAudio = this.audioElements.background;
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
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        console.log(`Sound ${this.soundEnabled ? 'enabled' : 'disabled'}`);
        
        if (!this.soundEnabled) {
            this.stopBackgroundAudio();
        }
        
        return this.soundEnabled;
    }
    
    // Alias for toggleSound method to match usage in components
    toggle() {
        return this.toggleSound();
    }
    
    // Check if sound is enabled
    isSoundEnabled() {
        return this.soundEnabled;
    }
    
    // Set user interaction flag
    setUserInteracted() {
        if (!this.userInteracted) {
            this.userInteracted = true;
            console.log('User interaction detected - audio can now play');
            
            // Initialize audio context on first interaction
            if (!this.audioContext) {
                this.initAudioContext();
            }
        }
        
        // Always try to resume the context when this method is called
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume().then(() => {
                console.log('AudioContext resumed after user interaction');
            }).catch(error => {
                console.error('Failed to resume AudioContext after user interaction:', error);
            });
        }
    }
    
    // Initialize the sound system
    init() {
        const success = this.loadAudioFiles();
        if (success) {
            // Set up user interaction listeners
            const interactionEvents = ['click', 'touchstart', 'keydown'];
            interactionEvents.forEach(event => {
                document.addEventListener(event, () => this.setUserInteracted(), { once: true });
            });
        }
        return success;
    }
}

// Create and export a singleton instance
const soundManager = new SoundManager();
export default soundManager;