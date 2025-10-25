import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = [
  { key: "all", label: "All Products", icon: "🛍️" },
  { key: "men's clothing", label: "Men's Clothing", icon: "👔" },
  { key: "women's clothing", label: "Women's Clothing", icon: "👗" },
  { key: "electronics", label: "Electronics", icon: "🔌" },
  { key: "jewelery", label: "Jewelry", icon: "💎" },
];

const HEADER_LINKS = [
  { href: "#", label: "Home" },
  { href: "#products", label: "Products" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  const productsRef = useRef(null);

  useEffect(() => {
    const storedCart = window.localStorage.getItem("mystore-cart");
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart));
      } catch (err) {
        console.error("Failed to parse cart", err);
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("mystore-cart", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("https://fakestoreapi.com/products");
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        console.error(err);
        setError(err.message || "An error occurred while fetching products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (product) => product.category.toLowerCase() === selectedCategory
      );
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.title.toLowerCase().includes(term) ||
          product.category.toLowerCase().includes(term)
      );
    }
    return filtered;
  }, [products, searchTerm, selectedCategory]);

  const handleAddToCart = (product) => {
    setCartItems((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleRetry = () => {
    setLoading(true);
    setError("");
    fetch("https://fakestoreapi.com/products")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch products");
        }
        return res.json();
      })
      .then((data) => setProducts(data))
      .catch((err) => setError(err.message || "An unexpected error occurred."))
      .finally(() => setLoading(false));
  };

  const scrollToProducts = () => {
    productsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const totalCartItems = cartItems.reduce(
    (count, item) => count + (item.quantity || 1),
    0
  );

  const heroVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  };

  const categoryVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1 },
    }),
  };

  const productVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.05 },
    }),
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-900 dark:text-slate-100">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur shadow-sm dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <span className="text-2xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400">
              MyStore
            </span>
            <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300 md:flex">
              {HEADER_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="transition hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-end gap-4">
            <div className="relative hidden max-w-md flex-1 items-center md:flex">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                <SearchIcon />
              </span>
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search products..."
                className="w-full rounded-full border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
            <button
              type="button"
              onClick={() => setDarkMode((prev) => !prev)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-indigo-500 hover:text-indigo-500 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-400 dark:hover:text-indigo-400"
            >
              {darkMode ? <SunIcon /> : <MoonIcon />}
            </button>
            <button
              type="button"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-indigo-500 hover:text-indigo-500 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-400 dark:hover:text-indigo-400"
            >
              <UserIcon />
            </button>
            <button
              type="button"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-indigo-500 hover:text-indigo-500 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-400 dark:hover:text-indigo-400"
            >
              <CartIcon />
              {totalCartItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-indigo-600 px-1 text-xs font-semibold text-white shadow">
                  {totalCartItems}
                </span>
              )}
            </button>
          </div>
        </div>
        <div className="px-4 pb-4 sm:hidden">
          <div className="relative mb-3 flex items-center">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
              <SearchIcon />
            </span>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search products..."
              className="w-full rounded-full border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
          <nav className="flex items-center gap-4 text-sm font-medium text-slate-600 dark:text-slate-300">
            {HEADER_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="transition hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-16 px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 px-6 py-16 text-white shadow-xl md:px-12">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={heroVariants}
            transition={{ duration: 0.8 }}
            className="max-w-2xl space-y-6"
          >
            <p className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1 text-sm font-semibold uppercase tracking-wide">
              <SparkleIcon /> Trendiest Picks
            </p>
            <h1 className="text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
              Discover our latest collections.
            </h1>
            <p className="text-lg text-indigo-100">
              Shop the best products at unbeatable prices.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={scrollToProducts}
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-indigo-600 shadow-lg transition hover:bg-indigo-50"
              >
                Shop Now
              </button>
              <span className="text-sm text-indigo-100">
                Enjoy free shipping on orders over $50.
              </span>
            </div>
          </motion.div>
        </section>

        <section className="space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              Shop by Category
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Filter products to find exactly what you love.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {CATEGORIES.map((category, index) => (
              <motion.button
                key={category.key}
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={categoryVariants}
                onClick={() => setSelectedCategory(category.key)}
                className={`flex h-full flex-col items-start gap-3 rounded-2xl border border-transparent bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800 ${
                  selectedCategory === category.key
                    ? "ring-2 ring-indigo-500"
                    : ""
                }`}
              >
                <span className="text-3xl">{category.icon}</span>
                <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {category.label}
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {category.key === "all"
                    ? "Explore everything we offer"
                    : `Best in ${category.label}`}
                </span>
              </motion.button>
            ))}
          </div>
        </section>

        <section id="products" ref={productsRef} className="space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                Featured Products
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Hand-picked items just for you.
              </p>
            </div>
            <span className="rounded-full bg-indigo-100 px-4 py-1 text-sm font-medium text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-300">
              {filteredProducts.length} items
            </span>
          </div>

          {loading && (
            <div className="flex items-center justify-center rounded-2xl bg-white p-12 shadow-sm dark:bg-slate-800">
              <motion.div
                className="h-12 w-12 rounded-full border-4 border-indigo-200 border-t-indigo-600"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-white p-12 text-center shadow-sm dark:bg-slate-800">
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Oops! We couldn't load the products.
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{error}</p>
              <button
                onClick={handleRetry}
                className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow transition hover:bg-indigo-500"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-white p-12 text-center shadow-sm dark:bg-slate-800">
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                No products found.
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Try adjusting your filters or search terms.
              </p>
            </div>
          )}

          <AnimatePresence mode="wait">
            {!loading && !error && filteredProducts.length > 0 && (
              <motion.div
                layout
                className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4"
              >
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    custom={index}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={productVariants}
                    className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-sm transition hover:-translate-y-2 hover:shadow-lg dark:bg-slate-800"
                  >
                    <div className="relative h-64 overflow-hidden bg-slate-100">
                      <motion.img
                        src={product.image}
                        alt={product.title}
                        className="h-full w-full object-contain p-6 transition duration-500 group-hover:scale-105"
                        whileHover={{ scale: 1.05 }}
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-4 p-6">
                      <div className="space-y-2">
                        <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
                          {product.category}
                        </span>
                        <h3 className="h-14 overflow-hidden text-ellipsis text-lg font-semibold leading-snug text-slate-900 dark:text-slate-100">
                          {product.title}
                        </h3>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
                          ${product.price.toFixed(2)}
                        </p>
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white opacity-0 transition group-hover:opacity-100"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <section id="about" className="rounded-3xl bg-white p-10 text-center shadow-sm dark:bg-slate-800">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Welcome to MyStore
          </h2>
          <p className="mt-4 text-base text-slate-600 dark:text-slate-300">
            Welcome to MyStore — your trusted shop for quality and style. We bring
            you hand-picked products from the best brands around the world.
          </p>
        </section>

        <section
          id="contact"
          className="rounded-3xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 p-10 text-white shadow-lg"
        >
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-semibold">Join our newsletter</h2>
            <p className="mt-3 text-indigo-100">
              Stay updated with new arrivals, exclusive offers, and curated picks.
            </p>
            <form
              className="mt-8 flex flex-col items-center gap-3 sm:flex-row"
              onSubmit={(event) => event.preventDefault()}
            >
              <input
                type="email"
                required
                placeholder="Enter your email"
                className="w-full flex-1 rounded-full border border-white/30 bg-white/10 px-5 py-3 text-sm text-white placeholder:text-indigo-100 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <button
                type="submit"
                className="w-full rounded-full bg-white px-6 py-3 text-sm font-semibold text-indigo-600 shadow-lg transition hover:bg-indigo-100 sm:w-auto"
              >
                Subscribe
              </button>
            </form>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 py-12 text-slate-200">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          <div className="space-y-4">
            <span className="text-2xl font-bold text-white">MyStore</span>
            <p className="text-sm text-slate-400">
              Discover curated collections that elevate your lifestyle.
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">About Us</h3>
            <p className="text-sm text-slate-400">
              We are passionate about bringing premium products to your doorstep,
              combining style, comfort, and innovation.
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a href="#" className="transition hover:text-white">
                  Home
                </a>
              </li>
              <li>
                <a href="#products" className="transition hover:text-white">
                  Shop
                </a>
              </li>
              <li>
                <a href="#contact" className="transition hover:text-white">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">Follow Us</h3>
            <div className="flex items-center gap-3">
              <SocialIcon label="Facebook" />
              <SocialIcon label="Instagram" />
              <SocialIcon label="Twitter" />
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-slate-800 pt-6 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} MyStore. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

const SocialIcon = ({ label }) => (
  <button
    type="button"
    aria-label={`Follow us on ${label}`}
    className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 text-slate-300 transition hover:border-indigo-500 hover:text-white"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-5 w-5"
    >
      <path d={getSocialPath(label)} />
    </svg>
  </button>
);

const getSocialPath = (label) => {
  switch (label) {
    case "Facebook":
      return "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z";
    case "Instagram":
      return "M7 2h6a5 5 0 0 1 5 5v6a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zm8.5 1.25a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5zM10 7a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm0 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2z";
    case "Twitter":
      return "M20 5.92a4.09 4.09 0 0 1-1.18.33 2.06 2.06 0 0 0 .9-1.14 4.14 4.14 0 0 1-1.3.5A2.05 2.05 0 0 0 9.88 6.8 5.82 5.82 0 0 1 4.11 4.2a2.05 2.05 0 0 0 .64 2.74 2.05 2.05 0 0 1-.93-.26v.03a2.05 2.05 0 0 0 1.65 2 2.06 2.06 0 0 1-.54.07 1.9 1.9 0 0 1-.39-.04 2.05 2.05 0 0 0 1.92 1.43A4.12 4.12 0 0 1 3 11.54a5.82 5.82 0 0 0 3.15.92 5.82 5.82 0 0 0 5.89-5.89v-.27A4.26 4.26 0 0 0 20 5.92z";
    default:
      return "";
  }
};

const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 15.75 19.5 19.5M9.75 16.5a6.75 6.75 0 1 1 0-13.5 6.75 6.75 0 0 1 0 13.5z"
    />
  </svg>
);

const CartIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 1 0 6 0m-6 0a3 3 0 1 0 6 0m-6 0h6m-6 0L5.106 5.272A1.125 1.125 0 0 0 4.008 4.5H3m16.5 0h-13.5m13.5 0 1.5 9.75h-15"
    />
  </svg>
);

const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0zM4.5 20.118a7.5 7.5 0 0 1 15 0V21H4.5v-.882z"
    />
  </svg>
);

const MoonIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
    />
  </svg>
);

const SunIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 3v1.5m0 15V21m9-9h-1.5m-15 0H3m15.364-6.364-1.06 1.06m-9.607 9.608-1.06 1.06m11.727 0-1.06-1.06m-9.607-9.607-1.06-1.06M12 7.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 0 1 12 7.5z"
    />
  </svg>
);

const SparkleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

export default HomePage;
