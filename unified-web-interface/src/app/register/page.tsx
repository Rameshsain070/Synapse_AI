"use client";

import dynamic from "next/dynamic";
import { RegisterForm } from "@/components/auth/RegisterForm";

const ParticleField = dynamic(
  () => import("@/components/3d/ParticleField").then((m) => ({ default: m.ParticleField })),
  { ssr: false }
);
const Scene = dynamic(
  () => import("@/components/3d/Scene").then((m) => ({ default: m.Scene })),
  { ssr: false }
);

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle 3D background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <Scene showStars={false} className="h-full">
          <ParticleField count={300} color="#8b5cf6" />
        </Scene>
      </div>
      {/* Gradient blobs */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full flex items-center justify-center py-8">
        <RegisterForm />
      </div>
    </div>
  );
}
