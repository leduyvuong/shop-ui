import { useMemo } from 'react';

export default function CategoryDropdown({
  categories = [],
  value = '',
  onChange,
  className = '',
  placeholder = 'All categories',
}) {
  const options = useMemo(() => {
    if (!Array.isArray(categories)) return [];
    return categories.map((category) => ({
      label: category.name ?? category.label ?? 'Unnamed category',
      value: category.slug ?? String(category.id ?? category.value ?? ''),
    }));
  }, [categories]);

  return (
    <label className={`flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200 ${className}`}>
      <span className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Category</span>
      <select
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
