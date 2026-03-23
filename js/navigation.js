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
}

// Public API
window.initNavigation = initNavigation;
window.navigateTo     = navigateTo;
