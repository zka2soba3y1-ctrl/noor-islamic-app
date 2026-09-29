import React, { useState, useEffect } from "react";
import { AppMode } from "./types";
import { ModeToggle } from "./components/ModeToggle";
import { SensoryHome } from "./components/sensory/SensoryHome";
import { VisualHome } from "./components/visual/VisualHome";
import { BlueprintView } from "./components/blueprint/BlueprintView";
import { VoiceCompanionModal } from "./components/VoiceCompanionModal";
import { soundEngine } from "./utils/soundEngine";
import { speechEngine } from "./utils/speechEngine";
import { DoubleShakeDetector } from "./utils/gestureController";
import { i18n } from "./utils/i18n";
import { AchievementsModal } from "./components/visual/AchievementsModal";
import { WallpaperSelectorModal } from "./components/visual/WallpaperSelectorModal";
import { DeveloperProfileModal } from "./components/visual/DeveloperProfileModal";
import { SmartAthkarNotificationBanner } from "./components/visual/SmartAthkarNotificationBanner";

export default function App() {
  const [mode, setMode] = useState<AppMode>("visual");
  const [isVoiceCompanionOpen, setIsVoiceCompanionOpen] = useState(false);
  const [isBlindModeCall, setIsBlindModeCall] = useState(false);
  const [shakeWelcomeMessage, setShakeWelcomeMessage] = useState<string | null>(null);
  const [isRtl, setIsRtl] = useState<boolean>(() => i18n.isRTL());
  const [isGlobalAchievementsOpen, setIsGlobalAchievementsOpen] = useState(false);
  const [isGlobalWallpapersOpen, setIsGlobalWallpapersOpen] = useState(false);
  const [isDeveloperOpen, setIsDeveloperOpen] = useState(false);

  // Sync language and RTL direction
  useEffect(() => {
    const handleLangChange = () => {
      setIsRtl(i18n.isRTL());
    };
    const handleOpenAch = () => setIsGlobalAchievementsOpen(true);
    const handleOpenWp = () => setIsGlobalWallpapersOpen(true);
    const handleOpenDev = () => setIsDeveloperOpen(true);

    window.addEventListener("noor-language-changed", handleLangChange);
    window.addEventListener("noor-open-achievements", handleOpenAch);
    window.addEventListener("noor-open-wallpapers", handleOpenWp);
    window.addEventListener("noor-open-developer", handleOpenDev);

    return () => {
      window.removeEventListener("noor-language-changed", handleLangChange);
      window.removeEventListener("noor-open-achievements", handleOpenAch);
      window.removeEventListener("noor-open-wallpapers", handleOpenWp);
      window.removeEventListener("noor-open-developer", handleOpenDev);
    };
  }, []);

  // Initialize sound context on first user click
  useEffect(() => {
    const handleFirstInteraction = () => {
      soundEngine.init();
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
    };

    window.addEventListener("click", handleFirstInteraction, { once: true });
    window.addEventListener("touchstart", handleFirstInteraction, { once: true });
    return () => {
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
    };
  }, []);

  // Shake Gesture Detector: هز الموبايل مرتين ورا بعض يبدأ المساعد في إطلاق رسالة ترحيب
  useEffect(() => {
    const shakeDetector = new DoubleShakeDetector(() => {
      soundEngine.playAssistantActivate();
      window.dispatchEvent(
        new CustomEvent("noor-open-voice-companion", {
          detail: {
            fromShake: true,
            welcomeMessage:
              "أهلاً بك يا غالي في تطبيق النور! أنا رفيقك الذكي وجاهز في خدمتك، تأمرني بأي شيء؟",
          },
        })
      );
    }, 18);

    shakeDetector.start();
    return () => shakeDetector.stop();
  }, []);

  // Global event listener to open Voice Companion from anywhere in the app
  useEffect(() => {
    const handleOpenCompanion = (e: Event) => {
      soundEngine.playAssistantActivate();
      const detail = (
        e as CustomEvent<{
          blindMode?: boolean;
          fromShake?: boolean;
          welcomeMessage?: string;
        }>
      ).detail;
      setIsBlindModeCall(detail?.blindMode ?? (mode === "sensory"));
      if (detail?.fromShake) {
        setShakeWelcomeMessage(
          detail.welcomeMessage ||
            "أهلاً بك يا غالي في تطبيق النور! أنا رفيقك الذكي وجاهز في خدمتك، تأمرني بأي شيء؟"
        );
      } else {
        setShakeWelcomeMessage(null);
      }
      setIsVoiceCompanionOpen(true);
    };
    window.addEventListener("noor-open-voice-companion", handleOpenCompanion);
    return () => window.removeEventListener("noor-open-voice-companion", handleOpenCompanion);
  }, [mode]);

  const handleModeChange = (newMode: AppMode) => {
    setMode(newMode);
    if (newMode === "sensory") {
      // Auto-activate voice companion call for the blind user
      setIsBlindModeCall(true);
      setIsVoiceCompanionOpen(true);
    } else {
      setIsBlindModeCall(false);
    }
  };

  return (
    <div
      id="noor-app-root"
      dir={isRtl ? "rtl" : "ltr"}
      className={`min-h-screen font-['Cairo',sans-serif] transition-colors duration-300 ${
        mode === "sensory"
          ? "bg-[#09090B] text-white"
          : mode === "blueprint"
          ? "bg-[#09090B] text-[#E4E4E7]"
          : "bg-transparent"
      }`}
    >
      {/* Top Universal Navigation Bar */}
      <ModeToggle
        currentMode={mode}
        onModeChange={handleModeChange}
        onOpenVoiceCompanion={() => {
          setIsBlindModeCall(mode === "sensory");
          setIsVoiceCompanionOpen(true);
        }}
      />

      {/* Global Smart Athkar In-App Notification Alert Banner */}
      <SmartAthkarNotificationBanner
        onNavigateTab={(tab) => {
          if (mode !== "visual") setMode("visual");
          window.dispatchEvent(new CustomEvent("noor-navigate-tab", { detail: { tab } }));
        }}
      />

      {/* Main View Router */}
      <main id="main-content-area" className="w-full">
        {mode === "sensory" && <SensoryHome />}
        {mode === "visual" && <VisualHome />}
        {mode === "blueprint" && <BlueprintView />}
      </main>

      {/* Voice Companion Modal */}
      <VoiceCompanionModal
        isOpen={isVoiceCompanionOpen}
        onClose={() => setIsVoiceCompanionOpen(false)}
        isBlindModeCall={isBlindModeCall}
        shakeWelcomeMessage={shakeWelcomeMessage}
        onSwitchMode={(newMode) => handleModeChange(newMode)}
        onNavigateTab={(tab) => {
          if (mode !== "visual") setMode("visual");
          window.dispatchEvent(new CustomEvent("noor-navigate-tab", { detail: { tab } }));
        }}
        onSelectSurah={(surahNumber) => {
          if (mode !== "visual") setMode("visual");
          window.dispatchEvent(new CustomEvent("noor-navigate-tab", { detail: { tab: "quran", surahNumber } }));
        }}
      />

      {/* Global Modals for Achievements and Wallpapers */}
      <AchievementsModal
        isOpen={isGlobalAchievementsOpen}
        onClose={() => setIsGlobalAchievementsOpen(false)}
      />

      <WallpaperSelectorModal
        isOpen={isGlobalWallpapersOpen}
        onClose={() => setIsGlobalWallpapersOpen(false)}
      />

      <DeveloperProfileModal
        isOpen={isDeveloperOpen}
        onClose={() => setIsDeveloperOpen(false)}
      />

      {/* Discreet Footer (Visible in Visual & Blueprint modes) */}
      {mode !== "sensory" && (
        <footer
          id="app-footer"
          className="border-t border-black/5 dark:border-white/5 pt-6 pb-32 sm:pb-36 px-4 text-center text-xs opacity-100 space-y-2 mt-8 relative z-10 bg-transparent"
        >
          <div className="flex flex-wrap items-center justify-center gap-2 font-bold text-slate-500 dark:text-zinc-400">
            <div className="w-1.5 h-1.5 rounded-full bg-[#059669] shadow-[0_0_8px_#059669]"></div>
            <span>مشروع ومحرك النور الإسلامي العالمي</span>
            <span className="text-slate-400 dark:text-zinc-700">•</span>
            <span className="text-[#059669] font-medium">وقف تقني لوجه الله تعالى</span>
            <span className="text-slate-400 dark:text-zinc-700">•</span>
            <span className="font-mono text-slate-500 dark:text-zinc-400">100% غير ربحي وصفري التكلفة</span>
          </div>
          <p className="max-w-xl mx-auto text-slate-500 dark:text-zinc-500 leading-relaxed text-[11px]">
            مُصمم لدمج المكفوفين وضعاف البصر مع عموم المسلمين في تجربة عبادية مستقلة، خاشعة، وخالية تماماً من الإعلانات وتتبع البيانات.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <button
              onClick={() => {
                soundEngine.playTasbihClick();
                setIsDeveloperOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#8C5E24] dark:text-[#D4AF37] border border-[#D4AF37]/40 font-bold text-[11px] transition active:scale-95"
              title="صفحة المطور: أحمد بن علي الجينيس — السيرة والإنجازات والتواصل"
            >
              <span>👤</span>
              <span>عن المطور — أحمد بن علي الجينيس</span>
            </button>
            <a
              href="https://wa.me/201130680225"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#059669]/10 hover:bg-[#059669]/20 text-[#047857] dark:text-emerald-400 border border-[#059669]/40 font-bold text-[11px] transition active:scale-95"
              title="تواصل واتساب مباشر"
            >
              <span>💬</span>
              <span>تواصل واتساب</span>
            </a>
          </div>
        </footer>
      )}
    </div>
  );
}

