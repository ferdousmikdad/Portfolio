// Work Gallery Controller
document.addEventListener('DOMContentLoaded', function() {
    // Initialize work gallery when DOM is loaded
    initWorkGallery();
});

// Initialize Work Gallery
function initWorkGallery() {
    console.log('Initializing work gallery...');

    // Check if required elements exist
    const imageGallery = document.getElementById('imageGallery');
    const workPageTitle = document.getElementById('workPageTitle');

    if (!imageGallery) {
        console.error('imageGallery element not found');
        return;
    }

    console.log('Loading work data from JSON...');

    // Load work data from JSON file
    fetch('assets/work/work.json')
        .then(response => {
            console.log('Fetch response status:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Work data loaded successfully:', data);

            // Set the page title
            if (workPageTitle && data.title) {
                workPageTitle.textContent = data.title;
                console.log('Page title set to:', data.title);
            }

            // Load images into the gallery
            if (data.images && Array.isArray(data.images)) {
                console.log('Loading', data.images.length, 'images into gallery');
                loadGalleryImages(data.images);
            } else {
                console.error('Invalid images data in JSON');
                imageGallery.innerHTML = '<p class="text-yellow-500 col-span-3">Invalid image data format.</p>';
            }
        })
        .catch(error => {
            console.error('Error loading work data:', error);
            console.error('Error details:', error.message);

            // Fallback: Try to load gallery with hardcoded data
            console.log('Attempting to load fallback gallery...');
            loadFallbackGallery();
        });
}

// Load Gallery Images
function loadGalleryImages(images) {
    const imageGallery = document.getElementById('imageGallery');
    if (!imageGallery) {
        console.error('imageGallery element not found');
        return;
    }

    console.log('Loading gallery images:', images);

    // Clear existing content
    imageGallery.innerHTML = '';

    // Create gallery items for each image
    images.forEach((image, index) => {
        console.log(`Processing image ${index + 1}:`, image);

        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300';

        // Create image element
        const img = document.createElement('img');
        img.src = image.src;
        img.alt = image.alt || 'Work image';
        img.loading = 'lazy'; // Lazy load images for better performance
        img.className = 'w-full h-64 object-cover cursor-pointer transition-transform duration-300 hover:scale-105';

        // Add error handling for individual images
        img.addEventListener('error', function(e) {
            console.error(`Error loading image: ${image.src}`, e);
            img.style.display = 'none';

            // Show error placeholder with more info
            const errorDiv = document.createElement('div');
            errorDiv.className = 'w-full h-64 bg-red-50 border-2 border-red-200 flex flex-col items-center justify-center text-red-600 text-sm p-4';
            errorDiv.innerHTML = `
                <svg class="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span class="text-center">Failed to load</span>
                <span class="text-xs text-red-500 mt-1">${image.title || 'Image'}</span>
            `;
            galleryItem.appendChild(errorDiv);
        });

        img.addEventListener('load', function() {
            console.log(`Successfully loaded image: ${image.src}`);
        });

        // Create overlay with title
        const overlay = document.createElement('div');
        overlay.className = 'absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300';

        const title = document.createElement('h3');
        title.className = 'text-white text-lg font-semibold text-center p-4';
        title.textContent = image.title || 'Untitled';

        overlay.appendChild(title);

        // Add elements to gallery item
        galleryItem.appendChild(img);
        galleryItem.appendChild(overlay);

        // Add click event to show larger view (optional)
        galleryItem.addEventListener('click', function() {
            console.log('Image clicked:', image.title);
            // You can implement a lightbox or modal here if needed
        });

        // Add to gallery
        imageGallery.appendChild(galleryItem);
    });

    console.log('Gallery loading complete');
}

// Fallback function to load gallery with hardcoded data
function loadFallbackGallery() {
    console.log('Loading fallback gallery...');

    const fallbackData = [
        {
            id: 1,
            src: "assets/work/mustofacalligraphy.webp",
            alt: "Mustofa Calligraphy",
            title: "Mustofa Calligraphy"
        },
        {
            id: 2,
            src: "assets/work/portfolio.webp",
            alt: "Portfolio Design",
            title: "Portfolio Design"
        },
        {
            id: 3,
            src: "assets/work/summersale.webp",
            alt: "Summer Sale",
            title: "Summer Sale Campaign"
        },
        {
            id: 4,
            src: "assets/work/zariyalogo.webp",
            alt: "Zariya Logo",
            title: "Zariya Logo Design"
        }
    ];

    const imageGallery = document.getElementById('imageGallery');
    const workPageTitle = document.getElementById('workPageTitle');

    if (workPageTitle) {
        workPageTitle.textContent = "Creative Work";
    }

    if (imageGallery) {
        loadGalleryImages(fallbackData);
    }
}

// Export for use in other modules
window.initWorkGallery = initWorkGallery;
window.loadFallbackGallery = loadFallbackGallery;