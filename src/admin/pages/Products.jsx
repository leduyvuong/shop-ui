import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useAdminContext } from '../context/AdminContext.jsx';
import Modal from '../components/Modal.jsx';

const ITEMS_PER_PAGE = 8;

const tableVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

const emptyForm = {
  title: '',
  price: '',
  category: '',
  image: '',
  rating: '',
};

export default function Products() {
  const { products, loadingProducts, addProduct, updateProduct, deleteProduct, showToast } = useAdminContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [formValues, setFormValues] = useState(emptyForm);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const filteredProducts = useMemo(() => {
    const search = searchTerm.toLowerCase();
    const result = products.filter((product) => {
      return (
        product.title.toLowerCase().includes(search) ||
        product.category.toLowerCase().includes(search)
      );
    });

    return result.sort((a, b) => {
      const priceA = Number(a.price) || 0;
      const priceB = Number(b.price) || 0;
      return sortOrder === 'asc' ? priceA - priceB : priceB - priceA;
    });
  }, [products, searchTerm, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const pageStart = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageProducts = filteredProducts.slice(pageStart, pageStart + ITEMS_PER_PAGE);

  const handleChangeForm = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormValues(emptyForm);
    setEditingProduct(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormValues({
      title: product.title,
      price: product.price,
      category: product.category,
      image: product.image ?? '',
      rating: product.rating?.rate ?? '',
    });
    setIsAddModalOpen(true);
  };

  const handleSubmitForm = (event) => {
    event.preventDefault();

    if (!formValues.title || !formValues.price || !formValues.category) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    const payload = {
      title: formValues.title,
      price: Number(formValues.price),
      category: formValues.category,
      image:
        formValues.image ||
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80',
      rating: {
        rate: Number(formValues.rating) || (editingProduct?.rating?.rate ?? 0),
        count: editingProduct?.rating?.count ?? 0,
      },
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, payload);
      showToast('Product updated successfully.');
    } else {
      const nextId = products.length ? Math.max(...products.map((p) => Number(p.id))) + 1 : 1;
      addProduct({ id: nextId, ...payload });
      showToast('Product added successfully.');
      setCurrentPage(Math.ceil((products.length + 1) / ITEMS_PER_PAGE));
    }

    setIsAddModalOpen(false);
    resetForm();
  };

  const handleDeleteProduct = () => {
    if (!productToDelete) return;
    deleteProduct(productToDelete.id);
    showToast('Product removed from catalogue.', 'info');
    setProductToDelete(null);
    setIsDeleteModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative w-full sm:max-w-xs">
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name or category"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            />
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">🔍</span>
          </div>

          <select
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="asc">Price: Low to High</option>
            <option value="desc">Price: High to Low</option>
          </select>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
        >
          <span>➕ Add Product</span>
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm text-slate-700 dark:divide-slate-800 dark:text-slate-200">
            <thead className="bg-slate-50 dark:bg-slate-900/60">
              <tr>
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">Image</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Price</th>
                <th className="px-4 py-3 font-semibold">Rating</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loadingProducts && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-sm text-slate-500">
                    Loading products…
                  </td>
                </tr>
              )}
              {!loadingProducts && !pageProducts.length && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-sm text-slate-500">
                    No products match your filters.
                  </td>
                </tr>
              )}
              {!loadingProducts &&
                pageProducts.map((product) => (
                  <motion.tr
                    key={product.id}
                    variants={tableVariants}
                    initial="hidden"
                    animate="visible"
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50"
                  >
                    <td className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">{product.id}</td>
                    <td className="px-4 py-3">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="h-12 w-12 rounded-lg object-cover shadow-sm"
                      />
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{product.title}</td>
                    <td className="px-4 py-3 capitalize text-slate-500 dark:text-slate-300">{product.category}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">${Number(product.price).toFixed(2)}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-300">{product.rating?.rate ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-indigo-400 hover:text-indigo-500 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-400"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setProductToDelete(product);
                            setIsDeleteModalOpen(true);
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

        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/60">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-600 transition enabled:hover:border-indigo-400 enabled:hover:text-indigo-500 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-600 transition enabled:hover:border-indigo-400 enabled:hover:text-indigo-500 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          resetForm();
        }}
        title={editingProduct ? 'Edit Product' : 'Add Product'}
        footer={
          <>
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                resetForm();
              }}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="product-form"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500"
            >
              {editingProduct ? 'Save changes' : 'Create product'}
            </button>
          </>
        }
      >
        <form id="product-form" className="grid gap-4" onSubmit={handleSubmitForm}>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Title</label>
            <input
              type="text"
              value={formValues.title}
              onChange={(event) => handleChangeForm('title', event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Price</label>
              <input
                type="number"
                step="0.01"
                value={formValues.price}
                onChange={(event) => handleChangeForm('price', event.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Category</label>
              <input
                type="text"
                value={formValues.category}
                onChange={(event) => handleChangeForm('category', event.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Image URL</label>
            <input
              type="url"
              value={formValues.image}
              onChange={(event) => handleChangeForm('image', event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              placeholder="https://"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Rating</label>
            <input
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={formValues.rating}
              onChange={(event) => handleChangeForm('rating', event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            />
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Product"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteProduct}
              className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-rose-400"
            >
              Delete
            </button>
          </>
        }
      >
        <p>
          Are you sure you want to permanently remove{' '}
          <span className="font-semibold text-slate-900 dark:text-white">{productToDelete?.title}</span> from the catalogue?
        </p>
      </Modal>
    </div>
  );
}

