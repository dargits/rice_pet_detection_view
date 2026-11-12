import {
  HealthResponse,
  PestInfo,
  PredictResponse,
  JobResponse,
  HistoryResponse,
  HistoryItem,
  StatsResponse,
  Detection,
} from '../types';
import { PEST_DATABASE_10 } from './pestTranslations';

export const MOCK_CLASSES: Record<string, string> = {
  '0': 'rice_leaf_roller',
  '1': 'rice_leaf_caterpillar',
  '2': 'asiatic_rice_borer',
  '3': 'yellow_rice_borer',
  '4': 'rice_gall_midge',
  '5': 'brown_plant_hopper',
  '6': 'white_backed_plant_hopper',
  '7': 'small_brown_plant_hopper',
  '8': 'rice_water_weevil',
  '9': 'rice_leafhopper',
};

export const MOCK_PESTS: PestInfo[] = PEST_DATABASE_10.map((p) => ({
  cls_id: p.id,
  cls: p.key,
  name: `${p.vi} (${p.en})`,
  description: `${p.morphology}\n\nTriệu chứng gây hại: ${p.symptoms}`,
  prevention: `${p.prevention}\n\nQuy trình IPM Viện Lúa ĐBSCL: ${p.clrriIpm.culturalMeasures} ${p.clrriIpm.chemicalStrategy}`,
  scientific: p.scientific,
  enName: p.en,
  severity: p.severity,
  damageStages: p.damageStages,
  naturalEnemies: p.naturalEnemies,
  symptoms: p.symptoms,
  chemicals: p.chemicals,
}));

export const MOCK_HISTORY: HistoryItem[] = [
  {
    id: 'hist-001',
    ts: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    source: 'image',
    filename: 'ruong_lua_lo_a1.jpg',
    total: 4,
    counts: { 'brown_plant_hopper': 3, 'rice_leaf_roller': 1 },
    has_image: true,
    meta: { conf: 0.45, device: 'CUDA:0 (NVIDIA T4)' },
    detections: [
      { box: [120, 150, 240, 310], cls: 'brown_plant_hopper', cls_id: 5, conf: 0.88 },
      { box: [280, 190, 410, 350], cls: 'brown_plant_hopper', cls_id: 5, conf: 0.79 },
      { box: [450, 120, 560, 270], cls: 'brown_plant_hopper', cls_id: 5, conf: 0.65 },
      { box: [590, 300, 710, 480], cls: 'rice_leaf_roller', cls_id: 0, conf: 0.92 },
    ]
  },
  {
    id: 'hist-002',
    ts: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    source: 'video',
    filename: 'khao_sat_dong_20261102.mp4',
    total: 12,
    counts: { 'rice_leaf_roller': 8, 'yellow_rice_borer': 4 },
    has_image: false,
    meta: { duration: 45, total_frames: 1350, skip: 3, fps: 30, device: 'CUDA:0 (NVIDIA T4)' },
    detections: [
      { box: [100, 100, 260, 290], cls: 'rice_leaf_roller', cls_id: 0, conf: 0.84 },
      { box: [350, 180, 490, 340], cls: 'yellow_rice_borer', cls_id: 3, conf: 0.77 },
    ]
  },
  {
    id: 'hist-003',
    ts: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    source: 'stream',
    filename: 'webcam_field_live_1.stream',
    total: 6,
    counts: { 'white_backed_plant_hopper': 4, 'brown_plant_hopper': 2 },
    has_image: false,
    meta: { duration: 120, fps: 4 },
  },
  {
    id: 'hist-004',
    ts: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    source: 'image',
    filename: 'mau_la_benh_3.jpg',
    total: 2,
    counts: { 'asiatic_rice_borer': 2 },
    has_image: true,
    meta: { conf: 0.5 },
    detections: [
      { box: [200, 150, 380, 370], cls: 'asiatic_rice_borer', cls_id: 2, conf: 0.91 },
      { box: [420, 210, 580, 410], cls: 'asiatic_rice_borer', cls_id: 2, conf: 0.83 },
    ]
  }
];

export const MOCK_STATS: StatsResponse = {
  records: 54,
  by_source: {
    image: 30,
    video: 15,
    stream: 9
  },
  by_class: {
    'brown_plant_hopper': 65,
    'rice_leaf_roller': 48,
    'yellow_rice_borer': 32,
    'white_backed_plant_hopper': 28,
    'asiatic_rice_borer': 21,
    'rice_gall_midge': 19,
    'rice_leaf_caterpillar': 16,
    'small_brown_plant_hopper': 14,
    'rice_water_weevil': 11,
    'rice_leafhopper': 25,
  },
  by_day: {
    '2026-10-28': { 'brown_plant_hopper': 8, 'rice_leaf_roller': 5, 'white_backed_plant_hopper': 4 },
    '2026-10-29': { 'brown_plant_hopper': 12, 'rice_leaf_roller': 6, 'yellow_rice_borer': 4 },
    '2026-10-30': { 'brown_plant_hopper': 15, 'asiatic_rice_borer': 5, 'rice_leaf_caterpillar': 3 },
    '2026-10-31': { 'brown_plant_hopper': 9, 'rice_leaf_roller': 10, 'rice_gall_midge': 6 },
    '2026-11-01': { 'brown_plant_hopper': 11, 'yellow_rice_borer': 8, 'white_backed_plant_hopper': 5 },
    '2026-11-02': { 'brown_plant_hopper': 7, 'rice_leaf_roller': 12, 'rice_leafhopper': 8 },
    '2026-11-03': { 'brown_plant_hopper': 3, 'asiatic_rice_borer': 4, 'rice_water_weevil': 4 }
  }
};

// In-memory state for mock video jobs
interface MockJobInternal {
  id: string;
  progress: number;
  status: 'processing' | 'done' | 'error';
  counts: Record<string, number>;
  frames: Array<{ frame: number; time: number; detections: Detection[] }>;
  history_id: string;
  createdAt: number;
}

const mockJobs: Map<string, MockJobInternal> = new Map();

export function createMockJob(): string {
  const jobId = 'mock-job-' + Math.random().toString(36).substring(2, 9);
  const internal: MockJobInternal = {
    id: jobId,
    progress: 0.05,
    status: 'processing',
    counts: { 'brown_plant_hopper': 5, 'rice_leaf_roller': 3, 'yellow_rice_borer': 2 },
    frames: [
      {
        frame: 30,
        time: 1.0,
        detections: [
          { box: [150, 120, 290, 280], cls: 'brown_plant_hopper', cls_id: 5, conf: 0.88 },
          { box: [400, 200, 520, 340], cls: 'rice_leaf_roller', cls_id: 0, conf: 0.79 },
        ]
      },
      {
        frame: 90,
        time: 3.0,
        detections: [
          { box: [220, 180, 360, 340], cls: 'brown_plant_hopper', cls_id: 5, conf: 0.91 },
        ]
      },
      {
        frame: 150,
        time: 5.0,
        detections: [
          { box: [100, 90, 240, 260], cls: 'yellow_rice_borer', cls_id: 3, conf: 0.85 },
          { box: [380, 160, 510, 310], cls: 'rice_leaf_roller', cls_id: 0, conf: 0.74 },
        ]
      },
      {
        frame: 240,
        time: 8.0,
        detections: [
          { box: [180, 140, 310, 290], cls: 'brown_plant_hopper', cls_id: 5, conf: 0.82 },
          { box: [450, 220, 580, 380], cls: 'brown_plant_hopper', cls_id: 5, conf: 0.76 },
        ]
      },
      {
        frame: 360,
        time: 12.0,
        detections: [
          { box: [300, 170, 440, 320], cls: 'yellow_rice_borer', cls_id: 3, conf: 0.90 },
        ]
      }
    ],
    history_id: 'hist-002',
    createdAt: Date.now(),
  };
  mockJobs.set(jobId, internal);
  return jobId;
}

export function getMockJobStatus(jobId: string): JobResponse {
  const job = mockJobs.get(jobId);
  if (!job) {
    return {
      status: 'error',
      progress: 0,
      error: 'Không tìm thấy tác vụ (Job ID không hợp lệ)'
    };
  }

  const elapsed = (Date.now() - job.createdAt) / 1000;
  // Increase progress over 4-6 seconds
  job.progress = Math.min(1.0, Number((0.15 + (elapsed / 4) * 0.85).toFixed(2)));

  if (job.progress >= 1.0) {
    job.status = 'done';
    return {
      status: 'done',
      progress: 1.0,
      counts: job.counts,
      frames: job.frames,
      history_id: job.history_id,
    };
  }

  return {
    status: 'processing',
    progress: job.progress,
  };
}

export function generateMockImagePrediction(width = 800, height = 600): PredictResponse {
  // Pick from the user's 10 classes
  const possibleClasses = [
    { id: 0, name: 'rice_leaf_roller' },
    { id: 1, name: 'rice_leaf_caterpillar' },
    { id: 2, name: 'asiatic_rice_borer' },
    { id: 3, name: 'yellow_rice_borer' },
    { id: 4, name: 'rice_gall_midge' },
    { id: 5, name: 'brown_plant_hopper' },
    { id: 6, name: 'white_backed_plant_hopper' },
    { id: 7, name: 'small_brown_plant_hopper' },
    { id: 8, name: 'rice_water_weevil' },
    { id: 9, name: 'rice_leafhopper' },
  ];

  const count = Math.floor(Math.random() * 3) + 1;
  const detections: Detection[] = [];
  const counts: Record<string, number> = {};

  for (let i = 0; i < count; i++) {
    const pest = possibleClasses[Math.floor(Math.random() * possibleClasses.length)];
    const boxW = Math.floor(width * (0.15 + Math.random() * 0.2));
    const boxH = Math.floor(height * (0.15 + Math.random() * 0.2));
    const x1 = Math.floor(Math.random() * (width - boxW - 20)) + 10;
    const y1 = Math.floor(Math.random() * (height - boxH - 20)) + 10;
    const conf = Number((0.65 + Math.random() * 0.32).toFixed(2));

    detections.push({
      box: [x1, y1, x1 + boxW, y1 + boxH],
      cls: pest.name,
      cls_id: pest.id,
      conf,
    });

    counts[pest.name] = (counts[pest.name] || 0) + 1;
  }

  return {
    id: 'pred-' + Math.random().toString(36).substring(2, 9),
    width,
    height,
    ms: Math.floor(18 + Math.random() * 25), // 18-43ms typical YOLOv11 on T4 GPU
    counts,
    detections,
  };
}
