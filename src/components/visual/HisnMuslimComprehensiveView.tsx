import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Shield,
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Search,
  CheckCircle2,
  RotateCcw,
  Copy,
  Check,
  Star,
  Sparkles,
  BookOpen,
  Filter,
  Layers,
  Compass,
  Sun,
  Moon,
  Home,
  Utensils,
  HeartPulse,
  CloudRain,
  RefreshCw,
  Share2,
} from "lucide-react";
import {
  HISN_CHAPTERS,
  HISN_ATHKAR_LIST,
  HisnItem,
  HisnChapter,
} from "../../data/hisnMuslimData";
import { ThemeMode } from "../../types";
import { getThemeStyles } from "../../utils/themeClasses";
import { speechEngine } from "../../utils/speechEngine";
import { soundEngine } from "../../utils/soundEngine";
import { hapticEngine } from "../../utils/hapticEngine";

interface Props {
  theme?: ThemeMode;
  initialChapterId?: string;
}

export const HisnMuslimComprehensiveView: React.FC<Props> = ({
  theme = "natural",
  initialChapterId = "all",
}) => {
  const styles = getThemeStyles(theme);

  const [selectedChapter, setSelectedChapter] = useState<string>(initialChapterId);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeThikrId, setActiveThikrId] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [audioSpeed, setAudioSpeed] = useState<number>(1.0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState<boolean>(false);

  // Repetition progress map
  const [countsMap, setCountsMap] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem("noor_hisn_counts");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Favorites list
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("noor_hisn_favorites");
      return saved ? JSON.parse(saved) : ["hisn_me_1", "hisn_me_2", "hisn_ws_1"];
    } catch {
      return ["hisn_me_1", "hisn_me_2", "hisn_ws_1"];
    }
  });

  // Continuous auto-play mode
  const [isContinuousPlay, setIsContinuousPlay] = useState<boolean>(false);
  const isContinuousPlayRef = useRef<boolean>(false);
  isContinuousPlayRef.current = isContinuousPlay;

  const currentThikrIndexRef = useRef<number>(0);

  // Persist counts
  useEffect(() => {
    try {
      localStorage.setItem("noor_hisn_counts", JSON.stringify(countsMap));
    } catch {}
  }, [countsMap]);

  // Persist favorites
  useEffect(() => {
    try {
      localStorage.setItem("noor_hisn_favorites", JSON.stringify(favoriteIds));
    } catch {}
  }, [favoriteIds]);

  // Listen to global voice assistant triggers
  useEffect(() => {
    const handleVoiceCommand = (e: any) => {
      const detail = e.detail;
      if (!detail) return;
      if (detail.chapterId) {
        setSelectedChapter(detail.chapterId);
      }
      if (detail.thikrId) {
        const item = HISN_ATHKAR_LIST.find((t) => t.id === detail.thikrId);
        if (item) {
          playThikrAudio(item);
        }
      }
    };

    window.addEventListener("noor-open-hisn-chapter", handleVoiceCommand);
    return () => {
      window.removeEventListener("noor-open-hisn-chapter", handleVoiceCommand);
      speechEngine.stop();
    };
  }, []);

  // Filtered items
  const filteredItems = useMemo(() => {
    let items = HISN_ATHKAR_LIST;

    if (selectedChapter !== "all") {
      items = items.filter((item) => item.chapterId === selectedChapter);
    }

    if (showOnlyFavorites) {
      items = items.filter((item) => favoriteIds.includes(item.id));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      items = items.filter(
        (item) =>
          item.text.toLowerCase().includes(q) ||
          item.chapterTitle.toLowerCase().includes(q) ||
          item.virtue.toLowerCase().includes(q) ||
          item.reference.toLowerCase().includes(q)
      );
    }

    return items;
  }, [selectedChapter, showOnlyFavorites, favoriteIds, searchQuery]);

  // Play audio for a specific thikr
  const playThikrAudio = (item: HisnItem, isSequential = false) => {
    soundEngine.playTasbihClick();
    setActiveThikrId(item.id);
    setIsPlayingAudio(true);

    const index = filteredItems.findIndex((t) => t.id === item.id);
    if (index !== -1) {
      currentThikrIndexRef.current = index;
    }

    speechEngine.stop();
    speechEngine.speak(item.text, {
      immediate: true,
      rate: audioSpeed,
      onEnd: () => {
        // If continuous playback is on, advance to next thikr
        if (isContinuousPlayRef.current) {
          const nextIndex = currentThikrIndexRef.current + 1;
          if (nextIndex < filteredItems.length) {
            currentThikrIndexRef.current = nextIndex;
            const nextItem = filteredItems[nextIndex];
            setTimeout(() => {
              playThikrAudio(nextItem, true);
            }, 800);
            return;
          }
        }
        setIsPlayingAudio(false);
      },
    });
  };

  const stopAudio = () => {
    speechEngine.stop();
    setIsPlayingAudio(false);
    setIsContinuousPlay(false);
    soundEngine.playTasbihClick();
  };

  const handleNextThikr = () => {
    if (filteredItems.length === 0) return;
    const nextIdx = (currentThikrIndexRef.current + 1) % filteredItems.length;
    currentThikrIndexRef.current = nextIdx;
    playThikrAudio(filteredItems[nextIdx]);
  };

  const handlePrevThikr = () => {
    if (filteredItems.length === 0) return;
    const prevIdx = (currentThikrIndexRef.current - 1 + filteredItems.length) % filteredItems.length;
    currentThikrIndexRef.current = prevIdx;
    playThikrAudio(filteredItems[prevIdx]);
  };

  const toggleContinuousPlay = () => {
    soundEngine.playTasbihClick();
    if (isContinuousPlay) {
      stopAudio();
    } else {
      setIsContinuousPlay(true);
      const startItem = filteredItems[currentThikrIndexRef.current] || filteredItems[0];
      if (startItem) {
        playThikrAudio(startItem, true);
      }
    }
  };

  const handleIncrementCount = (id: string, maxRepeat: number) => {
    hapticEngine.trigger("tasbih_tick");
    soundEngine.playTasbihClick();
    setCountsMap((prev) => {
      const current = prev[id] || 0;
      const next = current >= maxRepeat ? 0 : current + 1;
      if (next === maxRepeat) {
        hapticEngine.trigger("tasbih_complete");
        soundEngine.playGestureSuccess();
      }
      return { ...prev, [id]: next };
    });
  };

  const handleResetCount = (id: string) => {
    soundEngine.playTasbihClick();
    setCountsMap((prev) => ({ ...prev, [id]: 0 }));
  };

  const toggleFavorite = (id: string) => {
    soundEngine.playTasbihClick();
    setFavoriteIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCopy = (item: HisnItem) => {
    soundEngine.playTasbihClick();
    const copyText = `${item.text}\n\n[${item.chapterTitle} - ${item.reference}]\nفضل الذكر: ${item.virtue}\nتكرار: ${item.repeat} مرات\nعبر تطبيق النور الإسلامي`;
    navigator.clipboard.writeText(copyText);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Render appropriate category icon
  const getChapterIcon = (iconName: string) => {
    switch (iconName) {
      case "sun":
        return <Sun className="w-4 h-4 text-amber-500" />;
      case "moon":
        return <Moon className="w-4 h-4 text-indigo-400" />;
      case "sparkles":
        return <Sparkles className="w-4 h-4 text-emerald-400" />;
      case "home":
        return <Home className="w-4 h-4 text-orange-400" />;
      case "utensils":
        return <Utensils className="w-4 h-4 text-rose-400" />;
      case "compass":
        return <Compass className="w-4 h-4 text-sky-400" />;
      case "heart-pulse":
        return <HeartPulse className="w-4 h-4 text-red-400" />;
      case "cloud-rain":
        return <CloudRain className="w-4 h-4 text-cyan-400" />;
      case "refresh-cw":
        return <RefreshCw className="w-4 h-4 text-teal-400" />;
      default:
        return <BookOpen className="w-4 h-4 text-emerald-500" />;
    }
  };

  return (
    <div id="hisn-muslim-section" className="space-y-6 pb-20 animate-fadeIn text-right">
      {/* Hero Header Banner */}
      <div
        className={`rounded-2xl sm:rounded-3xl p-5 sm:p-7 border relative overflow-hidden transition-all ${styles.cardBg} ${styles.cardBorder} ${styles.cardShadow}`}
      >
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 border ${styles.badgeBg} ${styles.badgeBorder} text-emerald-500 shadow-md`}
            >
              <Shield className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  حصن المسلم من أذكار الكتاب والسنة
                </span>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  مصحوبة بالقراءة الصوتية الفورية
                </span>
              </div>
              <h1 className={`text-xl sm:text-2xl font-bold tracking-tight font-alexandria ${styles.titleText}`}>
                حصن المسلم الصوتي الجامع
              </h1>
              <p className={`text-xs sm:text-sm max-w-2xl leading-relaxed ${styles.mutedText}`}>
                جميع أبواب الأذكار والأدعية النبوية الصحيحة، محققة ومشكولة بالكامل مع ميزة الاستماع الصوتي الفوري والتكرار التلقائي.
              </p>
            </div>
          </div>

          {/* Quick Stats & Favorites Filter */}
          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
            <button
              onClick={() => {
                soundEngine.playTasbihClick();
                setShowOnlyFavorites(!showOnlyFavorites);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-2 cursor-pointer shadow-sm ${
                showOnlyFavorites
                  ? "bg-amber-500 text-white border-amber-600 shadow-amber-500/20"
                  : `${styles.btnSecondary}`
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${showOnlyFavorites ? "fill-white" : "text-amber-500"}`} />
              <span>المفضلة ({favoriteIds.length})</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playTasbihClick();
                setCountsMap({});
                speechEngine.speak("تم تصفير جميع عدادات التكرار");
              }}
              className={`p-2 rounded-xl border transition cursor-pointer ${styles.btnSecondary}`}
              title="تصفير كل العدادات"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating / Sticky Audio Control Bar */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          isPlayingAudio
            ? "border-emerald-500/50 bg-gradient-to-r from-emerald-950/20 via-zinc-900/60 to-teal-950/20 shadow-lg shadow-emerald-500/10"
            : `${styles.cardBg} ${styles.cardBorder}`
        }`}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Currently Playing Status */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                isPlayingAudio
                  ? "bg-emerald-500 text-black border-emerald-400 animate-pulse shadow-md"
                  : "bg-zinc-800 text-zinc-400 border-zinc-700"
              }`}
            >
              {isPlayingAudio ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </div>
            <div className="text-right">
              <span className="text-[11px] font-bold text-emerald-500 block">
                {isPlayingAudio
                  ? isContinuousPlay
                    ? "القراءة الصوتية المتتابعة نشطة..."
                    : "جارٍ قراءة الذكر صوتياً..."
                  : "المقرئ الصوتي لحصن المسلم"}
              </span>
              <span className={`text-xs font-medium truncate block max-w-xs sm:max-w-sm ${styles.titleText}`}>
                {activeThikrId
                  ? HISN_ATHKAR_LIST.find((t) => t.id === activeThikrId)?.text.slice(0, 50) + "..."
                  : "اختر ذكراً للاستماع أو فعّل القراءة المتتابعة"}
              </span>
            </div>
          </div>

          {/* Audio Controls */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
            <button
              onClick={handlePrevThikr}
              className={`p-2 rounded-xl border transition cursor-pointer ${styles.btnSecondary}`}
              title="الذكر السابق"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <button
              onClick={toggleContinuousPlay}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-2 cursor-pointer shadow-md ${
                isPlayingAudio
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500"
                  : "bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold border-emerald-400"
              }`}
            >
              {isPlayingAudio ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>إيقاف القراءة</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>قراءة متتابعة</span>
                </>
              )}
            </button>

            <button
              onClick={handleNextThikr}
              className={`p-2 rounded-xl border transition cursor-pointer ${styles.btnSecondary}`}
              title="الذكر التالي"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            {/* Speed selector */}
            <div className="flex items-center gap-1 bg-black/10 dark:bg-white/10 rounded-xl p-1 border border-white/5">
              {[0.8, 1.0, 1.25].map((speed) => (
                <button
                  key={speed}
                  onClick={() => {
                    soundEngine.playTasbihClick();
                    setAudioSpeed(speed);
                  }}
                  className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition ${
                    audioSpeed === speed
                      ? "bg-emerald-500 text-black shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Search & Category Navigation */}
      <div className="space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث في نصوص الأذكار، الأبواب، الفضل، أو المصدر الصحيح..."
            className={`w-full py-3.5 pr-11 pl-4 rounded-2xl border text-xs sm:text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${styles.innerBg} ${styles.innerBorder} ${styles.titleText}`}
          />
          <Search className="w-4 h-4 absolute top-4 right-4 text-zinc-400" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute top-3.5 left-4 text-xs text-zinc-400 hover:text-white cursor-pointer"
            >
              إلغاء
            </button>
          )}
        </div>

        {/* Chapter Selection Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {HISN_CHAPTERS.map((ch) => {
            const isSelected = selectedChapter === ch.id && !showOnlyFavorites;
            return (
              <button
                key={ch.id}
                onClick={() => {
                  soundEngine.playTasbihClick();
                  setShowOnlyFavorites(false);
                  setSelectedChapter(ch.id);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer active:scale-95 ${
                  isSelected
                    ? "bg-emerald-600 text-white shadow-md border border-emerald-500"
                    : `${styles.innerBg} ${styles.innerBorder} border text-zinc-400 hover:text-zinc-200`
                }`}
              >
                {getChapterIcon(ch.iconName)}
                <span>{ch.title}</span>
                <span className="text-[10px] opacity-70">({ch.itemsCount})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Adhkar Cards List */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div
            className={`p-10 rounded-2xl border text-center space-y-3 ${styles.cardBg} ${styles.cardBorder}`}
          >
            <Shield className="w-10 h-10 mx-auto text-zinc-500 opacity-50" />
            <h3 className={`text-base font-bold ${styles.titleText}`}>لم يتم العثور على أذكار</h3>
            <p className={`text-xs max-w-sm mx-auto ${styles.mutedText}`}>
              جرب تغيير كلمة البحث أو اختيار باب آخر من أبواب حصن المسلم.
            </p>
          </div>
        ) : (
          filteredItems.map((thikr, index) => {
            const count = countsMap[thikr.id] || 0;
            const isCompleted = count >= thikr.repeat;
            const isThisPlaying = isPlayingAudio && activeThikrId === thikr.id;
            const isFav = favoriteIds.includes(thikr.id);

            return (
              <div
                key={thikr.id}
                id={`hisn-item-${thikr.id}`}
                className={`rounded-2xl sm:rounded-3xl p-5 sm:p-6 border transition-all relative overflow-hidden ${
                  isThisPlaying
                    ? "border-emerald-500/80 bg-emerald-500/5 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500/40"
                    : isCompleted
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : `${styles.cardBg} ${styles.cardBorder} hover:border-emerald-500/30`
                }`}
              >
                {/* Top Card Bar: Chapter Tag, Repeat Badge & Action Icons */}
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-black/5 dark:border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      {thikr.chapterTitle}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      #{index + 1}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Favorite Button */}
                    <button
                      onClick={() => toggleFavorite(thikr.id)}
                      className={`p-1.5 rounded-lg border transition cursor-pointer ${styles.btnSecondary}`}
                      title="إضافة للمفضلة"
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          isFav ? "fill-amber-400 text-amber-400" : "text-zinc-400"
                        }`}
                      />
                    </button>

                    {/* Copy Button */}
                    <button
                      onClick={() => handleCopy(thikr)}
                      className={`p-1.5 rounded-lg border transition cursor-pointer ${styles.btnSecondary}`}
                      title="نسخ الذكر"
                    >
                      {copiedId === thikr.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-zinc-400" />
                      )}
                    </button>

                    {/* Voice Read Button for this specific thikr */}
                    <button
                      onClick={() => {
                        if (isThisPlaying) {
                          stopAudio();
                        } else {
                          playThikrAudio(thikr);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
                        isThisPlaying
                          ? "bg-emerald-600 text-white border-emerald-500"
                          : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                      }`}
                    >
                      {isThisPlaying ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5" />
                          <span>إيقاف</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>قراءة صوتية</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Main Thikr Text (Fully Vocalized) */}
                <div className="py-4">
                  <p
                    className={`text-base sm:text-lg md:text-xl font-semibold leading-loose font-amiri tracking-wide ${styles.titleText}`}
                  >
                    {thikr.text}
                  </p>
                </div>

                {/* Virtue & Reference Box */}
                <div className="space-y-2 pt-2 pb-4">
                  {thikr.virtue && (
                    <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 leading-relaxed flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span>{thikr.virtue}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>المصدر: {thikr.reference}</span>
                  </div>
                </div>

                {/* Bottom Interactive Repeat Bar & Counter */}
                <div className="pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500">التكرار المسنون:</span>
                    <span className="font-mono font-bold text-xs bg-black/10 dark:bg-white/10 px-2 py-0.5 rounded-lg">
                      {thikr.repeat} {thikr.repeat === 1 ? "مرة واحدة" : "مرات"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {count > 0 && (
                      <button
                        onClick={() => handleResetCount(thikr.id)}
                        className={`p-2 rounded-xl border transition cursor-pointer ${styles.btnSecondary}`}
                        title="إعادة ضبط العداد"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => handleIncrementCount(thikr.id, thikr.repeat)}
                      className={`px-4 sm:px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm border transition flex items-center gap-2.5 cursor-pointer shadow-md active:scale-95 ${
                        isCompleted
                          ? "bg-emerald-600 text-white border-emerald-500"
                          : "bg-emerald-500 hover:bg-emerald-600 text-black border-emerald-400 font-extrabold"
                      }`}
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>اكتمل الذكر ({count}/{thikr.repeat})</span>
                        </>
                      ) : (
                        <>
                          <span className="font-mono text-base">{count}</span>
                          <span>/ {thikr.repeat}</span>
                          <span className="pr-1 text-xs">اضغط للعد</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
