import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Modal from '../components/Modal.jsx';
import { useAdminContext } from '../context/AdminContext.jsx';

const tableVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export default function Reviews() {
  const { reviews, products, deleteReview, updateReview, showToast } = useAdminContext();
  const [ratingFilter, setRatingFilter] = useState('all');
  const [productFilter, setProductFilter] = useState('all');
  const [editingReview, setEditingReview] = useState(null);
  const [formValues, setFormValues] = useState({ comment: '', reply: '' });

  const productLookup = useMemo(() => {
    return products.reduce((acc, product) => {
      acc[product.id] = product;
      return acc;
    }, {});
  }, [products]);

  const ratingOptions = useMemo(() => {
    const uniqueRatings = Array.from(new Set(reviews.map((review) => review.rating)));
    return ['all', ...uniqueRatings.sort((a, b) => b - a).map((rating) => rating.toString())];
  }, [reviews]);

  const productOptions = useMemo(() => {
    const ids = Array.from(new Set(reviews.map((review) => review.productId)));
    return ['all', ...ids.map((id) => id.toString())];
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      const ratingMatches = ratingFilter === 'all' || review.rating === Number(ratingFilter);
      const productMatches = productFilter === 'all' || review.productId === Number(productFilter);
      return ratingMatches && productMatches;
    });
  }, [reviews, ratingFilter, productFilter]);

  const openEditModal = (review) => {
    setEditingReview(review);
    setFormValues({ comment: review.comment ?? '', reply: review.reply ?? '' });
  };

  const closeModal = () => {
    setEditingReview(null);
    setFormValues({ comment: '', reply: '' });
  };

  const handleSubmitEdit = (event) => {
    event.preventDefault();
    if (!editingReview) return;
    updateReview(editingReview.id, { comment: formValues.comment, reply: formValues.reply });
    showToast('Review updated successfully.');
    closeModal();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <select
            value={ratingFilter}
            onChange={(event) => setRatingFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            {ratingOptions.map((option) => (
              <option key={option} value={option}>
                {option === 'all' ? 'All ratings' : `${option} stars`}
              </option>
            ))}
          </select>

          <select
            value={productFilter}
            onChange={(event) => setProductFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            {productOptions.map((option) => (
              <option key={option} value={option}>
                {option === 'all' ? 'All products' : `Product #${option}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm text-slate-700 dark:divide-slate-800 dark:text-slate-200">
            <thead className="bg-slate-50 dark:bg-slate-900/60">
              <tr>
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 font-semibold">User</th>
                <th className="px-4 py-3 font-semibold">Rating</th>
                <th className="px-4 py-3 font-semibold">Comment</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {!filteredReviews.length && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-sm text-slate-500">
                    No reviews found for the selected filters.
                  </td>
                </tr>
              )}

              {filteredReviews.map((review) => (
                <motion.tr
                  key={review.id}
                  variants={tableVariants}
                  initial="hidden"
                  animate="visible"
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50"
                >
                  <td className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">{review.id}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {productLookup[review.productId]?.title ?? `Product #${review.productId}`}
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{review.user}</td>
                  <td className="px-4 py-3 font-semibold text-amber-500">{review.rating}★</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    <p>{review.comment}</p>
                    {review.reply && (
                      <p className="mt-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-xs text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300">
                        Reply: {review.reply}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => openEditModal(review)}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-indigo-400 hover:text-indigo-500 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-400"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          deleteReview(review.id);
                          showToast('Review deleted.', 'info');
                        }}
                        className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 dark:border-rose-400/40 dark:text-rose-300 dark:hover:bg-rose-500/20"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={Boolean(editingReview)}
        onClose={closeModal}
        title="Update Review"
        footer={
          <>
            <button
              type="button"
              onClick={closeModal}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="review-form"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500"
            >
              Save changes
            </button>
          </>
        }
      >
        <form id="review-form" className="space-y-4" onSubmit={handleSubmitEdit}>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Comment</label>
            <textarea
              value={formValues.comment}
              onChange={(event) => setFormValues((prev) => ({ ...prev, comment: event.target.value }))}
              rows={4}
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Reply</label>
            <textarea
              value={formValues.reply}
              onChange={(event) => setFormValues((prev) => ({ ...prev, reply: event.target.value }))}
              rows={3}
              placeholder="Optional response to the customer"
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}

