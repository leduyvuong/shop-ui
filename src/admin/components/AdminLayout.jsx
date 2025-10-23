import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';
import { useAdminContext } from '../context/AdminContext.jsx';

export default function AdminLayout() {
  const { toasts, darkMode } = useAdminContext();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();

  const closeSidebar = () => setMobileSidebarOpen(false);

  return (
    <div className={`${darkMode ? 'dark' : ''} flex h-screen bg-slate-100 dark:bg-slate-950`}>
      <Sidebar onNavigate={closeSidebar} className="hidden md:flex" />

      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            className="fixed inset-0 z-40 flex md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween' }}
              className="relative"
            >
              <Sidebar onNavigate={closeSidebar} className="flex md:hidden" />
            </motion.div>
            <div className="flex-1 bg-black/40" onClick={closeSidebar} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-1 flex-col">
        <Header onToggleSidebar={() => setMobileSidebarOpen((prev) => !prev)} />
        <main className="flex-1 overflow-y-auto bg-slate-50/60 p-6 dark:bg-slate-900/60">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="mx-auto max-w-7xl"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center space-y-2 px-4">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className={`pointer-events-auto rounded-xl px-4 py-3 text-sm font-medium shadow-lg ${
                toast.variant === 'error'
                  ? 'bg-rose-500 text-white'
                  : toast.variant === 'info'
                  ? 'bg-slate-900 text-white'
                  : 'bg-emerald-500 text-white'
              }`}
            >
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

