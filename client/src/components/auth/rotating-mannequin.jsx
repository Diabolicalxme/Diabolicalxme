import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import '@/styles/mannequin.css';

// Import mannequin images - we'll use 5 positions from back to front
import mannequin1 from '@/assets/mannequin/back.png';
import mannequin2 from '@/assets/mannequin/side.png';
import mannequin3 from '@/assets/mannequin/left.png';
import mannequin4 from '@/assets/mannequin/front.png';
import mannequin5 from '@/assets/mannequin/front.png';

const RotatingMannequin = ({ formProgress = 0 }) => {
  const [currentImage, setCurrentImage] = useState(mannequin1);
  const [prevImage, setPrevImage] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Array of mannequin images from back to front
  const mannequinImages = [
    mannequin1, // back view (0% progress)
    mannequin2, // back-angle view (25% progress)
    mannequin3, // side view (50% progress)
    mannequin4, // front-angle view (75% progress)
    mannequin5  // front view (100% progress)
  ];

  useEffect(() => {
    // Calculate which image to show based on form progress
    const imageIndex = Math.min(
      Math.floor(formProgress * mannequinImages.length),
      mannequinImages.length - 1
    );

    const newImage = mannequinImages[imageIndex];

    // Only update if the image is changing
    if (newImage !== currentImage) {
      setPrevImage(currentImage);
      setCurrentImage(newImage);
      setIsTransitioning(true);

      // Reset transition state after animation completes
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [formProgress, currentImage, mannequinImages]);

  // Calculate rotation based on progress
  const rotationDegree = formProgress * 180; // 0 to 180 degrees (back to front)

  // Determine if we should celebrate completion
  const isComplete = formProgress >= 0.99;

  return (
    <div className="mannequin-container">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: 1,
          scale: isComplete ? [1, 1.05, 1] : 1,
          y: isComplete ? [0, -10, 0] : 0
        }}
        transition={{
          duration: isComplete ? 0.8 : 0.5,
          repeat: isComplete ? 1 : 0,
          repeatType: "reverse"
        }}
        className="relative z-20 max-w-full max-h-full"
      >
        {/* Previous image fading out */}
        {isTransitioning && prevImage && (
          <motion.img
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            src={prevImage}
            alt="Mannequin Previous Position"
            className="mannequin-image absolute inset-0"
          />
        )}

        {/* Current image fading in */}
        <motion.img
          key={currentImage} // Key changes trigger animation
          initial={{ opacity: isTransitioning ? 0 : 1 }}
          animate={{
            opacity: 1,
            rotateY: rotationDegree,
          }}
          transition={{
            opacity: { duration: 0.3 },
            rotateY: { duration: 0.5, ease: "easeInOut" }
          }}
          src={currentImage}
          alt="Mannequin"
          className="mannequin-image"
        />
      </motion.div>

      {/* Progress indicator */}
      <div className="mannequin-progress">
        <motion.div
          className="mannequin-progress-bar"
          initial={{ width: 0 }}
          animate={{ width: `${formProgress * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Completion message */}
      {isComplete && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-primary text-white px-4 py-2 rounded-full text-sm font-medium"
        >
          Ready to go!
        </motion.div>
      )}
    </div>
  );
};

export default RotatingMannequin;