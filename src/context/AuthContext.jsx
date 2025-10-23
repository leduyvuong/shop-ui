import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { signIn, signUp, signOut as apiSignOut } from '../utils/api.js';

const STORAGE_KEY = 'shop-auth-user';
const TOKEN_KEY = 'shop-auth-token';

const AuthContext = createContext();

const readJson = (key, fallback) => {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.error('Failed to read storage', error);
    return fallback;
  }
};

const writeJson = (key, value) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to write storage', error);
  }
};

const removeStorage = (key) => {
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to remove storage', error);
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readJson(STORAGE_KEY, null));
  const [token, setToken] = useState(() => window.localStorage.getItem(TOKEN_KEY));

  useEffect(() => {
    if (user && token) {
      writeJson(STORAGE_KEY, user);
      window.localStorage.setItem(TOKEN_KEY, token);
    } else {
      removeStorage(STORAGE_KEY);
      removeStorage(TOKEN_KEY);
    }
  }, [user, token]);

  const login = async (email, password) => {
    try {
      const { user: userData, token: userToken } = await signIn(email, password);
      setUser(userData);
      setToken(userToken);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.message || 'Invalid credentials. Please try again.' 
      };
    }
  };

  const signup = async (userData) => {
    try {
      const { user: newUser, token: userToken } = await signUp(userData);
      setUser(newUser);
      setToken(userToken);
      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      return { 
        success: false, 
        message: error.message || 'Registration failed. Please try again.' 
      };
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await apiSignOut();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setToken(null);
    }
  };

  const value = useMemo(
    () => ({
      user,
      login,
      signup,
      logout,
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
