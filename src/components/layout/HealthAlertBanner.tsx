import React from 'react';
import { useConfig } from '../../context/ConfigContext';
import { AlertCircle, Settings, Sparkles, RefreshCw } from 'lucide-react';

export const HealthAlertBanner: React.FC = () => {
  const { status, config, openSettings, updateConfig, checkHealth } = useConfig();

  if (status !== 'offline' || config.mockMode) {
    return null;
  }

  return (
    <div className="bg-rose-500/10 border-b border-rose-500/20 px-4 py-2.5 text-rose-800 dark:text-rose-200 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-center sm:text-left">
          <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          <span>
            <strong>Chưa kết nối Backend:</strong> Máy chủ Colab có thể chưa bật hoặc URL đã thay đổi. Bấm "Cài đặt & Dò tìm" để tự động nhận link đang online.
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => checkHealth()}
            aria-label="Thử kết nối lại"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-colors shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Thử lại
          </button>
          <button
            onClick={openSettings}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-xs transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            Cài đặt & Dò tìm
          </button>
          <button
            onClick={() => updateConfig({ mockMode: true })}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Dùng Demo
          </button>
        </div>
      </div>
    </div>
  );
};
