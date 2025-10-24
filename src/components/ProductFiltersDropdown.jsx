import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import CategoryDropdown from './CategoryDropdown.jsx';
import { fetchCategories } from '../utils/api.js';

const SORT_OPTIONS = [
  { label: 'Newest arrivals', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Rating: High to Low', value: 'rating-desc' },
  { label: 'Rating: Low to High', value: 'rating-asc' },
];

const dropdownVariants = {
  hidden: { opacity: 0, y: -6 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
};

const initialForm = {
  category: '',
  sort: 'newest',
  minPrice: '',
  maxPrice: '',
  onSale: false,
};

export default function ProductFiltersDropdown({ label = 'Filters & Sort', className = '', onApply, onClear }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [open, setOpen] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(() => ({ ...initialForm }));

  useEffect(() => {
    const params = Object.fromEntries(searchParams.entries());
    setForm({
      category: params.category ?? params.category_id ?? '',
      sort: params.sort ?? 'newest',
      minPrice: params.min_price ?? '',
      maxPrice: params.max_price ?? '',
      onSale: params.on_sale === '1' || params.on_sale === 'true',
    });
  }, [searchParams]);

  useEffect(() => {
    if (!open || categories.length > 0) return;
    let ignore = false;
    async function loadCategories() {
      setLoadingCategories(true);
      try {
        const fetched = await fetchCategories({ perPage: 50 });
        if (!ignore) {
          setCategories(fetched);
        }
      } catch (error) {
        console.error('Failed to fetch categories', error);
      } finally {
        if (!ignore) {
          setLoadingCategories(false);
        }
      }
    }
    loadCategories();
    return () => {
      ignore = true;
    };
  }, [open, categories.length]);

  const appliedFiltersCount = useMemo(() => {
    let count = 0;
    if (form.category) count += 1;
    if (form.sort && form.sort !== 'newest') count += 1;
    if (form.minPrice || form.maxPrice) count += 1;
    if (form.onSale) count += 1;
    return count;
  }, [form]);

  const handleApply = () => {
    const params = new URLSearchParams(searchParams);
    if (form.category) {
      params.set('category', form.category);
    } else {
      params.delete('category');
    }

    if (form.sort && form.sort !== 'newest') {
      params.set('sort', form.sort);
    } else {
      params.delete('sort');
    }

    if (form.minPrice) {
      params.set('min_price', form.minPrice);
    } else {
      params.delete('min_price');
    }

    if (form.maxPrice) {
      params.set('max_price', form.maxPrice);
    } else {
      params.delete('max_price');
    }

    if (form.onSale) {
      params.set('on_sale', '1');
    } else {
      params.delete('on_sale');
    }

    params.delete('page');
    setSearchParams(params, { replace: true });
    setOpen(false);
    onApply?.({ ...form });
  };

  const handleClear = () => {
    setForm({ ...initialForm });
    const params = new URLSearchParams(searchParams);
    ['category', 'sort', 'min_price', 'max_price', 'on_sale', 'page'].forEach((key) => params.delete(key));
    setSearchParams(params, { replace: true });
    setOpen(false);
    onClear?.();
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-primary hover:text-primary dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:hover:border-primary-light dark:hover:text-primary-light"
      >
        {label}
        {appliedFiltersCount > 0 && (
          <span className="ml-1 inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-primary/10 px-2 text-xs font-semibold text-primary dark:bg-primary/20 dark:text-primary-light">
            {appliedFiltersCount}
          </span>
        )}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`}
          aria-hidden
        >
          <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.086l3.71-3.855a.75.75 0 1 1 1.08 1.04l-4.24 4.405a.75.75 0 0 1-1.08 0L5.21 8.27a.75.75 0 0 1 .02-1.06z" />
        </svg>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            key="filters-dropdown"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={dropdownVariants}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-12 z-40 w-screen max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900 md:max-w-md"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Refine results</h3>
              <button
                type="button"
                onClick={handleClear}
                className="text-xs font-semibold text-primary hover:text-primary-light"
              >
                Clear all
              </button>
            </div>
            <div className="mt-4 space-y-4">
              <CategoryDropdown
                categories={categories}
                value={form.category}
                onChange={(value) => setForm((prev) => ({ ...prev, category: value }))}
                className="text-slate-700"
              />
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                <span className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Sort by</span>
                <select
                  value={form.sort}
                  onChange={(event) => setForm((prev) => ({ ...prev, sort: event.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                  <span className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Min price</span>
                  <input
                    type="number"
                    min="0"
                    value={form.minPrice}
                    onChange={(event) => setForm((prev) => ({ ...prev, minPrice: event.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    placeholder="0"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                  <span className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Max price</span>
                  <input
                    type="number"
                    min="0"
                    value={form.maxPrice}
                    onChange={(event) => setForm((prev) => ({ ...prev, maxPrice: event.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    placeholder="500"
                  />
                </label>
              </div>
              <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 dark:bg-slate-800/50 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={form.onSale}
                  onChange={(event) => setForm((prev) => ({ ...prev, onSale: event.target.checked }))}
                  className="h-4 w-4 rounded border border-slate-300 text-primary focus:ring-primary dark:border-slate-600"
                />
                <span>On sale only</span>
              </label>
            </div>
            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={handleApply}
                className="flex-1 rounded-full bg-primary px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white shadow transition hover:bg-primary-light"
                disabled={loadingCategories}
              >
                Apply
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="flex-1 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-slate-600 transition hover:border-primary hover:text-primary dark:border-slate-700 dark:text-slate-200"
              >
                Clear
              </button>
            </div>
            {loadingCategories && (
              <p className="mt-4 text-xs text-slate-400">Loading categories…</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
