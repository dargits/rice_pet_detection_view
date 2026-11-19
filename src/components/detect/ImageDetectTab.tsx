import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useConfig } from '../../context/ConfigContext';
import { predictImage } from '../../lib/api';
import {
  drawDetections,
  exportAnnotatedImage,
  exportExecutiveInspectionReport,
  findDetectionAtPoint,
} from '../../lib/canvas';
import { evaluatePestRisk, findPestEntry } from '../../lib/pestTranslations';
import { Detection, PredictResponse } from '../../types';
import { ClassBadge } from '../ui/Badge';
import { SpeciesModal } from '../ui/SpeciesModal';
import { getClassColor } from '../../lib/colors';
import {
  MATRIX_CLASSES,
  NORMALIZED_CONFUSION_MATRIX,
  PER_CLASS_BENCHMARKS,
  PR_CURVE_DATA,
  F1_CONFIDENCE_CURVE,
  MODEL_SPECS,
} from '../../lib/modelBenchmarks';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
  AreaChart,
  Area,
  ReferenceLine,
  LineChart,
  Line,
} from 'recharts';
import {
  UploadCloud,
  Plus,
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
  ChevronDown,
  ChevronUp,
  SplitSquareVertical,
  Maximize2,
  Minimize2,
  Scan,
  Bug,
  HeartHandshake,
  FlaskConical,
  Leaf,
  Cpu,
  Activity,
  Gauge,
  BarChart3,
  Grid3X3,
  TrendingUp,
  Layers,
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
  const [inspectedPestKey, setInspectedPestKey] = useState<string | null>(null);

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
  const [showDetectionsList, setShowDetectionsList] = useState<boolean>(false);
  const [showRiskDetail, setShowRiskDetail] = useState<boolean>(false);
  const [showInspectedDetails, setShowInspectedDetails] = useState<boolean>(false);
  const [showAnalytics, setShowAnalytics] = useState<boolean>(false);
  const [analyticsTab, setAnalyticsTab] = useState<'sample' | 'matrix' | 'curves'>('sample');
  const [curveSubTab, setCurveSubTab] = useState<'map_pr' | 'f1_conf' | 'specs'>('map_pr');
  const [hoveredMatrixCell, setHoveredMatrixCell] = useState<{ row: number; col: number; val: number } | null>(null);
  const telemetryRef = useRef<HTMLDivElement>(null);
  const [isTelemetryVisible, setIsTelemetryVisible] = useState<boolean>(false);

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
  const loadDemoSample = async (sampleType: 'brown_hopper' | 'leaf_roller' | 'stem_borer' | 'gall_midge') => {
    const samples = {
      brown_hopper: {
        name: 'mau_ray_nau_mat_do_cao.jpg',
        url: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=1200&q=80',
        label: 'Rầy nâu',
      },
      leaf_roller: {
        name: 'mau_sau_cuon_la_dong_ruong.jpg',
        url: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=1200&q=80',
        label: 'Sâu cuốn lá',
      },
      stem_borer: {
        name: 'mau_sau_duc_than_hai_danh.jpg',
        url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80',
        label: 'Sâu đục thân',
      },
      gall_midge: {
        name: 'mau_muoi_hanh_hai_danh.jpg',
        url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
        label: 'Muỗi hành',
      },
    };

    const s = samples[sampleType];
    try {
      let file: File;
      try {
        const res = await fetch(s.url);
        if (!res.ok) throw new Error('Fetch failed');
        const blob = await res.blob();
        file = new File([blob], s.name, { type: 'image/jpeg' });
      } catch {
        // Fallback local generated canvas image if network is offline
        const off = document.createElement('canvas');
        off.width = 800;
        off.height = 600;
        const ctx = off.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#1e3a1e';
          ctx.fillRect(0, 0, 800, 600);
          ctx.fillStyle = '#10b981';
          ctx.font = 'bold 30px sans-serif';
          ctx.fillText(`Mẫu đồng ruộng: ${s.label}`, 60, 270);
          ctx.font = '18px sans-serif';
          ctx.fillStyle = '#94a3b8';
          ctx.fillText('Khảo sát sâu bệnh lúa chuẩn Viện Lúa ĐBSCL (YOLOv11s)', 60, 310);
        }
        const fallbackBlob = await new Promise<Blob>((resolve) =>
          off.toBlob((b) => resolve(b || new Blob()), 'image/jpeg', 0.9)
        );
        file = new File([fallbackBlob], s.name, { type: 'image/jpeg' });
      }

      const item: ImageItem = {
        id: Math.random().toString(36).substring(2, 9),
        file,
        previewUrl: URL.createObjectURL(file),
        status: 'idle',
      };
      setImages((prev) => [...prev, item]);
      setSelectedIndex(images.length);
      addToast('info', 'Đã tải ảnh mẫu', `Đã thêm mẫu ${s.label} vào danh sách.`);
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

  // Scroll into view animation observer for telemetry & benchmarks dashboard
  useEffect(() => {
    const el = telemetryRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsTelemetryVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [currentItem]);

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

  // Real metrics calculated from current image's effective detections
  const meanConfidence = useMemo(() => {
    if (effectiveDetections.length === 0) return 0;
    const sum = effectiveDetections.reduce((acc, d) => acc + d.conf, 0);
    return (sum / effectiveDetections.length) * 100;
  }, [effectiveDetections]);

  const maxConfidence = useMemo(() => {
    if (effectiveDetections.length === 0) return 0;
    return Math.max(...effectiveDetections.map((d) => d.conf)) * 100;
  }, [effectiveDetections]);

  const surfaceCoveragePercent = useMemo(() => {
    if (effectiveDetections.length === 0) return 0;
    const imgW = currentItem?.naturalWidth || currentItem?.result?.width || currentItem?.result?.image_width || 640;
    const imgH = currentItem?.naturalHeight || currentItem?.result?.height || currentItem?.result?.image_height || 640;
    const totalImgArea = imgW * imgH;
    if (totalImgArea <= 0) return 0;

    const totalBoxArea = effectiveDetections.reduce((acc, d) => {
      const [x1, y1, x2, y2] = d.box;
      const w = Math.max(0, x2 - x1);
      const h = Math.max(0, y2 - y1);
      return acc + (w * h);
    }, 0);

    const percent = (totalBoxArea / totalImgArea) * 100;
    return Math.min(100, Math.max(0.1, percent));
  }, [effectiveDetections, currentItem?.naturalWidth, currentItem?.naturalHeight, currentItem?.result]);

  const speciesChartData = useMemo(() => {
    const map: Record<string, { clsId: number | string; count: number; sumConf: number; maxConf: number }> = {};
    effectiveDetections.forEach((d) => {
      if (!map[d.cls]) {
        map[d.cls] = { clsId: d.cls_id ?? d.cls, count: 0, sumConf: 0, maxConf: 0 };
      }
      map[d.cls].count += 1;
      map[d.cls].sumConf += d.conf;
      if (d.conf > map[d.cls].maxConf) {
        map[d.cls].maxConf = d.conf;
      }
    });

    return Object.entries(map).map(([name, data]) => {
      const entry = findPestEntry(data.clsId);
      const viName = entry ? entry.vi : name;
      const avgConf = (data.sumConf / data.count) * 100;
      const color = getClassColor(data.clsId).stroke;
      return {
        name: viName,
        rawName: name,
        count: data.count,
        avgConf: Math.round(avgConf * 10) / 10,
        maxConf: Math.round(data.maxConf * 1000) / 10,
        color,
      };
    });
  }, [effectiveDetections]);

  // Outbreak risk assessment dynamically based on effective counts
  const risk = useMemo(() => {
    if (!currentItem?.result) return null;
    return evaluatePestRisk(effectiveCounts);
  }, [currentItem?.result, effectiveCounts]);

  // Active inspected pest for instant agricultural intelligence
  const activeInspectedEntry = useMemo(() => {
    if (inspectedPestKey) {
      const entry = findPestEntry(inspectedPestKey);
      if (entry) return entry;
    }
    if (effectiveDetections.length > 0) {
      return findPestEntry(effectiveDetections[0].cls_id ?? effectiveDetections[0].cls);
    }
    return null;
  }, [inspectedPestKey, effectiveDetections]);

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
      setInspectedPestKey(det.cls);
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

  // Download Executive Inspection Report
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
      addToast('success', 'Đã xuất phiếu giám định', 'Báo cáo giám định chuyên sâu đã được tải xuống.');
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
      {/* Upload Zone & Quick Samples - Only shown when empty */}
      {images.length === 0 && (
      <div className="space-y-4 py-2">
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
          <span className="font-semibold flex items-center gap-1.5 text-xs sm:text-sm">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Thử nhanh với mẫu ruộng thực địa:
          </span>
          <button
            onClick={() => loadDemoSample('brown_hopper')}
            className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 transition-colors font-medium text-xs sm:text-sm"
          >
            🌾 Mẫu Rầy nâu
          </button>
          <button
            onClick={() => loadDemoSample('leaf_roller')}
            className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 transition-colors font-medium text-xs sm:text-sm"
          >
            🍃 Mẫu Sâu cuốn lá
          </button>
          <button
            onClick={() => loadDemoSample('stem_borer')}
            className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 transition-colors font-medium text-xs sm:text-sm"
          >
            🌾 Mẫu Sâu đục thân
          </button>
          <button
            onClick={() => loadDemoSample('gall_midge')}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors font-medium text-sm shadow-xs"
          >
            🌿 Mẫu Muỗi hành
          </button>
        </div>
      </div>
      )}

      {/* Main Workspace when images are loaded */}
      {images.length > 0 && currentItem && (
        <div className="space-y-4">
          {/* Thumbnails strip & Batch Action */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {/* Add more images button */}
              <button
                type="button"
                onClick={() => document.getElementById('image-file-input-more')?.click()}
                className="w-14 h-14 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 hover:text-emerald-600 flex flex-col items-center justify-center text-slate-400 transition-colors shrink-0"
                title="Thêm ảnh khác vào danh sách"
              >
                <Plus className="w-5 h-5" />
                <span className="text-[10px] font-bold mt-0.5">Thêm ảnh</span>
              </button>
              <input
                id="image-file-input-more"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
              {images.map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedIndex(idx);
                    setHighlightedIndex(null);
                  }}
                  className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 cursor-pointer shrink-0 transition-all ${idx === selectedIndex
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
                      <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                    </div>
                  )}
                  {item.status === 'done' && (
                    <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow">
                      <CheckCircle className="w-2.5 h-2.5" />
                    </div>
                  )}
                  {item.status === 'error' && (
                    <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-rose-500 rounded-full flex items-center justify-center text-white shadow">
                      <AlertCircle className="w-2.5 h-2.5" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => removeImage(selectedIndex)}
                aria-label="Xóa ảnh này"
                className="px-2.5 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors inline-flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Xóa ảnh</span>
              </button>
              <button
                onClick={handleProcessAll}
                disabled={isProcessingAll}
                className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 disabled:opacity-50 rounded-xl shadow-md shadow-emerald-600/20 transition-all inline-flex items-center gap-1.5"
              >
                {isProcessingAll ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang chẩn đoán ({selectedIndex + 1}/{images.length})...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Nhận diện {images.length > 1 ? `tất cả (${images.length} ảnh)` : 'ngay'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Viewer & Results Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* Visual Canvas Display & Interactive Toolbar */}
            <div
              className={`${isExpandedView ? 'lg:col-span-12' : 'lg:col-span-8'
                } bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 sm:p-4 shadow-sm overflow-hidden flex flex-col space-y-3 transition-all duration-300`}
            >
              {/* Interactive Toolbar on Canvas */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 px-1 py-1 text-xs sm:text-sm">
                {/* Left: Zoom & Fullscreen Controls */}
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                    <button
                      onClick={() => setZoomLevel((z) => Math.max(0.5, Number((z - 0.25).toFixed(2))))}
                      className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                      title="Thu nhỏ ảnh"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="px-2 font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {Math.round(zoomLevel * 100)}%
                    </span>
                    <button
                      onClick={() => setZoomLevel((z) => Math.min(3, Number((z + 0.25).toFixed(2))))}
                      className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                      title="Phóng to ảnh"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setZoomLevel(1)}
                      className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors ml-0.5"
                      title="Đặt lại kích thước chuẩn"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Expand / Minimize Full-width toggle */}
                  <button
                    onClick={() => setIsExpandedView(!isExpandedView)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-semibold transition-colors ${isExpandedView
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                      }`}
                    title={isExpandedView ? 'Thu gọn hiển thị 2 cột' : 'Mở rộng khung ảnh tối đa (dễ soi côn trùng nhỏ)'}
                  >
                    {isExpandedView ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
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
                    <Sliders className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      Ngưỡng: <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{config.defaultConf.toFixed(2)}</span>
                    </span>
                    <input
                      type="range"
                      min="0.1"
                      max="0.9"
                      step="0.05"
                      value={config.defaultConf}
                      onChange={(e) => updateConfig({ defaultConf: parseFloat(e.target.value) })}
                      className="w-16 sm:w-24 accent-emerald-600 cursor-pointer h-2"
                    />
                  </div>

                  {/* Display Toggles */}
                  <button
                    onClick={() => setShowLabels(!showLabels)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-semibold transition-colors ${showLabels
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                      }`}
                  >
                    {showLabels ? <Eye className="w-3.5 h-3.5 text-emerald-500" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
                    <span>Nhãn tên</span>
                  </button>

                  <button
                    onClick={() => setShowConfidence(!showConfidence)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-semibold transition-colors ${showConfidence
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                      }`}
                  >
                    <span>% Conf</span>
                  </button>

                  {/* Filter by Species */}
                  {detectedSpeciesList.length > 1 && (
                    <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                      <Filter className="w-3.5 h-3.5 text-slate-400" />
                      <select
                        value={filterClass}
                        onChange={(e) => setFilterClass(e.target.value)}
                        className="bg-transparent text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
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
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-semibold transition-colors ${isComparingSplit
                          ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                        }`}
                      title="So sánh ảnh gốc và kết quả AI"
                    >
                      <SplitSquareVertical className="w-3.5 h-3.5" />
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
                className="relative w-full min-h-[380px] sm:min-h-[440px] max-h-[640px] overflow-auto rounded-2xl bg-slate-950 flex items-center justify-center border border-slate-900 shadow-inner select-none p-2"
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
                    className="max-h-[600px] w-auto max-w-full object-contain block mx-auto rounded-lg"
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
                  <span className="text-emerald-500 font-semibold text-[11px] shrink-0">Khung nhận diện AI</span>
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
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs sm:text-sm transition-colors"
                      title="Tải ảnh đã vẽ khung nhận diện"
                    >
                      <Download className="w-4 h-4" />
                      Tải ảnh nhận diện
                    </button>
                    <button
                      onClick={handleDownloadExecutiveReport}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-sm shadow-emerald-600/20 transition-all"
                      title="Xuất phiếu giám định dịch hại nông nghiệp"
                    >
                      <FileCheck className="w-4 h-4" />
                      Xuất báo cáo giám định
                    </button>
                  </div>
                )}
              </div>

              {/* Optional Collapsible Technical Analytics & Benchmarks */}
              <div className="w-full pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowAnalytics(!showAnalytics);
                    setIsTelemetryVisible(true);
                  }}
                  className="w-full py-3.5 px-4 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-slate-800 dark:text-slate-100 font-bold text-sm sm:text-base transition-all shadow-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <BarChart3 className="w-5 h-5 text-emerald-600" />
                    <span>Đánh giá chuyên sâu & Ma trận nhầm lẫn (Tùy chọn)</span>
                    <span className="hidden sm:inline text-xs font-normal text-slate-500 dark:text-slate-400">
                      {showAnalytics ? '• Bấm để thu gọn' : '• Xem chi tiết độ đo mAP, PR & Confusion Matrix'}
                    </span>
                  </div>
                  {showAnalytics ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {showAnalytics && (
                  <div className="mt-3 space-y-4 animate-in fade-in duration-200">
                    <div
                      ref={telemetryRef}
                className={`w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-4 transition-all duration-700 transform ${
                  isTelemetryVisible
                    ? 'opacity-100 translate-y-0 scale-100 shadow-slate-200/50 dark:shadow-none'
                    : 'opacity-40 translate-y-6 scale-[0.99]'
                }`}
              >
                {/* Header with Mode Switcher */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        Chỉ số phân tích & Đánh giá mô hình YOLO11s
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Độ đo mẫu ảnh thực tế, Ma trận nhầm lẫn và Đồ thị Precision - Recall
                      </p>
                    </div>
                  </div>

                  {/* Mode Tabs Switcher */}
                  <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/70 dark:border-slate-700/60 text-xs font-semibold self-start sm:self-auto shrink-0 shadow-inner">
                    <button
                      type="button"
                      onClick={() => setAnalyticsTab('sample')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                        analyticsTab === 'sample'
                          ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      <Activity className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Ảnh hiện tại</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAnalyticsTab('matrix')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                        analyticsTab === 'matrix'
                          ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      <Grid3X3 className="w-3.5 h-3.5 text-blue-500" />
                      <span>Ma trận nhầm lẫn</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAnalyticsTab('curves')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                        analyticsTab === 'curves'
                          ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      <TrendingUp className="w-3.5 h-3.5 text-purple-500" />
                      <span>Đồ thị PR & mAP</span>
                    </button>
                  </div>
                </div>

                {/* TAB 1: Current Image Live Telemetry & Species Chart */}
                {analyticsTab === 'sample' && (
                  <div className="space-y-3.5 animate-in fade-in-50 duration-200">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                      {currentItem.naturalWidth && currentItem.naturalHeight && (
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700">
                          {currentItem.naturalWidth} × {currentItem.naturalHeight} px
                        </span>
                      )}
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-500/20">
                        Conf lọc: ≥ {config.defaultConf.toFixed(2)}
                      </span>
                    </div>

                    {/* 4 KPI Metrics Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 shadow-sm hover:border-emerald-500 transition-all">
                        <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 block">
                          Số cá thể phát hiện
                        </span>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                          <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                            {effectiveDetections.length}
                          </span>
                          <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-semibold">đối tượng</span>
                        </div>
                        <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-semibold block mt-0.5">
                          {Object.keys(effectiveCounts).length} loài dịch hại
                        </span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 shadow-sm hover:border-blue-500 transition-all">
                        <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 block">
                          Độ tin cậy trung bình
                        </span>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                          <span className="text-2xl sm:text-3xl font-black font-mono text-blue-600 dark:text-blue-400">
                            {meanConfidence > 0 ? `${meanConfidence.toFixed(1)}%` : '0%'}
                          </span>
                        </div>
                        <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-semibold block mt-0.5">
                          {effectiveDetections.length > 0 ? `Cao nhất: ${maxConfidence.toFixed(1)}%` : 'Không có đối tượng'}
                        </span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 shadow-sm hover:border-purple-500 transition-all">
                        <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 block">
                          Thời gian suy luận
                        </span>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                          <span className="text-2xl sm:text-3xl font-black font-mono text-purple-600 dark:text-purple-400">
                            {currentItem.result?.ms ? `${currentItem.result.ms} ms` : 'Chờ quét'}
                          </span>
                        </div>
                        <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-semibold block mt-0.5">
                          {currentItem.result?.ms
                            ? `Tương đương ~${(1000 / currentItem.result.ms).toFixed(1)} FPS`
                            : 'GPU CUDA ready'}
                        </span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 shadow-sm hover:border-amber-500 transition-all">
                        <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 block">
                          Mật độ che phủ lá
                        </span>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                          <span className="text-2xl sm:text-3xl font-black font-mono text-amber-600 dark:text-amber-400">
                            {surfaceCoveragePercent > 0 ? `${surfaceCoveragePercent.toFixed(1)}%` : '0%'}
                          </span>
                          <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-semibold">diện tích</span>
                        </div>
                        <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-semibold block mt-0.5">
                          {surfaceCoveragePercent >= 5 ? 'Nguy cơ lây lan cao' : surfaceCoveragePercent > 0 ? 'Xâm nhiễm cục bộ' : 'Bề mặt an toàn'}
                        </span>
                      </div>
                    </div>

                    {/* Species Confidence Distribution Chart & Breakdown */}
                    {speciesChartData.length > 0 ? (
                      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                            <Activity className="w-4 h-4 text-emerald-500" />
                            Biểu đồ phân bố độ tin cậy theo loài trong mẫu ảnh:
                          </span>
                          <span className="text-xs text-slate-600 dark:text-slate-400 font-bold font-mono">
                            {speciesChartData.length} loài được phát hiện
                          </span>
                        </div>

                        {/* Horizontal Visual Progress Bars */}
                        <div className="space-y-2.5">
                          {speciesChartData.map((item, idx) => (
                            <div
                              key={idx}
                              className="p-3.5 rounded-xl bg-white dark:bg-slate-800/70 border-2 border-slate-200 dark:border-slate-700 space-y-2 hover:shadow-md transition-all"
                            >
                              <div className="flex items-center justify-between text-sm sm:text-base">
                                <div className="flex items-center gap-2.5">
                                  <span
                                    className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                                    style={{ backgroundColor: item.color }}
                                  />
                                  <span className="font-extrabold text-slate-900 dark:text-slate-100">
                                    {item.name}
                                  </span>
                                  <span className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold border border-slate-300 dark:border-slate-600">
                                    {item.count} cá thể
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 font-mono">
                                  <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-semibold">Độ tin cậy TB:</span>
                                  <span className="font-black text-emerald-700 dark:text-emerald-400 text-base sm:text-lg">
                                    {item.avgConf}%
                                  </span>
                                  <span className="text-xs text-slate-500 hidden sm:inline font-medium">
                                    (Cao nhất: {item.maxConf}%)
                                  </span>
                                </div>
                              </div>

                              {/* Progress bar with smooth entrance */}
                              <div className="w-full bg-slate-200/90 dark:bg-slate-700 rounded-full h-3 sm:h-3.5 overflow-hidden border border-slate-300/40">
                                <div
                                  className="h-full rounded-full transition-all duration-1000 ease-out shadow-sm"
                                  style={{
                                    width: isTelemetryVisible ? `${Math.max(5, item.avgConf)}%` : '0%',
                                    backgroundColor: item.color,
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                        Không ghi nhận đối tượng sâu hại nào vượt ngưỡng tin cậy trên mẫu ảnh này.
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: Interactive Normalized Confusion Matrix Heatmap */}
                {analyticsTab === 'matrix' && (
                  <div className="space-y-3.5 animate-in fade-in-50 duration-200">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          <Grid3X3 className="w-4 h-4 text-emerald-500" />
                          Ma trận nhầm lẫn chuẩn hóa (Normalized Confusion Matrix) YOLO11s
                        </h5>
                        <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Hàng: Nhãn thực tế (True Class) • Cột: Nhãn dự đoán (Predicted Class) • Màu càng đậm độ chuẩn xác càng cao
                        </p>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-mono">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/20">
                          Độ chính xác đường chéo: 90.8%
                        </span>
                      </div>
                    </div>

                    {/* Interactive Heatmap Matrix Grid */}
                    <div className="overflow-x-auto pb-2 scrollbar-thin">
                      <div className="min-w-[620px]">
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-1 text-xs font-black text-slate-800 dark:text-slate-200 text-center pb-1.5">
                          <div className="col-span-1 text-left font-bold text-slate-500 dark:text-slate-400 truncate">
                            Thực \ Đoán
                          </div>
                          {MATRIX_CLASSES.map((cls, idx) => (
                            <div
                              key={idx}
                              className="col-span-1 p-1 rounded-md bg-slate-200/80 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold truncate shadow-xs"
                              title={`${idx + 1}. ${cls}`}
                            >
                              {idx + 1}
                            </div>
                          ))}
                        </div>

                        {/* Matrix Rows */}
                        <div className="space-y-1.5">
                          {NORMALIZED_CONFUSION_MATRIX.map((row, rIdx) => (
                            <div key={rIdx} className="grid grid-cols-12 gap-1.5 items-center">
                              {/* Row Header Label */}
                              <div
                                className="col-span-1 text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate text-left pr-1"
                                title={`${rIdx + 1}. ${MATRIX_CLASSES[rIdx]}`}
                              >
                                <span className="font-mono text-emerald-700 dark:text-emerald-400 mr-1">{rIdx + 1}.</span>
                                {MATRIX_CLASSES[rIdx].replace('Sâu ', '').replace('Rầy ', '')}
                              </div>

                              {/* Row Cells */}
                              {row.map((val, cIdx) => {
                                const isDiagonal = rIdx === cIdx;
                                const isHovered =
                                  hoveredMatrixCell?.row === rIdx && hoveredMatrixCell?.col === cIdx;

                                return (
                                  <div
                                    key={cIdx}
                                    onMouseEnter={() => setHoveredMatrixCell({ row: rIdx, col: cIdx, val })}
                                    onMouseLeave={() => setHoveredMatrixCell(null)}
                                    className={`col-span-1 py-2 rounded-lg text-center font-mono text-xs sm:text-sm transition-all cursor-pointer select-none ${
                                      isHovered
                                        ? 'ring-3 ring-blue-600 scale-110 z-20 shadow-lg font-black'
                                        : ''
                                    } ${
                                      val >= 0.9
                                        ? 'bg-emerald-600 text-white font-black shadow-sm'
                                        : val >= 0.7
                                        ? 'bg-emerald-500 text-white font-extrabold'
                                        : val >= 0.2
                                        ? 'bg-emerald-100 text-emerald-950 font-black border border-emerald-400'
                                        : val > 0.02
                                        ? 'bg-amber-100 text-amber-950 font-black border border-amber-400'
                                        : 'bg-slate-100 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 font-semibold'
                                    }`}
                                    title={`Thực tế: ${MATRIX_CLASSES[rIdx]} | Dự đoán: ${MATRIX_CLASSES[cIdx]} | Tỉ lệ: ${(val * 100).toFixed(1)}%`}
                                  >
                                    {(val * 100).toFixed(0)}%
                                  </div>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Color Scale Legend */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-600 dark:text-slate-300">Thang màu xác suất:</span>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <span className="w-3.5 h-3.5 rounded bg-emerald-600 inline-block shrink-0 shadow-sm" />
                          <span>≥ 90% (Xuất sắc)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-3.5 h-3.5 rounded bg-emerald-500 inline-block shrink-0" />
                          <span>70 - 89% (Tốt)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-3.5 h-3.5 rounded bg-amber-100 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 inline-block shrink-0" />
                          <span>3 - 20% (Nhiễu chéo)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-3.5 h-3.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 inline-block shrink-0" />
                          <span>&lt; 3% (Hiếm)</span>
                        </div>
                      </div>
                    </div>

                    {/* Matrix Hover Information Pill */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex flex-wrap items-center justify-between text-xs gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-600 dark:text-slate-300">
                          Chi tiết ô được chọn:
                        </span>
                        {hoveredMatrixCell ? (
                          <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                            Thực tế: <strong className="text-slate-900 dark:text-slate-100">{MATRIX_CLASSES[hoveredMatrixCell.row]}</strong> ➔ Dự đoán: <strong className="text-slate-900 dark:text-slate-100">{MATRIX_CLASSES[hoveredMatrixCell.col]}</strong> (Xác suất: {(hoveredMatrixCell.val * 100).toFixed(1)}%)
                            {hoveredMatrixCell.row === hoveredMatrixCell.col ? ' • ✓ Phân loại chính xác' : ' • ⚠ Nhầm lẫn chéo'}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">
                            (Rê chuột vào từng ô ma trận phía trên để xem tỷ lệ phân loại chéo chi tiết)
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-slate-500 font-mono text-[11px]">
                        <span>Lớp chuẩn nhất: <strong className="text-emerald-600">Rầy nâu (95%)</strong></span>
                        <span>Nhiễu nền: <strong className="text-blue-600">&lt; 2.1%</strong></span>
                      </div>
                    </div>

                    {/* Key Findings Chips */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                        <span className="font-bold block mb-0.5">🌾 Rầy nâu ít nhầm lẫn nhất</span>
                        <span>Đạt 95% độ chính xác do đặc trưng hình thái vệt cánh và màu thân sẫm rất rõ.</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-amber-800 dark:text-amber-300">
                        <span className="font-bold block mb-0.5">⚠️ Nhầm lẫn Đục thân (4%)</span>
                        <span>Đục thân 5 vạch và 2 chấm có tỷ lệ nhầm lẫn 4% vì giai đoạn ấu trùng non tương tự nhau.</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-blue-500/5 border border-blue-500/20 text-blue-800 dark:text-blue-300">
                        <span className="font-bold block mb-0.5">🍃 Phân biệt nền lá tốt</span>
                        <span>Tỷ lệ báo ảo từ nền lá hoặc gân lúa (False Positives) chỉ chiếm 2.1% trên toàn bộ tập test.</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: Precision-Recall Curves & Model Evaluation */}
                {analyticsTab === 'curves' && (
                  <div className="space-y-4 transition-opacity duration-300">
                    {/* Sub-nav selector inside curves tab */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setCurveSubTab('map_pr')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            curveSubTab === 'map_pr'
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          Biểu đồ mAP@50 & PR Curve
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurveSubTab('f1_conf')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            curveSubTab === 'f1_conf'
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          Đường cong F1 vs Confidence
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurveSubTab('specs')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            curveSubTab === 'specs'
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          Thông số kiến trúc YOLO11s
                        </button>
                      </div>

                      <span className="text-xs text-slate-500 font-mono">
                        Kiểm thử trên 1.520 mẫu ảnh thực địa
                      </span>
                    </div>

                    {/* Sub-view 1: mAP@50 & PR Curve */}
                    {curveSubTab === 'map_pr' && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Chart 1: Per-Class mAP@50 Bar Chart */}
                        <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                          <div className="flex items-center justify-between">
                            <h6 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                              <BarChart3 className="w-4 h-4 text-emerald-500" />
                              Độ đo mAP@0.50 theo từng loài sâu bệnh
                            </h6>
                            <span className="font-mono text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                              Mean mAP: 89.8%
                            </span>
                          </div>

                          <div className="h-60 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={PER_CLASS_BENCHMARKS} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                                <XAxis
                                  dataKey="name"
                                  angle={-35}
                                  textAnchor="end"
                                  interval={0}
                                  tick={{ fontSize: 11, fill: '#0f172a', fontWeight: 'bold' }}
                                />
                                <YAxis domain={[75, 100]} unit="%" tick={{ fontSize: 11.5, fill: '#0f172a', fontWeight: 'bold' }} />
                                <Tooltip
                                  formatter={(val: any) => [`${val}%`, 'mAP@0.50']}
                                  labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                                  contentStyle={{ borderRadius: '12px', fontSize: '13px', fontWeight: 'bold' }}
                                />
                                <ReferenceLine y={89.8} stroke="#059669" strokeWidth={2} strokeDasharray="3 3" />
                                <Bar dataKey="map50" radius={[6, 6, 0, 0]}>
                                  {PER_CLASS_BENCHMARKS.map((entry, idx) => (
                                    <Cell key={idx} fill={entry.color} />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Chart 2: Precision-Recall Curve (PR-Curve) */}
                        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 space-y-2 shadow-sm">
                          <div className="flex items-center justify-between">
                            <h6 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                              <TrendingUp className="w-4 h-4 text-purple-500" />
                              Đường cong Precision - Recall (PR Curve)
                            </h6>
                            <span className="font-mono text-xs font-bold text-purple-600 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                              AUC: 0.898
                            </span>
                          </div>

                          <div className="h-60 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={PR_CURVE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                                <defs>
                                  <linearGradient id="prGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.45} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                                <XAxis dataKey="recall" domain={[0, 1]} tick={{ fontSize: 11.5, fill: '#0f172a', fontWeight: 'bold' }} unit=" R" />
                                <YAxis domain={[0.4, 1.0]} tick={{ fontSize: 11.5, fill: '#0f172a', fontWeight: 'bold' }} unit=" P" />
                                <Tooltip
                                  formatter={(val: any, name: any) => [
                                    typeof val === 'number' ? (val * 100).toFixed(1) + '%' : val,
                                    name === 'precision' ? 'Độ chính xác (Precision)' : name
                                  ]}
                                  labelFormatter={(label) => `Độ phủ (Recall): ${(Number(label) * 100).toFixed(0)}%`}
                                  contentStyle={{ borderRadius: '12px', fontSize: '13px', fontWeight: 'bold' }}
                                />
                                <ReferenceLine x={0.88} stroke="#7c3aed" strokeWidth={2} strokeDasharray="3 3" label={{ value: 'Peak F1: 0.88', fill: '#6d28d9', fontSize: 11, fontWeight: 'bold' }} />
                                <Area
                                  type="monotone"
                                  dataKey="precision"
                                  stroke="#059669"
                                  strokeWidth={3}
                                  fillOpacity={1}
                                  fill="url(#prGradient)"
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Sub-view 2: F1 vs Confidence Curve */}
                    {curveSubTab === 'f1_conf' && (
                      <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 space-y-3 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <h6 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                              <TrendingUp className="w-4 h-4 text-emerald-500" />
                              Đường cong F1-Score theo Ngưỡng tin cậy (Confidence Threshold)
                            </h6>
                            <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
                              Giải thích lý do hệ thống chọn mặc định Conf ≥ 0.55 làm điểm vận hành tối ưu (Operating Sweet Spot)
                            </p>
                          </div>
                          <span className="font-mono text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                            F1 Max = 0.88 tại Conf = 0.55
                          </span>
                        </div>

                        <div className="h-64 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={F1_CONFIDENCE_CURVE} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                              <defs>
                                <linearGradient id="f1Gradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.45} />
                                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.05} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                              <XAxis dataKey="conf" tick={{ fontSize: 11.5, fill: '#0f172a', fontWeight: 'bold' }} unit=" Conf" />
                              <YAxis domain={[0.5, 1.0]} tick={{ fontSize: 11.5, fill: '#0f172a', fontWeight: 'bold' }} unit=" F1" />
                              <Tooltip
                                formatter={(val: any, name: any) => [
                                  typeof val === 'number' ? val.toFixed(2) : val,
                                  name === 'f1' ? 'F1-Score' : name === 'precision' ? 'Precision' : 'Recall'
                                ]}
                                labelFormatter={(label) => `Ngưỡng lọc Conf: ${label}`}
                                contentStyle={{ borderRadius: '12px', fontSize: '13px', fontWeight: 'bold' }}
                              />
                              <ReferenceLine x={0.55} stroke="#059669" strokeWidth={2} strokeDasharray="3 3" label={{ value: 'Tối ưu Conf: 0.55', fill: '#047857', fontSize: 11.5, fontWeight: 'bold' }} />
                              <Area
                                type="monotone"
                                dataKey="f1"
                                stroke="#2563eb"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#f1Gradient)"
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}

                    {/* Sub-view 3: Architecture & Model Specs */}
                    {curveSubTab === 'specs' && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-1">
                          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Kiến trúc nơ-ron</span>
                          <span className="font-bold text-slate-900 dark:text-slate-100 text-sm block">{MODEL_SPECS.architecture}</span>
                          <span className="text-xs text-slate-400">Ultralytics PyTorch</span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-1">
                          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Số lượng tham số</span>
                          <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400 text-base block">{MODEL_SPECS.parameters}</span>
                          <span className="text-xs text-slate-400">Tối ưu cho Edge GPU</span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-1">
                          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Độ phức tạp GFLOPs</span>
                          <span className="font-bold font-mono text-blue-600 dark:text-blue-400 text-base block">{MODEL_SPECS.gflops}</span>
                          <span className="text-xs text-slate-400">Xử lý thời gian thực</span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-1">
                          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Độ phân giải đầu vào</span>
                          <span className="font-bold font-mono text-purple-600 dark:text-purple-400 text-base block">{MODEL_SPECS.inputSize}</span>
                          <span className="text-xs text-slate-400">Tự động scale thư viện</span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-1">
                          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">mAP@0.50 Toàn cục</span>
                          <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400 text-base block">{MODEL_SPECS.mAP50_Overall}</span>
                          <span className="text-xs text-slate-400">Trung bình 10 loài</span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-1">
                          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">mAP@0.50:0.95 (COCO)</span>
                          <span className="font-bold font-mono text-indigo-600 dark:text-indigo-400 text-base block">{MODEL_SPECS.mAP50_95_Overall}</span>
                          <span className="text-xs text-slate-400">Tiêu chuẩn khắt khe</span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-1">
                          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Độ chính xác (Precision)</span>
                          <span className="font-bold font-mono text-teal-600 dark:text-teal-400 text-base block">{MODEL_SPECS.precision_Overall}</span>
                          <span className="text-xs text-slate-400">Hạn chế báo động giả</span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-1">
                          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Độ phủ (Recall)</span>
                          <span className="font-bold font-mono text-amber-600 dark:text-amber-400 text-base block">{MODEL_SPECS.recall_Overall}</span>
                          <span className="text-xs text-slate-400">Không bỏ sót dịch hại</span>
                        </div>
                      </div>
                    )}

                    {/* Explanatory footer */}
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2 font-mono">
                      <span>Kiến trúc nơ-ron: <strong>Ultralytics YOLO11s</strong></span>
                      <span>Tập kiểm thử: <strong>1.520 mẫu ảnh lá lúa thực địa</strong></span>
                      <span>Mức tin cậy tối ưu: <strong>Conf ≥ 0.55 (F1-score = 0.88)</strong></span>
                    </div>
                  </div>
                )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Results & Agro-Intelligence Sidebar */}
            <div className={`${isExpandedView ? 'lg:col-span-12' : 'lg:col-span-4'} space-y-3`}>
              {/* Outbreak Risk Evaluation Card */}
              {risk && (
                <div
                  className={`p-3 rounded-2xl border shadow-sm space-y-1.5 transition-all ${risk.bg} ${
                    risk.level === 'critical'
                      ? ''
                      : risk.level === 'warning'
                      ? ''
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
                      {risk.level === 'critical' ? (
                        <div className="relative flex items-center justify-center shrink-0">
                          <Flame className="w-4 h-4 text-rose-600 dark:text-rose-400 " />
                          <span className="absolute -top-1 -right-1 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
                          </span>
                        </div>
                      ) : risk.level === 'warning' ? (
                        <div className="relative flex items-center justify-center shrink-0">
                          <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-pulse" />
                          <span className="absolute -top-1 -right-1 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600"></span>
                          </span>
                        </div>
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      )}
                      <span className="tracking-tight leading-snug">{risk.title}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowRiskDetail(!showRiskDetail)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold underline underline-offset-2 opacity-90 hover:opacity-100 shrink-0 ml-2"
                    >
                      <span>{showRiskDetail ? 'Thu gọn' : 'Xem chi tiết'}</span>
                      {showRiskDetail ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-xs leading-relaxed opacity-95">
                    {risk.message}
                  </p>
                  {showRiskDetail && (
                    <div className="pt-2 border-t border-current/15 text-[11px] leading-relaxed animate-in fade-in">
                      <strong>Khuyến cáo khẩn cấp:</strong> {risk.recommendedAction}
                    </div>
                  )}
                </div>
              )}

              {/* Main Analysis Results Card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 sm:p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      Chi tiết nhận diện
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Đang lọc theo ngưỡng tin cậy <strong className="text-emerald-600 font-mono">{config.defaultConf}</strong>
                    </p>
                  </div>
                  {currentItem.result && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
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
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
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

                        {/* Interactive Detections List - Collapsible with toggle button */}
                        <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <button
                            type="button"
                            onClick={() => setShowDetectionsList(!showDetectionsList)}
                            className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
                          >
                            <span className="flex items-center gap-1.5">
                              <span>Danh sách đối tượng phát hiện</span>
                              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 font-bold">
                                {effectiveDetections.length}
                              </span>
                            </span>
                            <span className="flex items-center gap-1 text-[11px] text-slate-400">
                              <span>{showDetectionsList ? 'Thu gọn' : 'Bấm để xem'}</span>
                              {showDetectionsList ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </span>
                          </button>

                          {showDetectionsList && (
                            <div className="max-h-48 overflow-y-auto space-y-1 pr-1 text-xs animate-in fade-in duration-150">
                              {effectiveDetections.map((det, idx) => (
                                <div
                                  key={idx}
                                  onMouseEnter={() => setHoveredIndex(idx)}
                                  onMouseLeave={() => setHoveredIndex(null)}
                                  onClick={() => {
                                    setHighlightedIndex(idx);
                                    setInspectedPestKey(det.cls);
                                  }}
                                  className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer transition-all ${
                                    highlightedIndex === idx || hoveredIndex === idx
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
                          )}
                        </div>

                        {/* Inline Agricultural Diagnostic & CLRRI IPM Decision Card - Collapsible */}
                        {activeInspectedEntry && (
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2.5 animate-in fade-in">
                            <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-500/10 via-slate-50 to-teal-500/5 dark:from-emerald-950/30 dark:via-slate-900/60 dark:to-slate-900 border border-emerald-500/25 shadow-sm space-y-2.5">
                              <div className="flex items-start justify-between gap-2 border-b border-emerald-500/20 pb-2">
                                <div>
                                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                                    Chẩn đoán loài đang chọn:
                                  </span>
                                  <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 mt-0.5">
                                    <Bug className="w-4 h-4 text-emerald-600 shrink-0" />
                                    {activeInspectedEntry.vi}
                                  </h4>
                                  <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium mt-0.5">
                                    {activeInspectedEntry.en} ‹ {activeInspectedEntry.scientific} ›
                                  </p>
                                </div>

                                <span
                                  className={`text-xs font-bold px-2.5 py-1 rounded-full border shrink-0 ${
                                    activeInspectedEntry.severity === 'critical'
                                      ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30'
                                      : activeInspectedEntry.severity === 'high'
                                      ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30'
                                      : 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30'
                                  }`}
                                >
                                  {activeInspectedEntry.severity === 'critical'
                                    ? 'Nguy cấp'
                                    : activeInspectedEntry.severity === 'high'
                                    ? 'Nguy cơ cao'
                                    : 'Trung bình'}
                                </span>
                              </div>

                              {/* Toggle Button for Inspected Details */}
                              <button
                                type="button"
                                onClick={() => setShowInspectedDetails(!showInspectedDetails)}
                                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-semibold transition-colors"
                              >
                                <span>{showInspectedDetails ? 'Thu gọn chi tiết' : 'Xem chi tiết phòng trừ & thiên địch'}</span>
                                {showInspectedDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>

                              {/* Expanded Detailed Sections */}
                              {showInspectedDetails && (
                                <div className="space-y-2.5 pt-1 border-t border-emerald-500/15 animate-in fade-in duration-150">
                                  {/* Sensitive Stages */}
                                  {activeInspectedEntry.damageStages && activeInspectedEntry.damageStages.length > 0 && (
                                    <div className="space-y-1">
                                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                                        <Leaf className="w-3.5 h-3.5 text-emerald-500" />
                                        Giai đoạn mẫn cảm:
                                      </span>
                                      <div className="flex flex-wrap gap-1.5">
                                        {activeInspectedEntry.damageStages.map((st, i) => (
                                          <span
                                            key={i}
                                            className="px-2.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-500/20 text-xs"
                                          >
                                            {st}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Symptoms */}
                                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-white/80 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                                    <strong className="text-slate-900 dark:text-slate-100">Triệu chứng:</strong>{' '}
                                    {activeInspectedEntry.symptoms}
                                  </p>

                                  {/* Natural Enemies */}
                                  <div className="space-y-1">
                                    <span className="text-xs font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                                      <HeartHandshake className="w-3.5 h-3.5" />
                                      Thiên địch tự nhiên:
                                    </span>
                                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 italic">
                                      {activeInspectedEntry.naturalEnemies.join(', ')}
                                    </p>
                                  </div>

                                  {/* Recommended Chemicals */}
                                  <div className="space-y-1.5">
                                    <span className="text-xs font-bold text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                                      <FlaskConical className="w-3.5 h-3.5" />
                                      Hoạt chất đặc trị & thuốc thương phẩm:
                                    </span>
                                    <div className="flex flex-wrap gap-1.5">
                                      {activeInspectedEntry.chemicals.map((ch, idx) => (
                                        <span
                                          key={idx}
                                          className="px-2.5 py-0.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-semibold border border-purple-500/20 text-xs"
                                        >
                                          {ch}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Button to open full modal */}
                              <button
                                onClick={() => setSelectedPestForModal(activeInspectedEntry.key)}
                                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-sm shadow-emerald-600/20 active:scale-95 inline-flex items-center justify-center gap-1.5"
                              >
                                <span>Xem đầy đủ bách khoa IPM</span>
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
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

