import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';

export default function Favorites() {
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const empty = useMemo(() => items.length === 0, [items]);

  if (empty) {
    return (
      <div className="mx-auto max-w-4xl rounded-3xl border border-slate-100 bg-white p-10 text-center shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900">No favorites yet</h2>
        <p className="mt-3 text-sm text-slate-500">Tap the heart on a product to save it for later.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <h1 className="text-3xl font-bold text-slate-900">Your Favorites</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((product) => (
          <motion.div
            key={product.id}
            whileHover={{ y: -6 }}
            className="flex h-full flex-col rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-xl"
          >
            <img src={product.image} alt={product.title} className="h-40 w-full rounded-2xl bg-slate-50 object-contain p-6" />
            <div className="mt-4 flex flex-1 flex-col">
              <h3 className="line-clamp-2 text-sm font-semibold text-slate-900">{product.title}</h3>
              <p className="mt-2 text-xs uppercase tracking-wide text-primary">{product.category}</p>
              <p className="mt-3 text-lg font-bold text-slate-900">${product.price.toFixed(2)}</p>
              <div className="mt-4 grid grid-cols-1 gap-3">
                <button
                  type="button"
                  onClick={() => addToCart(product, 1)}
                  className="w-full rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-primary-light"
                >
                  Add to Cart
                </button>
                <button
                  type="button"
                  onClick={() => removeFromWishlist(product.id)}
                  className="w-full rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-red-200 hover:text-red-500"
                >
                  Remove
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
