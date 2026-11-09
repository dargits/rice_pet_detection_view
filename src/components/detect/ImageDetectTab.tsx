import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useConfig } from '../../context/ConfigContext';
import { predictImage } from '../../lib/api';
import {
  drawDetections,
  exportAnnotatedImage,
  exportExecutiveInspectionReport,
  findDetectionAtPoint,
} from '../../lib/canvas';
import { evaluatePestRisk } from '../../lib/pestTranslations';
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
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Eye,
  EyeOff,
  Filter,
  FileCheck,
  ShieldAlert,
  Flame,
  CheckCircle2,
  Sliders,
  ChevronRight,
  SplitSquareVertical,
  Maximize2,
  Minimize2,
  Scan,
} from 'lucide-react';

interface ImageItem {
  id: string;
  file: File;
  previewUrl: string;
  status: 'idle' | 'processing' | 'done' | 'error';
  result?: PredictResponse;
  error?: string;
  naturalWidth?: number;
  naturalHeight?: number;
}

export const ImageDetectTab: React.FC = () => {
  const { config, updateConfig, addToast, getPestName } = useConfig();
  const [images, setImages] = useState<ImageItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const [selectedPestForModal, setSelectedPestForModal] = useState<string | null>(null);

  // Canvas interactive settings
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showConfidence, setShowConfidence] = useState<boolean>(true);
  const [filterClass, setFilterClass] = useState<string>('all');
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isComparingSplit, setIsComparingSplit] = useState<boolean>(false);
  const [splitPosition, setSplitPosition] = useState<number>(50);
  const [isExpandedView, setIsExpandedView] = useState<boolean>(false);

  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Demo sample loader
  const loadDemoSample = async (sampleType: 'brown_hopper' | 'leaf_roller' | 'stem_borer') => {
    const samples = {
      brown_hopper: {
        name: 'mau_ray_nau_mat_do_cao.jpg',
        url: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=1200&q=80',
      },
      leaf_roller: {
        name: 'mau_sau_cuon_la_dong_ruong.jpg',
        url: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=1200&q=80',
      },
      stem_borer: {
        name: 'mau_sau_duc_than_hai_danh.jpg',
        url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80',
      },
    };

    const s = samples[sampleType];
    try {
      const res = await fetch(s.url);
      const blob = await res.blob();
      const file = new File([blob], s.name, { type: 'image/jpeg' });
      const item: ImageItem = {
        id: Math.random().toString(36).substring(2, 9),
        file,
        previewUrl: URL.createObjectURL(file),
        status: 'idle',
      };
      setImages((prev) => [...prev, item]);
      setSelectedIndex(images.length);
      addToast('info', 'Đã tải ảnh mẫu', `Đã thêm mẫu ${s.name} vào danh sách.`);
    } catch {
      addToast('error', 'Lỗi tải ảnh mẫu', 'Không thể kết nối tải ảnh mẫu.');
    }
  };

  // Drag and drop events
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const currentItem = images[selectedIndex];

  // Dynamic filter detections matching global confidence threshold
  const effectiveDetections = useMemo(() => {
    if (!currentItem?.result?.detections) return [];
    return currentItem.result.detections.filter((d) => d.conf >= config.defaultConf);
  }, [currentItem?.result?.detections, config.defaultConf]);

  // Recalculate counts dynamically based on effective detections
  const effectiveCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    effectiveDetections.forEach((d) => {
      counts[d.cls] = (counts[d.cls] || 0) + 1;
    });
    return counts;
  }, [effectiveDetections]);

  // Outbreak risk assessment dynamically based on effective counts
  const risk = useMemo(() => {
    if (!currentItem?.result) return null;
    return evaluatePestRisk(effectiveCounts);
  }, [currentItem?.result, effectiveCounts]);

  // Record image natural dimensions on load
  const handleImageLoaded = () => {
    if (imgRef.current && currentItem) {
      const { naturalWidth, naturalHeight } = imgRef.current;
      setImages((prev) =>
        prev.map((item, idx) =>
          idx === selectedIndex ? { ...item, naturalWidth, naturalHeight } : item
        )
      );
    }
    redrawCanvas();
  };

  // Redraw canvas with global minConfidence applied
  const redrawCanvas = useCallback(() => {
    const item = images[selectedIndex];
    if (!item || !imgRef.current || !canvasRef.current) return;

    const img = imgRef.current;
    const canvas = canvasRef.current;

    if (item.result && item.result.detections) {
      drawDetections({
        canvas,
        image: img,
        detections: item.result.detections,
        originalWidth: item.result.width,
        originalHeight: item.result.height,
        showLabels,
        showConfidence,
        filterClass,
        minConfidence: config.defaultConf,
        highlightIndex: highlightedIndex,
        hoverIndex: hoveredIndex,
        getLabel: (d) => getPestName(d.cls_id ?? d.cls),
      });
    } else {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [images, selectedIndex, showLabels, showConfidence, filterClass, config.defaultConf, highlightedIndex, hoveredIndex, getPestName]);

  useEffect(() => {
    redrawCanvas();
    window.addEventListener('resize', redrawCanvas);
    return () => window.removeEventListener('resize', redrawCanvas);
  }, [redrawCanvas]);

  // Handle canvas click to select detection box
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const item = images[selectedIndex];
    if (!item?.result?.detections || !canvasRef.current || !imgRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const hitIndex = findDetectionAtPoint(
      x,
      y,
      item.result.detections,
      canvasRef.current.clientWidth,
      canvasRef.current.clientHeight,
      item.result.width,
      item.result.height,
      config.defaultConf
    );

    if (hitIndex !== null) {
      setHighlightedIndex(hitIndex);
      const det = item.result.detections[hitIndex];
      setSelectedPestForModal(det.cls);
    } else {
      setHighlightedIndex(null);
    }
  };

  // Handle mouse move on canvas to highlight box on hover
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const item = images[selectedIndex];
    if (!item?.result?.detections || !canvasRef.current || !imgRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const hitIndex = findDetectionAtPoint(
      x,
      y,
      item.result.detections,
      canvasRef.current.clientWidth,
      canvasRef.current.clientHeight,
      item.result.width,
      item.result.height,
      config.defaultConf
    );

    setHoveredIndex(hitIndex);
  };

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
    addToast('success', 'Hoàn tất phân tích', `Đã nhận diện thành công ${successCount} ảnh với ngưỡng tin cậy ${config.defaultConf}.`);
  };

  // Download Standard Annotated Image (only includes effective detections)
  const handleDownloadStandard = async () => {
    if (!currentItem || !imgRef.current || !currentItem.result) return;

    try {
      const dataUrl = await exportAnnotatedImage(
        imgRef.current,
        effectiveDetections,
        (d) => getPestName(d.cls_id ?? d.cls)
      );
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `rice_pest_${currentItem.file.name.replace(/\.[^/.]+$/, '')}_annotated.jpg`;
      link.click();
      addToast('success', 'Đã tải ảnh thành công', 'Ảnh đã vẽ bounding box đã lưu về máy.');
    } catch {
      addToast('error', 'Lỗi tải ảnh', 'Không thể tạo file ảnh kết quả từ canvas.');
    }
  };

  // Download VIP Executive Report
  const handleDownloadExecutiveReport = async () => {
    if (!currentItem || !imgRef.current || !currentItem.result) return;

    try {
      const dataUrl = await exportExecutiveInspectionReport(
        imgRef.current,
        effectiveDetections,
        currentItem.file.name,
        currentItem.result.ms,
        config.defaultConf,
        (d) => getPestName(d.cls_id ?? d.cls)
      );
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `rice_pest_executive_report_${currentItem.file.name.replace(/\.[^/.]+$/, '')}.jpg`;
      link.click();
      addToast('success', 'Đã xuất phiếu giám định VIP', 'Báo cáo giám định chuyên sâu đã được tải xuống.');
    } catch {
      addToast('error', 'Lỗi xuất báo cáo', 'Không thể tạo phiếu giám định.');
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

  // Distinct species in current item for filter dropdown
  const detectedSpeciesList = Object.keys(effectiveCounts);

  return (
    <div className="space-y-6">
      {/* Upload Zone & Quick Samples */}
      <div className="space-y-3">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center transition-all cursor-pointer ${isDragging
              ? 'border-emerald-500 bg-emerald-500/10 scale-[1.005]'
              : 'border-slate-300 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800/60 shadow-sm backdrop-blur-sm'
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
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <UploadCloud className="w-7 h-7" />
            </div>
            <div>
              <p className="text-base font-bold text-slate-800 dark:text-slate-100">
                Kéo thả hoặc nhấp để chọn ảnh mẫu lúa cần chẩn đoán
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Hỗ trợ độ phân giải cao (JPG, PNG, WEBP). Mô hình YOLOv11 tối ưu nhận diện chính xác kể cả các cá thể sâu non li ti.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Demo Samples Bar */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 px-1">
          <span className="font-semibold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Thử nhanh với mẫu ruộng thực địa:
          </span>
          <button
            onClick={() => loadDemoSample('brown_hopper')}
            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 transition-colors font-medium text-[11px]"
          >
            🌾 Mẫu Rầy nâu
          </button>
          <button
            onClick={() => loadDemoSample('leaf_roller')}
            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 transition-colors font-medium text-[11px]"
          >
            🍃 Mẫu Sâu cuốn lá
          </button>
          <button
            onClick={() => loadDemoSample('stem_borer')}
            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 transition-colors font-medium text-[11px]"
          >
            🌾 Mẫu Sâu đục thân
          </button>
        </div>
      </div>

      {/* Main Workspace when images are loaded */}
      {images.length > 0 && currentItem && (
        <div className="space-y-6">
          {/* Thumbnails strip & Batch Action */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {images.map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedIndex(idx);
                    setHighlightedIndex(null);
                  }}
                  className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 cursor-pointer shrink-0 transition-all ${idx === selectedIndex
                      ? 'border-emerald-500 scale-105 shadow-md shadow-emerald-500/20'
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
                      <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
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
                className="px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 disabled:opacity-50 rounded-xl shadow-md shadow-emerald-600/20 transition-all inline-flex items-center gap-2"
              >
                {isProcessingAll ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang chẩn đoán ({selectedIndex + 1}/{images.length})...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Nhận diện {images.length > 1 ? `tất cả (${images.length} ảnh)` : 'ngay'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Viewer & Results Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Visual Canvas Display & Interactive Toolbar */}
            <div
              className={`${isExpandedView ? 'lg:col-span-12' : 'lg:col-span-8'
                } bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm overflow-hidden flex flex-col space-y-3.5 transition-all duration-300`}
            >
              {/* Interactive Toolbar on Canvas */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 px-1 py-0.5 text-xs">
                {/* Left: Zoom & Fullscreen Controls */}
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                    <button
                      onClick={() => setZoomLevel((z) => Math.max(0.5, Number((z - 0.25).toFixed(2))))}
                      className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                      title="Thu nhỏ ảnh"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-1.5 font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      {Math.round(zoomLevel * 100)}%
                    </span>
                    <button
                      onClick={() => setZoomLevel((z) => Math.min(3, Number((z + 0.25).toFixed(2))))}
                      className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                      title="Phóng to ảnh"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setZoomLevel(1)}
                      className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors ml-0.5"
                      title="Đặt lại kích thước chuẩn"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Expand / Minimize Full-width toggle */}
                  <button
                    onClick={() => setIsExpandedView(!isExpandedView)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold transition-colors ${isExpandedView
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                      }`}
                    title={isExpandedView ? 'Thu gọn hiển thị 2 cột' : 'Mở rộng khung ảnh tối đa (dễ soi côn trùng nhỏ)'}
                  >
                    {isExpandedView ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline">{isExpandedView ? 'Thu gọn' : 'Phóng lớn'}</span>
                  </button>
                </div>

                {/* Center / Right: Global Confidence Slider applied across app */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Confidence Slider directly on toolbar */}
                  <div
                    className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60"
                    title="Ngưỡng tin cậy (Conf) - Thay đổi tại đây sẽ áp dụng đồng bộ cho toàn bộ hệ thống (Ảnh, Video, Camera)"
                  >
                    <Sliders className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      Ngưỡng: <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{config.defaultConf.toFixed(2)}</span>
                    </span>
                    <input
                      type="range"
                      min="0.1"
                      max="0.9"
                      step="0.05"
                      value={config.defaultConf}
                      onChange={(e) => updateConfig({ defaultConf: parseFloat(e.target.value) })}
                      className="w-16 sm:w-24 accent-emerald-600 cursor-pointer h-1.5"
                    />
                  </div>

                  {/* Display Toggles */}
                  <button
                    onClick={() => setShowLabels(!showLabels)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold transition-colors ${showLabels
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                      }`}
                  >
                    {showLabels ? <Eye className="w-3 h-3 text-emerald-500" /> : <EyeOff className="w-3 h-3 text-slate-400" />}
                    <span>Nhãn tên</span>
                  </button>

                  <button
                    onClick={() => setShowConfidence(!showConfidence)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold transition-colors ${showConfidence
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                      }`}
                  >
                    <span>% Conf</span>
                  </button>

                  {/* Filter by Species */}
                  {detectedSpeciesList.length > 1 && (
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 px-2 py-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                      <Filter className="w-3 h-3 text-slate-400" />
                      <select
                        value={filterClass}
                        onChange={(e) => setFilterClass(e.target.value)}
                        className="bg-transparent text-[11px] font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
                      >
                        <option value="all">Tất cả loài ({detectedSpeciesList.length})</option>
                        {detectedSpeciesList.map((cls) => (
                          <option key={cls} value={cls}>
                            Chỉ hiện: {getPestName(cls)}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Compare split toggle */}
                  {currentItem.result && (
                    <button
                      onClick={() => setIsComparingSplit(!isComparingSplit)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold transition-colors ${isComparingSplit
                          ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                        }`}
                      title="So sánh ảnh gốc và kết quả AI"
                    >
                      <SplitSquareVertical className="w-3 h-3" />
                      <span>So sánh</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Notice when freshly uploaded before analysis */}
              {currentItem.status === 'idle' && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-medium">
                    <Scan className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Ảnh đã tải lên sẵn sàng. Bấm <strong>"Nhận diện bức ảnh này"</strong> để chạy chẩn đoán tự động.
                    </span>
                  </div>
                  <button
                    onClick={handleProcessAll}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs shadow-sm shadow-emerald-600/20 transition-all shrink-0 self-end sm:self-auto inline-flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Nhận diện bức ảnh này</span>
                  </button>
                </div>
              )}

              {/* Main Image Viewport with Expanded Height for Ultra-Clear Inspection */}
              <div
                ref={containerRef}
                className="relative w-full min-h-[500px] sm:min-h-[580px] max-h-[820px] overflow-auto rounded-2xl sm:rounded-3xl bg-slate-950 flex items-center justify-center border border-slate-900 shadow-inner select-none p-2"
              >
                <div
                  className="relative inline-block transition-transform duration-100 origin-center"
                  style={{ transform: `scale(${zoomLevel})` }}
                >
                  <img
                    ref={imgRef}
                    src={currentItem.previewUrl}
                    alt={currentItem.file.name}
                    onLoad={handleImageLoaded}
                    className="max-h-[760px] w-auto max-w-full object-contain block mx-auto rounded-lg"
                  />

                  {/* Overlay Canvas */}
                  <canvas
                    ref={canvasRef}
                    onClick={handleCanvasClick}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className={`absolute inset-0 w-full h-full cursor-crosshair ${isComparingSplit ? 'pointer-events-none' : ''}`}
                    style={
                      isComparingSplit
                        ? { clipPath: `polygon(${splitPosition}% 0, 100% 0, 100% 100%, ${splitPosition}% 100%)` }
                        : {}
                    }
                  />

                  {/* Split slider bar */}
                  {isComparingSplit && (
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-white shadow-lg pointer-events-none"
                      style={{ left: `${splitPosition}%` }}
                    >
                      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-white text-slate-800 flex items-center justify-center shadow-md text-[10px] font-bold">
                        ↔
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Split Position Slider */}
              {isComparingSplit && (
                <div className="flex items-center gap-3 px-2 text-xs">
                  <span className="text-slate-400 text-[11px] shrink-0">Ảnh gốc</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={splitPosition}
                    onChange={(e) => setSplitPosition(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                  <span className="text-emerald-500 font-semibold text-[11px] shrink-0">AI Bounding Box</span>
                </div>
              )}

              {/* Status footer on image */}
              <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 px-1 border-t border-slate-100 dark:border-slate-800 gap-2">
                <div className="flex flex-wrap items-center gap-2 truncate">
                  <span className="font-mono font-medium text-slate-800 dark:text-slate-200 truncate max-w-[220px]">
                    {currentItem.file.name}
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">
                    ({(currentItem.file.size / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                  {currentItem.naturalWidth && currentItem.naturalHeight && (
                    <span className="font-mono text-[11px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      {currentItem.naturalWidth} × {currentItem.naturalHeight} px
                    </span>
                  )}
                  {currentItem.result && (
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-semibold">
                      <Clock className="w-3 h-3" />
                      {currentItem.result.ms} ms
                    </span>
                  )}
                </div>

                {currentItem.result && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleDownloadStandard}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-[11px] transition-colors"
                      title="Tải ảnh đã vẽ box"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Tải ảnh Bounding Box
                    </button>
                    <button
                      onClick={handleDownloadExecutiveReport}
                      className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] shadow-sm shadow-emerald-600/20 transition-all"
                      title="Xuất phiếu giám định dịch hại nông nghiệp VIP"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      Xuất Báo cáo Giám sát VIP
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Results & Agro-Intelligence Sidebar */}
            <div className={`${isExpandedView ? 'lg:col-span-12' : 'lg:col-span-4'} space-y-4`}>
              {/* Outbreak Risk Evaluation Card */}
              {risk && (
                <div className={`p-4 rounded-3xl border shadow-sm space-y-2 transition-all ${risk.bg}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-sm">
                      {risk.level === 'critical' ? (
                        <Flame className="w-5 h-5 text-rose-500 animate-bounce" />
                      ) : risk.level === 'warning' ? (
                        <ShieldAlert className="w-5 h-5 text-amber-500" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      )}
                      <span>{risk.title}</span>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed opacity-95">
                    {risk.message}
                  </p>
                  <div className="pt-2 border-t border-current/15 text-[11px] leading-relaxed">
                    <strong>Khuyến cáo IPM:</strong> {risk.recommendedAction}
                  </div>
                </div>
              )}

              {/* Main Analysis Results Card */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      Chi tiết nhận diện
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Đang lọc theo ngưỡng tin cậy <strong className="text-emerald-600 font-mono">{config.defaultConf}</strong>
                    </p>
                  </div>
                  {currentItem.result && (
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      {effectiveDetections.length} đối tượng
                    </span>
                  )}
                </div>

                {currentItem.status === 'idle' && (
                  <div className="py-8 text-center text-slate-500 dark:text-slate-400 space-y-3">
                    <ImageIcon className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
                    <p className="text-xs">Ảnh mẫu đã sẵn sàng trong khung xem phía trên.</p>
                    <button
                      onClick={handleProcessAll}
                      className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md shadow-emerald-600/20 inline-flex items-center gap-1.5"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Bấm để chẩn đoán ngay</span>
                    </button>
                  </div>
                )}

                {currentItem.status === 'processing' && (
                  <div className="py-10 text-center text-slate-500 space-y-2">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto" />
                    <p className="text-xs font-medium">YOLOv11 đang quét các tổn thương trên lá...</p>
                  </div>
                )}

                {currentItem.status === 'error' && (
                  <div className="p-4 bg-rose-50 dark:bg-rose-950/30 rounded-2xl border border-rose-200 dark:border-rose-800/40 text-rose-800 dark:text-rose-300 text-xs space-y-1">
                    <p className="font-semibold flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" />
                      Không thể nhận diện
                    </p>
                    <p>{currentItem.error}</p>
                  </div>
                )}

                {currentItem.status === 'done' && currentItem.result && (
                  <div className="space-y-4">
                    {effectiveDetections.length === 0 ? (
                      <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200/60 dark:border-emerald-800/30 text-center space-y-2">
                        <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
                        <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                          Không phát hiện sâu bệnh vượt ngưỡng
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          Không ghi nhận cá thể sâu bệnh nào ở ngưỡng tin cậy{' '}
                          <strong>{config.defaultConf}</strong>.
                        </p>
                        <p className="text-[11px] text-slate-400">
                          (Thử kéo giảm thanh trượt ngưỡng Conf nếu muốn phát hiện sâu non li ti)
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
                            {Object.entries(effectiveCounts).map(([name, count]) => {
                              const det = effectiveDetections.find((d) => d.cls === name);
                              return (
                                <ClassBadge
                                  key={name}
                                  clsId={det?.cls_id ?? name}
                                  name={getPestName(name)}
                                  count={count}
                                  onClick={() => setSelectedPestForModal(name)}
                                />
                              );
                            })}
                          </div>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 italic flex items-center gap-1">
                            <Info className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                            Bấm vào từng nhãn hoặc nhấp trực tiếp vào con sâu trên ảnh để xem phòng trừ.
                          </p>
                        </div>

                        {/* Interactive Detections List */}
                        <div className="space-y-1.5">
                          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                            Danh sách đối tượng phát hiện:
                          </p>
                          <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1 text-xs">
                            {effectiveDetections.map((det, idx) => (
                              <div
                                key={idx}
                                onMouseEnter={() => setHoveredIndex(idx)}
                                onMouseLeave={() => setHoveredIndex(null)}
                                onClick={() => {
                                  setHighlightedIndex(idx);
                                  setSelectedPestForModal(det.cls);
                                }}
                                className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${highlightedIndex === idx || hoveredIndex === idx
                                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-sm scale-[1.01]'
                                    : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200/60 dark:border-slate-700/60'
                                  }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                                    #{idx + 1} {getPestName(det.cls_id ?? det.cls)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                    {(det.conf * 100).toFixed(1)}%
                                  </span>
                                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                                </div>
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

