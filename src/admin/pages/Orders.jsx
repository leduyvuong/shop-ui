import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { fetchOrders, fetchUsers } from '../../utils/api.js';
import { formatCurrency } from '../../utils/format.js';
import { useAdminContext } from '../context/AdminContext.jsx';

const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const statusStyles = {
  pending: 'bg-amber-100 text-amber-700',
  processing: 'bg-sky-100 text-sky-700',
  completed: 'bg-emerald-100 text-emerald-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  cancelled: 'bg-rose-100 text-rose-700',
};

const getStatusStyle = (status) => {
  if (!status) return 'bg-slate-200 text-slate-700';
  const normalized = status.toLowerCase();
  return statusStyles[normalized] ?? 'bg-slate-200 text-slate-700';
};

const formatAddress = (address) => {
  if (!address) return '—';
  const { street, ward, district, province } = address;
  return [street, ward, district, province].filter(Boolean).join(', ');
};

const buildItemsSummary = (items) => {
  if (!Array.isArray(items) || items.length === 0) return '—';
  return items
    .map((item) => {
      const name = item.product?.title ?? item.product?.name ?? 'Sản phẩm';
      return `${name} ×${item.quantity}`;
    })
    .join(', ');
};

export default function Orders() {
  const { showToast } = useAdminContext();
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const usersById = useMemo(() => {
    const map = new Map();
    users.forEach((user) => {
      if (user?.id == null) return;
      map.set(user.id, user);
    });
    return map;
  }, [users]);

  const loadData = useCallback(
    async ({ notifyOnSuccess = false } = {}) => {
      setLoading(true);
      setError(null);
      try {
        const [{ orders: fetchedOrders }, { users: fetchedUsers }] = await Promise.all([
          fetchOrders({ perPage: 50 }),
          fetchUsers({ perPage: 100 }),
        ]);
        setOrders(fetchedOrders);
        setUsers(fetchedUsers);
        if (notifyOnSuccess && showToast) {
          showToast('Orders refreshed successfully', 'info');
        }
      } catch (err) {
        console.error('Failed to load admin orders', err);
        const message = err instanceof Error ? err.message : 'Failed to load orders';
        setError(message);
        if (showToast) {
          showToast(message, 'error');
        }
      } finally {
        setLoading(false);
      }
    },
    [showToast],
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    loadData({ notifyOnSuccess: true });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Orders management</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Review customer purchases, payment status, and fulfillment progress.
          </p>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          <span aria-hidden>⟳</span>
          <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-sm dark:border-slate-700/60 dark:bg-slate-900">
        {loading ? (
          <div className="py-16 text-center text-sm text-slate-500 dark:text-slate-400">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-500 dark:text-slate-400">No orders found.</div>
        ) : (
          <table className="min-w-full divide-y divide-slate-100 text-sm dark:divide-slate-800">
            <thead className="bg-slate-50/70 text-left uppercase tracking-wide text-slate-500 dark:bg-slate-900/60 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium">Order</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Items</th>
                <th className="px-6 py-4 font-medium text-right">Total</th>
                <th className="px-6 py-4 font-medium">Placed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/70 dark:divide-slate-800/60">
              {orders.map((order) => {
                const user = order.userId ? usersById.get(order.userId) : null;
                const statusClassName = getStatusStyle(order.status);
                return (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="align-top text-slate-700 dark:text-slate-200"
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">#{order.id}</div>
                      <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Payment: {order.paymentMethod?.toUpperCase?.() ?? order.paymentMethod}
                      </div>
                      <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Shipping fee: {formatCurrency(order.shippingFee)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {user?.name ?? 'Unknown customer'}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{user?.email ?? '—'}</div>
                      <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{formatAddress(order.address)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClassName}`}>
                        {order.status}
                      </span>
                      {order.payment?.status && (
                        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                          Payment status: {order.payment.status}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                        {buildItemsSummary(order.items)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-900 dark:text-slate-100">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                      {order.createdAt ? dateFormatter.format(new Date(order.createdAt)) : '—'}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
