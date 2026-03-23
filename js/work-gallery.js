// Work Gallery Controller

document.addEventListener('DOMContentLoaded', initWorkGallery);

// ── Public Entry Point ────────────────────────────────────────────────────────

function initWorkGallery() {
    const imageGallery = document.getElementById('imageGallery');
    if (!imageGallery) return;

    fetch('assets/work/work.json')
        .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
        })
        .then(data => {
            const workPageTitle = document.getElementById('workPageTitle');
            if (workPageTitle && data.title) workPageTitle.textContent = data.title;

            if (Array.isArray(data.images)) {
                loadGalleryImages(data.images);
            } else {
                imageGallery.innerHTML = '<p class="text-yellow-500 col-span-3">Invalid image data format.</p>';
            }
        })
        .catch(() => loadFallbackGallery());
}

// ── Gallery Rendering ─────────────────────────────────────────────────────────

function loadGalleryImages(images) {
    const imageGallery = document.getElementById('imageGallery');
    if (!imageGallery) return;

    imageGallery.innerHTML = '';

    images.forEach(image => {
        const item = document.createElement('div');
        item.className = 'gallery-item relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300';

        const img     = createGalleryImage(image);
        const overlay = createGalleryOverlay(image.title);

        item.appendChild(img);
        item.appendChild(overlay);
        imageGallery.appendChild(item);
    });
}

function createGalleryImage(image) {
    const img      = document.createElement('img');
    img.src        = image.src;
    img.alt        = image.alt || 'Work image';
    img.loading    = 'lazy';
    img.className  = 'w-full h-64 object-cover cursor-pointer transition-transform duration-300 hover:scale-105';

    img.addEventListener('error', function () {
        img.style.display = 'none';

        const placeholder = document.createElement('div');
        placeholder.className = 'w-full h-64 bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-500 text-sm';
        placeholder.textContent = image.title || 'Image unavailable';
        img.parentElement?.appendChild(placeholder);
    });

    return img;
}

function createGalleryOverlay(title) {
    const overlay    = document.createElement('div');
    overlay.className = 'absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300';

    const heading    = document.createElement('h3');
    heading.className = 'text-white text-lg font-semibold text-center p-4';
    heading.textContent = title || 'Untitled';

    overlay.appendChild(heading);
    return overlay;
}

// ── Fallback Data ─────────────────────────────────────────────────────────────

function loadFallbackGallery() {
    const imageGallery  = document.getElementById('imageGallery');
    const workPageTitle = document.getElementById('workPageTitle');

    if (workPageTitle) workPageTitle.textContent = 'Creative Work';

    const fallbackImages = [
        { id: 1, src: 'assets/work/mustofacalligraphy.webp', alt: 'Mustofa Calligraphy',  title: 'Mustofa Calligraphy'   },
        { id: 2, src: 'assets/work/portfolio.webp',          alt: 'Portfolio Design',       title: 'Portfolio Design'      },
        { id: 3, src: 'assets/work/summersale.webp',         alt: 'Summer Sale',            title: 'Summer Sale Campaign'  },
        { id: 4, src: 'assets/work/zariyalogo.webp',         alt: 'Zariya Logo',            title: 'Zariya Logo Design'    },
    ];

    if (imageGallery) loadGalleryImages(fallbackImages);
}

// ── Public API ────────────────────────────────────────────────────────────────

window.initWorkGallery  = initWorkGallery;
window.loadFallbackGallery = loadFallbackGallery;
