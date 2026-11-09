// 1:1 Translation Dictionary and Agricultural Knowledge Base for Rice Pests
// Standardized specifically for the user's YOLOv11 10-class dataset

import { SeverityLevel, RiskAssessment } from '../types';

export interface PestTranslationEntry {
  id: number;
  key: string;              // Normalized snake_case key
  en: string;               // English common name
  vi: string;               // Vietnamese standard name
  scientific: string;       // Scientific name
  aliases: string[];        // Model/dataset aliases
  severity: SeverityLevel;
  damageStages: string[];
  naturalEnemies: string[];
  symptoms: string;
  prevention: string;
  chemicals: string[];
  category: 'pest' | 'disease';
}

export const PEST_DICTIONARY: PestTranslationEntry[] = [
  {
    id: 0,
    key: 'rice_leaf_roller',
    en: 'Rice Leaf Roller',
    vi: 'Sâu cuốn lá lúa',
    scientific: 'Cnaphalocrocis medinalis',
    aliases: ['rice_leafroller', 'leaf_roller', 'leaf_folder', 'sau_cuon_la', 'sau_cuon_la_lua'],
    severity: 'high',
    damageStages: ['Đẻ nhánh rộ', 'Làm đòng', 'Trỗ le te'],
    naturalEnemies: ['Ong mắt đỏ (Trichogramma)', 'Bọ xít mù xanh (Cyrtorhinus lividipennis)', 'Nhện giăng'],
    symptoms: 'Sâu non nhả tơ cuốn mép lá lúa thành tổ hình ống tròn rồi ẩn nấp bên trong gặm ăn nhu mô lá, để lại màng biểu bì màu trắng bạc dọc phiến lá.',
    prevention: 'Không bón thừa phân đạm. Bón phân N-P-K cân đối theo từng thời kỳ. Vệ sinh sạch cỏ bờ ruộng. Bảo tồn thiên địch tự nhiên. Phun thuốc trừ sâu non tuổi 1-2 khi mật độ sâu trên 20 con/m² (giai đoạn đẻ nhánh) hoặc trên 10 con/m² (giai đoạn đòng trỗ).',
    chemicals: ['Emamectin benzoate', 'Indoxacarb', 'Chlorantraniliprole (Virtako 40WG)'],
    category: 'pest',
  },
  {
    id: 1,
    key: 'rice_leaf_caterpillar',
    en: 'Rice Leaf Caterpillar',
    vi: 'Sâu đo lúa / Sâu ăn lá lúa',
    scientific: 'Naranga aenescens',
    aliases: ['rice_leafcaterpillar', 'leaf_caterpillar', 'caterpillar', 'sau_do_lua', 'sau_an_la_lua'],
    severity: 'medium',
    damageStages: ['Mạ', 'Hồi xanh', 'Đẻ nhánh'],
    naturalEnemies: ['Nhện Lycosa', 'Bọ rùa đỏ', 'Kiến ba khoang', 'Bọ ngựa'],
    symptoms: 'Sâu non cắn khuyết mép lá lúa, trường hợp mật độ cao có thể cắn trụi toàn bộ phiến lá chỉ chừa lại gân chính, làm giảm diện tích quang hợp nghiêm trọng.',
    prevention: 'Vệ sinh đồng ruộng diệt sạch tàn dư cỏ dại trước mùa vụ. Bảo tồn các loài thiên địch ăn thịt trên ruộng. Khi sâu rộ gây hại nhiều chồi non, ưu tiên dùng chế phẩm sinh học Bt hoặc thuốc gốc thảo mộc.',
    chemicals: ['Bacillus thuringiensis (Bt)', 'Abamectin', 'Alpha-cypermethrin'],
    category: 'pest',
  },
  {
    id: 2,
    key: 'asiatic_rice_borer',
    en: 'Asiatic Rice Borer',
    vi: 'Sâu đục thân 5 vạch kẻ đầu nâu (hoặc Sâu đục thân bướm 2 chấm / Sâu đục thân châu Á)',
    scientific: 'Chilo suppressalis',
    aliases: [
      'striped_stem_borer',
      'striped_rice_borer',
      'asiatic_rice_borer',
      'sau_duc_than_5_vach',
      'sau_duc_than_5_vach_ke_dau_nau',
      'sau_duc_than_chau_a',
      'sau_duc_than_buom_2_cham'
    ],
    severity: 'critical',
    damageStages: ['Đẻ nhánh', 'Làm đòng', 'Trỗ bông'],
    naturalEnemies: ['Ong ký sinh trứng Trichogramma', 'Nấm xanh Metarhizium', 'Nấm trắng Beauveria'],
    symptoms: 'Sâu non đục vào bẹ rồi chui vào trong thân cắn đứt bó mạch dẫn dinh dưỡng. Ở thời kỳ đẻ nhánh làm dảnh lúa héo khô ("dảnh héo"); ở thời kỳ làm đòng - trỗ làm bông bạc trắng, hạt lép lửng hoàn toàn.',
    prevention: 'Cày lật gốc rạ ngâm nước ngay sau thu hoạch để diệt nhộng ẩn. Bố trí thời vụ gieo cấy tập trung né lứa bướm rộ. Đặt bẫy đèn theo dõi chu kỳ phát sinh. Phun phòng trừ ngay khi bướm rộ đẻ nhánh hoặc trước khi lúa trỗ 5-7 ngày.',
    chemicals: ['Chlorantraniliprole (Dupont Prevathon)', 'Cartap (Padan 95SP)', 'Fipronil'],
    category: 'pest',
  },
  {
    id: 3,
    key: 'yellow_rice_borer',
    en: 'Yellow Rice Borer',
    vi: 'Sâu đục thân bướm 2 chấm (Sâu đục thân màu vàng)',
    scientific: 'Scirpophaga incertulas',
    aliases: ['yellow_stem_borer', 'rice_stem_borer', 'stem_borer', 'sau_duc_than_buom_2_cham', 'sau_duc_than'],
    severity: 'critical',
    damageStages: ['Đẻ nhánh', 'Trỗ le te (5%)', 'Trỗ đều'],
    naturalEnemies: ['Ong mắt đỏ', 'Chuồn chuồn kim', 'Bọ cánh cứng Staphylinidae'],
    symptoms: 'Bướm cái màu vàng nhạt, giữa mỗi cánh trước có một chấm đen tròn nổi bật. Sâu non đục rỗng thân cây làm gãy gục lóng thân, bông lúa bạc trắng đứng thẳng không vào hạt được.',
    prevention: 'Ngắt ổ trứng sâu khi thăm đồng ở thời kỳ con gái. Thu hoạch lúa sát mặt đất. Khi phát hiện bướm rộ rộ đẻ rải rác hoặc mật độ ổ trứng trên 0.5 ổ/m², tiến hành phun thuốc đặc trị khi lúa bắt đầu trỗ le te.',
    chemicals: ['Virtako 40WG', 'Voliam Targo 063SC', 'Cartap hydrochloride'],
    category: 'pest',
  },
  {
    id: 4,
    key: 'rice_gall_midge',
    en: 'Rice Gall Midge',
    vi: 'Muỗi hành (Muỗi đầu nguyễn)',
    scientific: 'Orseolia oryzae',
    aliases: ['rice_gallmidge', 'gall_midge', 'muoi_hanh', 'sau_nan'],
    severity: 'high',
    damageStages: ['Mạ', 'Hồi xanh', 'Đẻ nhánh'],
    naturalEnemies: ['Ong ký sinh Platygaster oryzae', 'Nhện đất săn mồi'],
    symptoms: 'Ấu trùng xâm nhập vào đỉnh sinh trưởng của chồi non, kích thích bẹ lá biến dạng cuộn tròn lại thành ống rỗng màu trắng xám giống như "cọng hành" hay "ống năn". Chồi bị hại đui chột không thể trỗ bông.',
    prevention: 'Không sạ dày, không gieo cấy lúa gối vụ liên tục. Bón phân đạm vừa phải, bổ sung kali và silic tăng độ cứng bẹ lá. Giữ mực nước ruộng đều đặn. Rải thuốc hạt gốc lưu dẫn sớm ngay từ giai đoạn lúa mới đẻ nhánh.',
    chemicals: ['Thiamethoxam', 'Fipronil (Regent 0.3G rải gốc)', 'Carbosulfan'],
    category: 'pest',
  },
  {
    id: 5,
    key: 'brown_plant_hopper',
    en: 'Brown Plant Hopper',
    vi: 'Rầy nâu',
    scientific: 'Nilaparvata lugens',
    aliases: ['brown_planthopper', 'bph', 'ray_nau'],
    severity: 'critical',
    damageStages: ['Đẻ nhánh rộ', 'Làm đòng', 'Trỗ chín'],
    naturalEnemies: ['Bọ xít nước Microvelia', 'Bọ ba khoang Paederus', 'Nhện chân dài Tetragnatha'],
    symptoms: 'Tập trung thành cụm dày đặc ở phần gốc thân cây lúa chích hút nhựa, tạo ra các vết châm đen thối gốc. Khi mật độ tăng cao làm ruộng lúa vàng héo từng vòm rồi lan rộng gây hiện tượng "cháy rầy". Là môi giới lây truyền bệnh Vàng lùn - Lùn xoắn lá.',
    prevention: 'Thực hiện phương pháp gieo sạ đồng loạt né rầy theo thông báo bảo vệ thực vật địa phương. Không dùng giống nhiễm rầy nặng. Bảo tồn thiên địch. Duy trì mực nước ruộng khi rầy nở rộ. Phun thuốc đặc trị ức chế lột xác khi rầy non tuổi 1-2 đạt mật độ trên 3 con/dảnh.',
    chemicals: ['Triflumezopyrim (Pexena 106SC)', 'Pymetrozine (Chess 50WG)', 'Buprofezin (Applaud 10WP)'],
    category: 'pest',
  },
  {
    id: 6,
    key: 'white_backed_plant_hopper',
    en: 'White-backed Plant Hopper',
    vi: 'Rầy lưng trắng',
    scientific: 'Sogatella furcifera',
    aliases: ['whitebacked_planthopper', 'white_backed_planthopper', 'wbph', 'ray_lung_trang'],
    severity: 'high',
    damageStages: ['Mạ', 'Đẻ nhánh', 'Đòng trỗ'],
    naturalEnemies: ['Bọ xít mù xanh', 'Bọ rùa 8 chấm', 'Nhện sói Lycosa'],
    symptoms: 'Trên lưng ngực có vệt trắng rõ rệt. Rầy non và trưởng thành chích hút bẹ lá và gân lá làm ngọn lá khô xám, cây còi cọc. Là môi giới truyền bệnh virus Lùn sọc đen nguy hiểm.',
    prevention: 'Sử dụng hạt giống sạch bệnh đã xử lý thuốc trừ rầy. Kiểm tra thường xuyên mật độ ổ rầy non dưới gốc lúa. Vệ sinh sạch cỏ bờ ruộng nhất là cỏ lồng vực. Phun thuốc nội hấp lưu dẫn kịp thời khi rầy chớm xuất hiện.',
    chemicals: ['Dinotefuran (Oshin 20WP)', 'Clothianidin (Dantotsu 50WG)', 'Pymetrozine'],
    category: 'pest',
  },
  {
    id: 7,
    key: 'small_brown_plant_hopper',
    en: 'Small Brown Plant Hopper',
    vi: 'Rầy nâu nhỏ',
    scientific: 'Laodelphax striatellus',
    aliases: ['small_brown_planthopper', 'sbph', 'ray_nau_nho'],
    severity: 'medium',
    damageStages: ['Mạ', 'Đẻ nhánh'],
    naturalEnemies: ['Bọ cánh cộc', 'Nhện nhảy', 'Ong ký sinh họ Mymaridae'],
    symptoms: 'Kích thước nhỏ hơn rầy nâu thường, chích hút nhựa làm suy kiệt cây lúa ở giai đoạn đầu vụ và truyền bệnh virus sọc lá (Rice Stripe Virus).',
    prevention: 'Tiêu hủy tàn dư vụ trước và dọn sạch cỏ ký chủ phụ. Sử dụng bẫy dính màu vàng giám sát số lượng rầy di trú. Phun trừ bằng các nhóm thuốc ức chế thần kinh côn trùng.',
    chemicals: ['Imidacloprid (Confidor 100SL)', 'Acetamiprid', 'Buprofezin'],
    category: 'pest',
  },
  {
    id: 8,
    key: 'rice_water_weevil',
    en: 'Rice Water Weevil',
    vi: 'Súng nước hại lúa (hoặc Bọ vòi đôi hại lúa)',
    scientific: 'Lissorhoptrus oryzophilus',
    aliases: [
      'water_weevil',
      'rice_weevil',
      'rice_water_weevil',
      'sung_nuoc_hai_lua',
      'bo_voi_doi_hai_lua',
      'bo_voi_voi_hai_lua'
    ],
    severity: 'high',
    damageStages: ['Lúa cấy mới bén rễ', 'Đẻ nhánh'],
    naturalEnemies: ['Cá đồng', 'Bọ nước ăn thịt', 'Chuồn chuồn'],
    symptoms: 'Bọ trưởng thành có vòi gặm lá non tạo thành các rãnh trắng mỏng song song với gân lá. Ấu trùng sống ngập trong bùn cắn trụi rễ lúa làm cây lúa vàng còi, kém phát triển, dễ đổ ngã và nhổ bật rễ.',
    prevention: 'Áp dụng kỹ thuật tưới ngập khô xen kẽ (AWD) định kỳ để ấu trùng thiếu ẩm và khó di chuyển trong bùn. Xử lý hạt giống hoặc rải thuốc hạt xử lý đất khi gieo cấy ở vùng có tiền sử bọ vòi voi/bọ vòi đôi.',
    chemicals: ['Cruiser Plus 312.5FS (xử lý hạt giống)', 'Diazinon hạt', 'Cartap hạt'],
    category: 'pest',
  },
  {
    id: 9,
    key: 'rice_leafhopper',
    en: 'Rice Leafhopper',
    vi: 'Rầy xanh đuôi đen (Rầy lá lúa nói chung)',
    scientific: 'Nephotettix virescens',
    aliases: ['green_leafhopper', 'rice_leaf_hopper', 'leafhopper', 'ray_xanh_duoi_den', 'ray_la_lua'],
    severity: 'medium',
    damageStages: ['Đẻ nhánh', 'Làm đòng'],
    naturalEnemies: ['Bọ rùa', 'Chuồn chuồn cỏ', 'Ong ký sinh Gonatocerus'],
    symptoms: 'Thân màu xanh lục sáng, chóp cánh có đốm đen đậm. Thường bay nhảy chích hút trên phiến lá non làm đầu lá khô vàng từ chóp lá vào trong, truyền bệnh vàng lụi Tungro.',
    prevention: 'Bảo tồn đàn bọ rùa và ong ký sinh trứng. Dùng vợt bắt bọ xít/rầy lá lúc sáng sớm. Khi mật độ cao đe dọa lây truyền virus, phun các loại thuốc có tác dụng tiếp xúc và xông hơi nhanh.',
    chemicals: ['Thiamethoxam (Actara 25WG)', 'Fenobucarb (Bassa 50EC)', 'Nấm ký sinh Metarhizium anisopliae'],
    category: 'pest',
  },
];

// Helper to normalize strings for flexible lookup
function cleanStr(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

function removeAccents(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

/**
 * Finds a matching pest entry in dictionary from any input (ID, Vietnamese, English, or snake_case key)
 */
export function findPestEntry(
  rawInput: string | number,
  classesMap?: Record<string, string>
): PestTranslationEntry | null {
  if (rawInput === undefined || rawInput === null) return null;

  // 1. If numeric or index matching backend classes
  if (typeof rawInput === 'number' || /^\d+$/.test(String(rawInput).trim())) {
    const numId = Number(rawInput);
    const foundById = PEST_DICTIONARY.find((p) => p.id === numId);
    if (foundById) return foundById;

    // Check backend classes map if provided
    if (classesMap && classesMap[String(numId)]) {
      return findPestEntry(classesMap[String(numId)], classesMap);
    }
  }

  const str = String(rawInput).trim();
  const lower = str.toLowerCase();
  const cleaned = cleanStr(str);
  const noAccentCleaned = cleanStr(removeAccents(str));

  // 2. Direct exact match by key, en, vi, or aliases
  for (const item of PEST_DICTIONARY) {
    if (
      item.key === cleaned ||
      item.en.toLowerCase() === lower ||
      item.vi.toLowerCase() === lower ||
      cleanStr(removeAccents(item.vi)) === noAccentCleaned ||
      cleanStr(item.en) === cleaned ||
      item.aliases?.some((a) => cleanStr(a) === cleaned || cleanStr(a) === noAccentCleaned)
    ) {
      return item;
    }
  }

  // 3. Substring match
  for (const item of PEST_DICTIONARY) {
    const viNoAcc = cleanStr(removeAccents(item.vi));
    const enClean = cleanStr(item.en);
    if (
      cleaned.includes(item.key) ||
      item.key.includes(cleaned) ||
      enClean.includes(cleaned) ||
      cleaned.includes(enClean) ||
      viNoAcc.includes(noAccentCleaned) ||
      noAccentCleaned.includes(viNoAcc) ||
      item.aliases?.some((a) => cleaned.includes(cleanStr(a)) || cleanStr(a).includes(cleaned))
    ) {
      return item;
    }
  }

  // 4. Fallback heuristics for the 10 specific classes
  if (cleaned.includes('small') && (cleaned.includes('hopper') || noAccentCleaned.includes('ray'))) {
    return PEST_DICTIONARY[7];
  }
  if (cleaned.includes('white') && (cleaned.includes('hopper') || noAccentCleaned.includes('lung_trang'))) {
    return PEST_DICTIONARY[6];
  }
  if ((cleaned.includes('brown') && cleaned.includes('hopper')) || noAccentCleaned.includes('ray_nau')) {
    return PEST_DICTIONARY[5];
  }
  if (cleaned.includes('leafhopper') || noAccentCleaned.includes('ray_xanh')) {
    return PEST_DICTIONARY[9];
  }
  if (cleaned.includes('weevil') || noAccentCleaned.includes('sung_nuoc') || noAccentCleaned.includes('voi_voi')) {
    return PEST_DICTIONARY[8];
  }
  if (cleaned.includes('midge') || noAccentCleaned.includes('muoi_hanh') || noAccentCleaned.includes('nguyen')) {
    return PEST_DICTIONARY[4];
  }
  if (cleaned.includes('yellow') && (cleaned.includes('borer') || noAccentCleaned.includes('duc_than'))) {
    return PEST_DICTIONARY[3];
  }
  if (cleaned.includes('asiatic') || cleaned.includes('striped') || noAccentCleaned.includes('5_vach') || noAccentCleaned.includes('chau_a')) {
    return PEST_DICTIONARY[2];
  }
  if (cleaned.includes('caterpillar') || noAccentCleaned.includes('sau_do') || noAccentCleaned.includes('an_la')) {
    return PEST_DICTIONARY[1];
  }
  if (cleaned.includes('roller') || cleaned.includes('folder') || noAccentCleaned.includes('cuon_la')) {
    return PEST_DICTIONARY[0];
  }

  return null;
}

export type PestLanguageOption = 'vi' | 'en' | 'both';

/**
 * Returns formatted pest display name based on user's chosen language:
 * - 'vi': "Sâu cuốn lá lúa"
 * - 'en': "Rice Leaf Roller"
 * - 'both': "Sâu cuốn lá lúa (Rice Leaf Roller)"
 */
export function getPestDisplayName(
  rawInput: string | number,
  lang: PestLanguageOption = 'vi',
  classesMap?: Record<string, string>
): string {
  const entry = findPestEntry(rawInput, classesMap);
  if (!entry) {
    return String(rawInput);
  }

  if (lang === 'en') {
    return entry.en;
  }
  if (lang === 'both') {
    return `${entry.vi} (${entry.en})`;
  }
  return entry.vi;
}

/**
 * Evaluates outbreak risk level based on detected pests counts and severity
 */
export function evaluatePestRisk(counts: Record<string, number>): RiskAssessment {
  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);

  if (total === 0) {
    return {
      level: 'safe',
      title: 'Đồng ruộng an toàn',
      message: 'Không phát hiện cá thể sâu bệnh nào trong mẫu phân tích này.',
      color: '#10b981',
      bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300',
      recommendedAction: 'Tiếp tục duy trì quy trình chăm sóc thông thường và định kỳ kiểm tra ruộng 5-7 ngày/lần.',
    };
  }

  // Count critical pests
  let criticalCount = 0;
  let highCount = 0;

  for (const [key, count] of Object.entries(counts)) {
    const entry = findPestEntry(key);
    if (entry?.severity === 'critical') {
      criticalCount += count;
    } else if (entry?.severity === 'high') {
      highCount += count;
    }
  }

  if (criticalCount >= 3 || total >= 8) {
    return {
      level: 'critical',
      title: 'BÁO ĐỘNG ĐỎ: Nguy cơ bùng phát dịch',
      message: `Phát hiện ${total} cá thể sâu hại, trong đó có ${criticalCount} cá thể thuộc nhóm nguy cấp (Rầy nâu/Sâu đục thân). Nguy cơ gây cháy rầy hoặc bông bạc trắng đồng.`,
      color: '#ef4444',
      bg: 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300',
      recommendedAction: 'Cần khoanh vùng kiểm tra diện rộng ngay lập tức. Nếu mật độ vượt ngưỡng phòng trừ, sử dụng thuốc đặc trị lưu dẫn hoặc ức chế lột xác theo khuyến cáo IPM.',
    };
  }

  if (criticalCount >= 1 || highCount >= 3 || total >= 4) {
    return {
      level: 'warning',
      title: 'CẢNH BÁO: Mật độ sâu hại đang gia tăng',
      message: `Ghi nhận ${total} cá thể côn trùng gây hại. Cần theo dõi chặt chẽ vòng đời của ổ trứng và sâu non thế hệ kế tiếp.`,
      color: '#f59e0b',
      bg: 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300',
      recommendedAction: 'Thăm đồng 2-3 ngày/lần. Rút cạn nước ngắt quãng hoặc bổ sung phân kali, bảo vệ đàn thiên địch để kiểm soát tự nhiên.',
    };
  }

  return {
    level: 'low',
    title: 'Mức độ nhẹ: Xuất hiện rải rác',
    message: `Phát hiện ${total} cá thể côn trùng với mật độ thấp dưới ngưỡng gây hại kinh tế.`,
    color: '#3b82f6',
    bg: 'bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300',
    recommendedAction: 'Chưa cần xử lý thuốc hóa học để tránh tiêu diệt các loài thiên địch có ích (nhện, bọ ba khoang, bọ xít nước).',
  };
}
