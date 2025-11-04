// Projects Data
window.projects = [
    {
        title: "iPhone AR",
        image: "assets/data/iPhoneAR.jpg",
        description: "Immersive AR experience with 3D product visualization"
    },
    {
        title: "Creative Portfolio",
        image: "assets/images/ferdousmikdad.png",
        description: "Personal portfolio showcasing design and development work"
    },
    {
        title: "Game Design",
        image: "assets/images/pacman.svg",
        description: "Interactive game design with pixel art aesthetics"
    },
    {
        title: "Brand Identity",
        image: "assets/images/mepac.svg",
        description: "Complete brand identity design and guidelines"
    },
    {
        title: "UI/UX Design",
        image: "assets/images/ferdousmikdad.png",
        description: "User interface and experience design for digital products"
    }
];

// Function to handle image loading errors
window.handleProjectImageError = function(img) {
    console.error(`Failed to load image: ${img.src}`);
    // Set a fallback background color
    img.style.backgroundColor = '#1f2937';
    // Remove loading class
    img.classList.remove('img-loading');
    // Optionally set a placeholder text or icon
    img.alt = 'Project image not available';
};

// Function to preload images with loading states
window.preloadProjectImage = function(imgElement, src) {
    // Add loading class
    imgElement.classList.add('img-loading');
    
    // Create a new image to preload
    const preloadImg = new Image();
    
    // Set up event handlers
    preloadImg.onload = function() {
        // Image loaded successfully
        imgElement.src = src;
        imgElement.classList.remove('img-loading');
    };
    
    preloadImg.onerror = function() {
        // Image failed to load
        window.handleProjectImageError(imgElement);
    };
    
    // Start loading the image
    preloadImg.src = src;
};