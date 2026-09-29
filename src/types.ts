export type AppMode = "sensory" | "visual" | "blueprint";
export type ThemeMode = "natural" | "paper" | "night" | "light";

export interface AppSettings {
  theme: ThemeMode;
  calculationMethod: string;
  asrJuristic: "standard" | "hanafi";
  fontSize: "normal" | "medium" | "large";
  soundEffects: boolean;
  adhanReciter: "makkah" | "madinah" | "quds";
}

export interface UserGeoLocation {
  city: string;
  country: string;
  lat: number;
  lng: number;
  timezone: number;
  isAutoDetected: boolean;
}

export interface PrayerTimeItem {
  id: string;
  nameAr: string;
  nameEn: string;
  time: string; // HH:mm
  timestamp: number;
  isPassed: boolean;
  isNext: boolean;
}

export interface CalculationMethod {
  id: string;
  name: string;
  fajrAngle: number;
  ishaAngle: number;
}

export interface SurahMeta {
  number: number;
  nameAr: string;
  nameEn: string;
  revelationType: "Meccan" | "Medinan";
  numberOfAyahs: number;
  audioUrl?: string;
  startPage?: number;
}

export interface AyahItem {
  surahNumber: number;
  ayahNumber: number;
  text: string;
  tafsir: string;
  audioUrl?: string;
}

export interface ReciterItem {
  id: number;
  name: string;
  server: string;
  rewaya: string;
  count: number;
}

export interface ThikrItem {
  id: string;
  text: string;
  repeat: number;
  count: number;
  virtue: string;
}

export interface RadioStation {
  id: number;
  name: string;
  url: string;
}

export interface VoiceCommandResult {
  action: "play_quran" | "prayer_time" | "qibla" | "athkar" | "tasbih" | "switch_mode" | "gemini_query";
  payload?: any;
  spokenFeedback: string;
}
