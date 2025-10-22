import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'shop-auth-user';
const USERS_KEY = 'shop-auth-users';

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

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readJson(STORAGE_KEY, null));

  useEffect(() => {
    if (user) {
      writeJson(STORAGE_KEY, user);
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const login = (email, password) => {
    const users = readJson(USERS_KEY, []);
    const existingUser = users.find((storedUser) => storedUser.email === email && storedUser.password === password);
    if (existingUser) {
      const { password: _password, ...safeUser } = existingUser;
      setUser(safeUser);
      return { success: true };
    }
    return { success: false, message: 'Invalid credentials. Please try again.' };
  };

  const signup = (payload) => {
    const users = readJson(USERS_KEY, []);
    const alreadyExists = users.some((storedUser) => storedUser.email === payload.email);
    if (alreadyExists) {
      return { success: false, message: 'Email already registered. Please login.' };
    }
    const newUsers = [...users, payload];
    writeJson(USERS_KEY, newUsers);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
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
