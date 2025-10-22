import { useLocation, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import ProductDetails from './pages/ProductDetails.jsx';
import Cart from './pages/Cart.jsx';
import Favorites from './pages/Favorites.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import { useAuth } from './context/AuthContext.jsx';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
};

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
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
              path="/products"
              element={<Navigate to="/" replace />}
            />
            <Route
              path="/cart"
              element={
                <ProtectedRoute>
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
                </ProtectedRoute>
              }
            />
            <Route
              path="/favorites"
              element={
                <ProtectedRoute>
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
                </ProtectedRoute>
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
