import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth";
import { useNotificationStore } from "@/store/notifications";
import { DashboardNav } from "./DashboardNav";
import { NotificationBell } from "./NotificationBell";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { startPolling, stopPolling } = useNotificationStore();

  useEffect(() => {
    startPolling();
    return () => stopPolling();
  }, [startPolling, stopPolling]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F7F7FB] flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-[220px] xl:w-[240px] shrink-0 flex-col bg-white border-r border-black/6 fixed inset-y-0 left-0 z-30">
        <DashboardNav user={user} />
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed inset-y-0 left-0 w-[240px] bg-white border-r border-black/6 z-50 lg:hidden"
            >
              <DashboardNav user={user} onClose={() => setSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-[220px] xl:ml-[240px]">
        {/* Topbar */}
        <header className="h-[60px] bg-white border-b border-black/6 sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-black/[0.05] hover:bg-black/[0.09] text-ink transition-all"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[12px] text-ink-muted font-medium">Platform Preview</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <NotificationBell />
            <div className="hidden sm:flex items-center gap-2.5 pl-2 border-l border-black/8">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white text-[11px] font-bold">
                {user.email.charAt(0).toUpperCase()}
              </div>
              <span className="text-[13px] font-semibold text-ink hidden md:block">{user.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold text-ink/50 hover:text-red-600 hover:bg-red-50 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {sidebarOpen && <div className="lg:hidden" onClick={() => setSidebarOpen(false)} />}
          {children}
        </main>
      </div>
    </div>
  );
}
