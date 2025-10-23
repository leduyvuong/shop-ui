import { useState } from 'react';
import { motion } from 'framer-motion';

const stars = [1, 2, 3, 4, 5];

export default function ReviewForm({ onSubmit }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!rating) return;
    setSubmitting(true);
    try {
      await onSubmit({ rating, comment: comment.trim() });
      setComment('');
      setRating(5);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
    >
      <div>
        <p className="text-sm font-semibold text-slate-700">Your Rating</p>
        <div className="mt-2 flex gap-2">
          {stars.map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`text-2xl transition ${star <= rating ? 'text-amber-500' : 'text-slate-300'}`}
              aria-label={`${star} star${star > 1 ? 's' : ''}`}
            >
              ★
            </button>
          ))}
        </div>
      </div>
      <div>
        <label htmlFor="review-comment" className="text-sm font-semibold text-slate-700">
          Share your thoughts
        </label>
        <textarea
          id="review-comment"
          rows={4}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-primary focus:bg-white focus:outline-none"
          placeholder="What did you love about this product?"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </motion.form>
  );
}
