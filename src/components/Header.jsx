import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import SearchBar from './SearchBar.jsx';
import { readJson, upsertUniqueValue } from '../utils/storage.js';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/favorites', label: 'Favorites', protected: true },
  { to: '/cart', label: 'Cart', protected: true },
  { to: '/account', label: 'Account', protected: true },
];

const linkBaseClasses = 'rounded-full px-4 py-2 text-sm font-medium transition hover:bg-primary hover:text-white';
const HISTORY_EVENT = 'shop-search-history-updated';

export default function Header() {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [searchHistory, setSearchHistory] = useState(() => readJson('searchHistory', []));
  const { totals } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => setOpen((prev) => !prev);
  const closeMenu = () => setOpen(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const keyword = params.get('q') ?? '';
    setSearchValue(keyword);
    setSearchHistory(readJson('searchHistory', []));
  }, [location]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const updateHistory = () => {
      setSearchHistory(readJson('searchHistory', []));
    };
    window.addEventListener(HISTORY_EVENT, updateHistory);
    return () => {
      window.removeEventListener(HISTORY_EVENT, updateHistory);
    };
  }, []);

  const handleSearchSubmit = (keyword) => {
    const trimmed = keyword.trim();
    if (!trimmed) return;
    const updated = upsertUniqueValue('searchHistory', trimmed);
    setSearchHistory(updated);
    setSearchValue(trimmed);
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    closeMenu();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event(HISTORY_EVENT));
    }
  };

  const handleSuggestionSelect = (keyword) => {
    const updated = upsertUniqueValue('searchHistory', keyword.trim());
    setSearchHistory(updated);
    setSearchValue(keyword);
    navigate(`/search?q=${encodeURIComponent(keyword)}`);
    closeMenu();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event(HISTORY_EVENT));
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white/90 shadow backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 text-xl font-semibold text-primary">
            <span className="rounded-full bg-primary px-3 py-1 font-bold text-white">Shop</span>
            <span className="hidden sm:block">Modern Store</span>
          </Link>
          <div className="hidden flex-1 md:flex md:max-w-md">
            <SearchBar
              value={searchValue}
              onChange={setSearchValue}
              onSubmit={handleSearchSubmit}
              suggestions={searchHistory}
              onSuggestionSelect={handleSuggestionSelect}
              placeholder="Search for products"
            />
          </div>
          <nav className="hidden items-center gap-4 md:flex">
            {navLinks
              .filter((link) => !link.protected || user)
              .map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `${linkBaseClasses} ${isActive ? 'bg-primary text-white shadow-md' : 'text-slate-700'}`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            {user ? (
              <button
                type="button"
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-slate-700"
                onClick={handleLogout}
              >
                Logout
              </button>
            ) : (
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `${linkBaseClasses} ${isActive ? 'bg-primary text-white shadow-md' : 'border border-primary text-primary'}`
                }
              >
                Login
              </NavLink>
            )}
            <div className="flex items-center gap-3">
              <Link to="/favorites" className="flex items-center gap-1 text-sm text-slate-600">
                <span role="img" aria-label="wishlist">
                  ❤️
                </span>
                <span className="font-semibold">{wishlistItems.length}</span>
              </Link>
              <Link to="/cart" className="flex items-center gap-1 text-sm text-slate-600">
                <span role="img" aria-label="cart">
                  🛒
                </span>
                <span className="font-semibold">{totals.itemCount}</span>
              </Link>
            </div>
          </nav>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 p-2 text-slate-600 md:hidden"
            onClick={toggleMenu}
            aria-label="Toggle navigation"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
            </svg>
          </button>
        </div>
        <div className="mt-4 md:hidden">
          <SearchBar
            value={searchValue}
            onChange={setSearchValue}
            onSubmit={handleSearchSubmit}
            suggestions={searchHistory}
            onSuggestionSelect={handleSuggestionSelect}
            placeholder="Search for products"
          />
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-slate-100 bg-white md:hidden"
          >
            <div className="space-y-4 px-4 py-6">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Quick Links</p>
                {navLinks
                  .filter((link) => !link.protected || user)
                  .map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      onClick={closeMenu}
                      className={({ isActive }) =>
                        `${linkBaseClasses} block ${isActive ? 'bg-primary text-white shadow-md' : 'text-slate-700'}`
                      }
                    >
                      {link.label}
                    </NavLink>
                  ))}
              </div>
              {navLinks
                .filter((link) => !link.protected || user)
                .length === 0 && (
                <p className="text-sm text-slate-500">Sign in to access more pages.</p>
              )}
              {user ? (
                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    handleLogout();
                  }}
                  className="w-full rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow"
                >
                  Logout
                </button>
              ) : (
                <NavLink
                  to="/login"
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `${linkBaseClasses} block text-center ${isActive ? 'bg-primary text-white shadow-md' : 'border border-primary text-primary'}`
                  }
                >
                  Login
                </NavLink>
              )}
              <div className="flex items-center justify-between rounded-2xl bg-slate-100 px-4 py-3">
                <Link to="/favorites" onClick={closeMenu} className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  ❤️ Favorites
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs">{wishlistItems.length}</span>
                </Link>
                <Link to="/cart" onClick={closeMenu} className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  🛒 Cart
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs">{totals.itemCount}</span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
