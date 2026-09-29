/**
 * Quran Audio & Ayah Link Service
 * Provides precise mapping between:
 *  - 604 Quran Mushaf Pages
 *  - Surahs (1..114) and Ayahs (1..6236)
 *  - Top Reciters with Ayah-by-Ayah playback and Full Surah audio
 *  - Seamless start point selection (choose Surah, Page, and Ayah where recitation begins)
 */

export interface QuranAudioReciter {
  id: string;
  name: string;
  subname?: string;
  everyAyahFolder: string; // for everyayah.com CDN
  mp3QuranServer?: string; // for whole surah playback
  isMurattal?: boolean;
}

export interface PageAyah {
  number: number; // Global ayah index 1..6236
  numberInSurah: number; // 1..286
  surahNumber: number; // 1..114
  surahNameAr: string;
  text: string;
  page: number; // 1..604
  juz: number; // 1..30
}

export const QURAN_RECITERS: QuranAudioReciter[] = [
  {
    id: "alafasy",
    name: "مشاري راشد العفاسي",
    subname: "حفص عن عاصم",
    everyAyahFolder: "Alafasy_128kbps",
    mp3QuranServer: "https://server8.mp3quran.net/afs/",
  },
  {
    id: "abdulbasit_murattal",
    name: "عبد الباسط عبد الصمد",
    subname: "مرتل - جودة عالية",
    everyAyahFolder: "Abdul_Basit_Murattal_192kbps",
    mp3QuranServer: "https://server7.mp3quran.net/basit/",
    isMurattal: true,
  },
  {
    id: "abdulbasit_mujawwad",
    name: "عبد الباسط عبد الصمد",
    subname: "المجود",
    everyAyahFolder: "Abdul_Basit_Mujawwad_128kbps",
    mp3QuranServer: "https://server7.mp3quran.net/basit/Mujawwad/",
  },
  {
    id: "minshawi_murattal",
    name: "محمد صديق المنشاوي",
    subname: "مرتل - خاشع",
    everyAyahFolder: "Minshawy_Murattal_128kbps",
    mp3QuranServer: "https://server10.mp3quran.net/minsh/",
    isMurattal: true,
  },
  {
    id: "minshawi_mujawwad",
    name: "محمد صديق المنشاوي",
    subname: "المجود الشهير",
    everyAyahFolder: "Minshawy_Mujawwad_192kbps",
    mp3QuranServer: "https://server10.mp3quran.net/minsh/Mujawwad/",
  },
  {
    id: "husary_murattal",
    name: "محمود خليل الحصري",
    subname: "مرتل - متقن الأحكام",
    everyAyahFolder: "Husary_128kbps",
    mp3QuranServer: "https://server13.mp3quran.net/hssr/",
    isMurattal: true,
  },
  {
    id: "husary_mujawwad",
    name: "محمود خليل الحصري",
    subname: "المجود",
    everyAyahFolder: "Husary_128kbps_Mujawwad",
  },
  {
    id: "husary_muallim",
    name: "محمود خليل الحصري",
    subname: "المصحف المعلم",
    everyAyahFolder: "Husary_Muallim_128kbps",
  },
  {
    id: "maher_muaiqly",
    name: "ماهر المعيقلي",
    subname: "إمام المسجد الحرام",
    everyAyahFolder: "MaherAlMuaiqly128kbps",
    mp3QuranServer: "https://server12.mp3quran.net/maher/",
  },
  {
    id: "sudais",
    name: "عبد الرحمن السديس",
    subname: "إمام وخطيب المسجد الحرام",
    everyAyahFolder: "Abdurrahmaan_As-Sudais_192kbps",
    mp3QuranServer: "https://server11.mp3quran.net/sds/",
  },
  {
    id: "shuraim",
    name: "سعود الشريم",
    subname: "تلاوة الحرم المكي",
    everyAyahFolder: "Saood_ash-Shuraym_128kbps",
    mp3QuranServer: "https://server7.mp3quran.net/shur/",
  },
  {
    id: "ghamdi",
    name: "سعد الغامدي",
    subname: "حفص عن عاصم",
    everyAyahFolder: "Ghamadi_40kbps",
    mp3QuranServer: "https://server7.mp3quran.net/s_gmd/",
  },
  {
    id: "ajamy",
    name: "أحمد بن علي العجمي",
    subname: "تلاوة عذبة مؤثرة",
    everyAyahFolder: "ahmed_ibn_ali_al_ajamy_128kbps",
  },
  {
    id: "shatri",
    name: "أبو بكر الشاطري",
    subname: "حفص عن عاصم",
    everyAyahFolder: "Abu_Bakr_Ash-Shaatree_128kbps",
    mp3QuranServer: "https://server11.mp3quran.net/shatri/",
  },
  {
    id: "hudhaify",
    name: "علي بن عبد الرحمن الحذيفي",
    subname: "إمام المسجد النبوي",
    everyAyahFolder: "Hudhaify_128kbps",
    mp3QuranServer: "https://server9.mp3quran.net/hthfi/",
  },
  {
    id: "yasser_dossari",
    name: "ياسر الدوسري",
    subname: "إمام المسجد الحرام",
    everyAyahFolder: "Yasser_Ad-Dussary_128kbps",
    mp3QuranServer: "https://server11.mp3quran.net/yasser/",
  },
  {
    id: "nasser_qatami",
    name: "ناصر القطامي",
    subname: "تلاوة خاشعة",
    everyAyahFolder: "Nasser_Alqatami_128kbps",
    mp3QuranServer: "https://server6.mp3quran.net/qtm/",
  },
  {
    id: "fares_abbad",
    name: "فارس عباد",
    subname: "تلاوة يمنية شجية",
    everyAyahFolder: "Fares_Abbad_64kbps",
    mp3QuranServer: "https://server8.mp3quran.net/frs_a/",
  },
  {
    id: "jibreel",
    name: "محمد جبريل",
    subname: "جامع عمرو بن العاص",
    everyAyahFolder: "Muhammad_Jibreel_128kbps",
    mp3QuranServer: "https://server8.mp3quran.net/jbrl/",
  },
  {
    id: "ayyoub",
    name: "محمد أيوب",
    subname: "إمام المسجد النبوي",
    everyAyahFolder: "Muhammad_Ayyoub_128kbps",
    mp3QuranServer: "https://server8.mp3quran.net/ayyub/",
  },
  {
    id: "basfar",
    name: "عبد الله بصفر",
    subname: "حفص عن عاصم",
    everyAyahFolder: "Abdullah_Basfar_192kbps",
  },
  {
    id: "matroud",
    name: "عبد الله المطرود",
    subname: "حفص عن عاصم",
    everyAyahFolder: "Abdullah_Matroud_128kbps",
  },
];

class QuranAyahAudioService {
  private pageCache: Map<number, PageAyah[]> = new Map();
  private pageFetchPromises: Map<number, Promise<PageAyah[]>> = new Map();

  /**
   * Format Surah number with 3 digits (e.g., 1 -> "001")
   */
  pad3(n: number): string {
    if (n < 10) return `00${n}`;
    if (n < 100) return `0${n}`;
    return `${n}`;
  }

  /**
   * Constructs high quality direct audio URL for a single Ayah
   */
  getAyahAudioUrl(
    reciter: QuranAudioReciter,
    surahNumber: number,
    ayahInSurah: number
  ): string {
    const sStr = this.pad3(surahNumber);
    const aStr = this.pad3(ayahInSurah);
    return `https://everyayah.com/data/${reciter.everyAyahFolder}/${sStr}${aStr}.mp3`;
  }

  /**
   * Fallback secondary audio URL for a single Ayah
   */
  getAyahSecondaryAudioUrl(
    reciter: QuranAudioReciter,
    globalAyahNumber: number,
    surahNumber: number,
    ayahInSurah: number
  ): string {
    // Alafasy CDN on Islamic Network as dependable mirror
    if (reciter.id === "alafasy") {
      return `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${globalAyahNumber}.mp3`;
    }
    const sStr = this.pad3(surahNumber);
    const aStr = this.pad3(ayahInSurah);
    return `https://everyayah.com/data/Alafasy_128kbps/${sStr}${aStr}.mp3`;
  }

  /**
   * Fetch all Ayahs contained on a given Mushaf page (1..604)
   * Returns clean list with text, numbers, surah metadata
   */
  async getPageAyahs(pageNumber: number): Promise<PageAyah[]> {
    const clamped = Math.max(1, Math.min(604, Math.floor(pageNumber)));
    if (this.pageCache.has(clamped)) {
      return this.pageCache.get(clamped)!;
    }
    if (this.pageFetchPromises.has(clamped)) {
      return this.pageFetchPromises.get(clamped)!;
    }

    const fetchPromise = (async () => {
      try {
        const resp = await fetch(
          `https://api.alquran.cloud/v1/page/${clamped}/quran-uthmani`,
          { cache: "force-cache" }
        );
        if (resp.ok) {
          const json = await resp.json();
          if (json?.data?.ayahs && Array.isArray(json.data.ayahs)) {
            const mapped: PageAyah[] = json.data.ayahs.map((a: any) => ({
              number: a.number,
              numberInSurah: a.numberInSurah,
              surahNumber: a.surah?.number || 1,
              surahNameAr: a.surah?.name || "",
              text: a.text,
              page: clamped,
              juz: a.juz || 1,
            }));
            this.pageCache.set(clamped, mapped);
            return mapped;
          }
        }
      } catch (err) {
        console.warn(`Error fetching ayahs for page ${clamped}:`, err);
      } finally {
        this.pageFetchPromises.delete(clamped);
      }

      // If network fails, return cached if any or empty array
      return this.pageCache.get(clamped) || [];
    })();

    this.pageFetchPromises.set(clamped, fetchPromise);
    return fetchPromise;
  }

  /**
   * Prefetches adjacent pages ayahs in background
   */
  prefetchAdjacent(currentPage: number) {
    const next = currentPage + 1;
    const prev = currentPage - 1;
    if (next <= 604 && !this.pageCache.has(next)) {
      this.getPageAyahs(next).catch(() => {});
    }
    if (prev >= 1 && !this.pageCache.has(prev)) {
      this.getPageAyahs(prev).catch(() => {});
    }
  }
}

export const quranAyahAudioService = new QuranAyahAudioService();
