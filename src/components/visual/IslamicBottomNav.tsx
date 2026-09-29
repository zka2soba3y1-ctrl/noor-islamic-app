import React from "react";
import {
  Clock,
  BookOpen,
  Compass,
  Heart,
  Menu,
  Gift,
  Sparkles,
} from "lucide-react";
import { ThemeMode } from "../../types";
import { getThemeStyles } from "../../utils/themeClasses";
import { soundEngine } from "../../utils/soundEngine";

interface Props {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  onOpenDrawer: () => void;
  onOpenEndowment: () => void;
  theme?: ThemeMode;
}

export const IslamicBottomNav: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  onOpenDrawer,
  onOpenEndowment,
  theme = "natural",
}) => {
  const styles = getThemeStyles(theme);
  const { isNatural, isPaper, isNight, isLight } = styles;

  const handleNavClick = (tabId: string) => {
    soundEngine.playTasbihClick();
    onSelectTab(tabId);
  };

  return (
    <>
      {/* Floating Action Button for Charity Endowment (زر عائم للدعم المادي والمعنوي للاستمرارية) */}
      <div className="fixed bottom-20 sm:bottom-24 left-3 sm:left-6 z-40">
        <button
          onClick={() => {
            soundEngine.playTasbihClick();
            onOpenEndowment();
          }}
          className="group flex items-center gap-2 pl-3 pr-2.5 py-2 rounded-full bg-gradient-to-r from-[#D4AF37] via-emerald-600 to-teal-700 text-white font-bold text-xs shadow-[0_8px_25px_rgba(212,175,55,0.4)] hover:shadow-[0_8px_30px_rgba(5,150,105,0.6)] hover:scale-105 active:scale-95 transition-all duration-300 border border-white/20 backdrop-blur-md"
          title="وقف النور • الدعم المادي والمعنوي لاستمرارية التطبيق الخيري"
        >
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Gift className="w-3.5 h-3.5 text-white animate-pulse" />
          </div>
          <span className="hidden sm:inline whitespace-nowrap font-alexandria text-[11px] tracking-wide">
            وقف النور • دعم الاستمرارية
          </span>
          <span className="sm:hidden font-alexandria text-[10px]">وقف النور</span>
          <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping shrink-0" />
        </button>
      </div>

      {/* Main Bottom Navigation Bar */}
      <nav
        id="islamic-bottom-navbar"
        aria-label="القائمة السفلية الرئيسية"
        className="fixed bottom-2 inset-x-2 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-xl z-40 transition-all duration-300"
      >
        <div
          className={`rounded-3xl sm:rounded-full px-2 py-1.5 sm:px-4 sm:py-2 border shadow-[0_10px_35px_rgba(0,0,0,0.35)] backdrop-blur-xl flex items-center justify-around relative ${
            isNatural
              ? "bg-[#061A14]/95 border-emerald-500/40 text-emerald-100"
              : isPaper
              ? "bg-[#FAF5EB]/95 border-[#D6C5A9] text-[#2F1E12]"
              : isNight
              ? "bg-[#0A0F17]/95 border-slate-800 text-slate-100"
              : "bg-white/95 border-slate-200 text-slate-800"
          }`}
        >
          {/* Button 1 (Right): الرئيسية (مواقيت الصلاة) */}
          <button
            onClick={() => handleNavClick("prayers")}
            className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-2xl transition-all ${
              activeTab === "prayers"
                ? isPaper
                  ? "text-[#8C5E24] font-bold"
                  : isNight
                  ? "text-sky-400 font-bold"
                  : "text-emerald-500 font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Clock className={`w-5 h-5 transition-transform ${activeTab === "prayers" ? "scale-110" : ""}`} />
            <span className="text-[10px] font-alexandria whitespace-nowrap">الرئيسية</span>
          </button>

          {/* Button 2 (Right-Mid): المصحف الشريف */}
          <button
            onClick={() => handleNavClick("quran")}
            className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-2xl transition-all ${
              activeTab === "quran"
                ? isPaper
                  ? "text-[#8C5E24] font-bold"
                  : isNight
                  ? "text-sky-400 font-bold"
                  : "text-emerald-500 font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BookOpen className={`w-5 h-5 transition-transform ${activeTab === "quran" ? "scale-110" : ""}`} />
            <span className="text-[10px] font-alexandria whitespace-nowrap">المصحف</span>
          </button>

          {/* Center Elevated Button: روح الموقع المتميزة (The Grand Islamic Centerpiece) */}
          <div className="relative -top-5 sm:-top-7 flex flex-col items-center">
            {/* Outer Pulsing Golden Halo Glow */}
            <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-[#D4AF37]/50 via-emerald-500/50 to-[#D4AF37]/50 blur-md animate-pulse pointer-events-none" />
            
            <button
              id="distinguished-center-btn"
              onClick={() => handleNavClick("qibla")}
              className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full p-1 flex flex-col items-center justify-center shadow-[0_10px_30px_rgba(212,175,55,0.45)] hover:scale-110 active:scale-95 transition-all duration-300 border-2 ${
                activeTab === "qibla"
                  ? "bg-gradient-to-tr from-[#D4AF37] via-emerald-700 to-teal-900 border-[#F3E7C4] ring-4 ring-[#D4AF37]/40 text-white"
                  : "bg-gradient-to-tr from-[#06261E] via-[#059669] to-[#D4AF37] border-amber-300/80 text-white hover:border-[#D4AF37]"
              }`}
              title="بوصلة القبلة التفاعلية • روح الموقع ونوره"
            >
              {/* Inner Decorative Islamic Ring */}
              <div className="w-full h-full rounded-full border border-dashed border-white/40 flex items-center justify-center bg-black/10 backdrop-blur-xs">
                <Compass className={`w-7 h-7 text-amber-200 transition-transform ${activeTab === "qibla" ? "animate-spin-slow" : "group-hover:rotate-45"}`} />
              </div>

              {/* Little golden star pip on top */}
              <span className="absolute -top-1 w-2.5 h-2.5 rounded-full bg-[#D4AF37] border border-white shadow-xs" />
            </button>
            <span className={`text-[10px] font-bold mt-1 font-alexandria whitespace-nowrap tracking-wide ${
              activeTab === "qibla"
                ? isPaper ? "text-[#8C5E24]" : "text-[#D4AF37]"
                : styles.mutedText
            }`}>
              القبلة الشريفة
            </span>
          </div>

          {/* Button 4 (Left-Mid): الأذكار والسبحة */}
          <button
            onClick={() => handleNavClick("athkar")}
            className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-2xl transition-all ${
              activeTab === "athkar"
                ? isPaper
                  ? "text-[#8C5E24] font-bold"
                  : isNight
                  ? "text-sky-400 font-bold"
                  : "text-emerald-500 font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Heart className={`w-5 h-5 transition-transform ${activeTab === "athkar" ? "scale-110" : ""}`} />
            <span className="text-[10px] font-alexandria whitespace-nowrap">الأذكار</span>
          </button>

          {/* Button 5 (Left): القائمة الجانبية (المزيد) */}
          <button
            onClick={() => {
              soundEngine.playTasbihClick();
              onOpenDrawer();
            }}
            className="flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-2xl text-slate-400 hover:text-emerald-500 transition-all"
            title="فتح القائمة الجانبية الكاملة"
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] font-alexandria whitespace-nowrap">القائمة</span>
          </button>
        </div>
      </nav>
    </>
  );
};
