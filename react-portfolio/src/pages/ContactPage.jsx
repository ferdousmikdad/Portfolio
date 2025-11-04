import React, { useEffect, useRef } from 'react';
import soundManager from '../utils/SoundManager';

const ContactPage = () => {
    const mepacRef = useRef(null);

    useEffect(() => {
        // Stop background audio when contact page loads
        soundManager.stopBackground();
        
        // Set user interaction flag for audio
        soundManager.setUserInteracted();
        
        // Create bubble effect after a short delay
        const timer = setTimeout(() => {
            createMepacBubbleEffect();
        }, 1000);
        
        return () => clearTimeout(timer);
    }, []);

    const createMepacBubbleEffect = () => {
        const mepacAvatar = mepacRef.current;
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

    const createBubbleEffect = () => {
        const mepacAvatar = mepacRef.current;
        if (!mepacAvatar) return;
        
        // Set user interaction flag for audio
        soundManager.setUserInteracted();
        
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
        
        soundManager.play('mepac');
    };

    const handleLinkClick = () => {
        // Set user interaction flag for audio
        soundManager.setUserInteracted();
        
        // Play button sound if sound is enabled
        if (soundManager.isSoundEnabled()) {
            soundManager.play('button');
        }
        
        // Create bubble effect
        createBubbleEffect();
    };

    return (
        <div className="flex items-center justify-center min-h-[600px] fade-in bg-dark">
            <div className="text-center p-12 bg-dark">
                {/* Avatar with Speech Bubble */}
                <div className="relative inline-block mb-8">
                    {/* Animated Avatar */}
                    <div className="mepac-popup inline-block">
                        <img
                            ref={mepacRef}
                            src="/images/mepac.svg"
                            alt="Ferdous Avatar"
                            className="w-40 h-40 mepac-moving"
                        />
                    </div>

                    {/* Speech Bubble */}
                    <div
                        className="speech-bubble absolute top-28 left-24 ml-4 bg-gray-800 px-6 py-3 rounded-full rounded-tl-none title-font text-xl shadow-lg border border-custom"
                    >
                        Hey!
                    </div>
                </div>

                {/* Email */}
                <p className="text-lg text-custom">
                    Download my
                    <a
                        href="mailto:ferdousmikdad@gmail.com"
                        className="hover:text-title-custom transition-colors"
                        onClick={handleLinkClick}
                    >
                        CV
                    </a>
                </p>
                <p className="text-lg text-custom mt-4">
                    Email :
                    <a
                        href="mailto:ferdousmikdad@gmail.com"
                        className="hover:text-title-custom transition-colors"
                        onClick={handleLinkClick}
                    >
                        ferdousmikdad@gmail.com
                    </a>
                </p>
            </div>
        </div>
    );
};

export default ContactPage;