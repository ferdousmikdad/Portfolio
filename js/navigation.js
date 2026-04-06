// Navigation Controller

let currentPage = 'home';

const PAGES = ['homePage', 'workPage', 'shopPage', 'contactPage', 'toolsPage'];

function initNavigation() {
    document.querySelectorAll('.nav-bottom-item').forEach(item => {
        item.addEventListener('click', function () {
            navigateTo(this.dataset.page);
        });
        initDecodeEffect(item);
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            if (this.dataset.page) navigateTo(this.dataset.page);
        });
    });
}

// ── Decode Hover Effect ───────────────────────────────────────────────────────

const DECODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%';

function initDecodeEffect(el) {
    const original = el.textContent.trim();
    let animFrame  = null;

    el.addEventListener('mouseenter', () => {
        cancelAnimationFrame(animFrame);
        let iteration = 0;
        const totalSteps = original.length * 3;

        let lastTime = 0;
        const FRAME_DELAY = 35; // ms per frame — increase to slow down

        function step(timestamp) {
            if (timestamp - lastTime < FRAME_DELAY) {
                animFrame = requestAnimationFrame(step);
                return;
            }
            lastTime = timestamp;

            el.textContent = original.split('').map((char, i) => {
                if (char === ' ') return ' ';
                if (i < Math.floor(iteration / 3)) return original[i];
                return DECODE_CHARS[Math.floor(Math.random() * DECODE_CHARS.length)];
            }).join('');

            iteration++;
            if (iteration <= totalSteps) {
                animFrame = requestAnimationFrame(step);
            } else {
                el.textContent = original;
            }
        }

        step();
    });

    el.addEventListener('mouseleave', () => {
        cancelAnimationFrame(animFrame);
        el.textContent = original;
    });
}

function navigateTo(page) {
    currentPage = page;

    // Hide all pages
    PAGES.forEach(id => document.getElementById(id).classList.add('hidden'));

    // Update active nav item
    document.querySelectorAll('.nav-bottom-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === page);
    });

    // Show target page
    const pageEl = document.getElementById(page + 'Page');
    if (!pageEl) return;

    pageEl.classList.remove('hidden');
    pageEl.classList.add('fade-in');

    if (page === 'home' || page === 'work') {
        pageEl.classList.add('flex');
    }

    if (page === 'home' && window.resetGame)        window.resetGame();
    if (page === 'work' && window.initWorkGallery)  window.initWorkGallery();
    if (page === 'shop')                            startComingSoonAnimation();
}

function startComingSoonAnimation() {
    const el  = document.getElementById('comingSoonText');
    const sub = document.getElementById('comingSoonSub');
    if (!el || !sub) return;

    const cursor = '<span class="typing-cursor">|</span>';
    el.innerHTML      = '';
    sub.innerHTML     = '';
    sub.style.opacity = '1';

    typeText(el, 'Coming Soon', 100, () => {
        setTimeout(() => typeText(sub, 'Something exciting is on the way. Stay tuned.', 40), 300);
    });
}

function typeText(el, text, speed, onDone) {
    const cursor = '<span class="typing-cursor">|</span>';
    let i = 0;
    const interval = setInterval(() => {
        el.innerHTML = text.slice(0, i + 1) + cursor;
        i++;
        if (i === text.length) {
            clearInterval(interval);
            setTimeout(() => {
                el.innerHTML = text;
                if (onDone) onDone();
            }, 600);
        }
    }, speed);
}

// Public API
window.initNavigation = initNavigation;
window.navigateTo     = navigateTo;
