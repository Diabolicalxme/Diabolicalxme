import React, { Suspense, useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// ---------------- Model ----------------
function Model({ modelName, isMobile }) {
  const modelRef = useRef();
  const { viewport } = useThree();
  const { scene } = useGLTF(`/models/${modelName}.glb`);

  const clonedScene = useMemo(() => (scene ? scene.clone() : null), [scene]);

  useFrame((state) => {
    if (modelRef.current) {
      modelRef.current.rotation.y += 0.003;
    }
  });

  useEffect(() => {
    if (clonedScene && modelRef.current) {
      try {
        const box = new THREE.Box3().setFromObject(clonedScene);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        // --- Normalize scale so model height is consistent across reloads ---
        const targetHeight = isMobile ? 2.5 : 4; // fix height units (world space)
        const scale = targetHeight / size.y;
        modelRef.current.scale.setScalar(scale);

        // --- Position so shoulders are roughly at center ---
        const shoulderOffset = size.y * 0.25; // move pivot lower (~25% from top)
        modelRef.current.position.set(
          -center.x * scale,
          (-center.y + shoulderOffset) * scale,
          -center.z * scale
        );
      } catch (err) {
        console.error("Error positioning model:", err);
      }
    }
  }, [clonedScene, viewport, isMobile]);

  return clonedScene ? <primitive ref={modelRef} object={clonedScene} /> : null;
}

// ---------------- Scene ----------------
// ---------------- Scene ----------------
// ---------------- Scene ----------------
function Scene({ modelName, isMobile }) {
  const { camera } = useThree();

  useEffect(() => {
    if (isMobile) {
      camera.position.set(0, 1, 4);   // closer & higher for shoulders
    } else {
      camera.position.set(0, 1.5, 6); // farther, full view
    }
    camera.lookAt(0, 1, 0); // lock focus at shoulders
    camera.updateProjectionMatrix();
  }, [camera, isMobile]);

  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <Model modelName={modelName} isMobile={isMobile} />
    </>
  );
}



// ---------------- Loading ----------------
function LoadingFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900/20 to-gray-600/20 backdrop-blur-sm">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
      </div>
    </div>
  );
}

// ---------------- Background Wrapper ----------------
export default function BackgroundModel({ modelName, onError }) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const canvasProps = useMemo(
    () => ({
      camera: {
        fov: 45,
        near: 0.1,
        far: 1000,
        position: [0, 0, 12],
      },
      gl: {
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: true,
      },
      dpr: Math.min(window.devicePixelRatio, 2),
      onCreated: () => setIsLoading(false),
    }),
    []
  );

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
      }}
    >
      {isLoading && <LoadingFallback />}
      <Canvas
        {...canvasProps}
        onError={(e) => {
          setHasError(true);
          onError?.(e);
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
