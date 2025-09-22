import React, { Suspense, useMemo, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { useSelector } from 'react-redux';
import { getGradientColors } from '@/utils/theme-utils';
import { Loader } from '@/components/ui/loader';
import * as THREE from 'three';

// Model component that shows face to shoulders (portrait view) for login
function LoginModel({ formProgress = 0 }) {
  const modelRef = useRef();
  const { scene } = useGLTF('/models/Bravo.glb');
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
        const scale = Math.min(viewport.width, viewport.height) * 1.4;
        modelRef.current.scale.setScalar(scale);

        // ✅ Different position for mobile vs desktop
        if (isMobile) {
          modelRef.current.position.set(0, -2.26, 0);
        } else {
          modelRef.current.position.set(0, -4.7, 0);
        }

        if (!modelRef.current.userData.rotationInitialized) {
          modelRef.current.rotation.y = Math.PI;
          modelRef.current.userData.rotationInitialized = true;
        }
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
    // Adjust camera for a tight head-and-shoulders framing
    camera.position.set(0, 0, 4);
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
      <LoginModel formProgress={formProgress} />
    </>
  );
}

// Main component for login
function LoginModel3D({ formProgress = 0 }) {
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
      fov: 50,
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
useGLTF.preload('/models/Bravo.glb');

export default LoginModel3D;