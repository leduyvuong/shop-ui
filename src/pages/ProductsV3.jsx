import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import ProductFiltersDropdown from '../components/ProductFiltersDropdown.jsx';
import QuickViewModal from '../components/QuickViewModal.jsx';
import { formatCurrency } from '../utils/format.js';
import { fetchProduct, fetchProducts } from '../utils/api.js';

const PER_PAGE = 15;

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

const applyPriceFilters = (entries, { minPrice, maxPrice, onSale }) =>
  entries.filter((product) => {
    const price = Number(product.price ?? 0);
    if (minPrice && price < minPrice) return false;
    if (maxPrice && price > maxPrice) return false;
    if (onSale && !(Number(product.originalPrice ?? 0) > price)) return false;
    return true;
  });

export default function ProductsV3() {
  const [searchParams] = useSearchParams();
  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState('');
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [quickViewLoading, setQuickViewLoading] = useState(false);
  const sentinelRef = useRef(null);
  const observerRef = useRef(null);

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
        if (meta?.next_page != null) {
          setHasMore(Boolean(meta.next_page));
        } else if (meta?.nextPage != null) {
          setHasMore(Boolean(meta.nextPage));
        } else if (meta?.has_next != null) {
          setHasMore(Boolean(meta.has_next));
        } else if (meta?.hasNext != null) {
          setHasMore(Boolean(meta.hasNext));
        } else if (meta?.current_page != null && meta?.total_pages != null) {
          setHasMore(Number(meta.current_page) < Number(meta.total_pages));
        } else {
          setHasMore(fetchedProducts.length >= PER_PAGE);
        }
        setCurrentPage(page);
      } catch (error) {
        console.error(error);
        setError(error.message ?? 'Unable to load showcase products right now.');
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

  useEffect(() => {
    if (!sentinelRef.current) return;
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && hasMore && !loadingMore) {
            loadProducts(currentPage + 1);
          }
        });
      },
      { threshold: 0.4 },
    );
    observerRef.current.observe(sentinelRef.current);
    return () => {
      observerRef.current?.disconnect();
    };
  }, [currentPage, hasMore, loadProducts, loadingMore]);

  const openQuickView = async (productId) => {
    setQuickViewOpen(true);
    setQuickViewLoading(true);
    try {
      const data = await fetchProduct(productId);
      setQuickViewProduct(data);
    } catch (error) {
      console.error(error);
    } finally {
      setQuickViewLoading(false);
    }
  };

  const closeQuickView = () => {
    setQuickViewOpen(false);
    setQuickViewProduct(null);
  };

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,_rgba(244,114,182,0.4),_transparent_50%),radial-gradient(circle_at_bottom,_rgba(16,185,129,0.25),_transparent_50%)]" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-6 py-16 sm:px-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.6em] text-emerald-300/90">Explore the Collection</p>
            <h1 className="text-4xl font-semibold sm:text-5xl">Elevate your lifestyle</h1>
            <p className="max-w-xl text-sm text-slate-200">
              Discover an editorial experience with immersive product photography, curated to inspire your next look.
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="self-start rounded-full bg-white/10 px-5 py-3 text-sm font-medium backdrop-blur"
          >
            Free worldwide shipping on orders over $120
          </motion.div>
        </div>
      </section>

      <div className="sticky top-24 z-30 flex justify-end">
        <ProductFiltersDropdown className="shadow-lg" label="Filter & Sort ▾" />
      </div>

      {loading && !products.length ? (
        <div className="mx-auto max-w-6xl space-y-4">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="h-40 animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-800/80"
            />
          ))}
        </div>
      ) : (
        <div className="mx-auto max-w-6xl">
          <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
            <AnimatePresence>
              {products.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.35 }}
                  className="mb-6 break-inside-avoid overflow-hidden rounded-3xl bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl dark:bg-slate-900/70"
                >
                  <div className="relative group">
                    <img src={product.image} alt={product.title} className="h-80 w-full object-cover" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="absolute inset-x-0 bottom-0 p-6 text-white opacity-0 transition-opacity group-hover:opacity-100">
                      <h3 className="text-lg font-semibold">{product.title}</h3>
                      <p className="text-sm text-slate-200">{formatCurrency(product.price ?? 0)}</p>
                      <button
                        type="button"
                        onClick={() => openQuickView(product.id)}
                        className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-wide backdrop-blur transition hover:bg-white/40"
                      >
                        Quick view
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {error && (
        <p className="text-center text-sm text-rose-500 dark:text-rose-300">{error}</p>
      )}

      <div ref={sentinelRef} className="h-12" />
      {loadingMore && (
        <div className="flex items-center justify-center gap-3 text-sm text-slate-500 dark:text-slate-400">
          <span className="inline-flex h-3 w-3 animate-ping rounded-full bg-primary" />
          Loading more inspirations…
        </div>
      )}

      {!hasMore && products.length > 0 && (
        <p className="text-center text-sm text-slate-500 dark:text-slate-400">You&apos;ve reached the end of the showcase.</p>
      )}

      <QuickViewModal isOpen={quickViewOpen} onClose={closeQuickView} product={quickViewProduct} loading={quickViewLoading} />
    </div>
  );
}
