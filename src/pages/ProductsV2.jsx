import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProductCard from '../components/ProductCard.jsx';
import ProductFiltersDropdown from '../components/ProductFiltersDropdown.jsx';
import Loader from '../components/Loader.jsx';
import { fetchProducts } from '../utils/api.js';

const PER_PAGE = 12;

const inferHasMore = (meta, fetchedCount) => {
  if (meta?.next_page != null) return Boolean(meta.next_page);
  if (meta?.nextPage != null) return Boolean(meta.nextPage);
  if (meta?.has_next != null) return Boolean(meta.has_next);
  if (meta?.hasNext != null) return Boolean(meta.hasNext);
  if (meta?.current_page != null && meta?.total_pages != null) {
    return Number(meta.current_page) < Number(meta.total_pages);
  }
  if (meta?.page != null && meta?.total_pages != null) {
    return Number(meta.page) < Number(meta.total_pages);
  }
  return fetchedCount >= PER_PAGE;
};

const applySort = (entries, sort) => {
  if (!sort) return entries;
  const items = [...entries];
  switch (sort) {
    case 'price-asc':
      items.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
      break;
    case 'price-desc':
      items.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
      break;
    case 'rating-desc':
      items.sort((a, b) => (b.rating?.rate ?? 0) - (a.rating?.rate ?? 0));
      break;
    case 'rating-asc':
      items.sort((a, b) => (a.rating?.rate ?? 0) - (b.rating?.rate ?? 0));
      break;
    default:
      break;
  }
  return items;
};

const applyPriceFilters = (entries, { minPrice, maxPrice, onSale }) => {
  return entries.filter((product) => {
    const price = Number(product.price ?? 0);
    if (minPrice && price < minPrice) return false;
    if (maxPrice && price > maxPrice) return false;
    if (onSale && !(Number(product.originalPrice ?? 0) > price)) return false;
    return true;
  });
};

const parseFilters = (params) => {
  const minPriceValue = Number(params.get('min_price'));
  const maxPriceValue = Number(params.get('max_price'));
  return {
    category: params.get('category') ?? '',
    sort: params.get('sort') ?? 'newest',
    minPrice: Number.isNaN(minPriceValue) ? null : minPriceValue,
    maxPrice: Number.isNaN(maxPriceValue) ? null : maxPriceValue,
    onSale: params.get('on_sale') === '1' || params.get('on_sale') === 'true',
  };
};

export default function ProductsV2() {
  const [searchParams] = useSearchParams();
  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState('');

  const loadProducts = useCallback(
    async (page = 1, replace = false) => {
      if (replace) {
        setLoading(true);
        setError('');
      } else {
        setLoadingMore(true);
      }
      try {
        const { products: fetchedProducts, meta } = await fetchProducts({
          perPage: PER_PAGE,
          page,
          categorySlug: filters.category || undefined,
          sort: filters.sort && filters.sort !== 'newest' ? filters.sort : undefined,
        });
        const refined = applyPriceFilters(applySort(fetchedProducts, filters.sort), filters);
        setProducts((prev) => (replace ? refined : [...prev, ...refined]));
        setHasMore(inferHasMore(meta, fetchedProducts.length));
        setCurrentPage(page);
      } catch (err) {
        console.error(err);
        setError(err.message ?? 'Unable to load products right now.');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [filters],
  );

  useEffect(() => {
    setProducts([]);
    setHasMore(true);
    loadProducts(1, true);
  }, [filters, loadProducts]);

  const handleLoadMore = () => {
    if (loadingMore || !hasMore) return;
    loadProducts(currentPage + 1, false);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-6 rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-violet-50 p-8 shadow-sm dark:from-slate-900/40 dark:via-slate-900 dark:to-slate-900/60 md:flex-row md:items-center md:justify-between"
      >
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.4em] text-emerald-500 dark:text-emerald-300">Curated picks</p>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">All Products</h1>
          <p className="max-w-xl text-sm text-slate-600 dark:text-slate-300">
            Browse our complete catalog with modern filtering controls. Fine tune your discovery with categories, smart sorting, and price bands.
          </p>
        </div>
        <ProductFiltersDropdown className="md:self-start" />
      </motion.div>

      {error && (
        <div className="rounded-3xl border border-rose-100 bg-rose-50 p-6 text-sm text-rose-600 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200">
          {error}
        </div>
      )}

      {loading && !products.length ? (
        <Loader label="Loading products" />
      ) : (
        <motion.div
          layout
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          transition={{ layout: { duration: 0.3 } }}
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </motion.div>
      )}

      {!loading && !products.length && !error && (
        <p className="rounded-3xl border border-slate-100 bg-white p-10 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/60">
          No products found. Adjust your filters to discover more items.
        </p>
      )}

      <div className="flex justify-center">
        {hasMore ? (
          <motion.button
            type="button"
            onClick={handleLoadMore}
            disabled={loadingMore}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 via-violet-500 to-rose-500 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingMore ? 'Loading…' : 'Load more'}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-4 w-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 0 0 12 4.5V4m0 0V1m0 3a8.001 8.001 0 0 0-7.938 6.5M20 20v-5h-.581m0 0A8.003 8.003 0 0 1 4 15.5V16m0 0v3m0-3a8.003 8.003 0 0 1 7.938-6.5" />
            </svg>
          </motion.button>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">You&apos;ve reached the end of the catalog.</p>
        )}
      </div>
    </div>
  );
}
