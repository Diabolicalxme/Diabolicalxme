// BackgroundModel.jsx
import React, { Suspense, useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// ---------------- Model ----------------
function Model({ modelName, isMobile }) {
  const modelRef = useRef();
  const { scene } = useGLTF(`/models/${modelName}.glb`);
  const clonedScene = useMemo(() => (scene ? scene.clone() : null), [scene]);

  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.y += 0.005;
    }
  });

  useEffect(() => {
    if (clonedScene && modelRef.current) {
      try {
        // Reset transformations first
        clonedScene.position.set(0, 0, 0);
        clonedScene.rotation.set(0, 0, 0);
        clonedScene.scale.set(1, 1, 1);

        // Calculate bounding box
        const box = new THREE.Box3().setFromObject(clonedScene);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        // Target height for consistent sizing
        const targetHeight = isMobile ? 2.6 : 3.9;
        const scale = targetHeight / size.y;

        // Mobile-specific vertical adjustment to prevent head cutoff
        const verticalOffset = isMobile ? -size.y * 0.02 : 0; // Move up 10% of model height on mobile

        // Position to center model at origin (0,0,0) with vertical adjustment for mobile
        modelRef.current.position.set(
          -center.x * scale,
          (-center.y + verticalOffset) * scale,
          -center.z * scale
        );

        // Apply uniform scaling
        modelRef.current.scale.setScalar(scale);
      } catch (err) {
        console.error("Error positioning model:", err);
      }
    }
  }, [clonedScene, isMobile]);

  

  return clonedScene ? (
    <primitive ref={modelRef} object={clonedScene} />
  ) : null;
}

// ---------------- Scene ----------------
function Scene({ modelName, isMobile }) {
  const { camera } = useThree();

  useEffect(() => {
    // Reset camera position
    if (isMobile) {
      camera.position.set(0, 0.3, 4);
    } else {
      camera.position.set(0, 0, 6);
    }

    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera, isMobile]);

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
        intensity={1}
        color="#ffffff"
      />

      {/* Multiple fill lights from all directions */}
      <directionalLight
        position={[-5, 10, 0]}
        intensity={1}
        color="#ffffff"
      />
      
      <directionalLight
        position={[5, 0, 0]}
        intensity={1.5}
        color="#ffffff"
      />

      <Model modelName={modelName} isMobile={isMobile} />
    </>
  );
}// ---------------- Background Wrapper ----------------
export default function BackgroundModel({ modelName, onError, onModelLoaded }) {
  const [hasError, setHasError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const canvasProps = useMemo(() => ({
    camera: {
      fov: 45,
      near: 0.1,
      far: 1000,
    },
    gl: {
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    },
    dpr: Math.min(window.devicePixelRatio, 2),
    onCreated: () => {
      onModelLoaded?.();
    },
  }), []);

  if (!modelName || hasError) return null;

  return (
    <div
      className="fixed inset-0 w-full h-full z-0 pointer-events-none"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        zIndex: 0,
        pointerEvents: 'none',
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
    onModelLoaded?.();
  }}
>
  <Suspense fallback={null}>
    <Scene modelName={modelName} isMobile={isMobile} />
  </Suspense>
</Canvas>

      <div className="absolute inset-0 bg-black/20 pointer-events-none" />
    </div>
  );
}

// ---------------- Preload ----------------
try {
  useGLTF.preload('/models/Arthur.glb');
  useGLTF.preload('/models/Bravo.glb');
  useGLTF.preload('/models/Hector.glb');
} catch (error) {
  console.warn('Failed to preload 3D models:', error);
}