import { SessionList } from "../chat/SessionList.tsx";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col bg-gray-950 transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 items-center border-b border-gray-800 px-5">
          <h1 className="text-lg font-semibold text-white">
            Synapse<span className="text-indigo-400">AI</span>
          </h1>
        </div>
        <SessionList />
      </aside>
    </>
  );
}
