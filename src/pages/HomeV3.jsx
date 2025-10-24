import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Loader from '../components/Loader.jsx';
import { fetchCategories, fetchProducts } from '../utils/api.js';
import { readJson } from '../utils/storage.js';
import { formatCurrency } from '../utils/format.js';

const heroSlides = [
  {
    id: 'atelier',
    image:
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1600&q=80',
    heading: 'The Atelier Edit',
    subheading: 'Artful silhouettes curated for statement moments.',
    cta: { label: 'Explore Now', href: '/search?q=atelier' },
  },
  {
    id: 'essentials',
    image:
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1600&q=80',
    heading: 'Elevated Essentials',
    subheading: 'Minimalist layers designed for everyday luxury.',
    cta: { label: 'Shop Essentials', href: '/search?q=essentials' },
  },
  {
    id: 'tech',
    image:
      'https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=1600&q=80',
    heading: 'Connected Living',
    subheading: 'Smart devices that blend seamlessly with your aesthetic.',
    cta: { label: 'Discover Tech', href: '/search?q=smart' },
  },
];

const categoryBackgrounds = [
  'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=1200&q=80',
];

const heroVariants = {
  initial: { opacity: 0, scale: 1.02 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.98, transition: { duration: 0.5, ease: 'easeIn' } },
};

const heroTextVariants = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut', delay: 0.2 } },
};

const quickViewVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, y: 20, transition: { duration: 0.2 } },
};

const productLayouts = ['lg:row-span-2', 'lg:col-span-1', 'lg:row-span-2', 'lg:col-span-1'];

const avatarPalette = ['bg-emerald-500', 'bg-indigo-500', 'bg-rose-500'];

const clampText = (value, length = 140) => {
  if (!value) return '';
  if (value.length <= length) return value;
  return `${value.slice(0, length)}…`;
};

const normalizeReview = (review, index) => {
  if (!review) return null;
  const rating = Math.max(0, Math.min(5, Math.round(Number(review.rating ?? review.rate ?? 0))));
  return {
    id: review.id ?? `review-${index}`,
    name: review.name ?? review.author ?? 'Anonymous',
    comment: review.comment ?? review.content ?? review.message ?? '',
    rating,
    product: review.productName ?? review.productTitle ?? review.product ?? '',
  };
};

export default function HomeV3() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeHero, setActiveHero] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [storedReviews, setStoredReviews] = useState([]);
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);
  const quickViewPricing = useMemo(() => {
    if (!selectedProduct) return null;
    const priceValue = Number(selectedProduct.price ?? selectedProduct.effectivePrice ?? 0);
    const originalPrice = Number(selectedProduct.originalPrice ?? 0);
    return {
      priceValue,
      originalPrice,
      hasDiscount: originalPrice > priceValue && priceValue > 0,
    };
  }, [selectedProduct]);

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
        setProducts(Array.isArray(fetchedProducts) ? fetchedProducts : []);
        const normalizedCategories = Array.isArray(fetchedCategories)
          ? fetchedCategories
              .filter(Boolean)
              .map((category, index) => ({
                id: category.id ?? category.slug ?? category.name ?? index,
                name: category.name ?? 'Category',
                slug: category.slug ?? (category.id != null ? String(category.id) : null),
              }))
              .filter((category) => category.id != null)
          : [];
        setCategories(normalizedCategories);
      } catch (err) {
        console.error(err);
        if (!ignore) {
          setError(err.message ?? 'Unable to load content. Please try again later.');
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
    const reviews = readJson('reviews', []);
    if (Array.isArray(reviews)) {
      setStoredReviews(reviews.map(normalizeReview).filter(Boolean));
    }
  }, []);

  useEffect(() => {
    if (heroSlides.length <= 1) return undefined;
    const interval = window.setInterval(() => {
      setActiveHero((prev) => (prev + 1) % heroSlides.length);
    }, 7000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!storedReviews || storedReviews.length <= 1) return undefined;
    const interval = window.setInterval(() => {
      setActiveReviewIndex((prev) => (prev + 1) % storedReviews.length);
    }, 6000);
    return () => window.clearInterval(interval);
  }, [storedReviews]);

  const categoryTiles = useMemo(() => {
    return categories.slice(0, 4).map((category, index) => ({
      ...category,
      background: categoryBackgrounds[index % categoryBackgrounds.length],
    }));
  }, [categories]);

  const spotlightProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    return [...products]
      .sort((a, b) => (b.rating?.rate ?? 0) - (a.rating?.rate ?? 0))
      .slice(0, 10);
  }, [products]);

  const featuredReview = storedReviews.length > 0 ? storedReviews[activeReviewIndex % storedReviews.length] : null;

  const handleNewsletterSubmit = (event) => {
    event.preventDefault();
    if (!newsletterEmail.trim()) return;
    setToastMessage("You're subscribed!");
    setNewsletterEmail('');
    window.setTimeout(() => setToastMessage(''), 3200);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-24 text-slate-900 transition-colors dark:text-slate-100">
      <section className="relative overflow-hidden rounded-[3rem] bg-slate-950 text-white shadow-2xl">
        <AnimatePresence mode="wait">
          {heroSlides.map((slide, index) =>
            index === activeHero ? (
              <motion.div
                key={slide.id}
                className="relative h-[420px] w-full sm:h-[520px] lg:h-[560px]"
                variants={heroVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <motion.img
                  src={slide.image}
                  alt={slide.heading}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                  initial={{ scale: 1.05 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 7, ease: 'linear' }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/70" />
                <div className="relative z-10 flex h-full flex-col justify-end px-8 pb-16 sm:px-12 lg:px-20">
                  <motion.p
                    variants={heroTextVariants}
                    initial="initial"
                    animate="animate"
                    className="text-xs uppercase tracking-[0.4em] text-white/60"
                  >
                    Lifestyle Stories
                  </motion.p>
                  <motion.h1
                    variants={heroTextVariants}
                    initial="initial"
                    animate="animate"
                    className="mt-4 max-w-2xl text-4xl font-light leading-tight sm:text-5xl"
                  >
                    {slide.heading}
                  </motion.h1>
                  <motion.p
                    variants={heroTextVariants}
                    initial="initial"
                    animate="animate"
                    className="mt-4 max-w-xl text-sm font-medium text-white/80"
                  >
                    {slide.subheading}
                  </motion.p>
                  <motion.div variants={heroTextVariants} initial="initial" animate="animate" className="mt-8">
                    <Link
                      to={slide.cta.href}
                      className="inline-flex items-center gap-3 rounded-full bg-white/90 px-6 py-3 text-sm font-semibold tracking-[0.3em] text-slate-900 transition hover:bg-white"
                    >
                      {slide.cta.label}
                      <span aria-hidden>↗</span>
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            ) : null,
          )}
        </AnimatePresence>
        <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-3">
          {heroSlides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => setActiveHero(index)}
              className={`h-2.5 rounded-full transition ${
                index === activeHero ? 'w-8 bg-white' : 'w-2.5 bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      <section className="space-y-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-light uppercase tracking-[0.5em] text-slate-400 dark:text-slate-500">Curations</h2>
            <p className="mt-3 max-w-xl text-sm text-slate-500 dark:text-slate-400">
              Discover immersive category worlds crafted for discerning tastemakers.
            </p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {categoryTiles.length === 0 && !loading && (
            <p className="text-sm text-slate-500 dark:text-slate-400">Categories will appear as soon as they are available.</p>
          )}
          {categoryTiles.map((category, index) => (
            <Link
              key={category.id}
              to={`/products?category=${encodeURIComponent(category.slug ?? category.id)}`}
              className="group relative flex h-72 items-end overflow-hidden rounded-[2.5rem] border border-slate-200/60 bg-slate-100 shadow-sm transition hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:border-slate-800/60 dark:bg-slate-900"
            >
              <img
                src={category.background}
                alt={category.name}
                className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/20 to-transparent transition duration-300 group-hover:backdrop-blur-sm" />
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="relative z-10 w-full px-8 pb-8"
              >
                <p className="text-xs uppercase tracking-[0.4em] text-white/70">Category</p>
                <h3 className="mt-4 text-3xl font-semibold text-white">{category.name}</h3>
                <p className="mt-3 text-sm text-white/70">Tap to explore the latest arrivals curated for this mood.</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-light uppercase tracking-[0.5em] text-slate-400 dark:text-slate-500">Spotlight</h2>
            <p className="mt-3 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
              Editorial picks featuring standouts in craftsmanship, innovation, and enduring design.
            </p>
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader />
          </div>
        ) : error ? (
          <p className="text-sm text-rose-500">{error}</p>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {spotlightProducts.map((product, index) => {
              const ratingValue = Math.round(product.rating?.rate ?? 0);
              const ratingStars = '★'.repeat(ratingValue).padEnd(5, '☆');
              const layoutClass = productLayouts[index % productLayouts.length];
              return (
                <motion.article
                  key={product.id}
                  className={`group relative flex h-full flex-col justify-end overflow-hidden rounded-[2.75rem] border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-2xl dark:border-slate-800/60 dark:bg-slate-900/70 ${layoutClass}`}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <div className="absolute inset-0">
                    <motion.img
                      src={product.image}
                      alt={product.title}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent dark:from-slate-950 dark:via-slate-950/60" />
                  </div>
                  <div className="relative z-10 space-y-4 px-10 pb-10 pt-32 text-slate-900 dark:text-slate-100">
                    <p className="text-xs uppercase tracking-[0.4em] text-slate-500 dark:text-slate-400">{product.brand || 'Featured'}</p>
                    <h3 className="text-2xl font-semibold leading-tight">{product.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{clampText(product.description)}</p>
                    <div className="flex items-center justify-between text-sm font-semibold">
                      <span>{formatCurrency(product.price ?? product.effectivePrice ?? 0)}</span>
                      <span className="text-xs text-amber-500">{ratingStars}</span>
                    </div>
                  </div>
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <motion.button
                      type="button"
                      onClick={() => setSelectedProduct(product)}
                      className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-slate-900/90 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white opacity-0 transition hover:bg-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white group-hover:opacity-100"
                    >
                      Quick View
                      <span aria-hidden>↗</span>
                    </motion.button>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </section>

      <section className="rounded-[3rem] bg-white/70 p-12 text-slate-900 shadow-lg transition dark:bg-slate-900/70 dark:text-slate-100">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500">Lookbook</p>
            <h2 className="text-4xl font-light leading-tight">Style is the reflection of your attitude.</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Explore layered neutrals, architectural tailoring, and tactile accessories designed for contemporary living.
            </p>
            <Link
              to="/search?q=lifestyle"
              className="inline-flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.3em] text-primary transition hover:text-primary-light"
            >
              Read the editorial
              <span aria-hidden>↗</span>
            </Link>
          </div>
          <div className="relative overflow-hidden rounded-[2.5rem]">
            <img
              src="https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?auto=format&fit=crop&w=1200&q=80"
              alt="Lookbook mood"
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-black/30 via-transparent to-transparent" />
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-light uppercase tracking-[0.5em] text-slate-400 dark:text-slate-500">Testimonials</h2>
            <p className="mt-3 max-w-xl text-sm text-slate-500 dark:text-slate-400">
              Voices from our community sharing how they live with intention.
            </p>
          </div>
        </div>
        {featuredReview ? (
          <div className="relative overflow-hidden rounded-[2.75rem] border border-slate-200/70 bg-white/80 p-12 shadow-lg transition dark:border-slate-800/60 dark:bg-slate-900/70">
            <AnimatePresence mode="wait">
              <motion.div
                key={featuredReview.id}
                variants={quickViewVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-6"
              >
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full text-white ${avatarPalette[activeReviewIndex % avatarPalette.length]}`}>
                    <span className="text-sm font-semibold uppercase tracking-wide">
                      {featuredReview.name.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.3em]">{featuredReview.name}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{featuredReview.product || 'Verified customer'}</p>
                  </div>
                  <div className="ml-auto text-xs text-amber-500">{'★'.repeat(featuredReview.rating).padEnd(5, '☆')}</div>
                </div>
                <p className="text-lg font-light leading-relaxed text-slate-700 dark:text-slate-200">
                  “{featuredReview.comment}”
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">No reviews yet. Check back soon for community highlights.</p>
        )}
      </section>

      <section className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-emerald-100 via-white to-indigo-100 p-12 text-slate-900 shadow-xl dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 dark:text-slate-100">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.45),_transparent_60%)]" />
        <div className="relative z-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500 dark:text-slate-400">Stay in the loop</p>
            <h2 className="text-4xl font-light leading-tight">Join the editorial dispatch.</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Weekly notes on drops, styling stories, and invitations to limited releases.
            </p>
          </div>
          <form onSubmit={handleNewsletterSubmit} className="relative">
            <div className="flex flex-col gap-3 rounded-full bg-white/90 p-2 pr-2 shadow-lg ring-1 ring-white/60 backdrop-blur dark:bg-slate-950/80 dark:ring-slate-700">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                value={newsletterEmail}
                onChange={(event) => setNewsletterEmail(event.target.value)}
                placeholder="Email address"
                required
                className="w-full rounded-full border-none bg-transparent px-6 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 dark:text-slate-100"
              />
              <button
                type="submit"
                className="self-end rounded-full bg-slate-900 px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-slate-700 dark:bg-primary dark:hover:bg-primary-light"
              >
                Subscribe Now
              </button>
            </div>
            <AnimatePresence>
              {toastMessage && (
                <motion.div
                  key="newsletter-toast"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}
                  className="absolute -bottom-16 left-0 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600 shadow-lg backdrop-blur dark:bg-slate-900/90 dark:text-emerald-300"
                >
                  {toastMessage}
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>
      </section>

      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            key="quick-view"
            className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-full max-w-4xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/95 p-10 shadow-2xl backdrop-blur dark:border-slate-700 dark:bg-slate-900"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 160, damping: 20 }}
            >
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="absolute right-6 top-6 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 transition hover:border-primary hover:text-primary dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300"
              >
                Close
              </button>
              <div className="grid gap-10 md:grid-cols-[1fr_1.1fr] md:items-center">
                <div className="overflow-hidden rounded-[2rem] bg-slate-100 dark:bg-slate-800/60">
                  <motion.img
                    src={selectedProduct.image}
                    alt={selectedProduct.title}
                    className="h-full w-full object-cover"
                    initial={{ scale: 1.05 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <div className="space-y-6 text-slate-900 dark:text-slate-100">
                  <div>
                    <p className="text-xs uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500">
                      {selectedProduct.brand || 'Signature piece'}
                    </p>
                    <h3 className="mt-3 text-3xl font-semibold leading-tight">{selectedProduct.title}</h3>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-300">{selectedProduct.description}</p>
                  <div className="flex items-center gap-4 text-lg font-semibold">
                    <span>{formatCurrency(quickViewPricing?.priceValue ?? 0)}</span>
                    {quickViewPricing?.hasDiscount && (
                      <span className="text-sm text-slate-400 line-through dark:text-slate-500">
                        {formatCurrency(quickViewPricing.originalPrice)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-amber-500">
                    <span>{'★'.repeat(Math.round(selectedProduct.rating?.rate ?? 0)).padEnd(5, '☆')}</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {selectedProduct.rating?.count ?? 0} reviews
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      to={`/products/${selectedProduct.id}`}
                      className="inline-flex items-center gap-3 rounded-full bg-slate-900 px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-slate-700 dark:bg-primary dark:hover:bg-primary-light"
                      onClick={() => setSelectedProduct(null)}
                    >
                      View Product
                      <span aria-hidden>↗</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => setSelectedProduct(null)}
                      className="rounded-full border border-slate-200 px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 transition hover:border-primary hover:text-primary dark:border-slate-700 dark:text-slate-300"
                    >
                      Close Preview
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
