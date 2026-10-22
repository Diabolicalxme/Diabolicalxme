import React, { Suspense, useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { motion, useScroll, useTransform } from 'framer-motion';
import heroSpotlightBg from '@/assets/hero-spotlight-bg.jpg';

// Local Vercel CDN optimized models path (with fallback to external URL if VITE_3D_MODEL_BASE_URL is set)
const MODEL_BASE_URL = import.meta.env.VITE_3D_MODEL_BASE_URL || '/models-optimized';

// ---------------- Studio Spotlight Backdrop ----------------
function StudioSpotlightBackdrop({ scrollProgress }) {
  // Fade out smoothly as user scrolls towards hamburger avatar
  const opacity = Math.max(0, 1 - scrollProgress * 2.5);

  if (opacity <= 0.01) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden transition-opacity duration-300 ease-out"
      style={{
        zIndex: 0,
        backgroundColor: '#070a0e',
        opacity,
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
function Model({ modelName, isMobile, scrollProgress }) {
  const modelRef = useRef();
  const isMini = scrollProgress > 0.85;

  const actualModelName = useMemo(() => {
    const lower = (modelName || '').toLowerCase();
    let base = 'Arthur';
    if (lower.includes('bravo')) base = 'Bravo';
    else if (lower.includes('hector')) base = 'Hector';
    else if (lower.includes('arthur')) base = 'Arthur';

    if (isMini) {
      return `${base}-hambg`;
    }
    return `${base}-v2`;
  }, [modelName, isMini]);

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

        const targetHeight = isMini ? 5.5 : (isMobile ? 6.2 : 8.4);
        const scale = targetHeight / size.y;
        const verticalOffset = isMini 
          ? -size.y * 0.08  // Lower down in hamburger mode so full head is visible with headroom
          : (isMobile ? -size.y * 0.18 : -size.y * 0.25);

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
  }, [clonedScene, isMobile, isMini]);

  return clonedScene ? (
    <primitive ref={modelRef} object={clonedScene} />
  ) : null;
}

// ---------------- Scene ----------------
function Scene({ modelName, isMobile, scrollProgress }) {
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

      <Model modelName={modelName} isMobile={isMobile} scrollProgress={scrollProgress} />
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

  // Track scroll progress manually
  useEffect(() => {
    const unsubscribe = scrollY.on('change', (latest) => {
      const progress = Math.min(latest / 500, 1);
      setScrollProgress(progress);
    });
    return () => unsubscribe();
  }, [scrollY]);

  // On-demand selective preload: only preload the active character's hamburger model when user scrolls
  useEffect(() => {
    if (scrollProgress > 0.3 && scrollProgress < 0.85 && modelName) {
      const lower = modelName.toLowerCase();
      let base = 'Arthur';
      if (lower.includes('bravo')) base = 'Bravo';
      else if (lower.includes('hector')) base = 'Hector';
      else if (lower.includes('arthur')) base = 'Arthur';
      try {
        useGLTF.preload(`${MODEL_BASE_URL}/${base}-hambg.glb`);
      } catch (err) {
        // Preload fallback ignored
      }
    }
  }, [scrollProgress, modelName]);

  const handleMiniClick = () => {
    if (scrollProgress > 0.85) {
      window.dispatchEvent(new CustomEvent('open-mobile-menu'));
    }
  };

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
  }), []);

  if (!modelName || hasError) return null;

  // Calculate styles based on scroll progress
  const miniSize = '76px';
  const miniTop = isMobile ? '2px' : '6px';
  const miniLeft = isMobile ? '0px' : '55px';

  const containerStyle = {
    position: 'fixed',
    top: scrollProgress === 0 ? '0px' : `calc(${miniTop} * ${scrollProgress})`,
    left: scrollProgress === 0 ? '0px' : `calc(${miniLeft} * ${scrollProgress})`,
    width: scrollProgress === 0 ? '100vw' : `calc(100vw - (100vw - ${miniSize}) * ${scrollProgress})`,
    height: scrollProgress === 0 ? '100vh' : `calc(100vh - (100vh - ${miniSize}) * ${scrollProgress})`,
    borderRadius: `${scrollProgress * 50}%`,
    overflow: 'hidden',
    // Fade out in middle of scroll, then fade back in when reaching hamburger position
    opacity: scrollProgress < 0.3 ? 1 : scrollProgress > 0.7 ? 1 : Math.max(0.4, 1 - ((scrollProgress - 0.3) * 1.5)),
    zIndex: scrollProgress > 0.8 ? 100 : 1,
    pointerEvents: scrollProgress > 0.8 ? 'auto' : 'none',
    transition: 'all 0.5s cubic-bezier(0.25, 0.1, 0.25, 1), opacity 0.6s ease-out, z-index 0.1s ease-out',
  };

  return (
    <>
      {/* Studio Spotlight Backdrop Layer (applied across all three categories) */}
      <StudioSpotlightBackdrop scrollProgress={scrollProgress} />

      {/* Model Canvas Container (transforms to hamburger) */}
      <div onClick={handleMiniClick} style={containerStyle}>
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
          dpr={Math.min(window.devicePixelRatio, 2)}
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
        >
          <Suspense fallback={null}>
            <Scene
              modelName={modelName}
              isMobile={isMobile}
              scrollProgress={scrollProgress}
            />
          </Suspense>
        </Canvas>
      </div>
    </>
  );
}