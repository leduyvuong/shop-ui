import { motion } from 'framer-motion';
import { useState } from 'react';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { createOrder } from '../utils/api.js';
import { formatCurrency } from '../utils/format.js';

export default function Cart() {
  const { items, loading, removeFromCart, updateQuantity, totals, clearCart } = useCart();
  const { user } = useAuth();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  const handleCheckout = async () => {
    if (!user) {
      setCheckoutError('Please login to place an order');
      return;
    }

    setCheckoutLoading(true);
    setCheckoutError('');

    try {
      // Create order with basic data
      const orderData = {
        address_id: 1, // You might want to implement address selection
        payment_method: 'cod',
        // Add any other required fields based on API documentation
      };

      const order = await createOrder(orderData);
      
      if (order) {
        // Clear cart after successful order
        clearCart();
        window.alert(`Order placed successfully! Order ID: ${order.id}`);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setCheckoutError(error.message || 'Failed to place order. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl rounded-3xl border border-slate-100 bg-white p-10 text-center shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900">Loading your cart</h2>
        <p className="mt-3 text-sm text-slate-500">Please wait while we fetch your items.</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl rounded-3xl border border-slate-100 bg-white p-10 text-center shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900">Your cart is empty</h2>
        <p className="mt-3 text-sm text-slate-500">Explore products and add items to your cart to begin checkout.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10">
      <div className="space-y-6">
        {items.map((item) => (
          <motion.div
            key={item.id}
            layout
            className="flex flex-col gap-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center"
          >
            <img src={item.image} alt={item.title} className="h-28 w-28 rounded-2xl bg-slate-50 object-contain p-3" />
            <div className="flex-1 space-y-3">
              <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
              <p className="text-sm text-slate-500 capitalize">{item.category}</p>
              <div className="flex flex-wrap items-center gap-4">
                <div className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="text-lg font-semibold text-slate-600"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={item.quantity}
                    onChange={(event) => updateQuantity(item.id, Number(event.target.value))}
                    className="w-14 border-none text-center text-base font-semibold focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="text-lg font-semibold text-slate-600"
                  >
                    +
                  </button>
                </div>
                <p className="text-lg font-bold text-slate-900">{formatCurrency(item.price * item.quantity)}</p>
                <button
                  type="button"
                  onClick={() => removeFromCart(item.id)}
                  className="text-sm font-semibold text-red-500 transition hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
        <h3 className="text-xl font-semibold text-slate-900">Order Summary</h3>
        <div className="mt-6 space-y-3 text-sm text-slate-600">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(totals.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax (7%)</span>
            <span>{formatCurrency(totals.tax)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold text-slate-900">
            <span>Total</span>
            <span>{formatCurrency(totals.total)}</span>
          </div>
        </div>
        {checkoutError && (
          <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {checkoutError}
          </div>
        )}
        <button
          type="button"
          onClick={handleCheckout}
          disabled={checkoutLoading || !user}
          className="mt-6 w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {checkoutLoading ? 'Processing...' : !user ? 'Login to Checkout' : 'Checkout'}
        </button>
      </div>
    </div>
  );
}
