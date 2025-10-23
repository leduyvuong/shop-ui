import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Loader from '../components/Loader.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import ReviewList from '../components/ReviewList.jsx';
import ReviewForm from '../components/ReviewForm.jsx';
import { readJson, writeJson } from '../utils/storage.js';
import { fetchCategoryProducts, fetchProduct, fetchProducts } from '../utils/api.js';
import { formatCurrency } from '../utils/format.js';

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [toast, setToast] = useState('');
  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();
  const { user } = useAuth();

  const productId = Number(id);
  const toastTimeout = useRef(null);

  useEffect(() => {
    let ignore = false;
    async function loadProduct() {
      setLoading(true);
      setError('');
      try {
        const data = await fetchProduct(id);
        if (!ignore) {
          setProduct(data);
          setQuantity(1);
          if (data?.categoryId) {
            fetchRelated(data.categoryId, data.id);
          } else if (data?.categorySlug) {
            fetchRelated(data.categorySlug, data.id, true);
          }
        }
      } catch (err) {
        console.error(err);
        if (!ignore) {
          setError(err.message ?? 'Product not found. Please try again later.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    async function fetchRelated(categoryValue, currentId, useSlug = false) {
      try {
        let relatedProducts = [];
        if (useSlug) {
          const { products: items } = await fetchProducts({ perPage: 100 });
          relatedProducts = items.filter(
            (entry) => entry.categorySlug === categoryValue || String(entry.categoryId ?? '') === String(categoryValue),
          );
        } else {
          const { products: items } = await fetchCategoryProducts(categoryValue, { perPage: 12 });
          relatedProducts = items;
        }
        if (!ignore) {
          const filtered = relatedProducts.filter((item) => item.id !== currentId);
          const random = filtered.sort(() => 0.5 - Math.random()).slice(0, 4);
          setRelated(random);
        }
      } catch (err) {
        console.error(err);
      }
    }

    loadProduct();
    setReviews(() => {
      const stored = readJson('reviews', []);
      return stored.filter((review) => review.productId === productId);
    });
    return () => {
      ignore = true;
    };
  }, [id, productId]);

  const ratingStars = useMemo(() => {
    if (!product) return null;
    const rounded = Math.round(product.rating?.rate ?? 0);
    return '★'.repeat(rounded).padEnd(5, '☆');
  }, [product]);

  const reviewSummary = useMemo(() => {
    if (reviews.length === 0) {
      return { average: 0, total: 0, stars: '☆☆☆☆☆' };
    }
    const total = reviews.length;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    const average = sum / total;
    const rounded = Math.round(average);
    return {
      average,
      total,
      stars: '★'.repeat(rounded).padEnd(5, '☆'),
    };
  }, [reviews]);

  const handleReviewSubmit = async ({ rating, comment }) => {
    if (!product) return;
    const allReviews = readJson('reviews', []);
    const newReview = {
      id: Date.now(),
      productId,
      user: user?.name || user?.email || 'Anonymous',
      rating: Number(rating),
      comment,
      created_at: new Date().toISOString(),
    };
    const updatedReviews = [newReview, ...allReviews];
    writeJson('reviews', updatedReviews);
    setReviews((prev) => [newReview, ...prev]);
    setToast('Thank you for your review!');
    if (toastTimeout.current) {
      clearTimeout(toastTimeout.current);
    }
    toastTimeout.current = setTimeout(() => setToast(''), 2500);
  };

  useEffect(
    () => () => {
      if (toastTimeout.current) {
        clearTimeout(toastTimeout.current);
      }
    },
    [],
  );

  const increase = () => setQuantity((qty) => Math.min(qty + 1, 10));
  const decrease = () => setQuantity((qty) => Math.max(1, qty - 1));

  if (loading) {
    return <Loader label="Loading product" />;
  }

  if (error || !product) {
    return (
      <div className="rounded-3xl border border-red-100 bg-red-50 p-6 text-center text-red-600">
        <p className="font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-16">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid gap-10 lg:grid-cols-2"
      >
        <div className="rounded-3xl bg-white p-8 shadow">
          <motion.img
            key={product.image}
            src={product.image}
            alt={product.title}
            className="mx-auto h-80 w-80 object-contain"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-widest text-primary">{product.category}</p>
            <h1 className="text-3xl font-bold text-slate-900">{product.title}</h1>
            <p className="text-sm leading-relaxed text-slate-600">{product.description}</p>
          </div>
          <div className="flex items-center gap-4 text-sm font-semibold text-amber-500">
            <span>{ratingStars}</span>
            <span className="text-slate-400">{product.rating?.count ?? 0} reviews</span>
          </div>
          <div className="flex items-baseline gap-3">
            <p className="text-3xl font-bold text-slate-900">{formatCurrency(product.price)}</p>
            {Number(product.originalPrice ?? 0) > Number(product.price ?? 0) && (
              <span className="text-sm font-semibold text-slate-400 line-through">
                {formatCurrency(product.originalPrice)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2">
              <button type="button" onClick={decrease} className="text-lg font-semibold text-slate-600">
                −
              </button>
              <span className="px-4 text-base font-semibold">{quantity}</span>
              <button type="button" onClick={increase} className="text-lg font-semibold text-slate-600">
                +
              </button>
            </div>
            <button
              type="button"
              onClick={() => addToCart(product, quantity)}
              className="rounded-full bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-primary-light"
            >
              Add to Cart
            </button>
            <button
              type="button"
              onClick={() => addToWishlist(product)}
              className="rounded-full border border-accent px-6 py-3 text-sm font-semibold uppercase tracking-wide text-accent transition hover:bg-accent hover:text-white"
            >
              Add to Wishlist
            </button>
          </div>
        </div>
      </motion.section>

      <section className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Customer Reviews</h2>
            <p className="mt-1 text-sm text-slate-500">Hear what other shoppers are saying about this product.</p>
          </div>
          <div className="flex items-center gap-3 rounded-full bg-white px-4 py-2 text-sm shadow-sm">
            <span className="text-lg font-semibold text-amber-500">{reviewSummary.stars}</span>
            <div className="text-left">
              <p className="text-sm font-semibold text-slate-900">{reviewSummary.average.toFixed(1)} / 5</p>
              <p className="text-xs text-slate-400">{reviewSummary.total} review{reviewSummary.total === 1 ? '' : 's'}</p>
            </div>
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <ReviewList reviews={reviews} />
          {user ? (
            <div className="space-y-4">
              <ReviewForm onSubmit={handleReviewSubmit} />
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
              <p className="font-semibold text-slate-800">Want to share your thoughts?</p>
              <p className="mt-2 text-sm text-slate-500">Log in to leave a review and help other shoppers.</p>
            </div>
          )}
        </div>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="w-full rounded-full bg-emerald-500 px-6 py-3 text-center text-sm font-semibold text-white shadow-lg"
          >
            {toast}
          </motion.div>
        )}
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900">Related Products</h2>
        {related.length === 0 ? (
          <p className="text-sm text-slate-500">No related products available right now.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
