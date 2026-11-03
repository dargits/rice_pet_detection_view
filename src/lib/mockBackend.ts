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

export const MOCK_CLASSES: Record<string, string> = {
  '0': 'Rầy nâu',
  '1': 'Sâu cuốn lá',
  '2': 'Sâu đục thân',
  '3': 'Bọ xít dài',
  '4': 'Bọ trĩ',
  '5': 'Bọ gai',
};

export const MOCK_PESTS: PestInfo[] = [
  {
    cls_id: 0,
    cls: 'ray_nau',
    name: 'Rầy nâu (Nilaparvata lugens)',
    description: 'Rầy nâu trưởng thành có màu nâu thẫm đến nâu vàng. Cả rầy non và trưởng thành đều chích hút nhựa ở phần gốc thân cây lúa, làm cây úa vàng, khô héo gọi là "cháy rầy". Rầy nâu còn là môi giới truyền bệnh vàng lùn và lùn xoắn lá cực kỳ nguy hiểm.',
    prevention: 'Áp dụng biện pháp "1 phải 5 giảm". Gieo sạ đồng loạt, né rầy theo khuyến cáo ngành nông nghiệp. Bảo tồn thiên địch (nhện, bọ xít nước, bọ ba khoang). Khi mật độ trên 3 con/tép, sử dụng thuốc đặc trị nhóm ức chế lột xác như Buprofezin, Pymetrozine hoặc hoạt chất Triflufezopyrim.'
  },
  {
    cls_id: 1,
    cls: 'sau_cuon_la',
    name: 'Sâu cuốn lá (Cnaphalocrocis medinalis)',
    description: 'Sâu non nhả tơ kết mép lá lúa thành bao tròn rồi nằm bên trong ăn nhu mô lá, để lại màng biểu bì màu trắng mỏng. Ruộng bị hại xơ xác, giảm diện tích quang hợp nghiêm trọng, làm hạt lúa lép lửng.',
    prevention: 'Không bón thừa đạm. Vệ sinh đồng ruộng, diệt sạch cỏ dại bờ ruộng. Thăm đồng phát hiện bướm rộ 5-7 ngày để phun diệt sâu non tuổi 1-2. Dùng chế phẩm sinh học Bt hoặc thuốc có hoạt chất Indoxacarb, Emamectin benzoate, Chlorantraniliprole.'
  },
  {
    cls_id: 2,
    cls: 'sau_duc_than',
    name: 'Sâu đục thân bướm 2 chấm (Scirpophaga incertulas)',
    description: 'Sâu non đục vào bẹ và thân lúa, cắn đứt mạch dẫn dinh dưỡng. Ở giai đoạn đẻ nhánh làm dảnh lúa héo ("dảnh héo"); giai đoạn trỗ làm bông bạc, lép hoàn toàn ("bông bạc").',
    prevention: 'Thu hoạch lúa sát gốc, cày lật gốc rạ tiêu diệt nhộng. Đặt bẫy đèn dự báo lứa bướm rộ. Ngắt ổ trứng sâu khi thăm đồng. Dùng các loại thuốc thấm sâu hoặc lưu dẫn giai đoạn lúa chuẩn bị trỗ và trỗ lẹt xẹt.'
  },
  {
    cls_id: 3,
    cls: 'bo_xit_dai',
    name: 'Bọ xít dài / Bọ xít hôi (Leptocorisa acuta)',
    description: 'Bọ xít dài có thân thon dài, màu xanh vàng hoặc nâu lục, phát mùi hôi đặc trưng. Trưởng thành và sâu non châm vòi hút nhựa hạt lúa non giai đoạn ngậm sữa và chắc xanh, làm hạt lép, lửng hoặc biến dạng có đốm đen, giảm giá trị thương phẩm.',
    prevention: 'Vệ sinh bờ cỏ, không trồng lúa gối vụ kéo dài. Dùng vợt bắt bọ xít lúc sáng sớm khi sương chưa tan hoặc chiều mát. Khi mật độ cao dùng thuốc nhóm cúc tổng hợp (Cypermethrin, Lambda-cyhalothrin) phun khi lúa ngậm sữa.'
  },
  {
    cls_id: 4,
    cls: 'bo_tri',
    name: 'Bọ trĩ lúa (Stenchaetothrips biformis)',
    description: 'Côn trùng rất nhỏ, màu nâu đen hoặc vàng nhạt. Thường gây hại ở giai đoạn mạ và lúa đẻ nhánh. Bọ trĩ chích hút nhựa ở chóp lá non làm đầu lá quăn queo, khô vàng từ chóp lá vào trong, cây còi cọc.',
    prevention: 'Giữ mực nước ruộng ổn định 3-5 cm để dìm bọ trĩ. Bón phân cân đối, bổ sung dinh dưỡng giúp cây lúa ra lá mới nhanh. Nếu hạn nặng sâu rộ, phun thuốc chứa Thiamethoxam hoặc Imidacloprid.'
  },
  {
    cls_id: 5,
    cls: 'bo_gai',
    name: 'Bọ gai (Dicladispa armigera)',
    description: 'Trưởng thành có gai nhọn tua tủa quanh thân và cánh, màu xanh ánh kim hoặc đen bóng. Sâu non sống bên trong mô lá đục thành đường hầm trắng; con trưởng thành ăn biểu bì mặt trên của lá thành các vệt dài trắng.',
    prevention: 'Dọn sạch cỏ dại ký chủ quanh bờ ruộng. Tháo nước ngập nhẹ và vớt sâu bọ. Sử dụng các loại thuốc trừ sâu nội hấp khi xuất hiện mật độ cao trước khi sâu đục sâu vào mô lá.'
  }
];

export const MOCK_HISTORY: HistoryItem[] = [
  {
    id: 'hist-001',
    ts: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    source: 'image',
    filename: 'ruong_lua_lo_a1.jpg',
    total: 4,
    counts: { 'Rầy nâu': 3, 'Bọ xít dài': 1 },
    has_image: true,
    meta: { conf: 0.45, device: 'CUDA:0 (NVIDIA T4)' },
    detections: [
      { box: [120, 150, 240, 310], cls: 'Rầy nâu', cls_id: 0, conf: 0.88 },
      { box: [280, 190, 410, 350], cls: 'Rầy nâu', cls_id: 0, conf: 0.79 },
      { box: [450, 120, 560, 270], cls: 'Rầy nâu', cls_id: 0, conf: 0.65 },
      { box: [590, 300, 710, 480], cls: 'Bọ xít dài', cls_id: 3, conf: 0.92 },
    ]
  },
  {
    id: 'hist-002',
    ts: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    source: 'video',
    filename: 'khao_sat_dong_20261102.mp4',
    total: 12,
    counts: { 'Sâu cuốn lá': 8, 'Sâu đục thân': 4 },
    has_image: false,
    meta: { duration: 45, total_frames: 1350, skip: 3, fps: 30, device: 'CUDA:0 (NVIDIA T4)' },
    detections: [
      { box: [100, 100, 260, 290], cls: 'Sâu cuốn lá', cls_id: 1, conf: 0.84 },
      { box: [350, 180, 490, 340], cls: 'Sâu đục thân', cls_id: 2, conf: 0.77 },
    ]
  },
  {
    id: 'hist-003',
    ts: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    source: 'stream',
    filename: 'webcam_field_live_1.stream',
    total: 6,
    counts: { 'Bọ trĩ': 4, 'Rầy nâu': 2 },
    has_image: false,
    meta: { duration: 120, fps: 4 },
  },
  {
    id: 'hist-004',
    ts: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    source: 'image',
    filename: 'mau_la_benh_3.jpg',
    total: 2,
    counts: { 'Bọ gai': 2 },
    has_image: true,
    meta: { conf: 0.5 },
    detections: [
      { box: [200, 150, 380, 370], cls: 'Bọ gai', cls_id: 5, conf: 0.91 },
      { box: [420, 210, 580, 410], cls: 'Bọ gai', cls_id: 5, conf: 0.83 },
    ]
  }
];

export const MOCK_STATS: StatsResponse = {
  records: 48,
  by_source: {
    image: 28,
    video: 12,
    stream: 8
  },
  by_class: {
    'Rầy nâu': 65,
    'Sâu cuốn lá': 42,
    'Sâu đục thân': 23,
    'Bọ xít dài': 18,
    'Bọ trĩ': 31,
    'Bọ gai': 14
  },
  by_day: {
    '2026-10-28': { 'Rầy nâu': 8, 'Sâu cuốn lá': 4, 'Bọ trĩ': 5 },
    '2026-10-29': { 'Rầy nâu': 12, 'Sâu cuốn lá': 6, 'Sâu đục thân': 3 },
    '2026-10-30': { 'Rầy nâu': 15, 'Bọ xít dài': 4, 'Bọ gai': 2 },
    '2026-10-31': { 'Rầy nâu': 9, 'Sâu cuốn lá': 10, 'Bọ trĩ': 7 },
    '2026-11-01': { 'Rầy nâu': 11, 'Sâu đục thân': 8, 'Bọ trĩ': 6 },
    '2026-11-02': { 'Rầy nâu': 7, 'Sâu cuốn lá': 12, 'Bọ xít dài': 5 },
    '2026-11-03': { 'Rầy nâu': 3, 'Sâu đục thân': 4, 'Bọ gai': 5 }
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
    counts: { 'Rầy nâu': 5, 'Sâu cuốn lá': 3, 'Bọ xít dài': 2 },
    frames: [
      {
        frame: 30,
        time: 1.0,
        detections: [
          { box: [150, 120, 290, 280], cls: 'Rầy nâu', cls_id: 0, conf: 0.88 },
          { box: [400, 200, 520, 340], cls: 'Sâu cuốn lá', cls_id: 1, conf: 0.79 },
        ]
      },
      {
        frame: 90,
        time: 3.0,
        detections: [
          { box: [220, 180, 360, 340], cls: 'Rầy nâu', cls_id: 0, conf: 0.91 },
        ]
      },
      {
        frame: 150,
        time: 5.0,
        detections: [
          { box: [100, 90, 240, 260], cls: 'Bọ xít dài', cls_id: 3, conf: 0.85 },
          { box: [380, 160, 510, 310], cls: 'Sâu cuốn lá', cls_id: 1, conf: 0.74 },
        ]
      },
      {
        frame: 240,
        time: 8.0,
        detections: [
          { box: [180, 140, 310, 290], cls: 'Rầy nâu', cls_id: 0, conf: 0.82 },
          { box: [450, 220, 580, 380], cls: 'Rầy nâu', cls_id: 0, conf: 0.76 },
        ]
      },
      {
        frame: 360,
        time: 12.0,
        detections: [
          { box: [300, 170, 440, 320], cls: 'Bọ xít dài', cls_id: 3, conf: 0.90 },
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
  // Randomly pick 1 to 4 detections
  const possibleClasses = [
    { id: 0, name: 'Rầy nâu' },
    { id: 1, name: 'Sâu cuốn lá' },
    { id: 2, name: 'Sâu đục thân' },
    { id: 3, name: 'Bọ xít dài' },
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

