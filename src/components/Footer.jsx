import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext.jsx';

export default function Footer() {
  const { theme, toggleTheme } = useTheme();

  return (
    <footer className="border-t border-slate-200 bg-white/70 backdrop-blur-sm transition dark:border-slate-800 dark:bg-slate-950/70">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-4 py-12 text-center text-slate-600 dark:text-slate-300">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500">Modern Store</p>
          <p className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
            Curated essentials for the design-forward lifestyle.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {['About', 'Support', 'Shipping', 'Returns'].map((item) => (
            <span key={item} className="rounded-full border border-slate-200 px-4 py-2 transition dark:border-slate-700">
              {item}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-4">
          {[
            { label: 'Instagram', href: 'https://instagram.com' },
            { label: 'Pinterest', href: 'https://pinterest.com' },
            { label: 'Twitter', href: 'https://twitter.com' },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 transition hover:text-primary dark:hover:text-primary-light"
            >
              {item.label}
            </a>
          ))}
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={toggleTheme}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600 shadow-sm transition hover:border-primary hover:text-primary dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:border-primary-light dark:hover:text-primary-light"
        >
          {theme === 'dark' ? 'Switch to Light ☀️' : 'Switch to Dark 🌙'}
        </motion.button>
        <p className="text-xs text-slate-400 dark:text-slate-500">© {new Date().getFullYear()} Modern Store. All rights reserved.</p>
      </div>
    </footer>
  );
}
