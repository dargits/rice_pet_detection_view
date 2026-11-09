// Common types for YOLOv11 Rice Pest Detection App

export interface BoundingBox {
  // [x1, y1, x2, y2] relative to original image width x height
  box: [number, number, number, number];
  cls: string;
  cls_id: number;
  conf: number;
}

export interface Detection extends BoundingBox {}

export interface HealthResponse {
  status: 'ok' | 'healthy' | string;
  device: string;
  classes: Record<string, string>;
  uptime_s: number;
  auth_required?: boolean;
}

export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

export interface PestInfo {
  cls_id: number;
  cls: string;
  name: string;
  description: string;
  prevention: string;
  scientific?: string;
  enName?: string;
  severity?: SeverityLevel;
  damageStages?: string[];
  naturalEnemies?: string[];
  symptoms?: string;
  chemicals?: string[];
}

export interface RiskAssessment {
  level: 'safe' | 'low' | 'warning' | 'critical';
  title: string;
  message: string;
  color: string;
  bg: string;
  recommendedAction: string;
}

export interface PredictResponse {
  id: string;
  width: number;
  height: number;
  ms: number;
  counts: Record<string, number>;
  detections: Detection[];
  image_b64?: string;
}

export interface VideoFrameDetection {
  frame: number;
  time: number; // in seconds
  detections: Detection[];
}

export interface JobResponse {
  status: 'processing' | 'done' | 'error';
  progress: number; // 0..1
  error?: string;
  counts?: Record<string, number>;
  frames?: VideoFrameDetection[];
  history_id?: string;
}

export interface HistoryMeta {
  duration?: number;
  total_frames?: number;
  fps?: number;
  device?: string;
  conf?: number;
  skip?: number;
  [key: string]: unknown;
}

export interface HistoryItem {
  id: string;
  ts: string;
  source: 'image' | 'video' | 'stream';
  filename: string;
  total: number;
  counts: Record<string, number>;
  has_image: boolean;
  meta?: HistoryMeta;
  detections?: Detection[];
}

export interface HistoryResponse {
  total: number;
  items: HistoryItem[];
}

export interface StatsResponse {
  records: number;
  by_source: Record<string, number>;
  by_class: Record<string, number>;
  by_day: Record<string, Record<string, number>>;
}

export type PestLanguageOption = 'vi' | 'en' | 'both';

export interface AppConfig {
  apiUrl: string;
  apiKey: string;
  defaultConf: number;
  videoSkip: number;
  mockMode: boolean;
  pestLanguage: PestLanguageOption;
}

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

export interface CanvasDisplaySettings {
  showLabels: boolean;
  showConfidence: boolean;
  filterClass: string; // 'all' or specific class key
  selectedBoxIndex: number | null;
  hoveredBoxIndex: number | null;
}
