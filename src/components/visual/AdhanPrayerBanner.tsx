import React, { useState, useEffect } from "react";
import { Volume2, Square, Sparkles, X, Heart } from "lucide-react";
import { adhanService } from "../../services/adhanService";
import { ThemeMode } from "../../types";
import { getThemeStyles } from "../../utils/themeClasses";
import { soundEngine } from "../../utils/soundEngine";

interface Props {
  theme?: ThemeMode;
}

export const AdhanPrayerBanner: React.FC<Props> = ({ theme = "natural" }) => {
  const styles = getThemeStyles(theme);
  const [activeAdhanData, setActiveAdhanData] = useState<{
    prayerName: string;
    reciterName: string;
    locationAr: string;
  } | null>(null);

  useEffect(() => {
    const handleStarted = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setActiveAdhanData({
        prayerName: detail.prayerName || "الصلاة",
        reciterName: detail.reciterName || "الشيخ علي ملا",
        locationAr: detail.locationAr || "الحرم المكي الشريف",
      });
    };

    const handleEnded = () => {
      setActiveAdhanData(null);
    };

    window.addEventListener("noor-adhan-started", handleStarted);
    window.addEventListener("noor-adhan-ended", handleEnded);

    return () => {
      window.removeEventListener("noor-adhan-started", handleStarted);
      window.removeEventListener("noor-adhan-ended", handleEnded);
    };
  }, []);

  if (!activeAdhanData) return null;

  const handleStop = () => {
    soundEngine.playTasbihClick();
    adhanService.stop();
    setActiveAdhanData(null);
  };

  return (
    <aside
      aria-label="تنبيه الأذان المبارك"
      className="fixed bottom-20 sm:bottom-6 left-3 right-3 sm:left-auto sm:right-6 z-50 max-w-md animate-bounce-short"
    >
      <div
        className={`p-4 rounded-3xl border shadow-2xl backdrop-blur-xl relative overflow-hidden flex items-center justify-between gap-3 ${
          theme === "paper"
            ? "bg-[#FAF5EB]/95 border-[#D6C5A9] text-[#2F1E12]"
            : "bg-gradient-to-r from-emerald-950/95 via-teal-950/95 to-slate-950/95 border-emerald-500/50 text-white"
        }`}
      >
        {/* Glow */}
        <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none animate-pulse" />

        <div className="flex items-center gap-3 relative z-10 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-500/40">
            <Volume2 className="w-6 h-6 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-black border border-emerald-500/30">
                أذان {activeAdhanData.prayerName}
              </span>
              <span className="text-[11px] font-bold text-amber-400">
                يرفع الآن
              </span>
            </div>
            <p className="text-xs font-bold truncate mt-0.5">
              {activeAdhanData.reciterName} • {activeAdhanData.locationAr}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 relative z-10 shrink-0">
          <button
            onClick={handleStop}
            className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-bold flex items-center gap-1 transition active:scale-95 cursor-pointer"
            title="إيقاف الأذان"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>إيقاف</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
