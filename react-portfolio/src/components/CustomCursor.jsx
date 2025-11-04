import React, { useEffect } from 'react';
import soundManager from '../utils/SoundManager';

const CustomCursor = () => {
    useEffect(() => {
        // Set custom cursor styles
        document.body.style.cursor = "url('/images/cursor.svg') 3 3, auto";
        document.body.style.backgroundColor = '#070707'; // Set dark background
        
        const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a, input, textarea, .text-gray-400, .text-gray-300, .text-lg, .text-sm, .text-xl, .text-3xl, .text-4xl');
        textElements.forEach(element => {
            element.style.cursor = "url('/images/cursor.svg') 3 3, text";
        });
        
        const buttonElements = document.querySelectorAll('button, .nav-bottom-item, .nav-link, .project-nav-arrow, #playGameBtn, #soundToggleBottom, #startGame, #startGame2, #prevProject, #nextProject, #prevProject2, #nextProject2');
        buttonElements.forEach(element => {
            element.style.cursor = "url('/images/cursor.svg') 3 3, pointer";
        });
        
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1) {
                            node.style.cursor = "url('/images/cursor.svg') 3 3, auto";
                            
                            if (node.matches('p, h1, h2, h3, h4, h5, h6, span, a, input, textarea, .text-gray-400, .text-gray-300, .text-lg, .text-sm, .text-xl, .text-3xl, .text-4xl')) {
                                node.style.cursor = "url('/images/cursor.svg') 3 3, text";
                            }
                            
                            if (node.matches('button, .nav-bottom-item, .nav-link, .project-nav-arrow, #playGameBtn, #soundToggleBottom, #startGame, #startGame2, #prevProject, #nextProject, #prevProject2, #nextProject2')) {
                                node.style.cursor = "url('/images/cursor.svg') 3 3, pointer";
                            }
                            
                            const childElements = node.querySelectorAll('*');
                            childElements.forEach(child => {
                                child.style.cursor = "url('/images/cursor.svg') 3 3, auto";
                                
                                if (child.matches('p, h1, h2, h3, h4, h5, h6, span, a, input, textarea, .text-gray-400, .text-gray-300, .text-lg, .text-sm, .text-xl, .text-3xl, .text-4xl')) {
                                    child.style.cursor = "url('/images/cursor.svg') 3 3, text";
                                }
                                
                                if (child.matches('button, .nav-bottom-item, .nav-link, .project-nav-arrow, #playGameBtn, #soundToggleBottom, #startGame, #startGame2, #prevProject, #nextProject, #prevProject2, #nextProject2')) {
                                    child.style.cursor = "url('/images/cursor.svg') 3 3, pointer";
                                }
                            });
                        }
                    });
                }
            });
        });
        
        observer.observe(document.body, { childList: true, subtree: true });
        
        return () => {
            observer.disconnect();
        };
    }, []);

    return null; // This component doesn't render anything
};

export default CustomCursor;