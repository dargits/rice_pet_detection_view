import React from 'react';
import { Sprout, Heart, ShieldAlert } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-xs text-slate-500 dark:text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Sprout className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            RicePest AI (YOLOv11)
          </span>
          <span>• Đề tài Nhận diện & Phân loại côn trùng gây hại trên cây lúa</span>
        </div>

        <div className="flex items-center gap-4 text-center">
          <span className="flex items-center gap-1">
            Mô hình tối ưu hoá cho nông nghiệp thông minh
          </span>
        </div>
      </div>
    </footer>
  );
};

