import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Heart,
  BookOpen,
  Sparkles,
  Volume2,
  VolumeX,
  RotateCcw,
  Search,
  Check,
  Copy,
  Share2,
  Bookmark,
  BookmarkCheck,
  Play,
  Pause,
  Repeat,
  Compass,
  CheckCircle2,
  ListFilter,
  Layers,
  ArrowRight,
  ScrollText,
} from "lucide-react";
import { ThemeMode } from "../../types";
import { getThemeStyles } from "../../utils/themeClasses";
import { soundEngine } from "../../utils/soundEngine";
import { speechEngine } from "../../utils/speechEngine";
import {
  fetchDuasFromApi,
  DuaItem,
  DUA_CATEGORIES,
  DuaCategoryKey,
} from "../../services/duasService";

interface Props {
  theme?: ThemeMode;
  onBackToHome?: () => void;
}

export const DuasComprehensiveView: React.FC<Props> = ({
  theme = "natural",
  onBackToHome,
}) => {
  const styles = getThemeStyles(theme);
  const [allDuas, setAllDuas] = useState<DuaItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Selected category (null means viewing sections/libraries hub, string means viewing that section)
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Per-dua user state: repetition counts and bookmarks
  const [duaCounts, setDuaCounts] = useState<Record<number, number>>({});
  const [targetCounts, setTargetCounts] = useState<Record<number, number>>({});
  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem("noor_favorite_duas");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Audio repetition state
  const [activeAudioDuaId, setActiveAudioDuaId] = useState<number | null>(null);
  const [currentAudioLoop, setCurrentAudioLoop] = useState<number>(0);
  const [targetAudioLoop, setTargetAudioLoop] = useState<number>(3);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Audio loop cancellation ref
  const isCancelledRef = useRef<boolean>(false);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    fetchDuasFromApi().then((res) => {
      if (mounted) {
        setAllDuas(res.all);
        setIsLoading(false);
      }
    });
    return () => {
      mounted = false;
      stopAudioRepetition();
    };
  }, []);

  const handleOpenCategory = (catKey: string) => {
    soundEngine.playTasbihClick();
    setActiveCategory(catKey);
    setSearchQuery("");
    const catName =
      catKey === "favorites"
        ? "الأدعية المفضلة"
        : DUA_CATEGORIES.find((c) => c.key === catKey)?.nameAr || "قسم الأدعية";
    speechEngine.speakNavFeedback(`تم فتح ${catName}`);
  };

  const handleReturnToCategoriesHub = () => {
    soundEngine.playTasbihClick();
    setActiveCategory(null);
    setSearchQuery("");
    stopAudioRepetition();
    speechEngine.speakNavFeedback("العودة لأقسام ومكتبات الأدعية");
  };

  // Filter duas by category and search
  const filteredDuas = useMemo(() => {
    return allDuas.filter((item) => {
      // Favorites filter
      if (activeCategory === "favorites") {
        if (!favorites.includes(item.id)) return false;
      } else if (activeCategory && activeCategory !== "all") {
        if (item.categoryKey !== activeCategory) return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesText = item.text.toLowerCase().includes(q);
        const matchesNote = item.sourceNote && item.sourceNote.toLowerCase().includes(q);
        if (!matchesText && !matchesNote) return false;
      }
      return true;
    });
  }, [allDuas, activeCategory, searchQuery, favorites]);

  // Manual bead increment
  const handleIncrement = (dua: DuaItem) => {
    soundEngine.playTasbihClick();
    const current = duaCounts[dua.id] || 0;
    const target = targetCounts[dua.id] || dua.count || 1;
    const next = current + 1;

    setDuaCounts((prev) => ({ ...prev, [dua.id]: next }));

    if (next === target) {
      soundEngine.playLevelUpChime();
      speechEngine.speakNavFeedback("تم إتمام التكرار المطلوب بنجاح، تقبل الله.");
    }
  };

  const handleResetCount = (duaId: number) => {
    soundEngine.playTasbihClick();
    setDuaCounts((prev) => ({ ...prev, [duaId]: 0 }));
  };

  const handleSetTarget = (duaId: number, target: number) => {
    soundEngine.playTasbihClick();
    setTargetCounts((prev) => ({ ...prev, [duaId]: target }));
  };

  // Audio Repetition Logic
  const startAudioRepetition = async (dua: DuaItem, count: number = 3) => {
    soundEngine.playTasbihClick();

    if (activeAudioDuaId === dua.id) {
      stopAudioRepetition();
      return;
    }

    stopAudioRepetition();
    isCancelledRef.current = false;
    setActiveAudioDuaId(dua.id);
    setTargetAudioLoop(count);
    setCurrentAudioLoop(1);

    speechEngine.speakNavFeedback(
      `بدء تكرار الدعاء صوتياً ${count} مرات.`,
      ""
    );

    const speechText = dua.text.replace(/\[.*?\]/g, "").trim();

    for (let i = 1; i <= count; i++) {
      if (isCancelledRef.current) break;
      setCurrentAudioLoop(i);

      setDuaCounts((prev) => ({ ...prev, [dua.id]: (prev[dua.id] || 0) + 1 }));

      await new Promise<void>((resolve) => {
        speechEngine.speak(speechText, {
          rate: 0.9,
          onEnd: () => resolve(),
        });
      });

      if (isCancelledRef.current) break;

      if (i < count) {
        await new Promise((res) => setTimeout(res, 900));
      }
    }

    if (!isCancelledRef.current) {
      soundEngine.playLevelUpChime();
      speechEngine.speakNavFeedback("اكتمل تكرار الدعاء بحمد الله.");
    }

    setActiveAudioDuaId(null);
    setCurrentAudioLoop(0);
  };

  const stopAudioRepetition = () => {
    isCancelledRef.current = true;
    speechEngine.stop();
    setActiveAudioDuaId(null);
    setCurrentAudioLoop(0);
  };

  // Copy dua
  const handleCopy = (dua: DuaItem) => {
    soundEngine.playTasbihClick();
    navigator.clipboard.writeText(dua.text);
    setCopiedId(dua.id);
    setTimeout(() => setCopiedId(null), 2000);
    speechEngine.speakNavFeedback("تم نسخ نص الدعاء إلى الحافظة.");
  };

  // Share dua
  const handleShare = (dua: DuaItem) => {
    soundEngine.playTasbihClick();
    if (navigator.share) {
      navigator
        .share({
          title: `دعاء مأثور - ${dua.categoryNameAr}`,
          text: `${dua.text}\n\n[مشروع النور الإسلامي]`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      handleCopy(dua);
    }
  };

  // Toggle favorite
  const toggleFavorite = (id: number) => {
    soundEngine.playTasbihClick();
    setFavorites((prev) => {
      const next = prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id];
      try {
        localStorage.setItem("noor_favorite_duas", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Get count per category
  const getCategoryCount = (key: string) => {
    if (key === "favorites") return favorites.length;
    if (key === "all") return allDuas.length;
    return allDuas.filter((d) => d.categoryKey === key).length;
  };

  // =========================================================================
  // VIEW 1: DUAS DEPARTMENTS / SECTIONS HUB (No default dumped duas)
  // =========================================================================
  if (!activeCategory && !searchQuery.trim()) {
    const mainSections = [
      {
        id: "quran_duas",
        title: "أدعية القرآن الكريم",
        desc: "دعاء الأنبياء والراسخين في العلم المذكور بنص آيات الذكر الحكيم",
        icon: <BookOpen className="w-6 h-6 text-emerald-500" />,
        badge: "من كتاب الله",
        color: "from-emerald-500/10 to-teal-500/5",
      },
      {
        id: "prophetic_duas",
        title: "أدعية السنة النبوية الشريفة",
        desc: "الأدعية الجامعة المأثورة عن رسول الله ﷺ في الصباح والمساء والأحوال",
        icon: <Heart className="w-6 h-6 text-amber-500" />,
        badge: "سنة نبوية صحيحة",
        color: "from-amber-500/10 to-yellow-500/5",
      },
      {
        id: "prophets_duas",
        title: "أدعية الأنبياء والمرسلين",
        desc: "مناجاة يونس، أيوب، زكريا، إبراهيم، موسى، ويوسف عليهم الصلاة والسلام",
        icon: <Compass className="w-6 h-6 text-blue-500" />,
        badge: "استجابة فورية",
        color: "from-blue-500/10 to-cyan-500/5",
      },
      {
        id: "quran_completion_duas",
        title: "دعاء ختم القرآن الكريم",
        desc: "الدعاء المبارك والمأثور المستحب عند تمام تلاوة كتاب الله تعالى",
        icon: <Sparkles className="w-6 h-6 text-purple-500" />,
        badge: "مستجاب ببركة الختم",
        color: "from-purple-500/10 to-pink-500/5",
      },
      {
        id: "all",
        title: "الموسوعة الجامعة لكافة الأدعية",
        desc: "تصفح كامل لكافة الأدعية القرآنية والنبوية مع عداد التكرار والسبحة",
        icon: <Layers className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
        badge: "شامل ومفهرس",
        color: "from-emerald-500/15 to-emerald-600/5",
      },
      {
        id: "favorites",
        title: "الأدعية المفضلة والمحفوظة",
        desc: "أدعيتك المختارة التي قمت بحفظها للرجوع والتكرار المستمر",
        icon: <Bookmark className="w-6 h-6 text-rose-500" />,
        badge: "مختاراتك الخاصة",
        color: "from-rose-500/10 to-orange-500/5",
      },
    ];

    return (
      <div id="duas-sections-hub" className="space-y-6">
        {/* Search Bar across all Duas */}
        <div className={`rounded-2xl sm:rounded-3xl p-4 sm:p-5 border ${styles.cardBg} ${styles.cardBorder} ${styles.cardShadow}`}>
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h3 className={`text-sm sm:text-base font-bold font-alexandria ${styles.titleText}`}>
                البحث المباشر في نصوص الأدعية
              </h3>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold">
              مع التكرار الصوتي
            </span>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                setActiveCategory("all");
              }
            }}
            className="relative"
          >
            <Search className={`w-4 h-4 absolute right-3.5 top-3.5 ${styles.mutedText}`} />
            <input
              type="text"
              placeholder="ابحث بكلمة من الدعاء... (مثل: ربنا آتنا، لا إله إلا أنت، الفرج، الشفاء)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full border rounded-2xl pr-10 pl-24 py-3 text-xs sm:text-sm focus:outline-none ${styles.inputBg} ${styles.inputBorder} ${styles.inputText}`}
            />
            <button
              type="submit"
              onClick={() => {
                if (searchQuery.trim()) setActiveCategory("all");
              }}
              className={`absolute left-2 top-2 px-4 py-1.5 rounded-xl text-xs font-bold transition ${styles.btnPrimary}`}
            >
              بحث
            </button>
          </form>
        </div>

        {/* SECTION: DUAS LIBRARIES & DEPARTMENTS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ScrollText className="w-5 h-5 text-emerald-500" />
              <h3 className={`text-base sm:text-lg font-bold font-alexandria ${styles.titleText}`}>
                أبواب ومكتبات الأدعية المأثورة
              </h3>
            </div>
            <span className={`text-xs ${styles.mutedText}`}>
              اختر القسم للاستعراض والتكرار
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {mainSections.map((sec) => {
              const count = getCategoryCount(sec.id);
              return (
                <button
                  key={sec.id}
                  onClick={() => handleOpenCategory(sec.id)}
                  className={`group p-5 rounded-2xl sm:rounded-3xl border text-right transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-98 flex flex-col justify-between cursor-pointer ${styles.cardBg} ${styles.cardBorder} hover:border-emerald-500/50 relative overflow-hidden`}
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${sec.color} rounded-full blur-2xl opacity-50 pointer-events-none`} />

                  <div className="space-y-2 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-xs ${styles.badgeBg} ${styles.badgeBorder}`}>
                        {sec.icon}
                      </div>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                        {sec.badge}
                      </span>
                    </div>

                    <h4 className={`text-base font-bold font-alexandria transition group-hover:text-emerald-500 ${styles.titleText}`}>
                      {sec.title}
                    </h4>

                    <p className={`text-xs leading-relaxed ${styles.mutedText}`}>
                      {sec.desc}
                    </p>
                  </div>

                  <div className={`mt-4 pt-3 border-t flex items-center justify-between relative z-10 ${styles.innerBorder}`}>
                    <div className="flex items-center gap-1.5 font-mono text-xs">
                      <span className="font-bold text-emerald-500">{count}</span>
                      <span className={styles.mutedText}>دعاء مبارك</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-[-4px] transition-transform">
                      <span>فتح القسم</span>
                      <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: ACTIVE CATEGORY DUAS VIEW (With Repetition counter and Audio loops)
  // =========================================================================
  const activeTitle =
    activeCategory === "favorites"
      ? "الأدعية المفضلة والمحفوظة"
      : activeCategory === "all"
      ? "الموسوعة الجامعة لكافة الأدعية"
      : DUA_CATEGORIES.find((c) => c.key === activeCategory)?.nameAr || "قسم الأدعية";

  return (
    <div id="duas-list-view" className="space-y-4 sm:space-y-6">
      {/* Top Header with Return Button */}
      <div className={`rounded-2xl sm:rounded-3xl p-4 sm:p-5 border transition-all ${styles.cardBg} ${styles.cardBorder} ${styles.cardShadow}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={handleReturnToCategoriesHub}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition border shrink-0 ${styles.btnPrimary}`}
              title="الرجوع لأقسام الأدعية"
            >
              <ArrowRight className="w-4 h-4" />
              <span>أقسام الأدعية</span>
            </button>

            <div>
              <h2 className={`text-base sm:text-lg font-bold font-alexandria ${styles.titleText}`}>
                {activeTitle}
              </h2>
              <p className={`text-xs ${styles.mutedText}`}>
                {filteredDuas.length} دعاء متوفر مع التكرار والسبحة
              </p>
            </div>
          </div>

          {/* Search within this category */}
          <div className="w-full sm:w-72 relative">
            <Search className={`w-4 h-4 absolute right-3 top-2.5 ${styles.mutedText}`} />
            <input
              type="text"
              placeholder="تصفية الأدعية..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full border rounded-xl pr-9 pl-3 py-1.5 text-xs focus:outline-none ${styles.inputBg} ${styles.inputBorder} ${styles.inputText}`}
            />
          </div>
        </div>

        {/* Quick category filter chips */}
        <div className="mt-3.5 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: "all", name: "الكل" },
            { id: "quran_duas", name: "أدعية قرآنية" },
            { id: "prophetic_duas", name: "أدعية نبوية" },
            { id: "prophets_duas", name: "أدعية الأنبياء" },
            { id: "quran_completion_duas", name: "ختم القرآن" },
            { id: "favorites", name: "المفضلة" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleOpenCategory(cat.id)}
              className={`px-3 py-1 rounded-xl text-xs whitespace-nowrap transition-all border ${
                activeCategory === cat.id
                  ? `${styles.badgeBg} ${styles.badgeBorder} ${styles.badgeText} font-bold shadow-sm`
                  : `${styles.innerBg} ${styles.innerBorder} ${styles.mutedText} hover:${styles.bodyText}`
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className={`rounded-3xl p-12 text-center space-y-3 border ${styles.cardBg} ${styles.cardBorder}`}>
          <Sparkles className="w-8 h-8 mx-auto text-amber-500 animate-spin" />
          <p className={`text-sm font-semibold ${styles.titleText}`}>
            جارٍ تجهيز الأدعية القرآنية والنبوية...
          </p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredDuas.length === 0 && (
        <div className={`rounded-3xl p-10 text-center space-y-3 border ${styles.cardBg} ${styles.cardBorder}`}>
          <Heart className={`w-8 h-8 mx-auto ${styles.mutedText}`} />
          <h4 className={`text-base font-bold ${styles.titleText}`}>
            لم يتم العثور على أدعية في هذا القسم
          </h4>
          <p className={`text-xs ${styles.mutedText}`}>
            جرّب تغيير كلمات البحث أو الرجوع للأقسام الرئيسية.
          </p>
          <button
            onClick={handleReturnToCategoriesHub}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold ${styles.btnPrimary}`}
          >
            الرجوع لأقسام الأدعية
          </button>
        </div>
      )}

      {/* Duas Cards Grid */}
      {!isLoading && filteredDuas.length > 0 && (
        <div className="space-y-3.5">
          {filteredDuas.map((dua) => {
            const isPlaying = activeAudioDuaId === dua.id;
            const isCopied = copiedId === dua.id;
            const isFav = favorites.includes(dua.id);
            const count = duaCounts[dua.id] || 0;
            const target = targetCounts[dua.id] || dua.count || 1;
            const isCompleted = count >= target;

            return (
              <div
                key={dua.id}
                className={`rounded-2xl sm:rounded-3xl p-4 sm:p-6 border transition-all space-y-4 relative ${
                  isCompleted
                    ? "border-emerald-500/50 bg-emerald-500/5"
                    : `${styles.cardBg} ${styles.cardBorder} ${styles.cardShadow}`
                }`}
              >
                {/* Top Meta Bar */}
                <div className={`flex flex-wrap items-center justify-between gap-2 border-b pb-3 ${styles.innerBorder}`}>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border ${styles.badgeBg} ${styles.badgeText} ${styles.badgeBorder}`}>
                      {dua.categoryNameAr}
                    </span>
                    {dua.sourceNote && (
                      <span className={`text-xs ${styles.mutedText}`}>
                        {dua.sourceNote}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Favorite Bookmark */}
                    <button
                      onClick={() => toggleFavorite(dua.id)}
                      className={`p-1.5 rounded-xl border transition ${
                        isFav
                          ? "bg-rose-500/10 text-rose-500 border-rose-500/30"
                          : `${styles.btnSecondary} ${styles.mutedText}`
                      }`}
                      title={isFav ? "إزالة من المفضلة" : "حفظ في المفضلة"}
                    >
                      {isFav ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    </button>

                    {/* Copy */}
                    <button
                      onClick={() => handleCopy(dua)}
                      className={`p-1.5 rounded-xl border transition ${
                        isCopied ? "bg-emerald-600 text-white border-emerald-600" : styles.btnSecondary
                      }`}
                      title="نسخ الدعاء"
                    >
                      {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>

                    {/* Share */}
                    <button
                      onClick={() => handleShare(dua)}
                      className={`p-1.5 rounded-xl border transition ${styles.btnSecondary}`}
                      title="مشاركة الدعاء"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Dua Arabic Text */}
                <p
                  className={`text-base sm:text-xl leading-loose font-['Amiri',serif] text-justify font-normal ${styles.titleText}`}
                  dir="rtl"
                >
                  {dua.text}
                </p>

                {/* Bottom Interactive Tasbih Counter & Audio Loops */}
                <div className={`pt-3 border-t flex flex-wrap items-center justify-between gap-3 ${styles.innerBorder}`}>
                  {/* Left: Audio Repetition Engine */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startAudioRepetition(dua, target)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                        isPlaying ? "bg-amber-500 text-slate-950 border-amber-400 animate-pulse" : styles.btnSecondary
                      }`}
                      title={isPlaying ? "إيقاف التكرار الصوتي" : `بدء التكرار الصوتي (${target} مرات)`}
                    >
                      {isPlaying ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5" />
                          <span>إيقاف ({currentAudioLoop}/{targetAudioLoop})</span>
                        </>
                      ) : (
                        <>
                          <Repeat className="w-3.5 h-3.5" />
                          <span>تكرار صوتي ({target})</span>
                        </>
                      )}
                    </button>

                    {/* Quick Loop Target Selector */}
                    <div className="hidden sm:flex items-center gap-1 text-[10px]">
                      {[1, 3, 7, 33].map((num) => (
                        <button
                          key={num}
                          onClick={() => handleSetTarget(dua.id, num)}
                          className={`px-1.5 py-0.5 rounded-md border font-mono transition ${
                            target === num
                              ? "bg-emerald-500 text-white border-emerald-500 font-bold"
                              : `${styles.innerBg} ${styles.innerBorder} ${styles.mutedText}`
                          }`}
                        >
                          {num}×
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Right: Manual Bead Tasbih Counter */}
                  <div className="flex items-center gap-2">
                    {count > 0 && (
                      <button
                        onClick={() => handleResetCount(dua.id)}
                        className={`p-1.5 rounded-xl border text-xs transition ${styles.btnSecondary}`}
                        title="تصفير العداد"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => handleIncrement(dua)}
                      className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 border ${
                        isCompleted
                          ? "bg-emerald-600 text-white border-emerald-500 shadow-md"
                          : styles.btnPrimary
                      }`}
                    >
                      <span>تكرار السبحة</span>
                      <span className="font-mono bg-black/20 px-2 py-0.5 rounded-lg text-xs">
                        {count} / {target}
                      </span>
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
