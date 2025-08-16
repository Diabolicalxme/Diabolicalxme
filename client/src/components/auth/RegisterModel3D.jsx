import React, { Suspense, useMemo, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { useSelector } from 'react-redux';
import { THEMES } from '@/store/theme-slice';
import { Loader } from '@/components/ui/loader';

// Model component that shows face to shoulders (portrait view)
function RegistrationModel({ formProgress = 0 }) {
  const modelRef = useRef();
  const { viewport } = useThree();
  
  // Use Arthur model as default for registration
  const { scene } = useGLTF('/models/Arthur.glb');

  // Clone the scene to avoid issues with multiple instances
  const clonedScene = useMemo(() => {
    if (!scene) return null;
    return scene.clone();
  }, [scene]);

  // Calculate rotation: Start at π (180°, back-faced) and rotate to 0 (front-faced)
  const targetRotation = Math.PI - (formProgress * Math.PI); // π to 0 radians (back to front)

  // Smooth rotation animation
  useFrame((state) => {
    if (modelRef.current) {
      // Smooth interpolation to target rotation with better continuity
      const currentRotation = modelRef.current.rotation.y;
      let rotationDiff = targetRotation - currentRotation;

      // Handle rotation wrapping for smooth transition
      if (rotationDiff > Math.PI) {
        rotationDiff -= 2 * Math.PI;
      } else if (rotationDiff < -Math.PI) {
        rotationDiff += 2 * Math.PI;
      }

      modelRef.current.rotation.y += rotationDiff * 0.08; // Slightly faster transition

      // Subtle breathing animation
      const breathingScale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.0; // Reduced breathing
      modelRef.current.scale.setScalar(breathingScale);
    }
  });

  // Position and scale the model to show face to shoulders (portrait view)
// Position and scale the model to show face to shoulders (portrait view)
useEffect(() => {
  if (clonedScene && modelRef.current) {
    try {
      // Scale the model moderately – not too zoomed
      const scale = Math.min(viewport.width, viewport.height) * 2.5;
      modelRef.current.scale.setScalar(scale);

      // Lift the model up so shoulders are in frame
      modelRef.current.position.set(0, -3.1, 0);

      // Initial rotation
      if (!modelRef.current.userData.rotationInitialized) {
        modelRef.current.rotation.y = Math.PI; // Start facing back
        modelRef.current.userData.rotationInitialized = true;
      }

      console.log('Registration model cropped to head + shoulders');
    } catch (error) {
      console.error('Error positioning registration model:', error);
    }
  }
}, [clonedScene, viewport]);


  if (!clonedScene) {
    return null;
  }

  return (
    <primitive 
      ref={modelRef} 
      object={clonedScene} 
      dispose={null}
    />
  );
}

// Scene setup for registration
function RegistrationScene({ formProgress }) {
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
      <RegistrationModel formProgress={formProgress} />
    </>
  );
}



// Main component
function RegisterModel3D({ formProgress = 0 }) {
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
      fov: 45, // Field of view for head and shoulders cropped view
      near: 0.1,
      far: 1000,
      position: [0, -4, 10] // Camera position to capture head and shoulders
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
      {isLoading && <Loader />}

      <Canvas
        {...canvasProps}
        onError={(error) => {
          console.error('3D Model Error:', error);
          setHasError(true);
          setIsLoading(false);
        }}
      >
        <Suspense fallback={null}>
          <RegistrationScene formProgress={formProgress} />
        </Suspense>
      </Canvas>

      {/* Progress indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white/30 rounded-full overflow-hidden z-10">
        <div
          className="h-full bg-white transition-all duration-500 ease-out"
          style={{ width: `${formProgress * 100}%` }}
        />
      </div>

      {/* Completion message */}
      {formProgress >= 0.99 && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/90 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
          Profile Complete!
        </div>
      )}
    </div>
  );
}

// Preload the Arthur model
useGLTF.preload('/models/Arthur.glb');

export default RegisterModel3D;
