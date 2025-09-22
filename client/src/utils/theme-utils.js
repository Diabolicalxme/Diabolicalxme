import { THEMES } from '@/store/theme-slice';

/**
 * Centralized theme utility functions to avoid duplication across components
 * Import and use these functions instead of duplicating theme logic
 */

/**
 * Get theme-aware colors for general UI components
 * @param {string} currentTheme - The current theme from the theme store
 * @returns {object} Object containing theme-aware CSS classes
 */
export const getThemeColors = (currentTheme) => {
  switch (currentTheme) {
    case THEMES.BEIGE: // Author theme
      return {
        // Backgrounds
        cardBg: 'bg-[#F5F1E8]',
        dialogBg: 'bg-[#F5F1E8]',
        formBg: 'bg-[#EDE8D0]/50',
        hoverBg: 'hover:bg-[#EDE8D0]/30',
        
        // Text colors
        cardText: 'text-[#333333]',
        dialogText: 'text-[#333333]',
        mutedText: 'text-[#666666]',
        
        // Borders
        borderColor: 'border-[#D6CCA9]',
        dialogBorder: 'border-[#D6CCA9]',
        inputBorder: 'border-[#D6CCA9] focus:border-[#C2B280] focus:ring-[#C2B280]',
        
        // Buttons
        buttonBg: 'bg-[#C2B280] hover:bg-[#B8A082]',
        buttonText: 'text-white',
        buttonOutline: 'bg-[#C2B280] border-[#C2B280] hover:bg-[#C2B280] hover:text-white text-[#333333]',
        
        // Dividers and accents
        dividerBg: 'bg-[#C2B280]',
        quoteBg: 'text-[#C2B280]/60',
        dividerColor: 'border-[#D6CCA9]/30'
      };
      
    case THEMES.BLACK: // Bravo theme
      return {
        // Backgrounds
        cardBg: 'bg-gray-900',
        dialogBg: 'bg-gray-900',
        formBg: 'bg-gray-800/50',
        hoverBg: 'hover:bg-gray-800/30',
        
        // Text colors
        cardText: 'text-white',
        dialogText: 'text-white',
        mutedText: 'text-gray-300',
        
        // Borders
        borderColor: 'border-gray-700',
        dialogBorder: 'border-gray-700',
        inputBorder: 'border-gray-700 focus:border-gray-600 focus:ring-gray-600',
        
        // Buttons
        buttonBg: 'bg-gray-800 hover:bg-black',
        buttonText: 'text-white',
        buttonOutline: 'border-gray-800 hover:bg-gray-800 hover:text-white text-white',
        
        // Dividers and accents
        dividerBg: 'bg-gray-800',
        quoteBg: 'text-gray-500/60',
        dividerColor: 'border-gray-700/20'
      };
      
    case THEMES.BOTTLE_GREEN: // Hector theme
      return {
        // Backgrounds
        cardBg: 'bg-[#0E5A38]',
        dialogBg: 'bg-[#0E5A38]',
        formBg: 'bg-[#093624]/50',
        hoverBg: 'hover:bg-[#093624]/30',
        
        // Text colors
        cardText: 'text-white',
        dialogText: 'text-white',
        mutedText: 'text-green-200',
        
        // Borders
        borderColor: 'border-[#106840]',
        dialogBorder: 'border-[#106840]',
        inputBorder: 'border-[#106840] focus:border-[#0E5A38] focus:ring-[#0E5A38]',
        
        // Buttons
        buttonBg: 'bg-[#106840] hover:bg-[#093624]',
        buttonText: 'text-white',
        buttonOutline: 'border-[#106840] hover:bg-[#106840] hover:text-white text-white',
        
        // Dividers and accents
        dividerBg: 'bg-[#106840]',
        quoteBg: 'text-green-400/60',
        dividerColor: 'border-[#106840]/20'
      };
      
    default: // Light theme and fallback
      return {
        // Backgrounds
        cardBg: 'bg-card',
        dialogBg: 'bg-card',
        formBg: 'bg-muted/5',
        hoverBg: 'hover:bg-muted/5',
        
        // Text colors
        cardText: 'text-card-foreground',
        dialogText: 'text-card-foreground',
        mutedText: 'text-muted-foreground',
        
        // Borders
        borderColor: 'border-input',
        dialogBorder: 'border-border',
        inputBorder: 'border-border focus:border-foreground focus:ring-foreground',
        
        // Buttons
        buttonBg: 'bg-primary hover:bg-primary/90',
        buttonText: 'text-primary-foreground',
        buttonOutline: 'border-foreground hover:bg-foreground hover:text-background text-foreground',
        
        // Dividers and accents
        dividerBg: 'bg-foreground',
        quoteBg: 'text-muted-foreground/40',
        dividerColor: 'border-border/20'
      };
  }
};

/**
 * Get theme-aware colors specifically for footer component
 * @param {string} currentTheme - The current theme from the theme store
 * @returns {string} CSS classes for footer background and text
 */
export const getFooterClasses = (currentTheme) => {
  const baseClasses = "relative z-20 transition-colors duration-300";
  
  switch (currentTheme) {
    case THEMES.BEIGE: // Author theme
      return `${baseClasses} bg-[#C2B280] text-[#333333]`;
    case THEMES.BLACK: // Bravo theme
      return `${baseClasses} bg-black text-white`;
    case THEMES.BOTTLE_GREEN: // Hector theme
      return `${baseClasses} bg-[#093624] text-white`;
    case THEMES.DARK:
      return `${baseClasses} bg-[#121212] text-white`;
    default: // Light theme
      return `${baseClasses} bg-black text-white`;
  }
};

/**
 * Get theme-aware colors specifically for header component
 * @param {string} currentTheme - The current theme from the theme store
 * @returns {object} Object containing header-specific CSS classes
 */
export const getHeaderClasses = (currentTheme) => {
  const baseClasses = "fixed top-0 z-50 w-full shadow-sm transition-colors duration-300";
  const mainBaseClasses = "border-b transition-colors duration-300";
  
  switch (currentTheme) {
    case THEMES.BEIGE: // Author theme
      return {
        header: `${baseClasses} bg-[#EDE8D0]/95 backdrop-blur-sm`,
        main: `${mainBaseClasses} bg-[#EDE8D0]/90 backdrop-blur-sm border-[#D6CCA9]`
      };
    case THEMES.BLACK: // Bravo theme
      return {
        header: `${baseClasses} bg-black/95 backdrop-blur-sm`,
        main: `${mainBaseClasses} bg-black/90 backdrop-blur-sm border-[#333333]`
      };
    case THEMES.BOTTLE_GREEN: // Hector theme
      return {
        header: `${baseClasses} bg-[#093624]/95 backdrop-blur-sm`,
        main: `${mainBaseClasses} bg-[#093624]/90 backdrop-blur-sm border-[#106840]`
      };
    case THEMES.DARK:
      return {
        header: `${baseClasses} bg-[#121212]/95 backdrop-blur-sm`,
        main: `${mainBaseClasses} bg-[#121212]/90 backdrop-blur-sm border-[#444444]`
      };
    default: // Light theme
      return {
        header: `${baseClasses} bg-background/95 backdrop-blur-sm`,
        main: `${mainBaseClasses} bg-background/90 backdrop-blur-sm border-border`
      };
  }
};

/**
 * Get theme-aware arrow colors for sliders and carousels
 * @param {string} currentTheme - The current theme from the theme store
 * @returns {string} CSS classes for arrow styling
 */
export const getArrowTheme = (currentTheme) => {
  switch (currentTheme) {
    case THEMES.BEIGE: // Author theme
      return 'bg-[#F5F1E8]/90 border-[#D6CCA9] text-[#333333] hover:bg-[#C2B280] hover:text-white';
    case THEMES.BLACK: // Bravo theme
      return 'bg-gray-900/80 border-gray-700 text-white hover:bg-black hover:text-white';
    case THEMES.BOTTLE_GREEN: // Hector theme
      return 'bg-[#0E5A38]/80 border-[#106840] text-white hover:bg-[#093624] hover:text-white';
    default:
      return 'bg-background/80 border-border hover:bg-foreground hover:text-background';
  }
};

/**
 * Get gradient colors for background models and fallbacks
 * @param {string} modelName - The model name (Arthur, Bravo, Hector)
 * @returns {object} Object containing gradient color values
 */
export const getGradientColors = (modelName) => {
  switch (modelName?.toLowerCase()) {
    case 'arthur':
      return {
        primary: '#EDE8D0', // Beige
        secondary: '#D4C5A9',
        accent: '#B8A082'
      };
    case 'bravo':
      return {
        primary: '#000000', // Black
        secondary: '#1a1a1a',
        accent: '#333333'
      };
    case 'hector':
      return {
        primary: '#093624', // Bottle Green
        secondary: '#0d4a2d',
        accent: '#115e36'
      };
    default:
      return {
        primary: '#EDE8D0',
        secondary: '#D4C5A9',
        accent: '#B8A082'
      };
  }
};
