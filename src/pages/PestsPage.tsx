import React, { useState, useEffect } from 'react';
import { useConfig } from '../context/ConfigContext';
import { fetchPests } from '../lib/api';
import { PestInfo } from '../types';
import { getClassColor } from '../lib/colors';
import { findPestEntry } from '../lib/pestTranslations';
import {
  Bug,
  Search,
  ShieldCheck,
  RefreshCw,
  FileQuestion,
  Languages,
} from 'lucide-react';

export const PestsPage: React.FC = () => {
  const { config, addToast, pestLanguage, setPestLanguage } = useConfig();
  const [pests, setPests] = useState<PestInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadPests = async () => {
    setLoading(true);
    try {
      const data = await fetchPests(config);
      setPests(data || []);
    } catch (err: any) {
      addToast('error', 'Lỗi tải danh mục loài', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPests();
  }, [config.apiUrl, config.mockMode]);

  const filteredPests = pests.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const entry = findPestEntry(p.cls_id ?? p.cls);
    return (
      p.name.toLowerCase().includes(q) ||
      p.cls.toLowerCase().includes(q) ||
      (entry?.en && entry.en.toLowerCase().includes(q)) ||
      (entry?.vi && entry.vi.toLowerCase().includes(q)) ||
      (entry?.scientific && entry.scientific.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      (p.prevention && p.prevention.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Heading & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
            <Bug className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            Cơ sở Dữ liệu Loài Côn trùng Gây Hại Lúa
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Đặc điểm sinh học, triệu chứng gây hại và quy trình quản lý dịch hại tổng hợp (IPM)
          </p>
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-2 w-full md:w-80">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên sâu hoặc triệu chứng..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-colors"
            />
          </div>

          <button
            onClick={loadPests}
            disabled={loading}
            aria-label="Làm mới danh sách loài"
            className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-colors shrink-0"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Grid of Pest Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 animate-pulse"
            >
              <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
              <div className="h-20 bg-slate-100 dark:bg-slate-800/60 rounded"></div>
              <div className="h-24 bg-slate-100 dark:bg-slate-800/60 rounded"></div>
            </div>
          ))}
        </div>
      ) : filteredPests.length === 0 ? (
        <div className="py-16 text-center text-slate-400 space-y-2">
          <FileQuestion className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            Không tìm thấy loài nào phù hợp với từ khóa "{searchQuery}"
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs text-emerald-600 dark:text-emerald-400 underline font-medium"
          >
            Xóa bộ lọc tìm kiếm
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPests.map((pest) => {
            const color = getClassColor(pest.cls_id ?? pest.cls);
            const translation = findPestEntry(pest.cls_id ?? pest.cls);
            const primaryTitle =
              pestLanguage === 'en'
                ? translation?.en || pest.name
                : translation?.vi || pest.name;
            const secondaryTitle =
              pestLanguage === 'en'
                ? translation?.vi
                : translation?.en;

            return (
              <div
                key={pest.cls_id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col justify-between space-y-4"
              >
                {/* Header */}
                <div className="space-y-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold">
                      Class ID: {pest.cls_id}
                    </span>
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: color.stroke }}
                      title="Màu đại diện trong biểu đồ & nhận diện"
                    />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
                      {primaryTitle}
                    </h3>
                    {secondaryTitle && (
                      <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {secondaryTitle} {translation?.scientific ? `• ${translation.scientific}` : ''}
                      </p>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Mã nhãn: <code className="text-slate-600 dark:text-slate-300 font-semibold">{pest.cls}</code>
                  </p>
                </div>

                {/* Body Content */}
                <div className="space-y-3 flex-1 text-xs leading-relaxed">
                  {/* Description */}
                  <div>
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-1">
                      <span className="w-1.5 h-3 bg-emerald-500 rounded-full" />
                      Nhận dạng & Triệu chứng:
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                      {pest.description && pest.description.trim() !== ''
                        ? pest.description
                        : 'Chưa có thông tin'}
                    </p>
                  </div>

                  {/* Prevention */}
                  <div>
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      Biện pháp phòng trừ (IPM):
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 bg-emerald-50/40 dark:bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-200/40 dark:border-emerald-800/30">
                      {pest.prevention && pest.prevention.trim() !== ''
                        ? pest.prevention
                        : 'Chưa có thông tin'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
