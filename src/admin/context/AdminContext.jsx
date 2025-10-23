import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const AdminContext = createContext(null);

const PRODUCTS_STORAGE_KEY = 'admin_products';
const REVIEWS_STORAGE_KEY = 'reviews';
const DARK_MODE_STORAGE_KEY = 'admin_dark_mode';

const DEFAULT_REVIEWS = [
  { id: 1, productId: 2, user: 'Alice', rating: 5, comment: 'Great!', created_at: '2025-10-20' },
  { id: 2, productId: 4, user: 'Bob', rating: 4, comment: 'Pretty good.' },
];

export function AdminProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(DARK_MODE_STORAGE_KEY) === 'true';
  });

  const persistProducts = useCallback((items) => {
    setProducts(items);
    try {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Failed to persist products', error);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const stored = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        persistProducts(parsed);
        setLoadingProducts(false);
        return;
      }

      const { data } = await axios.get('https://fakestoreapi.com/products');
      persistProducts(data);
    } catch (error) {
      console.error('Failed to load products', error);
    } finally {
      setLoadingProducts(false);
    }
  }, [persistProducts]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(REVIEWS_STORAGE_KEY);
      if (stored) {
        setReviews(JSON.parse(stored));
        return;
      }
      localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(DEFAULT_REVIEWS));
      setReviews(DEFAULT_REVIEWS);
    } catch (error) {
      console.error('Failed to load reviews', error);
      setReviews(DEFAULT_REVIEWS);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
    } catch (error) {
      console.error('Failed to persist reviews', error);
    }
  }, [reviews]);

  useEffect(() => {
    try {
      localStorage.setItem(DARK_MODE_STORAGE_KEY, darkMode ? 'true' : 'false');
    } catch (error) {
      console.error('Failed to persist admin theme preference', error);
    }
  }, [darkMode]);

  const addProduct = useCallback(
    (product) => {
      persistProducts([...products, product]);
    },
    [products, persistProducts],
  );

  const updateProduct = useCallback(
    (id, updates) => {
      const updated = products.map((item) => (item.id === id ? { ...item, ...updates } : item));
      persistProducts(updated);
    },
    [products, persistProducts],
  );

  const deleteProduct = useCallback(
    (id) => {
      const filtered = products.filter((item) => item.id !== id);
      persistProducts(filtered);
    },
    [products, persistProducts],
  );

  const deleteReview = useCallback(
    (id) => {
      setReviews((current) => current.filter((review) => review.id !== id));
    },
    [],
  );

  const updateReview = useCallback((id, updates) => {
    setReviews((current) => current.map((review) => (review.id === id ? { ...review, ...updates } : review)));
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => !prev);
  }, []);

  const showToast = useCallback((message, variant = 'success') => {
    const id = Date.now();
    setToasts((current) => [...current, { id, message, variant }]);
    setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 2800);
  }, []);

  const value = useMemo(
    () => ({
      products,
      loadingProducts,
      reviews,
      addProduct,
      updateProduct,
      deleteProduct,
      deleteReview,
      updateReview,
      toasts,
      showToast,
      darkMode,
      toggleDarkMode,
      refreshProducts: fetchProducts,
    }),
    [
      products,
      loadingProducts,
      reviews,
      addProduct,
      updateProduct,
      deleteProduct,
      deleteReview,
      updateReview,
      toasts,
      showToast,
      darkMode,
      toggleDarkMode,
      fetchProducts,
    ],
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdminContext() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdminContext must be used within an AdminProvider');
  }
  return context;
}

