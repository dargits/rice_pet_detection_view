// 1:1 Translation Dictionary for Rice Pests (English <-> Vietnamese)
// Specifically standardized according to the user's 10-class YOLOv11 dataset

export interface PestTranslationEntry {
  id?: number;
  key: string;              // Normalized snake_case key
  en: string;               // English common name
  vi: string;               // Vietnamese standard name
  scientific?: string;      // Scientific name
  aliases?: string[];       // Other common keys or names from model/datasets
  category?: 'pest' | 'disease';
}

export const PEST_DICTIONARY: PestTranslationEntry[] = [
  {
    id: 0,
    key: 'rice_leaf_roller',
    en: 'Rice Leaf Roller',
    vi: 'Sâu cuốn lá lúa',
    scientific: 'Cnaphalocrocis medinalis',
    aliases: ['rice_leafroller', 'leaf_roller', 'leaf_folder', 'sau_cuon_la', 'sau_cuon_la_lua'],
    category: 'pest',
  },
  {
    id: 1,
    key: 'rice_leaf_caterpillar',
    en: 'Rice Leaf Caterpillar',
    vi: 'Sâu đo lúa / Sâu ăn lá lúa',
    scientific: 'Naranga aenescens',
    aliases: ['rice_leafcaterpillar', 'leaf_caterpillar', 'caterpillar', 'sau_do_lua', 'sau_an_la_lua'],
    category: 'pest',
  },
  {
    id: 2,
    key: 'asiatic_rice_borer',
    en: 'Asiatic Rice Borer',
    vi: 'Sâu đục thân 5 vạch kẻ đầu nâu (Sâu đục thân châu Á)',
    scientific: 'Chilo suppressalis',
    aliases: ['striped_stem_borer', 'striped_rice_borer', 'sau_duc_than_5_vach', 'sau_duc_than_chau_a'],
    category: 'pest',
  },
  {
    id: 3,
    key: 'yellow_rice_borer',
    en: 'Yellow Rice Borer',
    vi: 'Sâu đục thân bướm 2 chấm (Sâu đục thân màu vàng)',
    scientific: 'Scirpophaga incertulas',
    aliases: ['yellow_stem_borer', 'rice_stem_borer', 'stem_borer', 'sau_duc_than_buom_2_cham', 'sau_duc_than'],
    category: 'pest',
  },
  {
    id: 4,
    key: 'rice_gall_midge',
    en: 'Rice Gall Midge',
    vi: 'Muỗi hành (Muỗi đầu nguyễn)',
    scientific: 'Orseolia oryzae',
    aliases: ['rice_gallmidge', 'gall_midge', 'muoi_hanh', 'sau_nan'],
    category: 'pest',
  },
  {
    id: 5,
    key: 'brown_plant_hopper',
    en: 'Brown Plant Hopper',
    vi: 'Rầy nâu',
    scientific: 'Nilaparvata lugens',
    aliases: ['brown_planthopper', 'bph', 'ray_nau'],
    category: 'pest',
  },
  {
    id: 6,
    key: 'white_backed_plant_hopper',
    en: 'White-backed Plant Hopper',
    vi: 'Rầy lưng trắng',
    scientific: 'Sogatella furcifera',
    aliases: ['whitebacked_planthopper', 'white_backed_planthopper', 'wbph', 'ray_lung_trang'],
    category: 'pest',
  },
  {
    id: 7,
    key: 'small_brown_plant_hopper',
    en: 'Small Brown Plant Hopper',
    vi: 'Rầy nâu nhỏ',
    scientific: 'Laodelphax striatellus',
    aliases: ['small_brown_planthopper', 'sbph', 'ray_nau_nho'],
    category: 'pest',
  },
  {
    id: 8,
    key: 'rice_water_weevil',
    en: 'Rice Water Weevil',
    vi: 'Súng nước hại lúa (Bọ vòi voi hại lúa)',
    scientific: 'Lissorhoptrus oryzophilus',
    aliases: ['water_weevil', 'rice_weevil', 'sung_nuoc_hai_lua', 'bo_voi_voi_hai_lua'],
    category: 'pest',
  },
  {
    id: 9,
    key: 'rice_leafhopper',
    en: 'Rice Leafhopper',
    vi: 'Rầy xanh đuôi đen (Rầy lá lúa nói chung)',
    scientific: 'Nephotettix virescens',
    aliases: ['green_leafhopper', 'rice_leaf_hopper', 'leafhopper', 'ray_xanh_duoi_den', 'ray_la_lua'],
    category: 'pest',
  },
  // Additional rice pests and diseases for broad compatibility
  {
    id: 10,
    key: 'rice_bug',
    en: 'Rice Bug',
    vi: 'Bọ xít dài (Bọ xít hôi)',
    scientific: 'Leptocorisa acuta',
    aliases: ['stink_bug', 'slender_rice_bug', 'bo_xit_dai'],
    category: 'pest',
  },
  {
    id: 11,
    key: 'rice_thrips',
    en: 'Rice Thrips',
    vi: 'Bọ trĩ lúa',
    scientific: 'Stenchaetothrips biformis',
    aliases: ['thrips', 'bo_tri'],
    category: 'pest',
  },
  {
    id: 12,
    key: 'rice_hispa',
    en: 'Rice Hispa',
    vi: 'Bọ gai',
    scientific: 'Dicladispa armigera',
    aliases: ['hispa', 'bo_gai'],
    category: 'pest',
  },
  {
    id: 13,
    key: 'rice_caseworm',
    en: 'Rice Caseworm',
    vi: 'Sâu phao',
    scientific: 'Parapoynx stagnalis',
    aliases: ['caseworm', 'sau_phao'],
    category: 'pest',
  },
  {
    id: 14,
    key: 'rice_armyworm',
    en: 'Rice Armyworm',
    vi: 'Sâu cắn gié',
    scientific: 'Mythimna separata',
    aliases: ['armyworm', 'sau_can_gie'],
    category: 'pest',
  },
  {
    id: 15,
    key: 'rice_grasshopper',
    en: 'Rice Grasshopper',
    vi: 'Châu chấu hại lúa',
    scientific: 'Oxya chinensis',
    aliases: ['grasshopper', 'chau_chau'],
    category: 'pest',
  },
  {
    id: 16,
    key: 'golden_apple_snail',
    en: 'Golden Apple Snail',
    vi: 'Ốc bươu vàng',
    scientific: 'Pomacea canaliculata',
    aliases: ['snail', 'oc_buou_vang'],
    category: 'pest',
  },
  {
    id: 17,
    key: 'rice_blast',
    en: 'Rice Blast',
    vi: 'Bệnh Đạo ôn',
    scientific: 'Magnaporthe oryzae',
    aliases: ['blast', 'benh_dao_on'],
    category: 'disease',
  },
  {
    id: 18,
    key: 'bacterial_leaf_blight',
    en: 'Bacterial Leaf Blight',
    vi: 'Bệnh Bạc lá (Cháy bìa lá)',
    scientific: 'Xanthomonas oryzae',
    aliases: ['leaf_blight', 'bac_la'],
    category: 'disease',
  },
  {
    id: 19,
    key: 'sheath_blight',
    en: 'Sheath Blight',
    vi: 'Bệnh Khô vằn (Đốm vằn)',
    scientific: 'Rhizoctonia solani',
    aliases: ['kho_van'],
    category: 'disease',
  },
];

// Normalize strings for flexible lookup
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
  // a) small brown plant hopper
  if (cleaned.includes('small') && (cleaned.includes('hopper') || noAccentCleaned.includes('ray'))) {
    return PEST_DICTIONARY[7]; // small_brown_plant_hopper
  }
  // b) white backed plant hopper
  if (cleaned.includes('white') && (cleaned.includes('hopper') || noAccentCleaned.includes('lung_trang'))) {
    return PEST_DICTIONARY[6]; // white_backed_plant_hopper
  }
  // c) brown plant hopper
  if ((cleaned.includes('brown') && cleaned.includes('hopper')) || noAccentCleaned.includes('ray_nau')) {
    return PEST_DICTIONARY[5]; // brown_plant_hopper
  }
  // d) leafhopper / green leafhopper
  if (cleaned.includes('leafhopper') || noAccentCleaned.includes('ray_xanh')) {
    return PEST_DICTIONARY[9]; // rice_leafhopper
  }
  // e) rice water weevil
  if (cleaned.includes('weevil') || noAccentCleaned.includes('sung_nuoc') || noAccentCleaned.includes('voi_voi')) {
    return PEST_DICTIONARY[8]; // rice_water_weevil
  }
  // f) gall midge
  if (cleaned.includes('midge') || noAccentCleaned.includes('muoi_hanh')) {
    return PEST_DICTIONARY[4]; // rice_gall_midge
  }
  // g) yellow rice borer
  if (cleaned.includes('yellow') && (cleaned.includes('borer') || noAccentCleaned.includes('duc_than'))) {
    return PEST_DICTIONARY[3]; // yellow_rice_borer
  }
  // h) asiatic rice borer
  if (cleaned.includes('asiatic') || cleaned.includes('striped') || noAccentCleaned.includes('5_vach') || noAccentCleaned.includes('chau_a')) {
    return PEST_DICTIONARY[2]; // asiatic_rice_borer
  }
  // i) leaf caterpillar
  if (cleaned.includes('caterpillar') || noAccentCleaned.includes('sau_do') || noAccentCleaned.includes('an_la')) {
    return PEST_DICTIONARY[1]; // rice_leaf_caterpillar
  }
  // j) leaf roller
  if (cleaned.includes('roller') || cleaned.includes('folder') || noAccentCleaned.includes('cuon_la')) {
    return PEST_DICTIONARY[0]; // rice_leaf_roller
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
    // If unknown, return raw string
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
