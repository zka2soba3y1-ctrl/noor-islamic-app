import React, { useState, useEffect } from "react";
import {
  Moon,
  Sparkles,
  Star,
  CheckCircle2,
  Calendar,
  Volume2,
  VolumeX,
  BookOpen,
  Scroll,
  HelpCircle,
  Clock,
  Heart,
  RotateCcw,
  Sun,
  ShieldCheck,
  Flame,
  Award,
  Share2,
  Copy,
  Check,
} from "lucide-react";
import { ThemeMode } from "../../types";
import { getThemeStyles } from "../../utils/themeClasses";
import { soundEngine } from "../../utils/soundEngine";
import { speechEngine } from "../../utils/speechEngine";
import {
  fetchLaylatAlQadrData,
  LaylatAlQadrData,
  OFFLINE_LAYLAT_AL_QADR,
} from "../../services/laylatAlQadrService";

interface Props {
  theme?: ThemeMode;
}

export const LaylatAlQadrView: React.FC<Props> = ({ theme = "natural" }) => {
  const styles = getThemeStyles(theme);
  const [data, setData] = useState<LaylatAlQadrData>(OFFLINE_LAYLAT_AL_QADR);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"virtue" | "signs" | "acts" | "evidences" | "scholars">("virtue");

  // Dua interactive repeater state
  const [duaCount, setDuaCount] = useState<number>(0);
  const [duaTarget, setDuaTarget] = useState<number>(33);
  const [isPlayingDuaAudio, setIsPlayingDuaAudio] = useState<boolean>(false);
  const [copiedDua, setCopiedDua] = useState<boolean>(false);

  // Worship acts checklist state
  const [checkedActs, setCheckedActs] = useState<Record<number, boolean>>(() => {
    try {
      const saved = localStorage.getItem("noor_laylat_qadr_acts");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    fetchLaylatAlQadrData().then((res) => {
      if (mounted) {
        setData(res);
        setIsLoading(false);
      }
    });
    return () => {
      mounted = false;
      speechEngine.stop();
    };
  }, []);

  const handleTabChange = (tab: typeof activeTab, tabName: string) => {
    soundEngine.playTasbihClick();
    setActiveTab(tab);
    speechEngine.speakNavFeedback(`ليلة القدر: ${tabName}`);
  };

  const handleDuaIncrement = () => {
    soundEngine.playTasbihClick();
    const next = duaCount + 1;
    setDuaCount(next);
    if (next === duaTarget) {
      soundEngine.playLevelUpChime();
      speechEngine.speakNavFeedback("تم إتمام تكرار دعاء ليلة القدر بنجاح، تقبل الله طاعتكم.");
    }
  };

  const handleDuaReset = () => {
    soundEngine.playTasbihClick();
    setDuaCount(0);
  };

  const toggleDuaAudio = () => {
    soundEngine.playTasbihClick();
    if (isPlayingDuaAudio) {
      speechEngine.stop();
      setIsPlayingDuaAudio(false);
    } else {
      setIsPlayingDuaAudio(true);
      const text = "اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي.";
      speechEngine.speak(text, {
        rate: 0.9,
        onEnd: () => setIsPlayingDuaAudio(false),
      });
    }
  };

  const toggleActCheck = (index: number) => {
    soundEngine.playTasbihClick();
    setCheckedActs((prev) => {
      const next = { ...prev, [index]: !prev[index] };
      try {
        localStorage.setItem("noor_laylat_qadr_acts", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleCopyDua = () => {
    soundEngine.playTasbihClick();
    navigator.clipboard.writeText("اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي");
    setCopiedDua(true);
    setTimeout(() => setCopiedDua(false), 2000);
    speechEngine.speakNavFeedback("تم نسخ دعاء ليلة القدر.");
  };

  const totalActs = data.recommended_acts.acts.length;
  const completedActsCount = Object.values(checkedActs).filter(Boolean).length;
  const actsProgress = Math.round((completedActsCount / totalActs) * 100);

  return (
    <div id="laylat-al-qadr-view" className="space-y-4 sm:space-y-6 animate-fadeIn">
      {/* Golden Spiritual Hero Banner */}
      <div
        className={`rounded-3xl p-5 sm:p-7 border shadow-xl relative overflow-hidden transition-all ${
          styles.cardBg
        } ${styles.cardBorder} ${styles.cardShadow}`}
      >
        {/* Glow ambient decoration */}
        <div className="absolute top-0 left-0 -mt-10 -ml-10 w-48 h-48 bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 -mb-10 -mr-10 w-48 h-48 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-gradient-to-br from-[#D4AF37] via-amber-600 to-emerald-700 flex items-center justify-center text-white shadow-xl shrink-0 p-1">
              <div className="w-full h-full rounded-[22px] bg-black/20 backdrop-blur-xs flex items-center justify-center">
                <Moon className="w-7 h-7 sm:w-8 sm:h-8 text-amber-200 fill-amber-200/30" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#B68C1C] dark:text-[#F3E7C4] border border-[#D4AF37]/40 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                  سيدة الليالي وخير من ألف شهر
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                  العشر الأواخر من رمضان
                </span>
              </div>

              <h2 className={`text-xl sm:text-2xl md:text-3xl font-black font-alexandria ${styles.titleText}`}>
                دليل ليلة القدر المباركة
              </h2>

              <p className={`text-xs sm:text-sm max-w-2xl leading-relaxed ${styles.mutedText}`}>
                {data.definition.value}
              </p>
            </div>
          </div>

          {/* Golden Math Stat Card: 83 Years & 4 Months */}
          <div
            className={`p-4 rounded-2xl border flex flex-col items-center justify-center text-center shrink-0 w-full sm:w-auto shadow-md ${styles.innerBg} ${styles.innerBorder}`}
          >
            <span className="text-[11px] font-bold font-alexandria text-amber-500">
              معادلة الفضل العظيم
            </span>
            <span className="text-2xl sm:text-3xl font-black font-mono text-[#D4AF37] my-0.5">
              83 سنة و 4 أشهر
            </span>
            <span className={`text-[10px] ${styles.mutedText}`}>
              عبادة ليلة واحدة = أكثر من عمر إنسان كامل
            </span>
          </div>
        </div>

        {/* Section Tabs Switcher */}
        <div className="flex items-center gap-1.5 overflow-x-auto mt-6 pt-4 border-t border-slate-200/50 dark:border-slate-800/60 no-scrollbar">
          {[
            { id: "virtue", label: "الفضل والعظمة", icon: Award },
            { id: "signs", label: "علامات الليلة", icon: Sun },
            { id: "acts", label: "الأعمال والعبادة", icon: CheckCircle2 },
            { id: "evidences", label: "القرآن والسنة", icon: BookOpen },
            { id: "scholars", label: "أقوال العلماء والتاريخ", icon: Scroll },
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as any, tab.label)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 shrink-0 border ${
                  isSelected
                    ? styles.btnPrimary
                    : `${styles.innerBg} ${styles.innerBorder} ${styles.mutedText} hover:${styles.bodyText}`
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* DUA CARD (Featured Always for Instant Spiritual Practice) */}
      <div
        className={`rounded-3xl p-5 sm:p-6 border shadow-lg relative overflow-hidden transition-all ${
          styles.cardBg
        } ${styles.cardBorder}`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                الدعاء النبوي الجامع لليلة القدر
              </span>
              <span className={`text-[10px] font-mono ${styles.mutedText}`}>
                علمها رسول الله ﷺ لأم المؤمنين عائشة
              </span>
            </div>

            <p
              className={`text-base sm:text-xl md:text-2xl font-['Amiri',serif] font-bold leading-loose pt-1 ${
                styles.isPaper ? "text-[#2B1B10]" : styles.isLight ? "text-slate-900" : "text-emerald-100"
              }`}
            >
              "اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي"
            </p>
          </div>

          {/* Dua Action & Repetition Tools */}
          <div className="flex items-center gap-2 self-stretch md:self-auto justify-between sm:justify-end flex-wrap">
            <button
              onClick={toggleDuaAudio}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
                isPlayingDuaAudio
                  ? "bg-rose-600 text-white animate-pulse"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              {isPlayingDuaAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{isPlayingDuaAudio ? "إيقاف الصوت" : "استماع صوتي"}</span>
            </button>

            <button
              onClick={handleDuaIncrement}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold border transition active:scale-95 ${
                duaCount >= duaTarget
                  ? "bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-400"
                  : `${styles.innerBg} ${styles.innerBorder} ${styles.bodyText}`
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>
                {duaCount} / {duaTarget}
              </span>
            </button>

            {duaCount > 0 && (
              <button
                onClick={handleDuaReset}
                className={`p-2 rounded-xl border text-slate-400 hover:text-slate-600 transition ${styles.innerBg} ${styles.innerBorder}`}
                title="إعادة تصفير"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={handleCopyDua}
              className={`p-2 rounded-xl border transition ${styles.innerBg} ${styles.innerBorder} ${styles.mutedText} hover:${styles.bodyText}`}
              title="نسخ الدعاء"
            >
              {copiedDua ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* TAB CONTENT 1: VIRTUES & REASONS */}
      {activeTab === "virtue" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-5 rounded-3xl border space-y-3 ${styles.cardBg} ${styles.cardBorder}`}>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <h3 className={`text-base font-bold font-alexandria ${styles.titleText}`}>
                {data.virtue.name}
              </h3>
            </div>
            <p className={`text-sm leading-relaxed ${styles.mutedText}`}>
              {data.virtue.value}
            </p>
            <div className={`p-3.5 rounded-2xl border text-xs leading-relaxed ${styles.innerBg} ${styles.innerBorder} text-emerald-600 dark:text-emerald-400 font-medium`}>
              قال النبي ﷺ: «مَن قامَ ليلةَ القَدْرِ إيمانًا واحتِسابًا غُفِرَ له ما تقدَّمَ مِن ذَنبِه».
            </div>
          </div>

          <div className={`p-5 rounded-3xl border space-y-3 ${styles.cardBg} ${styles.cardBorder}`}>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#D4AF37]" />
              <h3 className={`text-base font-bold font-alexandria ${styles.titleText}`}>
                {data.naming_reasons.name}
              </h3>
            </div>
            <div className="space-y-2 text-xs sm:text-sm">
              <div className={`p-3 rounded-2xl border ${styles.innerBg} ${styles.innerBorder}`}>
                <strong className={`block mb-1 text-amber-600 dark:text-amber-400`}>1. لعظمتها وشرفها:</strong>
                <span className={styles.mutedText}>{data.naming_reasons.greatness}</span>
              </div>
              <div className={`p-3 rounded-2xl border ${styles.innerBg} ${styles.innerBorder}`}>
                <strong className={`block mb-1 text-teal-600 dark:text-teal-400`}>2. لتقدير المقادير:</strong>
                <span className={styles.mutedText}>{data.naming_reasons.predestination}</span>
              </div>
            </div>
          </div>

          <div className={`p-5 rounded-3xl border space-y-3 md:col-span-2 ${styles.cardBg} ${styles.cardBorder}`}>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <h3 className={`text-base font-bold font-alexandria ${styles.titleText}`}>
                {data.importance.name}
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className={`p-4 rounded-2xl border ${styles.innerBg} ${styles.innerBorder} space-y-1`}>
                <span className="text-xs font-bold text-emerald-500 font-mono">نزول القرآن</span>
                <p className={`text-xs ${styles.mutedText}`}>{data.importance.quran_revelation}</p>
              </div>
              <div className={`p-4 rounded-2xl border ${styles.innerBg} ${styles.innerBorder} space-y-1`}>
                <span className="text-xs font-bold text-teal-500 font-mono">تنزل الملائكة</span>
                <p className={`text-xs ${styles.mutedText}`}>{data.importance.angels_descend}</p>
              </div>
              <div className={`p-4 rounded-2xl border ${styles.innerBg} ${styles.innerBorder} space-y-1`}>
                <span className="text-xs font-bold text-[#D4AF37] font-mono">تقدير الآجال والأرزاق</span>
                <p className={`text-xs ${styles.mutedText}`}>{data.importance.decrees_written}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: SIGNS */}
      {activeTab === "signs" && (
        <div className="space-y-4">
          <div className={`p-5 rounded-3xl border space-y-4 ${styles.cardBg} ${styles.cardBorder}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sun className="w-5 h-5 text-amber-500" />
                <h3 className={`text-base font-bold font-alexandria ${styles.titleText}`}>
                  العلامات المؤكدة الثابتة في الأحاديث الصحيحة
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                صحيح السنة
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {data.signs.confirmed.map((sign, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-2xl border flex items-start gap-3 ${styles.innerBg} ${styles.innerBorder}`}
                >
                  <div className="w-7 h-7 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 text-xs font-bold font-mono">
                    {i + 1}
                  </div>
                  <p className={`text-xs sm:text-sm font-medium leading-relaxed ${styles.bodyText}`}>
                    {sign}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className={`p-5 rounded-3xl border space-y-4 ${styles.cardBg} ${styles.cardBorder}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500" />
                <h3 className={`text-base font-bold font-alexandria ${styles.titleText}`}>
                  علامات حسية يُستأنس بها
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
                تجارب الصالحين
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {data.signs.unconfirmed.map((sign, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-2xl border flex items-start gap-3 ${styles.innerBg} ${styles.innerBorder}`}
                >
                  <Sparkles className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <p className={`text-xs sm:text-sm font-medium leading-relaxed ${styles.bodyText}`}>
                    {sign}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: RECOMMENDED ACTS & CHECKLIST */}
      {activeTab === "acts" && (
        <div className={`p-5 sm:p-6 rounded-3xl border space-y-5 ${styles.cardBg} ${styles.cardBorder}`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className={`text-base sm:text-lg font-bold font-alexandria ${styles.titleText}`}>
                جدول وخطة إحياء ليلة القدر المباركة
              </h3>
              <p className={`text-xs ${styles.mutedText}`}>
                اضغط على العبادة لتوثيق إنجازك في الليلة وحفظ تقدمك
              </p>
            </div>

            {/* Progress Badge */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {completedActsCount} من {totalActs} ({actsProgress}%)
              </span>
              <div className="w-24 bg-black/10 dark:bg-white/10 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${actsProgress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.recommended_acts.acts.map((act, index) => {
              const isChecked = !!checkedActs[index];
              return (
                <div
                  key={index}
                  onClick={() => toggleActCheck(index)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex items-start gap-3.5 ${
                    isChecked
                      ? "bg-emerald-500/10 border-emerald-500/50 shadow-xs"
                      : `${styles.innerBg} ${styles.innerBorder} hover:border-emerald-500/40`
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border transition ${
                      isChecked
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "border-slate-300 dark:border-slate-700"
                    }`}
                  >
                    {isChecked && <Check className="w-4 h-4" />}
                  </div>

                  <div className="space-y-0.5">
                    <p
                      className={`text-xs sm:text-sm font-bold ${
                        isChecked ? "text-emerald-600 dark:text-emerald-400 line-through opacity-80" : styles.titleText
                      }`}
                    >
                      {act}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: EVIDENCES FROM QURAN & SUNNAH */}
      {activeTab === "evidences" && (
        <div className="space-y-4">
          {/* Surah Al-Qadr */}
          <div className={`p-5 sm:p-6 rounded-3xl border space-y-3 ${styles.cardBg} ${styles.cardBorder}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-500" />
                <h3 className={`text-base font-bold font-alexandria ${styles.titleText}`}>
                  سورة القدر كاملة
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                سورة مكية • 5 آيات
              </span>
            </div>

            <div className={`p-4 sm:p-5 rounded-2xl border ${styles.innerBg} ${styles.innerBorder}`}>
              <p className={`text-base sm:text-lg md:text-xl font-['Amiri',serif] font-bold leading-loose text-center ${
                styles.isPaper ? "text-[#2B1B10]" : styles.isLight ? "text-slate-900" : "text-emerald-50"
              }`}>
                {data.quranic_evidence.surah_al_qadr}
              </p>
            </div>
          </div>

          {/* Hadith Evidence */}
          <div className={`p-5 sm:p-6 rounded-3xl border space-y-4 ${styles.cardBg} ${styles.cardBorder}`}>
            <h3 className={`text-base font-bold font-alexandria ${styles.titleText}`}>
              الأدلة من صحيح السنة النبوية
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className={`p-4 rounded-2xl border space-y-2 ${styles.innerBg} ${styles.innerBorder}`}>
                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 font-mono">
                  صحيح البخاري
                </span>
                <p className={`text-xs sm:text-sm leading-relaxed ${styles.bodyText}`}>
                  «{data.hadith_evidence.bukhari}»
                </p>
              </div>

              <div className={`p-4 rounded-2xl border space-y-2 ${styles.innerBg} ${styles.innerBorder}`}>
                <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400 font-mono">
                  صحيح مسلم
                </span>
                <p className={`text-xs sm:text-sm leading-relaxed ${styles.bodyText}`}>
                  «{data.hadith_evidence.muslim}»
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 5: SCHOLARS & DATE */}
      {activeTab === "scholars" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Scholars Insights */}
          <div className={`p-5 rounded-3xl border space-y-3 ${styles.cardBg} ${styles.cardBorder}`}>
            <div className="flex items-center gap-2">
              <Scroll className="w-5 h-5 text-purple-500" />
              <h3 className={`text-base font-bold font-alexandria ${styles.titleText}`}>
                أقوال أئمة التفسير
              </h3>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className={`p-3.5 rounded-2xl border space-y-1 ${styles.innerBg} ${styles.innerBorder}`}>
                <strong className="block text-emerald-600 dark:text-emerald-400 font-alexandria">
                  الإمام ابن كثير رحمه الله:
                </strong>
                <p className={`leading-relaxed ${styles.mutedText}`}>{data.scholars_opinions.ibn_kathir}</p>
              </div>

              <div className={`p-3.5 rounded-2xl border space-y-1 ${styles.innerBg} ${styles.innerBorder}`}>
                <strong className="block text-amber-600 dark:text-amber-400 font-alexandria">
                  شيخ الإسلام ابن تيمية رحمه الله:
                </strong>
                <p className={`leading-relaxed ${styles.mutedText}`}>{data.scholars_opinions.ibn_taymiyyah}</p>
              </div>
            </div>
          </div>

          {/* Date & Odd Nights */}
          <div className={`p-5 rounded-3xl border space-y-3 ${styles.cardBg} ${styles.cardBorder}`}>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-500" />
              <h3 className={`text-base font-bold font-alexandria ${styles.titleText}`}>
                {data.date.name}
              </h3>
            </div>

            <p className={`text-xs sm:text-sm leading-relaxed ${styles.mutedText}`}>
              {data.date.value}
            </p>

            <div className={`p-4 rounded-2xl border ${styles.innerBg} ${styles.innerBorder}`}>
              <span className="text-[11px] font-bold block mb-2 text-emerald-600 dark:text-emerald-400 font-alexandria">
                الليالي الوترية المرجوة في العشر الأواخر:
              </span>
              <div className="flex items-center justify-between gap-1.5 text-center font-mono">
                {["ليلة 21", "ليلة 23", "ليلة 25", "ليلة 27", "ليلة 29"].map((night, idx) => (
                  <div
                    key={idx}
                    className={`flex-1 py-2 px-1 rounded-xl text-xs font-bold border ${
                      night === "ليلة 27"
                        ? "bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]"
                        : "bg-black/5 dark:bg-white/5 border-transparent text-slate-500 dark:text-slate-300"
                    }`}
                  >
                    {night}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
