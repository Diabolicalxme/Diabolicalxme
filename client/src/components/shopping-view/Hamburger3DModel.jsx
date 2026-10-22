import React, { Suspense, useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { Menu } from 'lucide-react';

const MODEL_BASE_URL = import.meta.env.VITE_3D_MODEL_BASE_URL || '/models-optimized';

function HamburgerAvatarModel({ baseModel = 'Arthur' }) {
  const modelRef = useRef();
  const modelUrl = `${MODEL_BASE_URL}/${baseModel}-hambg.glb`;
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

        // Zoom in on bust/torso while keeping head safely inside circular viewport
        const targetHeight = 8.2;
        const scale = targetHeight / size.y;
        // Offset model downwards so the head has comfortable headroom and is not cut off
        const verticalOffset = -size.y * 0.24;

        modelRef.current.position.set(
          -center.x * scale,
          (-center.y + verticalOffset) * scale,
          -center.z * scale
        );
        modelRef.current.scale.setScalar(scale);
      } catch (err) {
        console.error("Error positioning hamburger model:", err);
      }
    }
  }, [clonedScene]);

  // Subtle gentle breathing/floating motion
  useFrame((state) => {
    if (modelRef.current) {
      modelRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.12;
    }
  });

  return clonedScene ? <primitive ref={modelRef} object={clonedScene} /> : null;
}

export default function Hamburger3DModel({ modelName = 'Arthur', onClick, className = '' }) {
  const [hasError, setHasError] = useState(false);

  const baseModel = useMemo(() => {
    const lower = (modelName || '').toLowerCase();
    if (lower.includes('bravo')) return 'Bravo';
    if (lower.includes('hector')) return 'Hector';
    return 'Arthur';
  }, [modelName]);

  // Fallback to 2D icon if WebGL fails
  if (hasError) {
    return (
      <button
        onClick={onClick}
        className={`p-2 rounded-full hover:bg-muted/20 text-foreground transition-colors ${className}`}
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={`relative w-12 h-12 md:w-14 md:h-14 flex items-center justify-center cursor-pointer rounded-full overflow-hidden transition-all duration-300 hover:scale-110 active:scale-95 group focus:outline-none ${className}`}
      aria-label="Toggle menu"
      title="Menu"
    >
      {/* Subtle glowing ring on hover */}
      <div className="absolute inset-0 rounded-full border border-white/20 group-hover:border-white/50 transition-colors pointer-events-none z-10" />

      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        frameloop="always"
        shadows={false}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          outputColorSpace: THREE.SRGBColorSpace,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.3,
        }}
        dpr={Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2)}
        onError={() => setHasError(true)}
      >
        <ambientLight intensity={0.9} color="#ffffff" />
        <directionalLight position={[0, 6, 2]} intensity={1.8} color="#ffffff" />
        <directionalLight position={[-3, 2, 3]} intensity={0.8} color="#94a3b8" />
        <directionalLight position={[3, 2, 3]} intensity={0.8} color="#94a3b8" />

        <Suspense fallback={null}>
          <HamburgerAvatarModel baseModel={baseModel} />
        </Suspense>
      </Canvas>
    </div>
  );
}

// Preload the hamburger avatar models
try {
  useGLTF.preload(`${MODEL_BASE_URL}/Arthur-hambg.glb`);
  useGLTF.preload(`${MODEL_BASE_URL}/Bravo-hambg.glb`);
  useGLTF.preload(`${MODEL_BASE_URL}/Hector-hambg.glb`);
} catch (e) {
  // Ignore in SSR
}
