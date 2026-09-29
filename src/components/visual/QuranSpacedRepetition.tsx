import React, { useState, useEffect } from "react";
import {
  Brain,
  Calendar,
  CheckCircle2,
  Clock,
  Volume2,
  Play,
  RotateCcw,
  Sparkles,
  Plus,
  Eye,
  EyeOff,
  AlertCircle,
  BookOpen,
  Award,
  ChevronLeft,
  Trash2,
  HelpCircle,
  BookmarkCheck,
} from "lucide-react";
import { SURAH_LIST, SAMPLE_AYAHS } from "../../data/quranData";
import { soundEngine } from "../../utils/soundEngine";
import { speechEngine } from "../../utils/speechEngine";
import { hapticEngine } from "../../utils/hapticEngine";
import { ThemeMode } from "../../types";
import { getThemeStyles } from "../../utils/themeClasses";

export interface MemorizationItem {
  id: string;
  surahNumber: number;
  surahName: string;
  startAyah: number;
  endAyah: number;
  title: string;
  level: number; // 1 (1 day), 2 (3 days), 3 (7 days), 4 (14 days), 5 (30 days - Mastered)
  intervalDays: number;
  nextReviewDate: string; // ISO date string
  lastReviewedDate?: string;
  reviewsCount: number;
  ayahsText: string;
}

const INTERVAL_DAYS_MAP: Record<number, number> = {
  1: 1,
  2: 3,
  3: 7,
  4: 14,
  5: 30,
};

const INITIAL_MEMORIZATION_ITEMS: MemorizationItem[] = [
  {
    id: "memo-01",
    surahNumber: 67,
    surahName: "الملك",
    startAyah: 1,
    endAyah: 5,
    title: "سورة الملك (الآيات 1 - 5)",
    level: 2,
    intervalDays: 3,
    // Set to today/due to experience immediately
    nextReviewDate: new Date().toISOString(),
    reviewsCount: 3,
    ayahsText:
      "تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ ﴿١﴾ الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا ۚ وَهُوَ الْعَزِيزُ الْغَفُورُ ﴿٢﴾ الَّذِي خَلَقَ سَبْعَ سَمَاوَاتٍ طِبَاقًا ۖ مَّا تَرَىٰ فِي خَلْقِ الرَّحْمَٰنِ مِن تَفَاوُتٍ ۖ فَارْجِعِ الْبَصَرَ هَلْ تَرَىٰ مِن فُطُورٍ ﴿٣﴾ ثُمَّ ارْجِعِ الْبَصَرَ كَرَّتَيْنِ يَنقَلِبْ إِلَيْكَ الْبَصَرُ خَاسِئًا وَهُوَ حَسِيرٌ ﴿٤﴾ وَلَقَدْ زَيَّنَّا السَّمَاءَ الدُّنْيَا بِمَصَابِيحَ وَجَعَلْنَاهَا رُجُومًا لِّلشَّيَاطِينِ ۖ وَأَعْتَدْنَا لَهُمْ عَذَابَ السَّعِيرِ ﴿٥﴾",
  },
  {
    id: "memo-02",
    surahNumber: 2,
    surahName: "البقرة",
    startAyah: 285,
    endAyah: 286,
    title: "خواتيم سورة البقرة (الآيتان 285 - 286)",
    level: 4,
    intervalDays: 14,
    nextReviewDate: new Date().toISOString(),
    reviewsCount: 8,
    ayahsText:
      "آمَنَ الرَّسُولُ بِمَا أُنزِلَ إِلَيْهِ مِن رَّبِّهِ وَالْمُؤْمِنُونَ ۚ كُلٌّ آمَنَ بِاللَّهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِّن رُّسُلِهِ ۚ وَقَالُوا سَمِعْنَا وَأَطَعْنَا ۖ غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ الْمَصِيرُ ﴿٢٨٥﴾ لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا ۚ لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ ۗ رَبَّنَا لَا تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا ۚ رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِن قَبْلِنَا ۚ رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ ۖ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا ۚ أَنتَ مَوْلَانَا فَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ ﴿٢٨٦﴾",
  },
  {
    id: "memo-03",
    surahNumber: 18,
    surahName: "الكهف",
    startAyah: 1,
    endAyah: 10,
    title: "أوائل سورة الكهف (العشر آيات الأولى)",
    level: 1,
    intervalDays: 1,
    nextReviewDate: new Date(Date.now() + 86400000).toISOString(),
    reviewsCount: 1,
    ayahsText:
      "الْحَمْدُ لِلَّهِ الَّذِي أَنزَلَ عَلَىٰ عَبْدِهِ الْكِتَابَ وَلَمْ يَجْعَل لَّهُ عِوَجًا ۜ ﴿١﴾ قَيِّمًا لِّيُنذِرَ بَأْسًا شَدِيدًا مِّن لَّدُنْهُ وَيُبَشِّرَ الْمُؤْمِنِينَ الَّذِينَ يَعْمَلُونَ الصَّالِحَاتِ أَنَّ لَهُمْ أَجْرًا حَسَنًا ﴿٢﴾ مَّاكِثِينَ فِيهِ أَبَدًا ﴿٣﴾",
  },
  {
    id: "memo-04",
    surahNumber: 2,
    surahName: "البقرة",
    startAyah: 255,
    endAyah: 255,
    title: "آية الكرسي (سيد آي القرآن)",
    level: 5,
    intervalDays: 30,
    nextReviewDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    reviewsCount: 15,
    ayahsText:
      "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ ﴿٢٥٥﴾",
  },
];

interface Props {
  theme?: ThemeMode;
}

export const QuranSpacedRepetition: React.FC<Props> = ({ theme = "natural" }) => {
  const styles = getThemeStyles(theme);

  // Memorization items stored in localStorage
  const [items, setItems] = useState<MemorizationItem[]>(() => {
    try {
      const saved = localStorage.getItem("noor_quran_spaced_repetition");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return INITIAL_MEMORIZATION_ITEMS;
  });

  // Active testing session
  const [activeReviewItem, setActiveReviewItem] = useState<MemorizationItem | null>(null);
  const [isMasked, setIsMasked] = useState<boolean>(true);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);

  // New passage modal form
  const [newSurahNum, setNewSurahNum] = useState<number>(1);
  const [newStartAyah, setNewStartAyah] = useState<number>(1);
  const [newEndAyah, setNewEndAyah] = useState<number>(7);
  const [newCustomTitle, setNewCustomTitle] = useState<string>("");

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("noor_quran_spaced_repetition", JSON.stringify(items));
    } catch {}
  }, [items]);

  const now = new Date();

  // Due items: nextReviewDate <= now
  const dueItems = items.filter((item) => new Date(item.nextReviewDate) <= now);
  const upcomingItems = items.filter((item) => new Date(item.nextReviewDate) > now);

  // Spoken daily reminder
  const handleSpeakDailySummary = () => {
    soundEngine.playTasbihClick();
    hapticEngine.trigger("memorization_review_due");
    if (dueItems.length === 0) {
      speechEngine.speakEgyptian(
        "ما شاء الله عليك يا غالي! كل مقاطع الحفظ مراجعة ومثبتة، ومفيش أي مقطع مستحق لليوم. ربنا يثبت القرآن في صدرك."
      );
    } else {
      const titles = dueItems.map((d) => d.title).join("، و ");
      speechEngine.speakEgyptian(
        `لديك اليوم ${dueItems.length} مقاطع قرآنية مستحقة للمراجعة في نظام التكرار المتباعد، وهي: ${titles}. انقر على ابدأ التسميع لتثبيت الحفظ.`
      );
    }
  };

  // Start review
  const handleStartReview = (item: MemorizationItem) => {
    soundEngine.playTasbihClick();
    setActiveReviewItem(item);
    setIsMasked(true);
    hapticEngine.trigger("assistant_listen");
    speechEngine.speakEgyptian(
      `بدأت جلسة تثبيت: ${item.title}. ردد الآيات الكريمة غيباً في سرك أو بصوتك، ثم اضغط على إظهار الآيات للتأكد من حفظك.`
    );
  };

  // Recite verse using speechEngine / audio verification
  const handleAudioVerification = (text: string) => {
    soundEngine.playTasbihClick();
    setIsAudioPlaying(true);
    speechEngine.speak(text, {
      onEnd: () => {
        setIsAudioPlaying(false);
      },
    });
  };

  // Grade review result (Spaced Repetition Algorithm)
  const handleGradeReview = (grade: "easy" | "good" | "hard") => {
    if (!activeReviewItem) return;

    let newLevel = activeReviewItem.level;
    if (grade === "easy") {
      newLevel = Math.min(5, activeReviewItem.level + 1);
      soundEngine.playLevelUpChime();
      hapticEngine.trigger("quran_memorized_success");
      speechEngine.speakEgyptian("أحسنت وبارك الله فيك! حفظ متقن، وتم ترحيل المقطع للمستوى التالي.");
    } else if (grade === "good") {
      soundEngine.playTasbihClick();
      hapticEngine.trigger("assistant_respond");
      speechEngine.speakEgyptian("ممتاز يا طيب، تم تثبيت المقطع والموعد القادم للمراجعة.");
    } else {
      newLevel = 1;
      soundEngine.playTasbihClick();
      hapticEngine.trigger("assistant_listen");
      speechEngine.speakEgyptian("ولا يهمك يا غالي، التكرار يثبت الحفظ. سيتم جدولتها للمراجعة غداً بإذن الله.");
    }

    const intervalDays = INTERVAL_DAYS_MAP[newLevel] || 1;
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + intervalDays);

    const updated = items.map((item) => {
      if (item.id === activeReviewItem.id) {
        return {
          ...item,
          level: newLevel,
          intervalDays,
          nextReviewDate: nextDate.toISOString(),
          lastReviewedDate: new Date().toISOString(),
          reviewsCount: item.reviewsCount + 1,
        };
      }
      return item;
    });

    setItems(updated);
    setActiveReviewItem(null);
  };

  // Add new passage
  const handleAddNewItem = () => {
    const surah = SURAH_LIST.find((s) => s.number === newSurahNum) || SURAH_LIST[0];
    const title =
      newCustomTitle.trim() ||
      `سورة ${surah.nameAr} (الآيات ${newStartAyah} - ${newEndAyah})`;

    const newItem: MemorizationItem = {
      id: `memo-${Date.now()}`,
      surahNumber: surah.number,
      surahName: surah.nameAr,
      startAyah: newStartAyah,
      endAyah: newEndAyah,
      title,
      level: 1,
      intervalDays: 1,
      nextReviewDate: new Date().toISOString(),
      reviewsCount: 0,
      ayahsText: `بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ - سورة ${surah.nameAr} من الآية ${newStartAyah} إلى الآية ${newEndAyah}.`,
    };

    setItems([newItem, ...items]);
    setIsAddingNew(false);
    setNewCustomTitle("");
    soundEngine.playLevelUpChime();
    hapticEngine.trigger("quran_memorized_success");
    speechEngine.speakEgyptian(`تمت إضافة ${title} إلى جدول الحفظ التكراري بنجاح.`);
  };

  const handleDeleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.playTasbihClick();
    setItems(items.filter((i) => i.id !== id));
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header Banner */}
      <div
        className={`p-5 sm:p-6 rounded-3xl border shadow-sm relative overflow-hidden ${styles.cardBg} ${styles.cardBorder}`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-amber-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-xs">
              <Brain className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-lg sm:text-xl font-bold font-alexandria ${styles.titleText}`}>
                  نظام الحفظ التكراري الذكي (Spaced Repetition)
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  خوارزمية التثبيت العلمي
                </span>
              </div>
              <p className={`text-xs sm:text-sm mt-1 ${styles.mutedText}`}>
                جدولة الآيات بمواعيد تكرار متباعدة لترسيخها في الذاكرة طويلة المدى، مع تذكير واختبار صوتي
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleSpeakDailySummary}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95 shadow-xs"
              title="الاستماع لجدول المراجعة والتذكير الصوتي"
            >
              <Volume2 className="w-4 h-4 text-amber-500" />
              <span>تذكير المراجعة صوتياً</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playTasbihClick();
                setIsAddingNew(true);
              }}
              className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة مقطع حفظ</span>
            </button>
          </div>
        </div>

        {/* Status Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 pt-4 border-t border-black/5 dark:border-white/5">
          <div className={`p-3 rounded-2xl border ${styles.innerBg} ${styles.innerBorder}`}>
            <span className={`text-[11px] block ${styles.mutedText}`}>مستحق المراجعة اليوم</span>
            <span className="text-xl font-bold text-amber-600 dark:text-amber-400 font-mono">
              {dueItems.length} مقاطع
            </span>
          </div>
          <div className={`p-3 rounded-2xl border ${styles.innerBg} ${styles.innerBorder}`}>
            <span className={`text-[11px] block ${styles.mutedText}`}>قيد التثبيت</span>
            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              {upcomingItems.length} مقاطع
            </span>
          </div>
          <div className={`p-3 rounded-2xl border ${styles.innerBg} ${styles.innerBorder}`}>
            <span className={`text-[11px] block ${styles.mutedText}`}>المستوى المتقن (المستوى 5)</span>
            <span className="text-xl font-bold text-teal-600 dark:text-teal-400 font-mono">
              {items.filter((i) => i.level === 5).length} مقاطع
            </span>
          </div>
          <div className={`p-3 rounded-2xl border ${styles.innerBg} ${styles.innerBorder}`}>
            <span className={`text-[11px] block ${styles.mutedText}`}>إجمالي مرات التسميع</span>
            <span className="text-xl font-bold text-purple-600 dark:text-purple-400 font-mono">
              {items.reduce((acc, cur) => acc + cur.reviewsCount, 0)} مرة
            </span>
          </div>
        </div>
      </div>

      {/* ACTIVE REVIEW TESTING MODAL / VIEW */}
      {activeReviewItem && (
        <div className="p-5 sm:p-7 rounded-3xl border-2 border-emerald-500/50 bg-emerald-500/5 backdrop-blur-md space-y-4 shadow-xl animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h4 className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400">
                جلسة تسميع واختبار: {activeReviewItem.title}
              </h4>
            </div>
            <button
              onClick={() => setActiveReviewItem(null)}
              className="text-xs px-3 py-1 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 text-slate-400"
            >
              إلغاء الجلسة
            </button>
          </div>

          <p className="text-xs text-slate-500 dark:text-zinc-400">
            ردد الآيات الكريمة من صدرك غيباً أولاً. يمكنك إخفاء النص لاختبار حفظك، ثم إظهاره للمراجعة والمقارنة.
          </p>

          {/* Verses Text Box with Mask / Unmask Toggle */}
          <div
            className={`p-5 rounded-2xl border transition-all text-center relative ${
              isMasked
                ? "bg-slate-900 text-slate-500 select-none cursor-pointer"
                : "bg-white/90 dark:bg-black/80 text-slate-900 dark:text-yellow-300 font-['Amiri',serif] text-xl sm:text-2xl leading-[2.5]"
            }`}
            onClick={() => isMasked && setIsMasked(false)}
          >
            {isMasked ? (
              <div className="py-8 space-y-3">
                <EyeOff className="w-8 h-8 text-amber-400 mx-auto animate-bounce" />
                <p className="text-sm font-bold text-slate-300">
                  الآيات محجوبة لاختبار ذاكرتك 🧠
                </p>
                <p className="text-xs text-slate-400">
                  ردد الآية الكريمة غيباً، ثم انقر هنا أو على الزر أدناه لإظهار النص والتأكد
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-justify px-2">{activeReviewItem.ayahsText}</p>
              </div>
            )}
          </div>

          {/* Test Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  soundEngine.playTasbihClick();
                  setIsMasked(!isMasked);
                }}
                className="px-3.5 py-2 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 font-bold text-xs flex items-center gap-1.5 transition"
              >
                {isMasked ? <Eye className="w-4 h-4 text-emerald-500" /> : <EyeOff className="w-4 h-4 text-amber-500" />}
                <span>{isMasked ? "إظهار النص للتحقق" : "إخفاء النص للاختبار"}</span>
              </button>

              <button
                onClick={() => handleAudioVerification(activeReviewItem.ayahsText)}
                disabled={isAudioPlaying}
                className="px-3.5 py-2 rounded-xl bg-purple-600/15 hover:bg-purple-600/25 text-purple-700 dark:text-purple-300 border border-purple-500/30 font-bold text-xs flex items-center gap-1.5 transition"
              >
                <Volume2 className="w-4 h-4" />
                <span>{isAudioPlaying ? "جارٍ القراءة الصوتية..." : "استمع للقراءة الصحيحة"}</span>
              </button>
            </div>

            {/* Evaluation Buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => handleGradeReview("easy")}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1 transition shadow-xs active:scale-95"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>سهل ومتقن 🟢</span>
              </button>

              <button
                onClick={() => handleGradeReview("good")}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1 transition shadow-xs active:scale-95"
              >
                <span>جيد مع وقفات 🟡</span>
              </button>

              <button
                onClick={() => handleGradeReview("hard")}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1 transition shadow-xs active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>أحتاج مراجعة غداً 🔴</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 1: DUE TODAY (مستحق المراجعة اليوم) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <h4 className={`text-sm sm:text-base font-bold font-alexandria ${styles.titleText}`}>
              المقاطع المستحقة للمراجعة والتثبيت اليوم ({dueItems.length})
            </h4>
          </div>
          {dueItems.length > 0 && (
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              حان موعد التكرار المتباعد
            </span>
          )}
        </div>

        {dueItems.length === 0 ? (
          <div
            className={`p-6 rounded-3xl border text-center space-y-2 ${styles.cardBg} ${styles.cardBorder}`}
          >
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className={`text-sm font-bold ${styles.titleText}`}>
              أتممت مراجعات اليوم كاملة، بارك الله فيك!
            </p>
            <p className={`text-xs ${styles.mutedText}`}>
              جميع المقاطع تم تثبيتها وترحيلها لمواعيدها العلمية القادمة.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {dueItems.map((item) => (
              <div
                key={item.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${styles.cardBg} ${styles.cardBorder} hover:border-emerald-500/40 shadow-xs`}
              >
                <div className="space-y-1.5 text-right">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-mono">
                      المستوى {item.level} • فاصل {item.intervalDays} أيام
                    </span>
                    <button
                      onClick={(e) => handleDeleteItem(item.id, e)}
                      className="text-slate-400 hover:text-rose-500 transition p-1"
                      title="حذف من جدول الحفظ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h5 className={`text-base font-bold ${styles.titleText}`}>{item.title}</h5>
                  <p className={`text-xs line-clamp-2 ${styles.mutedText} font-['Amiri',serif]`}>
                    {item.ayahsText}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5">
                  <span className={`text-[11px] ${styles.mutedText}`}>
                    تمت مراجعته: {item.reviewsCount} مرات
                  </span>
                  <button
                    onClick={() => handleStartReview(item)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>بدء التسميع والاختبار</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: SCHEDULED & MASTERED (المقاطع المجدولة القادمة) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2 px-1">
          <Calendar className="w-4 h-4 text-emerald-500" />
          <h4 className={`text-sm sm:text-base font-bold font-alexandria ${styles.titleText}`}>
            المقاطع المجدولة للأيام القادمة ({upcomingItems.length})
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {upcomingItems.map((item) => {
            const daysLeft = Math.max(
              1,
              Math.ceil((new Date(item.nextReviewDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            );
            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border ${styles.cardBg} ${styles.cardBorder} opacity-85 hover:opacity-100 transition`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono">
                    المستوى {item.level} / 5
                  </span>
                  <span className="text-xs font-mono text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>مراجعة بعد {daysLeft} {daysLeft === 1 ? "يوم" : "أيام"}</span>
                  </span>
                </div>
                <h5 className={`text-sm font-bold mt-2 ${styles.titleText}`}>{item.title}</h5>
                <p className={`text-xs mt-1 line-clamp-1 ${styles.mutedText} font-['Amiri',serif]`}>
                  {item.ayahsText}
                </p>
                <div className="flex items-center justify-end mt-2 pt-2 border-t border-black/5 dark:border-white/5">
                  <button
                    onClick={() => handleStartReview(item)}
                    className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                  >
                    مراجعة مبكرة الآن ←
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ADD NEW MEMORIZATION PASSAGE MODAL */}
      {isAddingNew && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div
            className={`w-full max-w-lg rounded-3xl border shadow-2xl p-5 sm:p-6 space-y-4 ${styles.cardBg} ${styles.cardBorder}`}
          >
            <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-3">
              <h4 className={`text-base sm:text-lg font-bold font-alexandria ${styles.titleText}`}>
                إضافة مقطع جديد لجدول الحفظ والمراجعة
              </h4>
              <button
                onClick={() => setIsAddingNew(false)}
                className="text-xs p-1.5 rounded-lg bg-black/5 dark:bg-white/5 text-slate-400 hover:text-white"
              >
                إغلاق
              </button>
            </div>

            <div className="space-y-3 text-right">
              <div>
                <label className={`block text-xs font-bold mb-1 ${styles.bodyText}`}>
                  اختر السورة الكريمة:
                </label>
                <select
                  value={newSurahNum}
                  onChange={(e) => setNewSurahNum(Number(e.target.value))}
                  className={`w-full p-2.5 rounded-xl border text-sm font-bold ${styles.innerBg} ${styles.innerBorder}`}
                >
                  {SURAH_LIST.map((s) => (
                    <option key={s.number} value={s.number}>
                      {s.number}. سورة {s.nameAr} ({s.numberOfAyahs} آية)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-bold mb-1 ${styles.bodyText}`}>
                    من الآية رقم:
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={newStartAyah}
                    onChange={(e) => setNewStartAyah(Math.max(1, Number(e.target.value)))}
                    className={`w-full p-2.5 rounded-xl border text-sm font-bold ${styles.innerBg} ${styles.innerBorder}`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-1 ${styles.bodyText}`}>
                    إلى الآية رقم:
                  </label>
                  <input
                    type="number"
                    min={newStartAyah}
                    value={newEndAyah}
                    onChange={(e) => setNewEndAyah(Math.max(newStartAyah, Number(e.target.value)))}
                    className={`w-full p-2.5 rounded-xl border text-sm font-bold ${styles.innerBg} ${styles.innerBorder}`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1 ${styles.bodyText}`}>
                  عنوان مخصص للمقطع (اختياري):
                </label>
                <input
                  type="text"
                  placeholder="مثال: ربع الحزب الأول من سورة النساء"
                  value={newCustomTitle}
                  onChange={(e) => setNewCustomTitle(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border text-sm ${styles.innerBg} ${styles.innerBorder}`}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/5 dark:border-white/5">
              <button
                onClick={() => setIsAddingNew(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
              >
                إلغاء
              </button>
              <button
                onClick={handleAddNewItem}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition active:scale-95 shadow-xs"
              >
                إضافة للمراجعة التكرارية
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
