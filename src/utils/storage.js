const isBrowser = typeof window !== 'undefined';

export function readJson(key, fallback) {
  if (!isBrowser) return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.error(`Failed to read storage for key "${key}"`, error);
    return fallback;
  }
}

export function writeJson(key, value) {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to write storage for key "${key}"`, error);
  }
}

export function removeItem(key) {
  if (!isBrowser) return;
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to remove storage key "${key}"`, error);
  }
}

export function upsertUniqueValue(key, value, { limit = 8, caseInsensitive = true } = {}) {
  if (!value) return [];
  const normalizedValue = caseInsensitive ? value.toLowerCase() : value;
  const existing = readJson(key, []);
  const filtered = existing.filter((item) => {
    if (!caseInsensitive) return item !== value;
    return item.toLowerCase() !== normalizedValue;
  });
  const updated = [value, ...filtered].slice(0, limit);
  writeJson(key, updated);
  return updated;
}
