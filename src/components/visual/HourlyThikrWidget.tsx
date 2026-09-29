import React, { useState, useEffect } from "react";
import {
  Clock,
  Volume2,
  VolumeX,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Heart,
  Award,
} from "lucide-react";
import { ThemeMode } from "../../types";
import { getThemeStyles } from "../../utils/themeClasses";
import { soundEngine } from "../../utils/soundEngine";
import { speechEngine } from "../../utils/speechEngine";
import {
  HourlyThikr,
  getCurrentHourlyThikr,
  getThikrForHour,
  HOURLY_ADHKAR,
} from "../../data/hourlyAdhkar";

interface Props {
  theme?: ThemeMode;
}

export const HourlyThikrWidget: React.FC<Props> = ({ theme = "natural" }) => {
  const styles = getThemeStyles(theme);
  const { isNatural, isPaper, isNight, isLight } = styles;

  const [currentHour, setCurrentHour] = useState<number>(() => new Date().getHours());
  const [selectedHour, setSelectedHour] = useState<number>(() => new Date().getHours());
  const [count, setCount] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [minutesUntilNext, setMinutesUntilNext] = useState<number>(
    () => 60 - new Date().getMinutes()
  );

  // Keep track of current hour automatically and calculate minutes until next hour
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = now.getHours();
      const minsLeft = 60 - now.getMinutes();
      setMinutesUntilNext(minsLeft);
      if (h !== currentHour) {
        setCurrentHour(h);
        // If user was following the real-time hour, update selectedHour too
        setSelectedHour(h);
        setCount(0);
      }
    };

    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, [currentHour]);

  // Reset count when viewing a different hour
  useEffect(() => {
    setCount(0);
  }, [selectedHour]);

  const activeThikr: HourlyThikr = getThikrForHour(selectedHour);
  const isCurrentLiveHour = selectedHour === currentHour;
  const isCompleted = count >= activeThikr.targetCount;

  const handleIncrement = () => {
    soundEngine.playTasbihClick();
    if (navigator.vibrate) {
      navigator.vibrate(15);
    }
    setCount((prev) => prev + 1);
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.playTasbihClick();
    setCount(0);
  };

  const handleCopy = () => {
    soundEngine.playTasbihClick();
    const textToCopy = `${activeThikr.thikrAr}\n\n[${activeThikr.titleAr} - ${activeThikr.sourceAr}]\n«تطبيق النور»`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleToggleSpeak = () => {
    soundEngine.playTasbihClick();
    if (isPlayingAudio) {
      speechEngine.stop();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      const textToSpeak = `${activeThikr.thikrAr}. ${activeThikr.virtueAr}`;
      speechEngine.speak(textToSpeak, {
        onEnd: () => setIsPlayingAudio(false),
      });
    }
  };

  const handlePrevHour = () => {
    soundEngine.playTasbihClick();
    setSelectedHour((prev) => (prev === 0 ? 23 : prev - 1));
  };

  const handleNextHour = () => {
    soundEngine.playTasbihClick();
    setSelectedHour((prev) => (prev === 23 ? 0 : prev + 1));
  };

  const handleReturnToCurrent = () => {
    soundEngine.playTasbihClick();
    setSelectedHour(currentHour);
  };

  return (
    <div
      id="hourly-thikr-hero-widget"
      className={`relative overflow-hidden rounded-2xl sm:rounded-3xl border transition-all mt-4 p-3.5 sm:p-5 ${
        isNatural
          ? "bg-gradient-to-br from-[#062016]/90 via-[#0A2E20]/80 to-[#04150E]/90 border-emerald-500/35 text-white shadow-[0_8px_30px_rgba(0,0,0,0.4)]"
          : isPaper
          ? "bg-gradient-to-br from-[#FFFDF9] via-[#FAF5EA] to-[#F4ECDC] border-[#D6C5A9] text-[#2F1E12] shadow-[0_8px_30px_rgba(140,94,36,0.08)]"
          : isNight
          ? "bg-gradient-to-br from-[#0B132B]/90 via-[#101D38]/85 to-[#0A1020]/90 border-slate-700/80 text-white shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
          : "bg-gradient-to-br from-white via-emerald-50/60 to-amber-50/50 border-emerald-200 text-slate-900 shadow-[0_8px_30px_rgba(212,175,55,0.12)]"
      }`}
    >
      {/* Decorative Islamic Background Pattern & Glow */}
      <div className="absolute top-0 left-1/4 w-72 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-60 h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header Bar: Title, Live Status & Next Hour Countdown */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-emerald-500/15">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 border ${
              isPaper
                ? "bg-[#8C5E24]/15 border-[#8C5E24]/30 text-[#8C5E24]"
                : "bg-gradient-to-br from-[#D4AF37] to-amber-600 text-slate-950 border-amber-400/40 shadow-xs"
            }`}
          >
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black font-alexandria text-emerald-600 dark:text-emerald-300">
                ذِكْرُ السَّاعَةِ
              </span>
              <span className="text-[10px] sm:text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300">
                {activeThikr.timeLabelAr}
              </span>
              {isCurrentLiveHour ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  الساعة الحالية
                </span>
              ) : (
                <button
                  onClick={handleReturnToCurrent}
                  className="text-[10px] font-bold text-amber-600 hover:underline cursor-pointer"
                  title="العودة لذكر الساعة الحالية"
                >
                  (العودة للآن)
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {activeThikr.titleAr} • يتجدد الذكر تلقائياً كل ساعة (متبقي {minutesUntilNext} دقيقة للساعة القادمة)
            </p>
          </div>
        </div>

        {/* Navigation Arrows for Browsing Hours */}
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrevHour}
            className="p-1.5 rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer"
            title="الساعة السابقة"
            aria-label="الساعة السابقة"
          >
            <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </button>
          <span className="text-[10px] font-mono font-bold px-1.5 text-slate-500">
            {selectedHour.toString().padStart(2, "0")}:00
          </span>
          <button
            onClick={handleNextHour}
            className="p-1.5 rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer"
            title="الساعة التالية"
            aria-label="الساعة التالية"
          >
            <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </button>
        </div>
      </div>

      {/* Main Content Area: Thikr Text & Virtue */}
      <div className="relative z-10 py-3 sm:py-4">
        <div className="flex items-start gap-2.5">
          <Sparkles className="w-5 h-5 text-[#D4AF37] shrink-0 mt-1" />
          <div className="flex-1 min-w-0 space-y-2">
            {/* The Voweled Thikr in majestic Quranic font */}
            <p className="font-amiri text-base sm:text-lg md:text-xl font-bold leading-loose text-slate-900 dark:text-[#FBF7EE] select-text">
              «{activeThikr.thikrAr}»
            </p>

            {/* Virtue & Hadith Source */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-bold text-amber-700 dark:text-[#E6CA65] flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-amber-500" />
                فضل الذكر: {activeThikr.virtueAr}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                المصدر: {activeThikr.sourceAr}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer: Tasbih Counter, Audio Readout, Copy */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-emerald-500/15">
        
        {/* Interactive Tasbih Counter Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleIncrement}
            className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition active:scale-95 cursor-pointer whitespace-nowrap min-h-[42px] ${
              isCompleted
                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/30"
                : isPaper
                ? "bg-[#8C5E24] hover:bg-[#A37031] text-white"
                : "bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white"
            }`}
            title="انقر للتسبيح واحتساب التكرار"
          >
            {isCompleted ? (
              <Award className="w-4 h-4 text-amber-300 animate-bounce" />
            ) : (
              <Sparkles className="w-4 h-4 text-emerald-200" />
            )}
            <span>
              {isCompleted ? "اكتمل الذكر المبارك!" : "تسبيح وتكرار الذكر"}
            </span>
            <span className="font-mono font-black px-2 py-0.5 rounded-lg bg-black/20 text-white text-xs">
              {count} / {activeThikr.targetCount}
            </span>
          </button>

          {count > 0 && (
            <button
              onClick={handleReset}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer"
              title="إعادة ضبط العداد"
              aria-label="إعادة ضبط"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Listen Audio & Copy Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleSpeak}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap min-h-[40px] ${
              isPlayingAudio
                ? "bg-amber-500 text-slate-950 border-amber-400 animate-pulse font-black"
                : isPaper
                ? "bg-[#FAF5EB] hover:bg-[#F4ECDC] text-[#5C3D24] border-[#D6C5A9]"
                : "bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 border-black/10 dark:border-white/10"
            }`}
            title={isPlayingAudio ? "إيقاف القراءة الصوتية" : "الاستماع للذكر بصوت واضح وهادئ"}
          >
            {isPlayingAudio ? (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span>إيقاف الصوت</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>استماع للذكر</span>
              </>
            )}
          </button>

          <button
            onClick={handleCopy}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap min-h-[40px] ${
              copied
                ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 border-black/10 dark:border-white/10"
            }`}
            title="نسخ الذكر ومشاركته"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>تم النسخ</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>نسخ الذكر</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
