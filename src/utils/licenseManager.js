import { loadFromStorage, saveToStorage } from './storage';

export const FREE_ACTIVE_ORDER_LIMIT = 3;
export const LICENSE_STORAGE_KEY = 'garmentcalc_license';

export const DEFAULT_LICENSE_STATE = {
  plan: 'free', // 'free' | 'pro'
  licenseKey: null,
  activatedAt: null,
  source: null, // 'demo' | 'gumroad'
  email: null,
};

// Built-in local demo/testing keys for immediate evaluation
const LOCAL_TEST_KEYS = new Set([
  'PRO-2026-DEMO',
  'GARMENTCALC-PRO-2026',
  'MERCH-PRO-2026',
]);

/**
 * Safely loads and migrates the stored license object.
 */
export const loadLicenseState = () => {
  const stored = loadFromStorage(LICENSE_STORAGE_KEY, null);
  if (!stored || typeof stored !== 'object') {
    return { ...DEFAULT_LICENSE_STATE };
  }
  return {
    ...DEFAULT_LICENSE_STATE,
    ...stored,
    plan: stored.plan === 'pro' ? 'pro' : 'free',
  };
};

export const saveLicenseState = (licenseState) => {
  return saveToStorage(LICENSE_STORAGE_KEY, licenseState);
};

/**
 * Gumroad License API Verification Hook.
 * Configure VITE_GUMROAD_PRODUCT_ID in .env to enable live Gumroad verification.
 * Docs: https://app.gumroad.com/api#licenses
 */
export const verifyWithGumroad = async (licenseKey, productId) => {
  const response = await fetch('https://api.gumroad.com/v2/licenses/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      product_id: productId,
      license_key: licenseKey,
      increment_uses_count: 'true',
    }),
  });

  const payload = await response.json();

  if (response.ok && payload?.success && !payload?.purchase?.refunded && !payload?.purchase?.chargebacked) {
    return {
      valid: true,
      plan: 'pro',
      licenseKey,
      source: 'gumroad',
      email: payload?.purchase?.email || null,
      activatedAt: new Date().toISOString(),
    };
  }

  return {
    valid: false,
    error: payload?.message || 'License key could not be verified with Gumroad.',
  };
};

/**
 * Verifies a user-entered license key.
 * 1) Checks built-in demo test keys (e.g. PRO-2026-DEMO).
 * 2) If VITE_GUMROAD_PRODUCT_ID is configured, calls Gumroad License API.
 */
export const verifyLicenseKey = async (rawKey) => {
  const normalized = (rawKey || '').trim().toUpperCase();

  if (!normalized) {
    return {
      valid: false,
      error: 'Please enter a valid license key.',
    };
  }

  // 1. Local test / demo key check
  if (LOCAL_TEST_KEYS.has(normalized)) {
    return {
      valid: true,
      plan: 'pro',
      licenseKey: normalized,
      source: 'demo',
      email: 'demo@garmentcalc.app',
      activatedAt: new Date().toISOString(),
    };
  }

  // 2. Live Gumroad API hook when product ID is configured
  const gumroadProductId = import.meta.env.VITE_GUMROAD_PRODUCT_ID;
  if (gumroadProductId) {
    try {
      return await verifyWithGumroad(normalized, gumroadProductId);
    } catch (err) {
      return {
        valid: false,
        error: 'Unable to reach license server. Check your internet connection and try again.',
      };
    }
  }

  return {
    valid: false,
    error: 'Invalid license key. Use PRO-2026-DEMO to test Pro features.',
  };
};

export const getGumroadCheckoutUrl = () => {
  return import.meta.env.VITE_GUMROAD_CHECKOUT_URL || '';
};
