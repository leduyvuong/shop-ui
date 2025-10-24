import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Loader from '../components/Loader.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { fetchCategories, fetchProducts } from '../utils/api.js';
import { readJson } from '../utils/storage.js';

const placeholderPromotions = [
  {
    id: 'new-arrivals',
    title: 'New Season Arrivals',
    description: 'Discover the freshest drops handpicked by our stylists.',
    cta: 'Explore Collection',
    href: '/search?q=new',
    accent: 'bg-emerald-500/15 text-emerald-400 dark:text-emerald-300',
  },
  {
    id: 'weekend-sale',
    title: 'Weekend Flash Sale',
    description: 'Up to 30% off electronics essentials. Limited stock only.',
    cta: 'Shop Deals',
    href: '/search?q=sale',
    accent: 'bg-primary/15 text-primary dark:text-primary-light',
  },
  {
    id: 'loyalty',
    title: 'Rewards for Loyal Fans',
    description: 'Earn double points on accessories and jewelry this week.',
    cta: 'View Rewards',
    href: '/account',
    accent: 'bg-accent/15 text-accent dark:text-rose-300',
  },
];

const heroWords = ['Elevate', 'Celebrate', 'Curate'];

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (index = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: index * 0.15, duration: 0.6, ease: 'easeOut' },
  }),
};

const avatarColors = ['bg-emerald-500', 'bg-indigo-500', 'bg-rose-500'];

export default function HomeV2() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [promotions, setPromotions] = useState(placeholderPromotions);
  const [reviews, setReviews] = useState([]);
  const productSectionRef = useRef(null);

  useEffect(() => {
    let ignore = false;
    async function loadContent() {
      setLoading(true);
      setError('');
      try {
        const [{ products: fetchedProducts }, fetchedCategories] = await Promise.all([
          fetchProducts({ perPage: 24 }),
          fetchCategories({ perPage: 12 }),
        ]);
        if (ignore) return;
        setProducts(fetchedProducts ?? []);
        const normalizedCategories = Array.isArray(fetchedCategories)
          ? fetchedCategories
              .filter(Boolean)
              .map((category) => ({
                id: category.id ?? category.slug ?? category.name,
                name: category.name ?? 'Category',
                description: category.description ?? '',
                slug: category.slug ?? null,
              }))
              .filter((category) => category.id != null)
          : [];
        setCategories(normalizedCategories);
      } catch (err) {
        console.error(err);
        if (!ignore) {
          setError(err.message ?? 'Unable to load content. Please refresh and try again.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadContent();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    const storedReviews = readJson('reviews', []);
    setReviews(Array.isArray(storedReviews) ? storedReviews : []);
  }, []);

  useEffect(() => {
    if (products.length === 0) {
      setPromotions(placeholderPromotions);
      return;
    }
    const discounted = products
      .filter((product) =>
        Number(product.salePrice ?? product.effectivePrice ?? product.price ?? 0) <
        Number(product.originalPrice ?? product.price ?? 0),
      )
      .slice(0, 3)
      .map((product) => {
        const original = Number(product.originalPrice ?? product.price ?? 0);
        const discountedPrice = Number(product.salePrice ?? product.price ?? product.effectivePrice ?? 0);
        const savings = Math.max(0, original - discountedPrice);
        const savingsPercent = original > 0 ? Math.round((savings / original) * 100) : 0;
        return {
          id: product.id,
          title: product.title,
          description:
            savingsPercent > 0
              ? `Save ${savingsPercent}% on ${product.title}`
              : `Featured pick: ${product.title}`,
          cta: 'View Product',
          href: `/products/${product.id}`,
          accent: 'bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/10 dark:text-indigo-300',
        };
      });
    setPromotions(discounted.length > 0 ? discounted : placeholderPromotions);
  }, [products]);

  const topCategories = useMemo(() => categories.slice(0, 6), [categories]);

  const trendingProducts = useMemo(() => {
    if (products.length === 0) return [];
    return [...products]
      .sort((a, b) => (b.rating?.rate ?? 0) - (a.rating?.rate ?? 0))
      .slice(0, 10);
  }, [products]);

  const topReviews = useMemo(() => {
    if (reviews.length === 0) return [];
    return [...reviews]
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
      .slice(0, 3)
      .map((review) => ({
        ...review,
        ratingValue: Math.max(0, Math.min(5, Math.round(Number(review.rating ?? 0)))),
      }));
  }, [reviews]);

  const handleShopNow = () => {
    if (productSectionRef.current) {
      productSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-20 text-slate-900 transition-colors dark:text-slate-100">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 shadow-2xl">
        <div className="absolute inset-0">
          <motion.div
            className="absolute -left-10 top-24 h-64 w-64 rounded-full bg-primary/40 blur-3xl"
            animate={{ y: [0, -18, 0] }}
            transition={{ repeat: Infinity, duration: 12, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-0 right-[-8rem] h-80 w-80 rounded-full bg-accent/30 blur-3xl"
            animate={{ y: [0, 24, 0] }}
            transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut' }}
          />
        </div>
        <div className="relative z-10 grid gap-12 px-8 py-16 sm:px-12 lg:grid-cols-[1.2fr_1fr] lg:py-24">
          <div className="space-y-6">
            <motion.p
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              custom={0}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white/80 backdrop-blur"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Curated for trend seekers
            </motion.p>
            <motion.h1
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              custom={1}
              className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl"
            >
              {heroWords.map((word, index) => (
                <motion.span
                  key={word}
                  className="block"
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  custom={index + 1}
                >
                  {word} your lifestyle
                </motion.span>
              ))}
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              custom={4}
              className="max-w-xl text-base text-slate-200 sm:text-lg"
            >
              A modern shopping destination featuring design-driven essentials, loved-by-community favorites, and stories that move you.
            </motion.p>
            <motion.div variants={fadeInUp} initial="hidden" animate="visible" custom={5}>
              <button
                type="button"
                onClick={handleShopNow}
                className="group inline-flex items-center gap-3 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                Shop Now
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </button>
            </motion.div>
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              custom={6}
              className="flex flex-wrap gap-5 text-sm text-slate-200/90"
            >
              {['Fast shipping', 'Curated collections', 'Trusted by 10k+ customers'].map((feature) => (
                <div key={feature} className="flex items-center gap-2">
                  <span className="text-emerald-400">✔</span>
                  <span>{feature}</span>
                </div>
              ))}
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.7, ease: 'easeOut' }}
            className="relative flex h-full items-center justify-center"
          >
            <div className="grid w-full gap-4">
              <div className="rounded-3xl bg-white/10 p-6 backdrop-blur">
                <p className="text-sm uppercase tracking-[0.3em] text-white/70">Featured Capsule</p>
                <p className="mt-4 text-2xl font-semibold text-white">Signature Essentials</p>
                <p className="mt-3 text-sm text-white/70">
                  Highlighting pieces the community cannot stop talking about.
                </p>
              </div>
              <motion.div
                className="grid grid-cols-2 gap-4"
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
              >
                {trendingProducts.slice(0, 4).map((product) => (
                  <motion.div
                    key={product.id}
                    variants={fadeInUp}
                    className="rounded-2xl bg-white/10 p-4 text-white backdrop-blur"
                  >
                    <p className="text-sm font-semibold line-clamp-2">{product.title}</p>
                    <p className="mt-2 text-xs uppercase tracking-wide text-white/60">Rating {product.rating?.rate ?? 0}/5</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <section ref={productSectionRef} className="space-y-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-slate-900 dark:text-white">Explore top categories</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Browse the collections shoppers love the most this week.
            </p>
          </div>
          <Link
            to="/search"
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-primary hover:text-primary dark:border-slate-700 dark:text-slate-200 dark:hover:border-primary-light dark:hover:text-primary-light"
          >
            View all categories
            <span aria-hidden>↗</span>
          </Link>
        </div>
        {loading ? (
          <Loader label="Loading categories" />
        ) : error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50/60 p-6 text-red-600 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
            <p className="font-semibold">{error}</p>
          </div>
        ) : (
          <motion.div
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          >
            {topCategories.map((category) => (
              <motion.div
                key={category.id}
                whileHover={{ y: -6, scale: 1.02 }}
                className="group relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white/70 p-6 shadow-sm transition dark:border-slate-800/60 dark:bg-slate-900/60"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-white/40 opacity-0 transition group-hover:opacity-100 dark:from-slate-700/10 dark:via-slate-800/20 dark:to-slate-900/60" />
                <div className="relative space-y-3">
                  <p className="text-xs font-medium uppercase tracking-wider text-primary dark:text-primary-light">Category</p>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{category.name}</h3>
                  <p className="text-sm text-slate-600 line-clamp-2 dark:text-slate-400">
                    {category.description || 'Discover curated pieces selected by our merch team.'}
                  </p>
                  <Link
                    to={category.slug ? `/search?category=${encodeURIComponent(category.slug)}` : '/search'}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition group-hover:gap-3 dark:text-primary-light"
                  >
                    Shop {category.name}
                    <span aria-hidden>→</span>
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      <section className="space-y-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-slate-900 dark:text-white">Trending right now</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Rated highly by our community of shoppers.</p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleShopNow}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-primary hover:text-primary dark:border-slate-700 dark:text-slate-200 dark:hover:border-primary-light dark:hover:text-primary-light"
            >
              Jump to categories
            </button>
          </div>
        </div>
        {loading ? (
          <Loader label="Loading featured products" />
        ) : error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50/60 p-6 text-red-600 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
            <p className="font-semibold">{error}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="flex gap-6 pb-4">
              {trendingProducts.map((product) => (
                <motion.div key={product.id} whileHover={{ y: -6 }} className="w-72 shrink-0">
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="space-y-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-slate-900 dark:text-white">Current highlights</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Campaigns curated by our merchandising team.</p>
          </div>
          <Link
            to="/search?q=featured"
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-primary hover:text-primary dark:border-slate-700 dark:text-slate-200 dark:hover:border-primary-light dark:hover:text-primary-light"
          >
            View featured products
            <span aria-hidden>↗</span>
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {promotions.map((campaign) => (
            <motion.div
              key={campaign.id}
              whileHover={{ y: -6 }}
              className="relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white/70 p-6 shadow-sm transition dark:border-slate-800/60 dark:bg-slate-900/60"
            >
              <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-br from-white/50 via-white/0 to-white/0 opacity-60 dark:from-slate-700/40 dark:via-slate-900/0" />
              <div className="relative space-y-4">
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${campaign.accent}`}>
                  Featured
                </span>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{campaign.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{campaign.description}</p>
                <Link
                  to={campaign.href}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:gap-3 dark:text-primary-light"
                >
                  {campaign.cta}
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="space-y-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-slate-900 dark:text-white">What customers are saying</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Pulled directly from verified reviews across the store.
            </p>
          </div>
          <Link
            to="/search?q=reviews"
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-primary hover:text-primary dark:border-slate-700 dark:text-slate-200 dark:hover:border-primary-light dark:hover:text-primary-light"
          >
            Browse products
            <span aria-hidden>↗</span>
          </Link>
        </div>
        {topReviews.length === 0 ? (
          <div className="rounded-3xl border border-slate-200/60 bg-white/70 p-6 text-slate-600 dark:border-slate-800/60 dark:bg-slate-900/60 dark:text-slate-300">
            <p>No reviews yet. Be the first to share your experience!</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {topReviews.map((review, index) => (
              <motion.article
                key={review.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="flex h-full flex-col gap-4 rounded-3xl border border-slate-200/60 bg-white/80 p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/60"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full text-white ${avatarColors[index % avatarColors.length]}`}>
                    {(review.user ?? 'Guest').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{review.user ?? 'Guest'}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(review.created_at ?? Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="text-lg font-semibold text-amber-400">
                  {'★'.repeat(review.ratingValue).padEnd(5, '☆')}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-300">{review.comment}</p>
              </motion.article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
