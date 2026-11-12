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
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner / Heading & Tab Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-3 h-3 text-emerald-500" />
              YOLOv11s • 10 Lớp Sâu Bệnh
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
              <ShieldCheck className="w-3 h-3 text-blue-500" />
              Chuẩn Viện Lúa ĐBSCL
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Trung tâm Nhận diện Sâu Bệnh Hại Lúa
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Phân tích hình ảnh mẫu ruộng thực địa, khoanh vùng tọa độ chính xác, thống kê mật độ cá thể và đề xuất quy trình Quản lý Dịch hại Tổng hợp (IPM).
          </p>
        </div>

        {/* Tab switch pills */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/60 self-start lg:self-auto shadow-inner">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
                  isActive
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-md shadow-slate-200/50 dark:shadow-none'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/40 dark:hover:bg-slate-800/40'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`hidden sm:inline-block text-[9px] px-1.5 py-0.2 rounded-md font-extrabold ${
                      isActive
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
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
