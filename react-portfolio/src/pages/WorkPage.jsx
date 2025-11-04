import React, { useState, useEffect } from 'react';
import PacmanGame from '../components/PacmanGame';
import soundManager from '../utils/SoundManager';
import { workData } from '../data/workData';

const WorkPage = () => {
    const [galleryImages, setGalleryImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Initialize work gallery when component mounts
        loadGalleryImages();
        
        // Stop background audio when work page loads
        soundManager.stopBackground();
        
        // Set user interaction flag for audio
        soundManager.setUserInteracted();
    }, []);

    const loadGalleryImages = () => {
        try {
            setLoading(true);
            setGalleryImages(workData.images);
            setError(null);
        } catch (error) {
            console.error('Error loading work data:', error);
            setError('Error loading gallery images. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleImageClick = (image) => {
        // Set user interaction flag for audio
        soundManager.setUserInteracted();
        
        // Play button sound if sound is enabled
        if (soundManager.isSoundEnabled()) {
            soundManager.play('button');
        }
        
        // You can implement a lightbox or modal here if needed
        console.log('Image clicked:', image.title);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px] bg-dark">
                <p className="text-custom">Loading gallery...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px] bg-dark">
                <p className="text-title-custom">{error}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center fade-in bg-dark">
            <div className="w-full max-w-[1140px] rounded-lg overflow-hidden relative min-h-[500px] p-6 bg-dark border border-custom">
                <h2 className="title-font text-3xl mb-6">
                    {workData.title}
                </h2>

                {/* Image Gallery Grid */}
                <div className="image-gallery">
                    {galleryImages.map((image) => (
                        <div
                            key={image.id}
                            className="gallery-item"
                            onClick={() => handleImageClick(image)}
                        >
                            <img
                                src={image.src}
                                alt={image.alt}
                                loading="lazy"
                                className="w-full h-full object-cover"
                            />
                            <div className="overlay">
                                <h3>{image.title}</h3>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WorkPage;