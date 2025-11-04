import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import soundManager from '../utils/SoundManager';

const Navigation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [gameStarted, setGameStarted] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);

    // Get current page from pathname
    const getCurrentPage = () => {
        const path = location.pathname;
        if (path === '/' || path === '/home') return 'home';
        if (path === '/work') return 'work';
        if (path === '/contact') return 'contact';
        return 'home';
    };

    const currentPage = getCurrentPage();

    useEffect(() => {
        // Update sound state when sound manager changes
        setSoundEnabled(soundManager.isSoundEnabled());
    }, [location.pathname]);

    const handleNavigation = (page) => {
        // Set user interaction flag for audio
        soundManager.setUserInteracted();
        
        // Stop background audio if playing
        soundManager.stopBackground();
        
        // Play button sound if sound is enabled
        if (soundManager.isSoundEnabled()) {
            soundManager.play('button');
        }
        
        // Navigate to the selected page
        navigate(page === 'home' ? '/' : `/${page}`);
    };

    const handlePlayGame = () => {
        // Set user interaction flag
        soundManager.setUserInteracted();
        
        // Use SoundManager for button sound
        if (soundManager.isSoundEnabled()) {
            soundManager.play('button');
        }
        
        soundManager.stopBackground();
        
        // Navigate to home and trigger game start
        navigate('/');
        
        // Trigger game start after navigation
        setTimeout(() => {
            const event = new CustomEvent('startGame');
            window.dispatchEvent(event);
        }, 300);
    };

    const handleSoundToggle = () => {
        // Set user interaction flag
        soundManager.setUserInteracted();
        
        // Toggle sound using SoundManager
        const newSoundState = soundManager.toggle();
        setSoundEnabled(newSoundState);
        
        // Play button sound when turning sound on
        if (newSoundState) {
            soundManager.play('button');
        }
    };

    return (
        <nav className="fixed bottom-8 nav-items left-1/2 -translate-x-1/2 flex items-center gap-8 z-50 bg-gray-900/80 px-8 rounded-full">
            <div
                className={`nav-bottom-item title-font text-lg text-custom ${currentPage === 'home' ? 'active' : ''}`}
                onClick={() => handleNavigation('home')}
            >
                Home
            </div>
            <div
                className={`nav-bottom-item title-font text-lg text-custom ${currentPage === 'work' ? 'active' : ''}`}
                onClick={() => handleNavigation('work')}
            >
                Work
            </div>
            <div
                className={`nav-bottom-item title-font text-lg text-custom ${currentPage === 'contact' ? 'active' : ''}`}
                onClick={() => handleNavigation('contact')}
            >
                Contact
            </div>
            <span className="text-red">|</span>
            <button
                onClick={handlePlayGame}
                className="title-font nav-play-btn text-lg text-custom hover:text-title-custom transition-colors"
            >
                play game
            </button>
            <button
                onClick={handleSoundToggle}
                className="nav-sound-btn rounded-full hover:bg-gray-700 transition-colors"
            >
                {soundEnabled ? (
                    <img
                        src="/images/soundOn.svg"
                        alt="Sound On"
                        className="w-5 h-5"
                    />
                ) : (
                    <img
                        src="/images/soundOff.svg"
                        alt="Sound Off"
                        className="w-5 h-5"
                    />
                )}
            </button>
        </nav>
    );
};

export default Navigation;