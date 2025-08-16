import React, { Suspense, useMemo, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { useSelector } from 'react-redux';
import { THEMES } from '@/store/theme-slice';
import { Loader } from '@/components/ui/loader';

// Model component that shows face to shoulders (portrait view) for login
function LoginModel({ formProgress = 0 }) {
  const modelRef = useRef();
  const { scene } = useGLTF('/models/Arthur.glb');
  const { viewport } = useThree(); // ✅ get viewport
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile on mount + resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Clone the scene
  const clonedScene = useMemo(() => {
    if (!scene) return null;
    return scene.clone();
  }, [scene]);

  const targetRotation = Math.PI - (formProgress * Math.PI);

  useFrame(() => {
    if (modelRef.current) {
      const currentRotation = modelRef.current.rotation.y;
      let rotationDiff = targetRotation - currentRotation;

      if (rotationDiff > Math.PI) rotationDiff -= 2 * Math.PI;
      else if (rotationDiff < -Math.PI) rotationDiff += 2 * Math.PI;

      modelRef.current.rotation.y += rotationDiff * 0.08;
    }
  });

  useEffect(() => {
    if (clonedScene && modelRef.current) {
      try {
        const scale = Math.min(viewport.width, viewport.height) * 0.51;
        modelRef.current.scale.setScalar(scale);

        // ✅ Different position for mobile vs desktop
        if (isMobile) {
          modelRef.current.position.set(0, -1.75, 0);
        } else {
          modelRef.current.position.set(0, -2.98, 0);
        }

        if (!modelRef.current.userData.rotationInitialized) {
          modelRef.current.rotation.y = Math.PI;
          modelRef.current.userData.rotationInitialized = true;
        }

        console.log(
          `Login model positioned (${isMobile ? "mobile" : "desktop"})`
        );
      } catch (error) {
        console.error("Error positioning login model:", error);
      }
    }
  }, [clonedScene, viewport, isMobile]);

  if (!clonedScene) return null;

  return <primitive ref={modelRef} object={clonedScene} dispose={null} />;
}


// Scene setup for login
function LoginScene({ formProgress }) {
  const { camera } = useThree();

useEffect(() => {
  // Move camera closer to the model
  camera.position.set(0, 1.6, 3.2); // closer to head/shoulders
  camera.lookAt(0, 1.6, 0);

  // Zoom in by reducing FOV (default ~50–75)
  camera.fov = 30;  // tighter "portrait lens" effect
  camera.updateProjectionMatrix();
}, [camera]);





  return (
    <>
      {/* Ambient lighting */}
      <ambientLight intensity={0.2} />
      
      {/* Main directional light */}
      <directionalLight 
        position={[5, 5, 5]} 
        intensity={1.2} 
        castShadow
      />
      
      {/* Fill light for better visibility */}
      <pointLight position={[-3, 2, 3]} intensity={0.5} />
      
      {/* Model */}
      <LoginModel formProgress={formProgress} />
    </>
  );
}

// Main component for login
function LoginModel3D({ formProgress = 0 }) {
  const { currentTheme } = useSelector((state) => state.theme);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Get theme colors for background
  const getThemeColors = () => {
    switch (currentTheme) {
      case THEMES.BEIGE:
        return {
          primary: '#EDE8D0',
          secondary: '#D4C5A9',
          gradient: 'linear-gradient(135deg, #EDE8D0 0%, #D4C5A9 100%)'
        };
      case THEMES.BLACK:
        return {
          primary: '#000000',
          secondary: '#1a1a1a',
          gradient: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)'
        };
      case THEMES.BOTTLE_GREEN:
        return {
          primary: '#093624',
          secondary: '#0d4a2d',
          gradient: 'linear-gradient(135deg, #093624 0%, #0d4a2d 100%)'
        };
      default:
        return {
          primary: '#000000',
          secondary: '#1a1a1a',
          gradient: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)'
        };
    }
  };

  const themeColors = getThemeColors();

  const canvasProps = useMemo(() => ({
    camera: {
      fov: 50, // Same as register model
      near: 0.1,
      far: 1000,
      position: [0, -1, 8] // Same as register model
    },
    gl: {
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    },
    dpr: Math.min(window.devicePixelRatio, 2),
    onCreated: () => setIsLoading(false)
  }), [setIsLoading]);

  if (hasError) {
    return (
      <div 
        className="w-full h-full flex items-center justify-center"
        style={{ background: themeColors.gradient }}
      >
        <p className="text-white/60">Model unavailable</p>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 w-full h-full"
      style={{ 
        background: themeColors.gradient,
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0
      }}
    >
     

      <Canvas
        {...canvasProps}
        onError={(error) => {
          console.error('3D Model Error:', error);
          setHasError(true);
          setIsLoading(false);
        }}
      >
        <Suspense fallback={null}>
          <LoginScene formProgress={formProgress} />
        </Suspense>
      </Canvas>
      
      {/* Progress indicator for login (same as register) */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white/30 rounded-full overflow-hidden z-10">
        <div
          className="h-full bg-white transition-all duration-500 ease-out"
          style={{ width: `${formProgress * 100}%` }}
        />
      </div>
      
      {/* Completion message */}
      {formProgress >= 0.99 && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/90 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
          Welcome Back!
        </div>
      )}
    </div>
  );
}

// Preload the Arthur model
useGLTF.preload('/models/Arthur.glb');

export default LoginModel3D;
