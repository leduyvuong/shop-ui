import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

export default function Search() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [sortOrder, setSortOrder] = useState('relevance');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function loadProducts() {
      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.get('https://fakestoreapi.com/products');
        if (!ignore) {
          setProducts(data);
        }
      } catch (err) {
        if (!ignore) {
          setError('Unable to load products at this time.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      ignore = true;
    };
  }, []);

  const categories = useMemo(() => {
    const list = Array.from(new Set(products.map((product) => product.category)));
    return ['all', ...list];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const search = query.toLowerCase();
    let result = products.filter((product) => {
      const matchesQuery = !search ||
        product.title.toLowerCase().includes(search) ||
        product.category.toLowerCase().includes(search);
      const matchesCategory = category === 'all' || product.category === category;
      return matchesQuery && matchesCategory;
    });

    if (sortOrder === 'price-asc') {
      result = [...result].sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortOrder === 'price-desc') {
      result = [...result].sort((a, b) => Number(b.price) - Number(a.price));
    }

    return result;
  }, [products, query, category, sortOrder]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Search</label>
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search products by name or category"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            />
            <span className="pointer-events-none absolute bottom-2.5 right-3 text-lg text-slate-400">🔎</span>
          </div>
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            <div className="sm:w-48">
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Category</label>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item === 'all' ? 'All categories' : item}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:w-48">
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Sort</label>
              <select
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                <option value="relevance">Relevance</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          Fetching product catalogue…
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Showing {filteredProducts.length} result{filteredProducts.length === 1 ? '' : 's'}
            {query ? ` for "${query}"` : ''}
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-indigo-400 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="relative h-44 overflow-hidden">
                  <img src={product.image} alt={product.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                  <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow">
                    {product.category}
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{product.title}</h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <span className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">${Number(product.price).toFixed(2)}</span>
                    <span className="text-sm font-medium text-amber-500">{product.rating?.rate ?? 0}★</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {!filteredProducts.length && (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
              No products match the current search. Try adjusting your filters.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

