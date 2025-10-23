import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import SearchBar from '../components/SearchBar.jsx';
import SearchResults from '../components/SearchResults.jsx';
import { readJson, upsertUniqueValue, writeJson } from '../utils/storage.js';

const SEARCH_HISTORY_KEY = 'searchHistory';
const HISTORY_EVENT = 'shop-search-history-updated';
const CATEGORY_OPTIONS = [
  { label: 'All Categories', value: 'all' },
  { label: "Men's Fashion", value: "men's clothing" },
  { label: "Women's Fashion", value: "women's clothing" },
  { label: 'Electronics', value: 'electronics' },
  { label: 'Jewelry', value: 'jewelery' },
];

const SORT_OPTIONS = [
  { label: 'Relevance', value: 'relevance' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Rating: High to Low', value: 'rating-desc' },
];

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';
  const initialCategory = searchParams.get('category') ?? 'all';
  const initialSort = searchParams.get('sort') ?? 'relevance';
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState(initialSort);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState(() => readJson(SEARCH_HISTORY_KEY, []));

  const broadcastHistoryUpdate = (entries) => {
    setHistory(entries);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event(HISTORY_EVENT));
    }
  };

  useEffect(() => {
    let ignore = false;
    async function fetchProducts() {
      setLoading(true);
      setError('');
      try {
        const response = await fetch('https://fakestoreapi.com/products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        if (!ignore) {
          setProducts(data);
        }
      } catch (err) {
        console.error(err);
        if (!ignore) {
          setError('Unable to search products right now. Please try again later.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchProducts();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 350);
    return () => clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (category && category !== 'all') params.set('category', category);
    if (sort && sort !== 'relevance') params.set('sort', sort);
    setSearchParams(params, { replace: true });
  }, [query, category, sort, setSearchParams]);

  useEffect(() => {
    if (!debouncedQuery) return;
    const updated = upsertUniqueValue(SEARCH_HISTORY_KEY, debouncedQuery);
    broadcastHistoryUpdate(updated);
  }, [debouncedQuery]);

  const filteredProducts = useMemo(() => {
    let entries = [...products];
    if (debouncedQuery) {
      const normalized = debouncedQuery.toLowerCase();
      entries = entries.filter((product) =>
        product.title.toLowerCase().includes(normalized) || product.category.toLowerCase().includes(normalized),
      );
    }
    if (category !== 'all') {
      entries = entries.filter((product) => product.category === category);
    }
    switch (sort) {
      case 'price-asc':
        entries.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        entries.sort((a, b) => b.price - a.price);
        break;
      case 'rating-desc':
        entries.sort((a, b) => b.rating.rate - a.rating.rate);
        break;
      default:
        break;
    }
    return entries;
  }, [products, debouncedQuery, category, sort]);

  const handleSubmit = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setQuery(trimmed);
    setDebouncedQuery(trimmed);
    const updated = upsertUniqueValue(SEARCH_HISTORY_KEY, trimmed);
    broadcastHistoryUpdate(updated);
  };

  const handleSuggestionSelect = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setQuery(trimmed);
    setDebouncedQuery(trimmed);
    const updated = upsertUniqueValue(SEARCH_HISTORY_KEY, trimmed);
    broadcastHistoryUpdate(updated);
  };

  return (
    <div className="mx-auto max-w-7xl">
      <section className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <h1 className="text-3xl font-bold text-slate-900">Search Products</h1>
          <p className="mt-2 text-sm text-slate-500">Find the perfect item by keyword, category, or rating.</p>
        </motion.div>
        <div className="space-y-6">
          <SearchBar
            value={query}
            onChange={setQuery}
            onSubmit={handleSubmit}
            suggestions={history}
            onSuggestionSelect={handleSuggestionSelect}
            placeholder='Try "leather jacket" or "electronics"'
          />
          {history.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-600">Recent searches:</span>
              {history.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleSuggestionSelect(item)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-primary hover:text-primary"
                >
                  {item}
                </button>
              ))}
              <button
                type="button"
                className="ml-auto text-xs font-semibold text-primary hover:text-primary-light"
                onClick={() => {
                  writeJson(SEARCH_HISTORY_KEY, []);
                  broadcastHistoryUpdate([]);
                }}
              >
                Clear history
              </button>
            </div>
          )}
        </div>
        <div className="grid gap-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:grid-cols-3 sm:items-center">
          <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
            Category
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 focus:border-primary focus:bg-white focus:outline-none"
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700 sm:col-span-2">
            Sort by
            <div className="grid gap-3 sm:grid-cols-3">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSort(option.value)}
                  className={`rounded-2xl border px-4 py-2 text-sm font-medium transition ${
                    sort === option.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-primary/60'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </label>
        </div>
      </section>

      <section className="mt-10 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Search Results</h2>
          <p className="text-xs text-slate-400">{filteredProducts.length} item{filteredProducts.length === 1 ? '' : 's'} found</p>
        </div>
        <SearchResults products={filteredProducts} loading={loading} error={error} query={debouncedQuery} />
      </section>
    </div>
  );
}
