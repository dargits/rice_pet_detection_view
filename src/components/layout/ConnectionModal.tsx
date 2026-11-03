import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { useConfig } from '../../context/ConfigContext';
import {
  Server,
  Sliders,
  Film,
  CheckCircle2,
  XCircle,
  Loader2,
  HelpCircle,
  Eye,
  EyeOff,
  Sparkles,
  Languages,
} from 'lucide-react';
import { normalizeUrl, fetchHealth } from '../../lib/api';
import { PestLanguageOption } from '../../types';

export const ConnectionModal: React.FC = () => {
  const { config, updateConfig, isSettingsOpen, closeSettings, addToast, checkHealth } = useConfig();

  const [apiUrl, setApiUrl] = useState(config.apiUrl);
  const [apiKey, setApiKey] = useState(config.apiKey);
  const [defaultConf, setDefaultConf] = useState(config.defaultConf);
  const [videoSkip, setVideoSkip] = useState(config.videoSkip);
  const [mockMode, setMockMode] = useState(config.mockMode);
  const [pestLanguage, setPestLanguageState] = useState<PestLanguageOption>(config.pestLanguage || 'vi');

  const [showApiKey, setShowApiKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    device?: string;
  } | null>(null);

  // Sync state when config changes or modal opens
  useEffect(() => {
    if (isSettingsOpen) {
      setApiUrl(config.apiUrl);
      setApiKey(config.apiKey);
      setDefaultConf(config.defaultConf);
      setVideoSkip(config.videoSkip);
      setMockMode(config.mockMode);
      setPestLanguageState(config.pestLanguage || 'vi');
      setTestResult(null);
    }
  }, [isSettingsOpen, config]);

  const handleTestConnection = async () => {
    const cleanUrl = normalizeUrl(apiUrl);
    if (!cleanUrl && !mockMode) {
      setTestResult({
        success: false,
        message: 'Vui lòng nhập Backend URL trước khi kiểm tra!',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const tempConfig = {
        apiUrl: cleanUrl,
        apiKey: apiKey.trim(),
        defaultConf,
        videoSkip,
        mockMode,
        pestLanguage,
      };

      const res = await fetchHealth(tempConfig);
      setTestResult({
        success: true,
        message: `Kết nối thành công! Trạng thái: ${res.status}`,
        device: res.device,
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Không thể kết nối tới server.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    const cleaned = normalizeUrl(apiUrl);
    updateConfig({
      apiUrl: cleaned,
      apiKey: apiKey.trim(),
      defaultConf: Number(defaultConf),
      videoSkip: Number(videoSkip),
      mockMode,
      pestLanguage,
    });

    addToast('success', 'Đã lưu cấu hình kết nối', 'Các thay đổi đã được cập nhật thành công.');
    checkHealth();
    closeSettings();
  };

  return (
    <Modal
      isOpen={isSettingsOpen}
      onClose={closeSettings}
      maxWidth="lg"
      title={
        <div className="flex items-center gap-2">
          <Server className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span className="font-semibold">Cài đặt kết nối Backend</span>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Mock Mode Alert / Toggle */}
        <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-xl border border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-between gap-4">
          <div className="flex items-start gap-2.5">
            <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Chế độ trải nghiệm giả lập (Demo/Mock)
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Bật chế độ này để dùng thử toàn bộ tính năng (ảnh, video, thống kê, loài) mà không cần bật Colab.
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={mockMode}
              onChange={(e) => setMockMode(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {/* Backend URL Input */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Backend URL (FastAPI / Cloudflared)
          </label>
          <div className="relative">
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="https://xxxx.trycloudflare.com"
              disabled={mockMode}
              className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-colors ${
                mockMode
                  ? 'opacity-50 cursor-not-allowed border-slate-200 dark:border-slate-700'
                  : 'border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100'
              }`}
            />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            Hệ thống tự động thêm <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">https://</code> nếu bạn quên. Mỗi lần Colab chạy lại, link Cloudflared sẽ thay đổi.
          </p>
        </div>

        {/* API Key Input */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Khóa bí mật API Key (Tùy chọn)
          </label>
          <div className="relative">
            <input
              type={showApiKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Nhập API Key nếu server yêu cầu x-api-key"
              disabled={mockMode}
              className="w-full pl-3.5 pr-10 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              aria-label={showApiKey ? 'Ẩn API key' : 'Hiện API key'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
            >
              {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Header <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">x-api-key</code> sẽ được gắn tự động vào mọi yêu cầu.
          </p>
        </div>

        {/* Parameters Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Confidence Slider */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-emerald-500" />
                Ngưỡng tin cậy (Conf)
              </label>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/20">
                {defaultConf.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="0.9"
              step="0.05"
              value={defaultConf}
              onChange={(e) => setDefaultConf(parseFloat(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0.10 (Nhạy)</span>
              <span>0.40 (Chuẩn)</span>
              <span>0.90 (Chính xác cao)</span>
            </div>
          </div>

          {/* Video Skip Slider */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Film className="w-4 h-4 text-emerald-500" />
                Bỏ qua khung hình (Skip)
              </label>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/20">
                {videoSkip} frames
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={videoSkip}
              onChange={(e) => setVideoSkip(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>1 (Mỗi frame)</span>
              <span>3 (Khuyến nghị)</span>
              <span>10 (Nhanh)</span>
            </div>
          </div>
        </div>

        {/* Pest Language Option (Vietnamese vs English) */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Languages className="w-4 h-4 text-emerald-500" />
            Ngôn ngữ hiển thị tên sâu bệnh (Pest Names)
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'vi', label: 'Tiếng Việt', desc: 'Rầy nâu, Sâu cuốn lá...' },
              { id: 'en', label: 'English', desc: 'Brown Planthopper...' },
              { id: 'both', label: 'Song ngữ', desc: 'Rầy nâu (Planthopper)' },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setPestLanguageState(opt.id as PestLanguageOption)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  pestLanguage === opt.id
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 shadow-sm ring-1 ring-emerald-500'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="font-bold text-xs flex items-center justify-between">
                  <span>{opt.label}</span>
                  {pestLanguage === opt.id && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  )}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                  {opt.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Test Result Message */}
        {testResult && (
          <div
            className={`p-3.5 rounded-xl border text-sm flex items-start gap-2.5 animate-in fade-in ${
              testResult.success
                ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300'
                : 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-semibold">{testResult.message}</p>
              {testResult.device && (
                <p className="text-xs mt-0.5 opacity-90">Thiết bị xử lý: {testResult.device}</p>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors disabled:opacity-50"
          >
            {isTesting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Đang thử kết nối...
              </>
            ) : (
              'Kiểm tra kết nối'
            )}
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={closeSettings}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl transition-colors"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl shadow-md shadow-emerald-600/20 transition-all"
            >
              Lưu cài đặt
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

