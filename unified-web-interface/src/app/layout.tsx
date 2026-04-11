import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SynapseAI - Unified AI Platform",
  description: "Modern AI platform with 3D visualization, intelligent chat, and real-time diagnostics",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-gray-950 text-gray-100">{children}</body>
    </html>
  );
}
