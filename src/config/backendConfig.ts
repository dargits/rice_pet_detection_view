/**
 * Configuration Module for Backend Connection & URL Persistence
 * Manages the most recently saved backend URL, history of connected servers,
 * central config file synchronization, and real-time cross-user Cloud sync.
 */

// Storage Keys
export const STORAGE_KEY_LATEST_BACKEND_URL = 'rice_pest_latest_backend_url';
export const STORAGE_KEY_RECENT_BACKEND_URLS = 'rice_pest_recent_backend_urls';
export const STORAGE_KEY_LEGACY_CONFIG = 'rice_pest_ai_config';

// Maximum number of recent URLs kept in history
export const MAX_RECENT_URLS = 10;

// Shared Cloud Topic for instant zero-config cross-user synchronization
export const CLOUD_SYNC_TOPIC = 'rice_pest_shared_backend_2026';

export interface RecentBackendUrlItem {
  url: string;
  savedAt: string; // ISO 8601 Timestamp
  label?: string;  // e.g. "Cloudflared", "Localhost", "Colab Tunnel"
}

export interface AutoDiscoverResult {
  found: boolean;
  url: string;
  source: 'query' | 'cloud' | 'config' | 'local' | 'recent' | 'fallback' | 'none';
  device?: string;
  responseTimeMs?: number;
}

/**
 * Default fallback Backend URL:
 * - Bạn có thể điền link Cloudflare Colab cố định vào đây nếu muốn người khác vào web tự nhận link luôn mà không cần gõ gì!
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
 * Broadcasts an active backend URL to the shared Cloud channel so that
 * all other users / devices automatically receive and connect to it.
 */
export async function broadcastBackendUrl(url: string): Promise<boolean> {
  const normalized = normalizeBackendUrl(url);
  if (!normalized) return false;

  try {
    const payload = JSON.stringify({
      url: normalized,
      updatedAt: new Date().toISOString(),
      label: getUrlDisplayLabel(normalized),
    });

    const resp = await fetch(`https://ntfy.sh/${CLOUD_SYNC_TOPIC}`, {
      method: 'POST',
      body: payload,
      headers: {
        Title: 'Rice Pest Backend Online',
        Priority: 'high',
      },
    });

    return resp.ok;
  } catch (err) {
    console.warn('[backendConfig] Lỗi khi phát sóng URL lên Cloud Sync:', err);
    return false;
  }
}

/**
 * Fetches the latest broadcasted backend URL from the shared Cloud channel.
 */
export async function fetchCloudSharedUrl(): Promise<{ url: string; updatedAt?: string } | null> {
  try {
    const res = await fetch(`https://ntfy.sh/${CLOUD_SYNC_TOPIC}/json?poll=1`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;

    const text = await res.text();
    const lines = text.trim().split('\n').filter(Boolean);

    // Read lines in reverse to get the latest message
    for (let i = lines.length - 1; i >= 0; i--) {
      try {
        const item = JSON.parse(lines[i]);
        if (item.message) {
          const msg = item.message.trim();
          if (msg.startsWith('{')) {
            const parsed = JSON.parse(msg);
            if (parsed.url) {
              return {
                url: normalizeBackendUrl(parsed.url),
                updatedAt: parsed.updatedAt,
              };
            }
          }
          if (msg.startsWith('http://') || msg.startsWith('https://')) {
            return { url: normalizeBackendUrl(msg) };
          }
        }
      } catch {
        continue;
      }
    }
  } catch (err) {
    console.warn('[backendConfig] Không thể lấy URL từ Cloud Sync:', err);
  }
  return null;
}

/**
 * Fetches candidate backend URLs from the central /backend-config.json file.
 */
export async function fetchCentralConfigUrls(): Promise<string[]> {
  if (typeof window === 'undefined') return [];

  try {
    const res = await fetch(`/backend-config.json?t=${Date.now()}`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];

    const data = await res.json();
    const urls: string[] = [];

    if (data.latestBackendUrl && typeof data.latestBackendUrl === 'string') {
      urls.push(data.latestBackendUrl);
    }
    if (Array.isArray(data.candidateUrls)) {
      urls.push(...data.candidateUrls);
    }

    return urls.map(normalizeBackendUrl).filter(Boolean);
  } catch (err) {
    console.warn('[backendConfig] Không thể đọc file central /backend-config.json:', err);
    return [];
  }
}

/**
 * Quickly tests whether a candidate backend URL is responsive and online.
 */
export async function testBackendHealth(
  url: string,
  timeoutMs = 3500
): Promise<{ ok: boolean; device?: string; responseTimeMs: number }> {
  const clean = normalizeBackendUrl(url);
  if (!clean) return { ok: false, responseTimeMs: 0 };

  const startTime = Date.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const resp = await fetch(`${clean}/health`, {
      method: 'GET',
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timeoutId);

    const responseTimeMs = Date.now() - startTime;

    if (resp.ok) {
      const data = await resp.json().catch(() => null);
      if (data && (data.status === 'ok' || data.status === 'healthy' || Boolean(data.model) || Boolean(data.device))) {
        return { ok: true, device: data.device || 'Online', responseTimeMs };
      }
      return { ok: true, responseTimeMs };
    }
    return { ok: false, responseTimeMs };
  } catch {
    return { ok: false, responseTimeMs: Date.now() - startTime };
  }
}

/**
 * Auto-detects and fails over to an ONLINE backend server:
 * Searches across:
 * 1. Query parameter (?api=...)
 * 2. Shared Cloud channel (ntfy.sh)
 * 3. Central config file (/backend-config.json)
 * 4. Currently saved local URL
 * 5. Recent URL history
 * 6. Hardcoded default fallback
 */
export async function autoDiscoverOnlineBackend(
  onProgress?: (url: string, index: number, total: number) => void
): Promise<AutoDiscoverResult> {
  const candidates: { url: string; source: AutoDiscoverResult['source'] }[] = [];
  const addedUrls = new Set<string>();

  const addCandidate = (rawUrl: string, source: AutoDiscoverResult['source']) => {
    const norm = normalizeBackendUrl(rawUrl);
    if (norm && !addedUrls.has(norm)) {
      addedUrls.add(norm);
      candidates.push({ url: norm, source });
    }
  };

  // 1. Query parameters
  if (typeof window !== 'undefined') {
    const searchParams = new URLSearchParams(window.location.search);
    const qUrl = searchParams.get('api') || searchParams.get('backend') || searchParams.get('server');
    if (qUrl) addCandidate(qUrl, 'query');
  }

  // 2. Shared Cloud sync
  const cloudInfo = await fetchCloudSharedUrl();
  if (cloudInfo && cloudInfo.url) {
    addCandidate(cloudInfo.url, 'cloud');
  }

  // 3. Central backend-config.json
  const centralUrls = await fetchCentralConfigUrls();
  for (const cUrl of centralUrls) {
    addCandidate(cUrl, 'config');
  }

  // 4. Currently saved local URL
  const currentSaved = getLatestBackendUrl();
  if (currentSaved) {
    addCandidate(currentSaved, 'local');
  }

  // 5. Recent history
  const recents = getRecentBackendUrls();
  for (const item of recents) {
    addCandidate(item.url, 'recent');
  }

  // 6. Hardcoded fallback
  if (HARDCODED_BACKEND_URL) {
    addCandidate(HARDCODED_BACKEND_URL, 'fallback');
  }

  const total = candidates.length;
  if (total === 0) {
    return { found: false, url: '', source: 'none' };
  }

  // Sequentially test candidates to find the fastest online server
  for (let i = 0; i < total; i++) {
    const { url, source } = candidates[i];
    if (onProgress) onProgress(url, i + 1, total);

    const test = await testBackendHealth(url, 3500);
    if (test.ok) {
      // Save locally as active URL (without re-broadcasting during scan)
      saveLatestBackendUrl(url, `Tự động kết nối (${source})`, false);
      return {
        found: true,
        url,
        source,
        device: test.device,
        responseTimeMs: test.responseTimeMs,
      };
    }
  }

  return { found: false, url: '', source: 'none' };
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
    // 0. Check URL query parameters
    const searchParams = new URLSearchParams(window.location.search);
    const queryUrl = searchParams.get('api') || searchParams.get('backend') || searchParams.get('server');
    if (queryUrl && queryUrl.trim()) {
      const normalized = normalizeBackendUrl(queryUrl);
      saveLatestBackendUrl(normalized, 'Link chia sẻ', false);
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
 * - Broadcasts to the shared Cloud channel if broadcast = true
 */
export function saveLatestBackendUrl(url: string, customLabel?: string, broadcast = true): string {
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

      // 3. Broadcast to Cloud Sync for team-wide reactivity
      if (broadcast) {
        broadcastBackendUrl(normalized).catch(() => {});
      }
    }

    // 4. Synchronize with legacy AppConfig object if present
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
