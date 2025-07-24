import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { THEMES } from '@/store/theme-slice';

// Import background images for different themes
import lightBg from '@/assets/bg-1.jpg'; // Using existing banner as light theme background

// This component renders a full-page background image that changes with the theme with parallax effect
function BackgroundImage() {
  const { currentTheme } = useSelector((state) => state.theme);
  const [scrollY, setScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile for performance optimization
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle scroll event for parallax effect with throttling for better performance
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Select background image based on current theme
  const getBackgroundImage = () => {
    switch (currentTheme) {
      case THEMES.DARK:
        return lightBg; // Legacy theme
      case THEMES.EMERALD:
        return lightBg; // Legacy theme
      case THEMES.WINE:
        return lightBg; // Legacy theme
      case THEMES.BOTTLE_GREEN:
        return lightBg; // Bottle green theme for Hector
      case THEMES.BEIGE:
        return lightBg; // Beige theme for Author
      case THEMES.BLACK:
        return lightBg; // Black theme for Bravo
      case THEMES.LIGHT:
      default:
        return lightBg;
    }
  };

  return (
    <div
      className="fixed inset-0 w-full h-full z-0 pointer-events-none overflow-hidden"
      style={{
        height: '150vh', // Make it much taller for parallax effect
        top: '-25vh', // Offset to account for extra height and start from very top
      }}
    >
      {/* Background image with parallax transform */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat transition-transform duration-75 ease-out"
        style={{
          backgroundImage: `url(${getBackgroundImage()})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          // Apply parallax effect only on desktop for better performance
          // Negative value makes background move slower and in opposite direction for proper parallax
          transform: isMobile 
            ? 'translateY(0px) scale(1)' 
            : `translateY(${scrollY * -0.5}px) scale(${1 + (scrollY * 0.00005)})`,
          // Add subtle fade effect based on scroll
          opacity: Math.max(0.2, 1 - (scrollY / (window.innerHeight * 3))),
          filter: currentTheme === THEMES.DARK ? 'brightness(0.7)' :
                  currentTheme === THEMES.EMERALD ? 'hue-rotate(120deg) brightness(0.9)' :
                  currentTheme === THEMES.WINE ? 'hue-rotate(320deg) brightness(0.9)' :
                  currentTheme === THEMES.BOTTLE_GREEN ? 'hue-rotate(140deg) brightness(0.7)' :
                  currentTheme === THEMES.BEIGE ? 'sepia(0.3) brightness(1.1)' :
                  currentTheme === THEMES.BLACK ? 'brightness(0.6) contrast(1.2)' : 'none',
          willChange: isMobile ? 'auto' : 'transform, opacity', // Optimize for animations
        }}
      />
      
      {/* Subtle overlay for better text readability */}
      <div
        className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundColor: currentTheme === THEMES.DARK ? '#000' :
                          currentTheme === THEMES.EMERALD ? '#064e3b' :
                          currentTheme === THEMES.WINE ? '#7f1d1d' :
                          currentTheme === THEMES.BOTTLE_GREEN ? '#093624' :
                          currentTheme === THEMES.BEIGE ? '#EDE8D0' :
                          currentTheme === THEMES.BLACK ? '#000000' : '#000'
        }}
      />
    </div>
  );
}

export default BackgroundImage;