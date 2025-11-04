import React, { useEffect } from 'react';
import PacmanGame from '../components/PacmanGame';
import soundManager from '../utils/SoundManager';

const HomePage = () => {
    useEffect(() => {
        // Stop background audio when home page loads
        soundManager.stopBackground();
        
        // Set user interaction flag for audio
        soundManager.setUserInteracted();
    }, []);

    const createMepacBubbleEffect = () => {
        const mepacAvatar = document.querySelector('.mepac-moving');
        if (!mepacAvatar) return;
        
        // Set user interaction flag for audio
        soundManager.setUserInteracted();
        
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
        
        soundManager.play('mepac');
    };

    return (
        <div className="profile-game-container fade-in border border-custom rounded-lg bg-dark w-full ">
            {/* Left Side - Profile Info */}
            <div className="profile-section p-6 bg-dark">
                <div className="pixel-avatar mb-6">
                    <img
                        src="/images/ferdousmikdad.png"
                        alt="Ferdous Mikdad"
                        className="w-full h-full object-cover rounded-lg"
                    />
                </div>

                <h1 className="title-font text-4xl mb-2">Ferdous Mikdad</h1>
                <p className="text-lg text-custom">Creative & UI/UX Designer</p>

                <p className="text-sm text-custom leading-relaxed mb-16">
                    Designing digital experiences that blend creativity with
                    usability. 5+ years in branding, web, and product design—bringing
                    ideas to life with a sharp eye and a human touch.
                </p>

                <div className="flex gap-8 text-sm">
                    <a
                        href="mailto:ferdousmikdad@gmail.com"
                        className="hover:text-title-custom transition-colors text-offwhite"
                        onClick={() => {
                            soundManager.setUserInteracted();
                            if (soundManager.isSoundEnabled()) {
                                soundManager.play('button');
                            }
                        }}
                    >
                        Email
                    </a>
                    <span className="text-red"> /</span>
                    <a
                        href="https://www.linkedin.com/in/ferdousmikdad/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-title-custom transition-colors text-offwhite"
                        onClick={() => {
                            soundManager.setUserInteracted();
                            if (soundManager.isSoundEnabled()) {
                                soundManager.play('button');
                            }
                        }}
                    >
                        LinkedIn
                    </a>
                    <span className="text-red">/</span>
                    <a
                        href="https://www.instagram.com/ferdousmikdad"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-title-custom transition-colors text-offwhite"
                        onClick={() => {
                            soundManager.setUserInteracted();
                            if (soundManager.isSoundEnabled()) {
                                soundManager.play('button');
                            }
                        }}
                    >
                        Instagram
                    </a>
                </div>
            </div>

            {/* Right Side - Game Area */}
            <div className="game-section">
                <PacmanGame pageType="home" />
            </div>
        </div>
    );
};

export default HomePage;