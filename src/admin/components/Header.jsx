import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAdminContext } from '../context/AdminContext.jsx';

const titles = {
  '/admin': 'Dashboard Overview',
  '/admin/orders': 'Orders Management',
  '/admin/users': 'Users Management',
  '/admin/products': 'Products Management',
  '/admin/reviews': 'User Reviews',
  '/admin/search': 'Search Products',
  '/admin/send-mail': 'Send Mail Campaign',
};

export default function Header({ onToggleSidebar }) {
  const location = useLocation();
  const { darkMode, toggleDarkMode } = useAdminContext();

  const title = useMemo(() => {
    const pathname = location.pathname.replace(/\/$/, '');
    return titles[pathname] ?? 'Admin Panel';
  }, [location.pathname]);

  return (
    <header className="flex items-center justify-between border-b border-slate-200/60 bg-white/80 px-6 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 md:hidden dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <span className="sr-only">Toggle navigation</span>
          ☰
        </button>
        <div>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Monitor and manage your storefront insights.</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <motion.button
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={toggleDarkMode}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <span className="sr-only">Toggle dark mode</span>
          {darkMode ? '🌙' : '🌞'}
        </motion.button>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-slate-900 dark:text-white">Admin</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">admin@shop.com</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-lg font-semibold text-white">
            SA
          </div>
        </div>
      </div>
    </header>
  );
}

