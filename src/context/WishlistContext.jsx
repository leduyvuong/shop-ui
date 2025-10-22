import { createContext, useContext, useEffect, useMemo, useState } from 'react';

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

  useEffect(() => {
    writeWishlist(items);
  }, [items]);

  const addToWishlist = (product) => {
    setItems((prev) => {
      if (prev.some((item) => item.id === product.id)) {
        return prev;
      }
      return [...prev, product];
    });
  };

  const removeFromWishlist = (productId) => {
    setItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const value = useMemo(
    () => ({ items, addToWishlist, removeFromWishlist }),
    [items],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export const useWishlist = () => useContext(WishlistContext);
