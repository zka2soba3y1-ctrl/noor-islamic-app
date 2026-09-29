import React from "react";
import {
  X,
  BookOpen,
  Compass,
  Heart,
  Calendar,
  Layers,
  Building2,
  Tv,
  Radio,
  FileText,
  Clock,
  Sparkles,
  Shield,
  ShieldCheck,
  Share2,
  Sun,
  Moon,
  Feather,
  Palette,
  Volume2,
  VolumeX,
  Gift,
  ExternalLink,
} from "lucide-react";
import { ThemeMode } from "../../types";
import { getThemeStyles } from "../../utils/themeClasses";
import { soundEngine } from "../../utils/soundEngine";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  soundEnabled: boolean;
  onSoundEnabledChange: (enabled: boolean) => void;
  onOpenEndowment: () => void;
  onOpenSources: () => void;
  onSwitchToSensoryMode: () => void;
  cityName: string;
  hijriDateStr: string;
}

export const GrandIslamicDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  theme,
  onThemeChange,
  soundEnabled,
  onSoundEnabledChange,
  onOpenEndowment,
  onOpenSources,
  onSwitchToSensoryMode,
  cityName,
  hijriDateStr,
}) => {
  const styles = getThemeStyles(theme);

  if (!isOpen) return null;

  const navItems = [
    { id: "prayers", nameAr: "مواقيت الصلاة اليومية", icon: Clock, badge: "الرئيسية" },
    { id: "quran", nameAr: "المصحف الشريف الشامل", icon: BookOpen, badge: "604 صفحة" },
    { id: "athkar", nameAr: "الأذكار والسبحة النبضية", icon: Heart, badge: "السبحة" },
    { id: "hisn_muslim", nameAr: "حصن المسلم الصوتي", icon: Shield, badge: "جديد وقراءة صوتية" },
    { id: "qibla", nameAr: "بوصلة القبلة التفاعلية", icon: Compass, badge: "دقيقة 100%" },
    { id: "log", nameAr: "سجل الصلوات والعبادات", icon: Sparkles, badge: "متابعة يومية" },
    { id: "hadith", nameAr: "موسوعة الحديث الشريف", icon: FileText, badge: "البخاري ومسلم" },
    { id: "live", nameAr: "البث المباشر وقنوات الحرمين", icon: Tv, badge: "24/7" },
    { id: "calendar", nameAr: "التقويم والمناسبات الهجرية", icon: Calendar, badge: "1448 هـ" },
    { id: "zakat", nameAr: "حاسبة الزكاة الشرعية", icon: Layers, badge: "نصاب الذهب" },
    { id: "mosques", nameAr: "دليل المساجد القريبة", icon: Building2, badge: "GPS" },
    { id: "lectures", nameAr: "الدروس والمحاضرات الصوتية", icon: Radio, badge: "صوتيات" },
    { id: "fatwa", nameAr: "موسوعة الفتاوى الشرعية", icon: FileText, badge: "معتمد" },
  ];

  const handleItemClick = (id: string) => {
    soundEngine.playTasbihClick();
    onSelectTab(id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="absolute inset-0" onClick={onClose} />

      <aside
        id="grand-islamic-drawer"
        className={`fixed top-0 bottom-0 right-0 w-full max-w-xs sm:max-w-sm z-50 flex flex-col shadow-2xl border-l transition-all duration-300 transform translate-x-0 ${
          styles.cardBg
        } ${styles.cardBorder}`}
      >
        {/* Top Drawer Header with Large Official Logo */}
        <div className={`p-4 sm:p-5 border-b relative ${styles.innerBorder} ${
          styles.isNatural ? "bg-[#061A14]" : styles.isPaper ? "bg-[#F7EFE1]" : styles.isNight ? "bg-black/80" : "bg-slate-50"
        }`}>
          {/* Close button */}
          <button
            onClick={onClose}
            className={`absolute top-4 left-4 p-1.5 rounded-xl border transition ${styles.btnSecondary}`}
            title="إغلاق القائمة"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Grand Logo */}
          <div className="space-y-2">
            <img
              src="https://i.ibb.co/pBdt7pHC/3.png"
              alt="شعار تطبيق النور"
              className="h-14 sm:h-16 w-auto object-contain drop-shadow-md"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "https://i.ibb.co/sJ9F5mbb/1.png";
              }}
              referrerPolicy="no-referrer"
            />
            <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{cityName}</span>
              <span className={styles.mutedText}>•</span>
              <span className={styles.mutedText}>{hijriDateStr}</span>
            </div>
          </div>
        </div>

        {/* Scrollable Navigation List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1.5">
          <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            أقسام وخدمات التطبيق
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center justify-between p-3 rounded-2xl border text-right transition-all active:scale-98 ${
                  isSelected
                    ? styles.btnPrimary + " shadow-md"
                    : `${styles.innerBg} ${styles.innerBorder} hover:border-emerald-500/40 text-slate-700 dark:text-slate-200`
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-xs sm:text-sm font-alexandria">
                    {item.nameAr}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    isSelected
                      ? "bg-white/20 text-white border-white/30 font-bold"
                      : `${styles.badgeBg} ${styles.badgeText} ${styles.badgeBorder}`
                  }`}
                >
                  {item.badge}
                </span>
              </button>
            );
          })}

          <div className="pt-3 pb-1 px-2 border-t border-slate-200/60 dark:border-slate-800/80">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              تخصيص المظهر والصوت
            </span>
          </div>

          {/* 4 Theme Switcher inside drawer */}
          <div className={`p-2.5 rounded-2xl border space-y-2 ${styles.innerBg} ${styles.innerBorder}`}>
            <span className={`text-xs font-bold block ${styles.titleText}`}>نمط المظهر العام</span>
            <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
              <button
                onClick={() => onThemeChange("natural")}
                className={`py-1.5 px-2 rounded-xl font-bold border transition ${
                  theme === "natural"
                    ? "bg-[#059669] text-white border-emerald-400 shadow-sm"
                    : styles.mutedText
                }`}
              >
                طبيعي
              </button>
              <button
                onClick={() => onThemeChange("paper")}
                className={`py-1.5 px-2 rounded-xl font-bold border transition ${
                  theme === "paper"
                    ? "bg-[#8C5E24] text-white border-[#D6C5A9] shadow-sm"
                    : styles.mutedText
                }`}
              >
                ورقي
              </button>
              <button
                onClick={() => onThemeChange("night")}
                className={`py-1.5 px-2 rounded-xl font-bold border transition ${
                  theme === "night"
                    ? "bg-slate-800 text-sky-400 border-sky-400 shadow-sm"
                    : styles.mutedText
                }`}
              >
                ليلي
              </button>
              <button
                onClick={() => onThemeChange("light")}
                className={`py-1.5 px-2 rounded-xl font-bold border transition ${
                  theme === "light"
                    ? "bg-emerald-600 text-white border-emerald-300 shadow-sm"
                    : styles.mutedText
                }`}
              >
                فاتح
              </button>
            </div>
          </div>

          {/* Sound toggle & Sensory Mode buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => onSoundEnabledChange(!soundEnabled)}
              className={`flex items-center justify-center gap-1.5 p-2.5 rounded-2xl border text-xs font-bold transition ${
                soundEnabled
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                  : `${styles.innerBg} ${styles.innerBorder} ${styles.mutedText}`
              }`}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{soundEnabled ? "الصوت مفعّل" : "الصوت صامت"}</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onSwitchToSensoryMode();
              }}
              className="flex items-center justify-center gap-1.5 p-2.5 rounded-2xl border text-xs font-bold bg-[#D4AF37]/15 text-[#B68C1C] dark:text-[#F3E7C4] border-[#D4AF37]/40 transition hover:scale-102 active:scale-98"
              title="نمط المكفوفين وضعاف البصر الصوتي النبضي"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>نمط المكفوفين</span>
            </button>
          </div>
        </div>

        {/* Drawer Bottom Actions: Endowment & Sources */}
        <div className={`p-4 border-t space-y-2 ${styles.innerBorder} ${
          styles.isNatural ? "bg-[#061A14]" : styles.isPaper ? "bg-[#F7EFE1]" : styles.isNight ? "bg-black/90" : "bg-slate-50"
        }`}>
          <button
            onClick={() => {
              onClose();
              onOpenEndowment();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-emerald-600 to-teal-700 text-white font-bold text-xs shadow-md transition active:scale-98"
          >
            <Gift className="w-4 h-4" />
            <span>وقف النور • استمرارية التطبيق الخيري</span>
          </button>

          <div className="flex items-center justify-between text-[11px] px-1">
            <button
              onClick={() => {
                onClose();
                onOpenSources();
              }}
              className={`flex items-center gap-1 font-semibold hover:underline ${styles.mutedText}`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>المصادر والاعتمادات الرسمية</span>
            </button>
            <span className={`font-mono ${styles.mutedText}`}>v2.5.0</span>
          </div>
        </div>
      </aside>
    </div>
  );
};
