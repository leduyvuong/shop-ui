import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { formatCurrency } from '../utils/format.js';
import { useCart } from '../context/CartContext.jsx';

export default function QuickViewModal({ isOpen, onClose, product, loading = false }) {
  const { addToCart } = useCart();

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Close quick view"
            className="absolute inset-0 h-full w-full bg-slate-900/70 backdrop-blur"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 22, stiffness: 180 }}
            className="relative z-10 w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                {loading ? 'Loading product…' : product?.title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/40 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                ×
              </button>
            </div>
            <div className="grid gap-6 px-6 pb-8 pt-6 sm:grid-cols-2">
              <motion.div layout className="flex flex-col gap-4">
                <div className="flex items-center justify-center rounded-2xl bg-slate-50 p-6 dark:bg-slate-800/50">
                  {loading ? (
                    <span className="h-40 w-40 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-700" />
                  ) : (
                    <img
                      src={product?.image}
                      alt={product?.title}
                      className="h-48 w-48 object-contain"
                      loading="lazy"
                    />
                  )}
                </div>
                <div className="flex gap-3 overflow-x-auto">
                  {product?.images?.slice(0, 6).map((image) => {
                    const src = image?.image_url ?? image?.url ?? image?.src ?? image;
                    return (
                      <img
                        key={src}
                        src={src}
                        alt="Product preview"
                        className="h-16 w-16 rounded-xl border border-slate-200 object-cover dark:border-slate-700"
                        loading="lazy"
                      />
                    );
                  })}
                </div>
              </motion.div>
              <div className="space-y-4">
                {!loading && (
                  <>
                    <p className="text-sm text-slate-500 dark:text-slate-300">{product?.description}</p>
                    <div className="flex items-center gap-4">
                      <span className="text-3xl font-bold text-primary dark:text-primary-light">
                        {formatCurrency(product?.price ?? 0)}
                      </span>
                      {product?.originalPrice && product.originalPrice > product.price && (
                        <span className="text-sm text-slate-400 line-through dark:text-slate-500">
                          {formatCurrency(product.originalPrice)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-300">
                      <span>Brand: {product?.brand || 'N/A'}</span>
                      {product?.sku && <span>SKU: {product.sku}</span>}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (!product) return;
                        addToCart(product, 1);
                        onClose?.();
                      }}
                      className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-primary-light"
                    >
                      Add to cart
                    </button>
                  </>
                )}
                {loading && <p className="text-sm text-slate-500 dark:text-slate-300">Fetching product details…</p>}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
