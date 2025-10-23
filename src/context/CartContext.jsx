import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchCart } from '../utils/api.js';

const STORAGE_KEY = 'shop-cart-items';
const isBrowser = typeof window !== 'undefined';

const CartContext = createContext();

const readCart = () => {
  try {
    if (!isBrowser) return [];
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Failed to parse cart', error);
    return [];
  }
};

const writeCart = (items) => {
  try {
    if (!isBrowser) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Failed to persist cart', error);
  }
};

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => readCart());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    writeCart(items);
  }, [items]);

  const loadCartFromApi = useCallback(async () => {
    if (!isBrowser) return;
    setLoading(true);
    try {
      const remoteItems = await fetchCart();
      setItems(remoteItems);
    } catch (error) {
      console.error('Failed to load cart from API', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCartFromApi();
  }, [loadCartFromApi]);

  const addToCart = (product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, 10) }
            : item,
        );
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId) => {
    setItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== productId) return item;
        const numericValue = Number(quantity);
        const safeValue = Number.isFinite(numericValue) ? numericValue : 1;
        const boundedValue = Math.min(10, Math.max(1, Math.round(safeValue)));
        return { ...item, quantity: boundedValue };
      }),
    );
  };

  const clearCart = () => setItems([]);

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + Number(item.price ?? 0) * item.quantity, 0);
    const tax = Math.round(subtotal * 0.07);
    const total = subtotal + tax;
    return {
      subtotal,
      tax,
      total,
      itemCount: items.reduce((count, item) => count + item.quantity, 0),
    };
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      loading,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      refreshCart: loadCartFromApi,
      totals,
    }),
    [items, loading, loadCartFromApi, totals],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
