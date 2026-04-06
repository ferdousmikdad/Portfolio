// Main Application Controller

document.addEventListener('DOMContentLoaded', function () {
    initNavigation();
    initGame();
    initToolsNav();
    initSound();
    navigateTo('home');
});

// ── Tools Navigation ──────────────────────────────────────────────────────────

function initToolsNav() {
    const toolFrame       = document.getElementById('toolFrame');
    const toolPlaceholder = document.getElementById('toolPlaceholder');
    const placeholderName = document.getElementById('placeholderName');
    const navBtns         = document.querySelectorAll('.tool-nav-btn');
    const sidebar         = document.getElementById('toolsSidebar');
    const viewer          = document.querySelector('.tools-viewer');
    const toggleBtn       = document.getElementById('sidebarToggle');
    const toggleIcon      = document.getElementById('toggleIcon');

    if (!toolFrame) return;

    // ── Tool buttons ────────────────────────────────────────────
    navBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            navBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const url  = this.dataset.url;
            const name = this.querySelector('span:last-child').textContent;

            if (url) {
                toolFrame.src = url;
                toolFrame.classList.remove('hidden');
                toolPlaceholder.classList.add('hidden');
            } else {
                toolFrame.classList.add('hidden');
                toolPlaceholder.classList.remove('hidden');
                placeholderName.textContent = name;
            }
        });
    });

    // ── Sidebar minimize toggle ──────────────────────────────────
    if (!toggleBtn || !sidebar || !viewer) return;

    toggleBtn.addEventListener('click', () => {
        const collapsed = sidebar.classList.toggle('collapsed');
        viewer.classList.toggle('sidebar-collapsed', collapsed);

        // Flip the chevron direction
        toggleIcon.innerHTML = collapsed
            ? '<polyline points="9 18 15 12 9 6"></polyline>'   // chevron-right
            : '<polyline points="15 18 9 12 15 6"></polyline>';  // chevron-left
    });
}

// ── Bubble Effect ─────────────────────────────────────────────────────────────

/**
 * Spawn floating bubbles from the mepac avatar.
 * @param {number} count    Number of bubbles.
 * @param {number} spread   Max pixel offset from avatar centre.
 * @param {number} interval ms between each bubble spawn.
 */
function createBubbleEffect(count = 10, spread = 40, interval = 50) {
    const avatar = document.querySelector('.mepac-moving');
    if (!avatar) return;

    const { left, top, width, height } = avatar.getBoundingClientRect();
    const cx = left + width / 2;
    const cy = top  + height / 2;

    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const bubble = document.createElement('div');
            bubble.className = 'bubble';

            const size = Math.random() * 20 + 10;
            bubble.style.width  = `${size}px`;
            bubble.style.height = `${size}px`;
            bubble.style.left   = `${cx + (Math.random() - 0.5) * spread}px`;
            bubble.style.top    = `${cy + (Math.random() - 0.5) * spread}px`;

            document.body.appendChild(bubble);
            setTimeout(() => bubble.classList.add('bubble-animate'), 10);
            setTimeout(() => bubble.remove(), 2000);
        }, i * interval);
    }
}

// ── Public API ────────────────────────────────────────────────────────────────

window.createBubbleEffect = createBubbleEffect;
