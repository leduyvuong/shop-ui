import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function SearchBar({
  value,
  onChange,
  onSubmit,
  suggestions = [],
  onSuggestionSelect,
  placeholder = 'Search products, categories...'
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!value) {
      setOpen(false);
    }
  }, [value]);

  const filteredSuggestions = useMemo(() => {
    if (!suggestions || suggestions.length === 0) return [];
    if (!value) return suggestions.slice(0, 6);
    const normalized = value.toLowerCase();
    return suggestions
      .filter((entry) => entry.toLowerCase().includes(normalized))
      .slice(0, 6);
  }, [suggestions, value]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const keyword = value.trim();
    if (!keyword) return;
    onSubmit?.(keyword);
    setOpen(false);
  };

  const handleSuggestionClick = (suggestion) => {
    onSuggestionSelect?.(suggestion);
    setOpen(false);
  };

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm focus-within:border-primary">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-slate-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35m0 0A7.5 7.5 0 1 0 5.65 5.65a7.5 7.5 0 0 0 10.6 10.6Z" />
        </svg>
        <input
          type="search"
          value={value}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onChange={(event) => onChange?.(event.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
        />
        <button type="submit" className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-primary-light">
          Search
        </button>
      </form>
      <AnimatePresence>
        {open && filteredSuggestions.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 right-0 z-40 mt-2 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl"
          >
            {filteredSuggestions.map((suggestion) => (
              <li key={suggestion}>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-sm text-slate-600 transition hover:bg-slate-50"
                >
                  <span>{suggestion}</span>
                  <span className="text-xs text-primary">Search</span>
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
