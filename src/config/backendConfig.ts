/**
 * Configuration Module for Backend Connection & URL Persistence
 * Manages the most recently saved backend URL and history of connected servers.
 */

// Storage Keys
export const STORAGE_KEY_LATEST_BACKEND_URL = 'rice_pest_latest_backend_url';
export const STORAGE_KEY_RECENT_BACKEND_URLS = 'rice_pest_recent_backend_urls';
export const STORAGE_KEY_LEGACY_CONFIG = 'rice_pest_ai_config';

// Maximum number of recent URLs kept in history
export const MAX_RECENT_URLS = 10;

export interface RecentBackendUrlItem {
  url: string;
  savedAt: string; // ISO 8601 Timestamp
  label?: string;  // e.g. "Cloudflared", "Localhost", "Colab Tunnel"
}

/**
 * Default fallback Backend URL:
 * - Bạn có thể điền link Cloudflare Colab cố định vào đây nếu muốn người khác vào web tự nhận link luôn mà không cần gõ gì!
 * - Ví dụ: export const HARDCODED_BACKEND_URL = "https://rice-pest-backend.trycloudflare.com";
 */
export const HARDCODED_BACKEND_URL: string = 'https://makers-exact-men-strikes.trycloudflare.com';

/**
 * Default fallback Backend URL from Vite environment variables (if configured) or hardcoded
 */
export const DEFAULT_BACKEND_URL: string = (
  HARDCODED_BACKEND_URL ||
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) ||
  ''
).trim();

/**
 * Normalizes user-provided Backend URL:
 * - trim whitespace
 * - remove trailing slashes
 * - auto-prepend https:// if protocol is missing (unless localhost/127.0.0.1 which gets http://)
 */
export function normalizeBackendUrl(url: string): string {
  if (!url) return '';
  let cleaned = url.trim();

  // Remove trailing slashes
  cleaned = cleaned.replace(/\/+$/, '');

  // If protocol already exists, return cleaned
  if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
    return cleaned;
  }

  // Prepend http for localhost, otherwise https
  if (cleaned.startsWith('localhost') || cleaned.startsWith('127.0.0.1')) {
    return `http://${cleaned}`;
  }

  return `https://${cleaned}`;
}

/**
 * Generates an automatic friendly label for a backend URL
 */
export function getUrlDisplayLabel(url: string): string {
  if (!url) return 'Chưa cấu hình';
  if (url.includes('trycloudflare.com')) return 'Cloudflared Tunnel';
  if (url.includes('ngrok-free.app') || url.includes('ngrok.io')) return 'Ngrok Tunnel';
  if (url.includes('localhost') || url.includes('127.0.0.1')) return 'Máy chủ Localhost';
  if (url.includes('colab')) return 'Google Colab';
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    return 'Máy chủ Backend';
  }
}

/**
 * Retrieves the most recently saved backend URL:
 * Priority:
 * 0. URL query parameter (?api=... or ?backend=... - Cực tiện khi chia sẻ link cho người khác)
 * 1. Dedicated latest URL key (STORAGE_KEY_LATEST_BACKEND_URL)
 * 2. Legacy AppConfig storage (STORAGE_KEY_LEGACY_CONFIG)
 * 3. Default fallback / Environment variable (VITE_API_URL or HARDCODED_BACKEND_URL)
 * 4. Empty string
 */
export function getLatestBackendUrl(): string {
  if (typeof window === 'undefined') {
    return normalizeBackendUrl(DEFAULT_BACKEND_URL);
  }

  try {
    // 0. Check URL query parameters (?api=... or ?backend=... or ?server=...)
    // Cho phép người khác chỉ cần mở link kèm ?api=https://... là tự động lưu và kết nối ngay!
    const searchParams = new URLSearchParams(window.location.search);
    const queryUrl = searchParams.get('api') || searchParams.get('backend') || searchParams.get('server');
    if (queryUrl && queryUrl.trim()) {
      const normalized = normalizeBackendUrl(queryUrl);
      saveLatestBackendUrl(normalized, 'Link chia sẻ');
      return normalized;
    }

    // 1. Check dedicated key
    const directSaved = localStorage.getItem(STORAGE_KEY_LATEST_BACKEND_URL);
    if (directSaved && directSaved.trim()) {
      return normalizeBackendUrl(directSaved);
    }

    // 2. Check legacy config storage
    const legacyRaw = localStorage.getItem(STORAGE_KEY_LEGACY_CONFIG);
    if (legacyRaw) {
      const parsed = JSON.parse(legacyRaw);
      if (parsed && typeof parsed.apiUrl === 'string' && parsed.apiUrl.trim()) {
        const normalized = normalizeBackendUrl(parsed.apiUrl);
        // Sync to dedicated key
        localStorage.setItem(STORAGE_KEY_LATEST_BACKEND_URL, normalized);
        return normalized;
      }
    }
  } catch (err) {
    console.warn('[backendConfig] Không thể đọc URL backend từ localStorage:', err);
  }

  // 3. Fallback to default / environment variable
  return normalizeBackendUrl(DEFAULT_BACKEND_URL);
}

/**
 * Tạo đường dẫn chia sẻ 1-click cho người khác (kèm sẵn URL backend hiện tại)
 * Ví dụ: https://my-rice-app.vercel.app/?api=https://xxxx.trycloudflare.com
 */
export function generateShareableUrl(backendUrl?: string): string {
  if (typeof window === 'undefined') return '';
  const target = backendUrl || getLatestBackendUrl();
  if (!target) return window.location.origin;

  const url = new URL(window.location.origin);
  url.searchParams.set('api', target);
  return url.toString();
}

/**
 * Retrieves the list of recently connected backend URLs
 */
export function getRecentBackendUrls(): RecentBackendUrlItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY_RECENT_BACKEND_URLS);
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        return list.filter((item) => item && typeof item.url === 'string' && item.url.trim());
      }
    }
  } catch (err) {
    console.warn('[backendConfig] Lỗi khi đọc danh sách URL gần đây:', err);
  }

  const latest = getLatestBackendUrl();
  if (latest) {
    return [{ url: latest, savedAt: new Date().toISOString(), label: getUrlDisplayLabel(latest) }];
  }

  return [];
}

/**
 * Saves the latest backend URL to persistence:
 * - Updates the latest URL storage key
 * - Adds to the history of recent URLs
 * - Synchronizes with the main app config in localStorage
 */
export function saveLatestBackendUrl(url: string, customLabel?: string): string {
  const normalized = normalizeBackendUrl(url);
  if (typeof window === 'undefined') return normalized;

  try {
    // 1. Save to dedicated latest key
    localStorage.setItem(STORAGE_KEY_LATEST_BACKEND_URL, normalized);

    // 2. Update recent URLs list if URL is not empty
    if (normalized) {
      const currentRecents = getRecentBackendUrls();
      const existingFiltered = currentRecents.filter((item) => item.url !== normalized);

      const newItem: RecentBackendUrlItem = {
        url: normalized,
        savedAt: new Date().toISOString(),
        label: customLabel || getUrlDisplayLabel(normalized),
      };

      const updatedList = [newItem, ...existingFiltered].slice(0, MAX_RECENT_URLS);
      localStorage.setItem(STORAGE_KEY_RECENT_BACKEND_URLS, JSON.stringify(updatedList));
    }

    // 3. Synchronize with legacy AppConfig object if present
    const legacyRaw = localStorage.getItem(STORAGE_KEY_LEGACY_CONFIG);
    const legacyObj = legacyRaw ? JSON.parse(legacyRaw) : {};
    legacyObj.apiUrl = normalized;
    localStorage.setItem(STORAGE_KEY_LEGACY_CONFIG, JSON.stringify(legacyObj));

    // Dispatch custom event for real-time reactivity across components
    window.dispatchEvent(
      new CustomEvent('rice_pest_backend_url_change', {
        detail: { url: normalized },
      })
    );
  } catch (err) {
    console.error('[backendConfig] Không thể lưu URL backend vào localStorage:', err);
  }

  return normalized;
}

/**
 * Removes a specific URL from recent history
 */
export function removeRecentBackendUrl(urlToRemove: string): RecentBackendUrlItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const list = getRecentBackendUrls().filter((item) => item.url !== urlToRemove);
    localStorage.setItem(STORAGE_KEY_RECENT_BACKEND_URLS, JSON.stringify(list));
    return list;
  } catch (err) {
    console.warn('[backendConfig] Lỗi khi xóa URL khỏi danh sách gần đây:', err);
    return [];
  }
}

/**
 * Clears the latest saved backend URL
 */
export function clearLatestBackendUrl(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEY_LATEST_BACKEND_URL);

    const legacyRaw = localStorage.getItem(STORAGE_KEY_LEGACY_CONFIG);
    if (legacyRaw) {
      const legacyObj = JSON.parse(legacyRaw);
      legacyObj.apiUrl = '';
      localStorage.setItem(STORAGE_KEY_LEGACY_CONFIG, JSON.stringify(legacyObj));
    }

    window.dispatchEvent(
      new CustomEvent('rice_pest_backend_url_change', {
        detail: { url: '' },
      })
    );
  } catch (err) {
    console.warn('[backendConfig] Lỗi khi xóa URL backend:', err);
  }
}

