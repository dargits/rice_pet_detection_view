import React, { useEffect, useState } from 'react';
import { Modal } from './Modal';
import { PestInfo } from '../../types';
import { fetchPests } from '../../lib/api';
import { useConfig } from '../../context/ConfigContext';
import { ShieldCheck, Bug, Loader2 } from 'lucide-react';
import { getClassColor } from '../../lib/colors';
import { findPestEntry } from '../../lib/pestTranslations';

interface SpeciesModalProps {
  pestName: string | null;
  onClose: () => void;
}

export const SpeciesModal: React.FC<SpeciesModalProps> = ({ pestName, onClose }) => {
  const { config } = useConfig();
  const [loading, setLoading] = useState(false);
  const [pestData, setPestData] = useState<PestInfo | null>(null);

  useEffect(() => {
    if (!pestName) {
      setPestData(null);
      return;
    }

    let isMounted = true;
    setLoading(true);

    fetchPests(config)
      .then((pests) => {
        if (!isMounted) return;
        // Match by Vietnamese name or raw cls
        const target = pestName.toLowerCase().trim();
        const found = pests.find(
          (p) =>
            p.name.toLowerCase().includes(target) ||
            p.cls.toLowerCase().includes(target) ||
            target.includes(p.cls.toLowerCase()) ||
            target.includes(p.name.toLowerCase())
        );

        if (found) {
          setPestData(found);
        } else {
          // Fallback dummy
          setPestData({
            cls_id: 0,
            cls: pestName,
            name: pestName,
            description: '',
            prevention: '',
          });
        }
      })
      .catch((err) => {
        console.error('Lỗi khi tải thông tin loài:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [pestName, config]);

  if (!pestName) return null;

  const color = getClassColor(pestData?.cls_id ?? pestName);
  const translation = findPestEntry(pestData?.cls_id ?? pestData?.cls ?? pestName);

  return (
    <Modal
      isOpen={Boolean(pestName)}
      onClose={onClose}
      maxWidth="lg"
      title={
        <div className="flex items-center gap-2">
          <Bug className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span>Thông tin loài gây hại</span>
        </div>
      }
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-2" />
          <p className="text-sm">Đang tra cứu cơ sở dữ liệu dịch hại...</p>
        </div>
      ) : pestData ? (
        <div className="space-y-5">
          <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color.stroke }}
                />
                {translation?.vi || pestData.name || pestName}
              </h3>
              {translation?.en && (
                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {translation.en} {translation.scientific ? `• ${translation.scientific}` : ''}
                </p>
              )}
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
                Mã lớp (ID): {pestData.cls_id} • Khóa hệ thống: {pestData.cls}
              </p>
            </div>
            <span
              className="px-3 py-1 rounded-full text-xs font-semibold"
              style={{
                backgroundColor: `${color.stroke}20`,
                color: color.stroke,
              }}
            >
              Côn trùng hại lúa
            </span>
          </div>

          {/* Mô tả đặc điểm */}
          <div className="space-y-1.5">
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-emerald-500 rounded-full" />
              Đặc điểm nhận dạng & triệu chứng hại:
            </h4>
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {pestData.description && pestData.description.trim() !== ''
                ? pestData.description
                : 'Chưa có thông tin'}
            </div>
          </div>

          {/* Biện pháp phòng trừ */}
          <div className="space-y-1.5">
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Biện pháp quản lý dịch hại tổng hợp (IPM) & phòng trị:
            </h4>
            <div className="bg-emerald-50/60 dark:bg-emerald-950/20 p-3.5 rounded-xl border border-emerald-200/60 dark:border-emerald-800/40 text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {pestData.prevention && pestData.prevention.trim() !== ''
                ? pestData.prevention
                : 'Chưa có thông tin'}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-xl transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      ) : (
        <div className="py-6 text-center text-slate-500 text-sm">
          Chưa có thông tin cho loài này.
        </div>
      )}
    </Modal>
  );
};

