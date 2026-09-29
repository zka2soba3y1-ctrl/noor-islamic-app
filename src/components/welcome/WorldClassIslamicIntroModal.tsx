import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { soundEngine } from "../../utils/soundEngine";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onEnterApp?: () => void;
}

// Authentic recitation of "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ" by Sheikh Mishary Alafasy
const BASMALAH_AUDIO_URL = "https://everyayah.com/data/Alafasy_128kbps/001001.mp3";
const BASMALAH_BACKUP_URL = "https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3";

export const WorldClassIslamicIntroModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onEnterApp,
}) => {
  const [phase, setPhase] = useState<"loading" | "reveal">("loading");
  const [progress, setProgress] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isPlayingBasmalah, setIsPlayingBasmalah] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Play authentic Basmalah audio recited by Sheikh Mishary Alafasy
  const playBasmalahAudio = () => {
    if (!soundEnabled) return;
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio(BASMALAH_AUDIO_URL);
        audioRef.current.onended = () => setIsPlayingBasmalah(false);
        audioRef.current.onerror = () => {
          if (audioRef.current) {
            audioRef.current.src = BASMALAH_BACKUP_URL;
            audioRef.current.play().catch(() => {});
          }
        };
      }
      audioRef.current.currentTime = 0;
      audioRef.current
        .play()
        .then(() => {
          setIsPlayingBasmalah(true);
        })
        .catch(() => {
          setIsPlayingBasmalah(false);
        });
    } catch {
      setIsPlayingBasmalah(false);
    }
  };

  const stopBasmalahAudio = () => {
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch {}
      setIsPlayingBasmalah(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      stopBasmalahAudio();
      return;
    }

    setPhase("loading");
    setProgress(0);
    playBasmalahAudio();

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.floor(Math.random() * 16) + 10;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setPhase("reveal");
            try {
              soundEngine.playMilestone33();
            } catch {}
          }, 250);
          return 100;
        }
        return next;
      });
    }, 60);

    return () => {
      clearInterval(interval);
      stopBasmalahAudio();
    };
  }, [isOpen, soundEnabled]);

  if (!isOpen) return null;

  const handleEnter = () => {
    stopBasmalahAudio();
    try {
      soundEngine.playTasbihClick();
    } catch {}
    localStorage.setItem("noor_intro_completed", "true");
    if (onEnterApp) onEnterApp();
    onClose();
  };

  const handleSkip = () => {
    stopBasmalahAudio();
    localStorage.setItem("noor_intro_completed", "true");
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="شاشة الاستفتاح والترحيب لتطبيق النور الإسلامي"
      className="fixed inset-0 z-[210] flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300 select-none overflow-hidden"
      dir="rtl"
    >
      {/* Dynamic Ambient Spiritual Glow */}
      <div className="absolute top-1/3 right-1/4 w-64 h-64 sm:w-80 sm:h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/3 left-1/4 w-64 h-64 sm:w-80 sm:h-80 bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none animate-pulse [animation-duration:3.5s]" />

      {/* Central Modal Card - Lighter & Balanced */}
      <div className="w-full max-w-md rounded-3xl bg-gradient-to-b from-[#0A2218]/95 via-[#061711]/95 to-[#030C08]/95 border-2 border-[#D4AF37]/45 shadow-[0_0_60px_rgba(16,185,129,0.3)] overflow-hidden relative z-10 flex flex-col p-5 sm:p-6 text-center text-white">
        
        {/* Top Minimal Action Row */}
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/10 w-full text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px] font-bold text-[#D4AF37] font-alexandria">
              مشروع النور الإسلامي
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                if (!next) stopBasmalahAudio();
              }}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition cursor-pointer"
              title={soundEnabled ? "كتم الصوت" : "تشغيل الصوت"}
            >
              {soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-[#D4AF37]" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-slate-500" />
              )}
            </button>
            <button
              onClick={handleSkip}
              className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-medium text-slate-300 hover:text-white transition cursor-pointer"
            >
              تخطي
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PHASE 1: PROGRESSIVE SACRED LOADING */}
        {/* ========================================================================= */}
        {phase === "loading" && (
          <div className="py-7 sm:py-9 space-y-4 animate-in zoom-in-95 fade-in duration-300">
            {/* Spinning Golden Islamic Medallion */}
            <div className="relative inline-flex items-center justify-center">
              <div className="w-24 h-24 rounded-full border-2 border-dashed border-[#D4AF37]/40 animate-spin [animation-duration:12s]" />
              <div className="w-18 h-18 rounded-full border border-emerald-400/50 animate-spin [animation-duration:6s] [animation-direction:reverse] absolute" />
              <div className="w-12 h-12 rounded-2xl bg-[#061A14] border border-[#D4AF37] p-1 flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.4)] absolute">
                <img
                  src="https://i.ibb.co/pBdt7pHC/3.png"
                  alt="شعار النور"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/app-logo.png";
                  }}
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            {/* Sacred Basmalah & Smooth Progress Indicator */}
            <div className="space-y-1">
              <div className="font-amiri text-lg sm:text-xl text-[#D4AF37] font-bold tracking-wide">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </div>
              <p className="text-[11px] text-emerald-300/80 font-medium">
                جارٍ تهيئة المحتوى الإيماني • {progress}%
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-48 mx-auto h-1.5 rounded-full bg-black/60 border border-white/10 p-0.5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-[#D4AF37] to-amber-300 transition-all duration-100 shadow-[0_0_8px_rgba(212,175,55,0.6)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PHASE 2: REFINED REVEAL & INTRO (LIGHTER, CRISP, AND SIZED APPROPRIATELY) */}
        {/* ========================================================================= */}
        {phase === "reveal" && (
          <div className="py-3 sm:py-4 space-y-4 animate-in zoom-in-95 fade-in duration-400">
            
            {/* Elegant Logo Presentation with Radiant Rings */}
            <div className="relative inline-flex items-center justify-center my-1">
              {/* Outer Radiant Glow Aura */}
              <div className="w-28 h-28 rounded-full bg-gradient-to-r from-emerald-500/25 to-[#D4AF37]/25 blur-xl absolute pointer-events-none" />
              
              {/* Spinning Sacred Dashed Ring */}
              <div className="w-26 h-26 rounded-full border border-dashed border-[#D4AF37]/40 animate-spin [animation-duration:35s] absolute pointer-events-none" />
              <div className="w-22 h-22 rounded-full border border-emerald-500/40 animate-pulse absolute pointer-events-none" />

              {/* Logo Box */}
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#061D15] via-[#0A261E] to-[#04120D] border-2 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.5)] p-1.5 flex items-center justify-center relative z-10">
                <img
                  src="https://i.ibb.co/pBdt7pHC/3.png"
                  alt="شعار مشروع النور الإسلامي"
                  className="w-full h-full object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/app-logo.png";
                  }}
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            {/* Concise Sacred Opening & Headings */}
            <div className="space-y-2">
              
              {/* Basmalah with Audio Replay */}
              <div className="flex items-center justify-center gap-2">
                <span className="font-amiri text-xl sm:text-2xl text-[#D4AF37] font-bold tracking-wider drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]">
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </span>
                <button
                  onClick={playBasmalahAudio}
                  className={`p-1 rounded-full border transition active:scale-95 cursor-pointer ${
                    isPlayingBasmalah
                      ? "bg-emerald-500/30 border-emerald-400 text-emerald-300 animate-pulse"
                      : "bg-[#D4AF37]/15 border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/30"
                  }`}
                  title="استماع للبَسملة بصوت الشيخ مشاري العفاسي"
                >
                  {isPlayingBasmalah ? (
                    <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current" />
                  )}
                </button>
              </div>

              {/* Rephrased, Beautiful & Balanced Main Title */}
              <div className="space-y-1">
                <h2 className="text-base sm:text-lg font-black font-alexandria text-white tracking-tight">
                  مشروع النور الإسلامي
                </h2>
                <p className="text-xs text-emerald-300/90 font-medium">
                  منصتك الإيمانية الجامعة • مصحف، أذكار، ومواقيت الصلاة
                </p>
              </div>

              {/* 3 Concise Feature Chips */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/5 border border-white/10 text-slate-200">
                  📖 مصحف مرتل
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/5 border border-white/10 text-slate-200">
                  🤲 حصن المسلم
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/5 border border-white/10 text-slate-200">
                  🕌 مواقيت وقبلة
                </span>
              </div>
            </div>

            {/* APPROPRIATELY SIZED & SHAPED ENTER BUTTON */}
            <div className="pt-2">
              <button
                id="enter-app-button"
                onClick={handleEnter}
                className="w-full max-w-xs mx-auto py-3 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-[#D4AF37] to-emerald-500 hover:brightness-110 text-slate-950 font-black text-xs sm:text-sm shadow-[0_0_25px_rgba(16,185,129,0.45)] transition-all active:scale-95 flex items-center justify-center gap-2 border border-emerald-300 cursor-pointer group"
              >
                <Sparkles className="w-4 h-4 text-slate-950 group-hover:rotate-12 transition-transform" />
                <span className="tracking-wide text-sm font-black font-alexandria">تَفَضَّلْ بِالدُّخُولِ</span>
                <ArrowLeft className="w-4 h-4 text-slate-950 group-hover:-translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Pure Waqf Tag */}
            <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1.5 pt-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>وقف تقني خالص لوجه الله تعالى • خالي من الإعلانات</span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
