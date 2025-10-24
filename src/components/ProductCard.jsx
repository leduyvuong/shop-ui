import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { formatCurrency } from '../utils/format.js';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { addToWishlist, items } = useWishlist();
  const isInWishlist = items.some((item) => item.id === product.id);
  const ratingValue = Math.round(product.rating?.rate ?? 0);
  const ratingStars = '★'.repeat(ratingValue).padEnd(5, '☆');

  const hasDiscount = Number(product.originalPrice ?? 0) > Number(product.price ?? 0);

  return (
    <motion.div
      whileHover={{ y: -6 }}
      className="flex h-full flex-col rounded-3xl border border-slate-100 bg-white p-4 shadow-sm transition hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
    >
      <Link
        to={`/products/${product.id}`}
        className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl bg-slate-50 dark:bg-slate-800/60"
      >
        <motion.img
          src={product.image}
          alt={product.title}
          className="h-40 w-40 object-contain"
          loading="lazy"
          whileHover={{ scale: 1.05 }}
        />
      </Link>
      <div className="mt-4 flex flex-1 flex-col">
        <Link to={`/products/${product.id}`} className="line-clamp-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
          {product.title}
        </Link>
        <p className="mt-2 text-xs uppercase tracking-wide text-primary dark:text-primary-light">{product.category}</p>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(product.price)}</span>
            {hasDiscount && (
              <span className="text-xs font-semibold text-slate-400 line-through dark:text-slate-500">
                {formatCurrency(product.originalPrice)}
              </span>
            )}
          </div>
          <span className="flex items-center gap-1 text-xs text-amber-500">
            <span>{ratingStars}</span>
            <span className="text-slate-400 dark:text-slate-500">({product.rating?.count ?? 0})</span>
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => addToCart(product, 1)}
            className="rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-primary-light"
          >
            Add to Cart
          </button>
          <button
            type="button"
            onClick={() => addToWishlist(product)}
            className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
              isInWishlist
                ? 'border-accent bg-accent text-white'
                : 'border-slate-200 text-slate-600 hover:border-accent hover:text-accent dark:border-slate-700 dark:text-slate-300'
            }`}
          >
            {isInWishlist ? 'Wishlisted' : 'Add to Wishlist'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
