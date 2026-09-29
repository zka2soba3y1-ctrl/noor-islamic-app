/**
 * MP3Quran Audio Service
 * Integrates MP3Quran v3 API and official Islamic audio sources,
 * with centralized audio collision prevention across the application.
 */

export interface MP3QuranReciter {
  id: number | string;
  name: string;
  letter: string;
  rewaya?: string;
  server?: string;
  count?: number;
  suras?: string;
}

export interface MP3QuranMoshaf {
  id: number;
  name: string;
  server: string;
  surah_total: number;
  moshaf_type: number;
  surah_list: string;
}

// Built-in verified MP3Quran reciters with direct server CDNs for zero latency & fallback
export const VERIFIED_MP3QURAN_RECITERS: MP3QuranReciter[] = [
  {
    id: 123,
    name: "مشاري راشد العفاسي",
    letter: "م",
    rewaya: "حفص عن عاصم",
    server: "https://server8.mp3quran.net/afs/",
    count: 114,
  },
  {
    id: 51,
    name: "عبد الباسط عبد الصمد (مرتل)",
    letter: "ع",
    rewaya: "حفص عن عاصم",
    server: "https://server7.mp3quran.net/basit/",
    count: 114,
  },
  {
    id: 52,
    name: "عبد الباسط عبد الصمد (المجود)",
    letter: "ع",
    rewaya: "المجود",
    server: "https://server7.mp3quran.net/basit/Mujawwad/",
    count: 114,
  },
  {
    id: 112,
    name: "محمد صديق المنشاوي (مرتل)",
    letter: "م",
    rewaya: "حفص عن عاصم",
    server: "https://server10.mp3quran.net/minsh/",
    count: 114,
  },
  {
    id: 113,
    name: "محمد صديق المنشاوي (المجود)",
    letter: "م",
    rewaya: "المجود",
    server: "https://server10.mp3quran.net/minsh/Mujawwad/",
    count: 114,
  },
  {
    id: 118,
    name: "محمود خليل الحصري",
    letter: "م",
    rewaya: "حفص عن عاصم",
    server: "https://server13.mp3quran.net/hssr/",
    count: 114,
  },
  {
    id: 102,
    name: "ماهر المعيقلي",
    letter: "م",
    rewaya: "حفص عن عاصم",
    server: "https://server12.mp3quran.net/maher/",
    count: 114,
  },
  {
    id: 54,
    name: "عبد الرحمن السديس",
    letter: "ع",
    rewaya: "حفص عن عاصم",
    server: "https://server11.mp3quran.net/sds/",
    count: 114,
  },
  {
    id: 31,
    name: "سعود الشريم",
    letter: "س",
    rewaya: "حفص عن عاصم",
    server: "https://server7.mp3quran.net/shur/",
    count: 114,
  },
  {
    id: 30,
    name: "سعد الغامدي",
    letter: "س",
    rewaya: "حفص عن عاصم",
    server: "https://server7.mp3quran.net/s_gmd/",
    count: 114,
  },
  {
    id: 92,
    name: "ياسر الدوسري",
    letter: "ي",
    rewaya: "حفص عن عاصم",
    server: "https://server11.mp3quran.net/yasser/",
    count: 114,
  },
  {
    id: 1,
    name: "أبو بكر الشاطري",
    letter: "أ",
    rewaya: "حفص عن عاصم",
    server: "https://server11.mp3quran.net/shatri/",
    count: 114,
  },
  {
    id: 17,
    name: "فارس عباد",
    letter: "ف",
    rewaya: "حفص عن عاصم",
    server: "https://server8.mp3quran.net/frs_a/",
    count: 114,
  },
  {
    id: 80,
    name: "ناصر القطامي",
    letter: "ن",
    rewaya: "حفص عن عاصم",
    server: "https://server6.mp3quran.net/qtm/",
    count: 114,
  },
  {
    id: 20,
    name: "علي جابر",
    letter: "ع",
    rewaya: "حفص عن عاصم",
    server: "https://server11.mp3quran.net/a_jbr/",
    count: 114,
  },
  {
    id: 18,
    name: "خالد القحطاني",
    letter: "خ",
    rewaya: "حفص عن عاصم",
    server: "https://server10.mp3quran.net/qht/",
    count: 114,
  },
  {
    id: 64,
    name: "علي الحذيفي",
    letter: "ع",
    rewaya: "حفص عن عاصم",
    server: "https://server9.mp3quran.net/hthfi/",
    count: 114,
  },
  {
    id: 97,
    name: "محمد أيوب",
    letter: "م",
    rewaya: "حفص عن عاصم",
    server: "https://server8.mp3quran.net/ayyub/",
    count: 114,
  },
  {
    id: 104,
    name: "محمد جبريل",
    letter: "م",
    rewaya: "حفص عن عاصم",
    server: "https://server8.mp3quran.net/jbrl/",
    count: 114,
  },
  {
    id: 108,
    name: "محمود علي البنا",
    letter: "م",
    rewaya: "حفص عن عاصم",
    server: "https://server8.mp3quran.net/bna/",
    count: 114,
  },
];

class AudioCoordinator {
  private activePlayerId: string | null = null;
  private listeners: Set<(activeId: string | null) => void> = new Set();

  constructor() {
    if (typeof window !== "undefined") {
      window.addEventListener("noor-pause-all-audio", (e: any) => {
        const sender = e?.detail?.sender;
        this.pauseAllMediaElements(sender);
      });
    }
  }

  // Register an audio playback session
  startPlayback(sourceId: string, audioElement?: HTMLAudioElement | null) {
    this.activePlayerId = sourceId;

    // Pause all other audio elements in the entire DOM
    if (typeof document !== "undefined") {
      document.querySelectorAll("audio").forEach((el) => {
        if (audioElement && el === audioElement) return;
        try {
          el.pause();
        } catch {
          // ignore
        }
      });
    }

    // Dispatch global custom event
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("noor-pause-all-audio", {
          detail: { sender: sourceId },
        })
      );
    }

    this.notifyListeners();
  }

  stopPlayback(sourceId?: string) {
    if (!sourceId || this.activePlayerId === sourceId) {
      this.activePlayerId = null;
      this.notifyListeners();
    }
  }

  pauseAllMediaElements(exceptSender?: string) {
    if (typeof document !== "undefined") {
      document.querySelectorAll("audio").forEach((el) => {
        const isSelf = (el as any).dataset?.sourceId === exceptSender;
        if (!isSelf) {
          try {
            el.pause();
          } catch {
            // ignore
          }
        }
      });
    }
    if (exceptSender) {
      this.activePlayerId = exceptSender;
    } else {
      this.activePlayerId = null;
    }
    this.notifyListeners();
  }

  subscribe(listener: (activeId: string | null) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach((l) => l(this.activePlayerId));
  }

  getActivePlayerId() {
    return this.activePlayerId;
  }
}

export const audioCoordinator = new AudioCoordinator();

class MP3QuranService {
  private recitersCache: MP3QuranReciter[] | null = null;

  // Format surah number to 3-digit string (e.g. 1 -> "001")
  formatSurahNumber(surahNumber: number): string {
    if (surahNumber < 10) return `00${surahNumber}`;
    if (surahNumber < 100) return `0${surahNumber}`;
    return `${surahNumber}`;
  }

  // Fetch full reciters catalog from MP3Quran API v3 or fallback
  async fetchReciters(): Promise<MP3QuranReciter[]> {
    if (this.recitersCache && this.recitersCache.length > 0) {
      return this.recitersCache;
    }

    try {
      const resp = await fetch("https://mp3quran.net/api/v3/reciters?language=ar");
      if (resp.ok) {
        const data = await resp.json();
        if (data && Array.isArray(data.reciters)) {
          const mapped: MP3QuranReciter[] = data.reciters.map((r: any) => {
            const defaultMoshaf = r.moshaf?.[0];
            return {
              id: r.id,
              name: r.name,
              letter: r.letter,
              rewaya: defaultMoshaf?.name || "حفص عن عاصم",
              server: defaultMoshaf?.server,
              count: defaultMoshaf?.surah_total || 114,
              suras: defaultMoshaf?.surah_list,
            };
          });
          this.recitersCache = mapped;
          return mapped;
        }
      }
    } catch (err) {
      console.warn("MP3Quran API v3 offline, using verified reciters fallback:", err);
    }

    return VERIFIED_MP3QURAN_RECITERS;
  }

  // Get audio stream for a given reciter and surah
  getSurahAudioUrl(reciter: MP3QuranReciter, surahNumber: number): string {
    const formatted = this.formatSurahNumber(surahNumber);
    if (reciter.server) {
      const serverClean = reciter.server.endsWith("/") ? reciter.server : `${reciter.server}/`;
      return `${serverClean}${formatted}.mp3`;
    }
    // Fallback to official endpoint
    return `https://quran.yousefheiba.com/api/surahAudio?reciter=Mishary-Alafasi&id=${surahNumber}`;
  }
}

export const mp3QuranService = new MP3QuranService();
