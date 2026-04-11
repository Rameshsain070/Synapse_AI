import { useState } from "react";
import type { ReactNode } from "react";
import { Header } from "./Header.tsx";
import { Sidebar } from "./Sidebar.tsx";

export function MainLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
