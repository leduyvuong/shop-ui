import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMemo } from 'react';

const navItems = [
  { label: 'Dashboard', to: '/admin', icon: '📊' },
  { label: 'Orders Management', to: '/admin/orders', icon: '🧾' },
  { label: 'Users Management', to: '/admin/users', icon: '👥' },
  { label: 'Products Management', to: '/admin/products', icon: '🛍️' },
  { label: 'User Reviews', to: '/admin/reviews', icon: '💬' },
  { label: 'Search Products', to: '/admin/search', icon: '🔍' },
  { label: 'Send Mail', to: '/admin/send-mail', icon: '✉️' },
];

export default function Sidebar({ onNavigate, className = '' }) {
  const navigate = useNavigate();
  const location = useLocation();

  const activeLabel = useMemo(() => {
    const activeItem = navItems.find((item) => location.pathname === item.to);
    return activeItem?.label ?? '';
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin/login', { replace: true, state: { message: 'You have been logged out.' } });
    onNavigate?.();
  };

  return (
    <motion.aside
      initial={{ x: -24, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex h-full w-72 shrink-0 flex-col border-r border-slate-800/20 bg-slate-900/95 pb-6 text-slate-100 shadow-xl ${className}`}
    >
      <div className="flex items-center gap-3 px-6 py-6 text-lg font-semibold">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-500 text-xl">A</div>
        <div className="flex flex-col">
          <span>Shop Admin</span>
          <span className="text-sm font-normal text-slate-300">{activeLabel || 'Control Center'}</span>
        </div>
      </div>

      <nav className="mt-4 flex-1 space-y-1 px-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => onNavigate?.()}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors duration-150 hover:bg-slate-800/70 ${
                isActive ? 'bg-slate-800 text-white' : 'text-slate-300'
              }`
            }
            end={item.to === '/admin'}
          >
            <span className="text-lg" aria-hidden>
              {item.icon}
            </span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-4">
        <button
          onClick={handleLogout}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400"
        >
          <span>Logout</span>
        </button>
      </div>
    </motion.aside>
  );
}

