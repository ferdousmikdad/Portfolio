// Work Gallery Controller

document.addEventListener('DOMContentLoaded', initWorkGallery);

// ── State ─────────────────────────────────────────────────────────────────────

let workImages     = [];
let previewOverlay = null;

// Cursor-following hover image
let hoverImg      = null;
let targetX       = 0;
let targetY       = 0;
let currentX      = 0;
let currentY      = 0;
let hoverVisible  = false;
let rafId         = null;

// ── Entry Point ───────────────────────────────────────────────────────────────

function initWorkGallery() {
    fetch('assets/work/work.json')
        .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
        })
        .then(data => {
            if (Array.isArray(data.images)) workImages = data.images;
            else loadFallbackImages();
            buildPage();
        })
        .catch(() => { loadFallbackImages(); buildPage(); });
}

function buildPage() {
    initPreviewOverlay();
    initHoverImage();
    initWorkList();
    initFixedRow();
}

// ── Full-Viewport Preview Overlay (fixed row hover) ───────────────────────────

function initPreviewOverlay() {
    if (document.getElementById('workPreviewOverlay')) {
        previewOverlay = document.getElementById('workPreviewOverlay');
        return;
    }
    previewOverlay    = document.createElement('div');
    previewOverlay.id = 'workPreviewOverlay';
    previewOverlay.className = 'work-preview-overlay';
    previewOverlay.innerHTML = `<img class="work-preview-img" src="" alt="">`;
    document.body.appendChild(previewOverlay);
}

function showPreview(imgData) {
    if (!previewOverlay) return;
    previewOverlay.querySelector('.work-preview-img').src = imgData.src;
    previewOverlay.querySelector('.work-preview-img').alt = imgData.alt || '';
    previewOverlay.classList.add('active');
}

function hidePreview() {
    if (!previewOverlay) return;
    previewOverlay.classList.remove('active');
}

// ── Cursor-Following Hover Image (work list) ──────────────────────────────────

function initHoverImage() {
    if (document.getElementById('workHoverImg')) {
        hoverImg = document.getElementById('workHoverImg');
        return;
    }
    hoverImg    = document.createElement('img');
    hoverImg.id = 'workHoverImg';
    hoverImg.className = 'work-hover-img';
    document.body.appendChild(hoverImg);
    rafId = requestAnimationFrame(animateHover);
}

function lerp(a, b, t) { return a + (b - a) * t; }

function animateHover() {
    currentX = lerp(currentX, targetX, 0.1);
    currentY = lerp(currentY, targetY, 0.1);
    if (hoverImg) {
        hoverImg.style.left = (currentX + 28) + 'px';
        hoverImg.style.top  = (currentY - 120) + 'px';
    }
    rafId = requestAnimationFrame(animateHover);
}

function showHoverImage(src, e) {
    hoverImg.src = src;
    targetX = currentX = e.clientX;
    targetY = currentY = e.clientY;
    hoverImg.style.left = (currentX + 28) + 'px';
    hoverImg.style.top  = (currentY - 120) + 'px';
    hoverVisible = true;
    hoverImg.classList.add('visible');
}

function hideHoverImage() {
    hoverVisible = false;
    hoverImg.classList.remove('visible');
}

function trackHover(e) {
    if (!hoverVisible) return;
    targetX = e.clientX;
    targetY = e.clientY;
}

// ── Work List (upper interactive section) ─────────────────────────────────────

function initWorkList() {
    const workPage = document.getElementById('workPage');
    if (!workPage || document.getElementById('workList')) return;

    const list    = document.createElement('div');
    list.id       = 'workList';
    list.className = 'work-list';

    workImages.forEach((imgData, i) => {
        const item = document.createElement('div');
        item.className = 'work-list-item';

        const num  = document.createElement('span');
        num.className = 'work-list-num';
        num.textContent = String(i + 1).padStart(2, '0');

        const title = document.createElement('span');
        title.className = 'work-list-title';
        title.textContent = imgData.title || imgData.alt || `Project ${i + 1}`;

        item.appendChild(num);
        item.appendChild(title);
        list.appendChild(item);

        // Hover: show image following cursor
        item.addEventListener('mouseenter', e => showHoverImage(imgData.src, e));
        item.addEventListener('mousemove',  trackHover);
        item.addEventListener('mouseleave', hideHoverImage);

        // Staggered entrance
        setTimeout(() => item.classList.add('work-list-item--visible'), 80 + i * 70);
    });

    workPage.appendChild(list);
}

// ── Fixed Horizontal Row (bottom) ─────────────────────────────────────────────

function initFixedRow() {
    const workPage = document.getElementById('workPage');
    if (!workPage || document.getElementById('workFixedRow')) return;

    const row     = document.createElement('div');
    row.id        = 'workFixedRow';
    row.className = 'work-fixed-row';

    workImages.forEach((imgData, i) => {
        const img     = document.createElement('img');
        img.src       = imgData.src;
        img.alt       = imgData.alt || '';
        img.className = 'work-fixed-img';

        img.addEventListener('mouseenter', () => showPreview(imgData));
        img.addEventListener('mouseleave', hidePreview);

        row.appendChild(img);
        setTimeout(() => img.classList.add('work-fixed-img--visible'), 120 + i * 90);
    });

    workPage.appendChild(row);
}

// ── Fallback ──────────────────────────────────────────────────────────────────

function loadFallbackImages() {
    workImages = [
        { src: 'assets/work/mustofacalligraphy.webp', alt: 'Mustofa Calligraphy',   title: 'Mustofa Calligraphy'   },
        { src: 'assets/work/portfolio.webp',          alt: 'Portfolio Design',       title: 'Portfolio Design'      },
        { src: 'assets/work/summersale.webp',         alt: 'Summer Sale',            title: 'Summer Sale'           },
        { src: 'assets/work/zariyalogo.webp',         alt: 'Zariya Logo',            title: 'Zariya Logo'           },
    ];
}

window.initWorkGallery     = initWorkGallery;
window.loadFallbackGallery = loadFallbackImages;
