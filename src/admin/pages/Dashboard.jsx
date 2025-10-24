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

  const inventoryValueByCategory = useMemo(() => {
    const totals = Object.entries(
      products.reduce((acc, product) => {
        const category = product.category || 'uncategorized';
        const price = Number(product.price || 0);
        acc[category] = (acc[category] ?? 0) + price;
        return acc;
      }, {}),
    ).map(([category, total]) => ({ category, total }));

    return totals.sort((a, b) => b.total - a.total).slice(0, 6);
  }, [products]);

  const chartMetrics = useMemo(() => {
    if (!inventoryValueByCategory.length) {
      return {
        width: 640,
        height: 260,
        paddingX: 32,
        paddingY: 28,
        points: [],
        linePath: '',
        areaPath: '',
        ticks: [],
        maxValue: 0,
      };
    }

    const width = 640;
    const height = 260;
    const paddingX = 32;
    const paddingY = 28;
    const innerWidth = width - paddingX * 2;
    const innerHeight = height - paddingY * 2;
    const maxValue = Math.max(...inventoryValueByCategory.map((item) => item.total), 1);

    const points = inventoryValueByCategory.map((item, index, array) => {
      const ratio = array.length === 1 ? 0.5 : index / (array.length - 1);
      const x = paddingX + ratio * innerWidth;
      const y = paddingY + (1 - item.total / maxValue) * innerHeight;
      return { ...item, x, y };
    });

    const linePath = points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x},${point.y}`).join(' ');
    const lastPoint = points[points.length - 1];
    const areaPath = points.length
      ? `M${points[0].x},${height - paddingY} ${points
          .map((point) => `L${point.x},${point.y}`)
          .join(' ')} L${lastPoint.x},${height - paddingY} Z`
      : '';

    const tickCount = 4;
    const ticks = Array.from({ length: tickCount + 1 }, (_, index) => {
      const ratio = index / tickCount;
      const value = Math.round(maxValue * (1 - ratio));
      const y = paddingY + ratio * innerHeight;
      return { value, y };
    });

    return { width, height, paddingX, paddingY, points, linePath, areaPath, ticks, maxValue };
  }, [inventoryValueByCategory]);

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

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Inventory value by category</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Visualise how much revenue potential sits in each collection.
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            Top {inventoryValueByCategory.length || 0} categories
          </span>
        </div>

        <div className="mt-6 overflow-hidden">
          {chartMetrics.points.length ? (
            <svg
              viewBox={`0 0 ${chartMetrics.width} ${chartMetrics.height}`}
              role="img"
              aria-label="Inventory value trend"
              className="w-full"
            >
              <defs>
                <linearGradient id="inventoryGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="rgba(99, 102, 241, 0.45)" />
                  <stop offset="100%" stopColor="rgba(56, 189, 248, 0.05)" />
                </linearGradient>
              </defs>
              {chartMetrics.ticks.map((tick) => (
                <g key={tick.y}>
                  <line
                    x1={chartMetrics.paddingX}
                    x2={chartMetrics.width - chartMetrics.paddingX}
                    y1={tick.y}
                    y2={tick.y}
                    stroke="rgba(148, 163, 184, 0.25)"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={chartMetrics.paddingX - 12}
                    y={tick.y + 4}
                    fontSize="11"
                    textAnchor="end"
                    fill="currentColor"
                    className="fill-slate-400"
                  >
                    ${tick.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </text>
                </g>
              ))}

              <path d={chartMetrics.areaPath} fill="url(#inventoryGradient)" />
              <path d={chartMetrics.linePath} fill="none" stroke="url(#inventoryGradient)" strokeWidth="3" strokeLinecap="round" />

              {chartMetrics.points.map((point) => (
                <g key={point.category}>
                  <circle cx={point.x} cy={point.y} r={5} fill="#6366F1" stroke="white" strokeWidth="2" />
                  <text
                    x={point.x}
                    y={chartMetrics.height - chartMetrics.paddingY + 20}
                    fontSize="11"
                    textAnchor="middle"
                    className="fill-slate-500 dark:fill-slate-400"
                  >
                    {point.category}
                  </text>
                </g>
              ))}
            </svg>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
              Load products to unlock chart insights.
            </div>
          )}
        </div>
      </motion.section>

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

