import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { fetchUsers } from '../../utils/api.js';
import { useAdminContext } from '../context/AdminContext.jsx';

const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export default function Users() {
  const { showToast } = useAdminContext();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const loadUsers = useCallback(
    async ({ notifyOnSuccess = false } = {}) => {
      setLoading(true);
      setError(null);
      try {
        const { users: fetchedUsers } = await fetchUsers({ perPage: 100 });
        setUsers(fetchedUsers);
        if (notifyOnSuccess && showToast) {
          showToast('Users refreshed successfully', 'info');
        }
      } catch (err) {
        console.error('Failed to load admin users', err);
        const message = err instanceof Error ? err.message : 'Failed to load users';
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
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    if (!search) return users;
    const term = search.toLowerCase();
    return users.filter((user) => {
      return [user.name, user.email, user.role].some((value) => value?.toLowerCase?.().includes(term));
    });
  }, [users, search]);

  const handleRefresh = () => {
    loadUsers({ notifyOnSuccess: true });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Users management</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Review registered customers, roles, and contact details from the live API.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, email, or role"
            className="w-56 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring"
          />
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
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-sm dark:border-slate-700/60 dark:bg-slate-900">
        {loading ? (
          <div className="py-16 text-center text-sm text-slate-500 dark:text-slate-400">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-500 dark:text-slate-400">No users match the selected filters.</div>
        ) : (
          <table className="min-w-full divide-y divide-slate-100 text-sm dark:divide-slate-800">
            <thead className="bg-slate-50/70 text-left uppercase tracking-wide text-slate-500 dark:bg-slate-900/60 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Phone</th>
                <th className="px-6 py-4 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/70 dark:divide-slate-800/60">
              {filteredUsers.map((entry) => (
                <motion.tr
                  key={entry.id ?? entry.email}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="align-top text-slate-700 dark:text-slate-200"
                >
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">{entry.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{entry.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200">
                      {entry.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">{entry.phone || '—'}</td>
                  <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                    {entry.createdAt ? dateFormatter.format(new Date(entry.createdAt)) : '—'}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
