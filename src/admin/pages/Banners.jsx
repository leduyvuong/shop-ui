import { useCallback, useEffect, useMemo, useState } from 'react';
import { Reorder, motion } from 'framer-motion';
import Modal from '../components/Modal.jsx';
import { useAdminContext } from '../context/AdminContext.jsx';

const STORAGE_KEY = 'admin_banners';

const defaultBanners = [
  {
    id: 1,
    title: 'Summer Sale',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=640&q=80',
    link: '/products?category=summer',
    active: true,
    order: 1,
  },
  {
    id: 2,
    title: 'New Arrivals',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=640&q=80',
    link: '/products/new',
    active: true,
    order: 2,
  },
];

const filterOptions = [
  { value: 'all', label: 'All banners' },
  { value: 'active', label: 'Active only' },
  { value: 'inactive', label: 'Inactive only' },
];

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export default function Banners() {
  const { showToast } = useAdminContext();
  const [banners, setBanners] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalForm, setModalForm] = useState({ title: '', link: '', image: '', active: true });

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setBanners(parsed);
          return;
        }
      }
      setBanners(defaultBanners);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultBanners));
    } catch (error) {
      console.error('Failed to load banners', error);
      setBanners(defaultBanners);
    }
  }, []);

  const persistBanners = useCallback((next) => {
    const sorted = [...next]
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((banner, index) => ({ ...banner, order: index + 1 }));
    setBanners(sorted);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted));
    } catch (error) {
      console.error('Failed to persist banners', error);
    }
  }, []);

  const handleToggle = (id) => {
    persistBanners(
      banners.map((banner) => (banner.id === id ? { ...banner, active: !banner.active } : banner)),
    );
    showToast?.('Banner status updated');
  };

  const handleDelete = (id) => {
    persistBanners(banners.filter((banner) => banner.id !== id));
    showToast?.('Banner removed', 'info');
  };

  const handleFieldChange = (id, key, value) => {
    persistBanners(
      banners.map((banner) => (banner.id === id ? { ...banner, [key]: value } : banner)),
    );
  };

  const filteredBanners = useMemo(() => {
    const term = search.trim().toLowerCase();
    return banners
      .filter((banner) => {
        if (filter === 'active') return banner.active;
        if (filter === 'inactive') return !banner.active;
        return true;
      })
      .filter((banner) => {
        if (!term) return true;
        return [banner.title, banner.link].some((value) => value?.toLowerCase?.().includes(term));
      })
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [banners, filter, search]);

  const openModal = () => {
    setModalForm({ title: '', link: '', image: '', active: true, order: banners.length + 1 });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleModalSubmit = (event) => {
    event.preventDefault();
    const nextId = banners.length ? Math.max(...banners.map((banner) => banner.id)) + 1 : 1;
    const desiredOrder = Number(modalForm.order ?? banners.length + 1);
    const safeOrder = Number.isFinite(desiredOrder) && desiredOrder > 0 ? desiredOrder : banners.length + 1;
    const newBanner = {
      id: nextId,
      title: modalForm.title || 'Untitled banner',
      link: modalForm.link || '#',
      image:
        modalForm.image ||
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=640&q=80',
      active: modalForm.active,
      order: safeOrder,
    };
    const nextBanners = [...banners, newBanner];
    persistBanners(nextBanners);
    showToast?.('Banner created');
    setModalOpen(false);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setModalForm((prev) => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleReorder = (nextOrder) => {
    const filteredIds = new Set(nextOrder.map((banner) => banner.id));
    const updatedFiltered = nextOrder.map((banner, index) => ({ ...banner, order: index + 1 }));
    const remaining = banners.filter((banner) => !filteredIds.has(banner.id));
    const startingIndex = updatedFiltered.length;
    const updatedRemaining = remaining.map((banner, index) => ({ ...banner, order: startingIndex + index + 1 }));
    persistBanners([...updatedFiltered, ...updatedRemaining]);
    showToast?.('Banner order updated', 'info');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Banner management</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage promotional banners displayed on the storefront hero section.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search banners"
            className="w-48 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            {filterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={openModal}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            <span aria-hidden>➕</span>
            Add banner
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white p-4 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/60">
        {filteredBanners.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">No banners match the selected filters.</div>
        ) : (
          <Reorder.Group axis="y" values={filteredBanners} onReorder={handleReorder} className="space-y-4">
            {filteredBanners.map((banner) => (
              <Reorder.Item key={banner.id} value={banner} className="focus:outline-none">
                <motion.div
                  layout
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  className="group grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900"
                >
                  <div className="grid items-start gap-4 md:grid-cols-[220px_1fr_auto]">
                    <div className="relative h-40 overflow-hidden rounded-2xl bg-slate-100">
                      <img
                        src={banner.image}
                        alt={banner.title}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleToggle(banner.id)}
                        className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold shadow ${
                          banner.active
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-600/80 text-slate-100'
                        }`}
                      >
                        {banner.active ? 'Active' : 'Inactive'}
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Banner title
                        </label>
                        <input
                          value={banner.title}
                          onChange={(event) => handleFieldChange(banner.id, 'title', event.target.value)}
                          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Redirect link
                        </label>
                        <input
                          value={banner.link}
                          onChange={(event) => handleFieldChange(banner.id, 'link', event.target.value)}
                          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        />
                      </div>
                    </div>

                    <div className="flex h-full flex-col items-end justify-between gap-3">
                      <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        Order #{banner.order ?? 0}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleDelete(banner.id)}
                          className="rounded-xl border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:border-rose-300 hover:bg-rose-50 dark:border-rose-500/50 dark:text-rose-300 dark:hover:bg-rose-500/10"
                        >
                          Delete
                        </button>
                        <span className="cursor-grab rounded-xl bg-slate-100 px-3 py-2 text-xs text-slate-500 transition group-hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300">Drag</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title="Add new banner"
        footer={
          <>
            <button
              type="button"
              onClick={closeModal}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="banner-form"
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Create banner
            </button>
          </>
        }
      >
        <form id="banner-form" onSubmit={handleModalSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Banner title
            </label>
            <input
              required
              value={modalForm.title}
              onChange={(event) => setModalForm((prev) => ({ ...prev, title: event.target.value }))}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Redirect link
            </label>
            <input
              value={modalForm.link}
              onChange={(event) => setModalForm((prev) => ({ ...prev, link: event.target.value }))}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Upload image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="mt-2 block w-full text-xs text-slate-600 dark:text-slate-300"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                or paste image URL
              </label>
              <input
                value={modalForm.image}
                onChange={(event) => setModalForm((prev) => ({ ...prev, image: event.target.value }))}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>
          <div className="flex items-center justify-between gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={modalForm.active}
                onChange={(event) => setModalForm((prev) => ({ ...prev, active: event.target.checked }))}
                className="h-4 w-4 rounded border-slate-300 text-indigo-500 focus:ring-indigo-500 dark:border-slate-600"
              />
              Active banner
            </label>
            <input
              type="number"
              min="1"
              value={modalForm.order ?? banners.length + 1}
              onChange={(event) => setModalForm((prev) => ({ ...prev, order: Number(event.target.value) }))}
              className="w-32 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              placeholder="Order"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
