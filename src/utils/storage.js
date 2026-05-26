// Save any value to localStorage safely
export const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    // Storage full or private browsing
    console.warn('Storage save failed:', e);
    return false;
  }
};

// Load any value from localStorage safely  
export const loadFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.warn('Storage load failed:', e);
    return defaultValue;
  }
};

// Remove a key from localStorage
export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (e) {
    return false;
  }
};

// Check available storage space
export const getStorageUsage = () => {
  let total = 0;
  for (let key in localStorage) {
    if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
      total += localStorage[key].length * 2; // UTF-16
    }
  }
  return {
    usedBytes: total,
    usedKB: Math.round(total / 1024),
    usedMB: (total / 1024 / 1024).toFixed(2),
    percentUsed: Math.round((total / 5242880) * 100) // Assuming 5MB limit
  };
};
