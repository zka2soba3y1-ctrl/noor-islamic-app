/**
 * Duas Service: Fetches Quranic and Prophetic Duas from https://quran.yousefheiba.com/api/duas
 * Provides offline caching, categorization, and repetition coordination.
 */

export interface DuaItem {
  id: number;
  text: string;
  count: number;
  categoryKey: "prophetic_duas" | "quran_duas" | "prophets_duas" | "quran_completion_duas";
  categoryNameAr: string;
  sourceNote?: string;
}

export interface RawDuasApiResponse {
  prophetic_duas: Array<{ id: number; text: string; count: number }>;
  quran_duas: Array<{ id: number; text: string; count: number }>;
  prophets_duas: Array<{ id: number; text: string; count: number }>;
  quran_completion_duas: Array<{ id: number; text: string; count: number }>;
}

export const DUA_CATEGORIES = [
  { key: "all", nameAr: "جميع الأدعية", icon: "sparkles", count: 69 },
  { key: "quran_duas", nameAr: "أدعية قرآنية", icon: "book", count: 26 },
  { key: "prophetic_duas", nameAr: "أدعية نبوية شريفة", icon: "heart", count: 29 },
  { key: "prophets_duas", nameAr: "أدعية الأنبياء عليهم السلام", icon: "compass", count: 13 },
  { key: "quran_completion_duas", nameAr: "دعاء ختم القرآن الكريم", icon: "bookmark", count: 1 },
] as const;

export type DuaCategoryKey = typeof DUA_CATEGORIES[number]["key"];

const DUAS_API_URL = "https://quran.yousefheiba.com/api/duas";
const CACHE_KEY = "noor_duas_cache_v1";

export async function fetchDuasFromApi(): Promise<{
  all: DuaItem[];
  categorized: Record<string, DuaItem[]>;
}> {
  try {
    const response = await fetch(DUAS_API_URL, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });

    if (response.ok) {
      const data: RawDuasApiResponse = await response.json();
      const parsed = transformDuasData(data);
      if (typeof window !== "undefined" && parsed.all.length > 0) {
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      }
      return parsed;
    }
  } catch (error) {
    console.warn("Duas API network fetch failed, using fallback or cache:", error);
  }

  // Fallback 1: LocalStorage Cache
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const cachedData = JSON.parse(cached);
        return transformDuasData(cachedData);
      }
    } catch {}
  }

  // Fallback 2: Bundled offline foundational duas
  return transformDuasData(OFFLINE_DUAS_DATA);
}

function transformDuasData(data: RawDuasApiResponse): {
  all: DuaItem[];
  categorized: Record<string, DuaItem[]>;
} {
  const categorized: Record<string, DuaItem[]> = {
    quran_duas: [],
    prophetic_duas: [],
    prophets_duas: [],
    quran_completion_duas: [],
  };
  const all: DuaItem[] = [];

  const addCategory = (
    list: Array<{ id: number; text: string; count: number }>,
    catKey: "prophetic_duas" | "quran_duas" | "prophets_duas" | "quran_completion_duas",
    catName: string
  ) => {
    if (!Array.isArray(list)) return;
    list.forEach((item, index) => {
      // Extract optional reference inside brackets like [البقرة - 201]
      const refMatch = item.text.match(/\[([^\]]+)\]/);
      const sourceNote = refMatch ? refMatch[1] : undefined;

      const formattedItem: DuaItem = {
        id: item.id || index + 1,
        text: item.text,
        count: item.count || 1,
        categoryKey: catKey,
        categoryNameAr: catName,
        sourceNote,
      };
      categorized[catKey].push(formattedItem);
      all.push(formattedItem);
    });
  };

  addCategory(data.quran_duas, "quran_duas", "أدعية قرآنية");
  addCategory(data.prophetic_duas, "prophetic_duas", "أدعية نبوية شريفة");
  addCategory(data.prophets_duas, "prophets_duas", "أدعية الأنبياء عليهم السلام");
  addCategory(data.quran_completion_duas, "quran_completion_duas", "دعاء ختم القرآن الكريم");

  return { all, categorized };
}

const OFFLINE_DUAS_DATA: RawDuasApiResponse = {
  prophetic_duas: [
    {
      id: 1,
      text: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ.",
      count: 1,
    },
    {
      id: 2,
      text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى وَالْعَفَافَ وَالْغِنَى.",
      count: 3,
    },
    {
      id: 3,
      text: "يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ.",
      count: 3,
    },
    {
      id: 4,
      text: "اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي.",
      count: 7,
    },
    {
      id: 5,
      text: "اللَّهُمَّ رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ.",
      count: 3,
    },
  ],
  quran_duas: [
    {
      id: 1,
      text: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ. [البقرة - 201].",
      count: 1,
    },
    {
      id: 2,
      text: "رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً ۚ إِنَّكَ أَنتَ الْوَهَّابُ. [آل عمران - 8].",
      count: 1,
    },
    {
      id: 3,
      text: "رَبَّنَا اغْفِرْ لَنَا وَلِإِخْوَانِنَا الَّذِينَ سَبَقُونَا بِالْإِيمَانِ وَلَا تَجْعَلْ فِي قُلُوبِنَا غِلًّا لِّلَّذِينَ آمَنُوا رَبَّنَا إِنَّكَ رَءُوفٌ رَّحِيمٌ. [الحشر - 10].",
      count: 1,
    },
  ],
  prophets_duas: [
    {
      id: 1,
      text: "لَّا إِلَهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ. [الأنبياء - 87].",
      count: 3,
    },
    {
      id: 2,
      text: "رَبِّ إِنِّي لِمَا أَنزَلْتَ إِلَيَّ مِنْ خَيْرٍ فَقِيرٌ. [القصص - 24].",
      count: 1,
    },
    {
      id: 3,
      text: "رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي وَاحْلُلْ عُقْدَةً مِّن لِّسَانِي يَفْقَهُوا قَوْلِي. [طه - 25-28].",
      count: 1,
    },
  ],
  quran_completion_duas: [
    {
      id: 1,
      text: "اللَّهُمَّ ارْحَمْنِي بالقُرْءَانِ وَاجْعَلهُ لِي إِمَاماً وَنُوراً وَهُدًى وَرَحْمَةً * اللَّهُمَّ ذَكِّرْنِي مِنْهُ مَانَسِيتُ وَعَلِّمْنِي مِنْهُ مَاجَهِلْتُ وَارْزُقْنِي تِلاَوَتَهُ آنَاءَ اللَّيْلِ وَأَطْرَافَ النَّهَارِ وَاجْعَلْهُ لِي حُجَّةً يَارَبَّ العَالَمِينَ * رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ.",
      count: 1,
    },
  ],
};
