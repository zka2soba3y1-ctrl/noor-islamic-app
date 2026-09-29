/**
 * Offline Astronomical Prayer Times & Qibla Bearing Calculation Engine
 * 100% On-device, Zero external API latency, works offline
 */

import { PrayerTimeItem, CalculationMethod } from "../types";

export const MAKKAH_LAT = 21.4225;
export const MAKKAH_LNG = 39.8262;

export const CALCULATION_METHODS: Record<string, CalculationMethod> = {
  makkah: {
    id: "makkah",
    name: "جامعة أم القرى (مكة المكرمة)",
    fajrAngle: 18.5,
    ishaAngle: 0, // 90 mins after Maghrib
  },
  egypt: {
    id: "egypt",
    name: "الهيئة المصرية العامة للمساحة",
    fajrAngle: 19.5,
    ishaAngle: 17.5,
  },
  mwl: {
    id: "mwl",
    name: "رابطة العالم الإسلامي",
    fajrAngle: 18.0,
    ishaAngle: 17.0,
  },
  isna: {
    id: "isna",
    name: "الجمعية الإسلامية لأمريكا الشمالية (ISNA)",
    fajrAngle: 15.0,
    ishaAngle: 15.0,
  },
};

export interface CityPreset {
  nameAr: string;
  nameEn: string;
  lat: number;
  lng: number;
  timezone: number;
}

export const CITIES_PRESETS: CityPreset[] = [
  { nameAr: "مكة المكرمة", nameEn: "Makkah", lat: 21.4225, lng: 39.8262, timezone: 3 },
  { nameAr: "المدينة المنورة", nameEn: "Madinah", lat: 24.4672, lng: 39.6111, timezone: 3 },
  { nameAr: "الرياض", nameEn: "Riyadh", lat: 24.7136, lng: 46.6753, timezone: 3 },
  { nameAr: "القاهرة", nameEn: "Cairo", lat: 30.0444, lng: 31.2357, timezone: 2 },
  { nameAr: "القدس الشريف", nameEn: "Jerusalem", lat: 31.7683, lng: 35.2137, timezone: 3 },
  { nameAr: "دبي", nameEn: "Dubai", lat: 25.2048, lng: 55.2708, timezone: 4 },
  { nameAr: "إسطنبول", nameEn: "Istanbul", lat: 41.0082, lng: 28.9784, timezone: 3 },
  { nameAr: "لندن", nameEn: "London", lat: 51.5074, lng: -0.1278, timezone: 0 },
  { nameAr: "باريس", nameEn: "Paris", lat: 48.8566, lng: 2.3522, timezone: 1 },
  { nameAr: "جاكرتا", nameEn: "Jakarta", lat: -6.2088, lng: 106.8456, timezone: 7 },
  { nameAr: "نيويورك", nameEn: "New York", lat: 40.7128, lng: -74.006, timezone: -5 },
];

/**
 * Calculate Great-Circle Qibla Direction (Bearing) towards Kaaba in degrees (0 - 360)
 */
export function calculateQiblaBearing(latitude: number, longitude: number): number {
  const phi1 = (latitude * Math.PI) / 180;
  const phi2 = (MAKKAH_LAT * Math.PI) / 180;
  const deltaLambda = ((MAKKAH_LNG - longitude) * Math.PI) / 180;

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

  let bearing = (Math.atan2(y, x) * 180) / Math.PI;
  bearing = (bearing + 360) % 360;
  return Math.round(bearing * 10) / 10;
}

/**
 * Calculate accurate prayer times using trigonometric solar equations
 */
export function calculatePrayerTimes(
  date: Date,
  lat: number,
  lng: number,
  timezoneOffset?: number,
  methodKey: string = "makkah"
): PrayerTimeItem[] {
  const method = CALCULATION_METHODS[methodKey] || CALCULATION_METHODS.makkah;
  const tz = timezoneOffset !== undefined ? timezoneOffset : -date.getTimezoneOffset() / 60;

  // Day of year
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  // Solar declination & Equation of time approximations
  const b = (2 * Math.PI * (dayOfYear - 81)) / 365;
  const equationOfTime = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b); // minutes
  const declination = 23.45 * Math.sin(((360 / 365) * (dayOfYear - 81) * Math.PI) / 180); // degrees

  const dRad = (declination * Math.PI) / 180;
  const latRad = (lat * Math.PI) / 180;

  // Solar noon
  const solarNoon = 12 + (4 * (tz * 15 - lng) - equationOfTime) / 60;

  // Hour angle helper
  const hourAngle = (angle: number) => {
    const aRad = (-angle * Math.PI) / 180;
    const cosHA = (Math.sin(aRad) - Math.sin(latRad) * Math.sin(dRad)) / (Math.cos(latRad) * Math.cos(dRad));
    if (cosHA < -1) return 180;
    if (cosHA > 1) return 0;
    return (Math.acos(cosHA) * 180) / Math.PI;
  };

  // Asr hour angle (Shafi'i / Standard shadow ratio = 1)
  const asrAngle = () => {
    const shadowRatio = 1;
    const t = Math.abs(lat - declination);
    const altitude = (Math.atan(1 / (shadowRatio + Math.tan((t * Math.PI) / 180))) * 180) / Math.PI;
    return hourAngle(-altitude);
  };

  const fajrHA = hourAngle(method.fajrAngle);
  const sunriseHA = hourAngle(0.833);
  const asrHA = asrAngle();
  const maghribHA = hourAngle(0.833);

  const fajrDec = solarNoon - fajrHA / 15;
  const sunriseDec = solarNoon - sunriseHA / 15;
  const dhuhrDec = solarNoon + 0.05; // Slightly past zenith
  const asrDec = solarNoon + asrHA / 15;
  const maghribDec = solarNoon + maghribHA / 15;

  let ishaDec: number;
  if (method.ishaAngle === 0) {
    ishaDec = maghribDec + 1.5; // 90 min fixed
  } else {
    const ishaHA = hourAngle(method.ishaAngle);
    ishaDec = solarNoon + ishaHA / 15;
  }

  const formatTime = (decimalHours: number): { str: string; ts: number } => {
    let hrs = Math.floor(decimalHours);
    let mins = Math.round((decimalHours - hrs) * 60);
    if (mins >= 60) {
      hrs += 1;
      mins -= 60;
    }
    hrs = (hrs + 24) % 24;

    const timeDate = new Date(date);
    timeDate.setHours(hrs, mins, 0, 0);

    const pad = (n: number) => (n < 10 ? "0" + n : "" + n);
    return {
      str: `${pad(hrs)}:${pad(mins)}`,
      ts: timeDate.getTime(),
    };
  };

  const prayers = [
    { id: "fajr", nameAr: "الفجر", nameEn: "Fajr", dec: fajrDec },
    { id: "sunrise", nameAr: "الشروق", nameEn: "Sunrise", dec: sunriseDec },
    { id: "dhuhr", nameAr: "الظهر", nameEn: "Dhuhr", dec: dhuhrDec },
    { id: "asr", nameAr: "العصر", nameEn: "Asr", dec: asrDec },
    { id: "maghrib", nameAr: "المغرب", nameEn: "Maghrib", dec: maghribDec },
    { id: "isha", nameAr: "العشاء", nameEn: "Isha", dec: ishaDec },
  ];

  const now = date.getTime();
  let foundNext = false;

  return prayers.map((p) => {
    const { str, ts } = formatTime(p.dec);
    const isPassed = now > ts;
    let isNext = false;
    if (!isPassed && !foundNext && p.id !== "sunrise") {
      isNext = true;
      foundNext = true;
    }

    return {
      id: p.id,
      nameAr: p.nameAr,
      nameEn: p.nameEn,
      time: str,
      timestamp: ts,
      isPassed,
      isNext,
    };
  });
}

/**
 * Format remaining countdown to human Arabic string
 */
export function formatRemainingTime(targetTimestamp: number): {
  hours: number;
  minutes: number;
  seconds: number;
  text: string;
} {
  const diff = targetTimestamp - Date.now();
  if (diff <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, text: "حان وقت الصلاة" };
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  let text = "";
  if (hours > 0) {
    text += `${hours} ساعة و `;
  }
  text += `${minutes} دقيقة`;

  return { hours, minutes, seconds, text };
}

/**
 * Calculates digital countdown (HH:MM:SS) to next prayer
 */
export function calculateRemainingCountdown(targetTimestamp: number): {
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
  isPassed: boolean;
} {
  const diff = targetTimestamp - Date.now();
  if (diff <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, formatted: "00:00:00", isPassed: true };
  }
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return {
    hours,
    minutes,
    seconds,
    formatted: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`,
    isPassed: false,
  };
}

/**
 * Auto-detect user geographic location and timezone automatically upon launch
 */
export async function detectUserAutoLocation(): Promise<CityPreset & { isAutoDetected: boolean }> {
  // 1. Check if user already had a saved auto-detected coordinate
  try {
    const saved = localStorage.getItem("noor_auto_geo");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed.lat === "number" && typeof parsed.lng === "number") {
        return {
          ...parsed,
          isAutoDetected: true,
        };
      }
    }
  } catch (e) {
    // Ignore storage parse errors
  }

  // 2. Derive base offset from device clock & timezone
  const tzOffset = -new Date().getTimezoneOffset() / 60;
  let detectedTz = "UTC";
  try {
    detectedTz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch (e) {}

  // Timezone-based smart default preset mapping
  let defaultPreset = CITIES_PRESETS[0]; // Makkah default fallback
  if (detectedTz.includes("Cairo") || detectedTz.includes("Egypt")) {
    defaultPreset = CITIES_PRESETS.find((c) => c.nameEn === "Cairo") || defaultPreset;
  } else if (detectedTz.includes("Riyadh") || detectedTz.includes("Saudi")) {
    defaultPreset = CITIES_PRESETS.find((c) => c.nameEn === "Riyadh") || defaultPreset;
  } else if (detectedTz.includes("Dubai")) {
    defaultPreset = CITIES_PRESETS.find((c) => c.nameEn === "Dubai") || defaultPreset;
  } else if (detectedTz.includes("Istanbul") || detectedTz.includes("Turkey")) {
    defaultPreset = CITIES_PRESETS.find((c) => c.nameEn === "Istanbul") || defaultPreset;
  } else if (detectedTz.includes("Jerusalem") || detectedTz.includes("Gaza") || detectedTz.includes("Hebron")) {
    defaultPreset = CITIES_PRESETS.find((c) => c.nameEn === "Jerusalem") || defaultPreset;
  } else if (detectedTz.includes("London") || detectedTz.includes("Europe/London")) {
    defaultPreset = CITIES_PRESETS.find((c) => c.nameEn === "London") || defaultPreset;
  } else if (detectedTz.includes("Paris") || detectedTz.includes("Berlin") || detectedTz.includes("Rome")) {
    defaultPreset = CITIES_PRESETS.find((c) => c.nameEn === "Paris") || defaultPreset;
  } else if (detectedTz.includes("Jakarta")) {
    defaultPreset = CITIES_PRESETS.find((c) => c.nameEn === "Jakarta") || defaultPreset;
  } else if (detectedTz.includes("New_York") || detectedTz.includes("America")) {
    defaultPreset = CITIES_PRESETS.find((c) => c.nameEn === "New York") || defaultPreset;
  }

  // 3. Attempt browser GPS geolocation if supported
  if (typeof navigator !== "undefined" && navigator.geolocation) {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 4000,
          maximumAge: 3600000,
          enableHighAccuracy: false,
        });
      });

      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const autoPreset: CityPreset & { isAutoDetected: boolean } = {
        nameAr: "موقعي الجغرافي (تلقائي)",
        nameEn: "My Location",
        lat: Math.round(lat * 10000) / 10000,
        lng: Math.round(lng * 10000) / 10000,
        timezone: tzOffset,
        isAutoDetected: true,
      };

      try {
        localStorage.setItem("noor_auto_geo", JSON.stringify(autoPreset));
      } catch (e) {}

      return autoPreset;
    } catch (geoErr) {
      // User declined or timeout, return tz-based smart default
      return {
        ...defaultPreset,
        timezone: tzOffset,
        isAutoDetected: true,
      };
    }
  }

  return {
    ...defaultPreset,
    timezone: tzOffset,
    isAutoDetected: false,
  };
}
