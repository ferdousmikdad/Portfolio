// Work Gallery Controller
document.addEventListener('DOMContentLoaded', function() {
    // Initialize work gallery when DOM is loaded
    initWorkGallery();
});

// Initialize Work Gallery
function initWorkGallery() {
    // Load work data from JSON file
    fetch('assets/work/work.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Set the page title
            const workPageTitle = document.getElementById('workPageTitle');
            if (workPageTitle && data.title) {
                workPageTitle.textContent = data.title;
            }
            
            // Load images into the gallery
            loadGalleryImages(data.images);
        })
        .catch(error => {
            console.error('Error loading work data:', error);
            // Fallback: show error message in gallery
            const imageGallery = document.getElementById('imageGallery');
            if (imageGallery) {
                imageGallery.innerHTML = '<p class="text-red-500 col-span-3">Error loading gallery images. Please try again later.</p>';
            }
        });
}

// Load Gallery Images
function loadGalleryImages(images) {
    const imageGallery = document.getElementById('imageGallery');
    if (!imageGallery) return;
    
    // Clear existing content
    imageGallery.innerHTML = '';
    
    // Create gallery items for each image
    images.forEach(image => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        
        // Create image element
        const img = document.createElement('img');
        img.src = image.src;
        img.alt = image.alt || 'Work image';
        img.loading = 'lazy'; // Lazy load images for better performance
        
        // Create overlay with title
        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        
        const title = document.createElement('h3');
        title.textContent = image.title || 'Untitled';
        
        overlay.appendChild(title);
        
        // Add elements to gallery item
        galleryItem.appendChild(img);
        galleryItem.appendChild(overlay);
        
        // Add click event to show larger view (optional)
        galleryItem.addEventListener('click', function() {
            // You can implement a lightbox or modal here if needed
            console.log('Image clicked:', image.title);
        });
        
        // Add to gallery
        imageGallery.appendChild(galleryItem);
    });
}

// Export for use in other modules
window.initWorkGallery = initWorkGallery;