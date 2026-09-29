/**
 * Prayer Times Service
 * Uses https://quran.yousefheiba.com/api/getPrayerTimes
 * With automatic browser geolocation and high-precision offline astronomical fallback
 */

import { calculatePrayerTimes, calculateQiblaBearing, CITIES_PRESETS, CityPreset } from "../utils/prayerCalculator";
import { PrayerTimeItem } from "../types";

export interface PrayerTimesData {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  dateGregorian: string;
  dateHijri: string;
  locationName: string;
  source: "api_ip" | "api_geo" | "calculated_gps" | "preset";
  prayersList: PrayerTimeItem[];
  nextPrayer: PrayerTimeItem | null;
  qiblaBearing: number;
}

class PrayerTimesService {
  private cachedData: PrayerTimesData | null = null;

  /**
   * Request user browser GPS coordinates
   */
  async getUserCoordinates(): Promise<{ latitude: number; longitude: number } | null> {
    if (typeof window === "undefined" || !navigator.geolocation) {
      return null;
    }
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        () => {
          resolve(null);
        },
        { timeout: 6000, enableHighAccuracy: false }
      );
    });
  }

  /**
   * Fetch prayer times from official API or calculate using location
   */
  async getPrayerTimes(customCoords?: { latitude: number; longitude: number } | null): Promise<PrayerTimesData> {
    // 1. Check if user coords provided or detect via browser
    const coords = customCoords || (await this.getUserCoordinates());

    // 2. Try fetching from https://quran.yousefheiba.com/api/getPrayerTimes
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      // We call the API directly so the client IP or query is evaluated
      const resp = await fetch("https://quran.yousefheiba.com/api/getPrayerTimes", {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (resp.ok) {
        const json = await resp.json();
        // If API returned structured prayers object
        if (json && json.status !== "error" && (json.prayers || json.times || json.fajr || json.data)) {
          const pData = json.prayers || json.times || json.data || json;
          const fajr = pData.fajr || pData.Fajr || "04:30";
          const sunrise = pData.sunrise || pData.Sunrise || pData.shurooq || "05:55";
          const dhuhr = pData.dhuhr || pData.Dhuhr || "12:05";
          const asr = pData.asr || pData.Asr || "15:30";
          const maghrib = pData.maghrib || pData.Maghrib || "18:10";
          const isha = pData.isha || pData.Isha || "19:35";

          const lat = coords?.latitude ?? 21.4225;
          const lng = coords?.longitude ?? 39.8262;
          const qibla = calculateQiblaBearing(lat, lng);

          const list = this.buildPrayersList(fajr, sunrise, dhuhr, asr, maghrib, isha);
          const nextPrayer = list.find((p) => p.isNext) || list[0];

          const result: PrayerTimesData = {
            fajr,
            sunrise,
            dhuhr,
            asr,
            maghrib,
            isha,
            dateGregorian: json.date_gregorian || new Date().toLocaleDateString("ar-EG"),
            dateHijri: json.date_hijri || this.getHijriDateString(),
            locationName: json.location || json.city || (coords ? "موقعك الجغرافي الحالي" : "مكة المكرمة"),
            source: "api_ip",
            prayersList: list,
            nextPrayer,
            qiblaBearing: qibla,
          };
          this.cachedData = result;
          return result;
        }
      }
    } catch (err) {
      console.warn("API prayer times failed or timed out, using location calculation:", err);
    }

    // 3. Fallback: calculate high precision times for detected GPS coords or default preset (Cairo/Makkah)
    const lat = coords?.latitude ?? 30.0444;
    const lng = coords?.longitude ?? 31.2357;
    const timezone = -(new Date().getTimezoneOffset() / 60);

    const calculatedList = calculatePrayerTimes(new Date(), lat, lng, timezone, "egypt");
    const qibla = calculateQiblaBearing(lat, lng);

    const fajr = calculatedList.find((p) => p.id === "fajr")?.time || "04:30";
    const sunrise = calculatedList.find((p) => p.id === "sunrise")?.time || "05:55";
    const dhuhr = calculatedList.find((p) => p.id === "dhuhr")?.time || "12:05";
    const asr = calculatedList.find((p) => p.id === "asr")?.time || "15:30";
    const maghrib = calculatedList.find((p) => p.id === "maghrib")?.time || "18:10";
    const isha = calculatedList.find((p) => p.id === "isha")?.time || "19:35";

    const nextPrayer = calculatedList.find((p) => p.isNext) || calculatedList[0];

    const fallbackResult: PrayerTimesData = {
      fajr,
      sunrise,
      dhuhr,
      asr,
      maghrib,
      isha,
      dateGregorian: new Date().toLocaleDateString("ar-EG", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      dateHijri: this.getHijriDateString(),
      locationName: coords ? "موقعك الجغرافي الدقيق" : "القاهرة ومحيطها",
      source: coords ? "calculated_gps" : "preset",
      prayersList: calculatedList,
      nextPrayer,
      qiblaBearing: qibla,
    };

    this.cachedData = fallbackResult;
    return fallbackResult;
  }

  private buildPrayersList(
    fajr: string,
    sunrise: string,
    dhuhr: string,
    asr: string,
    maghrib: string,
    isha: string
  ): PrayerTimeItem[] {
    const rawPrayers = [
      { id: "fajr", nameAr: "الفجر", nameEn: "Fajr", time: fajr },
      { id: "sunrise", nameAr: "الشروق", nameEn: "Sunrise", time: sunrise },
      { id: "dhuhr", nameAr: "الظهر", nameEn: "Dhuhr", time: dhuhr },
      { id: "asr", nameAr: "العصر", nameEn: "Asr", time: asr },
      { id: "maghrib", nameAr: "المغرب", nameEn: "Maghrib", time: maghrib },
      { id: "isha", nameAr: "العشاء", nameEn: "Isha", time: isha },
    ];

    const now = new Date();
    let foundNext = false;

    return rawPrayers.map((p) => {
      const [h, m] = p.time.split(":").map(Number);
      const prayerDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h || 0, m || 0, 0);
      let isNext = false;
      let isPassed = false;

      if (prayerDate > now && !foundNext) {
        isNext = true;
        foundNext = true;
      } else if (prayerDate < now) {
        isPassed = true;
      }

      return {
        id: p.id,
        nameAr: p.nameAr,
        nameEn: p.nameEn,
        time: p.time,
        timestamp: prayerDate.getTime(),
        isNext,
        isPassed,
      };
    });
  }

  private getHijriDateString(): string {
    try {
      const formatter = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      return formatter.format(new Date());
    } catch {
      return "التاريخ الهجري المبارك";
    }
  }
}

export const prayerTimesService = new PrayerTimesService();
