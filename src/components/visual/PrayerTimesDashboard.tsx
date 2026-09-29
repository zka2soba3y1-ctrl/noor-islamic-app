import React, { useState, useEffect } from "react";
import {
  Clock,
  MapPin,
  Compass,
  Volume2,
  RefreshCw,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Calendar,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  Square,
  Music,
} from "lucide-react";
import { prayerTimesService, PrayerTimesData } from "../../services/prayerTimesService";
import { CITIES_PRESETS, CityPreset, calculateRemainingCountdown } from "../../utils/prayerCalculator";
import { soundEngine } from "../../utils/soundEngine";
import { speechEngine } from "../../utils/speechEngine";
import { ThemeMode } from "../../types";
import { getThemeStyles } from "../../utils/themeClasses";
import { adhanService } from "../../services/adhanService";
import { AdhanAudioPlayerModal } from "./AdhanAudioPlayerModal";
import { LocalPrayerNotificationsCard } from "./LocalPrayerNotificationsCard";
import { prayerNotificationService } from "../../services/prayerNotificationService";

interface Props {
  theme?: ThemeMode;
}

export const PrayerTimesDashboard: React.FC<Props> = ({ theme = "natural" }) => {
  const styles = getThemeStyles(theme);

  const [prayerData, setPrayerData] = useState<PrayerTimesData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [countdownString, setCountdownString] = useState<string>("");
  const [selectedCityName, setSelectedCityName] = useState<string>("موقعي الجغرافي التلقائي");
  const [isAdhanModalOpen, setIsAdhanModalOpen] = useState<boolean>(false);
  const [isAdhanPlaying, setIsAdhanPlaying] = useState<boolean>(false);

  useEffect(() => {
    const unsub = adhanService.subscribe((s) => {
      setIsAdhanPlaying(s.isPlaying);
    });
    setIsAdhanPlaying(adhanService.getIsPlaying());
    return unsub;
  }, []);

  // Fetch prayer times
  const loadTimes = async (coords?: { latitude: number; longitude: number } | null) => {
    setIsLoading(true);
    try {
      const data = await prayerTimesService.getPrayerTimes(coords);
      setPrayerData(data);
      if (data && data.prayersList) {
        prayerNotificationService.scheduleUpcomingPrayers(data.prayersList, selectedCityName);
      }
    } catch (err) {
      console.error("Failed to load prayer times:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTimes();
  }, []);

  // Real-time countdown timer loop
  useEffect(() => {
    if (!prayerData || !prayerData.nextPrayer) return;

    const interval = setInterval(() => {
      const res = calculateRemainingCountdown(prayerData.nextPrayer!.timestamp);
      setCountdownString(res.formatted);
    }, 1000);

    return () => clearInterval(interval);
  }, [prayerData]);

  // Request browser GPS
  const handleDetectGPS = async () => {
    soundEngine.playTasbihClick();
    setIsLocating(true);
    try {
      const coords = await prayerTimesService.getUserCoordinates();
      if (coords) {
        setSelectedCityName("موقعك الجغرافي الدقيق (GPS)");
        await loadTimes(coords);
        speechEngine.speak("تم تحديث مواقيت الصلاة حسب موقعك الجغرافي بدقة");
      } else {
        speechEngine.speak("تعذر تحديد الموقع بدقة، تم الاعتماد على التقريب الجغرافي");
      }
    } finally {
      setIsLocating(false);
    }
  };

  // Select Preset City
  const handleSelectCity = async (city: CityPreset) => {
    soundEngine.playTasbihClick();
    setSelectedCityName(city.nameAr);
    await loadTimes({ latitude: city.lat, longitude: city.lng });
    speechEngine.speak(`تم تحديد مواقيت الصلاة لمدينة ${city.nameAr}`);
  };

  const getPrayerIcon = (id: string) => {
    switch (id) {
      case "fajr":
        return <Sunrise className="w-5 h-5 text-indigo-400" />;
      case "sunrise":
        return <Sun className="w-5 h-5 text-amber-400" />;
      case "dhuhr":
        return <Sun className="w-5 h-5 text-yellow-500" />;
      case "asr":
        return <Sun className="w-5 h-5 text-amber-500" />;
      case "maghrib":
        return <Sunset className="w-5 h-5 text-orange-400" />;
      case "isha":
        return <Moon className="w-5 h-5 text-blue-400" />;
      default:
        return <Clock className="w-5 h-5 text-emerald-400" />;
    }
  };

  return (
    <div id="prayer-times-dashboard-card" className="space-y-4 sm:space-y-6 animate-fadeIn">
      {/* Main Highlights Card */}
      <div
        className={`p-5 sm:p-7 rounded-2xl sm:rounded-3xl border transition-all relative overflow-hidden ${
          styles.cardBg
        } ${styles.cardBorder}`}
      >
        {/* Top Header: Location, Dates & Refresh */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-md">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-lg sm:text-xl font-black ${styles.titleText}`}>
                  مواقيت الصلاة الرسمية
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  حي ومستجيب
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                <span>{selectedCityName}</span>
                <span>•</span>
                <span>{prayerData?.dateHijri || "اليوم المبارك"}</span>
              </div>
            </div>
          </div>

          {/* Location & City Controls */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
            <button
              onClick={handleDetectGPS}
              disabled={isLocating}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                isLocating
                  ? "opacity-60 cursor-not-allowed"
                  : "bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
              }`}
              title="تحديد الموقع الجغرافي الدقيق عبر GPS"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLocating ? "animate-spin" : ""}`} />
              <span>{isLocating ? "جاري التحديد..." : "موقعي الدقيق"}</span>
            </button>

            {/* City Preset Selector */}
            <select
              onChange={(e) => {
                const c = CITIES_PRESETS.find((city) => city.nameAr === e.target.value);
                if (c) handleSelectCity(c);
              }}
              className={`text-xs font-bold px-3 py-2 rounded-xl border cursor-pointer ${
                styles.innerBg
              } ${styles.innerBorder} ${styles.titleText}`}
            >
              <option value="">تغيير المدينة...</option>
              {CITIES_PRESETS.map((city) => (
                <option key={city.nameAr} value={city.nameAr}>
                  {city.nameAr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Center: Next Prayer Spotlight Banner */}
        {prayerData?.nextPrayer && (
          <div className="my-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-600/15 via-[#D4AF37]/15 to-teal-600/15 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">
                  الصلاة القادمة بإذن الله
                </span>
                <h4 className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  صلاة {prayerData.nextPrayer.nameAr}
                </h4>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="text-left sm:text-right">
                <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 block">
                  المتبقي لرفع الأذان
                </span>
                <span className="font-mono text-xl sm:text-2xl font-black text-[#D4AF37]">
                  {countdownString || "00:00:00"}
                </span>
              </div>

              <div className="px-3 py-2 rounded-xl bg-black/10 dark:bg-white/10 font-mono text-sm font-black">
                {prayerData.nextPrayer.time}
              </div>

              {/* Hear Adhan Button */}
              <button
                onClick={() => {
                  soundEngine.playTasbihClick();
                  setIsAdhanModalOpen(true);
                }}
                className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer whitespace-nowrap ${
                  isAdhanPlaying
                    ? "bg-amber-600 hover:bg-amber-700 text-white animate-pulse"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                }`}
                title="سماع الأذان بصوت الحرم المكي الشريف والمساجد الكبرى"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{isAdhanPlaying ? "الأذان يرفع الآن" : "سماع الأذان"}</span>
              </button>
            </div>
          </div>
        )}

        {/* Prayers Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
          {prayerData?.prayersList?.map((prayer) => {
            const isNext = prayer.isNext;
            return (
              <div
                key={prayer.id}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all text-center flex flex-col items-center justify-between gap-2 ${
                  isNext
                    ? "bg-emerald-600/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-md ring-2 ring-emerald-500/20"
                    : `${styles.innerBg} ${styles.innerBorder} hover:border-emerald-500/30`
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="p-1.5 rounded-xl bg-black/5 dark:bg-white/5">
                    {getPrayerIcon(prayer.id)}
                  </span>
                  {isNext && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500 text-white">
                      القادمة
                    </span>
                  )}
                </div>

                <div className="my-1">
                  <h5 className="text-sm font-bold">{prayer.nameAr}</h5>
                  <span className="font-mono text-base sm:text-lg font-black block mt-0.5">
                    {prayer.time}
                  </span>
                </div>

                <span className="text-[10px] text-slate-500 dark:text-zinc-400">
                  {prayer.id === "sunrise" ? "الشروق" : "أذان"}
                </span>
              </div>
            );
          })}
        </div>

        {/* Qibla & Accuracy Footer Info */}
        <div className="mt-5 pt-4 border-t border-black/5 dark:border-white/5 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-zinc-400 gap-3">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-sky-500" />
            <span>
              زاوية القبلة المشرفة:{" "}
              <strong className="text-sky-600 dark:text-sky-400 font-mono">
                {prayerData?.qiblaBearing || 135}°
              </strong>{" "}
              باتجاه الكعبة
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              {prayerData?.source === "calculated_gps"
                ? "حساب فلكي دقيق مبني على إحداثيات GPS المباشرة"
                : "مواقيت متزامنة مع الخادم وموقع المستخدم"}
            </span>
          </div>
        </div>
      </div>

      {/* Local Prayer Time Notifications Service Worker Card */}
      <LocalPrayerNotificationsCard theme={theme} cityName={selectedCityName} />

      {/* Adhan Audio Player Modal */}
      <AdhanAudioPlayerModal
        isOpen={isAdhanModalOpen}
        onClose={() => setIsAdhanModalOpen(false)}
        theme={theme}
      />
    </div>
  );
};
