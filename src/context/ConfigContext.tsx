import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AppConfig, HealthResponse, ToastMessage, ToastType, PestLanguageOption } from '../types';
import { getSavedConfig, saveConfig, fetchHealth, normalizeUrl } from '../lib/api';
import { getPestDisplayName } from '../lib/pestTranslations';

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
      return health;
    } catch {
      setStatus('offline');
      setDeviceInfo('');
      setLastChecked(new Date());
      return null;
    }
  }, []);

  // Initial setup: auto open settings if no API URL and not in mock mode
  useEffect(() => {
    const isMock = new URLSearchParams(window.location.search).get('mock') === '1';
    if (!config.apiUrl && !config.mockMode && !isMock) {
      setIsSettingsOpen(true);
    }
    checkHealth();
  }, [checkHealth, config.apiUrl, config.mockMode]);

  // Recurring 10-second health check
  useEffect(() => {
    const interval = setInterval(() => {
      checkCountRef.current += 1;
      checkHealth();
    }, 10000);

    return () => clearInterval(interval);
  }, [checkHealth]);

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

