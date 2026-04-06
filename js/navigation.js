// Navigation Controller

let currentPage = 'home';

const PAGES = ['homePage', 'workPage', 'shopPage', 'contactPage', 'toolsPage'];

function initNavigation() {
    document.querySelectorAll('.nav-bottom-item').forEach(item => {
        item.addEventListener('click', function () {
            navigateTo(this.dataset.page);
        });
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            if (this.dataset.page) navigateTo(this.dataset.page);
        });
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

    const text    = 'Coming Soon';
    const cursor  = '<span class="typing-cursor">|</span>';
    el.innerHTML  = '';
    sub.style.opacity = '0';

    let i = 0;
    const interval = setInterval(() => {
        el.innerHTML = text.slice(0, i + 1) + cursor;
        i++;
        if (i === text.length) {
            clearInterval(interval);
            // Blink cursor briefly then remove it, reveal subtitle
            setTimeout(() => {
                el.innerHTML = text;
                sub.style.opacity = '1';
            }, 800);
        }
    }, 100);
}

// Public API
window.initNavigation = initNavigation;
window.navigateTo     = navigateTo;
