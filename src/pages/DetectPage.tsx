import React, { useState } from 'react';
import { ImageDetectTab } from '../components/detect/ImageDetectTab';
import { VideoDetectTab } from '../components/detect/VideoDetectTab';
import { WebcamDetectTab } from '../components/detect/WebcamDetectTab';
import { Image as ImageIcon, Video, Camera } from 'lucide-react';

export const DetectPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'image' | 'video' | 'webcam'>('image');

  const tabs = [
    { id: 'image', label: 'Hình ảnh', icon: ImageIcon, desc: 'Tải một hoặc nhiều ảnh mẫu lá / dảnh lúa' },
    { id: 'video', label: 'Video', icon: Video, desc: 'Khảo sát đoạn phim thực địa đồng ruộng' },
    { id: 'webcam', label: 'Camera trực tiếp', icon: Camera, desc: 'Quét và nhận diện thời gian thực qua WebSocket' },
  ] as const;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Banner / Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Nhận diện & Phân loại Sâu Bệnh Hại Lúa
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Ứng dụng thị giác máy tính với mô hình YOLOv11 phát hiện chính xác các loài côn trùng gây hại
          </p>
        </div>

        {/* Tab switch pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 dark:bg-slate-800/70 rounded-2xl border border-slate-200 dark:border-slate-700/60 self-start md:self-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Panels */}
      {activeTab === 'image' && <ImageDetectTab />}
      {activeTab === 'video' && <VideoDetectTab />}
      {activeTab === 'webcam' && <WebcamDetectTab />}
    </div>
  );
};

