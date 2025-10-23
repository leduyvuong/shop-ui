import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Loader from '../components/Loader.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { fetchCategories, fetchProducts } from '../utils/api.js';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([{ label: 'All', value: 'all' }]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    let ignore = false;
    async function loadProducts() {
      setLoading(true);
      setError('');
      try {
        const [{ products: loadedProducts }, fetchedCategories] = await Promise.all([
          fetchProducts({ perPage: 24 }),
          fetchCategories({ perPage: 20 }),
        ]);
        if (!ignore) {
          setProducts(loadedProducts);
          const uniqueCategories = new Map();
          fetchedCategories.forEach((category) => {
            const value = category.slug ?? String(category.id);
            if (!value) return;
            if (!uniqueCategories.has(value)) {
              uniqueCategories.set(value, {
                label: category.name,
                value,
                id: category.id,
              });
            }
          });
          setCategories([{ label: 'All', value: 'all' }, ...uniqueCategories.values()]);
        }
      } catch (err) {
        console.error(err);
        if (!ignore) {
          setError(err.message ?? 'Unable to load products. Please refresh to try again.');
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

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'all') return products;
    return products.filter(
      (product) =>
        product.categorySlug === selectedCategory || String(product.categoryId ?? '') === String(selectedCategory),
    );
  }, [products, selectedCategory]);

  return (
    <div className="mx-auto max-w-7xl">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-accent text-white">
        <div className="relative z-10 grid gap-6 px-6 py-16 sm:grid-cols-2 sm:px-10 lg:px-16">
          <div className="space-y-5">
            <motion.h1
              className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Elevate Your Everyday Style
            </motion.h1>
            <p className="text-base text-white/80 sm:text-lg">
              Shop our curated collections of fashion, electronics, and jewelry crafted to inspire confidence.
            </p>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
              <Link
                to="/#products"
                className="inline-flex items-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-primary transition hover:scale-105 hover:text-slate-900"
              >
                Shop Now
              </Link>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden sm:block"
          >
            <div className="h-full rounded-3xl bg-white/10 p-6 backdrop-blur">
              <p className="text-sm uppercase tracking-widest text-white/70">This Week&apos;s Highlight</p>
              <h2 className="mt-4 text-2xl font-semibold">Handpicked Essentials</h2>
              <p className="mt-3 text-sm text-white/70">Experience the comfort, quality, and style that define Modern Store.</p>
            </div>
          </motion.div>
        </div>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-16 top-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        </div>
      </section>

      <section id="products" className="mt-16 space-y-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Browse Categories</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category.value}
                type="button"
                onClick={() => setSelectedCategory(category.value)}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                  selectedCategory === category.value
                    ? 'bg-primary text-white shadow-lg shadow-primary/30'
                    : 'bg-white text-slate-600 shadow'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
        {loading && <Loader label="Fetching products" />}
        {error && !loading && (
          <div className="rounded-3xl border border-red-100 bg-red-50 p-6 text-red-600">
            <p className="font-semibold">{error}</p>
          </div>
        )}
        {!loading && !error && (
          <motion.div
            layout
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            transition={{ layout: { duration: 0.3 } }}
          >
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </motion.div>
        )}
      </section>
    </div>
  );
}
