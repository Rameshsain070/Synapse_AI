"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface NodeData {
  position: THREE.Vector3;
  connections: number[];
}

// Deterministic pseudo-random number generator (mulberry32)
function seededRandom(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateNodes(count: number): NodeData[] {
  const rng = seededRandom(123);
  const nodes: NodeData[] = [];
  for (let i = 0; i < count; i++) {
    const phi = Math.acos(2 * rng() - 1);
    const theta = 2 * Math.PI * rng();
    const r = 1.5 + rng() * 0.8;
    const position = new THREE.Vector3(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi)
    );
    nodes.push({ position, connections: [] });
  }
  // Create connections to nearest neighbors
  for (let i = 0; i < nodes.length; i++) {
    const distances = nodes
      .map((n, j) => ({ idx: j, dist: nodes[i].position.distanceTo(n.position) }))
      .filter((d) => d.idx !== i)
      .sort((a, b) => a.dist - b.dist);
    nodes[i].connections = distances.slice(0, 3).map((d) => d.idx);
  }
  return nodes;
}

interface BrainModelProps {
  nodeCount?: number;
  isProcessing?: boolean;
}

export function BrainModel({ nodeCount = 40, isProcessing = false }: BrainModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const nodes = useMemo(() => generateNodes(nodeCount), [nodeCount]);

  const linePositions = useMemo(() => {
    const positions: number[] = [];
    const seen = new Set<string>();
    for (let i = 0; i < nodes.length; i++) {
      for (const j of nodes[i].connections) {
        const key = [Math.min(i, j), Math.max(i, j)].join("-");
        if (seen.has(key)) continue;
        seen.add(key);
        positions.push(
          nodes[i].position.x, nodes[i].position.y, nodes[i].position.z,
          nodes[j].position.x, nodes[j].position.y, nodes[j].position.z
        );
      }
    }
    return new Float32Array(positions);
  }, [nodes]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const speed = isProcessing ? 0.3 : 0.1;
    groupRef.current.rotation.y = state.clock.elapsedTime * speed;
  });

  return (
    <group ref={groupRef}>
      {/* Neural nodes */}
      {nodes.map((node, i) => (
        <mesh key={i} position={node.position}>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshStandardMaterial
            color={isProcessing ? "#818cf8" : "#6366f1"}
            emissive={isProcessing ? "#4f46e5" : "#312e81"}
            emissiveIntensity={isProcessing ? 0.8 : 0.3}
          />
        </mesh>
      ))}
      {/* Connections */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[linePositions, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color={isProcessing ? "#818cf8" : "#4338ca"}
          transparent
          opacity={isProcessing ? 0.6 : 0.25}
        />
      </lineSegments>
      {/* Central glow */}
      <mesh>
        <sphereGeometry args={[0.3, 24, 24]} />
        <meshStandardMaterial
          color="#6366f1"
          emissive="#4f46e5"
          emissiveIntensity={isProcessing ? 1.2 : 0.5}
          transparent
          opacity={0.4}
        />
      </mesh>
    </group>
  );
}
