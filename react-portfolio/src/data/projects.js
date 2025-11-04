export const projects = [
    {
        title: "Creative Portfolio",
        image: "/data/amanah.jpg",
        description: "Personal portfolio showcasing design and development work"
    },
    {
        title: "Game Design",
        image: "/images/pacman.svg",
        description: "Interactive game design with pixel art aesthetics"
    },
    {
        title: "Brand Identity",
        image: "/images/mepac.svg",
        description: "Complete brand identity design and guidelines"
    },
    {
        title: "UI/UX Design",
        image: "/data/amanah.jpg",
        description: "User interface and experience design for digital products"
    }
];

export const handleProjectImageError = (img) => {
    console.error(`Failed to load image: ${img.src}`);
    // Set a fallback background color
    img.style.backgroundColor = '#2D2C28';
    // Remove loading class
    img.classList.remove('img-loading');
    // Optionally set a placeholder text or icon
    img.alt = 'Project image not available';
};

export const preloadProjectImage = (imgElement, src) => {
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
        handleProjectImageError(imgElement);
    };
    
    // Start loading the image
    preloadImg.src = src;
};