import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AppConfig, HealthResponse, ToastMessage, ToastType, PestLanguageOption } from '../types';
import { getSavedConfig, saveConfig, fetchHealth } from '../lib/api';
import { getPestDisplayName } from '../lib/pestTranslations';
import {
  autoDiscoverOnlineBackend,
  AutoDiscoverResult,
  getLatestBackendUrl,
} from '../config/backendConfig';

interface ConfigContextValue {
  config: AppConfig;
  updateConfig: (patch: Partial<AppConfig>) => void;
  status: 'online' | 'offline' | 'checking';
  deviceInfo: string;
  classes: Record<string, string>;
  uptime: number;
  lastChecked: Date | null;
  isSettingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  checkHealth: () => Promise<HealthResponse | null>;
  isAutoDiscovering: boolean;
  runAutoDiscover: () => Promise<AutoDiscoverResult>;
  toasts: ToastMessage[];
  addToast: (type: ToastType, title: string, message?: string) => void;
  removeToast: (id: string) => void;
  theme: 'light' | 'dark' | 'system';
  setTheme: (t: 'light' | 'dark' | 'system') => void;
  isProjectorMode: boolean;
  toggleProjectorMode: () => void;
  pestLanguage: PestLanguageOption;
  setPestLanguage: (lang: PestLanguageOption) => void;
  getPestName: (raw: string | number) => string;
}

const ConfigContext = createContext<ConfigContextValue | null>(null);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfigState] = useState<AppConfig>(getSavedConfig);
  const [status, setStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [deviceInfo, setDeviceInfo] = useState<string>('');
  const [classes, setClasses] = useState<Record<string, string>>({});
  const [uptime, setUptime] = useState<number>(0);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isAutoDiscovering, setIsAutoDiscovering] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Theme support - defaults to 'light' for high brightness and presentation clarity
  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>(() => {
    return (localStorage.getItem('rice_theme') as 'light' | 'dark' | 'system') || 'light';
  });

  // Projector presentation mode (Chế độ Trình chiếu Máy chiếu: Siêu sáng, tương phản cao, phóng to chữ)
  const [isProjectorMode, setIsProjectorMode] = useState<boolean>(() => {
    return localStorage.getItem('rice_projector_mode') === 'true';
  });

  // Update configuration
  const updateConfig = useCallback((patch: Partial<AppConfig>) => {
    const updated = saveConfig(patch);
    setConfigState(updated);
  }, []);

  const pestLanguage = config.pestLanguage || 'vi';

  const setPestLanguage = useCallback(
    (lang: PestLanguageOption) => {
      updateConfig({ pestLanguage: lang });
    },
    [updateConfig]
  );

  const getPestName = useCallback(
    (raw: string | number) => {
      return getPestDisplayName(raw, pestLanguage, classes);
    },
    [pestLanguage, classes]
  );

  const checkCountRef = useRef(0);
  const consecutiveFailuresRef = useRef(0);
  const isAutoConnectingRef = useRef(false);

  // Toast functions
  const addToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Toggle Projector Presentation Mode
  const toggleProjectorMode = useCallback(() => {
    setIsProjectorMode((prev) => {
      const next = !prev;
      localStorage.setItem('rice_projector_mode', String(next));
      if (next) {
        setThemeState('light');
        addToast('success', 'Đã bật Chế độ Máy chiếu', 'Giao diện siêu sáng, tương phản cao và cỡ chữ lớn tối ưu cho màn hình chiếu.');
      } else {
        addToast('info', 'Đã tắt Chế độ Máy chiếu', 'Đã quay lại giao diện hiển thị tiêu chuẩn.');
      }
      return next;
    });
  }, [addToast]);

  // Apply classes to <html> based on theme & projector mode
  useEffect(() => {
    localStorage.setItem('rice_theme', theme);
    const root = document.documentElement;

    if (isProjectorMode) {
      root.classList.add('projector-mode');
      root.classList.remove('dark');
      return;
    }

    root.classList.remove('projector-mode');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (theme === 'dark' || (theme === 'system' && systemPrefersDark)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme, isProjectorMode]);

  // Health check worker
  const checkHealth = useCallback(async (): Promise<HealthResponse | null> => {
    const currentCfg = getSavedConfig();
    if (!currentCfg.apiUrl && !currentCfg.mockMode) {
      setStatus('offline');
      setDeviceInfo('');
      return null;
    }

    try {
      setStatus('checking');
      const health = await fetchHealth(currentCfg);
      setStatus('online');
      setDeviceInfo(health.device || 'CPU');
      setClasses(health.classes || {});
      setUptime(health.uptime_s || 0);
      setLastChecked(new Date());
      consecutiveFailuresRef.current = 0;
      return health;
    } catch {
      setStatus('offline');
      setDeviceInfo('');
      setLastChecked(new Date());
      return null;
    }
  }, []);

  // Auto discovery of online backend across Cloud sync, backend-config.json & candidates
  const runAutoDiscover = useCallback(async (): Promise<AutoDiscoverResult> => {
    if (isAutoConnectingRef.current) {
      return { found: false, url: '', source: 'none' };
    }
    isAutoConnectingRef.current = true;
    setIsAutoDiscovering(true);

    try {
      const res = await autoDiscoverOnlineBackend();
      if (res.found && res.url) {
        updateConfig({ apiUrl: res.url });
        const newCfg = { ...getSavedConfig(), apiUrl: res.url };
        try {
          const health = await fetchHealth(newCfg);
          setStatus('online');
          setDeviceInfo(health.device || 'CPU');
          setClasses(health.classes || {});
          setUptime(health.uptime_s || 0);
          setLastChecked(new Date());
          setIsSettingsOpen(false);

          const sourceLabels: Record<string, string> = {
            cloud: 'Cloud Đồng bộ nhóm',
            config: 'File backend-config.json',
            recent: 'Lịch sử trước đây',
            query: 'Đường dẫn chia sẻ',
            fallback: 'Cấu hình dự phòng',
            local: 'Cục bộ máy',
          };
          const sourceText = sourceLabels[res.source] || 'hệ thống';

          addToast(
            'success',
            'Đã tự động kết nối Backend!',
            `Đã kết nối máy chủ ONLINE từ ${sourceText}: ${res.url}`
          );
        } catch {
          // Ignore
        }
      }
      return res;
    } finally {
      setIsAutoDiscovering(false);
      isAutoConnectingRef.current = false;
    }
  }, [updateConfig, addToast]);

  // Initial startup connection check and auto-failover
  useEffect(() => {
    const isMock = new URLSearchParams(window.location.search).get('mock') === '1';

    const initConnection = async () => {
      const initialHealth = await checkHealth();
      if (!initialHealth && !config.mockMode && !isMock) {
        // Current saved link is dead or empty -> immediately auto-discover from Cloud & config!
        const disc = await runAutoDiscover();
        if (!disc.found && !getLatestBackendUrl()) {
          setIsSettingsOpen(true);
        }
      }
    };

    initConnection();
  }, [checkHealth, config.mockMode, runAutoDiscover]);

  // Listen for backend URL change events from other tabs or components
  useEffect(() => {
    const handleUrlChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ url: string }>;
      if (customEvent.detail?.url && customEvent.detail.url !== config.apiUrl) {
        setConfigState((prev) => ({ ...prev, apiUrl: customEvent.detail.url }));
        checkHealth();
      }
    };

    window.addEventListener('rice_pest_backend_url_change', handleUrlChange);
    return () => window.removeEventListener('rice_pest_backend_url_change', handleUrlChange);
  }, [config.apiUrl, checkHealth]);

  // Recurring 10-second health check with auto-failover if disconnected
  useEffect(() => {
    const interval = setInterval(async () => {
      checkCountRef.current += 1;
      const res = await checkHealth();
      if (!res && !config.mockMode) {
        consecutiveFailuresRef.current += 1;
        // If offline for 2 consecutive intervals (20s), attempt auto-discovery
        if (consecutiveFailuresRef.current === 2) {
          runAutoDiscover();
        }
      } else {
        consecutiveFailuresRef.current = 0;
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [checkHealth, config.mockMode, runAutoDiscover]);

  const value: ConfigContextValue = {
    config,
    updateConfig,
    status,
    deviceInfo,
    classes,
    uptime,
    lastChecked,
    isSettingsOpen,
    openSettings: () => setIsSettingsOpen(true),
    closeSettings: () => setIsSettingsOpen(false),
    checkHealth,
    isAutoDiscovering,
    runAutoDiscover,
    toasts,
    addToast,
    removeToast,
    theme,
    setTheme: setThemeState,
    isProjectorMode,
    toggleProjectorMode,
    pestLanguage,
    setPestLanguage,
    getPestName,
  };

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
};

export function useConfig() {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig phải được sử dụng bên trong ConfigProvider');
  }
  return context;
}
