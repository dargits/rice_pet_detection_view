import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useConfig } from '../../context/ConfigContext';
import { predictImage } from '../../lib/api';
import { drawDetections, exportAnnotatedImage } from '../../lib/canvas';
import { Detection, PredictResponse } from '../../types';
import { ClassBadge } from '../ui/Badge';
import { SpeciesModal } from '../ui/SpeciesModal';
import {
  UploadCloud,
  ImageIcon,
  Download,
  Clock,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Loader2,
  Trash2,
  Info,
} from 'lucide-react';

interface ImageItem {
  id: string;
  file: File;
  previewUrl: string;
  status: 'idle' | 'processing' | 'done' | 'error';
  result?: PredictResponse;
  error?: string;
}

export const ImageDetectTab: React.FC = () => {
  const { config, addToast } = useConfig();
  const [images, setImages] = useState<ImageItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const [selectedPestForModal, setSelectedPestForModal] = useState<string | null>(null);

  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // File input handler
  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const newItems: ImageItem[] = Array.from(fileList)
      .filter((file) => file.type.startsWith('image/'))
      .map((file) => ({
        id: Math.random().toString(36).substring(2, 9),
        file,
        previewUrl: URL.createObjectURL(file),
        status: 'idle',
      }));

    if (newItems.length === 0) {
      addToast('warning', 'Định dạng không hỗ trợ', 'Vui lòng chọn file hình ảnh (JPG, PNG, WebP).');
      return;
    }

    setImages((prev) => [...prev, ...newItems]);
    if (images.length === 0) {
      setSelectedIndex(0);
    }
  };

  // Drag and drop events
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  // Re-draw canvas overlay whenever selected image or its result changes
  const redrawCanvas = useCallback(() => {
    const currentItem = images[selectedIndex];
    if (!currentItem || !imgRef.current || !canvasRef.current) return;

    const img = imgRef.current;
    const canvas = canvasRef.current;

    if (currentItem.result && currentItem.result.detections) {
      drawDetections({
        canvas,
        image: img,
        detections: currentItem.result.detections,
        originalWidth: currentItem.result.width,
        originalHeight: currentItem.result.height,
      });
    } else {
      // Clear canvas if no detections
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [images, selectedIndex]);

  useEffect(() => {
    redrawCanvas();
    window.addEventListener('resize', redrawCanvas);
    return () => window.removeEventListener('resize', redrawCanvas);
  }, [redrawCanvas]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      images.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, []);

  // Sequential processing
  const handleProcessAll = async () => {
    if (images.length === 0 || isProcessingAll) return;

    setIsProcessingAll(true);
    let successCount = 0;

    for (let i = 0; i < images.length; i++) {
      const item = images[i];
      if (item.status === 'done') continue;

      setSelectedIndex(i);
      setImages((prev) =>
        prev.map((img, idx) => (idx === i ? { ...img, status: 'processing', error: undefined } : img))
      );

      try {
        const result = await predictImage(item.file, config.defaultConf, false, true);
        setImages((prev) =>
          prev.map((img, idx) =>
            idx === i ? { ...img, status: 'done', result } : img
          )
        );
        successCount++;
      } catch (err: any) {
        setImages((prev) =>
          prev.map((img, idx) =>
            idx === i ? { ...img, status: 'error', error: err.message || 'Lỗi nhận diện ảnh' } : img
          )
        );
      }
    }

    setIsProcessingAll(false);
    addToast('success', 'Hoàn tất phân tích', `Đã nhận diện thành công ${successCount} ảnh.`);
  };

  const handleDownloadResult = async () => {
    const currentItem = images[selectedIndex];
    if (!currentItem || !imgRef.current || !currentItem.result) return;

    try {
      const dataUrl = await exportAnnotatedImage(imgRef.current, currentItem.result.detections);
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `rice_pest_${currentItem.file.name.replace(/\.[^/.]+$/, '')}_annotated.jpg`;
      link.click();
    } catch {
      addToast('error', 'Lỗi tải ảnh', 'Không thể tạo file ảnh kết quả từ canvas.');
    }
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(images[index].previewUrl);
    const next = images.filter((_, idx) => idx !== index);
    setImages(next);
    if (selectedIndex >= next.length) {
      setSelectedIndex(Math.max(0, next.length - 1));
    }
  };

  const currentItem = images[selectedIndex];

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-emerald-500 bg-emerald-500/10'
            : 'border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800/60'
        }`}
        onClick={() => {
          document.getElementById('image-file-input')?.click();
        }}
      >
        <input
          id="image-file-input"
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Kéo thả hoặc nhấp để chọn ảnh mẫu lúa bị hại
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Hỗ trợ JPG, PNG, WEBP. Cho phép tải lên nhiều ảnh cùng lúc để xử lý tuần tự.
            </p>
          </div>
        </div>
      </div>

      {/* Main Workspace when images are loaded */}
      {images.length > 0 && (
        <div className="space-y-6">
          {/* Thumbnails strip & Batch Action */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {images.map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedIndex(idx)}
                  className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 cursor-pointer shrink-0 transition-transform ${
                    idx === selectedIndex
                      ? 'border-emerald-500 scale-105 shadow-md'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={item.previewUrl}
                    alt={item.file.name}
                    className="w-full h-full object-cover"
                  />
                  {item.status === 'processing' && (
                    <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center">
                      <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                    </div>
                  )}
                  {item.status === 'done' && (
                    <div className="absolute top-1 right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow">
                      <CheckCircle className="w-3 h-3" />
                    </div>
                  )}
                  {item.status === 'error' && (
                    <div className="absolute top-1 right-1 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center text-white shadow">
                      <AlertCircle className="w-3 h-3" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => removeImage(selectedIndex)}
                aria-label="Xóa ảnh này"
                className="px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors inline-flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Xóa ảnh</span>
              </button>
              <button
                onClick={handleProcessAll}
                disabled={isProcessingAll}
                className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-50 rounded-xl shadow-md shadow-emerald-600/20 transition-all inline-flex items-center gap-2"
              >
                {isProcessingAll ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang xử lý ({selectedIndex + 1}/{images.length})...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Nhận diện {images.length > 1 ? `tất cả (${images.length})` : 'ảnh'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Viewer & Results Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Visual Canvas Display (Col 8) */}
            <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm overflow-hidden flex flex-col items-center justify-center">
              <div className="relative max-w-full inline-block rounded-xl overflow-hidden shadow-inner bg-slate-950">
                <img
                  ref={imgRef}
                  src={currentItem.previewUrl}
                  alt={currentItem.file.name}
                  onLoad={redrawCanvas}
                  className="max-h-[560px] w-auto object-contain block mx-auto"
                />
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full pointer-events-none"
                />
              </div>

              {/* Status footer on image */}
              <div className="w-full flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-3 px-2 border-t border-slate-100 dark:border-slate-800 mt-3">
                <span className="truncate max-w-[200px] sm:max-w-xs font-mono">
                  {currentItem.file.name}
                </span>
                {currentItem.result && (
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-emerald-500" />
                      {currentItem.result.ms} ms
                    </span>
                    <button
                      onClick={handleDownloadResult}
                      className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Tải ảnh đã vẽ box
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Results Sidebar (Col 4) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    Kết quả nhận diện
                  </h3>
                  {currentItem.result && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      {currentItem.result.detections.length} đối tượng
                    </span>
                  )}
                </div>

                {currentItem.status === 'idle' && (
                  <div className="py-8 text-center text-slate-500 dark:text-slate-400 space-y-2">
                    <ImageIcon className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
                    <p className="text-xs">Chưa phân tích ảnh này.</p>
                    <button
                      onClick={handleProcessAll}
                      className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm"
                    >
                      Bấm để nhận diện ngay
                    </button>
                  </div>
                )}

                {currentItem.status === 'processing' && (
                  <div className="py-10 text-center text-slate-500 space-y-2">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto" />
                    <p className="text-xs font-medium">YOLOv11 đang phân tích mẫu ảnh...</p>
                  </div>
                )}

                {currentItem.status === 'error' && (
                  <div className="p-4 bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-800/40 text-rose-800 dark:text-rose-300 text-xs space-y-1">
                    <p className="font-semibold flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" />
                      Không thể nhận diện
                    </p>
                    <p>{currentItem.error}</p>
                  </div>
                )}

                {currentItem.status === 'done' && currentItem.result && (
                  <div className="space-y-4">
                    {/* Check if no pests detected */}
                    {currentItem.result.detections.length === 0 ? (
                      <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/20 rounded-xl border border-emerald-200/60 dark:border-emerald-800/30 text-center space-y-2">
                        <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
                        <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                          Không phát hiện côn trùng gây hại
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          Mẫu lá hoặc dảnh lúa hiện tại không ghi nhận loài sâu hại nào với ngưỡng tin cậy{' '}
                          <strong>{config.defaultConf}</strong>.
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* Breakdown summary by class */}
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                            Tổng hợp theo loài:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(currentItem.result.counts).map(([name, count]) => {
                              const det = currentItem.result?.detections.find((d) => d.cls === name);
                              return (
                                <ClassBadge
                                  key={name}
                                  clsId={det?.cls_id ?? name}
                                  name={name}
                                  count={count}
                                  onClick={() => setSelectedPestForModal(name)}
                                />
                              );
                            })}
                          </div>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 italic flex items-center gap-1">
                            <Info className="w-3 h-3 shrink-0" />
                            Nhấp vào tên loài để xem hướng dẫn phòng trừ IPM.
                          </p>
                        </div>

                        {/* Detailed Detections List */}
                        <div className="space-y-1.5">
                          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                            Chi tiết từng đối tượng:
                          </p>
                          <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 text-xs">
                            {currentItem.result.detections.map((det, idx) => (
                              <div
                                key={idx}
                                onClick={() => setSelectedPestForModal(det.cls)}
                                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 cursor-pointer transition-colors"
                              >
                                <span className="font-medium text-slate-800 dark:text-slate-200">
                                  #{idx + 1} {det.cls}
                                </span>
                                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                  {(det.conf * 100).toFixed(1)}%
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prevention modal for clicked pest */}
      <SpeciesModal
        pestName={selectedPestForModal}
        onClose={() => setSelectedPestForModal(null)}
      />
    </div>
  );
};

