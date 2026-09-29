import React, { useState } from "react";
import {
  X,
  Settings,
  Palette,
  Compass,
  Volume2,
  Type,
  Database,
  MapPin,
  Check,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Bell,
  Sun,
  Moon,
  BookOpen,
  User,
  Users,
  Mic,
  Smartphone,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Play,
  Radio,
  Clock,
} from "lucide-react";
import { ThemeMode } from "../../types";
import { CALCULATION_METHODS } from "../../utils/prayerCalculator";
import { soundEngine } from "../../utils/soundEngine";
import { speechEngine } from "../../utils/speechEngine";

interface AdvancedSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeMode;
  onThemeChange: (t: ThemeMode) => void;
  selectedMethod: string;
  onMethodChange: (m: string) => void;
  asrJuristic: "standard" | "hanafi";
  onAsrJuristicChange: (j: "standard" | "hanafi") => void;
  fontSize: "normal" | "medium" | "large";
  onFontSizeChange: (s: "normal" | "medium" | "large") => void;
  soundEnabled: boolean;
  onSoundEnabledChange: (s: boolean) => void;
  adhanReciter: "makkah" | "madinah" | "quds";
  onAdhanReciterChange: (r: "makkah" | "madinah" | "quds") => void;
  cityName: string;
  onRefreshLocation: () => void;
}

export const AdvancedSettingsModal: React.FC<AdvancedSettingsModalProps> = ({
  isOpen,
  onClose,
  theme,
  onThemeChange,
  selectedMethod,
  onMethodChange,
  asrJuristic,
  onAsrJuristicChange,
  fontSize,
  onFontSizeChange,
  soundEnabled,
  onSoundEnabledChange,
  adhanReciter,
  onAdhanReciterChange,
  cityName,
  onRefreshLocation,
}) => {
  if (!isOpen) return null;

  const isDark = theme === "night" || theme === "natural";
  const isPaper = theme === "paper";
  const isLight = theme === "light";

  const [voiceTone, setVoiceTone] = useState<"male" | "female">(speechEngine.getVoiceGender());
  const [voiceRate, setVoiceRate] = useState<number>(speechEngine.getVoiceRate());
  const [isVoiceGuideExpanded, setIsVoiceGuideExpanded] = useState<boolean>(true);

  const handleVoiceToneChange = (gender: "male" | "female") => {
    soundEngine.playTasbihClick();
    setVoiceTone(gender);
    speechEngine.setVoiceGender(gender);
    const previewText =
      gender === "female"
        ? "تم اختيار نبرة الصوت النسائية الهادئة لمساعد القراءة والرفيق الذكي."
        : "تم اختيار صوت الرجل الوقور الدافئ للرفيق الذكي ومساعد القراءة.";
    speechEngine.speakEgyptian(previewText, { gender });
  };

  const handleVoiceRateChange = (rate: number) => {
    setVoiceRate(rate);
    speechEngine.setVoiceRate(rate);
  };

  const themeOptions: {
    id: ThemeMode;
    nameAr: string;
    desc: string;
    badge: string;
    bgColor: string;
    textColor: string;
    borderColor: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: "natural",
      nameAr: "طبيعي",
      desc: "أجواء زمردية إسلامية هادئة وخاشعة",
      badge: "زمردي إسلامي",
      bgColor: "bg-[#0A221A]",
      textColor: "text-[#E6F4EA]",
      borderColor: "border-emerald-500/50",
      icon: <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981]" />,
    },
    {
      id: "paper",
      nameAr: "ورقي",
      desc: "طراز المصاحف العتيقة ودفء ورق المخطوطات",
      badge: "مخطوطة عتيقة",
      bgColor: "bg-[#FAF5EB]",
      textColor: "text-[#3D2817]",
      borderColor: "border-[#D6C5A9]",
      icon: <span className="w-3 h-3 rounded-full bg-[#B8860B] shadow-[0_0_8px_#B8860B]" />,
    },
    {
      id: "night",
      nameAr: "ليلي",
      desc: "سواد أوليد عميق ومريح للعين 100% ليلاً",
      badge: "أوليد عميق",
      bgColor: "bg-[#05070B]",
      textColor: "text-[#F1F5F9]",
      borderColor: "border-slate-800",
      icon: <span className="w-3 h-3 rounded-full bg-sky-400 shadow-[0_0_8px_#38BDF8]" />,
    },
    {
      id: "light",
      nameAr: "فاتح",
      desc: "إشراقة لؤلؤية فاخرة وذهبية متناسقة لكل الشاشات",
      badge: "لؤلؤي مشرق",
      bgColor: "bg-[#FFFFFF]",
      textColor: "text-[#0F172A]",
      borderColor: "border-emerald-500/40",
      icon: <span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_#F59E0B]" />,
    },
  ];

  return (
    <div
      id="advanced-settings-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all duration-300 ${
          theme === "paper"
            ? "bg-[#FAF6EE] border-[#D6C5A9] text-[#2F1E12]"
            : theme === "light"
            ? "bg-white border-emerald-600/30 text-[#0F172A] shadow-[0_20px_60px_rgba(212,175,55,0.15)]"
            : theme === "natural"
            ? "bg-[#0A1F18] border-emerald-500/35 text-[#F0FDF4]"
            : "bg-[#0A0E15] border-slate-800 text-slate-100"
        }`}
      >
        {/* Modal Header */}
        <div
          className={`p-4 sm:p-5 border-b flex items-center justify-between shrink-0 ${
            theme === "paper"
              ? "border-[#E4D5BE] bg-[#F5EDE0]/60"
              : theme === "light"
              ? "border-slate-200/80 bg-slate-50/70"
              : "border-white/10 bg-black/20"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold font-alexandria">
                  الإعدادات والخصائص المتطورة
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
                  تحكم كامل
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                تخصيص المظهر (طبيعي / ورقي / ليلي / فاتح) والفلك والأصوات
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playTasbihClick();
              onClose();
            }}
            className={`p-2 rounded-2xl transition border ${
              isDark
                ? "bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700"
                : "bg-white hover:bg-slate-100 text-slate-600 border-slate-200 shadow-xs"
            }`}
            title="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 text-right text-xs">
          {/* 1. THEMES & COLOR PROFILES (الأنماط الأربعة) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-emerald-500" />
                <h4 className="font-bold text-xs sm:text-sm font-alexandria">
                  نمط المظهر والقراءة (4 أنماط متناسقة)
                </h4>
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                تطبيق فوري على كل العناصر
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {themeOptions.map((opt) => {
                const isSelected = theme === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      soundEngine.playTasbihClick();
                      onThemeChange(opt.id);
                    }}
                    className={`relative p-3 rounded-2xl border text-right transition-all flex flex-col justify-between h-28 ${opt.bgColor} ${opt.textColor} ${
                      isSelected
                        ? "ring-2 ring-emerald-500 border-emerald-500 shadow-md scale-102"
                        : `${opt.borderColor} hover:border-emerald-500/40 hover:scale-101`
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      {opt.icon}
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-xs font-alexandria">{opt.nameAr}</div>
                      <span className="text-[9px] opacity-75">{opt.badge}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. CALCULATION METHOD (طريقة الحساب الفلكي) */}
          <div className="space-y-2.5 pt-3 border-t border-slate-200/60 dark:border-slate-800/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#D4AF37]" />
                <h4 className="font-bold text-xs sm:text-sm font-alexandria">
                  طريقة الحساب الفلكي لمواقيت الصلاة
                </h4>
              </div>
              <span className="text-[10px] text-slate-400">حسابات دقيقة 100%</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.values(CALCULATION_METHODS).map((m) => {
                const isSelected = selectedMethod === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      soundEngine.playTasbihClick();
                      onMethodChange(m.id);
                    }}
                    className={`p-2.5 rounded-xl border text-right transition-all flex items-center justify-between ${
                      isSelected
                        ? "bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold shadow-xs"
                        : isDark
                        ? "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <span className="text-xs truncate">{m.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. ASR JURISTIC (مذهب صلاة العصر) & FONT SIZE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/80">
            {/* Asr Juristic */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs font-alexandria flex items-center gap-1.5">
                <span>المذهب الفقهي لحساب العصر</span>
              </h4>
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-black/10 dark:bg-white/5 border border-slate-200/60 dark:border-slate-800">
                <button
                  onClick={() => {
                    soundEngine.playTasbihClick();
                    onAsrJuristicChange("standard");
                  }}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition ${
                    asrJuristic === "standard"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  الجمهور (ظل مثل)
                </button>
                <button
                  onClick={() => {
                    soundEngine.playTasbihClick();
                    onAsrJuristicChange("hanafi");
                  }}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition ${
                    asrJuristic === "hanafi"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  الحنفي (ظلان)
                </button>
              </div>
            </div>

            {/* Font Size */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs font-alexandria flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-emerald-500" />
                <span>حجم خط القراءة والمصحف</span>
              </h4>
              <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-black/10 dark:bg-white/5 border border-slate-200/60 dark:border-slate-800">
                {[
                  { id: "normal", label: "قياسي" },
                  { id: "medium", label: "متوسط" },
                  { id: "large", label: "كبير" },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      soundEngine.playTasbihClick();
                      onFontSizeChange(s.id as any);
                    }}
                    className={`py-1.5 rounded-lg text-xs font-bold transition ${
                      fontSize === s.id
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 4. ADHAN AUDIO & TONES (نغمة وصوت الأذان) */}
          <div className="space-y-2.5 pt-3 border-t border-slate-200/60 dark:border-slate-800/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-emerald-500" />
                <h4 className="font-bold text-xs sm:text-sm font-alexandria">
                  صوت الأذان والتنبيهات الصوتية
                </h4>
              </div>
              <button
                onClick={() => {
                  soundEngine.playAdhanChime();
                }}
                className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>معاينة الصوت</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "makkah", name: "أذان مكة المكرمة", desc: "الحرم المكي" },
                { id: "madinah", name: "أذان المدينة المنورة", desc: "المسجد النبوي" },
                { id: "quds", name: "أذان المسجد الأقصى", desc: "القدس الشريف" },
              ].map((rec) => {
                const isSelected = adhanReciter === rec.id;
                return (
                  <button
                    key={rec.id}
                    onClick={() => {
                      soundEngine.playTasbihClick();
                      onAdhanReciterChange(rec.id as any);
                    }}
                    className={`p-2.5 rounded-xl border text-right transition-all flex flex-col justify-between ${
                      isSelected
                        ? "bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold"
                        : isDark
                        ? "bg-slate-900/60 border-slate-800 text-slate-300"
                        : "bg-slate-50 border-slate-200 text-slate-700"
                    }`}
                  >
                    <span className="text-xs">{rec.name}</span>
                    <span className="text-[10px] opacity-75 font-mono">{rec.desc}</span>
                  </button>
                );
              })}
            </div>

            {/* Voice Tone Control (التحكم في نبرة الصوت: رجل / امرأة) */}
            <div className="p-3 rounded-xl border border-emerald-500/25 bg-emerald-500/5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>نبرة صوت الرفيق الذكي ومساعد القراءة:</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-400">
                  {voiceTone === "female" ? "صوت امرأة رقيق" : "صوت رجل وقور"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleVoiceToneChange("male")}
                  className={`p-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition active:scale-95 cursor-pointer ${
                    voiceTone === "male"
                      ? "bg-emerald-600 text-white border-emerald-500 shadow-sm"
                      : "bg-black/5 dark:bg-white/5 text-slate-600 dark:text-slate-300 border-transparent hover:border-emerald-500/30"
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>رجل (وقور دافئ) 👨</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleVoiceToneChange("female")}
                  className={`p-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition active:scale-95 cursor-pointer ${
                    voiceTone === "female"
                      ? "bg-emerald-600 text-white border-emerald-500 shadow-sm"
                      : "bg-black/5 dark:bg-white/5 text-slate-600 dark:text-slate-300 border-transparent hover:border-emerald-500/30"
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>امرأة (هادئة رقيقة) 👩</span>
                </button>
              </div>

              {/* Speed / Rate selection */}
              <div className="pt-1.5 border-t border-emerald-500/15 flex items-center justify-between text-xs">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">سرعة القراءة الصوتية:</span>
                <div className="flex items-center gap-1">
                  {[
                    { label: "متأنية 0.85x", val: 0.85 },
                    { label: "طبيعية 1.0x", val: 1.0 },
                    { label: "سريعة للمكفوفين 1.25x", val: 1.25 },
                  ].map((speed) => (
                    <button
                      key={speed.val}
                      type="button"
                      onClick={() => handleVoiceRateChange(speed.val)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition ${
                        Math.abs(voiceRate - speed.val) < 0.05
                          ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/40"
                          : "border-transparent text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {speed.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sound Toggle Checkbox */}
            <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-black/5 dark:bg-white/5 cursor-pointer">
              <span className="text-xs font-bold">تفعيل المؤثرات الصوتية ونقرات السبحة</span>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => onSoundEnabledChange(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
            </label>

            {/* Blind User Voice Feedback Checkbox */}
            <label className="flex items-center justify-between p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 cursor-pointer">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">
                  التغذية الراجعة الصوتية للمكفوفين (وصف ناطق)
                </span>
                <span className="text-[10px] text-slate-400 block">
                  نطق أسماء الأقسام والثيمات عند التفاعل لتعزيز التجربة الحسية
                </span>
              </div>
              <input
                type="checkbox"
                defaultChecked={speechEngine.isVoiceFeedback()}
                onChange={(e) => {
                  soundEngine.playTasbihClick();
                  speechEngine.setVoiceFeedback(e.target.checked);
                }}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
            </label>
          </div>

          {/* 5. VOICE COMMANDS & SHAKE GESTURE GUIDE */}
          <div
            className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
              theme === "paper"
                ? "bg-[#FAF5EB] border-[#D6C5A9]"
                : theme === "light"
                ? "bg-amber-50/50 border-amber-200"
                : "bg-slate-900/60 border-slate-800"
            }`}
          >
            <div
              className="flex items-center justify-between cursor-pointer select-none"
              onClick={() => {
                soundEngine.playTasbihClick();
                setIsVoiceGuideExpanded(!isVoiceGuideExpanded);
              }}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-amber-500 text-white flex items-center justify-center shadow-xs">
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                    <span>دليل الأوامر الصوتية وإيماءة الهز</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                      شامل
                    </span>
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
                    كيفية هز الهاتف للتحدث مع الرفيق، وقائمة الأوامر الصوتية المتاحة
                  </p>
                </div>
              </div>

              <div className="p-1 rounded-lg text-slate-400 hover:text-slate-200">
                {isVoiceGuideExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </div>
            </div>

            {isVoiceGuideExpanded && (
              <div className="mt-3.5 space-y-3.5 text-xs">
                {/* Shake Feature Card */}
                <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 font-bold">
                      <Smartphone className="w-4 h-4 animate-bounce" />
                      <span>ميزة هز الهاتف مرتين (Double-Shake)</span>
                    </div>
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30">
                      مفعلة تلقائياً
                    </span>
                  </div>

                  <p className="text-[11px] leading-relaxed text-slate-700 dark:text-slate-200">
                    قم بهز هاتفك المحمول مرتين متتاليتين بلطف في أي مكان داخل التطبيق. سيهتز الجهاز فوراً ويطلق الرفيق الذكي رسالة ترحيبية بصوت مصري وقور:{" "}
                    <span className="font-bold text-[#D4AF37]">
                      «أهلاً بك يا غالي في تطبيق النور! أنا رفيقك الذكي وجاهز في خدمتك، تأمرني بأي شيء؟»
                    </span>
                    ، ويبدأ الاستماع لأمرك فوراً دون الحاجة للمس الشاشة مع بقائه دائماً في وضع الجاهزية التامة.
                  </p>

                  <div className="pt-1 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      💡 تلميح: لا حاجة لهز الهاتف بقوة، حركتان خفيفتان تكفيان.
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playAssistantActivate();
                        onClose();
                        window.dispatchEvent(
                          new CustomEvent("noor-open-voice-companion", {
                            detail: { triggeredByShake: true },
                          })
                        );
                      }}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-[#D4AF37] text-slate-950 font-bold text-[11px] shadow-sm hover:opacity-90 active:scale-95 transition flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>تجربة المساعد الآن</span>
                    </button>
                  </div>
                </div>

                {/* Voice Commands Categories */}
                <div className="space-y-2.5">
                  <span className="font-bold text-[11px] text-slate-700 dark:text-slate-300 block">
                    🎙️ نماذج لأهم الأوامر الصوتية المدعومة:
                  </span>

                  {/* 1. Quran Commands */}
                  <div className="p-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-300 text-[11px]">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>تلاوة وتشغيل سور وآيات القرآن الكريم:</span>
                    </div>
                    <ul className="text-[11px] space-y-1 text-slate-600 dark:text-slate-300 pr-4 list-disc">
                      <li>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">"شغل سورة البقرة من آخر 10 آيات"</span> (يبدأ مباشرة من خواتيم سورة البقرة).
                      </li>
                      <li>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">"شغل سورة الكهف بصوت الشيخ مشاري العفاسي"</span>.
                      </li>
                      <li>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">"شغل سورة يس واقفل التطبيق بعد ما تخلص"</span> (إغلاق تلقائي عند اكتمال السورة).
                      </li>
                      <li>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">"اقرأ سورة الملك"</span> أو <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">"شغل سورة الواقعة"</span>.
                      </li>
                    </ul>
                  </div>

                  {/* 2. Prayer Times Commands */}
                  <div className="p-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-300 text-[11px]">
                      <Clock className="w-3.5 h-3.5" />
                      <span>مواقيت الصلاة ومواعيد الأذان:</span>
                    </div>
                    <ul className="text-[11px] space-y-1 text-slate-600 dark:text-slate-300 pr-4 list-disc">
                      <li>
                        <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">"الصلاة القادمة إيه هي؟"</span> (يعلمك بالصلاة القادمة والوقت المتبقي بدقة).
                      </li>
                      <li>
                        <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">"صلاة العشاء الساعة كام؟"</span> أو <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">"أذان الفجر الساعة كام؟"</span>.
                      </li>
                      <li>
                        <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">"باقي كام دقيقة على صلاة المغرب؟"</span>.
                      </li>
                      <li>
                        <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">"مواقيت الصلاة اليوم في مدينتي"</span>.
                      </li>
                    </ul>
                  </div>

                  {/* 3. Athkar and Duas */}
                  <div className="p-2.5 rounded-xl border border-indigo-500/20 bg-indigo-500/5 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-indigo-700 dark:text-indigo-300 text-[11px]">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>الأذكار والأدعية والفتاوى:</span>
                    </div>
                    <ul className="text-[11px] space-y-1 text-slate-600 dark:text-slate-300 pr-4 list-disc">
                      <li>
                        <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">"اقرأ أذكار الصباح"</span> أو <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">"أذكار المساء"</span>.
                      </li>
                      <li>
                        <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">"دعاء تفريج الهم والكرب"</span> أو <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">"أذكار النوم"</span>.
                      </li>
                      <li>
                        <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">"ما حكم صلاة الوتر؟"</span> أو <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">"كيفية سجود السهو"</span>.
                      </li>
                    </ul>
                  </div>

                  {/* 4. Quick Navigation Commands */}
                  <div className="p-2.5 rounded-xl border border-teal-500/20 bg-teal-500/5 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-teal-700 dark:text-teal-300 text-[11px]">
                      <Radio className="w-3.5 h-3.5" />
                      <span>التنقل الفوري بين أقسام التطبيق:</span>
                    </div>
                    <ul className="text-[11px] space-y-1 text-slate-600 dark:text-slate-300 pr-4 list-disc">
                      <li>
                        <span className="font-mono text-teal-600 dark:text-teal-400 font-bold">"افتح إذاعة القرآن الكريم من القاهرة"</span>.
                      </li>
                      <li>
                        <span className="font-mono text-teal-600 dark:text-teal-400 font-bold">"افتح المصحف الشريف"</span> أو <span className="font-mono text-teal-600 dark:text-teal-400 font-bold">"افتح القبلة"</span>.
                      </li>
                      <li>
                        <span className="font-mono text-teal-600 dark:text-teal-400 font-bold">"افتح تكافل الخير"</span> أو <span className="font-mono text-teal-600 dark:text-teal-400 font-bold">"افتح حاسبة الزكاة"</span>.
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Persistent Ready Note */}
                <div className="p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-start gap-2">
                  <span className="text-emerald-500 font-black text-sm leading-none mt-0.5">🟢</span>
                  <p className="text-[10px] sm:text-[11px] text-emerald-800 dark:text-emerald-200 leading-relaxed">
                    <strong className="font-bold">وضع الجاهزية الدائمة:</strong> المساعد الصوتي يبقى مستمعاً باستمرار وفي وضع الجاهزية دون الحاجة لإعادة الضغط على زر الميكروفون بعد كل رد، مما يوفر تجربة محادثة مستمرة وسلسة.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 6. LOCATION & STORAGE SUMMARY */}
          <div
            className={`p-3 rounded-2xl border flex items-center justify-between ${
              theme === "paper"
                ? "bg-[#F5EDE0] border-[#D6C5A9]"
                : theme === "light"
                ? "bg-emerald-50/70 border-emerald-200"
                : "bg-slate-900/50 border-slate-800"
            }`}
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-500" />
              <div>
                <span className="font-bold text-xs">{cityName}</span>
                <span className="text-[10px] text-slate-400 block font-mono">
                  تخزين محلي أوفلاين 100% • دون خوادم وسيطة
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                soundEngine.playTasbihClick();
                onRefreshLocation();
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
            >
              <RefreshCw className="w-3 h-3" />
              <span>تحديث GPS</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          className={`p-3.5 sm:p-4 border-t flex items-center justify-between shrink-0 ${
            theme === "paper"
              ? "border-[#E4D5BE] bg-[#F5EDE0]/60"
              : theme === "light"
              ? "border-slate-200 bg-slate-50"
              : "border-white/10 bg-black/20"
          }`}
        >
          <span className="text-[11px] text-slate-400 font-mono">
            مشروع النور • إعدادات المستخدم الفورية
          </span>
          <button
            onClick={() => {
              soundEngine.playTasbihClick();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md active:scale-95 transition"
          >
            حفظ وإغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
