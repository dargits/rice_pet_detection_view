import React, { useState } from 'react';
import { ImageDetectTab } from '../components/detect/ImageDetectTab';
import { VideoDetectTab } from '../components/detect/VideoDetectTab';
import { WebcamDetectTab } from '../components/detect/WebcamDetectTab';
import {
  Image as ImageIcon,
  Video,
  Camera,
  Sparkles,
  ShieldCheck,
  Cpu,
  Layers,
} from 'lucide-react';

export const DetectPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'image' | 'video' | 'webcam'>('image');

  const tabs = [
    {
      id: 'image',
      label: 'Hình ảnh',
      icon: ImageIcon,
      badge: 'Khuyên dùng',
      desc: 'Tải ảnh đơn hoặc hàng loạt mẫu lá lúa',
    },
    {
      id: 'video',
      label: 'Video',
      icon: Video,
      badge: 'Timeline',
      desc: 'Khảo sát đoạn phim thực địa',
    },
    {
      id: 'webcam',
      label: 'Camera trực tiếp',
      icon: Camera,
      badge: 'Live Stream',
      desc: 'Quét thời gian thực qua WebSocket',
    },
  ] as const;

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Top Banner / Heading & Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Nhận diện sâu bệnh hại lúa
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              YOLOv11s • 10 loài
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
            Khoanh vùng tọa độ chính xác, thống kê mật độ cá thể và khuyến cáo quy trình IPM Viện Lúa.
          </p>
        </div>

        {/* Tab switch pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 self-start sm:self-auto shadow-xs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all relative ${
                  isActive
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`hidden sm:inline-block text-[10px] px-1.5 py-0.2 rounded-md font-bold ${
                      isActive
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
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
