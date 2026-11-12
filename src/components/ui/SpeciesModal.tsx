import React, { useState } from 'react';
import { Modal } from './Modal';
import { findPestEntry, PestTranslationEntry } from '../../lib/pestTranslations';
import { getClassColor } from '../../lib/colors';
import {
  Bug,
  ShieldCheck,
  FlaskConical,
  HeartHandshake,
  Sprout,
  AlertTriangle,
  Info,
  Calendar,
  Layers,
  Leaf,
  Droplets,
  ExternalLink,
} from 'lucide-react';

interface SpeciesModalProps {
  pestName: string | null;
  onClose: () => void;
}

export const SpeciesModal: React.FC<SpeciesModalProps> = ({ pestName, onClose }) => {
  const [activeTab, setActiveTab] = useState<'biology' | 'enemies' | 'chemicals' | 'ipm'>('biology');

  if (!pestName) return null;

  const pest: PestTranslationEntry | null = findPestEntry(pestName);
  const color = getClassColor(pest ? pest.id : pestName);

  const displayNameVi = pest ? pest.vi : pestName;
  const displayNameEn = pest ? pest.en : '';
  const scientific = pest ? pest.scientific : '';

  const modalTabs = [
    { id: 'biology', label: 'Đặc điểm sinh học', icon: Bug },
    { id: 'enemies', label: 'Thiên địch tự nhiên', icon: HeartHandshake },
    { id: 'chemicals', label: 'Hoạt chất đặc trị', icon: FlaskConical },
    { id: 'ipm', label: 'Quy trình IPM Viện Lúa', icon: ShieldCheck },
  ] as const;

  return (
    <Modal
      isOpen={Boolean(pestName)}
      onClose={onClose}
      maxWidth="2xl"
      title={
        <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm"
            style={{ backgroundColor: color.stroke }}
          >
            <Bug className="w-4 h-4" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight">
              Bách khoa Thư Côn trùng Hại Lúa
            </span>
            <span className="text-[11px] font-mono ml-2 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
              Chuẩn Viện Lúa ĐBSCL
            </span>
          </div>
        </div>
      }
    >
      <div className="space-y-5 -mt-1">
        {/* Header Hero Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-100/90 via-emerald-50/40 to-slate-100/90 dark:from-slate-800/80 dark:via-emerald-950/20 dark:to-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: color.stroke }}
                />
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  {displayNameVi}
                </h3>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">
                {displayNameEn} {scientific ? `• ‹ ${scientific} ›` : ''}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <span
                className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                  pest?.severity === 'critical'
                    ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30'
                    : pest?.severity === 'high'
                    ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
                    : 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30'
                }`}
              >
                {pest?.severity === 'critical'
                  ? '🚨 Nguy cấp'
                  : pest?.severity === 'high'
                  ? '⚠️ Nguy hại cao'
                  : '🔍 Mức trung bình'}
              </span>
              {pest && (
                <span className="text-[11px] font-mono px-2 py-1 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold">
                  Class ID: {pest.id}
                </span>
              )}
            </div>
          </div>

          {pest?.vietnameseOtherNames && pest.vietnameseOtherNames.length > 0 && (
            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
              <span className="font-semibold text-slate-600 dark:text-slate-300">Tên gọi dân gian:</span>
              {pest.vietnameseOtherNames.map((name, i) => (
                <span key={i} className="bg-white/80 dark:bg-slate-900/60 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-700/60">
                  {name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 overflow-x-auto scrollbar-none">
          {modalTabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  isActive
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Biology & Symptoms */}
        {activeTab === 'biology' && (
          <div className="space-y-4 animate-in fade-in duration-150 text-xs sm:text-sm">
            {/* Morphology */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/70 space-y-1.5">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-emerald-500 rounded-full" />
                Đặc điểm hình thái & Nhận diện:
              </h4>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs sm:text-[13px]">
                {pest?.morphology || pest?.symptoms || 'Đang cập nhật đặc điểm hình thái.'}
              </p>
            </div>

            {/* Lifecycle */}
            {pest?.lifecycle && (
              <div className="p-3.5 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 space-y-1.5">
                <h4 className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  Vòng đời sinh học & Chu kỳ phát triển:
                </h4>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs sm:text-[13px]">
                  {pest.lifecycle}
                </p>
              </div>
            )}

            {/* Damage Symptoms */}
            <div className="p-3.5 rounded-2xl bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 space-y-1.5">
              <h4 className="font-bold text-rose-900 dark:text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                Triệu chứng gây hại trên cây lúa:
              </h4>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs sm:text-[13px]">
                {pest?.symptoms || 'Chưa có thông tin triệu chứng.'}
              </p>
            </div>

            {/* Sensitive Stages */}
            {pest?.damageStages && pest.damageStages.length > 0 && (
              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-xs">
                  <Leaf className="w-3.5 h-3.5 text-emerald-500" />
                  Giai đoạn sinh trưởng lúa mẫn cảm nhất:
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {pest.damageStages.map((stage, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-xs font-semibold border border-emerald-500/25"
                    >
                      {stage}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Natural Enemies & Ecology */}
        {activeTab === 'enemies' && (
          <div className="space-y-4 animate-in fade-in duration-150 text-xs sm:text-sm">
            <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/25 space-y-1">
              <h4 className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-blue-600" />
                Cân bằng sinh thái ruộng lúa:
              </h4>
              <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
                Thiên địch đóng vai trò khống chế 60 - 80% mật độ sâu hại trong điều kiện canh tác tự nhiên.
                Bảo vệ đàn thiên địch bằng cách <strong>không phun thuốc trừ sâu sớm trong 40 ngày đầu sau sạ</strong>.
              </p>
            </div>

            {/* Detailed list of natural enemies */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">
                Các loài thiên địch chủ lực:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {pest?.naturalEnemiesDetail && pest.naturalEnemiesDetail.length > 0 ? (
                  pest.naturalEnemiesDetail.map((enemy, eIdx) => (
                    <div
                      key={eIdx}
                      className="p-3 rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                          {enemy.name}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            enemy.type === 'predator'
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                              : enemy.type === 'parasitoid'
                              ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300'
                              : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                          }`}
                        >
                          {enemy.type === 'predator'
                            ? 'Ăn thịt'
                            : enemy.type === 'parasitoid'
                            ? 'Ký sinh'
                            : 'Gây bệnh'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                        {enemy.description}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-xs">
                    {pest?.naturalEnemies.join(', ') || 'Chưa có thông tin thiên địch.'}
                  </p>
                )}
              </div>
            </div>

            {/* Ecological Engineering / Flower strip */}
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-1.5">
              <h4 className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5 text-xs">
                <Sprout className="w-4 h-4 text-emerald-600" />
                Công nghệ sinh thái: Trồng hoa bờ ruộng Viện Lúa ĐBSCL
              </h4>
              <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
                Khuyến cáo trồng các loại hoa có mật và phấn hoa trên bờ ruộng (hoa cúc xuyến chi, vạn thọ, hoa mười giờ, mè, đậu bắp)
                để làm nguồn thức ăn duy trì quần thể ong mắt đỏ (*Trichogramma*) và bọ xít mù xanh khi sâu hại trên ruộng còn ít.
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Chemical & Biological Actives */}
        {activeTab === 'chemicals' && (
          <div className="space-y-4 animate-in fade-in duration-150 text-xs sm:text-sm">
            <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/25 space-y-1">
              <h4 className="font-bold text-purple-900 dark:text-purple-300 flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-purple-600" />
                Danh mục Hoạt chất & Thuốc Đặc trị Thế hệ mới:
              </h4>
              <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
                Chỉ sử dụng thuốc bảo vệ thực vật khi mật độ sâu hại vượt ngưỡng phòng trừ kinh tế (ET).
                Ưu tiên hoạt chất chọn lọc, ít ảnh hưởng thiên địch và cá ruộng.
              </p>
            </div>

            {/* Detailed list of chemical items */}
            <div className="space-y-3">
              {pest?.chemicalDetails && pest.chemicalDetails.length > 0 ? (
                pest.chemicalDetails.map((chem, cIdx) => (
                  <div
                    key={cIdx}
                    className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-2"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 dark:border-slate-700/60 pb-2">
                      <span className="font-bold text-xs sm:text-sm text-purple-700 dark:text-purple-300">
                        {chem.active}
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {chem.tradeNames.map((tn, tIdx) => (
                          <span
                            key={tIdx}
                            className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-[10px] font-bold border border-purple-500/20"
                          >
                            {tn}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300">
                      <strong>Cơ chế tác động:</strong> {chem.modeOfAction}
                    </p>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-500/5 dark:bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
                      <strong>Khuyến cáo sử dụng:</strong> {chem.guideline}
                    </p>
                  </div>
                ))
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {pest?.chemicals.map((chem, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-xs font-semibold border border-purple-500/25"
                    >
                      {chem}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: CLRRI IPM Standard Protocol */}
        {activeTab === 'ipm' && (
          <div className="space-y-4 animate-in fade-in duration-150 text-xs sm:text-sm">
            {/* Economic Threshold Card */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 space-y-1.5">
              <h4 className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Ngưỡng Phòng trừ Kinh tế (ET) Chuẩn Viện Lúa ĐBSCL:
              </h4>
              <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                {pest?.clrriIpm?.economicThreshold || pest?.economicThreshold || 'Đang cập nhật ngưỡng ET.'}
              </p>
            </div>

            {/* 4 Pillars of CLRRI IPM */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 space-y-1">
                <h5 className="font-bold text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <Leaf className="w-3.5 h-3.5" />
                  1. Canh tác "1 Phải 5 Giảm":
                </h5>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  {pest?.clrriIpm?.culturalMeasures || 'Gieo sạ mật độ thưa 80-100 kg/ha, bón phân cân đối N-P-K theo bảng so màu lá lúa LCC.'}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 space-y-1">
                <h5 className="font-bold text-xs text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5" />
                  2. Điều tiết nước AWD (Ngập khô xen kẽ):
                </h5>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  {pest?.clrriIpm?.waterManagement || 'Tưới ngập - khô xen kẽ bằng ống đo nước PVC để rễ ăn sâu và hạn chế độ ẩm ổ dịch rầy nâu, muỗi hành.'}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 space-y-1">
                <h5 className="font-bold text-xs text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                  <Sprout className="w-3.5 h-3.5" />
                  3. Bảo tồn sinh thái:
                </h5>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  {pest?.clrriIpm?.biologicalControl || 'Trồng hoa bờ ruộng dẫn dụ thiên địch, không phun thuốc trừ sâu sớm trong 40 ngày đầu sau sạ.'}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 space-y-1">
                <h5 className="font-bold text-xs text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                  <FlaskConical className="w-3.5 h-3.5" />
                  4. Nguyên tắc "4 Đúng" dùng thuốc:
                </h5>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  {pest?.clrriIpm?.chemicalStrategy || 'Đúng thuốc, đúng lúc (sâu non tuổi 1-2), đúng nồng độ liều lượng, đúng cách (hạ vòi phun sát gốc).'}
                </p>
              </div>
            </div>

            {/* Note from CLRRI */}
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-[11px] text-slate-500 dark:text-slate-400 italic">
              * Khuyến cáo từ Viện Lúa Đồng bằng Sông Cửu Long (CLRRI - Cần Thơ). Quyết định xử lý thuốc BVTV cần căn cứ vào kết quả điều tra thăm đồng thực tế và giai đoạn sinh trưởng của cây lúa.
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Dữ liệu tích hợp mô hình YOLOv11 & Kiến thức Nông nghiệp CLRRI
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-emerald-600/20 active:scale-95"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </Modal>
  );
};
