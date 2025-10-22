import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'shop-cart-items';

const CartContext = createContext();

const readCart = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Failed to parse cart', error);
    return [];
  }
};

const writeCart = (items) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Failed to persist cart', error);
  }
};

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => readCart());

  useEffect(() => {
    writeCart(items);
  }, [items]);

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
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * 0.07;
    const total = subtotal + tax;
    return {
      subtotal,
      tax,
      total,
      itemCount: items.reduce((count, item) => count + item.quantity, 0),
    };
  }, [items]);

  const value = useMemo(
    () => ({ items, addToCart, removeFromCart, updateQuantity, clearCart, totals }),
    [items, totals],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
