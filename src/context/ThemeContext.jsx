import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

const STORAGE_KEY = 'siteSettings';
const HOME_VERSIONS = new Set(['v1', 'v2', 'v3']);
const PRODUCT_VERSIONS = new Set(['v1', 'v2', 'v3']);

const defaultSettings = {
  theme: 'light',
  homeVersion: 'v1',
  productVersion: 'v1',
};

const sanitizeHomeVersion = (value, fallback = defaultSettings.homeVersion) =>
  HOME_VERSIONS.has(value) ? value : fallback;

const sanitizeProductVersion = (value, fallback = defaultSettings.productVersion) =>
  PRODUCT_VERSIONS.has(value) ? value : fallback;

const ThemeContext = createContext({
  theme: defaultSettings.theme,
  homeVersion: defaultSettings.homeVersion,
  productVersion: defaultSettings.productVersion,
  setTheme: () => {},
  setHomeVersion: () => {},
  setProductVersion: () => {},
  toggleTheme: () => {},
  updateSettings: () => {},
});

const isBrowser = typeof window !== 'undefined';

const readSettings = () => {
  if (!isBrowser) return defaultSettings;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultSettings;
    const parsed = JSON.parse(stored);
    return {
      ...defaultSettings,
      ...parsed,
      theme: parsed?.theme === 'dark' ? 'dark' : 'light',
      homeVersion: sanitizeHomeVersion(parsed?.homeVersion),
      productVersion: sanitizeProductVersion(parsed?.productVersion),
    };
  } catch (error) {
    console.error('Failed to read theme settings', error);
    return defaultSettings;
  }
};

export function ThemeProvider({ children }) {
  const [settings, setSettings] = useState(() => readSettings());
  const initialLoad = useRef(true);

  useEffect(() => {
    if (!isBrowser) return undefined;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    if (initialLoad.current) {
      initialLoad.current = false;
      if (!window.localStorage.getItem(STORAGE_KEY) && mediaQuery.matches) {
        setSettings((prev) => ({ ...prev, theme: 'dark' }));
      }
    }
    const handleChange = (event) => {
      setSettings((prev) => {
        if (window.localStorage.getItem(STORAGE_KEY)) {
          return prev;
        }
        return { ...prev, theme: event.matches ? 'dark' : 'light' };
      });
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (!isBrowser) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to persist theme settings', error);
    }
  }, [settings]);

  useEffect(() => {
    if (!isBrowser) return;
    const root = window.document.documentElement;
    root.classList.toggle('dark', settings.theme === 'dark');
    root.style.colorScheme = settings.theme === 'dark' ? 'dark' : 'light';
  }, [settings.theme]);

  const setTheme = useCallback((theme) => {
    setSettings((prev) => ({ ...prev, theme: theme === 'dark' ? 'dark' : 'light' }));
  }, []);

  const setHomeVersion = useCallback((version) => {
    setSettings((prev) => ({ ...prev, homeVersion: sanitizeHomeVersion(version, prev.homeVersion) }));
  }, []);

  const setProductVersion = useCallback((version) => {
    setSettings((prev) => ({ ...prev, productVersion: sanitizeProductVersion(version, prev.productVersion) }));
  }, []);

  const toggleTheme = useCallback(() => {
    setSettings((prev) => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }));
  }, []);

  const updateSettings = useCallback((updates) => {
    setSettings((prev) => ({
      ...prev,
      ...updates,
      theme: updates?.theme === 'dark' ? 'dark' : updates?.theme === 'light' ? 'light' : prev.theme,
      homeVersion: sanitizeHomeVersion(updates?.homeVersion, prev.homeVersion),
      productVersion: sanitizeProductVersion(updates?.productVersion, prev.productVersion),
    }));
  }, []);

  const value = useMemo(
    () => ({
      theme: settings.theme,
      homeVersion: settings.homeVersion,
      productVersion: settings.productVersion,
      setTheme,
      setHomeVersion,
      setProductVersion,
      toggleTheme,
      updateSettings,
    }),
    [
      settings.homeVersion,
      settings.productVersion,
      settings.theme,
      setTheme,
      setHomeVersion,
      setProductVersion,
      toggleTheme,
      updateSettings,
    ],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
