import React, { Suspense, useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { motion, useScroll, useTransform } from 'framer-motion';

// ---------------- Model ----------------
function Model({ modelName, isMobile }) {
  const modelRef = useRef();
  const { scene } = useGLTF(`/models/${modelName}.glb`);
  const clonedScene = useMemo(() => (scene ? scene.clone() : null), [scene]);

  // useFrame(() => {
  //   if (modelRef.current) {
  //     modelRef.current.rotation.y += 0.005;
  //   }
  // });

  useEffect(() => {
    if (clonedScene && modelRef.current) {
      try {
        clonedScene.position.set(0, 0, 0);
        clonedScene.rotation.set(0, 0, 0);
        clonedScene.scale.set(1, 1, 1);

        const box = new THREE.Box3().setFromObject(clonedScene);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        const targetHeight = isMobile ? 4.5 : 6;
        const scale = targetHeight / size.y;
        const verticalOffset = -size.y * 0.18; // shift model down so top half (head->waist) is framed

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
      <ambientLight intensity={1.2} color="#ffffff" />
      <directionalLight position={[0, 10, 0]} intensity={2.5} color="#ffffff" />
      <directionalLight position={[0, 0, 10]} intensity={1} color="#ffffff" />
      <directionalLight position={[-5, 10, 0]} intensity={1} color="#ffffff" />
      <directionalLight position={[5, 0, 0]} intensity={1.5} color="#ffffff" />
      <Model modelName={modelName} isMobile={isMobile} />
    </>
  );
}

// ---------------- Background Wrapper ----------------
export default function BackgroundModel({ modelName, onError, onModelLoaded }) {
  const [hasError, setHasError] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [scrollProgress, setScrollProgress] = useState(0);

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
    onCreated: () => {
      onModelLoaded?.();
    },
  }), [onModelLoaded]);

  if (!modelName || hasError) return null;

  // Calculate styles based on scroll progress
  const miniSize = '76px';
  const miniTop = isMobile ? '0px' : '4px';
  const miniLeft = isMobile ? '0px' : '55px';


  const containerStyle = {
    position: 'fixed',
    top: scrollProgress === 0 ? '20px' : `calc(${miniTop} * ${scrollProgress})`,
    left: scrollProgress === 0 ? '0px' : `calc(${miniLeft} * ${scrollProgress})`,
    width: scrollProgress === 0 ? '100vw' : `calc(100vw - (100vw - ${miniSize}) * ${scrollProgress})`,
    height: scrollProgress === 0 ? '100vh' : `calc(100vh - (100vh - ${miniSize}) * ${scrollProgress})`,
    borderRadius: `${scrollProgress * 50}%`,
    overflow: 'hidden',
    // Fade out in middle of scroll, then fade back in when reaching hamburger position
    opacity: scrollProgress < 0.3 ? 1 : scrollProgress > 0.7 ? 1 : Math.max(0.4, 1 - ((scrollProgress - 0.3) * 1.5)),
    zIndex: scrollProgress > 0.8 ? 100 : 0,
    pointerEvents: scrollProgress > 0.8 ? 'auto' : 'none',
    transition: 'all 0.5s cubic-bezier(0.25, 0.1, 0.25, 1), opacity 0.6s ease-out, z-index 0.1s ease-out',
  };

  return (
    <div onClick={handleMiniClick} style={containerStyle}>
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

      <div
        className="absolute inset-0 bg-black/20 pointer-events-none"
        style={{ opacity: 0.2 - (scrollProgress * 0.2) }}
      />
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