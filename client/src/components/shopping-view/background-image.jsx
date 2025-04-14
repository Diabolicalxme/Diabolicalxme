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
      className="fixed inset-0 w-full h-full z-0 bg-cover pointer-events-none"
      style={{
        backgroundImage: `url(${getBackgroundImage()})`,
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover',
        filter: currentTheme === THEMES.DARK ? 'brightness(0.7)' :
                currentTheme === THEMES.EMERALD ? 'hue-rotate(120deg) brightness(0.9)' :
                currentTheme === THEMES.WINE ? 'hue-rotate(320deg) brightness(0.9)' :
                currentTheme === THEMES.BOTTLE_GREEN ? 'hue-rotate(140deg) brightness(0.7)' :
                currentTheme === THEMES.BEIGE ? 'sepia(0.3) brightness(1.1)' :
                currentTheme === THEMES.BLACK ? 'brightness(0.6) contrast(1.2)' : 'none'
      }}
    >
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