import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useAdminContext } from '../context/AdminContext.jsx';

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

const selectorBaseClasses =
  'flex-1 rounded-2xl border px-4 py-4 text-left transition focus:outline-none focus-visible:ring-2';

export default function AdminSettings() {
  const { theme, homeVersion, updateSettings } = useTheme();
  const { showToast } = useAdminContext();
  const [form, setForm] = useState({ theme, homeVersion });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({ theme, homeVersion });
  }, [theme, homeVersion]);

  const handleThemeSelect = (value) => {
    setForm((prev) => ({ ...prev, theme: value }));
  };

  const handleHomeVersionSelect = (value) => {
    setForm((prev) => ({ ...prev, homeVersion: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      updateSettings(form);
      showToast('Settings saved successfully');
    } finally {
      setSaving(false);
    }
  };

  const summaryItems = [
    { label: 'Total themes available', value: 2 },
    { label: 'Home layouts', value: 3 },
    { label: 'Preview URL', value: `/preview/home-${form.homeVersion}` },
  ];

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
      className="space-y-10"
    >
      <motion.div variants={cardVariants} className="rounded-3xl border border-slate-200/60 bg-white p-8 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/60">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Theme & Layout Selector</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Choose how the storefront appears to customers. These preferences are stored for the next visit.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/preview/home-v2"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-primary hover:text-primary dark:border-slate-700 dark:text-slate-200 dark:hover:border-primary-light dark:hover:text-primary-light"
            >
              Preview Home v2
              <span aria-hidden>↗</span>
            </Link>
            <Link
              to="/preview/home-v3"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-primary hover:text-primary dark:border-slate-700 dark:text-slate-200 dark:hover:border-primary-light dark:hover:text-primary-light"
            >
              Preview Home v3
              <span aria-hidden>↗</span>
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Theme mode</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Control the storefront&apos;s color palette. This applies to both the user site and the admin portal.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => handleThemeSelect('light')}
                className={`${selectorBaseClasses} ${
                  form.theme === 'light'
                    ? 'border-primary bg-primary/10 text-primary shadow-sm dark:border-primary-light dark:bg-primary/10'
                    : 'border-slate-200 text-slate-600 hover:border-primary/60 dark:border-slate-700 dark:text-slate-300'
                }`}
              >
                <span className="block text-sm font-semibold">Light 🌞</span>
                <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                  Crisp whites, perfect for daylight shopping.
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleThemeSelect('dark')}
                className={`${selectorBaseClasses} ${
                  form.theme === 'dark'
                    ? 'border-primary bg-primary/10 text-primary shadow-sm dark:border-primary-light dark:bg-primary/10'
                    : 'border-slate-200 text-slate-600 hover:border-primary/60 dark:border-slate-700 dark:text-slate-300'
                }`}
              >
                <span className="block text-sm font-semibold">Dark 🌙</span>
                <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                  A cinematic look that shines at night.
                </span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Homepage layout</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Decide which experience customers see when they land on the storefront.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <label
                className={`${selectorBaseClasses} cursor-pointer ${
                  form.homeVersion === 'v1'
                    ? 'border-primary bg-primary/10 text-primary shadow-sm dark:border-primary-light dark:bg-primary/10'
                    : 'border-slate-200 text-slate-600 hover:border-primary/60 dark:border-slate-700 dark:text-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="home-version"
                  value="v1"
                  checked={form.homeVersion === 'v1'}
                  onChange={() => handleHomeVersionSelect('v1')}
                  className="sr-only"
                />
                <span className="block text-sm font-semibold">Home Version 1</span>
                <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                  Classic grid with quick category filters.
                </span>
              </label>
              <label
                className={`${selectorBaseClasses} cursor-pointer ${
                  form.homeVersion === 'v2'
                    ? 'border-primary bg-primary/10 text-primary shadow-sm dark:border-primary-light dark:bg-primary/10'
                    : 'border-slate-200 text-slate-600 hover:border-primary/60 dark:border-slate-700 dark:text-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="home-version"
                  value="v2"
                  checked={form.homeVersion === 'v2'}
                  onChange={() => handleHomeVersionSelect('v2')}
                  className="sr-only"
                />
                <span className="block text-sm font-semibold">Home Version 2</span>
                <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                  Immersive hero, motion design, and testimonials.
                </span>
              </label>
              <label
                className={`${selectorBaseClasses} cursor-pointer ${
                  form.homeVersion === 'v3'
                    ? 'border-primary bg-primary/10 text-primary shadow-sm dark:border-primary-light dark:bg-primary/10'
                    : 'border-slate-200 text-slate-600 hover:border-primary/60 dark:border-slate-700 dark:text-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="home-version"
                  value="v3"
                  checked={form.homeVersion === 'v3'}
                  onChange={() => handleHomeVersionSelect('v3')}
                  className="sr-only"
                />
                <span className="block text-sm font-semibold">Home Version 3</span>
                <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                  Editorial luxury with immersive lifestyle storytelling.
                </span>
              </label>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={cardVariants}
        className="rounded-3xl border border-slate-200/60 bg-white p-8 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/60"
      >
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Snapshot</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          A quick overview of your current storefront configuration.
        </p>
        <dl className="mt-6 grid gap-4 sm:grid-cols-3">
          {summaryItems.map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-200/60 bg-white/60 p-4 dark:border-slate-800/60 dark:bg-slate-900/40">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {item.label}
              </dt>
              <dd className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{item.value}</dd>
            </div>
          ))}
        </dl>
      </motion.div>

      <motion.div variants={cardVariants} className="flex items-center justify-end gap-3">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Selected theme: <span className="font-semibold text-slate-900 dark:text-white">{form.theme}</span> · Homepage:{' '}
          <span className="font-semibold text-slate-900 dark:text-white">{form.homeVersion.toUpperCase()}</span>
        </p>
        <motion.button
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save settings'}
        </motion.button>
      </motion.div>
    </motion.form>
  );
}
