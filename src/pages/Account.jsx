import { useCallback, useEffect, useState } from 'react';
import { fetchAddresses, fetchUser, fetchUsers } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const buildAddressLine = (address) => {
  if (!address) return '—';
  return [address.street, address.ward, address.district, address.province].filter(Boolean).join(', ');
};

export default function Account() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const resolveProfile = useCallback(
    async (currentUser) => {
      if (currentUser?.id) {
        return fetchUser(currentUser.id);
      }
      if (currentUser?.email) {
        const { users: fetchedUsers } = await fetchUsers({ perPage: 100 });
        const matchingUser = fetchedUsers.find((entry) => entry.email?.toLowerCase() === currentUser.email.toLowerCase());
        return matchingUser ?? fetchedUsers[0] ?? null;
      }
      const { users: fetchedUsers } = await fetchUsers({ perPage: 1 });
      return fetchedUsers[0] ?? null;
    },
    [],
  );

  const loadAccount = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [resolvedProfile, fetchedAddresses] = await Promise.all([
        resolveProfile(user),
        fetchAddresses().catch((err) => {
          console.error('Failed to load addresses', err);
          return [];
        }),
      ]);

      setProfile(resolvedProfile);
      setAddresses(Array.isArray(fetchedAddresses) ? fetchedAddresses : []);
    } catch (err) {
      console.error('Failed to load account overview', err);
      const message = err instanceof Error ? err.message : 'Failed to load account details';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [resolveProfile, user]);

  useEffect(() => {
    loadAccount();
  }, [loadAccount]);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">My account</h1>
          <p className="mt-2 text-sm text-slate-500">
            View the profile and address details fetched from the shop service.
          </p>
        </div>
        <button
          type="button"
          onClick={loadAccount}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          <span aria-hidden>⟳</span>
          <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {error && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-4 text-sm text-rose-600">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2 space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Profile details</h2>
          {loading ? (
            <p className="text-sm text-slate-500">Loading account...</p>
          ) : profile ? (
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Name</dt>
                <dd className="mt-1 text-sm text-slate-800">{profile.name}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</dt>
                <dd className="mt-1 text-sm text-slate-800">{profile.email}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Phone</dt>
                <dd className="mt-1 text-sm text-slate-800">{profile.phone || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Role</dt>
                <dd className="mt-1 text-sm text-slate-800">{profile.role}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Member since</dt>
                <dd className="mt-1 text-sm text-slate-800">
                  {profile.createdAt ? dateFormatter.format(new Date(profile.createdAt)) : '—'}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-slate-500">We couldn&apos;t find profile data.</p>
          )}
        </section>

        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Account summary</h2>
          <div className="space-y-3 text-sm text-slate-600">
            <p>
              <span className="font-semibold text-slate-900">Status:</span> {profile ? 'Active' : 'Unknown'}
            </p>
            <p>
              <span className="font-semibold text-slate-900">Total addresses:</span> {addresses.length}
            </p>
            <p>
              <span className="font-semibold text-slate-900">Default address:</span>{' '}
              {addresses.find((item) => item.isDefault)?.name ?? 'Not set'}
            </p>
          </div>
        </section>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-slate-900">Saved addresses</h2>
          <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Live API data</span>
        </div>
        {loading ? (
          <p className="mt-4 text-sm text-slate-500">Loading addresses...</p>
        ) : addresses.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">You have no saved addresses yet.</p>
        ) : (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {addresses.map((address) => (
              <li
                key={address.id ?? buildAddressLine(address)}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-slate-900">{address.name || profile?.name || 'Recipient'}</p>
                  {address.isDefault && (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Default</span>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-500">{address.phone || '—'}</p>
                <p className="mt-3 leading-relaxed text-slate-700">{buildAddressLine(address)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
