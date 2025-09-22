import React, { Suspense, useMemo, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { useSelector } from 'react-redux';
import { getGradientColors } from '@/utils/theme-utils';
import { Loader } from '@/components/ui/loader';
import * as THREE from 'three';

// Model component that shows face to shoulders (portrait view)
function RegistrationModel({ formProgress = 0 }) {
  const modelRef = useRef();
  const { viewport } = useThree();
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile on mount + resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Use Arthur model as default for registration
  const { scene } = useGLTF('/models/Bravo.glb');

  // Clone the scene to avoid issues with multiple instances
  const clonedScene = useMemo(() => {
    if (!scene) return null;
    return scene.clone();
  }, [scene]);

  // Calculate rotation: Start at π (180°, back-faced) and rotate to 0 (front-faced)
  const targetRotation = Math.PI - (formProgress * Math.PI); // π to 0 radians (back to front)

  // Smooth rotation animation
  useFrame(() => {
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

      modelRef.current.rotation.y += rotationDiff * 0.08; // Smooth transition
    }
  });

  // Position and scale the model to show face to shoulders (portrait view)
  useEffect(() => {
    if (clonedScene && modelRef.current) {
      try {
        // Scale up for tight head-and-shoulders framing
        const scale = Math.min(viewport.width, viewport.height) * 1.3;
        modelRef.current.scale.setScalar(scale);


        if (isMobile) {
          modelRef.current.position.set(0, -1.6, 0);
        } else {
          modelRef.current.position.set(0, -3.4, 0);
        }


        // Initial rotation
        if (!modelRef.current.userData.rotationInitialized) {
          modelRef.current.rotation.y = Math.PI; // Start facing back
          modelRef.current.userData.rotationInitialized = true;
        }
      } catch (error) {
        console.error('Error positioning registration model:', error);
      }
    }
  }, [clonedScene, viewport, isMobile]);


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
    // Adjust camera for a tight head-and-shoulders framing
    camera.position.set(0, 0, 3.2);
    camera.lookAt(0, 0, 0);

    // Narrower FOV to zoom in
    camera.fov = 35;
    camera.updateProjectionMatrix();
  }, [camera]);

  return (
    <>
      {/* Very bright ambient light */}
      <ambientLight intensity={1.2} color="#ffffff" />

      {/* Super bright overhead light */}
      <directionalLight
        position={[0, 10, 0]}
        intensity={2.5}
        color="#ffffff"
      />

      {/* Front bright light */}
      <directionalLight
        position={[0, 0, 10]}
        intensity={2.0}
        color="#ffffff"
      />

      {/* Multiple fill lights from all directions */}
      <directionalLight
        position={[-5, 0, 0]}
        intensity={1.5}
        color="#ffffff"
      />

      <directionalLight
        position={[5, 0, 0]}
        intensity={1.5}
        color="#ffffff"
      />

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

  // Get theme colors for background using centralized utility
  const gradientColors = getGradientColors(
    currentTheme === 'beige' ? 'arthur' :
      currentTheme === 'black' ? 'bravo' :
        currentTheme === 'bottle-green' ? 'hector' : 'bravo'
  );

  const themeColors = {
    primary: gradientColors.primary,
    secondary: gradientColors.secondary,
    gradient: `linear-gradient(135deg, ${gradientColors.primary} 0%, ${gradientColors.secondary} 100%)`
  };

  const canvasProps = useMemo(() => ({
    camera: {
      fov: 35, // Match the FOV set in RegistrationScene
      near: 0.1,
      far: 1000,
    },
    gl: {
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
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
        frameloop='always'
        shadows={false}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          preserveDrawingBuffer: false,
          outputColorSpace: THREE.SRGBColorSpace,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.3,
        }}
        dpr={Math.min(window.devicePixelRatio, 2)}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.3;
          gl.outputColorSpace = THREE.SRGBColorSpace;
          setIsLoading(false);
        }}
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

      {/* Progress indicator - Higher z-index to appear above form overlay */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white/30 rounded-full overflow-hidden z-30">
        <div
          className="h-full bg-white transition-all duration-500 ease-out"
          style={{ width: `${formProgress * 100}%` }}
        />
      </div>

      {/* Completion message - Higher z-index to appear above form overlay */}
      {formProgress >= 0.99 && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/90 text-gray-800 px-3 py-1 rounded-full text-sm font-medium z-30">
          Profile Complete!
        </div>
      )}
    </div>
  );
}

// Preload the Arthur model
useGLTF.preload('/models/Bravo.glb');

export default RegisterModel3D;