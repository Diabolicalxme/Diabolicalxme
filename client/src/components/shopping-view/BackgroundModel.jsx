import React, { Suspense, useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useScroll } from 'framer-motion';
import heroSpotlightBg from '@/assets/hero-spotlight-bg.jpg';

// Local Vercel CDN optimized models path (with fallback to external URL if VITE_3D_MODEL_BASE_URL is set)
const MODEL_BASE_URL = import.meta.env.VITE_3D_MODEL_BASE_URL || '/models-optimized';

// ---------------- Studio Spotlight Backdrop ----------------
function StudioSpotlightBackdrop() {
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{
        zIndex: -1,
        backgroundColor: '#070a0e',
      }}
    >
      <img
        src={heroSpotlightBg}
        alt="Studio Spotlight Backdrop"
        className="w-full h-full object-cover object-center"
      />
    </div>
  );
}

// ---------------- Model ----------------
function Model({ modelName, isMobile }) {
  const modelRef = useRef();

  const actualModelName = useMemo(() => {
    const lower = (modelName || '').toLowerCase();
    let base = 'Arthur';
    if (lower.includes('bravo')) base = 'Bravo';
    else if (lower.includes('hector')) base = 'Hector';
    else if (lower.includes('arthur')) base = 'Arthur';

    return `${base}-v2`;
  }, [modelName]);

  const modelUrl = `${MODEL_BASE_URL}/${actualModelName}.glb`;

  const { scene } = useGLTF(modelUrl);
  const clonedScene = useMemo(() => (scene ? scene.clone() : null), [scene]);

  useEffect(() => {
    if (clonedScene && modelRef.current) {
      try {
        clonedScene.position.set(0, 0, 0);
        clonedScene.rotation.set(0, 0, 0);
        clonedScene.scale.set(1, 1, 1);

        const box = new THREE.Box3().setFromObject(clonedScene);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        const targetHeight = isMobile ? 6.2 : 8.4;
        const scale = targetHeight / size.y;
        const verticalOffset = isMobile ? -size.y * 0.18 : -size.y * 0.25;

        modelRef.current.position.set(
          -center.x * scale,
          (-center.y + verticalOffset) * scale,
          -center.z * scale
        );

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
      {/* Balanced ambient fill */}
      <ambientLight intensity={0.65} color="#cbd5e1" />

      {/* Soft overhead key spotlight matching the smoky backdrop light */}
      <spotLight
        position={[0, 8, 2]}
        target-position={[0, 0, 0]}
        angle={0.5}
        penumbra={0.8}
        intensity={2.4}
        color="#f1f5f9"
      />

      {/* Gentle overhead downlight for subtle shoulder definition */}
      <directionalLight position={[0, 7, 1]} intensity={1.1} color="#f8fafc" />

      {/* Front fill light so T-shirt graphic and face details remain crisp without overexposure */}
      <directionalLight position={[0, 1, 5]} intensity={1.2} color="#ffffff" />

      {/* Soft side rim lights */}
      <directionalLight position={[-4, 2, 2]} intensity={0.5} color="#94a3b8" />
      <directionalLight position={[4, 2, 2]} intensity={0.5} color="#94a3b8" />

      {/* Soft floor bounce reflection */}
      <directionalLight position={[0, -3, 1.5]} intensity={0.3} color="#475569" />

      <Model modelName={modelName} isMobile={isMobile} />
    </>
  );
}

// ---------------- Background Wrapper ----------------
export default function BackgroundModel({ modelName, onError, onModelLoaded }) {
  const [hasError, setHasError] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [canvasKey, setCanvasKey] = useState(0);

  const { scrollY } = useScroll();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Track scroll progress to fade out hero model and background
  useEffect(() => {
    const unsubscribe = scrollY.on('change', (latest) => {
      const progress = Math.min(latest / 450, 1);
      setScrollProgress(progress);
    });
    return () => unsubscribe();
  }, [scrollY]);

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
    dpr: Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2),
  }), []);

  if (!modelName || hasError) return null;

  // Once scrolled past hero section completely, remove hero model from DOM to prevent any overlap
  const opacity = Math.max(0, 1 - scrollProgress * 1.5);
  if (scrollProgress >= 1 || opacity <= 0.01) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden transition-opacity duration-300 ease-out"
      style={{
        zIndex: 0,
        opacity,
      }}
    >
      {/* Studio Spotlight Backdrop Layer */}
      <StudioSpotlightBackdrop />

      {/* Full Hero Model Canvas */}
      <Canvas
        key={canvasKey}
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
        dpr={Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2)}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.3;
          gl.outputColorSpace = THREE.SRGBColorSpace;

          const handleContextLost = (event) => {
            event.preventDefault();
            console.warn("WebGL Context Lost! Recreating Canvas...");
            setCanvasKey(prev => prev + 1);
          };

          gl.domElement.addEventListener("webglcontextlost", handleContextLost);
          onModelLoaded?.();
        }}
        onError={(error) => {
          console.error("3D Canvas Error:", error);
          setHasError(true);
          onError?.(error);
        }}
      >
        <Suspense fallback={null}>
          <Scene
            modelName={modelName}
            isMobile={isMobile}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}