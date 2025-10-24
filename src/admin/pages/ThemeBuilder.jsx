import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useAdminContext } from '../context/AdminContext.jsx';

const fonts = ['Inter', 'Poppins', 'Roboto', 'Montserrat', 'Lora', 'Space Grotesk'];

const defaultPreviewProduct = {
  title: 'Aurora Comfort Chair',
  description: 'Ergonomic, breathable mesh chair with adaptive lumbar support.',
  price: '$189.00',
};

const transitions = {
  layout: { duration: 0.25, ease: 'easeOut' },
};

const colorVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (index) => ({ opacity: 1, y: 0, transition: { delay: index * 0.05, duration: 0.35 } }),
};

const getContrastColor = (hex) => {
  if (!hex || typeof hex !== 'string') return '#0f172a';
  const sanitized = hex.replace('#', '');
  if (sanitized.length !== 6) return '#0f172a';
  const r = parseInt(sanitized.slice(0, 2), 16) / 255;
  const g = parseInt(sanitized.slice(2, 4), 16) / 255;
  const b = parseInt(sanitized.slice(4, 6), 16) / 255;
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.55 ? '#0f172a' : '#f8fafc';
};

export default function ThemeBuilder() {
  const { themeSettings, updateThemeSettings, resetThemeSettings } = useTheme();
  const { showToast } = useAdminContext();
  const [draft, setDraft] = useState(themeSettings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft(themeSettings);
  }, [themeSettings]);

  const previewStyles = useMemo(
    () => ({
      fontFamily: `${draft.font}, var(--theme-font-fallback)`,
      '--preview-primary': draft.primaryColor,
      '--preview-secondary': draft.secondaryColor,
      '--preview-bg': draft.backgroundColor,
      '--preview-radius': `${draft.radius}px`,
      '--preview-text': getContrastColor(draft.backgroundColor),
    }),
    [draft],
  );

  const handleFieldChange = (key, value) => {
    setDraft((prev) => {
      const next = { ...prev, [key]: value };
      updateThemeSettings(next);
      return next;
    });
  };

  const handleSave = (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      updateThemeSettings(draft);
      showToast?.('Theme settings saved successfully');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    resetThemeSettings();
    showToast?.('Theme settings restored to defaults', 'info');
  };

  const inputClassName =
    'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100';

  return (
    <motion.form
      onSubmit={handleSave}
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
      className="space-y-8"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Theme builder</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Customise storefront colors, typography, and surfaces. Changes preview instantly and are saved locally.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-white"
          >
            <span aria-hidden>↺</span>
            Reset to default
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            <span aria-hidden>💾</span>
            <span>{saving ? 'Saving…' : 'Save changes'}</span>
          </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <motion.section
          variants={colorVariants}
          custom={0}
          className="space-y-6 rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/60"
        >
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Brand palette</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Pick accent colors for primary CTAs, highlights, and supporting elements.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[{ key: 'primaryColor', label: 'Primary color' }, { key: 'secondaryColor', label: 'Secondary color' }, { key: 'backgroundColor', label: 'Background color' }].map((field, index) => (
              <motion.label key={field.key} variants={colorVariants} custom={index} className="block space-y-3">
                <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {field.label}
                </span>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={draft[field.key]}
                    onChange={(event) => handleFieldChange(field.key, event.target.value)}
                    className="h-12 w-20 cursor-pointer rounded-xl border border-slate-200 dark:border-slate-700"
                    aria-label={field.label}
                  />
                  <input
                    type="text"
                    value={draft[field.key]}
                    onChange={(event) => handleFieldChange(field.key, event.target.value)}
                    className={inputClassName}
                  />
                </div>
              </motion.label>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-3">
              <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Font family
              </span>
              <select
                value={draft.font}
                onChange={(event) => handleFieldChange('font', event.target.value)}
                className={`${inputClassName} appearance-none`}
              >
                {fonts.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-3">
              <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Border radius ({draft.radius}px)
              </span>
              <input
                type="range"
                min="0"
                max="32"
                value={draft.radius}
                onChange={(event) => handleFieldChange('radius', Number(event.target.value))}
                className="w-full"
              />
            </label>
          </div>
        </motion.section>

        <motion.section
          variants={colorVariants}
          custom={1}
          style={previewStyles}
          className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-[var(--preview-bg)] p-6 shadow-lg dark:border-slate-700/60"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transitions.layout}
            className="flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--preview-secondary)]">Live preview</p>
                <h3 className="mt-2 text-2xl font-semibold" style={{ color: 'var(--preview-text)' }}>
                  Aurora Collective
                </h3>
              </div>
              <button
                type="button"
                className="rounded-full px-4 py-2 text-xs font-semibold text-white shadow"
                style={{ backgroundColor: 'var(--preview-primary)', borderRadius: 'calc(var(--preview-radius) - 4px)' }}
              >
                Shop now
              </button>
            </div>

            <div
              className="rounded-3xl border bg-white/70 p-6 shadow-sm backdrop-blur"
              style={{
                borderColor: 'rgba(15, 23, 42, 0.06)',
                borderRadius: 'var(--preview-radius)',
                color: '#0f172a',
              }}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--preview-secondary)]">Featured product</p>
              <h4 className="mt-3 text-xl font-semibold" style={{ color: 'var(--preview-text)' }}>
                {defaultPreviewProduct.title}
              </h4>
              <p className="mt-2 text-sm text-slate-600" style={{ fontFamily: 'var(--theme-font-family)' }}>
                {defaultPreviewProduct.description}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-lg font-semibold text-[var(--preview-primary)]">{defaultPreviewProduct.price}</span>
                <button
                  type="button"
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-white shadow"
                  style={{ backgroundColor: 'var(--preview-secondary)', borderRadius: 'var(--preview-radius)' }}
                >
                  Add to cart
                </button>
              </div>
            </div>
          </motion.div>
        </motion.section>
      </div>
    </motion.form>
  );
}
