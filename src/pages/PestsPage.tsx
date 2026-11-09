import React, { useState, useEffect, useMemo } from 'react';
import { useConfig } from '../context/ConfigContext';
import { fetchPests } from '../lib/api';
import { PestInfo } from '../types';
import { getClassColor } from '../lib/colors';
import { findPestEntry } from '../lib/pestTranslations';
import { SpeciesModal } from '../components/ui/SpeciesModal';
import {
  Bug,
  Search,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  FileQuestion,
  Languages,
  Sparkles,
  Leaf,
  FlaskConical,
  HeartHandshake,
} from 'lucide-react';

export const PestsPage: React.FC = () => {
  const { config, addToast, pestLanguage, setPestLanguage } = useConfig();
  const [pests, setPests] = useState<PestInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'high' | 'medium'>('all');
  const [selectedPestForModal, setSelectedPestForModal] = useState<string | null>(null);

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

  const filteredPests = useMemo(() => {
    return pests.filter((p) => {
      const entry = findPestEntry(p.cls_id ?? p.cls);

      // Severity filter check
      if (severityFilter !== 'all' && entry?.severity !== severityFilter) {
        return false;
      }

      // Query filter check
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;

      return (
        p.name.toLowerCase().includes(q) ||
        p.cls.toLowerCase().includes(q) ||
        (entry?.en && entry.en.toLowerCase().includes(q)) ||
        (entry?.vi && entry.vi.toLowerCase().includes(q)) ||
        (entry?.scientific && entry.scientific.toLowerCase().includes(q)) ||
        (entry?.chemicals && entry.chemicals.some((c) => c.toLowerCase().includes(q))) ||
        (entry?.naturalEnemies && entry.naturalEnemies.some((ne) => ne.toLowerCase().includes(q))) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.prevention && p.prevention.toLowerCase().includes(q))
      );
    });
  }, [pests, searchQuery, severityFilter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Heading & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
            <Bug className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            Cơ sở Dữ liệu 10 Loài Côn trùng Hại Lúa
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Đặc điểm sinh học, thiên địch, hoạt chất đặc trị và quy trình IPM chuẩn Viện Lúa ĐBSCL
          </p>
        </div>

        {/* Search & Language Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Quick Language Toggle */}
          <button
            onClick={() => {
              const next = pestLanguage === 'vi' ? 'en' : pestLanguage === 'en' ? 'both' : 'vi';
              setPestLanguage(next);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            title="Đổi ngôn ngữ hiển thị tên sâu bệnh"
          >
            <Languages className="w-3.5 h-3.5 text-emerald-500" />
            <span>
              {pestLanguage === 'vi' ? 'Tiếng Việt' : pestLanguage === 'en' ? 'English' : 'Song ngữ'}
            </span>
          </button>

          {/* Search Input */}
          <div className="relative flex-1 md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên, triệu chứng, hoạt chất..."
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

      {/* Severity Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: 'all', label: 'Tất cả 10 loài' },
          { id: 'critical', label: '🚨 Nguy cấp (Critical - Rầy nâu, Muỗi hành...)' },
          { id: 'high', label: '⚠️ Nguy cơ cao (High - Sâu cuốn lá, Rầy trắng...)' },
          { id: 'medium', label: '🔍 Trung bình (Medium - Sâu đo, Rầy xanh...)' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSeverityFilter(tab.id as any)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${severityFilter === tab.id
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
          >
            {tab.label}
          </button>
        ))}
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
            Không tìm thấy loài nào phù hợp với điều kiện lọc
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSeverityFilter('all');
            }}
            className="text-xs text-emerald-600 dark:text-emerald-400 underline font-medium"
          >
            Xóa bộ lọc
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

            const severity = translation?.severity || 'medium';

            return (
              <div
                key={pest.cls_id ?? pest.cls}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col justify-between space-y-4 group"
              >
                {/* Header */}
                <div className="space-y-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold">
                      Class ID: {pest.cls_id}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {/* Severity Pill */}
                      <span
                        className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${severity === 'critical'
                            ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20'
                            : severity === 'high'
                              ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                              : 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20'
                          }`}
                      >
                        {severity === 'critical'
                          ? 'Nguy cấp'
                          : severity === 'high'
                            ? 'Nguy cơ cao'
                            : 'Trung bình'}
                      </span>
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: color.stroke }}
                        title="Màu đại diện trong biểu đồ & bounding box"
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug group-hover:text-emerald-600 transition-colors">
                      {primaryTitle}
                    </h3>
                    {secondaryTitle && (
                      <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {secondaryTitle} {translation?.scientific ? `• ${translation.scientific}` : ''}
                      </p>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400 font-mono">
                    Mã nhãn mô hình: <code className="text-slate-600 dark:text-slate-300 font-semibold">{pest.cls}</code>
                  </p>
                </div>

                {/* Body Content */}
                <div className="space-y-3 flex-1 text-xs leading-relaxed">
                  {/* Sensitive Stages */}
                  {translation?.damageStages && translation.damageStages.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Leaf className="w-3 h-3 text-emerald-500" />
                        Giai đoạn lúa mẫn cảm:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {translation.damageStages.map((stage, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2 py-0.5 rounded-md bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-[10px] font-medium border border-emerald-500/20"
                          >
                            {stage}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <div>
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-1">
                      <span className="w-1.5 h-3 bg-emerald-500 rounded-full" />
                      Nhận dạng & Triệu chứng:
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50 line-clamp-3">
                      {pest.description && pest.description.trim() !== ''
                        ? pest.description
                        : 'Chưa có thông tin'}
                    </p>
                  </div>

                  {/* Natural enemies */}
                  {translation?.naturalEnemies && translation.naturalEnemies.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <HeartHandshake className="w-3 h-3 text-blue-500" />
                        Thiên địch tự nhiên:
                      </span>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 italic">
                        {translation.naturalEnemies.join(', ')}
                      </p>
                    </div>
                  )}

                  {/* Chemical active ingredients */}
                  {translation?.chemicals && translation.chemicals.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <FlaskConical className="w-3 h-3 text-purple-500" />
                        Hoạt chất đặc trị:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {translation.chemicals.map((chem, cIdx) => (
                          <span
                            key={cIdx}
                            className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-[10px] font-medium border border-purple-500/20"
                          >
                            {chem}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Prevention */}
                  <div>
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      Biện pháp phòng trừ (IPM):
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 bg-emerald-50/40 dark:bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-200/40 dark:border-emerald-800/30 line-clamp-3">
                      {pest.prevention && pest.prevention.trim() !== ''
                        ? pest.prevention
                        : 'Chưa có thông tin'}
                    </p>
                  </div>
                </div>

                {/* Footer action */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setSelectedPestForModal(pest.cls)}
                    className="w-full py-2 bg-slate-50 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-semibold rounded-xl text-xs transition-colors border border-slate-200/60 dark:border-slate-700/60"
                  >
                    Xem hướng dẫn IPM đầy đủ
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Species Modal */}
      <SpeciesModal
        pestName={selectedPestForModal}
        onClose={() => setSelectedPestForModal(null)}
      />
    </div>
  );
};

