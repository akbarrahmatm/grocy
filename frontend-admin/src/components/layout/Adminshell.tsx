import { useState, type ReactNode } from "react";
import { ToastProvider } from "@/context/ToastContext";
import { useTheme } from "@/context/ThemeContext";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

interface AdminShellProps {
  title: string;
  children: ReactNode;
}

function AdminShellInner({ title, children }: AdminShellProps) {
  const { isDark, toggle } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="ad-root min-h-screen flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 min-w-0 flex flex-col">
        <Navbar
          title={title}
          dark={isDark}
          onToggleDark={toggle}
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        <main className="flex-1 p-4 md:p-6 max-w-[1280px] w-full mx-auto space-y-6 ad-fade">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminShell(props: AdminShellProps) {
  return (
    <ToastProvider>
      <AdminShellInner {...props} />
    </ToastProvider>
  );
}