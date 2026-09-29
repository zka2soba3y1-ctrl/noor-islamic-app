/**
 * adhanService.ts
 * Comprehensive Islamic Adhan Audio & Scheduling Service
 * Supports:
 * 1. Authentic Makkah Al-Mukarramah Adhan (Sheikh Ali Ahmed Mulla)
 * 2. Al-Madinah Al-Munawwarah Adhan (Sheikh Essam Bukhari)
 * 3. Al-Aqsa Mosque Adhan (Al-Quds)
 * 4. User Custom Uploaded Adhan File (Persisted in IndexedDB / localStorage)
 * 5. Automatic prayer time detection and Adhan triggering
 */

export interface AdhanReciterOption {
  id: string;
  nameAr: string;
  locationAr: string;
  audioUrl: string;
  durationEstimateSec: number;
}

export const ADHAN_RECITERS: AdhanReciterOption[] = [
  {
    id: "makkah_ali_mulla",
    nameAr: "الشيخ علي أحمد ملا",
    locationAr: "أذان الحرم المكي الشريف (مكة المكرمة)",
    // Authentic Sheikh Ali Mulla Adhan embedded locally in the app
    audioUrl: "/audio/adhan.mp3",
    durationEstimateSec: 204, // 3:24
  },
  {
    id: "madinah_essam",
    nameAr: "الشيخ عصام بخاري",
    locationAr: "أذان المسجد النبوي الشريف (المدينة المنورة)",
    audioUrl: "/audio/adhan_madinah.mp3",
    durationEstimateSec: 195,
  },
  {
    id: "quds_alaqsa",
    nameAr: "مؤذنو المسجد الأقصى",
    locationAr: "أذان المسجد الأقصى المبارك (القدس الشريف)",
    audioUrl: "/audio/adhan_quds.mp3",
    durationEstimateSec: 210,
  },
  {
    id: "egypt_mustafa",
    nameAr: "الشيخ مصطفى إسماعيل",
    locationAr: "الأذان المصري برحاب مسجد الإمام الحسين",
    audioUrl: "/audio/adhan_egypt.mp3",
    durationEstimateSec: 180,
  }
];

// Fallback audio URLs for high availability
const FALLBACK_ADHAN_URLS = [
  "/audio/adhan.mp3",
  "/audio/adhan_madinah.mp3",
  "https://www.islamcan.com/audio/adhan/azan1.mp3",
  "https://www.islamcan.com/audio/adhan/azan2.mp3",
];

const CUSTOM_ADHAN_DB_NAME = "NoorCustomAdhanDB";
const CUSTOM_ADHAN_STORE_NAME = "audio_blobs";

class AdhanService {
  private audio: HTMLAudioElement | null = null;
  private isPlaying: boolean = false;
  private currentReciterId: string = "makkah_ali_mulla";
  private customAudioDataUrl: string | null = null;
  private listeners: Set<(state: { isPlaying: boolean; reciterId: string; progress: number; duration: number }) => void> = new Set();
  private autoAdhanEnabled: boolean = true;
  private lastTriggeredPrayerKey: string = "";

  constructor() {
    // Load preference from localStorage
    try {
      const savedReciter = localStorage.getItem("noor_adhan_reciter_id");
      if (savedReciter) this.currentReciterId = savedReciter;
      
      const savedAuto = localStorage.getItem("noor_auto_adhan_enabled");
      if (savedAuto !== null) this.autoAdhanEnabled = savedAuto === "true";

      // Load custom audio if saved
      this.loadCustomAudioFromDB();
    } catch {}
  }

  // Subscribe to playback changes
  public subscribe(listener: (state: { isPlaying: boolean; reciterId: string; progress: number; duration: number }) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const progress = this.audio ? this.audio.currentTime : 0;
    const duration = this.audio && !isNaN(this.audio.duration) ? this.audio.duration : 204;
    this.listeners.forEach((fn) =>
      fn({
        isPlaying: this.isPlaying,
        reciterId: this.currentReciterId,
        progress,
        duration,
      })
    );
  }

  // Set selected reciter
  public setReciter(reciterId: string) {
    this.currentReciterId = reciterId;
    try {
      localStorage.setItem("noor_adhan_reciter_id", reciterId);
    } catch {}
    this.notify();
  }

  public getReciter(): string {
    return this.currentReciterId;
  }

  public isAutoAdhanEnabled(): boolean {
    return this.autoAdhanEnabled;
  }

  public setAutoAdhanEnabled(enabled: boolean) {
    this.autoAdhanEnabled = enabled;
    try {
      localStorage.setItem("noor_auto_adhan_enabled", String(enabled));
    } catch {}
  }

  public getActiveReciterMeta(): AdhanReciterOption {
    if (this.currentReciterId === "custom" && this.customAudioDataUrl) {
      return {
        id: "custom",
        nameAr: "صوت الأذان المرفوع الخاص بك",
        locationAr: "ملف الصوت الشخصي للمستخدم",
        audioUrl: this.customAudioDataUrl,
        durationEstimateSec: 204,
      };
    }
    const found = ADHAN_RECITERS.find((r) => r.id === this.currentReciterId);
    return found || ADHAN_RECITERS[0];
  }

  // Save custom audio file (from user upload) to IndexedDB
  public async saveCustomAdhanFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        this.customAudioDataUrl = dataUrl;
        this.currentReciterId = "custom";
        try {
          localStorage.setItem("noor_adhan_reciter_id", "custom");
          await this.persistCustomAudioToDB(dataUrl);
        } catch (e) {
          console.warn("Could not persist to DB:", e);
        }
        this.notify();
        resolve(dataUrl);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  public hasCustomAudio(): boolean {
    return Boolean(this.customAudioDataUrl);
  }

  private async persistCustomAudioToDB(dataUrl: string): Promise<void> {
    if (!window.indexedDB) return;
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(CUSTOM_ADHAN_DB_NAME, 1);
      request.onupgradeneeded = (e: any) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(CUSTOM_ADHAN_STORE_NAME)) {
          db.createObjectStore(CUSTOM_ADHAN_STORE_NAME);
        }
      };
      request.onsuccess = (e: any) => {
        const db = e.target.result;
        const tx = db.transaction(CUSTOM_ADHAN_STORE_NAME, "readwrite");
        const store = tx.objectStore(CUSTOM_ADHAN_STORE_NAME);
        store.put(dataUrl, "user_uploaded_adhan");
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      };
      request.onerror = () => reject(request.error);
    });
  }

  private async loadCustomAudioFromDB(): Promise<void> {
    if (!window.indexedDB) return;
    return new Promise((resolve) => {
      const request = indexedDB.open(CUSTOM_ADHAN_DB_NAME, 1);
      request.onupgradeneeded = (e: any) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(CUSTOM_ADHAN_STORE_NAME)) {
          db.createObjectStore(CUSTOM_ADHAN_STORE_NAME);
        }
      };
      request.onsuccess = (e: any) => {
        const db = e.target.result;
        const tx = db.transaction(CUSTOM_ADHAN_STORE_NAME, "readonly");
        const store = tx.objectStore(CUSTOM_ADHAN_STORE_NAME);
        const getReq = store.get("user_uploaded_adhan");
        getReq.onsuccess = () => {
          if (getReq.result) {
            this.customAudioDataUrl = getReq.result;
            this.notify();
          }
          resolve();
        };
        getReq.onerror = () => resolve();
      };
      request.onerror = () => resolve();
    });
  }

  // Play Adhan Audio
  public async play(options?: { reciterId?: string; isAutoTrigger?: boolean; prayerName?: string }): Promise<void> {
    if (options?.reciterId) {
      this.currentReciterId = options.reciterId;
    }

    this.stop();

    const reciter = this.getActiveReciterMeta();
    const url = reciter.audioUrl;

    this.audio = new Audio(url);
    this.audio.preload = "auto";
    this.audio.volume = 1.0;

    // Track state
    this.audio.onplay = () => {
      this.isPlaying = true;
      this.notify();
      window.dispatchEvent(
        new CustomEvent("noor-adhan-started", {
          detail: {
            prayerName: options?.prayerName || "الصلاة",
            reciterName: reciter.nameAr,
            locationAr: reciter.locationAr,
            isAuto: options?.isAutoTrigger || false,
          },
        })
      );
    };

    this.audio.ontimeupdate = () => {
      this.notify();
    };

    this.audio.onended = () => {
      this.isPlaying = false;
      this.notify();
      window.dispatchEvent(
        new CustomEvent("noor-adhan-ended", {
          detail: {
            prayerName: options?.prayerName || "الصلاة",
          },
        })
      );
    };

    this.audio.onerror = (e) => {
      console.warn("Primary Adhan stream error, trying fallback...", e);
      // Try fallback URL if primary fails
      if (this.currentReciterId !== "custom") {
        this.tryFallbackPlayback();
      } else {
        this.isPlaying = false;
        this.notify();
      }
    };

    try {
      await this.audio.play();
    } catch (err: any) {
      console.warn("Autoplay audio blocked or error:", err);
      // If user hasn't interacted yet, browser might block audio.play()
      this.isPlaying = false;
      this.notify();
    }
  }

  private tryFallbackPlayback() {
    let fallbackIdx = 0;
    const playNextFallback = () => {
      if (fallbackIdx >= FALLBACK_ADHAN_URLS.length) {
        this.isPlaying = false;
        this.notify();
        return;
      }
      const nextUrl = FALLBACK_ADHAN_URLS[fallbackIdx++];
      this.audio = new Audio(nextUrl);
      this.audio.onplay = () => {
        this.isPlaying = true;
        this.notify();
      };
      this.audio.onended = () => {
        this.isPlaying = false;
        this.notify();
      };
      this.audio.onerror = () => {
        playNextFallback();
      };
      this.audio.play().catch(() => playNextFallback());
    };
    playNextFallback();
  }

  // Toggle playback
  public toggle(options?: { reciterId?: string }): void {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.play(options);
    }
  }

  // Stop playback immediately
  public stop(): void {
    if (this.audio) {
      try {
        this.audio.pause();
        this.audio.currentTime = 0;
      } catch {}
      this.audio = null;
    }
    this.isPlaying = false;
    this.notify();
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentTime(): number {
    return this.audio?.currentTime || 0;
  }

  public getDuration(): number {
    return this.audio && !isNaN(this.audio.duration) ? this.audio.duration : 204;
  }

  /**
   * Check if current time matches any prayer time to trigger automatic Adhan
   */
  public checkPrayerTimeTrigger(
    prayerTimes: Array<{ id: string; nameAr: string; time: string; timestamp?: number }>,
    cityName: string
  ) {
    if (!this.autoAdhanEnabled || this.isPlaying) return;

    const now = new Date();
    const currentHours = String(now.getHours()).padStart(2, "0");
    const currentMins = String(now.getMinutes()).padStart(2, "0");
    const currentTimeStr = `${currentHours}:${currentMins}`;
    const todayDateStr = now.toISOString().split("T")[0];

    // Check each actual prayer (Fajr, Dhuhr, Asr, Maghrib, Isha)
    const adhanPrayers = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

    for (const p of prayerTimes) {
      if (!adhanPrayers.includes(p.id)) continue;

      // Clean prayer time (e.g., "12:15" or "04:35")
      const pTimeClean = p.time.replace(/[^\d:]/g, "").slice(0, 5);

      if (pTimeClean === currentTimeStr) {
        const triggerKey = `${todayDateStr}_${p.id}_${currentTimeStr}`;
        if (this.lastTriggeredPrayerKey !== triggerKey) {
          this.lastTriggeredPrayerKey = triggerKey;
          console.log(`[AdhanService] Auto-triggering Adhan for ${p.nameAr} in ${cityName} at ${currentTimeStr}`);
          this.play({
            prayerName: p.nameAr,
            isAutoTrigger: true,
          });
          break;
        }
      }
    }
  }
}

export const adhanService = new AdhanService();
