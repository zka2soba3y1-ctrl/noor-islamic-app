import React, { useState, useEffect, Suspense, lazy } from "react";
import { AppMode } from "../types";
import { Eye, EyeOff, FileText, Globe, Award, Palette, Check, Key, Bot, Sparkles, Settings, User, Home } from "lucide-react";
import { speechEngine } from "../utils/speechEngine";
import { soundEngine } from "../utils/soundEngine";
import { PWAInstallButton } from "./pwa/PWAInstallButton";
import { i18n, SUPPORTED_LANGUAGES, SupportedLanguage } from "../utils/i18n";
import { achievementsService } from "../utils/achievementsService";

// Lazy-load the AI Settings Modal to ensure it's bundled as a separate chunk
const CustomAISettingsModal = lazy(() =>
  import("./ai/CustomAISettingsModal").then((m) => ({ default: m.CustomAISettingsModal }))
);

interface Props {
  currentMode: AppMode;
  onModeChange: (mode: AppMode) => void;
  onOpenVoiceCompanion: () => void;
  onOpenWelcome?: () => void;
}

export const ModeToggle: React.FC<Props> = ({
  currentMode,
  onModeChange,
  onOpenVoiceCompanion,
  onOpenWelcome,
}) => {
  const [lang, setLang] = useState<SupportedLanguage>(() => i18n.getLanguage());
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [unlockedBadgesCount, setUnlockedBadgesCount] = useState(() =>
    achievementsService.getUnlockedCount()
  );
  const [isAISettingsOpen, setIsAISettingsOpen] = useState(false);

  useEffect(() => {
    const handleLangChange = (e: any) => {
      if (e.detail?.lang) {
        setLang(e.detail.lang);
      }
    };
    const handleAchUpdate = () => {
      setUnlockedBadgesCount(achievementsService.getUnlockedCount());
    };

    window.addEventListener("noor-language-changed", handleLangChange);
    window.addEventListener("noor-achievements-updated", handleAchUpdate);
    window.addEventListener("noor-badge-unlocked", handleAchUpdate);

    return () => {
      window.removeEventListener("noor-language-changed", handleLangChange);
      window.removeEventListener("noor-achievements-updated", handleAchUpdate);
      window.removeEventListener("noor-badge-unlocked", handleAchUpdate);
    };
  }, []);

  const handleMode = (mode: AppMode) => {
    soundEngine.playTasbihClick();
    onModeChange(mode);
    if (mode === "sensory") {
      speechEngine.speakNavFeedback(
        i18n.t("nav.sensory"),
        "تم تحويل الواجهة بالكامل إلى شاشة سوداء مخصصة للتفاعل الحسي واللمسي والصوتي."
      );
    } else if (mode === "visual") {
      speechEngine.speakNavFeedback(
        i18n.t("nav.visual"),
        "تم تفعيل الواجهة المرئية الشاملة مع دعم كامل للتغذية الراجعة الصوتية."
      );
    } else if (mode === "blueprint") {
      speechEngine.speakNavFeedback(
        i18n.t("nav.blueprint"),
        "تم فتح دراسة المشروع الشاملة والنموذج التنفيذي."
      );
    }
  };

  const handleOpenDeveloper = () => {
    soundEngine.playTasbihClick();
    speechEngine.speakNavFeedback(
      i18n.t("nav.developer"),
      "تم فتح صفحة المطور: أحمد بن علي الجينيس — السيرة والإنجازات والتواصل."
    );
    window.dispatchEvent(new CustomEvent("noor-open-developer"));
  };

  const handleGoHome = () => {
    soundEngine.playTasbihClick();
    if (currentMode !== "visual") {
      onModeChange("visual");
    }
    window.dispatchEvent(new CustomEvent("noor-navigate-tab", { detail: { tab: "home" } }));
    window.scrollTo({ top: 0, behavior: "smooth" });
    speechEngine.speakNavFeedback(
      i18n.t("nav.home"),
      "تم العودة إلى الصفحة الرئيسية."
    );
  };

  const handleLanguageSelect = (selectedLang: SupportedLanguage) => {
    soundEngine.playTasbihClick();
    i18n.setLanguage(selectedLang);
    setLang(selectedLang);
    setIsLangMenuOpen(false);
  };

  const currentLangMeta = i18n.getMeta();

  return (
    <>
      <header
        id="app-header-nav"
        className={`sticky top-0 z-50 border-b backdrop-blur-md px-3 sm:px-6 py-2 transition-colors duration-300 ${
          currentMode === "sensory"
            ? "bg-[#09090B]/95 border-white/10 text-yellow-400"
            : "bg-[#09090B]/90 border-white/5 text-[#E4E4E7]"
        }`}
      >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 flex-wrap">
        {/* Official Brand Logo - Clickable, returns Home */}
        <div className="flex items-center gap-3">
          <button
            id="btn-nav-logo-home"
            onClick={handleGoHome}
            className="rounded-2xl hover:scale-105 active:scale-95 transition-transform duration-300 focus:outline-none"
            title="العودة إلى الصفحة الرئيسية"
            aria-label="العودة إلى الصفحة الرئيسية"
          >
            <img
              src="/app-logo.png"
              alt="شعار تطبيق النور — اضغط للعودة للرئيسية"
              className="h-12 sm:h-14 md:h-16 w-auto object-contain rounded-2xl drop-shadow-[0_4px_20px_rgba(212,175,55,0.4)] pointer-events-none"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/app-logo.png";
              }}
              referrerPolicy="no-referrer"
            />
          </button>
        </div>

        {/* View Switcher Controls, i18n Language Selector, & Achievements */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-wrap justify-end min-w-0">
          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              id="btn-language-selector"
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl bg-[#121214] border border-white/10 hover:border-emerald-500/40 text-zinc-300 hover:text-white text-xs font-semibold transition-all active:scale-95"
              title="تغيير لغة الواجهة (Language / Langue / زبان)"
              aria-label="تغيير لغة الواجهة"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs">{currentLangMeta.flag}</span>
              <span className="hidden sm:inline text-[11px] font-medium">{currentLangMeta.nativeName}</span>
            </button>

            {isLangMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsLangMenuOpen(false)}
                />
                <div className="absolute top-full mt-1.5 right-0 sm:right-auto sm:left-0 z-50 w-44 rounded-2xl bg-[#121214] border border-emerald-500/30 shadow-[0_12px_36px_rgba(0,0,0,0.8)] p-1.5 space-y-1 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2.5 py-1 text-[10px] font-bold text-zinc-400 border-b border-white/5">
                    اختر اللغة • Language
                  </div>
                  {SUPPORTED_LANGUAGES.map((item) => (
                    <button
                      key={item.code}
                      onClick={() => handleLanguageSelect(item.code)}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-all ${
                        lang === item.code
                          ? "bg-emerald-600/25 text-emerald-300 border border-emerald-500/40"
                          : "text-zinc-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{item.flag}</span>
                        <span>{item.nativeName}</span>
                      </div>
                      {lang === item.code && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Quick Achievements Trigger */}
          <button
            id="btn-nav-achievements"
            onClick={() => {
              soundEngine.playTasbihClick();
              window.dispatchEvent(new CustomEvent("noor-open-achievements"));
            }}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl bg-[#121214] border border-white/10 hover:border-amber-500/40 text-amber-400 text-xs font-semibold transition-all active:scale-95 relative"
            title="الأوسمة والإنجازات الروحانية"
            aria-label="الأوسمة والإنجازات"
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {unlockedBadgesCount}
            </span>
          </button>

          {/* Quick Islamic Wallpapers Trigger */}
          <button
            id="btn-nav-wallpapers"
            onClick={() => {
              soundEngine.playTasbihClick();
              window.dispatchEvent(new CustomEvent("noor-open-wallpapers"));
            }}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#121214] border border-white/10 hover:border-emerald-500/40 text-emerald-400 text-xs font-semibold transition-all active:scale-95"
            title="خلفيات الفن الإسلامي التجريدي"
            aria-label="خلفيات الفن الإسلامي"
          >
            <Palette className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] hidden md:inline">الخلفيات</span>
          </button>

          {/* PWA In-App Install Button */}
          <PWAInstallButton variant="nav" />

          {/* AI Settings Button */}
          <button
            id="btn-open-ai-settings"
            onClick={() => {
              soundEngine.playTasbihClick();
              setIsAISettingsOpen(true);
            }}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-emerald-400 hover:text-emerald-300 font-semibold text-xs border border-white/10 hover:border-emerald-500/40 transition-all active:scale-95"
            title="إعدادات مفاتيح الذكاء الاصطناعي (Gemini / OpenAI / مخصص)"
            aria-label="إعدادات الذكاء الاصطناعي"
          >
            <div className="flex items-center gap-1">
              <Settings className="w-3.5 h-3.5" />
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="hidden sm:inline font-medium">إعدادات AI</span>
          </button>

          {/* Mode Segmented Controls */}
          <div className="bg-[#121214] p-1 rounded-xl border border-white/10 flex items-center gap-1">
            <button
              id="btn-nav-sensory"
              onClick={() => handleMode("sensory")}
              className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentMode === "sensory"
                  ? "bg-yellow-400 text-black shadow-md font-bold"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
              title="نمط البصيرة الحسي للمكفوفين"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>{i18n.t("nav.sensory")}</span>
            </button>

            <button
              id="btn-nav-visual"
              onClick={() => handleMode("visual")}
              className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentMode === "visual"
                  ? "bg-[#059669] text-white shadow-[0_0_15px_rgba(5,150,105,0.4)] font-bold"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
              title="النمط المرئي الحديث لعموم المسلمين"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{i18n.t("nav.visual")}</span>
            </button>
          </div>

          {/* Home, Plan & Developer Group — الرئيسية والخطة وصفحة المطور */}
          <div className="bg-[#121214] p-1 rounded-xl border border-[#D4AF37]/25 flex items-center gap-1">
            <button
              id="btn-nav-home"
              onClick={handleGoHome}
              className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all text-zinc-300 hover:text-white hover:bg-white/5 active:scale-95"
              title="العودة إلى الصفحة الرئيسية"
              aria-label="الصفحة الرئيسية"
            >
              <Home className="w-3.5 h-3.5 text-[#059669]" />
              <span className="hidden md:inline">{i18n.t("nav.home")}</span>
            </button>

            <button
              id="btn-nav-blueprint"
              onClick={() => handleMode("blueprint")}
              className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentMode === "blueprint"
                  ? "bg-white/15 text-white border border-white/20 shadow-md font-bold"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
              title="الملف التقديمي وخطة العمل التنفيذية (Pitch Deck)"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{i18n.t("nav.blueprint")}</span>
            </button>

            <button
              id="btn-nav-developer"
              onClick={handleOpenDeveloper}
              className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all text-[#D4AF37] hover:text-amber-200 hover:bg-[#D4AF37]/10 active:scale-95"
              title="صفحة المطور: أحمد بن علي الجينيس — السيرة والإنجازات والتواصل"
              aria-label="صفحة المطور"
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{i18n.t("nav.developer")}</span>
            </button>
          </div>

          {/* Voice Assistant Trigger */}
          <button
            id="btn-open-voice-companion"
            onClick={() => {
              soundEngine.playAssistantActivate();
              onOpenVoiceCompanion();
            }}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-semibold text-xs shadow-[0_0_20px_rgba(5,150,105,0.35)] transition-all active:scale-95 border border-[#059669]/60"
            title="استدعاء الرفيق الإسلامي الذكي"
          >
            <div className="flex items-center gap-0.5">
              <span className="w-1 h-3.5 bg-white rounded-full animate-pulse"></span>
              <span className="w-1 h-4.5 bg-white rounded-full"></span>
              <span className="w-1 h-2.5 bg-white rounded-full animate-pulse"></span>
            </div>
            <span className="hidden sm:inline font-bold">{i18n.t("nav.companion")}</span>
          </button>
        </div>
      </div>
    </header>

    {/* AI Settings Modal */}
    <Suspense fallback={null}>
      <CustomAISettingsModal
        isOpen={isAISettingsOpen}
        onClose={() => setIsAISettingsOpen(false)}
      />
    </Suspense>
    </>
  );
};
