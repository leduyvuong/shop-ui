import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

const STORAGE_KEY = 'siteSettings';
const HOME_VERSIONS = new Set(['v1', 'v2', 'v3']);
const PRODUCT_VERSIONS = new Set(['v1', 'v2', 'v3']);
const THEME_SETTINGS_STORAGE_KEY = 'themeSettings';

const defaultThemeSettings = {
  primaryColor: '#6366f1',
  secondaryColor: '#10b981',
  backgroundColor: '#f9fafb',
  font: 'Inter',
  radius: 12,
};

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
  themeSettings: defaultThemeSettings,
  setTheme: () => {},
  setHomeVersion: () => {},
  setProductVersion: () => {},
  toggleTheme: () => {},
  updateSettings: () => {},
  updateThemeSettings: () => {},
  resetThemeSettings: () => {},
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

const readThemeSettings = () => {
  if (!isBrowser) return defaultThemeSettings;
  try {
    const stored = window.localStorage.getItem(THEME_SETTINGS_STORAGE_KEY);
    if (!stored) return defaultThemeSettings;
    const parsed = JSON.parse(stored);
    return {
      ...defaultThemeSettings,
      ...parsed,
      radius: Number.isFinite(parsed?.radius) ? Math.max(0, Math.min(32, Number(parsed.radius))) : defaultThemeSettings.radius,
    };
  } catch (error) {
    console.error('Failed to read design theme settings', error);
    return defaultThemeSettings;
  }
};

const applyThemeVariables = (settings) => {
  if (!isBrowser) return;
  const root = window.document.documentElement;
  root.style.setProperty('--theme-primary-color', settings.primaryColor);
  root.style.setProperty('--theme-secondary-color', settings.secondaryColor);
  root.style.setProperty('--theme-surface-color', settings.backgroundColor);
  root.style.setProperty('--theme-font-family', `${settings.font}, var(--theme-font-fallback)`);
  root.style.setProperty('--theme-radius', `${settings.radius}px`);
};

export function ThemeProvider({ children }) {
  const [settings, setSettings] = useState(() => readSettings());
  const [themeSettings, setThemeSettings] = useState(() => readThemeSettings());
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
    try {
      window.localStorage.setItem(THEME_SETTINGS_STORAGE_KEY, JSON.stringify(themeSettings));
    } catch (error) {
      console.error('Failed to persist design theme settings', error);
    }
  }, [themeSettings]);

  useEffect(() => {
    if (!isBrowser) return;
    const root = window.document.documentElement;
    root.classList.toggle('dark', settings.theme === 'dark');
    root.style.colorScheme = settings.theme === 'dark' ? 'dark' : 'light';
  }, [settings.theme]);

  useEffect(() => {
    applyThemeVariables(themeSettings);
    if (isBrowser) {
      document.body.style.backgroundColor = themeSettings.backgroundColor;
      document.body.style.fontFamily = `${themeSettings.font}, var(--theme-font-fallback)`;
      document.body.style.setProperty('--theme-radius', `${themeSettings.radius}px`);
    }
  }, [themeSettings]);

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

  const updateThemeSettings = useCallback((updates) => {
    setThemeSettings((prev) => {
      const next = {
        ...prev,
        ...updates,
      };
      const sanitized = {
        ...next,
        radius: Number.isFinite(next.radius) ? Math.max(0, Math.min(32, Number(next.radius))) : prev.radius,
      };
      applyThemeVariables(sanitized);
      return sanitized;
    });
  }, []);

  const resetThemeSettings = useCallback(() => {
    setThemeSettings(defaultThemeSettings);
    applyThemeVariables(defaultThemeSettings);
    if (isBrowser) {
      window.localStorage.removeItem(THEME_SETTINGS_STORAGE_KEY);
    }
  }, []);

  const value = useMemo(
    () => ({
      theme: settings.theme,
      homeVersion: settings.homeVersion,
      productVersion: settings.productVersion,
      themeSettings,
      setTheme,
      setHomeVersion,
      setProductVersion,
      toggleTheme,
      updateSettings,
      updateThemeSettings,
      resetThemeSettings,
    }),
    [
      settings.homeVersion,
      settings.productVersion,
      settings.theme,
      themeSettings,
      setTheme,
      setHomeVersion,
      setProductVersion,
      toggleTheme,
      updateSettings,
      updateThemeSettings,
      resetThemeSettings,
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
