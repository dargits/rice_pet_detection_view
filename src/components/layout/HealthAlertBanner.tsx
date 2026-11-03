import React from 'react';
import { useConfig } from '../../context/ConfigContext';
import { AlertCircle, Settings, Sparkles, RefreshCw } from 'lucide-react';

export const HealthAlertBanner: React.FC = () => {
  const { status, config, openSettings, updateConfig, checkHealth } = useConfig();

  if (status !== 'offline' || config.mockMode) {
    return null;
  }

  return (
    <div className="bg-rose-500/10 border-b border-rose-500/20 px-4 py-2.5 text-rose-800 dark:text-rose-200">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2 text-center sm:text-left">
          <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          <span>
            <strong>Backend chưa kết nối hoặc đã ngắt:</strong> Colab có thể đã ngắt phiên hoặc URL Cloudflared đã đổi. Hãy chạy lại cell trên Colab, copy URL mới và dán vào Cài đặt.
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => checkHealth()}
            aria-label="Thử kết nối lại"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-medium transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Thử lại
          </button>
          <button
            onClick={openSettings}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs shadow-sm transition-colors"
          >
            <Settings className="w-3 h-3" />
            Cập nhật URL
          </button>
          <button
            onClick={() => updateConfig({ mockMode: true })}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-medium transition-colors"
          >
            <Sparkles className="w-3 h-3 text-emerald-500" />
            Dùng thử Demo
          </button>
        </div>
      </div>
    </div>
  );
};

