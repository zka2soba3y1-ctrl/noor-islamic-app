import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  Sun,
  Moon,
  Clock,
  Check,
  Sliders,
  Palette,
  Eye,
  Droplets,
  RotateCcw,
} from "lucide-react";
import {
  wallpaperManager,
  ISLAMIC_WALLPAPERS,
  IslamicWallpaper,
} from "../../utils/wallpaperManager";
import { ThemeMode } from "../../types";
import { i18n } from "../../utils/i18n";
import { soundEngine } from "../../utils/soundEngine";
import { speechEngine } from "../../utils/speechEngine";
import { hapticEngine } from "../../utils/hapticEngine";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const THEME_OPTIONS: Array<{ id: ThemeMode; label: string; emoji: string; hint: string }> = [
  { id: "natural", label: "طبيعي", emoji: "🌿", hint: "داكن أخضر — الافتراضي" },
  { id: "paper", label: "ورقي", emoji: "📜", hint: "فاتح بيج — أوضح للقراءة" },
  { id: "night", label: "ليلي", emoji: "🌙", hint: "داكن كحلي — مريح ليلاً" },
  { id: "light", label: "فاتح", emoji: "☀️", hint: "فاتح نهاري مشرق" },
];

const THEME_AR_NAMES: Record<ThemeMode, string> = {
  natural: "الطبيعي",
  paper: "الورقي",
  night: "الليلي",
  light: "الفاتح",
};

function getStoredTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem("noor_theme");
    if (saved === "light" || saved === "paper" || saved === "night" || saved === "natural") {
      return saved;
    }
  } catch {}
  return "natural";
}

export const WallpaperSelectorModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeId, setActiveId] = useState<string>(() => wallpaperManager.getActiveId());
  const [opacity, setOpacity] = useState<number>(() => wallpaperManager.getOpacity());
  const [blur, setBlur] = useState<number>(() => wallpaperManager.getBlur());
  const [activeTheme, setActiveTheme] = useState<ThemeMode>(() => getStoredTheme());
  const [autoSync, setAutoSync] = useState<boolean>(() => {
    try {
      return localStorage.getItem("noor_wallpaper_autosync") !== "0";
    } catch {
      return true;
    }
  });

  useEffect(() => {
    const handleUpdate = () => {
      setActiveId(wallpaperManager.getActiveId());
      setOpacity(wallpaperManager.getOpacity());
      setBlur(wallpaperManager.getBlur());
    };
    window.addEventListener("noor-wallpaper-changed", handleUpdate);
    return () => window.removeEventListener("noor-wallpaper-changed", handleUpdate);
  }, []);

  if (!isOpen) return null;

  const currentLang = i18n.getLanguage();
  const currentActiveWp = wallpaperManager.getCurrentWallpaper();

  const handleSelectWallpaper = (id: string, nameAr: string) => {
    soundEngine.playTasbihClick();
    hapticEngine.trigger("tasbih_tick");
    wallpaperManager.setWallpaper(id);
    setActiveId(id);
    const wp = ISLAMIC_WALLPAPERS.find((w) => w.id === id);
    if (wp && autoSync && wp.recommendedTheme !== activeTheme) {
      applyTheme(wp.recommendedTheme, true);
    }
    speechEngine.speak(`تم تفعيل خلفية: ${nameAr}`);
  };

  const applyTheme = (id: ThemeMode, silent = false) => {
    soundEngine.playTasbihClick();
    setActiveTheme(id);
    try {
      localStorage.setItem("noor_theme", id);
    } catch {}
    window.dispatchEvent(new CustomEvent("noor-set-theme", { detail: { theme: id } }));
    if (!silent) {
      speechEngine.speak(`تم تفعيل الثيم ${THEME_AR_NAMES[id]}`);
    }
  };

  const handleAutoSyncToggle = () => {
    const next = !autoSync;
    setAutoSync(next);
    try {
      localStorage.setItem("noor_wallpaper_autosync", next ? "1" : "0");
    } catch {}
    soundEngine.playTasbihClick();
  };

  const handleOpacityChange = (val: number) => {
    setOpacity(val);
    wallpaperManager.setOpacity(val);
  };

  const handleBlurChange = (val: number) => {
    setBlur(val);
    wallpaperManager.setBlur(val);
  };

  const handleReset = () => {
    soundEngine.playTasbihClick();
    wallpaperManager.resetDefaults();
    setActiveId("auto");
    setOpacity(0.25);
    setBlur(0);
    if (autoSync) {
      applyTheme("natural", true);
    }
    speechEngine.speak("تمت إعادة الخلفيات للوضع الافتراضي: تبديل تلقائي مع أوقات اليوم");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl bg-[#121214] border border-white/10 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Palette className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>{i18n.t("wallpapers.title")}</span>
              </h2>
              <p className="text-xs text-zinc-400">
                {i18n.t("wallpapers.subtitle")}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Automatic Time of Day Banner */}
          <div
            onClick={() => handleSelectWallpaper("auto", "التبديل التلقائي مع أوقات الصلاة واليوم")}
            className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
              activeId === "auto"
                ? "bg-emerald-500/15 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/30"
                : "bg-white/[0.02] border-white/10 hover:border-white/20"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-white">
                    {i18n.t("wallpapers.auto_time")}
                  </h4>
                  {activeId === "auto" && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 font-bold">
                      نشط حالياً: {currentActiveWp.name[currentLang] || currentActiveWp.name.ar}
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  يتغير المظهر تلقائياً بين الفجر، الظهر، العصر، المغرب والعشاء بتناغم تام.
                </p>
              </div>
            </div>

            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                activeId === "auto"
                  ? "bg-emerald-500 border-emerald-400 text-white"
                  : "border-zinc-600"
              }`}
            >
              {activeId === "auto" && <Check className="w-3.5 h-3.5" />}
            </div>
          </div>

          {/* Opacity Control Slider */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-300">
              <span className="flex items-center gap-1.5 font-bold">
                <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                <span>شفافية الخلفية والزخارف</span>
              </span>
              <span className="font-mono text-emerald-400 font-bold">
                {Math.round(opacity * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.08"
              max="0.6"
              step="0.02"
              value={opacity}
              onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 h-1.5 bg-white/10 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-500">
              <span>خفيف جداً (مريح للقراءة)</span>
              <span>بارز ومتوسط</span>
            </div>
          </div>

          {/* Blur Control Slider */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-300">
              <span className="flex items-center gap-1.5 font-bold">
                <Droplets className="w-3.5 h-3.5 text-sky-400" />
                <span>تمويه الزخارف (Blur)</span>
              </span>
              <span className="font-mono text-sky-400 font-bold">{blur}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="12"
              step="1"
              value={blur}
              onChange={(e) => handleBlurChange(parseInt(e.target.value, 10))}
              className="w-full accent-sky-500 h-1.5 bg-white/10 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-500">
              <span>حاد وواضح</span>
              <span>ضبابي وناعم</span>
            </div>
          </div>

          {/* Themes Section — الثيمات المصاحبة للخلفيات */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-bold text-xs text-zinc-200">
                <Palette className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>ثيم الألوان والنصوص</span>
              </span>
              <button
                onClick={handleAutoSyncToggle}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition active:scale-95 ${
                  autoSync
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    : "bg-white/5 text-zinc-400 border-white/10"
                }`}
                title="عند التفعيل: اختيار أي خلفية يبدّل الثيم تلقائيًا للأنسب لها"
              >
                <span
                  className={`w-2 h-2 rounded-full ${autoSync ? "bg-emerald-400" : "bg-zinc-600"}`}
                />
                <span>مزامنة تلقائية {autoSync ? "مفعلة" : "معطلة"}</span>
              </button>
            </div>
            <p className="text-[10px] text-zinc-500 leading-relaxed">
              كل خلفية لها ثيم أنسب يُظهر النصوص بوضوح — اختره يدويًا أو فعّل المزامنة التلقائية.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {THEME_OPTIONS.map((t) => {
                const isActive = activeTheme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => applyTheme(t.id)}
                    className={`p-2.5 rounded-xl border text-center transition-all active:scale-95 ${
                      isActive
                        ? "bg-[#D4AF37]/15 border-[#D4AF37]/50 ring-1 ring-[#D4AF37]/30"
                        : "bg-white/[0.02] border-white/10 hover:border-white/25"
                    }`}
                    title={t.hint}
                  >
                    <div className="text-xl leading-none">{t.emoji}</div>
                    <div
                      className={`text-[11px] font-bold mt-1 ${
                        isActive ? "text-[#D4AF37]" : "text-zinc-300"
                      }`}
                    >
                      {t.label}
                    </div>
                    <div className="text-[9px] text-zinc-500 mt-0.5 leading-tight">{t.hint}</div>
                    {isActive && (
                      <div className="mt-1 flex justify-center">
                        <Check className="w-3 h-3 text-[#D4AF37]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Wallpapers Cards Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                اختر خلفية فنية مخصصة ({ISLAMIC_WALLPAPERS.length}):
              </h3>
              <button
                onClick={handleReset}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 text-[11px] font-bold transition active:scale-95"
                title="إعادة الخلفيات للوضع الافتراضي"
              >
                <RotateCcw className="w-3 h-3" />
                <span>إعادة تعيين</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ISLAMIC_WALLPAPERS.map((wp) => {
                const isSelected = activeId === wp.id;
                const title = wp.name[currentLang] || wp.name.ar;
                const desc = wp.description[currentLang] || wp.description.ar;

                return (
                  <div
                    key={wp.id}
                    onClick={() => handleSelectWallpaper(wp.id, wp.name.ar)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all relative overflow-hidden flex flex-col justify-between h-36 ${
                      isSelected
                        ? "border-emerald-500 shadow-[0_0_20px_rgba(5,150,105,0.25)] ring-1 ring-emerald-500/50"
                        : "border-white/10 hover:border-white/25"
                    }`}
                    style={{
                      background: wp.gradient,
                    }}
                  >
                    {/* SVG pattern layer overlay */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        backgroundImage: wp.svgPattern,
                        opacity: 0.6,
                      }}
                    ></div>

                    <div className="relative z-10 flex items-start justify-between gap-1">
                      <div className="flex items-center gap-1">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: wp.accentColor }}></div>
                        <span className="px-1.5 py-0.5 rounded-md bg-black/50 text-[9px] font-bold text-zinc-200 border border-white/10">
                          {wp.tone === "dark" ? "🌙 داكن" : "☀️ فاتح"}
                        </span>
                      </div>
                      {isSelected && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>مفعل</span>
                        </span>
                      )}
                    </div>

                    <div className="relative z-10 bg-black/40 backdrop-blur-xs p-2 rounded-xl border border-white/5">
                      <h4 className="font-bold text-xs text-white truncate">{title}</h4>
                      <p className="text-[10px] text-zinc-300 line-clamp-1 mt-0.5">{desc}</p>
                      <p className="text-[9px] text-[#D4AF37]/90 mt-1">
                        الأنسب مع ثيم: {THEME_AR_NAMES[wp.recommendedTheme]}
                        {activeTheme === wp.recommendedTheme ? " ✓" : ""}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between bg-white/[0.02]">
          <span className="text-[11px] text-zinc-400">
            تُحفظ تفضيلات الخلفية تلقائياً في جهازك
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition"
          >
            {i18n.t("common.save")} وإغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
