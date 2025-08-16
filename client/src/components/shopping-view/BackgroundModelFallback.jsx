import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { THEMES } from '@/store/theme-slice';

// Fallback background component with animated gradients based on user category
function BackgroundModelFallback({ modelName }) {
  const { currentTheme } = useSelector((state) => state.theme);

  // Get gradient colors based on model/category
  const getGradientColors = useMemo(() => {
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
  }, [modelName]);

  const gradientStyle = {
    background: `
      radial-gradient(circle at 20% 80%, ${getGradientColors.primary}22 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, ${getGradientColors.secondary}22 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, ${getGradientColors.accent}11 0%, transparent 50%),
      linear-gradient(135deg, ${getGradientColors.primary}11 0%, ${getGradientColors.secondary}11 100%)
    `,
    animation: 'backgroundFloat 20s ease-in-out infinite'
  };

  return (
    <>
      <style jsx>{`
        @keyframes backgroundFloat {
          0%, 100% {
            transform: scale(1) rotate(0deg);
            opacity: 0.8;
          }
          25% {
            transform: scale(1.05) rotate(1deg);
            opacity: 0.9;
          }
          50% {
            transform: scale(1.02) rotate(-0.5deg);
            opacity: 0.85;
          }
          75% {
            transform: scale(1.08) rotate(0.5deg);
            opacity: 0.95;
          }
        }
        
        @keyframes particleFloat {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0.3;
          }
          33% {
            transform: translateY(-20px) translateX(10px);
            opacity: 0.6;
          }
          66% {
            transform: translateY(-10px) translateX(-5px);
            opacity: 0.4;
          }
        }
      `}</style>
      
      <div className="fixed inset-0 w-full h-full z-0 pointer-events-none overflow-hidden">
        {/* Main animated background */}
        <div
          className="absolute inset-0 w-full h-full"
          style={gradientStyle}
        />
        
        {/* Floating particles for depth */}
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full opacity-20"
              style={{
                width: `${Math.random() * 100 + 50}px`,
                height: `${Math.random() * 100 + 50}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: getGradientColors.accent,
                animation: `particleFloat ${15 + Math.random() * 10}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`
              }}
            />
          ))}
        </div>
        
        {/* Subtle overlay for content readability */}
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />
      </div>
    </>
  );
}

export default BackgroundModelFallback;
