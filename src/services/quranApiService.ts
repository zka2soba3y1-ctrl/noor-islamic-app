export interface ApiSurahItem {
  id: string;
  number: string;
  name_ar: string;
  name_en: string;
  type: string;
  ayat_count: string;
}

export interface ApiAyahItem {
  id: string;
  number: string;
  text: string;
  number_in_surah: string;
  page: string;
  surah_id: string;
  hizb_id?: string;
  juz_id?: string;
  sajda?: string;
  tafsir?: string;
}

export interface ApiReciterItem {
  reciter_id: string;
  reciter_name: string;
  reciter_short_name: string;
}

export interface ApiZikrItem {
  id: number;
  text: string;
  count: number;
}

export interface ApiAzkarResponse {
  morning_azkar?: ApiZikrItem[];
  evening_azkar?: ApiZikrItem[];
  prayer_azkar?: ApiZikrItem[];
  prayer_later_azkar?: ApiZikrItem[];
  sleep_azkar?: ApiZikrItem[];
  wake_up_azkar?: ApiZikrItem[];
  mosque_azkar?: ApiZikrItem[];
  miscellaneous_azkar?: ApiZikrItem[];
  adhan_azkar?: ApiZikrItem[];
  wudu_azkar?: ApiZikrItem[];
  home_azkar?: ApiZikrItem[];
  khala_azkar?: ApiZikrItem[];
  food_azkar?: ApiZikrItem[];
  hajj_and_umrah_azkar?: ApiZikrItem[];
}

export interface ApiDuaItem {
  id: number;
  text: string;
  count: number;
}

export interface ApiDuasResponse {
  prophetic_duas?: ApiDuaItem[];
  quran_duas?: ApiDuaItem[];
  prophets_duas?: ApiDuaItem[];
  quran_completion_duas?: ApiDuaItem[];
}

export interface ApiLaylatAlQadrSection {
  name: string;
  value?: string;
  items?: string[];
  points?: string[];
}

export interface ApiLaylatAlQadrResponse {
  laylat_al_qadr: {
    definition?: { name: string; value: string };
    virtue?: { name: string; value: string };
    quranic_evidence?: { name: string; verses?: Array<{ text: string; surah?: string }> | string[] };
    hadith_evidence?: { name: string; ahadith?: Array<{ text: string; narrator?: string }> | string[] };
    naming_reasons?: { name: string; reasons?: string[] };
    signs?: { name: string; signs?: string[] };
    recommended_acts?: { name: string; acts?: string[] };
    importance?: { name: string; points?: string[] };
    scholars_opinions?: { name: string; opinions?: string[] };
    date?: { name: string; info?: string; timing?: string };
    [key: string]: any;
  };
}

export interface ApiReciterAudioTrack {
  surah_id: string;
  surah_name_ar: string;
  audio_url: string;
}

export interface ApiReciterAudioResponse {
  reciter_id: string;
  reciter_name: string;
  audio_urls: ApiReciterAudioTrack[];
}

export interface ApiPageAyahDetail {
  number: string | number;
  text: string;
  surah?: {
    number: string | number;
    name: string;
    englishName?: string;
    revelationType?: string;
  };
  numberInSurah?: string | number;
  juz?: string | number;
  hizbQuarter?: string | number;
  sajda?: boolean;
}

export interface ApiQuranPageTextResponse {
  code?: number;
  status?: string;
  data?: {
    number: number;
    ayahs: ApiPageAyahDetail[];
  };
}

// Built-in famous reciters for instant zero-latency loading
export const FAMOUS_RECITERS: ApiReciterItem[] = [
  {
    reciter_id: "123",
    reciter_name: "مشاري راشد العفاسي",
    reciter_short_name: "Mishary-Alafasi",
  },
  {
    reciter_id: "51",
    reciter_name: "عبد الباسط عبد الصمد",
    reciter_short_name: "Abdulbasit-Abdulsamad",
  },
  {
    reciter_id: "118",
    reciter_name: "محمود خليل الحصري",
    reciter_short_name: "Mahmoud-Khalil-Al-Hussary",
  },
  {
    reciter_id: "112",
    reciter_name: "محمد صديق المنشاوي",
    reciter_short_name: "Mohammed-Siddiq-Al-Minshawi",
  },
  {
    reciter_id: "102",
    reciter_name: "ماهر المعيقلي",
    reciter_short_name: "Maher-Al-Meaqli",
  },
  {
    reciter_id: "54",
    reciter_name: "عبد الرحمن السديس",
    reciter_short_name: "Abdulrahman-Alsudaes",
  },
  {
    reciter_id: "31",
    reciter_name: "سعود الشريم",
    reciter_short_name: "Saud-Al-Shuraim",
  },
  {
    reciter_id: "30",
    reciter_name: "سعد الغامدي",
    reciter_short_name: "Saad-Al-Ghamdi",
  },
  {
    reciter_id: "92",
    reciter_name: "ياسر الدوسري",
    reciter_short_name: "Yasser-Al-Dosari",
  },
  {
    reciter_id: "205",
    reciter_name: "أحمد الحذيفي",
    reciter_short_name: "Ahmad-Alhuthaifi",
  },
  {
    reciter_id: "1",
    reciter_name: "أبو بكر الشاطري",
    reciter_short_name: "Abu-Bakr-Al-Shatri",
  },
  {
    reciter_id: "17",
    reciter_name: "فارس عباد",
    reciter_short_name: "Fares-Abbad",
  },
  {
    reciter_id: "80",
    reciter_name: "ناصر القطامي",
    reciter_short_name: "Nasser-Alqatami",
  },
  {
    reciter_id: "18",
    reciter_name: "خالد القحطاني",
    reciter_short_name: "Khaled-Al-Qahtani",
  },
  {
    reciter_id: "20",
    reciter_name: "علي جابر",
    reciter_short_name: "Ali-Jaber",
  },
];

class QuranApiService {
  private recitersCache: ApiReciterItem[] | null = null;
  private surahsCache: ApiSurahItem[] | null = null;
  private ayahsCache: Map<number, ApiAyahItem[]> = new Map();
  private pageTextCache: Map<number, ApiQuranPageTextResponse> = new Map();
  private azkarCache: ApiAzkarResponse | null = null;
  private duasCache: ApiDuasResponse | null = null;
  private laylatAlQadrCache: ApiLaylatAlQadrResponse | null = null;

  // Format 3-digit page number (e.g. 1 -> "001")
  formatPageCode(page: number): string {
    if (page < 10) return `00${page}`;
    if (page < 100) return `0${page}`;
    return `${page}`;
  }

  // Primary official high-res Mushaf Page image
  getMushafPageImageUrl(page: number): string {
    const code = this.formatPageCode(page);
    return `https://quran.yousefheiba.com/api/quran-pages/${code}.png`;
  }

  // Fallback mirrors in order
  getMushafPageImageMirrors(page: number): string[] {
    const code = this.formatPageCode(page);
    return [
      `https://quran.yousefheiba.com/api/quran-pages/${code}.png`,
      `https://android.quran.com/data/width_1260/page${code}.png`,
      `https://everyayah.com/data/quranpages_png/page${code}.png`,
      `https://cdn.islamic.network/quran/images/high-resolution/${page}.png`,
    ];
  }

  // Cairo Quran Radio 24/7 Official Stream
  getRadioStreamUrl(): string {
    return "https://quran.yousefheiba.com/api/radio";
  }

  // Get all reciters from official API
  async getReciters(): Promise<ApiReciterItem[]> {
    if (this.recitersCache && this.recitersCache.length > 0) {
      return this.recitersCache;
    }
    try {
      const resp = await fetch("https://quran.yousefheiba.com/api/reciters");
      if (resp.ok) {
        const data = await resp.json();
        if (data.reciters && Array.isArray(data.reciters)) {
          this.recitersCache = data.reciters;
          return data.reciters;
        }
      }
    } catch (err) {
      console.warn("Error fetching reciters from API, using fallback famous reciters:", err);
    }
    return FAMOUS_RECITERS;
  }

  // Get all recordings for a specific reciter
  async getReciterAudio(reciterId: string | number): Promise<ApiReciterAudioResponse | null> {
    try {
      const resp = await fetch(`https://quran.yousefheiba.com/api/reciterAudio?reciter_id=${reciterId}`);
      if (resp.ok) {
        return await resp.json();
      }
    } catch (err) {
      console.warn(`Error fetching audio tracks for reciter ${reciterId}:`, err);
    }
    return null;
  }

  // Get all 114 surahs metadata
  async getSurahs(): Promise<ApiSurahItem[]> {
    if (this.surahsCache && this.surahsCache.length === 114) {
      return this.surahsCache;
    }
    try {
      const resp = await fetch("https://quran.yousefheiba.com/api/surahs");
      if (resp.ok) {
        const data = await resp.json();
        if (Array.isArray(data) && data.length > 0) {
          this.surahsCache = data;
          return data;
        }
      }
    } catch (err) {
      console.warn("Error fetching surahs from API:", err);
    }
    return [];
  }

  // Get full Ayahs of a specific Surah
  async getSurahAyahs(surahNumber: number): Promise<ApiAyahItem[]> {
    if (this.ayahsCache.has(surahNumber)) {
      return this.ayahsCache.get(surahNumber)!;
    }

    try {
      const resp = await fetch(`https://quran.yousefheiba.com/api/ayah?number=${surahNumber}`);
      if (resp.ok) {
        const data = await resp.json();
        if (Array.isArray(data) && data.length > 0) {
          this.ayahsCache.set(surahNumber, data);
          return data;
        }
      }
    } catch (err) {
      console.warn(`Error fetching ayahs for surah ${surahNumber} from API:`, err);
    }

    // Secondary fallback: Al-Quran Cloud API
    try {
      const fallbackResp = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}`);
      if (fallbackResp.ok) {
        const fbData = await fallbackResp.json();
        if (fbData?.data?.ayahs && Array.isArray(fbData.data.ayahs)) {
          const mapped: ApiAyahItem[] = fbData.data.ayahs.map((a: any) => ({
            id: String(a.number),
            number: String(a.number),
            text: a.text,
            number_in_surah: String(a.numberInSurah),
            page: String(a.page),
            surah_id: String(surahNumber),
            juz_id: String(a.juz),
          }));
          this.ayahsCache.set(surahNumber, mapped);
          return mapped;
        }
      }
    } catch (fbErr) {
      console.warn(`Fallback Al-Quran Cloud failed for surah ${surahNumber}:`, fbErr);
    }

    return [];
  }

  // Get full page text with ayahs and surah metadata
  async getQuranPageText(page: number): Promise<ApiQuranPageTextResponse | null> {
    if (this.pageTextCache.has(page)) {
      return this.pageTextCache.get(page)!;
    }
    try {
      const resp = await fetch(`https://quran.yousefheiba.com/api/quranPagesText?page=${page}`);
      if (resp.ok) {
        const data = await resp.json();
        this.pageTextCache.set(page, data);
        return data;
      }
    } catch (err) {
      console.warn(`Error fetching page text for page ${page}:`, err);
    }
    return null;
  }

  // Get Comprehensive Azkar
  async getAzkar(): Promise<ApiAzkarResponse | null> {
    if (this.azkarCache) return this.azkarCache;
    try {
      const resp = await fetch("https://quran.yousefheiba.com/api/azkar");
      if (resp.ok) {
        const data = await resp.json();
        this.azkarCache = data;
        return data;
      }
    } catch (err) {
      console.warn("Error fetching azkar from API:", err);
    }
    return null;
  }

  // Get Comprehensive Duas
  async getDuas(): Promise<ApiDuasResponse | null> {
    if (this.duasCache) return this.duasCache;
    try {
      const resp = await fetch("https://quran.yousefheiba.com/api/duas");
      if (resp.ok) {
        const data = await resp.json();
        this.duasCache = data;
        return data;
      }
    } catch (err) {
      console.warn("Error fetching duas from API:", err);
    }
    return null;
  }

  // Get Laylat Al-Qadr encyclopedic knowledge
  async getLaylatAlQadr(): Promise<ApiLaylatAlQadrResponse | null> {
    if (this.laylatAlQadrCache) return this.laylatAlQadrCache;
    try {
      const resp = await fetch("https://quran.yousefheiba.com/api/laylatAlQadr");
      if (resp.ok) {
        const data = await resp.json();
        this.laylatAlQadrCache = data;
        return data;
      }
    } catch (err) {
      console.warn("Error fetching laylat al-qadr info:", err);
    }
    return null;
  }

  // Construct official Surah Audio URL
  getSurahAudioUrl(reciterShortName: string, surahNumber: number): string {
    return `https://quran.yousefheiba.com/api/surahAudio?reciter=${encodeURIComponent(reciterShortName)}&id=${surahNumber}`;
  }
}

export const quranApiService = new QuranApiService();
