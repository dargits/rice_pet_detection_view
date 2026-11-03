// 1:1 Translation Dictionary for Rice Pests and Diseases (English <-> Vietnamese)

export interface PestTranslationEntry {
  id?: number;
  key: string;              // Normalized snake_case key
  en: string;               // English common name
  vi: string;               // Vietnamese standard name
  scientific?: string;      // Scientific name
  category?: 'pest' | 'disease';
}

export const PEST_DICTIONARY: PestTranslationEntry[] = [
  {
    id: 0,
    key: 'brown_planthopper',
    en: 'Brown Planthopper',
    vi: 'Rầy nâu',
    scientific: 'Nilaparvata lugens',
    category: 'pest',
  },
  {
    id: 1,
    key: 'rice_leaf_roller',
    en: 'Rice Leaf Roller',
    vi: 'Sâu cuốn lá',
    scientific: 'Cnaphalocrocis medinalis',
    category: 'pest',
  },
  {
    id: 2,
    key: 'yellow_stem_borer',
    en: 'Yellow Stem Borer',
    vi: 'Sâu đục thân 2 chấm',
    scientific: 'Scirpophaga incertulas',
    category: 'pest',
  },
  {
    id: 3,
    key: 'rice_bug',
    en: 'Rice Bug (Slender Rice Bug)',
    vi: 'Bọ xít dài (Bọ xít hôi)',
    scientific: 'Leptocorisa acuta',
    category: 'pest',
  },
  {
    id: 4,
    key: 'rice_thrips',
    en: 'Rice Thrips',
    vi: 'Bọ trĩ lúa',
    scientific: 'Stenchaetothrips biformis',
    category: 'pest',
  },
  {
    id: 5,
    key: 'rice_hispa',
    en: 'Rice Hispa',
    vi: 'Bọ gai',
    scientific: 'Dicladispa armigera',
    category: 'pest',
  },
  {
    id: 6,
    key: 'whitebacked_planthopper',
    en: 'White-backed Planthopper',
    vi: 'Rầy lưng trắng',
    scientific: 'Sogatella furcifera',
    category: 'pest',
  },
  {
    id: 7,
    key: 'green_leafhopper',
    en: 'Green Leafhopper',
    vi: 'Rầy xanh đuôi đen',
    scientific: 'Nephotettix virescens',
    category: 'pest',
  },
  {
    id: 8,
    key: 'striped_stem_borer',
    en: 'Striped Stem Borer',
    vi: 'Sâu đục thân 5 vạch',
    scientific: 'Chilo suppressalis',
    category: 'pest',
  },
  {
    id: 9,
    key: 'pink_stem_borer',
    en: 'Pink Stem Borer',
    vi: 'Sâu đục thân bướm cú',
    scientific: 'Sesamia inferens',
    category: 'pest',
  },
  {
    id: 10,
    key: 'white_stem_borer',
    en: 'White Stem Borer',
    vi: 'Sâu đục thân bướm trắng',
    scientific: 'Scirpophaga innotata',
    category: 'pest',
  },
  {
    id: 11,
    key: 'rice_gall_midge',
    en: 'Rice Gall Midge',
    vi: 'Muỗi hành (Sâu năn)',
    scientific: 'Orseolia oryzae',
    category: 'pest',
  },
  {
    id: 12,
    key: 'rice_caseworm',
    en: 'Rice Caseworm',
    vi: 'Sâu phao',
    scientific: 'Parapoynx stagnalis',
    category: 'pest',
  },
  {
    id: 13,
    key: 'rice_armyworm',
    en: 'Rice Armyworm',
    vi: 'Sâu cắn gié',
    scientific: 'Mythimna separata',
    category: 'pest',
  },
  {
    id: 14,
    key: 'rice_leafhopper',
    en: 'Rice Leafhopper',
    vi: 'Rầy lá lúa',
    scientific: 'Cicadellidae',
    category: 'pest',
  },
  {
    id: 15,
    key: 'rice_water_weevil',
    en: 'Rice Water Weevil',
    vi: 'Mọt nước hại lúa',
    scientific: 'Lissorhoptrus oryzophilus',
    category: 'pest',
  },
  {
    id: 16,
    key: 'rice_grasshopper',
    en: 'Rice Grasshopper',
    vi: 'Châu chấu hại lúa',
    scientific: 'Oxya chinensis',
    category: 'pest',
  },
  {
    id: 17,
    key: 'mole_cricket',
    en: 'Mole Cricket',
    vi: 'Dế dũi',
    scientific: 'Gryllotalpa orientalis',
    category: 'pest',
  },
  {
    id: 18,
    key: 'rice_skipper',
    en: 'Rice Skipper',
    vi: 'Bướm nhảy hại lúa',
    scientific: 'Parnara guttata',
    category: 'pest',
  },
  {
    id: 19,
    key: 'golden_apple_snail',
    en: 'Golden Apple Snail',
    vi: 'Ốc bươu vàng',
    scientific: 'Pomacea canaliculata',
    category: 'pest',
  },
  {
    id: 20,
    key: 'rice_blast',
    en: 'Rice Blast',
    vi: 'Bệnh Đạo ôn',
    scientific: 'Magnaporthe oryzae',
    category: 'disease',
  },
  {
    id: 21,
    key: 'bacterial_leaf_blight',
    en: 'Bacterial Leaf Blight',
    vi: 'Bệnh Bạc lá (Cháy bìa lá)',
    scientific: 'Xanthomonas oryzae',
    category: 'disease',
  },
  {
    id: 22,
    key: 'sheath_blight',
    en: 'Sheath Blight',
    vi: 'Bệnh Khô vằn (Đốm vằn)',
    scientific: 'Rhizoctonia solani',
    category: 'disease',
  },
  {
    id: 23,
    key: 'brown_spot',
    en: 'Brown Spot',
    vi: 'Bệnh Đốm nâu',
    scientific: 'Bipolaris oryzae',
    category: 'disease',
  },
  {
    id: 24,
    key: 'rice_tungro',
    en: 'Rice Tungro Virus',
    vi: 'Bệnh Vàng lụi (Tungro)',
    scientific: 'Rice tungro virus',
    category: 'disease',
  },
  {
    id: 25,
    key: 'false_smut',
    en: 'False Smut',
    vi: 'Bệnh Than vàng (Thoa lôi)',
    scientific: 'Ustilaginoidea virens',
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

  // Direct exact match
  for (const item of PEST_DICTIONARY) {
    if (
      item.key === cleaned ||
      item.en.toLowerCase() === lower ||
      item.vi.toLowerCase() === lower ||
      cleanStr(removeAccents(item.vi)) === noAccentCleaned ||
      cleanStr(item.en) === cleaned
    ) {
      return item;
    }
  }

  // Substring match
  for (const item of PEST_DICTIONARY) {
    const viNoAcc = cleanStr(removeAccents(item.vi));
    const enClean = cleanStr(item.en);
    if (
      cleaned.includes(item.key) ||
      item.key.includes(cleaned) ||
      enClean.includes(cleaned) ||
      cleaned.includes(enClean) ||
      viNoAcc.includes(noAccentCleaned) ||
      noAccentCleaned.includes(viNoAcc)
    ) {
      return item;
    }
  }

  // Handle common aliases
  if (cleaned.includes('stem_borer') || noAccentCleaned.includes('duc_than')) {
    return PEST_DICTIONARY[2]; // Sâu đục thân
  }
  if (cleaned.includes('leaf_roller') || cleaned.includes('leaf_folder') || noAccentCleaned.includes('cuon_la')) {
    return PEST_DICTIONARY[1]; // Sâu cuốn lá
  }
  if (cleaned.includes('planthopper') || noAccentCleaned.includes('ray_nau')) {
    return PEST_DICTIONARY[0]; // Rầy nâu
  }
  if (cleaned.includes('stink_bug') || cleaned.includes('rice_bug') || noAccentCleaned.includes('bo_xit')) {
    return PEST_DICTIONARY[3]; // Bọ xít
  }
  if (cleaned.includes('thrip') || noAccentCleaned.includes('bo_tri')) {
    return PEST_DICTIONARY[4]; // Bọ trĩ
  }
  if (cleaned.includes('hispa') || noAccentCleaned.includes('bo_gai')) {
    return PEST_DICTIONARY[5]; // Bọ gai
  }

  return null;
}

export type PestLanguageOption = 'vi' | 'en' | 'both';

/**
 * Returns formatted pest display name based on user's chosen language:
 * - 'vi': "Rầy nâu"
 * - 'en': "Brown Planthopper"
 * - 'both': "Rầy nâu (Brown Planthopper)"
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

