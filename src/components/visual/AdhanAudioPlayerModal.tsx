import React, { useState, useEffect, useRef } from "react";
import {
  Volume2,
  VolumeX,
  Play,
  Square,
  Upload,
  Sparkles,
  Music,
  CheckCircle,
  X,
  Bell,
  BellOff,
  Compass,
  FileAudio,
} from "lucide-react";
import { adhanService, ADHAN_RECITERS } from "../../services/adhanService";
import { ThemeMode } from "../../types";
import { getThemeStyles } from "../../utils/themeClasses";
import { soundEngine } from "../../utils/soundEngine";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  theme?: ThemeMode;
  initialPrayerName?: string;
}

export const AdhanAudioPlayerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  theme = "natural",
  initialPrayerName = "الصلاة المباركة",
}) => {
  const styles = getThemeStyles(theme);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [reciterId, setReciterId] = useState<string>("makkah_ali_mulla");
  const [progress, setProgress] = useState<number>(0);
  const [duration, setDuration] = useState<number>(204);
  const [isAutoEnabled, setIsAutoEnabled] = useState<boolean>(adhanService.isAutoAdhanEnabled());
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const unsub = adhanService.subscribe((state) => {
      setIsPlaying(state.isPlaying);
      setReciterId(state.reciterId);
      setProgress(state.progress);
      setDuration(state.duration || 204);
    });

    setIsPlaying(adhanService.getIsPlaying());
    setReciterId(adhanService.getReciter());
    setIsAutoEnabled(adhanService.isAutoAdhanEnabled());

    return unsub;
  }, []);

  if (!isOpen) return null;

  const currentMeta = adhanService.getActiveReciterMeta();
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handlePlayToggle = () => {
    soundEngine.playTasbihClick();
    if (isPlaying) {
      adhanService.stop();
    } else {
      adhanService.play({ reciterId });
    }
  };

  const handleReciterSelect = (id: string) => {
    soundEngine.playTasbihClick();
    adhanService.setReciter(id);
    adhanService.play({ reciterId: id });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await adhanService.saveCustomAdhanFile(file);
      adhanService.setAutoAdhanEnabled(true);
      setIsAutoEnabled(true);
      setUploadSuccessMsg(`تم ربط ملف صوت الأذان المرفوع (${file.name}) بنظام تنبيهات مواقيت الصلاة التلقائي بنجاح!`);
      adhanService.play({ reciterId: "custom" });
      setTimeout(() => setUploadSuccessMsg(""), 6000);
    } catch (err) {
      console.error("Failed to upload adhan:", err);
    }
  };

  const handleToggleAutoAdhan = () => {
    soundEngine.playTasbihClick();
    const nextVal = !isAutoEnabled;
    setIsAutoEnabled(nextVal);
    adhanService.setAutoAdhanEnabled(nextVal);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div
        className={`w-full max-w-lg rounded-3xl border shadow-2xl p-5 sm:p-7 relative overflow-hidden transition-all ${styles.cardBg} ${styles.cardBorder}`}
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-1/4 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition cursor-pointer text-zinc-400 hover:text-zinc-200"
          title="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 shrink-0">
            <Volume2 className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`text-lg sm:text-xl font-black ${styles.titleText}`}>
                سماع الأذان المبارك
              </h3>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30">
                {initialPrayerName}
              </span>
            </div>
            <p className={`text-xs ${styles.mutedText} mt-0.5`}>
              الأذان بصوت الحرم المكي الشريف والمساجد الكبرى
            </p>
          </div>
        </div>

        {/* Active Mu'adhin & Playing Wave Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border border-emerald-500/30 mb-5 relative overflow-hidden">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block">
                المؤذن الحالي
              </span>
              <h4 className="text-base font-black text-slate-800 dark:text-slate-100">
                {currentMeta.nameAr}
              </h4>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {currentMeta.locationAr}
              </p>
            </div>

            {/* Sound Wave Animation when playing */}
            <div className="flex items-end gap-1 h-8 px-2">
              {[40, 75, 100, 60, 90, 45, 80, 50].map((h, idx) => (
                <span
                  key={idx}
                  className={`w-1 rounded-full bg-emerald-500 transition-all duration-300 ${
                    isPlaying ? "animate-pulse" : "opacity-30"
                  }`}
                  style={{
                    height: isPlaying ? `${h}%` : "20%",
                    animationDelay: `${idx * 0.1}s`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Progress Bar & Timestamps */}
          <div className="space-y-1.5 pt-2">
            <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{
                  width: `${duration > 0 ? (progress / duration) * 100 : 0}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono font-bold text-zinc-400">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Main Control Buttons */}
          <div className="flex items-center justify-center gap-3 pt-3">
            <button
              onClick={handlePlayToggle}
              className={`px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition active:scale-95 cursor-pointer ${
                isPlaying
                  ? "bg-amber-600 hover:bg-amber-700 text-white"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              {isPlaying ? (
                <>
                  <Square className="w-4 h-4 fill-current" />
                  <span>إيقاف الأذان</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>تشغيل الأذان الآن</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Reciters Choice Strip */}
        <div className="space-y-2 mb-5">
          <label className={`text-xs font-bold block ${styles.titleText}`}>
            اختر صوت الأذان المفضل لديك:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {ADHAN_RECITERS.map((r) => {
              const isSelected = reciterId === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => handleReciterSelect(r.id)}
                  className={`p-2.5 rounded-xl border text-right transition flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? "bg-emerald-600 text-white border-emerald-500 shadow-sm ring-2 ring-emerald-500/20"
                      : "bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border-black/10 dark:border-white/10"
                  }`}
                >
                  <div className="truncate">
                    <span className="text-xs font-bold block truncate">{r.nameAr}</span>
                    <span className={`text-[10px] block truncate ${isSelected ? "text-emerald-100" : "text-zinc-400"}`}>
                      {r.locationAr}
                    </span>
                  </div>
                  {isSelected && <CheckCircle className="w-4 h-4 shrink-0 text-white" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Upload Custom Adhan Audio (User requested feature!) */}
        <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 mb-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileAudio className="w-4 h-4 text-amber-500" />
              <div>
                <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">
                  استخدام ملف أذانك المرفوع
                </span>
                <span className="text-[10px] text-zinc-400">
                  ارفع أي ملف صوتي من هاتفك أو حاسوبك (MP3 / WAV / M4A)
                </span>
              </div>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-700 dark:text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-2 transition active:scale-95 cursor-pointer whitespace-nowrap min-h-[40px]"
            >
              <Upload className="w-4 h-4" />
              <span>اختيار ملف صوتي</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          {uploadSuccessMsg && (
            <p className="mt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 animate-fadeIn">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{uploadSuccessMsg}</span>
            </p>
          )}

          {adhanService.hasCustomAudio() && (
            <div className="mt-3 pt-3 border-t border-black/5 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                ملف أذانك محفوظ ومدمج بنظام التنبيهات
              </span>
              <button
                onClick={() => handleReciterSelect("custom")}
                className={`text-xs px-3.5 py-1.5 rounded-xl font-bold border transition min-h-[38px] cursor-pointer whitespace-nowrap ${
                  reciterId === "custom"
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                    : "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                }`}
              >
                {reciterId === "custom" ? "✓ الصوت الحالي: أذانك المرفوع" : "تفعيل صوت أذانك المرفوع الآن"}
              </button>
            </div>
          )}
        </div>

        {/* Auto Adhan at Prayer Times Toggle */}
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            {isAutoEnabled ? (
              <Bell className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <BellOff className="w-5 h-5 text-zinc-400 shrink-0" />
            )}
            <div>
              <span className="text-xs sm:text-sm font-bold block text-slate-800 dark:text-slate-200">
                رفع الأذان تلقائياً عند دخول وقت كل صلاة
              </span>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                تشغيل صوت الأذان المختار تلقائياً في موعد الصلاة
              </span>
            </div>
          </div>
          <button
            onClick={handleToggleAutoAdhan}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer min-h-[40px] whitespace-nowrap ${
              isAutoEnabled
                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                : "bg-zinc-300 hover:bg-zinc-400 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-slate-800 dark:text-zinc-200"
            }`}
          >
            {isAutoEnabled ? "مفعّل 🔔" : "معطّل 🔕"}
          </button>
        </div>

        {/* Post-Adhan Du'a */}
        <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-center space-y-1">
          <span className="text-[10px] font-bold text-amber-500 block">
            دعاء ما بعد الأذان المستجاب
          </span>
          <p className="font-['Amiri',serif] text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-200">
            «اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ، وَالصَّلَاةِ الْقَائِمَةِ، آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ، وَابْعَثْهُ مَقَامًا مَحْمُودًا الَّذِي وَعَدْتَهُ»
          </p>
        </div>
      </div>
    </div>
  );
};
