// Navigation Controller

let currentPage = 'home';

// Initialize Navigation
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-bottom-item');

    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const page = this.dataset.page;
            navigateTo(page);
        });
    });

    // Contact page back links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.dataset.page;
            if (page) navigateTo(page);
        });
    });
}

// Navigate to Page
function navigateTo(page) {
    currentPage = page;

    // Hide all pages
    document.getElementById('homePage').classList.add('hidden');
    document.getElementById('workPage').classList.add('hidden');
    document.getElementById('shopPage').classList.add('hidden');
    document.getElementById('contactPage').classList.add('hidden');
    document.getElementById('toolsPage').classList.add('hidden');

    // Update navigation active state
    const navItems = document.querySelectorAll('.nav-bottom-item');
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === page) {
            item.classList.add('active');
        }
    });

    if (page === 'home') {
        const homePage = document.getElementById('homePage');
        homePage.classList.remove('hidden');
        homePage.classList.add('flex', 'fade-in');
        if (window.resetGame) window.resetGame();
    } else if (page === 'work') {
        const workPage = document.getElementById('workPage');
        workPage.classList.remove('hidden');
        workPage.classList.add('flex', 'fade-in');
        if (window.initWorkGallery) window.initWorkGallery();
    } else if (page === 'shop') {
        const shopPage = document.getElementById('shopPage');
        shopPage.classList.remove('hidden');
        shopPage.classList.add('fade-in');
    } else if (page === 'contact') {
        const contactPage = document.getElementById('contactPage');
        contactPage.classList.remove('hidden');
        contactPage.classList.add('fade-in');
    } else if (page === 'tools') {
        const toolsPage = document.getElementById('toolsPage');
        toolsPage.classList.remove('hidden');
        toolsPage.classList.add('fade-in');
    }
}

// Export for use in other modules
window.initNavigation = initNavigation;
window.navigateTo = navigateTo;
