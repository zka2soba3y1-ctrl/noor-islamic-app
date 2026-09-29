import React, { useState, useEffect, useMemo } from "react";
import {
  Sun,
  Moon,
  RotateCcw,
  Volume2,
  VolumeX,
  CheckCircle2,
  Search,
  BookOpen,
  Sparkles,
  Share2,
  Copy,
  Check,
  Award,
  Layers,
  Feather,
  Sliders,
} from "lucide-react";
import { quranApiService, ApiZikrItem, ApiAzkarResponse } from "../../services/quranApiService";
import { soundEngine } from "../../utils/soundEngine";
import { speechEngine } from "../../utils/speechEngine";
import { ThemeMode } from "../../types";
import { getThemeStyles } from "../../utils/themeClasses";

interface Props {
  initialTheme?: ThemeMode;
}

type AzkarCategoryKey =
  | "morning_azkar"
  | "evening_azkar"
  | "prayer_azkar"
  | "prayer_later_azkar"
  | "sleep_azkar"
  | "wake_up_azkar"
  | "mosque_azkar"
  | "adhan_azkar"
  | "wudu_azkar"
  | "home_azkar"
  | "khala_azkar"
  | "food_azkar"
  | "hajj_and_umrah_azkar"
  | "miscellaneous_azkar";

interface CategoryMeta {
  key: AzkarCategoryKey;
  title: string;
  shortTitle: string;
  iconName: string;
  badgeColor: string;
}

const CATEGORIES: CategoryMeta[] = [
  { key: "morning_azkar", title: "أذكار الصباح", shortTitle: "الصباح", iconName: "sun", badgeColor: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
  { key: "evening_azkar", title: "أذكار المساء", shortTitle: "المساء", iconName: "moon", badgeColor: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20" },
  { key: "prayer_azkar", title: "أذكار الصلاة", shortTitle: "الصلاة", iconName: "sparkles", badgeColor: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
  { key: "prayer_later_azkar", title: "أذكار بعد الصلاة", shortTitle: "بعد الصلاة", iconName: "sparkles", badgeColor: "text-teal-500 bg-teal-500/10 border-teal-500/20" },
  { key: "sleep_azkar", title: "أذكار النوم", shortTitle: "النوم", iconName: "moon", badgeColor: "text-purple-500 bg-purple-500/10 border-purple-500/20" },
  { key: "wake_up_azkar", title: "أذكار الاستيقاظ", shortTitle: "الاستيقاظ", iconName: "sun", badgeColor: "text-amber-600 bg-amber-600/10 border-amber-600/20" },
  { key: "mosque_azkar", title: "أذكار المسجد", shortTitle: "المسجد", iconName: "sparkles", badgeColor: "text-emerald-600 bg-emerald-600/10 border-emerald-600/20" },
  { key: "adhan_azkar", title: "أذكار الأذان", shortTitle: "الأذان", iconName: "sparkles", badgeColor: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
  { key: "wudu_azkar", title: "أذكار الوضوء", shortTitle: "الوضوء", iconName: "sparkles", badgeColor: "text-sky-500 bg-sky-500/10 border-sky-500/20" },
  { key: "home_azkar", title: "أذكار المنزل", shortTitle: "المنزل", iconName: "sparkles", badgeColor: "text-orange-500 bg-orange-500/10 border-orange-500/20" },
  { key: "food_azkar", title: "أذكار الطعام", shortTitle: "الطعام", iconName: "sparkles", badgeColor: "text-rose-500 bg-rose-500/10 border-rose-500/20" },
  { key: "hajj_and_umrah_azkar", title: "أذكار الحج والعمرة", shortTitle: "الحج والعمرة", iconName: "sparkles", badgeColor: "text-yellow-600 bg-yellow-600/10 border-yellow-600/20" },
  { key: "miscellaneous_azkar", title: "أذكار متفرقة وشاملة", shortTitle: "متفرقة", iconName: "sparkles", badgeColor: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
];

export const AzkarList: React.FC<Props> = ({ initialTheme = "natural" }) => {
  const [theme, setTheme] = useState<ThemeMode>(initialTheme);
  const styles = getThemeStyles(theme);

  const [azkarData, setAzkarData] = useState<ApiAzkarResponse | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<AzkarCategoryKey>("morning_azkar");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Font size multiplier
  const [fontSize, setFontSize] = useState<number>(18);

  // Counter state: Map of zikrId -> current completed count
  const [progressMap, setProgressMap] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem("noor_azkar_progress");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  // Fetch Azkar from API
  useEffect(() => {
    let isMounted = true;
    const loadAzkar = async () => {
      setIsLoading(true);
      try {
        const data = await quranApiService.getAzkar();
        if (isMounted && data) {
          setAzkarData(data);
        }
      } catch (err) {
        console.error("Failed to load Azkar list:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadAzkar();
    return () => {
      isMounted = false;
    };
  }, []);

  // Save progress
  useEffect(() => {
    try {
      localStorage.setItem("noor_azkar_progress", JSON.stringify(progressMap));
    } catch {
      // Ignore
    }
  }, [progressMap]);

  // Current category items
  const currentItems = useMemo(() => {
    if (!azkarData) return [];
    const list = azkarData[selectedCategory] || [];
    if (!searchQuery.trim()) return list;
    const q = searchQuery.trim().toLowerCase();
    return list.filter((item) => item.text.toLowerCase().includes(q));
  }, [azkarData, selectedCategory, searchQuery]);

  // Progress stats for current category
  const categoryStats = useMemo(() => {
    const list = azkarData ? azkarData[selectedCategory] || [] : [];
    if (list.length === 0) return { completed: 0, total: 0, percent: 0 };
    let completed = 0;
    list.forEach((item) => {
      const key = `${selectedCategory}_${item.id}`;
      const count = progressMap[key] || 0;
      if (count >= item.count) completed++;
    });
    const percent = Math.round((completed / list.length) * 100);
    return { completed, total: list.length, percent };
  }, [azkarData, selectedCategory, progressMap]);

  // Handle count increment
  const handleIncrement = (item: ApiZikrItem) => {
    const key = `${selectedCategory}_${item.id}`;
    const current = progressMap[key] || 0;
    const target = item.count || 1;

    if (current < target) {
      soundEngine.playTasbihClick();
      const nextVal = current + 1;
      setProgressMap((prev) => ({ ...prev, [key]: nextVal }));

      if (nextVal >= target) {
        soundEngine.playMilestone33();
        speechEngine.speak("تقبل الله منك");
      }
    }
  };

  // Reset single item
  const handleResetItem = (item: ApiZikrItem, e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.playTasbihClick();
    const key = `${selectedCategory}_${item.id}`;
    setProgressMap((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  // Reset all in current category
  const handleResetCategory = () => {
    soundEngine.playTasbihClick();
    if (!confirm("هل تريد إعادة ضبط جميع أذكار هذا القسم؟")) return;
    const list = azkarData ? azkarData[selectedCategory] || [] : [];
    setProgressMap((prev) => {
      const next = { ...prev };
      list.forEach((item) => {
        delete next[`${selectedCategory}_${item.id}`];
      });
      return next;
    });
  };

  // Audio recitation via Speech engine
  const handleToggleSpeak = (item: ApiZikrItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const key = `${selectedCategory}_${item.id}`;
    if (speakingId === key) {
      speechEngine.stop();
      setSpeakingId(null);
    } else {
      speechEngine.stop();
      setSpeakingId(key);
      speechEngine.speak(item.text);
      // Automatically clear indicator after approximate duration
      const wordCount = item.text.split(/\s+/).length;
      const durationMs = Math.max(3000, wordCount * 450);
      setTimeout(() => {
        setSpeakingId((cur) => (cur === key ? null : cur));
      }, durationMs);
    }
  };

  // Copy zikr text
  const handleCopy = (item: ApiZikrItem, e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.playTasbihClick();
    const key = `${selectedCategory}_${item.id}`;
    navigator.clipboard.writeText(item.text);
    setCopiedId(key);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Share zikr
  const handleShare = (item: ApiZikrItem, e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.playTasbihClick();
    if (navigator.share) {
      navigator.share({
        title: "من أذكار المسلم - تطبيق النور",
        text: item.text,
      }).catch(() => {});
    } else {
      handleCopy(item, e);
    }
  };

  return (
    <div id="azkar-list-container" className="space-y-4 sm:space-y-6 animate-fadeIn pb-12">
      {/* Top Header & Reading Controls */}
      <div
        className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border transition-all ${
          styles.cardBg
        } ${styles.cardBorder}`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className={`text-lg sm:text-xl font-black ${styles.titleText}`}>
                الأذكار وحصن المسلم
              </h2>
              <p className={`text-xs ${styles.mutedText}`}>
                بيانات موثقة من السنة المطهرة • تكرار تفاعلي • أوضاع قراءة مريحة
              </p>
            </div>
          </div>

          {/* Reading Themes Selector: ليلي / ورقي / طبيعي / فاتح */}
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            <span className={`text-xs font-bold pl-1 ${styles.mutedText}`}>وضع القراءة:</span>
            <button
              onClick={() => setTheme("paper")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                theme === "paper"
                  ? "bg-[#C49A45] text-white border-[#A88030] shadow-xs"
                  : styles.btnSecondary
              }`}
              title="نمط ورقي تراثي مريح للعينين"
            >
              <Feather className="w-3.5 h-3.5" />
              <span>ورقي</span>
            </button>

            <button
              onClick={() => setTheme("night")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                theme === "night"
                  ? "bg-slate-800 text-white border-slate-700 shadow-xs"
                  : styles.btnSecondary
              }`}
              title="نمط ليلي عميق وخافت"
            >
              <Moon className="w-3.5 h-3.5 text-amber-400" />
              <span>ليلي</span>
            </button>

            <button
              onClick={() => setTheme("natural")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                theme === "natural"
                  ? "bg-emerald-600 text-white border-emerald-700 shadow-xs"
                  : styles.btnSecondary
              }`}
              title="نمط طبيعي زمردي"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>طبيعي</span>
            </button>

            <button
              onClick={() => setTheme("light")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                theme === "light"
                  ? "bg-amber-600 text-white border-amber-700 shadow-xs"
                  : styles.btnSecondary
              }`}
              title="نمط فاتح ناصع"
            >
              <Sun className="w-3.5 h-3.5" />
              <span>فاتح</span>
            </button>

            {/* Font Size Adjusters */}
            <div className={`flex items-center gap-1 p-0.5 rounded-xl border mr-1 ${styles.innerBg} ${styles.innerBorder}`}>
              <button
                onClick={() => setFontSize((s) => Math.max(15, s - 1))}
                className={`px-2 py-1 rounded-lg text-xs font-bold ${styles.btnSecondary}`}
                title="تصغير الخط"
              >
                A-
              </button>
              <span className={`text-[10px] font-mono px-1 ${styles.mutedText}`}>{fontSize}</span>
              <button
                onClick={() => setFontSize((s) => Math.min(26, s + 1))}
                className={`px-2 py-1 rounded-lg text-xs font-bold ${styles.btnSecondary}`}
                title="تكبير الخط"
              >
                A+
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar & Reset Category */}
        <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className={`absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${styles.mutedText}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في نصوص الأذكار والأدعية..."
              className={`w-full pr-10 pl-4 py-2.5 rounded-2xl border text-xs sm:text-sm font-medium focus:outline-hidden transition ${
                styles.innerBg
              } ${styles.innerBorder} ${styles.titleText}`}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-1.5 text-xs font-bold">
              <span className={styles.mutedText}>الإنجاز:</span>
              <span className="text-emerald-500 font-mono">
                {categoryStats.completed} / {categoryStats.total}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${styles.badgeBg} ${styles.badgeText} ${styles.badgeBorder}`}>
                {categoryStats.percent}%
              </span>
            </div>

            <button
              onClick={handleResetCategory}
              className={`p-2 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${styles.btnSecondary}`}
              title="إعادة ضبط عدادات القسم الحالي"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">إعادة ضبط</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-300 rounded-full"
            style={{ width: `${categoryStats.percent}%` }}
          />
        </div>
      </div>

      {/* Categories Horizontal Scroll Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => {
                soundEngine.playTasbihClick();
                setSelectedCategory(cat.key);
              }}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 flex items-center gap-2 ${
                isSelected ? styles.btnPrimary : styles.btnSecondary
              }`}
            >
              <span>{cat.title}</span>
            </button>
          );
        })}
      </div>

      {/* Azkar Cards List */}
      {isLoading ? (
        <div className={`p-12 text-center rounded-3xl border ${styles.cardBg} ${styles.cardBorder}`}>
          <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className={`text-sm font-bold ${styles.mutedText}`}>جاري تحميل الأذكار المباركة...</p>
        </div>
      ) : currentItems.length === 0 ? (
        <div className={`p-12 text-center rounded-3xl border ${styles.cardBg} ${styles.cardBorder}`}>
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30 text-emerald-500" />
          <p className={`text-base font-bold ${styles.titleText}`}>لا توجد أذكار مطابقة لبحثك</p>
          <p className={`text-xs mt-1 ${styles.mutedText}`}>جرّب كتابة كلمة بحث أخرى أو تغيير القسم</p>
        </div>
      ) : (
        <div className="space-y-4">
          {currentItems.map((item, idx) => {
            const key = `${selectedCategory}_${item.id}`;
            const count = progressMap[key] || 0;
            const target = item.count || 1;
            const isCompleted = count >= target;
            const isSpeaking = speakingId === key;
            const isCopied = copiedId === key;

            return (
              <div
                key={item.id}
                onClick={() => handleIncrement(item)}
                className={`p-5 sm:p-6 rounded-2xl sm:rounded-3xl border transition-all cursor-pointer relative overflow-hidden group select-none ${
                  isCompleted
                    ? theme === "paper"
                      ? "bg-[#F3ECE0] border-[#D4AF37]/50"
                      : "bg-emerald-950/20 border-emerald-500/40"
                    : `${styles.cardBg} ${styles.cardBorder} hover:border-emerald-500/50`
                }`}
              >
                {/* Progress bar accent on top */}
                <div
                  className={`absolute top-0 right-0 h-1 bg-gradient-to-l from-emerald-500 to-teal-400 transition-all duration-300 ${
                    isCompleted ? "w-full" : ""
                  }`}
                  style={{ width: isCompleted ? "100%" : `${(count / target) * 100}%` }}
                />

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  {/* Zikr Index & Target Badge */}
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-mono text-xs font-black">
                      {idx + 1}
                    </span>
                    <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-slate-500/10 text-slate-700 dark:text-slate-300 border border-slate-500/20">
                      التكرار المطلوب: {target} {target === 1 ? "مرة" : "مرات"}
                    </span>
                    {isCompleted && (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>تم الإتمام</span>
                      </span>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                      onClick={(e) => handleToggleSpeak(item, e)}
                      className={`p-2 rounded-xl border transition ${
                        isSpeaking
                          ? "bg-emerald-600 text-white border-emerald-700"
                          : styles.btnSecondary
                      }`}
                      title={isSpeaking ? "إيقاف القراءة" : "الاستماع صوتياً"}
                    >
                      {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={(e) => handleCopy(item, e)}
                      className={`p-2 rounded-xl border transition ${styles.btnSecondary}`}
                      title="نسخ الذكر"
                    >
                      {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={(e) => handleShare(item, e)}
                      className={`p-2 rounded-xl border transition ${styles.btnSecondary}`}
                      title="مشاركة الذكر"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    {count > 0 && (
                      <button
                        onClick={(e) => handleResetItem(item, e)}
                        className={`p-2 rounded-xl border transition text-rose-500 hover:bg-rose-500/10 ${styles.btnSecondary}`}
                        title="إعادة ضبط هذا الذكر"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Zikr Main Text (Formatted with comfortable reading font & spacing) */}
                <div className="my-5">
                  <p
                    className={`font-['Amiri',serif] leading-[2.2] text-justify select-text ${
                      theme === "paper"
                        ? "text-[#3D2817]"
                        : theme === "night"
                        ? "text-[#F1F5F9]"
                        : theme === "light"
                        ? "text-[#1E293B]"
                        : "text-[#E2E8F0]"
                    }`}
                    style={{ fontSize: `${fontSize}px` }}
                  >
                    {item.text}
                  </p>
                </div>

                {/* Repeat Interactive Counter Button */}
                <div className="flex items-center justify-between pt-3 border-t border-black/5 dark:border-white/5">
                  <span className={`text-[11px] font-medium ${styles.mutedText}`}>
                    اضغط في أي مكان لتسجيل تكرار
                  </span>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleIncrement(item);
                      }}
                      className={`px-4 py-2 rounded-2xl font-mono text-sm font-black transition-all flex items-center gap-2 shadow-xs active:scale-95 ${
                        isCompleted
                          ? "bg-emerald-600 text-white hover:bg-emerald-700"
                          : "bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700"
                      }`}
                    >
                      <span>{count}</span>
                      <span className="opacity-70">/</span>
                      <span>{target}</span>
                      {isCompleted && <CheckCircle2 className="w-4 h-4 ml-1" />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
