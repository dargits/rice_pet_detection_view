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

export const MOCK_PESTS: PestInfo[] = [
  {
    cls_id: 0,
    cls: 'rice_leaf_roller',
    name: 'Sâu cuốn lá lúa (Rice Leaf Roller)',
    description: 'Sâu non nhả tơ kết mép lá lúa lại thành tổ hình ống tròn rồi ẩn nấp bên trong gặm ăn chất xanh diệp lục, chỉ chừa lại lớp biểu bì mỏng màu trắng xơ xác. Ruộng bị hại nặng trông trắng bạc, suy giảm nghiêm trọng khả năng quang hợp, làm hạt lép lửng.',
    prevention: 'Không bón thừa phân đạm. Bón phân cân đối N-P-K theo từng giai đoạn. Thường xuyên thăm đồng, khi phát hiện mật độ bướm rộ 4-6 ngày thì tiến hành phun trừ sâu non tuổi 1-2. Ưu tiên chế phẩm vi sinh Bacillus thuringiensis (Bt) hoặc thuốc có hoạt chất Indoxacarb, Emamectin benzoate, Chlorantraniliprole.'
  },
  {
    cls_id: 1,
    cls: 'rice_leaf_caterpillar',
    name: 'Sâu đo lúa / Sâu ăn lá lúa (Rice Leaf Caterpillar)',
    description: 'Sâu non ăn khuyết mép lá lúa, trường hợp mật độ cao có thể cắn trụi toàn bộ phiến lá chỉ chừa lại gân chính, đặc biệt nguy hại ở giai đoạn mạ và lúa đẻ nhánh. Sâu có tập tính di chuyển kiểu uốn cong mình như sâu đo.',
    prevention: 'Vệ sinh sạch cỏ dại bờ ruộng trước mùa vụ. Bảo tồn các loài thiên địch tự nhiên như nhện giăng, bọ rùa, ong ký sinh. Khi mật độ sâu cao vượt ngưỡng kinh tế, phun thuốc trừ sâu gốc sinh học hoặc các nhóm thuốc tiếp xúc, vị độc.'
  },
  {
    cls_id: 2,
    cls: 'asiatic_rice_borer',
    name: 'Sâu đục thân 5 vạch kẻ đầu nâu (hoặc Sâu đục thân bướm 2 chấm / Sâu đục thân châu Á)',
    description: 'Sâu non có 5 sọc nâu tím chạy dọc lưng, đầu màu nâu bóng. Chúng đục vào bẹ lá rồi chui vào trong thân cây lúa cắn đứt bó mạch dẫn nhựa. Gây ra hiện tượng dảnh héo ở thời kỳ đẻ nhánh và bông bạc hoàn toàn ở thời kỳ trỗ chín.',
    prevention: 'Sau thu hoạch cần cày lật đất và ngâm nước diệt nhộng ẩn trong gốc rạ. Bố trí thời vụ gieo cấy tập trung né lứa bướm rộ. Dùng bẫy đèn dự tính dự báo. Khi thấy dảnh héo rải rác hoặc trước trỗ 5-7 ngày phun thuốc có tính lưu dẫn thấm sâu.'
  },
  {
    cls_id: 3,
    cls: 'yellow_rice_borer',
    name: 'Sâu đục thân bướm 2 chấm (Yellow Rice Borer)',
    description: 'Bướm cái màu vàng nhạt, giữa mỗi cánh trước có một chấm đen rõ nét. Sâu non màu trắng sữa hoặc vàng nhạt, đục rỗng thân lúa làm gãy gục dảnh và bông bạc trắng xơ. Đây là một trong những loài dịch hại nguy hiểm và phổ biến nhất trên cây lúa.',
    prevention: 'Ngắt ổ trứng sâu khi thăm đồng lúc lúa con gái. Thu hoạch lúa sát mặt đất. Khi bướm rộ đẻ nhánh hoặc lúa bắt đầu trỗ le te (5%), phun các dòng thuốc đặc trị đục thân như Chlorantraniliprole, Cartap hoặc Fipronil.'
  },
  {
    cls_id: 4,
    cls: 'rice_gall_midge',
    name: 'Muỗi hành / Muỗi đầu nguyễn (Rice Gall Midge)',
    description: 'Muỗi có kích thước nhỏ như muỗi nhà, màu nâu vàng. Ấu trùng xâm nhập vào đỉnh sinh trưởng của chồi non, tiết dịch kích thích bẹ lá biến dạng cuộn tròn lại thành ống rỗng màu trắng xám gọi là "cọng hành" (ống năn). Chồi bị hại không trỗ bông được, cây đẻ nhiều chồi vô hiệu.',
    prevention: 'Không sạ quá dày. Giữ mực nước ruộng hợp lý, tránh để ruộng khô hạn kéo dài tạo điều kiện muỗi phát triển. Bón phân NPK cân đối, tránh thừa đạm. Phun hoặc rải thuốc hạt gốc lưu dẫn khi phát hiện lứa muỗi rộ ở giai đoạn đầu vụ.'
  },
  {
    cls_id: 5,
    cls: 'brown_plant_hopper',
    name: 'Rầy nâu (Brown Plant Hopper)',
    description: 'Rầy nâu trưởng thành và rầy non tập trung chích hút nhựa ở phần gốc thân cây lúa. Khi mật độ quá cao gây hiện tượng "cháy rầy" từng chòm rồi lan rộng cả ruộng. Đặc biệt nguy hiểm, rầy nâu là môi giới truyền hai bệnh virus nan y: Vàng lùn và Lùn xoắn lá.',
    prevention: 'Thực hiện chương trình "3 giảm 3 tăng", "1 phải 5 giảm". Gieo sạ né rầy đồng loạt theo lịch của ngành nông nghiệp. Bảo vệ thiên địch (bọ xít nước, nhện ăn thịt, bọ ba khoang). Khi mật độ trên 3 con/tép, phun các thuốc đặc trị ức chế lột xác (Pymetrozine, Buprofezin, Triflumezopyrim).'
  },
  {
    cls_id: 6,
    cls: 'white_backed_plant_hopper',
    name: 'Rầy lưng trắng (White-backed Plant Hopper)',
    description: 'Trên mảnh lưng ngực giữa có vệt trắng rõ rệt. Cả con trưởng thành và ấu trùng đều chích hút nhựa cây, làm lá lúa vàng úa, cây còi cọc và lùn tịt. Là véc-tơ truyền bệnh lùn sọc đen hại lúa rất khó cứu chữa.',
    prevention: 'Chọn giống kháng rầy hoặc giống xác nhận sạch bệnh. Thường xuyên vạch gốc lúa kiểm tra mật độ ổ rầy non. Xử lý thuốc đặc trị lưu dẫn kịp thời ngay khi phát hiện rầy mới nở tuổi 1-2.'
  },
  {
    cls_id: 7,
    cls: 'small_brown_plant_hopper',
    name: 'Rầy nâu nhỏ (Small Brown Plant Hopper)',
    description: 'Kích thước nhỏ hơn rầy nâu thường, cánh trong suốt hoặc có đốm mờ, sinh sống chủ yếu ở các vùng trồng lúa ôn đới và nhiệt đới. Chích hút làm suy kiệt cây lúa và là môi giới truyền bệnh sọc lá virus (Rice Stripe Virus).',
    prevention: 'Vệ sinh bờ ruộng sạch tàn dư ký chủ vụ trước. Thăm đồng định kỳ và sử dụng bẫy đèn vàng để giám sát mật độ bầy rầy di trú. Phun trừ bằng thuốc ức chế thần kinh côn trùng nhóm neonicotinoid hoặc pymetrozine.'
  },
  {
    cls_id: 8,
    cls: 'rice_water_weevil',
    name: 'Súng nước hại lúa (hoặc Bọ vòi đôi hại lúa)',
    description: 'Con trưởng thành là bọ vòi voi/bọ vòi đôi màu xám nâu gặm lá non tạo thành các rãnh trắng dọc phiến lá; ấu trùng chui xuống bùn cắn phá rễ lúa làm rễ cụt ngủn, cây lúa còi cọc, vàng úa, dễ đổ ngã và không hấp thụ được dinh dưỡng.',
    prevention: 'Rút cạn nước ruộng định kỳ (áp dụng tưới ngập khô xen kẽ - AWD) để hạn chế ấu trùng hô hấp và di chuyển dưới bùn. Xử lý hạt giống hoặc rải thuốc hạt xử lý đất khi gieo cấy ở vùng có tiền sử bọ vòi voi/bọ vòi đôi gây hại.'
  },
  {
    cls_id: 9,
    cls: 'rice_leafhopper',
    name: 'Rầy xanh đuôi đen / Rầy lá lúa (Rice Leafhopper)',
    description: 'Thân có màu xanh lục sáng, chóp cánh trước có đốm màu đen đặc trưng. Rầy di chuyển nhanh nhẹn, thường bay nhảy trên tán lá chích hút nhựa lá non và là môi giới truyền bệnh vàng lụi Tungro nguy hiểm.',
    prevention: 'Bảo tồn đàn bọ rùa và ong ký sinh trứng. Dùng vợt bắt bọ xít/rầy lá lúc sáng sớm. Khi mật độ cao đe dọa truyền bệnh virus, phun các loại thuốc có tác dụng tiếp xúc và xông hơi nhanh.'
  }
];

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
