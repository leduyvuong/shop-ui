import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { addToWishlist as apiAddToWishlist, removeFromWishlist as apiRemoveFromWishlist, fetchWishlist as apiFetchWishlist } from '../utils/api.js';

const STORAGE_KEY = 'shop-wishlist-items';

const WishlistContext = createContext();

const readWishlist = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Failed to parse wishlist', error);
    return [];
  }
};

const writeWishlist = (items) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Failed to persist wishlist', error);
  }
};

export function WishlistProvider({ children }) {
  const [items, setItems] = useState(() => readWishlist());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    writeWishlist(items);
  }, [items]);

  const loadWishlistFromApi = async () => {
    setLoading(true);
    try {
      const apiItems = await apiFetchWishlist();
      setItems(apiItems);
    } catch (error) {
      console.error('Failed to load wishlist from API:', error);
      // Keep localStorage items if API fails
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlistFromApi();
  }, []);

  const addToWishlist = async (product) => {
    try {
      await apiAddToWishlist(product.id);
      setItems((prev) => {
        if (prev.some((item) => item.id === product.id)) {
          return prev;
        }
        return [...prev, product];
      });
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
      // Fallback to localStorage if API fails
      setItems((prev) => {
        if (prev.some((item) => item.id === product.id)) {
          return prev;
        }
        return [...prev, product];
      });
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await apiRemoveFromWishlist(productId);
      setItems((prev) => prev.filter((item) => item.id !== productId));
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      // Fallback to localStorage if API fails
      setItems((prev) => prev.filter((item) => item.id !== productId));
    }
  };

  const value = useMemo(
    () => ({ items, loading, addToWishlist, removeFromWishlist, refreshWishlist: loadWishlistFromApi }),
    [items, loading, loadWishlistFromApi],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export const useWishlist = () => useContext(WishlistContext);
