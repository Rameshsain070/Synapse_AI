import { Navbar } from "@/components/layout/Navbar";
import { HeroSection } from "@/components/dashboard/HeroSection";
import { FeatureCards } from "@/components/dashboard/FeatureCards";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <main>
        <HeroSection />
        <FeatureCards />
        <footer className="border-t border-gray-800 py-8 text-center text-sm text-gray-500">
          <p>SynapseAI — Unified AI Platform</p>
        </footer>
      </main>
    </div>
  );
}
