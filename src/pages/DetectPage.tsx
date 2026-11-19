import React, { useState } from 'react';
import { ImageDetectTab } from '../components/detect/ImageDetectTab';
import { VideoDetectTab } from '../components/detect/VideoDetectTab';
import { WebcamDetectTab } from '../components/detect/WebcamDetectTab';
import {
  Image as ImageIcon,
  Video,
  Camera,
  Sparkles,
} from 'lucide-react';

export const DetectPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'image' | 'video' | 'webcam'>('image');

  const tabs = [
    {
      id: 'image',
      label: 'Hình ảnh',
      icon: ImageIcon,
    },
    {
      id: 'video',
      label: 'Video',
      icon: Video,
    },
    {
      id: 'webcam',
      label: 'Camera trực tiếp',
      icon: Camera,
    },
  ] as const;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header & Top Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Nhận diện sâu bệnh hại lúa
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              YOLOv11s • 10 loài
            </span>
          </div>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium">
            Khoanh vùng tọa độ chính xác, thống kê mật độ cá thể và khuyến cáo quy trình xử lý IPM.
          </p>
        </div>

        {/* Input Mode Switcher (Clean, large & minimal) */}
        <div className="flex items-center gap-1 p-1.5 bg-slate-100/90 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 self-start sm:self-auto shadow-xs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm sm:text-base font-bold transition-all ${
                  isActive
                    ? 'bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Panels with Keep-Alive to preserve input files, canvas, and detection state */}
      <div className={activeTab === 'image' ? 'block' : 'hidden'}>
        <ImageDetectTab />
      </div>
      <div className={activeTab === 'video' ? 'block' : 'hidden'}>
        <VideoDetectTab />
      </div>
      <div className={activeTab === 'webcam' ? 'block' : 'hidden'}>
        <WebcamDetectTab isActive={activeTab === 'webcam'} />
      </div>
    </div>
  );
};
