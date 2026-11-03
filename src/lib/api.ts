import {
  HealthResponse,
  PestInfo,
  PredictResponse,
  JobResponse,
  HistoryResponse,
  HistoryItem,
  StatsResponse,
  AppConfig,
} from '../types';

import {
  MOCK_CLASSES,
  MOCK_PESTS,
  MOCK_HISTORY,
  MOCK_STATS,
  createMockJob,
  getMockJobStatus,
  generateMockImagePrediction,
} from './mockBackend';

const CONFIG_STORAGE_KEY = 'rice_pest_ai_config';

/**
 * Normalizes user-provided Backend URL:
 * - trim whitespace
 * - remove trailing slashes
 * - add https:// if protocol is missing
 */
export function normalizeUrl(url: string): string {
  if (!url) return '';
  let cleaned = url.trim();
  // Remove trailing slashes
  cleaned = cleaned.replace(/\/+$/, '');
  // Auto prepend https:// if missing protocol
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = 'https://' + cleaned;
  }
  return cleaned;
}

export function getSavedConfig(): AppConfig {
  const isMockParam = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('mock') === '1';

  try {
    const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        apiUrl: normalizeUrl(parsed.apiUrl || (import.meta.env.VITE_API_URL as string) || ''),
        apiKey: parsed.apiKey || '',
        defaultConf: typeof parsed.defaultConf === 'number' ? parsed.defaultConf : 0.4,
        videoSkip: typeof parsed.videoSkip === 'number' ? parsed.videoSkip : 3,
        mockMode: isMockParam || Boolean(parsed.mockMode),
      };
    }
  } catch (e) {
    console.error('Lỗi khi đọc config từ localStorage:', e);
  }

  return {
    apiUrl: normalizeUrl((import.meta.env.VITE_API_URL as string) || ''),
    apiKey: '',
    defaultConf: 0.4,
    videoSkip: 3,
    mockMode: isMockParam,
  };
}

export function saveConfig(config: Partial<AppConfig>): AppConfig {
  const current = getSavedConfig();
  const updated: AppConfig = {
    ...current,
    ...config,
    apiUrl: config.apiUrl !== undefined ? normalizeUrl(config.apiUrl) : current.apiUrl,
  };
  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Lỗi khi lưu config:', e);
  }
  return updated;
}

export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Helper to build media and resource URLs (appends key query param if API key exists)
 */
export function buildMediaUrl(endpointPath: string, config?: AppConfig): string {
  const cfg = config || getSavedConfig();
  if (cfg.mockMode) {
    // Return sample placeholder image or video in mock mode
    if (endpointPath.includes('/image')) {
      return 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=800&q=80';
    }
    if (endpointPath.includes('/video')) {
      return 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
    }
    if (endpointPath.includes('/export.csv')) {
      return '#mock-csv';
    }
  }

  const base = cfg.apiUrl;
  if (!base) return '';

  const cleanPath = endpointPath.startsWith('/') ? endpointPath : '/' + endpointPath;
  let finalUrl = `${base}${cleanPath}`;

  if (cfg.apiKey) {
    const separator = finalUrl.includes('?') ? '&' : '?';
    finalUrl += `${separator}key=${encodeURIComponent(cfg.apiKey)}`;
  }
  return finalUrl;
}

/**
 * Translates HTTP status and connection errors into Vietnamese user-friendly messages
 */
function translateErrorMessage(error: any, status?: number): string {
  if (status === 401) {
    return 'Lỗi xác thực (401): API Key không chính xác hoặc đã hết hạn. Hãy kiểm tra lại trong phần Cài đặt.';
  }
  if (status === 400) {
    return 'Dữ liệu không hợp lệ (400): File ảnh hoặc video có thể bị hỏng hoặc không đúng định dạng hỗ trợ.';
  }
  if (status === 404) {
    return 'Không tìm thấy dữ liệu (404): Endpoint hoặc tài nguyên được yêu cầu không tồn tại trên server.';
  }
  if (status === 413) {
    return 'Dung lượng file quá lớn (413): File vượt quá giới hạn tải lên của máy chủ.';
  }
  if (status && status >= 500) {
    return `Lỗi máy chủ (${status}): FastAPI trên Colab gặp sự cố trong quá trình xử lý. Hãy xem log của Colab.`;
  }
  if (error && error.name === 'AbortError') {
    return 'Yêu cầu bị quá thời gian chờ (Timeout) hoặc đã bị người dùng hủy.';
  }
  return 'Mất kết nối tới Backend: Colab có thể đã ngắt hoặc URL Cloudflared đã thay đổi. Hãy kiểm tra và cập nhật lại URL.';
}

/**
 * Standard fetch wrapper with timeout, headers, and error translation
 */
async function fetchWithTimeout<T>(
  endpoint: string,
  options: RequestInit = {},
  timeoutMs = 60000,
  config?: AppConfig
): Promise<T> {
  const cfg = config || getSavedConfig();

  if (!cfg.apiUrl && !cfg.mockMode) {
    throw new ApiError('Chưa cấu hình URL Backend. Vui lòng vào Cài đặt để điền URL Colab.', 0);
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
  const fullUrl = `${cfg.apiUrl}${cleanEndpoint}`;

  const headers = new Headers(options.headers || {});
  if (cfg.apiKey) {
    headers.set('x-api-key', cfg.apiKey);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  // Combine user signal if passed
  if (options.signal) {
    options.signal.addEventListener('abort', () => controller.abort());
  }

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let serverMsg = '';
      try {
        const errJson = await response.json();
        serverMsg = errJson.detail || errJson.message || '';
      } catch {
        // fallback to status text
      }
      const viMessage = translateErrorMessage(new Error(serverMsg), response.status);
      throw new ApiError(serverMsg ? `${viMessage} (${serverMsg})` : viMessage, response.status);
    }

    // Check if JSON response expected
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return (await response.json()) as T;
    }
    return (await response.text()) as unknown as T;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err instanceof ApiError) throw err;
    throw new ApiError(translateErrorMessage(err), 0);
  }
}

// ----------------------------------------------------------------------
// API Methods
// ----------------------------------------------------------------------

export async function fetchHealth(cfg?: AppConfig, signal?: AbortSignal): Promise<HealthResponse> {
  const config = cfg || getSavedConfig();

  if (config.mockMode) {
    await new Promise((r) => setTimeout(r, 200));
    return {
      status: 'ok',
      device: 'Mock CUDA:0 (NVIDIA T4 Demo)',
      classes: MOCK_CLASSES,
      uptime_s: 3600,
      auth_required: Boolean(config.apiKey),
    };
  }

  return fetchWithTimeout<HealthResponse>('/health', { method: 'GET', signal }, 10000, config);
}

export async function fetchPests(cfg?: AppConfig, signal?: AbortSignal): Promise<PestInfo[]> {
  const config = cfg || getSavedConfig();

  if (config.mockMode) {
    await new Promise((r) => setTimeout(r, 150));
    return MOCK_PESTS;
  }

  return fetchWithTimeout<PestInfo[]>('/pests', { method: 'GET', signal }, 15000, config);
}

export async function predictImage(
  file: File | Blob,
  conf = 0.4,
  annotated = false,
  save = true,
  signal?: AbortSignal
): Promise<PredictResponse> {
  const config = getSavedConfig();

  if (config.mockMode) {
    await new Promise((r) => setTimeout(r, 600));
    return generateMockImagePrediction();
  }

  const formData = new FormData();
  formData.append('file', file);

  const query = new URLSearchParams({
    conf: conf.toString(),
    annotated: annotated.toString(),
    save: save.toString(),
  }).toString();

  return fetchWithTimeout<PredictResponse>(
    `/predict?${query}`,
    {
      method: 'POST',
      body: formData,
      signal,
    },
    90000,
    config
  );
}

export async function predictVideo(
  file: File,
  conf = 0.4,
  skip = 3,
  signal?: AbortSignal
): Promise<{ job_id: string }> {
  const config = getSavedConfig();

  if (config.mockMode) {
    await new Promise((r) => setTimeout(r, 500));
    const jobId = createMockJob();
    return { job_id: jobId };
  }

  const formData = new FormData();
  formData.append('file', file);

  const query = new URLSearchParams({
    conf: conf.toString(),
    skip: skip.toString(),
  }).toString();

  return fetchWithTimeout<{ job_id: string }>(
    `/predict_video?${query}`,
    {
      method: 'POST',
      body: formData,
      signal,
    },
    180000,
    config
  );
}

export async function fetchJobStatus(jobId: string, signal?: AbortSignal): Promise<JobResponse> {
  const config = getSavedConfig();

  if (config.mockMode) {
    await new Promise((r) => setTimeout(r, 200));
    return getMockJobStatus(jobId);
  }

  return fetchWithTimeout<JobResponse>(`/job/${encodeURIComponent(jobId)}`, { method: 'GET', signal }, 15000, config);
}

export async function fetchHistory(
  limit = 20,
  offset = 0,
  source?: 'image' | 'video' | 'stream',
  signal?: AbortSignal
): Promise<HistoryResponse> {
  const config = getSavedConfig();

  if (config.mockMode) {
    await new Promise((r) => setTimeout(r, 250));
    let filtered = [...MOCK_HISTORY];
    if (source) {
      filtered = filtered.filter((item) => item.source === source);
    }
    const paginated = filtered.slice(offset, offset + limit);
    return {
      total: filtered.length,
      items: paginated,
    };
  }

  const params = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
  });
  if (source) {
    params.set('source', source);
  }

  return fetchWithTimeout<HistoryResponse>(`/history?${params.toString()}`, { method: 'GET', signal }, 15000, config);
}

export async function fetchHistoryItem(id: string, signal?: AbortSignal): Promise<HistoryItem> {
  const config = getSavedConfig();

  if (config.mockMode) {
    await new Promise((r) => setTimeout(r, 150));
    const found = MOCK_HISTORY.find((item) => item.id === id);
    if (!found) throw new ApiError('Không tìm thấy bản ghi lịch sử', 404);
    return found;
  }

  return fetchWithTimeout<HistoryItem>(`/history/${encodeURIComponent(id)}`, { method: 'GET', signal }, 15000, config);
}

export async function deleteHistoryItem(id: string): Promise<{ deleted: boolean }> {
  const config = getSavedConfig();

  if (config.mockMode) {
    await new Promise((r) => setTimeout(r, 200));
    const idx = MOCK_HISTORY.findIndex((item) => item.id === id);
    if (idx !== -1) {
      MOCK_HISTORY.splice(idx, 1);
    }
    return { deleted: true };
  }

  return fetchWithTimeout<{ deleted: boolean }>(
    `/history/${encodeURIComponent(id)}`,
    {
      method: 'DELETE',
    },
    15000,
    config
  );
}

export async function fetchStats(signal?: AbortSignal): Promise<StatsResponse> {
  const config = getSavedConfig();

  if (config.mockMode) {
    await new Promise((r) => setTimeout(r, 200));
    return MOCK_STATS;
  }

  return fetchWithTimeout<StatsResponse>('/stats', { method: 'GET', signal }, 15000, config);
}

/**
 * Downloads CSV export from `/export.csv`
 */
export async function downloadExportCsv(): Promise<void> {
  const config = getSavedConfig();

  if (config.mockMode) {
    // Generate mock CSV content and trigger download
    const csvContent =
      'id,timestamp,source,filename,total_pests,classes\n' +
      MOCK_HISTORY.map((h) => `${h.id},${h.ts},${h.source},${h.filename},${h.total},"${JSON.stringify(h.counts).replace(/"/g, '""')}"`).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `rice_pest_export_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    return;
  }

  const exportUrl = buildMediaUrl('/export.csv', config);
  const headers: Record<string, string> = {};
  if (config.apiKey) {
    headers['x-api-key'] = config.apiKey;
  }

  const res = await fetch(exportUrl, { headers });
  if (!res.ok) {
    throw new ApiError('Không thể xuất file CSV từ máy chủ', res.status);
  }

  const blob = await res.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `bao_cao_sau_hai_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => window.URL.revokeObjectURL(downloadUrl), 2000);
}

/**
 * Formats and converts the backend URL to a WebSocket URL
 * e.g., https://xxxx.trycloudflare.com -> wss://xxxx.trycloudflare.com/ws?key=...
 */
export function getWebSocketUrl(config?: AppConfig): string {
  const cfg = config || getSavedConfig();
  if (!cfg.apiUrl) return '';

  let wsUrl = cfg.apiUrl.replace(/^http:\/\//i, 'ws://').replace(/^https:\/\//i, 'wss://');
  wsUrl = `${wsUrl}/ws`;

  if (cfg.apiKey) {
    wsUrl += `?key=${encodeURIComponent(cfg.apiKey)}`;
  }
  return wsUrl;
}

