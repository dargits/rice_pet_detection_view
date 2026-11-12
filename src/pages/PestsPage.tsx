import React, { useState, useMemo } from 'react';
import { useConfig } from '../context/ConfigContext';
import {
  PEST_DATABASE_10,
  CLRRI_IPM_PROTOCOL,
  PestTranslationEntry,
} from '../lib/pestTranslations';
import { getClassColor } from '../lib/colors';
import { SpeciesModal } from '../components/ui/SpeciesModal';
import {
  Bug,
  Search,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Leaf,
  FlaskConical,
  HeartHandshake,
  Languages,
  BookOpen,
  Droplets,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Info,
} from 'lucide-react';

export const PestsPage: React.FC = () => {
  const { pestLanguage, setPestLanguage } = useConfig();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'high' | 'medium'>('all');
  const [selectedPestForModal, setSelectedPestForModal] = useState<string | null>(null);
  const [showIpmGuide, setShowIpmGuide] = useState<boolean>(true);

  // Directly use the comprehensive 10-species database
  const allPests: PestTranslationEntry[] = PEST_DATABASE_10;

  const filteredPests = useMemo(() => {
    return allPests.filter((pest) => {
      // Severity filter check
      if (severityFilter !== 'all' && pest.severity !== severityFilter) {
        return false;
      }

      // Search query check
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;

      return (
        pest.vi.toLowerCase().includes(q) ||
        pest.en.toLowerCase().includes(q) ||
        pest.scientific.toLowerCase().includes(q) ||
        pest.key.toLowerCase().includes(q) ||
        pest.vietnameseOtherNames?.some((n) => n.toLowerCase().includes(q)) ||
        pest.symptoms.toLowerCase().includes(q) ||
        pest.morphology?.toLowerCase().includes(q) ||
        pest.economicThreshold?.toLowerCase().includes(q) ||
        pest.chemicals.some((c) => c.toLowerCase().includes(q)) ||
        pest.naturalEnemies.some((ne) => ne.toLowerCase().includes(q)) ||
        pest.chemicalDetails?.some((cd) => cd.tradeNames.some((tn) => tn.toLowerCase().includes(q)))
      );
    });
  }, [allPests, searchQuery, severityFilter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Bug className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                Cơ sở Dữ liệu 10 Loài Côn trùng Hại Lúa
              </h1>
              <p className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-400 font-medium">
                Đặc điểm sinh học, thiên địch, hoạt chất đặc trị & quy trình IPM chuẩn Viện Lúa ĐBSCL (CLRRI)
              </p>
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Toggle IPM Protocol Banner */}
          <button
            onClick={() => setShowIpmGuide(!showIpmGuide)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
              showIpmGuide
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/20'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Quy trình IPM Viện Lúa</span>
            {showIpmGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {/* Quick Language Toggle */}
          <button
            onClick={() => {
              const next = pestLanguage === 'vi' ? 'en' : pestLanguage === 'en' ? 'both' : 'vi';
              setPestLanguage(next);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors border border-slate-200 dark:border-slate-700"
            title="Đổi ngôn ngữ hiển thị tên sâu bệnh"
          >
            <Languages className="w-3.5 h-3.5 text-emerald-500" />
            <span>
              {pestLanguage === 'vi' ? 'Tiếng Việt' : pestLanguage === 'en' ? 'English' : 'Song ngữ'}
            </span>
          </button>
        </div>
      </div>

      {/* CLRRI IPM Standard Procedure Showcase Accordion/Banner */}
      {showIpmGuide && (
        <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-slate-100 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-slate-900/40 border-2 border-emerald-500/30 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-500/20 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                {CLRRI_IPM_PROTOCOL.title}
              </h2>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 px-3 py-1 rounded-full border border-emerald-500/30 self-start sm:self-auto">
              {CLRRI_IPM_PROTOCOL.institute}
            </span>
          </div>

          {/* 4 Core Principles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {CLRRI_IPM_PROTOCOL.fourCorePrinciples.map((item) => (
              <div
                key={item.number}
                className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-900/80 border border-emerald-500/20 shadow-sm space-y-1.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                      {item.number}
                    </span>
                    <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100 leading-snug">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* 1 Must 5 Reductions & 4 Rights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 pt-2">
            {/* 1 Must 5 Reductions */}
            <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2">
              <h4 className="font-bold text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <Leaf className="w-4 h-4 text-emerald-600" />
                Tiêu chuẩn "1 Phải 5 Giảm" của Viện Lúa:
              </h4>
              <div className="text-[11px] text-slate-700 dark:text-slate-300 font-semibold p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/25">
                ★ 1 Phải: {CLRRI_IPM_PROTOCOL.oneMustFiveReductions.must}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                {CLRRI_IPM_PROTOCOL.oneMustFiveReductions.reductions.map((red, rIdx) => (
                  <div key={rIdx} className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                    <strong className="text-emerald-700 dark:text-emerald-400">• {red.name}:</strong>{' '}
                    <span className="text-slate-600 dark:text-slate-400">{red.detail}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 4 Rights Rule in Chemicals */}
            <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2">
              <h4 className="font-bold text-xs text-purple-800 dark:text-purple-300 flex items-center gap-1.5">
                <FlaskConical className="w-4 h-4 text-purple-600" />
                Nguyên tắc "4 Đúng" khi sử dụng thuốc BVTV:
              </h4>
              <div className="space-y-1.5 text-[11px]">
                {CLRRI_IPM_PROTOCOL.fourRightsRule.map((rule, ruIdx) => (
                  <div key={ruIdx} className="p-2 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-500/20 flex items-start gap-2">
                    <span className="font-bold text-purple-700 dark:text-purple-300 shrink-0">
                      {rule.title}:
                    </span>
                    <span className="text-slate-600 dark:text-slate-400">
                      {rule.detail}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên loài, triệu chứng, hoạt chất (Virtako, Pexena...), thiên địch..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Severity Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: 'Tất cả (10 loài)' },
            { id: 'critical', label: '🚨 Nguy cấp (3)' },
            { id: 'high', label: '⚠️ Nguy cơ cao (4)' },
            { id: 'medium', label: '🔍 Trung bình (3)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSeverityFilter(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                severityFilter === tab.id
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of 10 Pest Cards */}
      {filteredPests.length === 0 ? (
        <div className="py-16 text-center text-slate-400 space-y-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <Bug className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Không tìm thấy loài nào khớp với từ khóa "{searchQuery}"
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSeverityFilter('all');
            }}
            className="text-xs text-emerald-600 dark:text-emerald-400 underline font-medium"
          >
            Xóa tìm kiếm
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPests.map((pest) => {
            const color = getClassColor(pest.id);

            const primaryTitle =
              pestLanguage === 'en'
                ? pest.en
                : pest.vi;
            const secondaryTitle =
              pestLanguage === 'en'
                ? pest.vi
                : pest.en;

            return (
              <div
                key={pest.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all p-5 flex flex-col justify-between space-y-4 group"
              >
                {/* Card Header */}
                <div className="space-y-2.5 border-b border-slate-100 dark:border-slate-800 pb-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                      ID: {pest.id} • {pest.key}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${
                          pest.severity === 'critical'
                            ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30'
                            : pest.severity === 'high'
                            ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30'
                            : 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30'
                        }`}
                      >
                        {pest.severity === 'critical'
                          ? '🚨 Nguy cấp'
                          : pest.severity === 'high'
                          ? '⚠️ Nguy hại cao'
                          : '🔍 Trung bình'}
                      </span>
                      <span
                        className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: color.stroke }}
                        title="Mã màu nhận diện trên Canvas YOLOv11"
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 leading-snug group-hover:text-emerald-600 transition-colors">
                      {primaryTitle}
                    </h3>
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">
                      {secondaryTitle} ‹ {pest.scientific} ›
                    </p>
                  </div>
                </div>

                {/* Card Body */}
                <div className="space-y-3 flex-1 text-xs leading-relaxed">
                  {/* Sensitive Stages */}
                  {pest.damageStages && pest.damageStages.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Leaf className="w-3 h-3 text-emerald-500" />
                        Giai đoạn lúa mẫn cảm:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {pest.damageStages.map((stage, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-[10px] font-semibold border border-emerald-500/20"
                          >
                            {stage}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Morphology & Symptoms summary */}
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-1">
                      <span className="w-1.5 h-3 bg-emerald-500 rounded-full" />
                      Đặc điểm & Triệu chứng:
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50 line-clamp-3 text-[11px]">
                      {pest.symptoms}
                    </p>
                  </div>

                  {/* Natural Enemies */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <HeartHandshake className="w-3 h-3 text-blue-500" />
                      Thiên địch tự nhiên:
                    </span>
                    <p className="text-[11px] text-slate-700 dark:text-slate-300 italic">
                      {pest.naturalEnemies.join(', ')}
                    </p>
                  </div>

                  {/* Chemicals & Trade Names */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <FlaskConical className="w-3 h-3 text-purple-500" />
                      Hoạt chất đặc trị & Thuốc thương phẩm:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {pest.chemicals.map((chem, cIdx) => (
                        <span
                          key={cIdx}
                          className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-[10px] font-semibold border border-purple-500/20"
                        >
                          {chem}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Economic Threshold (ET) Highlight */}
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-0.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Ngưỡng kinh tế (ET) Viện Lúa:
                    </span>
                    <p className="text-[11px] text-slate-800 dark:text-slate-200 font-semibold line-clamp-2">
                      {pest.economicThreshold}
                    </p>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setSelectedPestForModal(pest.key)}
                    className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 font-bold rounded-xl text-xs transition-colors border border-emerald-500/20 active:scale-95"
                  >
                    Xem chi tiết Bách khoa IPM
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4-Tab Species Details Modal */}
      <SpeciesModal
        pestName={selectedPestForModal}
        onClose={() => setSelectedPestForModal(null)}
      />
    </div>
  );
};
