import React, { useState } from "react";
import {
  Sparkles,
  Volume2,
  X,
  Vibrate,
  Sliders,
  CheckCircle2,
  Play,
  Heart,
  Moon,
  Sun,
  Clock,
  Compass,
  BookOpen,
} from "lucide-react";
import {
  hapticEngine,
  HAPTIC_PATTERNS_CATALOG,
  HapticPatternType,
  HapticPatternMeta,
} from "../../utils/hapticEngine";
import { speechEngine } from "../../utils/speechEngine";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const HapticPatternsGuideModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeCategory, setActiveCategory] = useState<"all" | "prayer" | "athkar" | "quran" | "assistant">("all");
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);
  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(hapticEngine.getEnabled());
  const [intensity, setIntensity] = useState<"subtle" | "normal" | "strong">(hapticEngine.getIntensity());

  if (!isOpen) return null;

  const filteredPatterns =
    activeCategory === "all"
      ? HAPTIC_PATTERNS_CATALOG
      : HAPTIC_PATTERNS_CATALOG.filter((p) => p.category === activeCategory);

  const handleTestPattern = (meta: HapticPatternMeta) => {
    setActivePlayingId(meta.id);
    hapticEngine.trigger(meta.id);
    speechEngine.speak(`تجربة ${meta.nameAr}: ${meta.rhythmDescription}`);

    const duration = meta.pattern.reduce((acc, cur) => acc + cur, 0);
    setTimeout(() => {
      setActivePlayingId(null);
    }, Math.max(duration + 100, 600));
  };

  const handleToggleHaptics = () => {
    const nextState = !hapticsEnabled;
    setHapticsEnabled(nextState);
    hapticEngine.setEnabled(nextState);
    if (nextState) {
      hapticEngine.trigger("tasbih_milestone_33");
      speechEngine.speak("تم تفعيل ميزة الاهتزاز النمطي بنجاح");
    } else {
      speechEngine.speak("تم إيقاف ميزة الاهتزاز النمطي");
    }
  };

  const handleChangeIntensity = (lvl: "subtle" | "normal" | "strong") => {
    setIntensity(lvl);
    hapticEngine.setIntensity(lvl);
    hapticEngine.trigger("prayer_dhuhr");
    speechEngine.speak(
      `تم تغيير قوة الاهتزاز إلى: ${lvl === "subtle" ? "خفيف" : lvl === "normal" ? "متوسط" : "قوي"}`
    );
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "prayer":
        return <Clock className="w-4 h-4 text-amber-400" />;
      case "athkar":
        return <Sun className="w-4 h-4 text-emerald-400" />;
      case "quran":
        return <BookOpen className="w-4 h-4 text-teal-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="haptic-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn font-['Cairo',sans-serif]"
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-[#121216] border border-white/10 rounded-3xl shadow-2xl text-white overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-emerald-950/40 via-transparent to-amber-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-[0_0_15px_rgba(5,150,105,0.3)]">
              <Vibrate className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 id="haptic-modal-title" className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>أنماط الاهتزاز النمطي (Haptic Patterns)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  دعم المكفوفين
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                لغة لمسية واهتزازات ذكية فريدة تمكن الكفيف من تمييز الصلوات والأذكار دون الحاجة للنظر للشاشة
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center border border-white/10 transition"
            aria-label="إغلاق النافذة"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Global Controls: Enable/Disable & Intensity */}
        <div className="p-4 bg-white/[0.02] border-b border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleHaptics}
              className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-2 border transition ${
                hapticsEnabled
                  ? "bg-emerald-500 text-white border-emerald-400 shadow-sm"
                  : "bg-red-500/20 text-red-300 border-red-500/40"
              }`}
            >
              <Vibrate className="w-3.5 h-3.5" />
              <span>{hapticsEnabled ? "الاهتزاز مفعل" : "الاهتزاز متوقف"}</span>
            </button>

            <span className="text-zinc-400 hidden sm:inline">شدة الاهتزاز:</span>
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
              {(["subtle", "normal", "strong"] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => handleChangeIntensity(lvl)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition text-[11px] ${
                    intensity === lvl
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {lvl === "subtle" ? "خفيف" : lvl === "normal" ? "متوسط" : "قوي"}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() =>
              speechEngine.speak(
                "نظام الاهتزاز النمطي يرسل نبضات مميزة: الفجر نبضات متصاعدة، والظهر نبضتان، والعصر ثلاث نبضات سريعة، والمغرب نبضتان ثم هدوء، والعشاء نبضتان عميقتان. وأذكار الصباح متصاعدة، والمساء متوازنة، والنوم هادئة متناقصة."
              )
            }
            className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-bold transition"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>شرح صوتي شامل</span>
          </button>
        </div>

        {/* Category Filters */}
        <div className="px-4 py-2.5 border-b border-white/5 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
          {[
            { id: "all", label: "جميع الأنماط" },
            { id: "prayer", label: "مواقيت الصلوات الخمس" },
            { id: "athkar", label: "تنبيهات الأذكار" },
            { id: "quran", label: "الحفظ التكراري والمصحف" },
            { id: "assistant", label: "المساعد والحركات" },
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id as any)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-bold transition ${
                activeCategory === c.id
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "bg-white/5 text-zinc-400 hover:text-zinc-200 border border-transparent"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Patterns List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {filteredPatterns.map((meta) => {
            const isPlaying = activePlayingId === meta.id;
            return (
              <div
                key={meta.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isPlaying
                    ? "bg-emerald-500/15 border-emerald-400/60 shadow-[0_0_15px_rgba(5,150,105,0.2)]"
                    : "bg-white/[0.03] border-white/5 hover:border-white/15"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mt-0.5">
                      {getCategoryIcon(meta.category)}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-sm text-white">{meta.nameAr}</h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-zinc-400 border border-white/10">
                          {meta.rhythmDescription}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                        {meta.descriptionAr}
                      </p>

                      {/* Visual Pulse Bar Rhythm representation */}
                      <div className="flex items-center gap-1.5 mt-2.5">
                        {meta.pattern.map((dur, i) => {
                          const isVibe = i % 2 === 0;
                          return (
                            <span
                              key={i}
                              style={{
                                width: isVibe ? `${Math.min(dur / 4, 60)}px` : `${Math.min(dur / 6, 25)}px`,
                                height: isVibe ? "8px" : "3px",
                              }}
                              className={`rounded-full transition-all ${
                                isVibe
                                  ? isPlaying
                                    ? "bg-emerald-400 animate-pulse"
                                    : "bg-emerald-500/70"
                                  : "bg-zinc-700"
                              }`}
                              title={isVibe ? `اهتزاز ${dur} ملّي ثانية` : `سكون ${dur} ملّي ثانية`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Test Vibration Button */}
                  <button
                    onClick={() => handleTestPattern(meta)}
                    disabled={!hapticsEnabled}
                    className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shrink-0 transition active:scale-95 ${
                      isPlaying
                        ? "bg-emerald-500 text-white shadow-md animate-pulse"
                        : "bg-white/10 hover:bg-white/15 text-white border border-white/10"
                    } ${!hapticsEnabled ? "opacity-50 cursor-not-allowed" : ""}`}
                    title="تجربة النمط على الهاتف"
                  >
                    <Play className={`w-3.5 h-3.5 ${isPlaying ? "fill-current" : ""}`} />
                    <span>{isPlaying ? "جاري الاهتزاز..." : "تجربة النمط"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#0E0E12] flex items-center justify-between text-xs text-zinc-400">
          <span>* يعمل الاهتزاز مباشرة على متصفحات الهواتف الذكية الداعمة لمستشعر الاهتزاز.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition"
          >
            حفظ وإغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
