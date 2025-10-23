import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import ProductDetails from './pages/ProductDetails.jsx';
import Cart from './pages/Cart.jsx';
import Favorites from './pages/Favorites.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Search from './pages/Search.jsx';
import { useAuth } from './context/AuthContext.jsx';
import { AdminProvider } from './admin/context/AdminContext.jsx';
import AdminLayout from './admin/components/AdminLayout.jsx';
import Dashboard from './admin/pages/Dashboard.jsx';
import Products from './admin/pages/Products.jsx';
import Reviews from './admin/pages/Reviews.jsx';
import AdminSearch from './admin/pages/Search.jsx';
import AdminLogin from './admin/pages/Login.jsx';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
};

function StorefrontProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AdminProtectedRoute({ children }) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

function StorefrontLayout() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />
      <main className="flex-1">
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            <Route
              path="/"
              element={
                <motion.div
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="px-4 pb-16 pt-24 sm:px-6 lg:px-12"
                >
                  <Home />
                </motion.div>
              }
            />
            <Route
              path="/products/:id"
              element={
                <motion.div
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="px-4 pb-16 pt-24 sm:px-6 lg:px-12"
                >
                  <ProductDetails />
                </motion.div>
              }
            />
            <Route
              path="/search"
              element={
                <motion.div
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="px-4 pb-16 pt-24 sm:px-6 lg:px-12"
                >
                  <Search />
                </motion.div>
              }
            />
            <Route path="/products" element={<Navigate to="/" replace />} />
            <Route
              path="/cart"
              element={
                <StorefrontProtectedRoute>
                  <motion.div
                    variants={pageVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                    className="px-4 pb-16 pt-24 sm:px-6 lg:px-12"
                  >
                    <Cart />
                  </motion.div>
                </StorefrontProtectedRoute>
              }
            />
            <Route
              path="/favorites"
              element={
                <StorefrontProtectedRoute>
                  <motion.div
                    variants={pageVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                    className="px-4 pb-16 pt-24 sm:px-6 lg:px-12"
                  >
                    <Favorites />
                  </motion.div>
                </StorefrontProtectedRoute>
              }
            />
            <Route
              path="/login"
              element={
                <motion.div
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="px-4 pb-16 pt-24 sm:px-6 lg:px-12"
                >
                  <Login />
                </motion.div>
              }
            />
            <Route
              path="/signup"
              element={
                <motion.div
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="px-4 pb-16 pt-24 sm:px-6 lg:px-12"
                >
                  <Signup />
                </motion.div>
              }
            />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <AdminProtectedRoute>
            <AdminProvider>
              <AdminLayout />
            </AdminProvider>
          </AdminProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="search" element={<AdminSearch />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
      <Route path="/*" element={<StorefrontLayout />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

