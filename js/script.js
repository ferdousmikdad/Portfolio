// Main Application Controller
document.addEventListener('DOMContentLoaded', function() {
    console.log('Portfolio loaded successfully!');

    // Initialize all modules
    initNavigation();
    initGame();
    initContactButton();
    initCustomCursor();
    initToolsNav();

    // Set initial page
    navigateTo('home');
});

// Initialize Custom Cursor
function initCustomCursor() {
    document.body.style.cursor = "url('assets/images/cursor.svg') 3 3, auto";

    const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a, input, textarea, .text-gray-400, .text-gray-300, .text-lg, .text-sm, .text-xl, .text-3xl, .text-4xl');
    textElements.forEach(element => {
        element.style.cursor = "url('assets/images/cursor.svg') 3 3, text";
    });

    const buttonElements = document.querySelectorAll('button, .nav-bottom-item, .nav-link, .project-nav-arrow, #playGameBtn, #startGame, #startGame2, #prevProject, #nextProject, #prevProject2, #nextProject2');
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

                        if (node.matches('button, .nav-bottom-item, .nav-link, .project-nav-arrow, #playGameBtn, #startGame, #startGame2, #prevProject, #nextProject, #prevProject2, #nextProject2')) {
                            node.style.cursor = "url('assets/images/cursor.svg') 3 3, pointer";
                        }

                        const childElements = node.querySelectorAll('*');
                        childElements.forEach(child => {
                            child.style.cursor = "url('assets/images/cursor.svg') 3 3, auto";

                            if (child.matches('p, h1, h2, h3, h4, h5, h6, span, a, input, textarea, .text-gray-400, .text-gray-300, .text-lg, .text-sm, .text-xl, .text-3xl, .text-4xl')) {
                                child.style.cursor = "url('assets/images/cursor.svg') 3 3, text";
                            }

                            if (child.matches('button, .nav-bottom-item, .nav-link, .project-nav-arrow, #playGameBtn, #startGame, #startGame2, #prevProject, #nextProject, #prevProject2, #nextProject2')) {
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

// Contact Button Functionality
function initContactButton() {
    const contactButton = document.querySelector('[data-page="contact"]');

    if (contactButton) {
        contactButton.addEventListener('click', function() {
            // contact navigation handled by initNavigation
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
}

// Tools Navigation
function initToolsNav() {
    const toolFrame       = document.getElementById('toolFrame');
    const toolPlaceholder = document.getElementById('toolPlaceholder');
    const placeholderName = document.getElementById('placeholderName');
    const navBtns         = document.querySelectorAll('.tool-nav-btn');

    if (!toolFrame) return;

    navBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active state
            navBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const url  = this.dataset.url;
            const name = this.querySelector('span:last-child').textContent;

            if (url) {
                // Load tool in iframe
                toolFrame.src = url;
                toolFrame.classList.remove('hidden');
                toolPlaceholder.classList.add('hidden');
            } else {
                // Show coming soon placeholder
                toolFrame.classList.add('hidden');
                toolPlaceholder.classList.remove('hidden');
                placeholderName.textContent = name;
            }
        });
    });
}

// Export for other modules
window.createBubbleEffect = createBubbleEffect;
