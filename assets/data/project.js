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

// Preload an image and swap it in once ready; applies a shimmer while loading
window.preloadProjectImage = function (imgElement, src) {
    imgElement.classList.add('img-loading');

    const preload    = new Image();
    preload.onload   = () => { imgElement.src = src; imgElement.classList.remove('img-loading'); };
    preload.onerror  = () => { imgElement.style.backgroundColor = '#1f2937'; imgElement.classList.remove('img-loading'); imgElement.alt = 'Project image not available'; };
    preload.src      = src;
};

// Inline onerror fallback (referenced from index.html)
window.handleProjectImageError = function (img) {
    img.style.backgroundColor = '#1f2937';
    img.classList.remove('img-loading');
    img.alt = 'Project image not available';
};
