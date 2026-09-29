import React, { useState, useEffect } from "react";
import {
  BookOpen,
  CheckCircle2,
  Trophy,
  Sparkles,
  Plus,
  RotateCcw,
  Volume2,
  ChevronRight,
  Flame,
  BookmarkCheck,
  Calendar,
  X,
  Check,
} from "lucide-react";
import { ThemeMode } from "../../types";
import { getThemeStyles } from "../../utils/themeClasses";
import { soundEngine } from "../../utils/soundEngine";
import { speechEngine } from "../../utils/speechEngine";
import { SURAH_LIST } from "../../data/quranData";

interface KhatmahData {
  readSurahs: number[]; // surah numbers 1..114
  readJuzs: number[]; // juz numbers 1..30
  startDate: string;
  targetDays: number;
  lastReadSurahName?: string;
  lastReadSurahNum?: number;
  lastReadAyah?: number;
}

const DEFAULT_KHATMAH: KhatmahData = {
  readSurahs: [1, 112, 113, 114], // Default starts with Al-Fatiha and Al-Mu'awwidhat
  readJuzs: [30],
  startDate: new Date().toISOString().split("T")[0],
  targetDays: 30,
  lastReadSurahName: "الفاتحة",
  lastReadSurahNum: 1,
  lastReadAyah: 7,
};

interface Props {
  theme?: ThemeMode;
  onOpenMushaf?: (surahNumber?: number) => void;
}

export const KhatmahProgressSection: React.FC<Props> = ({
  theme = "natural",
  onOpenMushaf,
}) => {
  const styles = getThemeStyles(theme);

  const [khatmah, setKhatmah] = useState<KhatmahData>(() => {
    try {
      const saved = localStorage.getItem("noor_khatmah_progress");
      return saved ? JSON.parse(saved) : DEFAULT_KHATMAH;
    } catch {
      return DEFAULT_KHATMAH;
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"surahs" | "juzs">("surahs");
  const [searchQuery, setSearchQuery] = useState("");

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("noor_khatmah_progress", JSON.stringify(khatmah));
    } catch {}
  }, [khatmah]);

  const totalSurahs = 114;
  const totalJuzs = 30;

  const surahsCount = khatmah.readSurahs.length;
  const juzsCount = khatmah.readJuzs.length;

  // Khatmah percentage based on surahs and juzs weighting
  const percentage = Math.min(
    100,
    Math.round(((surahsCount / totalSurahs) * 0.6 + (juzsCount / totalJuzs) * 0.4) * 100)
  );

  const toggleSurah = (surahNum: number) => {
    soundEngine.playTasbihClick();
    const exists = khatmah.readSurahs.includes(surahNum);
    const updatedSurahs = exists
      ? khatmah.readSurahs.filter((n) => n !== surahNum)
      : [...khatmah.readSurahs, surahNum];

    const targetSurah = SURAH_LIST.find((s) => s.number === surahNum);

    setKhatmah((prev) => ({
      ...prev,
      readSurahs: updatedSurahs,
      lastReadSurahNum: !exists ? surahNum : prev.lastReadSurahNum,
      lastReadSurahName: !exists && targetSurah ? targetSurah.nameAr : prev.lastReadSurahName,
    }));

    if (!exists) {
      soundEngine.playMilestone33();
    }
  };

  const toggleJuz = (juzNum: number) => {
    soundEngine.playTasbihClick();
    const exists = khatmah.readJuzs.includes(juzNum);
    const updatedJuzs = exists
      ? khatmah.readJuzs.filter((n) => n !== juzNum)
      : [...khatmah.readJuzs, juzNum];

    setKhatmah((prev) => ({
      ...prev,
      readJuzs: updatedJuzs,
    }));

    if (!exists) {
      soundEngine.playMilestone33();
    }
  };

  const handleVoiceReadout = () => {
    soundEngine.playTasbihClick();
    const text = `ما شاء الله تبارك الله! قطعت في ختمتك المباركة نسبة ${percentage} بالمائة. قرأت حتى الآن ${surahsCount} سورة من أصل 114، وأتممت ${juzsCount} جزءاً من القرآن الكريم. بارك الله في همتك ونور بصيرتك.`;
    speechEngine.speakEgyptian(text);
  };

  const handleResetKhatmah = () => {
    if (confirm("هل تريد بدء ختمة جديدة وإعادة ضبط تقدم القراءة؟")) {
      soundEngine.playTasbihClick();
      setKhatmah({
        readSurahs: [],
        readJuzs: [],
        startDate: new Date().toISOString().split("T")[0],
        targetDays: 30,
      });
      speechEngine.speak("تم بدء ختمة جديدة، بارك الله في وقتك وهمتك في تلاوة كتاب الله.");
    }
  };

  const filteredSurahs = SURAH_LIST.filter(
    (s) =>
      s.nameAr.includes(searchQuery) ||
      s.number.toString().includes(searchQuery)
  );

  return (
    <div
      id="khatmah-progress-section"
      className={`rounded-2xl sm:rounded-3xl p-5 sm:p-7 border transition-all relative overflow-hidden ${styles.cardBg} ${styles.cardBorder} ${styles.cardShadow}`}
    >
      {/* Background Decorative Gradient Ring */}
      <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-amber-500/5 blur-2xl pointer-events-none" />

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-black/5 dark:border-white/5 relative z-10">
        <div className="flex items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${styles.badgeBg} ${styles.badgeBorder} ${styles.accentText}`}
          >
            <Trophy className="w-6 h-6 text-amber-500 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`text-base sm:text-lg font-bold font-alexandria ${styles.titleText}`}>
                تتبع تقدم ختمة القرآن الكريم
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {percentage}% مكتمل
              </span>
            </div>
            <p className={`text-xs ${styles.mutedText} mt-0.5 flex items-center gap-1.5`}>
              <span>«خيركم من تعلم القرآن وعلمه»</span>
              <span className="hidden md:inline text-slate-400">• ختمتك في طريق النور</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          <button
            onClick={handleVoiceReadout}
            className={`p-2 rounded-xl border transition-all text-xs flex items-center gap-1.5 ${styles.innerBg} ${styles.innerBorder} ${styles.mutedText} hover:${styles.accentText}`}
            title="استمع لتقرير الختمة الصوتي"
            aria-label="قراءة تقدم الختمة صوتياً"
          >
            <Volume2 className="w-4 h-4 text-emerald-500" />
            <span className="hidden md:inline font-bold">نطق الإحصائيات</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
            aria-label="تسجيل تقدم جديد في الختمة"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل مقروء</span>
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4 my-5 relative z-10">
        {/* Metric 1: Surahs Completed */}
        <div
          onClick={() => {
            setModalTab("surahs");
            setIsModalOpen(true);
          }}
          className={`p-4 rounded-2xl border cursor-pointer hover:border-emerald-500/40 transition-all ${styles.innerBg} ${styles.innerBorder}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold ${styles.mutedText}`}>السور المقروءة</span>
            <BookOpen className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {surahsCount}
            </span>
            <span className={`text-xs font-mono ${styles.mutedText}`}>/ {totalSurahs}</span>
          </div>
          <div className="w-full bg-black/5 dark:bg-white/5 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.round((surahsCount / totalSurahs) * 100)}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Juzs Completed */}
        <div
          onClick={() => {
            setModalTab("juzs");
            setIsModalOpen(true);
          }}
          className={`p-4 rounded-2xl border cursor-pointer hover:border-amber-500/40 transition-all ${styles.innerBg} ${styles.innerBorder}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold ${styles.mutedText}`}>الأجزاء المكتملة</span>
            <BookmarkCheck className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-amber-600 dark:text-amber-400">
              {juzsCount}
            </span>
            <span className={`text-xs font-mono ${styles.mutedText}`}>/ {totalJuzs}</span>
          </div>
          <div className="w-full bg-black/5 dark:bg-white/5 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.round((juzsCount / totalJuzs) * 100)}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Remaining in Khatmah */}
        <div className={`p-4 rounded-2xl border ${styles.innerBg} ${styles.innerBorder}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold ${styles.mutedText}`}>المتبقي للختم</span>
            <Sparkles className="w-4 h-4 text-purple-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-purple-600 dark:text-purple-400">
              {totalJuzs - juzsCount}
            </span>
            <span className={`text-xs font-mono ${styles.mutedText}`}>جزء</span>
          </div>
          <p className={`text-[10px] ${styles.mutedText} mt-2.5 truncate`}>
            {surahsCount === totalSurahs ? "مبارك أتممت الختمة! 🎉" : "خطوة مباركة نحو الختم"}
          </p>
        </div>

        {/* Metric 4: Continue Reading Action */}
        <div
          onClick={() => onOpenMushaf && onOpenMushaf(khatmah.lastReadSurahNum || 1)}
          className={`p-4 rounded-2xl border cursor-pointer hover:border-emerald-500/40 transition-all flex flex-col justify-between ${styles.innerBg} ${styles.innerBorder} group`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold ${styles.mutedText}`}>آخر موضع قراءة</span>
            <ChevronRight className="w-4 h-4 text-emerald-500 group-hover:-translate-x-1 transition-transform" />
          </div>
          <div className="my-1">
            <span className="text-base sm:text-lg font-bold font-alexandria text-emerald-600 dark:text-emerald-400 block truncate">
              سورة {khatmah.lastReadSurahName || "الفاتحة"}
            </span>
            <span className={`text-[10px] font-mono ${styles.mutedText}`}>
              متابعة التلاوة في المصحف 📖
            </span>
          </div>
          <div className="w-full text-left">
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 underline decoration-emerald-500/30">
              فتح المصحف الآن
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar & Footer Motivation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-black/5 dark:border-white/5 text-xs">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <Calendar className="w-3.5 h-3.5 text-emerald-500" />
          <span>بدأت هذه الختمة بتاريخ: <strong className="font-mono">{khatmah.startDate}</strong></span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleResetKhatmah}
            className="text-[11px] text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1"
            title="إعادة ضبط الختمة وبدء واحدة جديدة"
          >
            <RotateCcw className="w-3 h-3" />
            <span>بدء ختمة جديدة</span>
          </button>
        </div>
      </div>

      {/* Interactive Selection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
          <div
            className={`w-full max-w-2xl max-h-[85vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden ${styles.cardBg} ${styles.cardBorder}`}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className={`text-base font-bold font-alexandria ${styles.titleText}`}>
                    تسجيل تقدم الختمة المباركة
                  </h4>
                  <p className={`text-[11px] ${styles.mutedText}`}>
                    انقر على السورة أو الجزء لتحديده كمقروء
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-black/5 dark:border-white/5 p-2 gap-2">
              <button
                onClick={() => setModalTab("surahs")}
                className={`flex-1 py-2 rounded-xl font-bold text-xs transition ${
                  modalTab === "surahs"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : `${styles.innerBg} ${styles.mutedText}`
                }`}
              >
                قائمة السور ({surahsCount} / {totalSurahs})
              </button>
              <button
                onClick={() => setModalTab("juzs")}
                className={`flex-1 py-2 rounded-xl font-bold text-xs transition ${
                  modalTab === "juzs"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : `${styles.innerBg} ${styles.mutedText}`
                }`}
              >
                قائمة الأجزاء ({juzsCount} / {totalJuzs})
              </button>
            </div>

            {/* Surahs / Juzs List Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
              {modalTab === "surahs" ? (
                <>
                  <input
                    type="text"
                    placeholder="ابحث عن اسم السورة أو رقمها..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border text-xs outline-none focus:border-emerald-500 ${styles.innerBg} ${styles.innerBorder} ${styles.titleText}`}
                  />
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
                    {filteredSurahs.map((surah) => {
                      const isRead = khatmah.readSurahs.includes(surah.number);
                      return (
                        <button
                          key={surah.number}
                          onClick={() => toggleSurah(surah.number)}
                          className={`p-2.5 rounded-xl border text-right transition flex items-center justify-between ${
                            isRead
                              ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-bold"
                              : `${styles.innerBg} ${styles.innerBorder} ${styles.mutedText} hover:${styles.accentText}`
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="text-[10px] font-mono text-slate-400 w-5">
                              {surah.number}
                            </span>
                            <span className="text-xs truncate font-alexandria">
                              {surah.nameAr}
                            </span>
                          </div>
                          {isRead && <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Array.from({ length: 30 }, (_, i) => i + 1).map((juzNum) => {
                    const isRead = khatmah.readJuzs.includes(juzNum);
                    return (
                      <button
                        key={juzNum}
                        onClick={() => toggleJuz(juzNum)}
                        className={`p-3.5 rounded-xl border text-center transition flex items-center justify-between ${
                          isRead
                            ? "bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300 font-bold"
                            : `${styles.innerBg} ${styles.innerBorder} ${styles.mutedText} hover:${styles.accentText}`
                        }`}
                      >
                        <span className="text-xs font-alexandria">
                          الجزء {juzNum}
                        </span>
                        {isRead && <Check className="w-4 h-4 text-amber-500 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between bg-black/5 dark:bg-white/5">
              <span className={`text-xs font-mono ${styles.mutedText}`}>
                {modalTab === "surahs"
                  ? `${surahsCount} من 114 سورة محددة`
                  : `${juzsCount} من 30 جزءاً محدداً`}
              </span>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition"
              >
                تم وتحديث
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
