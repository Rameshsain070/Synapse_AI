"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars, Float } from "@react-three/drei";
import { Suspense, type ReactNode } from "react";

function SceneFallback() {
  return (
    <div className="flex items-center justify-center h-full w-full bg-gray-950">
      <div className="text-indigo-400 animate-pulse">Loading 3D Scene...</div>
    </div>
  );
}

interface SceneProps {
  children: ReactNode;
  className?: string;
  showStars?: boolean;
}

export function Scene({ children, className = "", showStars = true }: SceneProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Suspense fallback={<SceneFallback />}>
        <Canvas
          camera={{ position: [0, 0, 8], fov: 60 }}
          gl={{ antialias: true, alpha: true }}
          style={{ background: "transparent" }}
        >
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={0.8} />
          <pointLight position={[-10, -10, -10]} intensity={0.3} color="#818cf8" />
          {showStars && <Stars radius={50} depth={50} count={1000} factor={3} saturation={0.5} fade speed={1} />}
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.5}
            maxPolarAngle={Math.PI / 1.5}
            minPolarAngle={Math.PI / 3}
          />
          <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
            {children}
          </Float>
        </Canvas>
      </Suspense>
    </div>
  );
}
