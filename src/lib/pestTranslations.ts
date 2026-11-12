// 1:1 Translation Dictionary and Agricultural Knowledge Base for Rice Pests
// Standardized specifically for YOLOv11 10-class dataset with CLRRI (Viện Lúa ĐBSCL) IPM Standards

import { SeverityLevel, RiskAssessment } from '../types';

export interface NaturalEnemyItem {
  name: string;
  type: 'predator' | 'parasitoid' | 'pathogen'; // Ăn thịt, Ký sinh, Vi sinh vật gây bệnh
  description: string;
}

export interface ChemicalItem {
  active: string;
  tradeNames: string[];
  modeOfAction: string; // Cơ chế tác động (ức chế lột xác, lưu dẫn, tiếp xúc, v.v.)
  guideline: string;
}

export interface ClrriIpmGuideline {
  economicThreshold: string; // Ngưỡng phòng trừ kinh tế (ET)
  culturalMeasures: string;  // Biện pháp canh tác (1 Phải 5 Giảm, 3 Giảm 3 Tăng)
  waterManagement: string;   // Kỹ thuật điều tiết nước (AWD - Ngập khô xen kẽ)
  biologicalControl: string; // Biện pháp sinh thái & bảo tồn thiên địch
  chemicalStrategy: string;  // Nguyên tắc sử dụng thuốc (4 đúng, thời điểm phun)
}

export interface PestTranslationEntry {
  id: number;
  key: string;              // Normalized snake_case key
  en: string;               // English common name
  vi: string;               // Vietnamese standard name
  scientific: string;       // Scientific name
  aliases: string[];        // Model/dataset aliases
  severity: SeverityLevel;  // critical | high | medium | low
  vietnameseOtherNames: string[];
  morphology: string;       // Đặc điểm hình thái (kích thước, nhận dạng bướm/sâu non/rầy)
  lifecycle: string;        // Vòng đời sinh học (thời gian các pha)
  damageStages: string[];   // Giai đoạn lúa mẫn cảm nhất
  symptoms: string;         // Triệu chứng gây hại
  economicThreshold: string;// Ngưỡng phòng trừ kinh tế chuẩn Viện Lúa ĐBSCL
  naturalEnemies: string[]; // Danh sách ngắn thiên địch
  naturalEnemiesDetail: NaturalEnemyItem[]; // Chi tiết thiên địch
  chemicals: string[];      // Hoạt chất đặc trị chính
  chemicalDetails: ChemicalItem[]; // Chi tiết hoạt chất & thuốc thương phẩm
  clrriIpm: ClrriIpmGuideline;     // Hướng dẫn IPM chuẩn Viện Lúa ĐBSCL
  prevention: string;       // Tóm tắt khuyến nghị
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
    vietnameseOtherNames: ['Sâu cuốn lá nhỏ', 'Sâu xếp lá lúa', 'Sâu cuốn mép lá'],
    morphology: 'Trưởng thành là bướm nhỏ dài 8-10mm, sải cánh 16-19mm, màu vàng nâu óng ánh; mép ngoài cánh trước và cánh sau có dải viền màu nâu xám đậm, giữa cánh có 3 đường vân gợn sóng màu nâu rõ rệt. Sâu non tuổi 5 dài 15-19mm, thân màu xanh lá mạ hoặc xanh vàng óng ánh, rất nhanh nhẹn, khi đụng vào thường thụt lùi hoặc nhả tơ đu mình xuống.',
    lifecycle: 'Vòng đời kéo dài 28 - 35 ngày (Trứng: 4 - 6 ngày; Sâu non: 15 - 18 ngày gồm 5 tuổi; Nhộng: 6 - 8 ngày; Bướm sống 5 - 7 ngày, một bướm cái có thể đẻ 60 - 120 quả trứng rải rác trên mặt lá).',
    damageStages: ['Cuối đẻ nhánh', 'Làm đòng', 'Trỗ le te (5%)'],
    symptoms: 'Sâu non nhả tơ cuốn 2 mép lá lúa lại thành tổ hình ống tròn dài, nằm ẩn bên trong gặm ăn lớp nhu mô diệp lục, chỉ chừa lại lớp màng biểu bì mỏng màu trắng bạc dọc phiến lá. Ruộng bị hại nặng trông trắng xơ xác ("cháy bạc lá"), làm suy giảm nghiêm trọng diện tích quang hợp nuôi đòng và hạt lúa.',
    economicThreshold: 'Giai đoạn đẻ nhánh (dưới 40 ngày sau sạ): > 20 con/m² (lúa có khả năng tự đền bù lá mới). Giai đoạn đòng - trỗ: > 10 con/m² hoặc > 5% lá đòng bị hại có sâu non còn sống.',
    naturalEnemies: ['Ong mắt đỏ (Trichogramma)', 'Bọ xít mù xanh (Cyrtorhinus lividipennis)', 'Nhện sói (Lycosa)', 'Kiến ba khoang (Paederus)'],
    naturalEnemiesDetail: [
      { name: 'Ong mắt đỏ (Trichogramma chilonis)', type: 'parasitoid', description: 'Ký sinh và tiêu diệt trứng sâu non với tỷ lệ tự nhiên có thể đạt tới 50-70%.' },
      { name: 'Bọ xít mù xanh (Cyrtorhinus lividipennis)', type: 'predator', description: 'Tìm kiếm và chích hút trứng sâu, sâu non tuổi 1-2.' },
      { name: 'Nhện sói (Lycosa pseudoannulata)', type: 'predator', description: 'Săn bắt bướm trưởng thành và sâu non khi chúng di chuyển chuyển tổ lá.' },
      { name: 'Kiến ba khoang (Paederus fuscipes)', type: 'predator', description: 'Ăn thịt sâu non trên tán lá lúa vào ban ngày.' }
    ],
    chemicals: ['Emamectin benzoate', 'Indoxacarb', 'Chlorantraniliprole (Virtako 40WG)', 'Spinetoram (Radiant 60SC)'],
    chemicalDetails: [
      { active: 'Chlorantraniliprole', tradeNames: ['Virtako 40WG', 'Prevathon 5SC'], modeOfAction: 'Kích hoạt thụ thể ryanodine, làm cơ sâu co cứng ngừng ăn sau vài giờ và chết khô.', guideline: 'Phun khi sâu non tuổi 1-2 mới nở rộ (sau bướm rộ 4-6 ngày). Liều 25g/bình 25L.' },
      { active: 'Indoxacarb', tradeNames: ['Ammate 150SC', 'Tricho 150SC'], modeOfAction: 'Khóa kênh ion natri trong tế bào thần kinh, làm sâu tê liệt.', guideline: 'Hiệu quả diệt sâu tuổi 2-3 mạnh, ít ảnh hưởng thiên địch.' },
      { active: 'Spinetoram', tradeNames: ['Radiant 60SC'], modeOfAction: 'Thuốc trừ sâu sinh học lên men từ vi khuẩn Saccharopolyspora spinosa, an toàn sinh thái.', guideline: 'Dùng liều 15-20ml/bình 25L khi sâu chớm cuốn mép lá.' }
    ],
    clrriIpm: {
      economicThreshold: 'Không phun thuốc ở giai đoạn 40 ngày đầu sau sạ. Chỉ phun ở giai đoạn làm đòng khi mật độ > 10 con/m².',
      culturalMeasures: 'Thực hiện "1 Phải 5 Giảm", gieo sạ mật độ 80-100 kg/ha. Bón phân đạm theo bảng so màu lá lúa LCC, tuyệt đối không bón thừa đạm làm lá xanh mướt dẫn dụ bướm rộ.',
      waterManagement: 'Điều tiết nước "Ngập - Khô xen kẽ" (AWD) để bộ rễ lúa ăn sâu, cây lúa cứng cáp kháng sâu.',
      biologicalControl: 'Trồng dải hoa bờ ruộng (hoa cúc xuyến chi, mè, hoa mười giờ, hướng dương) nuôi dưỡng ong mắt đỏ và nhện săn mồi.',
      chemicalStrategy: 'Chỉ can thiệp khi mật độ vượt ngưỡng kinh tế. Phun thuốc vào sáng sớm ráo sương hoặc chiều mát, phun khi sâu còn tuổi 1-2.'
    },
    prevention: 'Tuân thủ nghiêm ngặt nguyên tắc: Không phun thuốc trừ sâu cuốn lá trong 40 ngày đầu sau sạ để bảo vệ đàn thiên địch. Gieo sạ né bướm rộ, bón phân đạm cân đối. Khi lúa làm đòng nếu mật độ sâu non tuổi 1-2 vượt quá 10 con/m² thì phun thuốc đặc trị thế hệ mới.',
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
    vietnameseOtherNames: ['Sâu đo xanh ăn lá lúa', 'Sâu róm ăn lá', 'Green Semilooper'],
    morphology: 'Trưởng thành là bướm đêm nhỏ sải cánh 18-22mm, cánh trước màu vàng rơm hoặc nâu sáng, có hai dải sọc xiên màu nâu đỏ. Sâu non màu xanh lục tươi bóng, có các sọc trắng nhạt chạy dọc theo lưng; chỉ có 3 đôi chân bụng nên di chuyển theo kiểu co cong mình lại rồi duỗi thẳng như đo thước.',
    lifecycle: 'Vòng đời khoảng 24 - 32 ngày (Trứng: 3 - 5 ngày; Sâu non: 14 - 18 ngày; Nhộng: 5 - 7 ngày; Bướm sống 4 - 6 ngày đẻ trứng thành hàng dài trên phiến lá lúa).',
    damageStages: ['Mạ', 'Hồi xanh', 'Đẻ nhánh'],
    symptoms: 'Sâu non cắn khuyết mép lá non từ ngoài vào trong, mật độ cao có thể cắn trụi toàn bộ phiến lá chỉ chừa lại gân chính, đặc biệt nguy hại ở ruộng trũng hoặc ruộng bón thừa đạm.',
    economicThreshold: 'Mật độ sâu non trên 25 con/m² ở thời kỳ đẻ nhánh hoặc trên 10 con/m² ở thời kỳ đòng trỗ.',
    naturalEnemies: ['Nhện sói Lycosa', 'Kiến ba khoang', 'Bọ rùa đỏ 8 chấm', 'Bọ ngựa', 'Nấm Beauveria'],
    naturalEnemiesDetail: [
      { name: 'Nhện sói (Lycosa)', type: 'predator', description: 'Săn bắt sâu non bò trên mặt đất hoặc gốc lúa.' },
      { name: 'Kiến ba khoang (Paederus fuscipes)', type: 'predator', description: 'Tấn công và ăn thịt sâu non trên tán lá.' },
      { name: 'Bọ rùa đỏ (Micraspis discolor)', type: 'predator', description: 'Ăn các ổ trứng và sâu non tuổi 1.' }
    ],
    chemicals: ['Bacillus thuringiensis (Bt)', 'Abamectin (Brightin 4.0EC)', 'Alpha-cypermethrin (Fastac 5EC)', 'Cartap (Padan 95SP)'],
    chemicalDetails: [
      { active: 'Bacillus thuringiensis (Bt)', tradeNames: ['Delfin WG', 'Bitadin'], modeOfAction: 'Chế phẩm vi sinh tạo tinh thể độc phá hủy đường ruột sâu non, an toàn tuyệt đối cho người và thiên địch.', guideline: 'Phun khi sâu non tuổi 1-2, phun vào buổi chiều mát.' },
      { active: 'Abamectin', tradeNames: ['Reasgant 3.6EC', 'Brightin 4.0EC'], modeOfAction: 'Tác động lên hệ thần kinh thụ thể GABA của sâu, hiệu lực tiếp xúc và vị độc.', guideline: 'Pha 10-15ml/bình 25L, phun ướt đều tán lá.' }
    ],
    clrriIpm: {
      economicThreshold: 'Chỉ phòng trừ khi mật độ sâu trên 25 con/m² làm giảm trên 20% diện tích tán lá ở giai đoạn đẻ nhánh.',
      culturalMeasures: 'Vệ sinh sạch cỏ bờ ruộng trước khi gieo cấy. Bón phân N-P-K cân đối.',
      waterManagement: 'Duy trì lớp nước mỏng 3-5cm ở giai đoạn đẻ nhánh để hỗ trợ thiên địch thủy sinh.',
      biologicalControl: 'Ưu tiên sử dụng chế phẩm vi sinh Bt hoặc nấm trắng Beauveria để bảo vệ nhện và bọ rùa.',
      chemicalStrategy: 'Chỉ dùng thuốc hóa học khi sâu bộc phát diện rộng cắn trụi đọt non.'
    },
    prevention: 'Dọn sạch cỏ dại bờ ruộng trước mùa vụ để cắt nguồn ký chủ phụ. Bảo tồn các loài nhện và bọ rùa trên ruộng. Nếu sâu non phát triển rộ làm mất diện tích lá trên 20%, ưu tiên sử dụng chế phẩm sinh học Bt hoặc Abamectin.',
    category: 'pest',
  },
  {
    id: 2,
    key: 'asiatic_rice_borer',
    en: 'Asiatic Rice Borer',
    vi: 'Sâu đục thân 5 vạch kẻ đầu nâu',
    scientific: 'Chilo suppressalis',
    aliases: ['striped_stem_borer', 'striped_rice_borer', 'asiatic_rice_borer', 'sau_duc_than_5_vach', 'sau_duc_than_5_vach_ke_dau_nau', 'sau_duc_than_chau_a', 'sau_duc_than_buom_2_cham'],
    severity: 'critical',
    vietnameseOtherNames: ['Sâu đục thân 5 vạch', 'Sâu đục thân sọc nâu', 'Striped Stem Borer'],
    morphology: 'Trưởng thành là bướm màu vàng rơm hoặc nâu nhạt dài 10-13mm, mép ngoài cánh trước có hàng chấm đen li ti chạy dọc. Trứng đẻ thành ổ hình bầu dục xếp vảy cá trên bẹ lá lúa. Sâu non có đầu màu nâu bóng hoặc đỏ hung, trên lưng có 5 vạch sọc dọc màu nâu tím rõ rệt chạy suốt chiều dài thân.',
    lifecycle: 'Vòng đời từ 35 - 50 ngày (Trứng: 5 - 7 ngày; Sâu non: 20 - 30 ngày gồm 5-6 tuổi; Nhộng: 6 - 9 ngày; Bướm sống 4 - 7 ngày đẻ 100 - 200 trứng).',
    damageStages: ['Đẻ nhánh rộ', 'Làm đòng', 'Trỗ chín'],
    symptoms: 'Sâu non đục vào bẹ lá rồi chui vào trong thân cây cắn đứt các bó mạch dẫn nhựa và mô phân sinh. Giai đoạn đẻ nhánh gây hiện tượng "dảnh héo" (chồi tim khô héo, dễ rút lên). Giai đoạn làm đòng - trỗ gây "bông bạc" (bông lúa khô trắng, hạt lép lửng hoàn toàn, đứng thẳng xơ xác).',
    economicThreshold: 'Giai đoạn đẻ nhánh: Tỷ lệ dảnh héo > 5%. Giai đoạn làm đòng - trỗ: Mật độ ổ trứng > 0.5 ổ/m² trước khi lúa trỗ 5-7 ngày.',
    naturalEnemies: ['Ong ký sinh Trichogramma', 'Ong ký sinh Telenomus', 'Nấm xanh Metarhizium', 'Nấm trắng Beauveria'],
    naturalEnemiesDetail: [
      { name: 'Ong ký sinh trứng (Trichogramma & Telenomus)', type: 'parasitoid', description: 'Đẻ trứng vào ổ trứng sâu đục thân, diệt sạch mầm sâu non từ trong trứng.' },
      { name: 'Ong ký sinh sâu non (Bracon onukii)', type: 'parasitoid', description: 'Ký sinh bên trong sâu non nằm trong thân lúa.' },
      { name: 'Nấm xanh (Metarhizium)', type: 'pathogen', description: 'Ký sinh làm sâu non cứng đờ và mọc sợi nấm xanh chết.' }
    ],
    chemicals: ['Chlorantraniliprole (Prevathon 5SC, Virtako 40WG)', 'Cartap (Padan 95SP)', 'Fipronil (Regent 800WG)', 'Flubendiamide (Takumi 20WG)'],
    chemicalDetails: [
      { active: 'Chlorantraniliprole', tradeNames: ['Prevathon 5SC', 'Virtako 40WG'], modeOfAction: 'Thuốc nội hấp lưu dẫn cực mạnh, thấm sâu vào thân lúa tiêu diệt sâu non bên trong lóng.', guideline: 'Phun đón trước trỗ 5-7 ngày khi bướm rộ đẻ trứng. Liều 20-25ml/bình 25L.' },
      { active: 'Cartap hydrochloride', tradeNames: ['Padan 95SP', 'Gà Nòi 95SP'], modeOfAction: 'Ức chế dẫn truyền thần kinh cơ, diệt cả trứng, sâu non và bướm.', guideline: 'Pha 30g/bình 25L, phun khi thấy bướm rộ 3-4 ngày.' }
    ],
    clrriIpm: {
      economicThreshold: 'Phun phòng khi mật độ ổ trứng > 0.5 ổ/m² hoặc bướm rộ ở thời kỳ lúa ôm đòng.',
      culturalMeasures: 'Cày lật gốc rạ ngâm nước ngay sau khi gặt vụ trước để diệt nhộng ẩn. Xuống giống né lứa bướm rộ.',
      waterManagement: 'Điều tiết mực nước ruộng để hạn chế sâu non di chuyển giữa các dảnh lúa.',
      biologicalControl: 'Bảo tồn ong mắt đỏ bằng cách trồng hoa cúc xuyến chi và mè trên bờ ruộng.',
      chemicalStrategy: 'Thời điểm phun quyết định nhất: Phun trước khi lúa trỗ 5-7 ngày (khi lúa trỗ le te 3-5%) để diệt sâu non tuổi 1 trước khi chúng chui vào cổ bông.'
    },
    prevention: 'Cày ải phơi đất và ngâm dầm gốc rạ sau thu hoạch diệt nhộng. Bố trí thời vụ gieo cấy né lứa bướm rộ. Đặt bẫy đèn theo dõi chu kỳ vũ hóa. Phun thuốc lưu dẫn thấm sâu ngay khi bướm rộ hoặc trước khi lúa trỗ 5-7 ngày.',
    category: 'pest',
  },
  {
    id: 3,
    key: 'yellow_rice_borer',
    en: 'Yellow Rice Borer',
    vi: 'Sâu đục thân bướm 2 chấm',
    scientific: 'Scirpophaga incertulas',
    aliases: ['yellow_stem_borer', 'rice_stem_borer', 'stem_borer', 'sau_duc_than_buom_2_cham', 'sau_duc_than'],
    severity: 'critical',
    vietnameseOtherNames: ['Sâu đục thân bướm hai chấm', 'Sâu đục thân màu vàng', 'Yellow Stem Borer'],
    morphology: 'Bướm cái màu vàng nhạt hoặc vàng rơm, ở giữa mỗi cánh trước có một chấm đen tròn rất rõ nét, cuối bụng có chùm lông màu vàng sáp; bướm đực nhỏ hơn, cánh màu xám tro. Trứng đẻ thành ổ tròn phủ lớp lông màu vàng nâu. Sâu non màu trắng sữa hoặc vàng nhạt, đầu màu nâu nhạt, thân trơn không sọc.',
    lifecycle: 'Vòng đời từ 38 - 45 ngày (Trứng: 6 - 8 ngày; Sâu non: 22 - 28 ngày gồm 5 tuổi; Nhộng: 7 - 10 ngày; Bướm sống 4 - 6 ngày đẻ 100 - 150 trứng).',
    damageStages: ['Đẻ nhánh', 'Trỗ le te (3-5%)', 'Trỗ đều'],
    symptoms: 'Là loài chuyên tính hẹp trên cây lúa. Sâu non cắn phá cổ bông và đục rỗng thân lóng, làm gãy gục lóng thân, tạo dảnh héo thời kỳ con gái và gây hiện tượng "bông bạc trắng xơ xác" thời kỳ trỗ, làm thất thu năng suất từ 30% đến 80%.',
    economicThreshold: 'Mật độ ổ trứng > 0.5 ổ/m² hoặc xuất hiện bướm rộ ở giai đoạn lúa làm đòng đến trỗ le te.',
    naturalEnemies: ['Ong mắt đỏ (Trichogramma)', 'Chuồn chuồn kim', 'Bọ cánh cứng Staphylinidae', 'Nấm Beauveria'],
    naturalEnemiesDetail: [
      { name: 'Ong mắt đỏ (Trichogramma)', type: 'parasitoid', description: 'Ký sinh ổ trứng sâu đục thân bướm hai chấm cực kỳ hiệu quả.' },
      { name: 'Chuồn chuồn săn mồi', type: 'predator', description: 'Bắt và ăn bướm trưởng thành bay trên ruộng lúa.' }
    ],
    chemicals: ['Virtako 40WG', 'Voliam Targo 063SC', 'Cartap hydrochloride (Padan 95SP)', 'Chlorantraniliprole (Prevathon 5SC)'],
    chemicalDetails: [
      { active: 'Virtako 40WG', tradeNames: ['Virtako 40WG (Syngenta)'], modeOfAction: 'Phối hợp kép Chlorantraniliprole + Thiamethoxam, vừa lưu dẫn diệt sâu vừa bảo vệ chồi non.', guideline: 'Gói 3g/bình 16L hoặc 4.5g/bình 25L, phun đón đòng và trỗ le te.' },
      { active: 'Voliam Targo 063SC', tradeNames: ['Voliam Targo 063SC'], modeOfAction: 'Kết hợp Chlorantraniliprole + Abamectin, thấm sâu xông hơi diệt triệt để.', guideline: 'Phun khi lúa trỗ 3-5%.' }
    ],
    clrriIpm: {
      economicThreshold: 'Phát hiện bướm rộ 4-5 ngày trước trỗ hoặc mật độ ổ trứng trên 0.5 ổ/m².',
      culturalMeasures: 'Ngắt tiêu hủy ổ trứng khi thăm đồng ở thời kỳ lúa đẻ nhánh. Cắt sát gốc rạ khi thu hoạch.',
      waterManagement: 'Giữ mực nước ruộng ổn định 3-5cm khi phun thuốc để tăng hiệu quả lưu dẫn.',
      biologicalControl: 'Duy trì thảm hoa bờ ruộng để tạo mật phấn cho ong ký sinh trứng.',
      chemicalStrategy: 'Phun thuốc đúng thời điểm then chốt: Lúa bắt đầu trỗ lẹt xẹt (3-5% bông trỗ) để thuốc bao phủ cổ bông trước khi sâu non kịp đục vào trong.'
    },
    prevention: 'Ngắt ổ trứng khi thăm đồng. Thu hoạch sát mặt đất. Khi phát hiện bướm rộ rải rác hoặc mật độ ổ trứng trên 0.5 ổ/m², tiến hành phun thuốc đặc trị lưu dẫn khi lúa bắt đầu trỗ le te.',
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
    vietnameseOtherNames: ['Muỗi năn lúa', 'Sâu năn hại lúa', 'Rice Gall Midge'],
    morphology: 'Trưởng thành là loài muỗi nhỏ mảnh khảnh như muỗi nhà dài 3-5mm, chân dài, màu nâu vàng hoặc cam đỏ (muỗi cái bụng to màu đỏ cam chứa nhiều trứng). Ấu trùng (dòi) không chân, màu trắng đục sau chuyển vàng nhạt, đầu tù. Nhộng nằm trong ống hành.',
    lifecycle: 'Vòng đời ngắn khoảng 21 - 28 ngày (Trứng: 3 - 4 ngày; Ấu trùng: 10 - 14 ngày; Nhộng: 4 - 6 ngày; Muỗi trưởng thành sống 2 - 4 ngày đẻ 100 - 200 trứng rải rác trên bẹ lá).',
    damageStages: ['Mạ', 'Hồi xanh', 'Đẻ nhánh (15-30 ngày sau sạ)'],
    symptoms: 'Ấu trùng xâm nhập vào chóp đỉnh sinh trưởng của chồi non, tiết độc tố kích thích bẹ lá biến dạng phình to và cuộn tròn lại thành ống rỗng màu trắng ngà gọi là "cọng hành" hay "ống năn". Chồi bị hại đui chột không thể trỗ bông; cây lúa phản ứng lại bằng cách đẻ nhiều chồi vô hiệu, ruộng còi cọc và lùn tịt.',
    economicThreshold: 'Tỷ lệ ống hành > 10% ở giai đoạn lúa 20 - 30 ngày sau sạ.',
    naturalEnemies: ['Ong ký sinh Platygaster oryzae', 'Ong Neanastatus cinctiventris', 'Nhện đất săn mồi'],
    naturalEnemiesDetail: [
      { name: 'Ong ký sinh Platygaster oryzae', type: 'parasitoid', description: 'Loài thiên địch quan trọng nhất, tỷ lệ ký sinh ấu trùng muỗi hành trong tự nhiên có thể đạt 60-80%.' },
      { name: 'Ong ký sinh Neanastatus', type: 'parasitoid', description: 'Ký sinh nhộng muỗi hành bên trong ống năn.' }
    ],
    chemicals: ['Thiamethoxam (Actara 25WG)', 'Fipronil (Regent 0.3G rải gốc)', 'Carbosulfan (Marshal 5G)', 'Dinotefuran (Oshin 20WP)'],
    chemicalDetails: [
      { active: 'Fipronil hạt', tradeNames: ['Regent 0.3G', 'Rambo hạt'], modeOfAction: 'Thuốc dạng hạt rải gốc lưu dẫn từ rễ lên chồi non, diệt ấu trùng khi mới xâm nhập đỉnh sinh trưởng.', guideline: 'Rải 1kg/công (1000m²) ở giai đoạn 15-20 ngày sau sạ khi thấy muỗi rộ.' },
      { active: 'Thiamethoxam', tradeNames: ['Actara 25WG'], modeOfAction: 'Thuốc nội hấp nhanh, lưu dẫn cực mạnh lên các mô non đỉnh sinh trưởng.', guideline: 'Phun phòng trừ sớm khi muỗi vào bẫy đèn rộ.' }
    ],
    clrriIpm: {
      economicThreshold: 'Can thiệp thuốc trước khi ống hành xuất hiện (lúc muỗi rộ vào đèn). Khi ống hành đã vươn dài ra ngoài thì muỗi đã bay đi, phun lúc này không còn hiệu quả!',
      culturalMeasures: 'Không gieo cấy lúa gối vụ liên tục. Cày ải phơi đất ít nhất 3 tuần cách ly giữa 2 vụ. Sạ thưa 80-100 kg/ha.',
      waterManagement: 'Giữ mực nước ruộng đều đặn 3-5cm, tránh để ruộng khô hạn nứt nẻ thu hút muỗi hành đẻ trứng.',
      biologicalControl: 'Bảo vệ đàn ong ký sinh Platygaster bằng cách không phun thuốc trừ sâu phổ rộng sớm.',
      chemicalStrategy: 'Bón bổ sung Canxi, Silic và phân Kali để bẹ lá cứng chắc, ngăn ấu trùng muỗi đục vào đỉnh sinh trưởng.'
    },
    prevention: 'Không sạ dày, không gieo lúa gối vụ liên tục. Bón phân N-P-K cân đối, bổ sung lân, kali và silic tăng độ cứng bẹ lá. Thăm đồng sớm từ 15-25 ngày sau sạ, phát hiện muỗi rộ bẫy đèn thì rải thuốc hạt lưu dẫn ngay. Lưu ý: Khi ống hành đã vươn dài thì muỗi đã vũ hóa bay đi, tuyệt đối không phun thuốc hóa học lúc này.',
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
    vietnameseOtherNames: ['Rầy nâu hại lúa', 'BPH', 'Rầy cám (ấu trùng)'],
    morphology: 'Trưởng thành dài 3.5 - 4.5mm, màu nâu sẫm đến nâu đen óng, có hai dạng cánh: cánh dài (di trú tìm bãi ăn) và cánh ngắn (sinh sản tại chỗ cực nhanh). Trứng hình quả chuối cong, đẻ cắm thành ổ xếp vảy cá bên trong bẹ lá lúa. Rầy non (5 tuổi) màu xám nâu đến nâu sẫm, tập trung dày đặc ở gốc thân sát mặt nước.',
    lifecycle: 'Vòng đời 25 - 30 ngày (Trứng: 6 - 8 ngày; Rầy non: 12 - 15 ngày; Rầy trưởng thành sống 10 - 15 ngày, rầy cái đẻ từ 150 đến 350 quả trứng).',
    damageStages: ['Đẻ nhánh rộ', 'Làm đòng', 'Trỗ chín'],
    symptoms: 'Rầy non và trưởng thành chích hút nhựa ở phần gốc thân và bẹ lá lúa, tiết chất độc làm thối gốc. Mật độ cao làm ruộng lúa vàng héo rũ từ dưới lên, tạo thành các vệt "cháy rầy" từng chòm rồi lan nhanh cả cánh đồng. Đặc biệt, rầy nâu là môi giới truyền 2 bệnh virus nan y: Bệnh Vàng lùn và Lùn xoắn lá.',
    economicThreshold: 'Giai đoạn đẻ nhánh: > 3 con/tép (dảnh). Giai đoạn đòng - trỗ: > 2 - 3 con/dảnh (hoặc > 2.000 con/m² rầy non tuổi 2-3).',
    naturalEnemies: ['Bọ xít nước (Microvelia)', 'Kiến ba khoang (Paederus)', 'Nhện chân dài (Tetragnatha)', 'Bọ xít mù xanh (Cyrtorhinus)', 'Nấm xanh Metarhizium'],
    naturalEnemiesDetail: [
      { name: 'Bọ xít nước (Microvelia douglasi)', type: 'predator', description: 'Trượt trên mặt nước ruộng, 1 con ăn 5-8 rầy non mỗi ngày.' },
      { name: 'Bọ xít mù xanh (Cyrtorhinus lividipennis)', type: 'predator', description: 'Chích hút khô các ổ trứng rầy nâu trong bẹ lá.' },
      { name: 'Kiến ba khoang (Paederus fuscipes)', type: 'predator', description: 'Săn bắt rầy trưởng thành và rầy non dưới gốc lúa.' },
      { name: 'Nấm xanh (Metarhizium anisopliae)', type: 'pathogen', description: 'Gây bệnh nấm xanh làm rầy chết cứng bám trên bẹ lá.' }
    ],
    chemicals: ['Triflumezopyrim (Pexena 106SC)', 'Pymetrozine (Chess 50WG)', 'Buprofezin (Applaud 10WP)', 'Fenobucarb (Bassa 50EC)', 'Dinotefuran (Oshin 20WP)'],
    chemicalDetails: [
      { active: 'Triflumezopyrim', tradeNames: ['Pexena 106SC'], modeOfAction: 'Thuốc thế hệ mới nhất tác động vào thụ thể nicotinic acetylcholine, diệt cả rầy non và rầy trưởng thành, hiệu lực kéo dài 21 ngày, an toàn cho thiên địch.', guideline: 'Pha 15ml/bình 25L. Phun khi rầy cám nở rộ tuổi 1-2.' },
      { active: 'Pymetrozine', tradeNames: ['Chess 50WG'], modeOfAction: 'Làm rầy tê liệt vòi hút ngay lập tức, rầy không chích hút được nữa và chết đói sau vài ngày.', guideline: 'Gói 15g/bình 25L, hiệu lực lưu dẫn kéo dài.' },
      { active: 'Buprofezin', tradeNames: ['Applaud 10WP', 'Butyl 10WP'], modeOfAction: 'Ức chế tổng hợp chitin, làm rầy non không lột xác được và chết, làm ung trứng rầy cái.', guideline: 'Phun khi rầy non tuổi 1-2 chiếm đa số, pha 30-40g/bình 25L.' }
    ],
    clrriIpm: {
      economicThreshold: 'Chỉ can thiệp thuốc khi rầy cám (tuổi 1-2) đạt mật độ trên 3 con/tép. Không phun khi chỉ có rầy cánh dài di trú.',
      culturalMeasures: 'Thực hiện lịch xuống giống "Né rầy" đồng loạt theo khuyến cáo địa phương. Không bón thừa đạm (thừa đạm làm rầy đẻ trứng gấp 3 lần).',
      waterManagement: 'Áp dụng tưới "Ngập - Khô xen kẽ" (AWD) để gốc lúa thông thoáng, thiên địch dễ săn mồi.',
      biologicalControl: 'Trồng hoa bờ ruộng dẫn dụ bọ xít mù xanh và nhện. Tuyệt đối không phun thuốc phổ rộng trong 40 ngày đầu.',
      chemicalStrategy: 'Khi phun thuốc rầy, bắt buộc phải hạ thấp vòi phun sát gốc thân lúa hoặc tháo bớt nước ruộng để thuốc tiếp xúc trực tiếp ổ rầy.'
    },
    prevention: 'Xuống giống đồng loạt né rầy theo khuyến cáo ngành nông nghiệp. Không dùng giống nhiễm rầy nặng. Bảo tồn thiên địch. Duy trì mực nước ruộng khi rầy nở rộ. Phun thuốc đặc trị ức chế lột xác khi rầy non tuổi 1-2 đạt mật độ trên 3 con/dảnh.',
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
    vietnameseOtherNames: ['Rầy lưng trắng hại lúa', 'WBPH', 'Rầy sọc trắng'],
    morphology: 'Trưởng thành dài 3.5 - 4mm, màu xám đen, đặc trưng nhất là có một dải vệt sọc màu trắng tuyết nổi bật chạy dọc giữa mai lưng ngực. Rầy non màu xám nhạt, rất linh hoạt, nhảy rất khỏe khi có tác động rung động thân lúa.',
    lifecycle: 'Vòng đời từ 24 - 28 ngày (Trứng: 5 - 7 ngày; Rầy non: 12 - 14 ngày gồm 5 tuổi; Trưởng thành sống 8 - 12 ngày đẻ 100 - 250 trứng vào mô gân lá).',
    damageStages: ['Mạ', 'Đẻ nhánh', 'Đòng trỗ'],
    symptoms: 'Rầy non và trưởng thành tập trung chích hút nhựa bẹ lá và gân chính, làm lá lúa khô úa từ chóp lá lan xuống, cây còi cọc lùn tịt. Đặc biệt nguy hại, rầy lưng trắng là véc-tơ truyền bệnh virus Lùn sọc đen phương Nam (SRBSDV) gây thất thu năng suất nghiêm trọng.',
    economicThreshold: 'Mật độ rầy trên 2 - 3 con/dảnh ở giai đoạn đẻ nhánh hoặc khi có nguy cơ bùng phát dịch bệnh lùn sọc đen trong vùng.',
    naturalEnemies: ['Bọ xít mù xanh', 'Bọ rùa 8 chấm', 'Nhện sói Lycosa', 'Ong ký sinh trứng Mymaridae'],
    naturalEnemiesDetail: [
      { name: 'Bọ xít mù xanh (Cyrtorhinus)', type: 'predator', description: 'Ăn trứng và ấu trùng rầy non trên thân lá.' },
      { name: 'Nhện sói săn mồi', type: 'predator', description: 'Tấn công rầy lưng trắng khi chúng bay nhảy trên tán.' }
    ],
    chemicals: ['Dinotefuran (Oshin 20WP)', 'Clothianidin (Dantotsu 50WG)', 'Pymetrozine (Chess 50WG)', 'Nitenpyram'],
    chemicalDetails: [
      { active: 'Dinotefuran', tradeNames: ['Oshin 20WP', 'Map Javel 10WP'], modeOfAction: 'Thuốc nhóm neonicotinoid thế hệ 3, lưu dẫn cực nhanh, tác động tiếp xúc và vị độc.', guideline: 'Pha gói 6.5g/bình 16-25L, phun khi rầy chớm nở.' },
      { active: 'Clothianidin', tradeNames: ['Dantotsu 50WG'], modeOfAction: 'Lưu dẫn nội hấp mạnh, bảo vệ cây lúa kéo dài.', guideline: 'Gói 5g/bình 25L.' }
    ],
    clrriIpm: {
      economicThreshold: 'Phun khi mật độ rầy trên 2 con/dảnh hoặc kiểm tra có dấu hiệu bệnh lùn sọc đen.',
      culturalMeasures: 'Xử lý hạt giống bằng thuốc Cruiser Plus trước khi gieo sạ để ngừa rầy chích mầm non truyền virus. Vệ sinh sạch cỏ bờ ruộng.',
      waterManagement: 'Điều tiết nước linh hoạt, không để ruộng bị ngập úng kéo dài.',
      biologicalControl: 'Bảo vệ quần thể bọ xít mù xanh và ong ký sinh trứng.',
      chemicalStrategy: 'Phun thuốc nội hấp lưu dẫn sớm khi phát hiện ổ rầy non tuổi 1-2.'
    },
    prevention: 'Sử dụng hạt giống sạch bệnh đã xử lý thuốc trừ rầy. Kiểm tra thường xuyên mật độ ổ rầy non dưới gốc lúa. Vệ sinh sạch cỏ bờ ruộng nhất là cỏ lồng vực. Phun thuốc nội hấp lưu dẫn kịp thời khi rầy chớm xuất hiện.',
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
    vietnameseOtherNames: ['Rầy nâu sọc nhỏ', 'Rầy nâu lùn', 'SBPH'],
    morphology: 'Kích thước nhỏ nhất trong nhóm rầy hại lúa, dài chỉ 2 - 2.8mm; thân màu nâu sẫm đến đen bóng, mảnh lưng ngực giữa màu đen bóng viền trắng mỏng. Rầy non màu nâu xám tro, rất nhỏ li ti, ẩn nấp trong các kẽ bẹ lá.',
    lifecycle: 'Vòng đời từ 22 - 26 ngày (Trứng: 5 - 6 ngày; Rầy non: 10 - 13 ngày; Trưởng thành sống 8 - 12 ngày).',
    damageStages: ['Mạ', 'Đẻ nhánh'],
    symptoms: 'Chích hút nhựa tế bào làm suy kiệt cây lúa ở giai đoạn đầu vụ, làm lá vàng xơ xác và là môi giới truyền bệnh virus sọc lá (Rice Stripe Virus - RSV) và bệnh lùn đen hại lúa.',
    economicThreshold: 'Mật độ trên 3 - 4 con/dảnh ở giai đoạn mạ đến đẻ nhánh.',
    naturalEnemies: ['Bọ cánh cộc (Paederus)', 'Nhện nhảy (Salticidae)', 'Ong ký sinh họ Mymaridae'],
    naturalEnemiesDetail: [
      { name: 'Bọ cánh cộc', type: 'predator', description: 'Ăn thịt rầy non trong kẽ bẹ lá.' },
      { name: 'Nhện nhảy', type: 'predator', description: 'Săn bắt rầy di chuyển trên phiến lá non.' }
    ],
    chemicals: ['Imidacloprid (Confidor 100SL)', 'Acetamiprid', 'Buprofezin (Applaud 10WP)', 'Thiamethoxam'],
    chemicalDetails: [
      { active: 'Imidacloprid', tradeNames: ['Confidor 100SL', 'Admire 200SL'], modeOfAction: 'Gây rối loạn hệ thần kinh dẫn truyền, diệt rầy non và rầy trưởng thành.', guideline: 'Pha 10-15ml/bình 25L, phun khi mật độ rầy tăng cao.' }
    ],
    clrriIpm: {
      economicThreshold: 'Phun khi phát hiện rầy xuất hiện kết hợp triệu chứng bệnh sọc lá virus.',
      culturalMeasures: 'Tiêu hủy tàn dư rơm rạ vụ trước và dọn sạch cỏ ký chủ phụ.',
      waterManagement: 'Duy trì nước đều đặn để cây mạ phát triển nhanh chóng vượt qua giai đoạn mẫn cảm.',
      biologicalControl: 'Bảo tồn nhện nhảy và ong ký sinh trứng.',
      chemicalStrategy: 'Phun thuốc có tác dụng xông hơi và tiếp xúc nhanh.'
    },
    prevention: 'Tiêu hủy tàn dư vụ trước và dọn sạch cỏ ký chủ phụ. Sử dụng bẫy dính màu vàng giám sát số lượng rầy di trú. Phun trừ bằng các nhóm thuốc ức chế thần kinh côn trùng.',
    category: 'pest',
  },
  {
    id: 8,
    key: 'rice_water_weevil',
    en: 'Rice Water Weevil',
    vi: 'Súng nước hại lúa (hoặc Bọ vòi đôi hại lúa)',
    scientific: 'Lissorhoptrus oryzophilus',
    aliases: ['water_weevil', 'rice_weevil', 'rice_water_weevil', 'sung_nuoc_hai_lua', 'bo_voi_doi_hai_lua', 'bo_voi_voi_hai_lua'],
    severity: 'high',
    vietnameseOtherNames: ['Bọ vòi voi hại lúa', 'Bọ vòi đôi hại lúa', 'Súng nước hại lúa'],
    morphology: 'Bọ trưởng thành là bọ cánh cứng nhỏ dài 3-4mm, có chiếc vòi dài cong xuống phía dưới, thân phủ lông mịn màu xám nâu không thấm nước, có thể bơi lội và lặn sâu trong nước ruộng. Ấu trùng (sâu non dạng dòi) không chân, màu trắng sữa, dài 6-8mm, sống ngập chìm trong bùn đất quanh rễ lúa.',
    lifecycle: 'Vòng đời từ 35 - 50 ngày (Trứng: 6 - 9 ngày; Ấu trùng dưới bùn: 20 - 30 ngày gồm 4 tuổi; Nhộng trong kén bùn: 7 - 10 ngày; Bọ trưởng thành có thể sống qua đông vài tháng).',
    damageStages: ['Lúa cấy mới bén rễ', 'Đẻ nhánh', 'Hồi xanh'],
    symptoms: 'Bọ trưởng thành gặm ăn lớp biểu bì mặt trên của lá non tạo thành các rãnh trắng hẹp song song với gân lá. Nguy hiểm nhất là Ấu trùng sống trong bùn cắn trụi toàn bộ hệ thống rễ lúa, làm rễ đen thối cụt ngủn, cây lúa còi cọc, vàng úa, kém hấp thu phân bón và rất dễ bị đổ ngã trốc gốc khi có gió lớn.',
    economicThreshold: 'Mật độ bọ trưởng thành > 5 con/m² lúc lúa mới bén rễ hoặc tỷ lệ rễ bị cắn hại > 15%.',
    naturalEnemies: ['Cá đồng ăn mồi (cá rô, cá sặc)', 'Bọ nước ăn thịt', 'Chuồn chuồn săn bọ trưởng thành'],
    naturalEnemiesDetail: [
      { name: 'Cá đồng ruộng lúa', type: 'predator', description: 'Ăn ấu trùng và bọ vòi voi bơi trong nước ruộng (mô hình lúa - cá).' },
      { name: 'Bọ nước ăn thịt (Hydrophilidae)', type: 'predator', description: 'Săn bắt bọ trưởng thành dưới nước.' }
    ],
    chemicals: ['Cruiser Plus 312.5FS (xử lý hạt giống)', 'Diazinon hạt', 'Cartap hạt (Padan 4G)', 'Chlorantraniliprole'],
    chemicalDetails: [
      { active: 'Cruiser Plus 312.5FS', tradeNames: ['Cruiser Plus 312.5FS (Syngenta)'], modeOfAction: 'Thuốc xử lý hạt giống, hoạt chất Thiamethoxam lưu dẫn từ mầm hạt bảo vệ rễ lúa suốt 20 ngày đầu sau sạ.', guideline: 'Pha 10ml thuốc với 1 lít nước trộn đều cho 20kg lúa giống trước khi ủ.' },
      { active: 'Cartap hạt', tradeNames: ['Padan 4G', 'Gà Nòi hạt'], modeOfAction: 'Rải vào đất diệt ấu trùng dưới bùn.', guideline: 'Rải 1.5 - 2kg/công (1000m²) khi làm đất hoặc sau khi sạ 10-15 ngày.' }
    ],
    clrriIpm: {
      economicThreshold: 'Khi phát hiện trên 15% lá có vệt gặm hoặc nhổ thử khóm lúa thấy rễ bị cắn cụt đen.',
      culturalMeasures: 'Xử lý hạt giống trước khi ủ sạ. Vệ sinh đồng ruộng diệt sạch tàn dư.',
      waterManagement: 'Biện pháp then chốt nhất: Áp dụng kỹ thuật tưới "Ngập - Khô xen kẽ" (AWD), tháo cạn nước ruộng để khô chân chim 5-7 ngày, ấu trùng dưới bùn thiếu nước ngập sẽ chết ngạt và không di chuyển được.',
      biologicalControl: 'Thả cá đồng (cá rô phi, cá mè, cá sặc) trong mô hình lúa - cá kết hợp để cá ăn ấu trùng dưới nước.',
      chemicalStrategy: 'Ưu tiên xử lý hạt giống hoặc rải thuốc hạt xử lý đất sớm ngay từ đầu vụ.'
    },
    prevention: 'Áp dụng kỹ thuật tưới ngập khô xen kẽ (AWD) định kỳ để ấu trùng thiếu ẩm và khó di chuyển trong bùn. Xử lý hạt giống hoặc rải thuốc hạt xử lý đất khi gieo cấy ở vùng có tiền sử bọ vòi voi/bọ vòi đôi.',
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
    vietnameseOtherNames: ['Rầy xanh hại lúa', 'Rầy lá lúa', 'Green Leafhopper (GLH)'],
    morphology: 'Trưởng thành thon dài 4-5mm, thân màu xanh lục chuối non rất đặc trưng; ở con đực, chóp cánh trước có hai đốm tròn màu đen đậm và đỉnh cánh có viền đen; con cái màu nhạt hơn. Rầy non màu vàng chanh hoặc xanh nhạt, bò ngang rất nhanh nhẹn khi bị khua động.',
    lifecycle: 'Vòng đời từ 22 - 28 ngày (Trứng: 5 - 7 ngày; Rầy non: 12 - 15 ngày gồm 5 tuổi; Trưởng thành sống 10 - 15 ngày đẻ 80 - 150 trứng xếp xiên trong bẹ lá).',
    damageStages: ['Đẻ nhánh', 'Làm đòng'],
    symptoms: 'Chích hút nhựa trên tán lá và chồi non làm lá khô vàng từ chóp lá lan dần vào trong, cây lúa cằn cỗi. Mối nguy lớn nhất: Rầy xanh đuôi đen là môi giới chính truyền Bệnh Vàng lụi Tungro (Rice Tungro Disease) cực kỳ nguy hiểm, làm cây lúa lùn tịt, lá chuyển màu vàng cam rực từ đầu ngọn xuống, không trỗ bông được và gây mất mùa trắng.',
    economicThreshold: 'Khi mật độ rầy trên 2 - 3 con/khóm ở vùng có tiền sử hoặc nguy cơ bệnh virus Tungro.',
    naturalEnemies: ['Bọ rùa đỏ', 'Chuồn chuồn cỏ (Chrysopidae)', 'Nhện giăng lưới', 'Ong ký sinh Gonatocerus'],
    naturalEnemiesDetail: [
      { name: 'Bọ rùa đỏ (Micraspis)', type: 'predator', description: 'Ăn rầy xanh non và trứng trên phiến lá.' },
      { name: 'Chuồn chuồn cỏ', type: 'predator', description: 'Săn bắt rầy trưởng thành bay trên tán lá.' },
      { name: 'Ong ký sinh Gonatocerus', type: 'parasitoid', description: 'Ký sinh trứng rầy trong bẹ lá.' }
    ],
    chemicals: ['Thiamethoxam (Actara 25WG)', 'Fenobucarb (Bassa 50EC)', 'Pymetrozine (Chess 50WG)', 'Nấm Metarhizium'],
    chemicalDetails: [
      { active: 'Thiamethoxam', tradeNames: ['Actara 25WG'], modeOfAction: 'Thuốc nội hấp nhanh, tác động tiếp xúc và vị độc, lưu dẫn khắp cây lúa.', guideline: 'Pha 1g/bình 16-25L, phun ướt đều tán lá.' },
      { active: 'Fenobucarb', tradeNames: ['Bassa 50EC'], modeOfAction: 'Thuốc nhóm carbamate tác động tiếp xúc và xông hơi cực nhanh, hạ gục rầy tức thì.', guideline: 'Pha 30-40ml/bình 25L khi mật độ rầy cao cần dập dịch.' }
    ],
    clrriIpm: {
      economicThreshold: 'Phun dập ổ rầy ngay khi thấy rầy xuất hiện ở vùng có nguy cơ truyền bệnh Tungro.',
      culturalMeasures: 'Bảo tồn thiên địch bằng thảm hoa bờ ruộng. Dùng vợt lưới bắt rầy vào sáng sớm khi có sương ẩm.',
      waterManagement: 'Điều tiết nước bình thường, tránh để cây lúa bị hạn làm suy yếu đề kháng.',
      biologicalControl: 'Sử dụng nấm ký sinh Metarhizium để phòng trừ sinh học định kỳ.',
      chemicalStrategy: 'Nếu phát hiện cây lúa có triệu chứng bệnh Tungro (vàng cam), nhổ tiêu hủy ngay và phun thuốc trừ rầy xanh đuôi đen triệt để để cắt đứt nguồn lây lan.'
    },
    prevention: 'Bảo tồn đàn bọ rùa và ong ký sinh trứng. Dùng vợt bắt bọ xít/rầy lá lúc sáng sớm. Khi mật độ cao đe dọa lây truyền virus Tungro, phun các loại thuốc có tác dụng tiếp xúc và xông hơi nhanh.',
    category: 'pest',
  },
];

// Master alias for components needing direct static access
export const PEST_DATABASE_10 = PEST_DICTIONARY;

/**
 * Quy trình Quản lý Dịch hại Tổng hợp (IPM) Chuẩn Viện Lúa Đồng bằng Sông Cửu Long (CLRRI)
 */
export const CLRRI_IPM_PROTOCOL = {
  title: 'Quy trình Quản lý Dịch hại Tổng hợp (IPM) Chuẩn Viện Lúa ĐBSCL',
  institute: 'Viện Lúa Đồng bằng Sông Cửu Long (CLRRI - Can Tho)',
  fourCorePrinciples: [
    {
      number: 1,
      title: 'Trồng và chăm sóc cây lúa khỏe',
      desc: 'Sử dụng giống xác nhận kháng rầy/sâu bệnh, mật độ gieo sạ thưa hợp lý (80-100 kg/ha), bón phân cân đối N-P-K theo bảng so màu lá lúa LCC, điều tiết nước ngập - khô xen kẽ (AWD) giúp bộ rễ phát triển sâu và đanh chắc.',
    },
    {
      number: 2,
      title: 'Bảo tồn và phát huy tối đa thiên địch tự nhiên',
      desc: 'Tuyệt đối KHÔNG PHUN thuốc trừ sâu hóa học trong 40 ngày đầu sau sạ để đàn thiên địch (ong ký sinh, nhện sói, bọ xít mù xanh, bọ ba khoang) nhân sinh khối khống chế sâu hại tự nhiên. Áp dụng công nghệ sinh thái: Trồng hoa bờ ruộng dẫn dụ thiên địch lấy mật và phấn hoa.',
    },
    {
      number: 3,
      title: 'Thường xuyên thăm đồng định kỳ',
      desc: 'Thăm đồng ít nhất 5-7 ngày/lần theo phương pháp chéo góc hoặc zíc-zắc. Đếm số lượng dịch hại, thiên địch và đánh giá giai đoạn sinh trưởng của cây lúa để đưa ra quyết định xử lý kịp thời.',
    },
    {
      number: 4,
      title: 'Nông dân trở thành chuyên gia đồng ruộng',
      desc: 'Người nông dân hiểu rõ sinh thái ruộng lúa, nhận biết chính xác từng loài sâu bệnh và vòng đời phát triển; chỉ can thiệp biện pháp hóa học khi mật độ vượt ngưỡng phòng trừ kinh tế (Economic Threshold - ET).',
    },
  ],
  oneMustFiveReductions: {
    must: 'Phải sử dụng giống lúa xác nhận kháng sâu bệnh',
    reductions: [
      { name: 'Giảm lượng giống gieo sạ', detail: 'Sạ 80-100 kg/ha thay vì 150-200 kg/ha để ruộng thông thoáng, giảm ẩm độ ổ dịch rầy nâu và sâu đục thân.' },
      { name: 'Giảm lượng phân đạm bón thừa', detail: 'Bón phân theo nhu cầu sinh lý từng thời kỳ, bón lót phân lân, bón đón đòng đúng lúc, giảm tối đa đạm bón muộn.' },
      { name: 'Giảm lượng thuốc BVTV hóa học', detail: 'Tuân thủ nguyên tắc không phun thuốc sớm, chỉ phun khi vượt ngưỡng kinh tế, ưu tiên chế phẩm sinh học Bt và nấm ký sinh.' },
      { name: 'Giảm lượng nước tưới tiêu (AWD)', detail: 'Tưới ngập - khô xen kẽ định kỳ, tháo cạn nước để ấu trùng bọ vòi voi và muỗi hành không sinh sôi được dưới bùn.' },
      { name: 'Giảm thất thoát sau thu hoạch', detail: 'Thu hoạch đúng độ chín (85-90% hạt vàng rơm), cắt sát gốc rạ để loại trừ nơi trú ngụ của sâu đục thân và muỗi hành.' },
    ],
  },
  fourRightsRule: [
    { title: '1. Đúng thuốc', detail: 'Chọn thuốc đặc trị có phổ tác động hẹp, ưu tiên thuốc điều hòa sinh trưởng, ức chế lột xác hoặc chế phẩm vi sinh sinh học.' },
    { title: '2. Đúng lúc', detail: 'Phun khi sâu non mới nở tuổi 1-2 hoặc rầy non tuổi 1-2 chưa kịp gây hại nặng; phun vào sáng sớm ráo sương hoặc chiều mát.' },
    { title: '3. Đúng liều lượng', detail: 'Tuân thủ nghiêm ngặt hướng dẫn trên nhãn mác, không tự ý tăng liều gây kháng thuốc, pha đủ lượng nước (thường 400-500 lít nước/ha).' },
    { title: '4. Đúng cách', detail: 'Phun rầy nâu phải hạ thấp vòi phun sát gốc thân; phun sâu cuốn lá phải ướt đều tán lá; không phối trộn bừa bãi thuốc trừ sâu với thuốc cỏ/nấm.' },
  ],
};

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
      item.aliases?.some((a) => cleanStr(a) === cleaned || cleanStr(a) === noAccentCleaned) ||
      item.vietnameseOtherNames?.some((v) => cleanStr(removeAccents(v)) === noAccentCleaned)
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
      title: 'Đồng ruộng an toàn (Mật độ 0)',
      message: 'Không phát hiện cá thể côn trùng gây hại nào trong mẫu khảo sát này.',
      color: '#10b981',
      bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300',
      recommendedAction: 'Duy trì chăm sóc bình thường theo quy trình "3 Giảm 3 Tăng", định kỳ kiểm tra ruộng 5-7 ngày/lần và bảo tồn đàn thiên địch tự nhiên.',
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
      title: 'BÁO ĐỘNG ĐỎ: Nguy cơ bùng phát dịch hại',
      message: `Phát hiện ${total} cá thể sâu hại, trong đó có ${criticalCount} cá thể thuộc nhóm nguy cấp (Rầy nâu/Sâu đục thân). Nguy cơ cao gây cháy rầy hoặc bông bạc trắng xơ xác.`,
      color: '#ef4444',
      bg: 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300',
      recommendedAction: 'Khoanh vùng kiểm tra gấp toàn bộ ô ruộng. Nếu vượt ngưỡng phòng trừ kinh tế (ET), sử dụng ngay thuốc đặc trị nội hấp lưu dẫn thế hệ mới (Pexena, Virtako, Chess) theo nguyên tắc "4 Đúng" của Viện Lúa ĐBSCL.',
    };
  }

  if (criticalCount >= 1 || highCount >= 3 || total >= 4) {
    return {
      level: 'warning',
      title: 'CẢNH BÁO: Mật độ sâu hại đang gia tăng',
      message: `Ghi nhận ${total} cá thể côn trùng gây hại. Có sự xuất hiện của nhóm nguy cơ cao. Cần theo dõi sát sao vòng đời để ngăn ngừa thế hệ kế tiếp bùng phát.`,
      color: '#f59e0b',
      bg: 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300',
      recommendedAction: 'Thăm đồng 2-3 ngày/lần. Áp dụng tưới "Ngập - Khô xen kẽ" (AWD) để bộ rễ thông thoáng. Tuyệt đối không bón thêm phân đạm và bảo tồn bọ xít mù xanh, nhện sói.',
    };
  }

  return {
    level: 'low',
    title: 'Mức độ nhẹ: Xuất hiện rải rác dưới ngưỡng ET',
    message: `Phát hiện ${total} cá thể côn trùng với mật độ thấp dưới ngưỡng gây hại kinh tế. Cây lúa có khả năng tự đền bù sinh học.`,
    color: '#3b82f6',
    bg: 'bg-blue-500/10 border-blue-500/30 text-blue-800 dark:text-blue-300',
    recommendedAction: 'Chưa cần can thiệp thuốc hóa học. Để thiên địch tự nhiên (ong mắt đỏ, bọ rùa, nhện sói) kiểm soát cân bằng sinh thái ruộng lúa.',
  };
}
