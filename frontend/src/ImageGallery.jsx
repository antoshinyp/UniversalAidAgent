import React, { useState, useEffect } from 'react';
import './ImageGallery.css';

function ImageGallery({ images, altText = "Image" }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    if (images && images.length > 0) {
      // Preload images
      const preloadImages = images.map(src => {
        const img = new Image();
        img.src = src;
        return img;
      });
      
      Promise.all(preloadImages.map(img => {
        return new Promise((resolve) => {
          img.onload = img.onerror = resolve;
        });
      }))
      .then(() => setImagesLoaded(true));
    } else {
      setImagesLoaded(true);
    }
  }, [images]);

  useEffect(() => {
    if (images.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [images.length]);

  if (!images || images.length === 0) {
    return null;
  }

  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastSlide = currentIndex === images.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  const goToSlide = (slideIndex) => {
    setCurrentIndex(slideIndex);
  };

  if (!imagesLoaded) {
    return <div className="image-gallery-loading">Loading images...</div>;
  }

  return (
    <div className="image-gallery">
      <div className="gallery-container">
        <img 
          src={images[currentIndex]} 
          alt={`${altText} ${currentIndex + 1}`}
          className="gallery-image"
        />
        {images.length > 1 && (
          <div className="gallery-navigation">
            <button 
              onClick={goToPrevious} 
              className="nav-button"
              aria-label="Previous image"
            >
              ←
            </button>
            <div className="gallery-indicators">
              {images.map((_, slideIndex) => (
                <button
                  key={slideIndex}
                  onClick={() => goToSlide(slideIndex)}
                  className={`indicator ${slideIndex === currentIndex ? 'active' : ''}`}
                  aria-label={`Go to image ${slideIndex + 1}`}
                  aria-current={slideIndex === currentIndex ? 'true' : 'false'}
                />
              ))}
            </div>
            <button 
              onClick={goToNext} 
              className="nav-button"
              aria-label="Next image"
            >
              →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ImageGallery;