import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { fetchOrders, fetchUsers } from '../../utils/api.js';
import { useAdminContext } from '../context/AdminContext.jsx';

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const chartWrapperVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'short' });

const fallbackSales = [
  { month: 'Jan', sales: 8200 },
  { month: 'Feb', sales: 9600 },
  { month: 'Mar', sales: 11200 },
  { month: 'Apr', sales: 9800 },
  { month: 'May', sales: 13500 },
  { month: 'Jun', sales: 14200 },
];

const ratingBuckets = [1, 2, 3, 4, 5];

function StatCard({ title, value, helper }) {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">{value}</p>
      {helper && <p className="mt-2 text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">{helper}</p>}
    </motion.div>
  );
}

export default function Analytics() {
  const { products, reviews, loadingProducts } = useAdminContext();
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [{ orders: fetchedOrders }, { users: fetchedUsers }] = await Promise.all([
        fetchOrders({ perPage: 100 }),
        fetchUsers({ perPage: 100 }),
      ]);
      setOrders(fetchedOrders ?? []);
      setUsers(fetchedUsers ?? []);
    } catch (err) {
      console.error('Failed to load analytics data', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const salesByMonth = useMemo(() => {
    if (!orders.length) {
      return fallbackSales;
    }
    const map = new Map();
    orders.forEach((order) => {
      if (!order.createdAt) return;
      const date = new Date(order.createdAt);
      if (Number.isNaN(date.getTime())) return;
      const month = date.getMonth();
      const year = date.getFullYear();
      const key = `${year}-${month}`;
      const monthLabel = monthFormatter.format(date);
      const current = map.get(key) ?? { month: monthLabel, sales: 0, order: year * 12 + month };
      current.sales += Number(order.total ?? 0);
      map.set(key, current);
    });
    return Array.from(map.values())
      .sort((a, b) => a.order - b.order)
      .map(({ order: _order, ...entry }) => entry);
  }, [orders]);

  const productsPerCategory = useMemo(() => {
    if (!products.length) return [];
    const totals = products.reduce((acc, product) => {
      const category = product.category || 'Uncategorised';
      acc.set(category, (acc.get(category) ?? 0) + 1);
      return acc;
    }, new Map());
    return Array.from(totals.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [products]);

  const ratingDistribution = useMemo(() => {
    if (!reviews.length) {
      return ratingBuckets.map((rating) => ({ name: `${rating}★`, value: 0 }));
    }
    const counts = ratingBuckets.reduce((acc, rating) => acc.set(rating, 0), new Map());
    reviews.forEach((review) => {
      const rating = Math.round(review.rating ?? 0);
      if (counts.has(rating)) {
        counts.set(rating, (counts.get(rating) ?? 0) + 1);
      }
    });
    return ratingBuckets.map((rating) => ({ name: `${rating}★`, value: counts.get(rating) ?? 0 }));
  }, [reviews]);

  const topCategories = useMemo(() => productsPerCategory.slice(0, 5), [productsPerCategory]);

  const topRatedProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => (b.rating?.rate ?? 0) - (a.rating?.rate ?? 0))
      .slice(0, 5);
  }, [products]);

  const averageRating = useMemo(() => {
    if (!reviews.length) return 0;
    const total = reviews.reduce((sum, review) => sum + Number(review.rating ?? 0), 0);
    return total / reviews.length;
  }, [reviews]);

  const statCards = useMemo(
    () => [
      {
        title: 'Total products',
        value: loadingProducts ? 'Loading…' : products.length.toString(),
        helper: 'Catalogue size',
      },
      {
        title: 'Total reviews',
        value: reviews.length.toString(),
        helper: 'Customer feedback',
      },
      {
        title: 'Avg. rating',
        value: `${averageRating.toFixed(1)} / 5`,
        helper: 'Across all reviews',
      },
      {
        title: 'Total customers',
        value: loading ? 'Loading…' : users.length.toString(),
        helper: 'Fetched from API',
      },
    ],
    [averageRating, loading, loadingProducts, products.length, reviews.length, users.length],
  );

  const pieColors = ['#6366f1', '#14b8a6', '#f97316', '#0ea5e9', '#ec4899'];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Analytics dashboard</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Track store health, discover top performing products, and monitor customer sentiment.
          </p>
        </div>
        <button
          type="button"
          onClick={loadData}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          <span aria-hidden>⟳</span>
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      <motion.section
        variants={chartWrapperVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.45, delay: 0.05 }}
        className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/60"
      >
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Top categories</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Highest performing categories ranked by product availability.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {topCategories.length === 0 ? (
            <span className="text-sm text-slate-500 dark:text-slate-400">No category data available.</span>
          ) : (
            topCategories.map((category, index) => (
              <span
                key={category.category}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--theme-primary-color,#6366f1)]/10 text-xs font-semibold text-[var(--theme-primary-color,#6366f1)]">
                  {index + 1}
                </span>
                <span>{category.category}</span>
                <span className="text-xs text-slate-400">{category.count} products</span>
              </span>
            ))
          )}
        </div>
      </motion.section>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.section
          variants={chartWrapperVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.45 }}
          className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/60"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Monthly sales</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Gross revenue grouped by completed orders.</p>
            </div>
          </div>
          <div className="mt-6 h-64">
            <ResponsiveContainer>
              <LineChart data={salesByMonth}>
                <CartesianGrid strokeDasharray="4 4" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend payload={[{ value: 'Sales', type: 'line' }]} />
                <Line dataKey="sales" stroke="var(--theme-primary-color, #6366f1)" strokeWidth={3} dot={{ r: 4 }} fill="rgba(99,102,241,0.12)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.section>

        <motion.section
          variants={chartWrapperVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.45, delay: 0.1 }}
          className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/60"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Products per category</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Top categories ranked by product count.</p>
            </div>
          </div>
          <div className="mt-6 h-64">
            {productsPerCategory.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500 dark:text-slate-400">
                Not enough category data yet.
              </div>
            ) : (
              <ResponsiveContainer>
                <BarChart data={productsPerCategory}>
                  <CartesianGrid strokeDasharray="4 4" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" radius={10} fill="var(--theme-secondary-color, #10b981)">
                    {productsPerCategory.map((entry, index) => (
                      <Cell key={entry.category} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.section>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <motion.section
          variants={chartWrapperVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.45, delay: 0.15 }}
          className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/60"
        >
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Top rated products</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Pulled from product catalogue and user reviews.</p>
          <ul className="mt-4 space-y-3">
            {topRatedProducts.length === 0 ? (
              <li className="text-sm text-slate-500 dark:text-slate-400">No product ratings available yet.</li>
            ) : (
              topRatedProducts.map((product) => (
                <li
                  key={product.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-800"
                >
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{product.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{product.category}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-200">
                    ⭐ {product.rating?.rate?.toFixed?.(1) ?? '0.0'}
                  </span>
                </li>
              ))
            )}
          </ul>
        </motion.section>

        <motion.section
          variants={chartWrapperVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.45, delay: 0.2 }}
          className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/60"
        >
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Rating distribution</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Based on customer reviews stored in the system.</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer>
              <PieChart>
                <Tooltip />
                <Legend />
                <Pie data={ratingDistribution} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={4}>
                  {ratingDistribution.map((entry, index) => (
                    <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
