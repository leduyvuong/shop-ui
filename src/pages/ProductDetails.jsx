import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Loader from '../components/Loader.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();

  useEffect(() => {
    let ignore = false;
    async function fetchProduct() {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`https://fakestoreapi.com/products/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }
        const data = await response.json();
        if (!ignore) {
          setProduct(data);
          setQuantity(1);
          fetchRelated(data.category, data.id);
        }
      } catch (err) {
        console.error(err);
        if (!ignore) {
          setError('Product not found. Please try again later.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    async function fetchRelated(category, currentId) {
      try {
        const response = await fetch('https://fakestoreapi.com/products');
        if (!response.ok) {
          throw new Error('Failed to load related products');
        }
        const data = await response.json();
        if (!ignore) {
          const filtered = data.filter((item) => item.category === category && item.id !== currentId);
          const random = filtered.sort(() => 0.5 - Math.random()).slice(0, 4);
          setRelated(random);
        }
      } catch (err) {
        console.error(err);
      }
    }

    fetchProduct();
    return () => {
      ignore = true;
    };
  }, [id]);

  const ratingStars = useMemo(() => {
    if (!product) return null;
    const rounded = Math.round(product.rating.rate);
    return '★'.repeat(rounded).padEnd(5, '☆');
  }, [product]);

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
            <span className="text-slate-400">{product.rating.count} reviews</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">${product.price.toFixed(2)}</p>
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
