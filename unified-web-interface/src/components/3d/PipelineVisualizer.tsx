"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

interface PipelineStage {
  label: string;
  status: "idle" | "active" | "complete" | "error";
}

interface PipelineVisualizerProps {
  stages?: PipelineStage[];
}

const defaultStages: PipelineStage[] = [
  { label: "Input", status: "complete" },
  { label: "LLM", status: "active" },
  { label: "RAG", status: "idle" },
  { label: "Memory", status: "idle" },
  { label: "Output", status: "idle" },
];

const statusColors: Record<string, string> = {
  idle: "#374151",
  active: "#6366f1",
  complete: "#10b981",
  error: "#ef4444",
};

function PipelineNode({ position, label, status }: { position: [number, number, number]; label: string; status: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const isActive = status === "active";

  useFrame((state) => {
    if (!meshRef.current || !isActive) return;
    meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.1);
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial
          color={statusColors[status]}
          emissive={statusColors[status]}
          emissiveIntensity={isActive ? 0.8 : 0.2}
          transparent
          opacity={status === "idle" ? 0.5 : 0.9}
        />
      </mesh>
      <Text
        position={[0, -0.7, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="top"
      >
        {label}
      </Text>
    </group>
  );
}

export function PipelineVisualizer({ stages = defaultStages }: PipelineVisualizerProps) {
  const spacing = 2.2;
  const startX = -((stages.length - 1) * spacing) / 2;

  return (
    <group>
      {stages.map((stage, i) => (
        <group key={stage.label}>
          <PipelineNode
            position={[startX + i * spacing, 0, 0]}
            label={stage.label}
            status={stage.status}
          />
          {i < stages.length - 1 && (
            <mesh
              position={[startX + i * spacing + spacing / 2, 0, 0]}
              rotation={[0, 0, Math.PI / 2]}
            >
              <cylinderGeometry args={[0.03, 0.03, spacing - 0.9, 8]} />
              <meshStandardMaterial
                color={stage.status === "complete" ? "#10b981" : "#374151"}
                emissive={stage.status === "complete" ? "#10b981" : "#1f2937"}
                emissiveIntensity={0.3}
              />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}
