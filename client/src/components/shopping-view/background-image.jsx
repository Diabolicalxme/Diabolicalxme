import React from 'react';
import { useSelector } from 'react-redux';
import { THEMES } from '@/store/theme-slice';

// Import background images for different themes
import lightBg from '@/assets/bg.jpg'; // Using existing banner as light theme background

// This component renders a full-page background image that changes with the theme
function BackgroundImage() {
  const { currentTheme } = useSelector((state) => state.theme);

  // Select background image based on current theme
  const getBackgroundImage = () => {
    switch (currentTheme) {
      case THEMES.DARK:
        return lightBg; // For now using same image, you can replace with theme-specific images
      case THEMES.EMERALD:
        return lightBg; // For now using same image, you can replace with theme-specific images
      case THEMES.WINE:
        return lightBg; // For now using same image, you can replace with theme-specific images
      case THEMES.LIGHT:
      default:
        return lightBg;
    }
  };

  return (
    <div
      className="fixed inset-0 w-full h-full z-0 bg-cover  "
      style={{
        backgroundImage: `url(${getBackgroundImage()})`,
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover',
        filter: currentTheme === THEMES.DARK ? 'brightness(0.7)' :
                currentTheme === THEMES.EMERALD ? 'hue-rotate(120deg) brightness(0.9)' :
                currentTheme === THEMES.WINE ? 'hue-rotate(320deg) brightness(0.9)' : 'none'
      }}
    >
      {/* Subtle overlay for better text readability */}
      <div
        className="absolute inset-0 z-0 opacity-20"
        style={{
          backgroundColor: currentTheme === THEMES.DARK ? '#000' :
                          currentTheme === THEMES.EMERALD ? '#064e3b' :
                          currentTheme === THEMES.WINE ? '#7f1d1d' : '#000'
        }}
      />
    </div>
  );
}

export default BackgroundImage;