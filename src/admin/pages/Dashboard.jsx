import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAdminContext } from '../context/AdminContext.jsx';

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const { products, reviews, loadingProducts } = useAdminContext();

  const stats = useMemo(() => {
    if (!products.length) {
      return {
        totalProducts: 0,
        averagePrice: 0,
        averageRating: 0,
        categoryDistribution: {},
      };
    }

    const totalProducts = products.length;
    const averagePrice = products.reduce((sum, product) => sum + Number(product.price || 0), 0) / totalProducts;
    const averageRating =
      products.reduce((sum, product) => sum + Number(product.rating?.rate || 0), 0) / totalProducts;

    const categoryDistribution = products.reduce((acc, product) => {
      const category = product.category || 'uncategorized';
      acc[category] = (acc[category] ?? 0) + 1;
      return acc;
    }, {});

    return { totalProducts, averagePrice, averageRating, categoryDistribution };
  }, [products]);

  const maxCategoryValue = useMemo(() => {
    const values = Object.values(stats.categoryDistribution ?? {});
    if (!values.length) return 1;
    return Math.max(...values);
  }, [stats.categoryDistribution]);

  const recentReviews = useMemo(() => {
    return [...reviews]
      .sort((a, b) => new Date(b.created_at ?? 0) - new Date(a.created_at ?? 0))
      .slice(0, 4);
  }, [reviews]);

  const cardData = [
    {
      label: 'Total Products',
      value: stats.totalProducts,
      helper: 'Managed inventory items',
    },
    {
      label: 'Average Price',
      value: stats.averagePrice ? `$${stats.averagePrice.toFixed(2)}` : '$0.00',
      helper: 'Across all products',
    },
    {
      label: 'Average Rating',
      value: stats.averageRating ? stats.averageRating.toFixed(1) : '0.0',
      helper: 'Customer sentiment',
    },
    {
      label: 'Total Reviews',
      value: reviews.length,
      helper: 'Stored in local reviews',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cardData.map((card, index) => (
          <motion.div
            key={card.label}
            variants={cardVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: index * 0.05 }}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <p className="text-sm text-slate-500 dark:text-slate-400">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{card.value}</p>
            <p className="mt-2 text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">{card.helper}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Category Distribution</h2>
            {loadingProducts && <span className="text-xs text-slate-400">Loading products…</span>}
          </div>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Track how products are spread across categories.
          </p>

          <div className="mt-6 space-y-4">
            {Object.entries(stats.categoryDistribution).map(([category, count]) => (
              <div key={category}>
                <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                  <span className="font-medium text-slate-700 dark:text-slate-200">{category}</span>
                  <span>{count} items</span>
                </div>
                <div className="mt-2 h-3 rounded-full bg-slate-200/70 dark:bg-slate-800">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500"
                    style={{ width: `${Math.max(8, Math.round((count / maxCategoryValue) * 100))}%` }}
                  />
                </div>
              </div>
            ))}
            {!Object.keys(stats.categoryDistribution).length && (
              <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
                No product data available yet.
              </div>
            )}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Reviews</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Latest feedback from shoppers.</p>

          <div className="mt-4 space-y-4">
            {recentReviews.map((review) => {
              const product = products.find((item) => item.id === review.productId);
              return (
                <div key={review.id} className="rounded-xl border border-slate-200/70 p-4 dark:border-slate-700">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-900 dark:text-white">{review.user}</span>
                    <span className="font-semibold text-amber-500">{review.rating}★</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{review.comment}</p>
                  <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                    {product ? product.title : `Product #${review.productId}`}
                  </p>
                </div>
              );
            })}
            {!recentReviews.length && (
              <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
                There are no reviews stored yet.
              </div>
            )}
          </div>
        </motion.section>
      </div>
    </div>
  );
}

