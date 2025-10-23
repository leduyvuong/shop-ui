import { AnimatePresence, motion } from 'framer-motion';

const itemVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
};

const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const renderStars = (rating) => {
  const rounded = Math.round(rating);
  return '★'.repeat(rounded).padEnd(5, '☆');
};

export default function ReviewList({ reviews }) {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-6 text-center text-sm text-slate-500">
        No reviews yet. Be the first to share your experience!
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      <AnimatePresence>
        {reviews.map((review) => (
          <motion.li
            key={review.id}
            layout
            variants={itemVariants}
            initial="initial"
            animate="animate"
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-900">{review.user}</p>
              <p className="text-xs text-slate-400">{formatDate(review.created_at)}</p>
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-amber-500">
              <span>{renderStars(review.rating)}</span>
              <span className="text-xs font-medium text-slate-400">{review.rating.toFixed(1)}</span>
            </div>
            {review.comment && <p className="mt-3 text-sm leading-relaxed text-slate-600">{review.comment}</p>}
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
