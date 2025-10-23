import { motion } from 'framer-motion';
import Loader from './Loader.jsx';
import ProductCard from './ProductCard.jsx';

export default function SearchResults({ products, loading, error, query }) {
  if (loading) {
    return <Loader label="Searching products" />;
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-100 bg-red-50 p-6 text-red-600">
        <p className="font-semibold">{error}</p>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-100 bg-white p-10 text-center text-sm text-slate-500">
        No products found{query ? ` for "${query}"` : ''}. Try a different keyword or explore other categories.
      </div>
    );
  }

  return (
    <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" transition={{ layout: { duration: 0.3 } }}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </motion.div>
  );
}
