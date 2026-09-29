import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  BookOpen,
  ChevronRight,
  ChevronLeft,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Bookmark,
  Sun,
  Moon,
  Feather,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Headphones,
  Search,
  List,
  Layers,
  FileText,
  Share2,
  Copy,
  Check,
  CheckCircle2,
  Sliders,
  ChevronDown,
  SkipForward,
  SkipBack,
  Disc,
  Eye,
} from "lucide-react";
import { quranPagesService } from "../../services/quranPagesService";
import {
  ALL_JUZ_LIST,
  getJuzForPage,
  formatPageCode,
  getSurahStartPage,
  JuzItem,
} from "../../data/quranPagesData";
import { SURAH_LIST } from "../../data/quranData";
import { SurahMeta } from "../../types";
import {
  quranApiService,
  ApiReciterItem,
  FAMOUS_RECITERS,
  ApiQuranPageTextResponse,
  ApiPageAyahDetail,
} from "../../services/quranApiService";
import {
  quranAyahAudioService,
  QURAN_RECITERS,
  QuranAudioReciter,
  PageAyah,
} from "../../services/quranAyahAudioService";
import { audioCoordinator } from "../../services/mp3QuranService";
import { soundEngine } from "../../utils/soundEngine";
import { speechEngine } from "../../utils/speechEngine";
import { ThemeMode } from "../../types";
import { getThemeStyles } from "../../utils/themeClasses";

export type MushafTheme = "natural" | "paper" | "night" | "light" | "sepia" | "high_contrast_yellow";

interface Props {
  initialPage?: number;
  initialTheme?: ThemeMode;
  onPageChange?: (page: number) => void;
}

export const MushafPageViewer: React.FC<Props> = ({
  initialPage = 1,
  initialTheme = "natural",
  onPageChange,
}) => {
  // Page number (1..604)
  const [currentPage, setCurrentPage] = useState<number>(() => {
    const saved = localStorage.getItem("noor_quran_current_page");
    return saved ? parseInt(saved) || initialPage : initialPage;
  });

  // Saved bookmark
  const [bookmarkPage, setBookmarkPage] = useState<number | null>(() => {
    const saved = localStorage.getItem("noor_quran_bookmark");
    return saved ? parseInt(saved) || null : null;
  });

  // Themes
  const [mushafTheme, setMushafTheme] = useState<MushafTheme>(
    initialTheme === "paper" ? "paper" : initialTheme === "night" ? "night" : initialTheme === "light" ? "light" : "natural"
  );
  const styles = getThemeStyles(
    mushafTheme === "sepia" ? "paper" : mushafTheme === "high_contrast_yellow" ? "night" : (mushafTheme as ThemeMode)
  );

  // Display mode: "image" (High-Res 604 from yousefheiba API) | "text" (Ayah Text)
  const [displayMode, setDisplayMode] = useState<"image" | "text">("image");

  // Zoom level for image
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reciter & Audio Playback
  const [reciters, setReciters] = useState<ApiReciterItem[]>(FAMOUS_RECITERS);
  const [selectedReciter, setSelectedReciter] = useState<ApiReciterItem>(FAMOUS_RECITERS[0]);
  const [selectedEveryAyahReciter, setSelectedEveryAyahReciter] = useState<QuranAudioReciter>(QURAN_RECITERS[0]);
  const [isRecitersModalOpen, setIsRecitersModalOpen] = useState<boolean>(false);
  const [reciterSearch, setReciterSearch] = useState<string>("");

  // Surah & Ayah Selection and Start Point
  const [isSurahModalOpen, setIsSurahModalOpen] = useState<boolean>(false);
  const [surahSearch, setSurahSearch] = useState<string>("");
  const [selectedSurah, setSelectedSurah] = useState<SurahMeta>(SURAH_LIST[0]);
  const [selectedAyahNum, setSelectedAyahNum] = useState<number>(1);
  const [isAyahPickerOpen, setIsAyahPickerOpen] = useState<boolean>(false);

  // Audio Mode & Active Ayah State
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioMode, setAudioMode] = useState<"ayah" | "surah">("ayah");
  const [activeAyah, setActiveAyah] = useState<PageAyah | null>(null);
  const [pageAyahs, setPageAyahs] = useState<PageAyah[]>([]);
  const [isPageAyahsLoading, setIsPageAyahsLoading] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Page image loading state & fallback mirrors
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [mirrorIndex, setMirrorIndex] = useState<number>(0);

  // Page text data
  const [pageTextData, setPageTextData] = useState<ApiQuranPageTextResponse | null>(null);
  const [isPageTextLoading, setIsPageTextLoading] = useState<boolean>(false);

  // Jump to page input
  const [inputPage, setInputPage] = useState<string>(String(currentPage));

  // Load all 604 pages catalog in background
  useEffect(() => {
    quranPagesService.loadAllPages();
    quranApiService.getReciters().then((list) => {
      if (list && list.length > 0) setReciters(list);
    });
  }, []);

  // Update page and prefetch
  const goToPage = (newPage: number) => {
    const clamped = Math.max(1, Math.min(604, newPage));
    soundEngine.playTasbihClick();
    setCurrentPage(clamped);
    setInputPage(String(clamped));
    setImageLoaded(false);
    setMirrorIndex(0);
    localStorage.setItem("noor_quran_current_page", String(clamped));
    if (onPageChange) onPageChange(clamped);
    quranPagesService.prefetchAdjacentPages(clamped);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // In RTL: Right arrow moves to next page (forward), Left arrow moves to prev page
      if (e.key === "ArrowRight") {
        if (currentPage < 604) goToPage(currentPage + 1);
      } else if (e.key === "ArrowLeft") {
        if (currentPage > 1) goToPage(currentPage - 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage]);

  // Sync current page with Juz and Surah
  const currentJuz = useMemo(() => getJuzForPage(currentPage), [currentPage]);

  // Surahs on current page
  const pageSurah = useMemo(() => {
    const s = SURAH_LIST.find((item) => {
      const start = item.startPage || getSurahStartPage(item.number);
      const nextStart =
        item.number < 114
          ? SURAH_LIST[item.number]?.startPage || getSurahStartPage(item.number + 1)
          : 605;
      return currentPage >= start && currentPage < nextStart;
    });
    return s || selectedSurah;
  }, [currentPage, selectedSurah]);

  // Fetch page text if in text mode
  useEffect(() => {
    if (displayMode === "text") {
      setIsPageTextLoading(true);
      quranApiService.getQuranPageText(currentPage).then((data) => {
        setPageTextData(data);
        setIsPageTextLoading(false);
      });
    }
  }, [currentPage, displayMode]);

  // Load and cache Ayahs for current page for precise audio syncing
  useEffect(() => {
    let isCurrent = true;
    setIsPageAyahsLoading(true);
    quranAyahAudioService.getPageAyahs(currentPage).then((list) => {
      if (isCurrent) {
        setPageAyahs(list);
        setIsPageAyahsLoading(false);
        // If current activeAyah is not on this page, set to the first ayah of this page
        if (list.length > 0) {
          setActiveAyah((prev) => {
            if (prev && list.some((a) => a.number === prev.number)) {
              return prev;
            }
            return list[0];
          });
        }
      }
    });
    // Prefetch adjacent pages in background
    quranAyahAudioService.prefetchAdjacent(currentPage);
    return () => {
      isCurrent = false;
    };
  }, [currentPage]);

  // Current page image URL using official endpoint
  const pageMirrors = useMemo(() => {
    return quranPagesService.getPageMirrors(currentPage);
  }, [currentPage]);

  const currentImageUrl = pageMirrors[mirrorIndex] || pageMirrors[0];

  const handleImageError = () => {
    if (mirrorIndex < pageMirrors.length - 1) {
      setMirrorIndex((idx) => idx + 1);
    }
  };

  // Bookmark actions
  const toggleBookmark = () => {
    soundEngine.playTasbihClick();
    if (bookmarkPage === currentPage) {
      setBookmarkPage(null);
      localStorage.removeItem("noor_quran_bookmark");
      speechEngine.speak("تمت إزالة علامة القراءة");
    } else {
      setBookmarkPage(currentPage);
      localStorage.setItem("noor_quran_bookmark", String(currentPage));
      speechEngine.speak(`تم حفظ علامة القراءة عند صفحة ${currentPage}`);
    }
  };

  const jumpToBookmark = () => {
    if (bookmarkPage) {
      goToPage(bookmarkPage);
    }
  };

  // Audio Playback & Reciter Linking
  const playAyahAudio = (ayah: PageAyah, autoplay: boolean = true) => {
    if (!audioRef.current) return;
    setActiveAyah(ayah);
    setSelectedAyahNum(ayah.numberInSurah);
    audioCoordinator.startPlayback("quran", audioRef.current);
    const ayahUrl = quranAyahAudioService.getAyahAudioUrl(
      selectedEveryAyahReciter,
      ayah.surahNumber,
      ayah.numberInSurah
    );
    audioRef.current.src = ayahUrl;
    audioRef.current.playbackRate = playbackSpeed;
    if (autoplay) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.warn("Audio autoplay blocked or failed, retrying fallback:", err);
        if (audioRef.current) {
          audioRef.current.src = quranAyahAudioService.getAyahSecondaryAudioUrl(
            selectedEveryAyahReciter,
            ayah.number,
            ayah.surahNumber,
            ayah.numberInSurah
          );
          audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
        }
      });
    }
  };

  const togglePlayAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      audioCoordinator.stopPlayback("quran");
    } else {
      audioCoordinator.startPlayback("quran", audioRef.current);
      if (audioMode === "ayah") {
        const targetAyah = activeAyah || pageAyahs[0];
        if (targetAyah) {
          playAyahAudio(targetAyah, true);
        } else {
          // Fallback to surah mode if page ayahs not yet loaded
          const audioUrl = quranApiService.getSurahAudioUrl(
            selectedReciter.reciter_short_name,
            pageSurah.number
          );
          audioRef.current.src = audioUrl;
          audioRef.current.playbackRate = playbackSpeed;
          audioRef.current.play().catch(() => {});
          setIsPlaying(true);
        }
      } else {
        // Whole Surah Mode
        const audioUrl = quranApiService.getSurahAudioUrl(
          selectedReciter.reciter_short_name,
          pageSurah.number
        );
        if (!audioRef.current.src || !audioRef.current.src.includes(selectedReciter.reciter_short_name)) {
          audioRef.current.src = audioUrl;
        }
        audioRef.current.playbackRate = playbackSpeed;
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }
  };

  const playNextAyah = () => {
    soundEngine.playTasbihClick();
    if (!pageAyahs || pageAyahs.length === 0) return;
    const currentIndex = activeAyah
      ? pageAyahs.findIndex((a) => a.number === activeAyah.number)
      : -1;

    if (currentIndex >= 0 && currentIndex < pageAyahs.length - 1) {
      // Next Ayah on this page
      playAyahAudio(pageAyahs[currentIndex + 1], true);
    } else if (currentPage < 604) {
      // Transition to next page & play first Ayah of next page
      const nextPageNum = currentPage + 1;
      goToPage(nextPageNum);
      quranAyahAudioService.getPageAyahs(nextPageNum).then((nextList) => {
        if (nextList.length > 0) {
          playAyahAudio(nextList[0], true);
        }
      });
    } else {
      setIsPlaying(false);
    }
  };

  const playPrevAyah = () => {
    soundEngine.playTasbihClick();
    if (!pageAyahs || pageAyahs.length === 0) return;
    const currentIndex = activeAyah
      ? pageAyahs.findIndex((a) => a.number === activeAyah.number)
      : -1;

    if (currentIndex > 0) {
      // Previous Ayah on this page
      playAyahAudio(pageAyahs[currentIndex - 1], true);
    } else if (currentPage > 1) {
      // Transition to previous page & play last Ayah
      const prevPageNum = currentPage - 1;
      goToPage(prevPageNum);
      quranAyahAudioService.getPageAyahs(prevPageNum).then((prevList) => {
        if (prevList.length > 0) {
          playAyahAudio(prevList[prevList.length - 1], true);
        }
      });
    }
  };

  const handleSelectReciter = (r: ApiReciterItem) => {
    soundEngine.playTasbihClick();
    setSelectedReciter(r);
    // Find matching EveryAyah CDN reciter if available
    const matchedEveryAyah = QURAN_RECITERS.find(
      (ea) =>
        ea.id.includes(r.reciter_short_name) ||
        r.reciter_short_name.includes(ea.id) ||
        r.reciter_name.includes(ea.name.split(" ")[0])
    ) || QURAN_RECITERS[0];
    setSelectedEveryAyahReciter(matchedEveryAyah);

    setIsRecitersModalOpen(false);
    if (audioRef.current) {
      const wasPlaying = isPlaying;
      if (audioMode === "ayah" && activeAyah) {
        playAyahAudio(activeAyah, wasPlaying);
      } else {
        audioRef.current.src = quranApiService.getSurahAudioUrl(r.reciter_short_name, pageSurah.number);
        audioRef.current.playbackRate = playbackSpeed;
        if (wasPlaying) {
          audioRef.current.play().catch(() => {});
        }
      }
    }
    speechEngine.speak(`تم اختيار القارئ الشيخ ${r.reciter_name}`);
  };

  const handleSelectEveryAyahReciter = (reciter: QuranAudioReciter) => {
    soundEngine.playTasbihClick();
    setSelectedEveryAyahReciter(reciter);
    // Sync with ApiReciterItem
    const matchedApi = reciters.find((api) => api.reciter_name.includes(reciter.name.split(" ")[0])) || reciters[0];
    setSelectedReciter(matchedApi);
    setIsRecitersModalOpen(false);

    if (audioRef.current) {
      const wasPlaying = isPlaying;
      if (activeAyah) {
        playAyahAudio(activeAyah, wasPlaying);
      }
    }
    speechEngine.speak(`تم اختيار القارئ الشيخ ${reciter.name}`);
  };

  const handleSelectSurahAndAyah = (surah: SurahMeta, ayahNum: number = 1) => {
    soundEngine.playTasbihClick();
    setSelectedSurah(surah);
    setSelectedAyahNum(ayahNum);
    setIsSurahModalOpen(false);

    // Jump to surah start page
    const sPage = surah.startPage || getSurahStartPage(surah.number);
    goToPage(sPage);

    // Load ayahs for this page and locate target ayah
    quranAyahAudioService.getPageAyahs(sPage).then((list) => {
      const target = list.find(
        (a) => a.surahNumber === surah.number && a.numberInSurah === ayahNum
      ) || list[0];
      if (target) {
        playAyahAudio(target, true);
      }
    });

    speechEngine.speak(`سورة ${surah.nameAr}، الآية ${ayahNum}`);
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    soundEngine.playTasbihClick();
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Audio Seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setCurrentTime(val);
    if (audioRef.current) audioRef.current.currentTime = val;
  };

  const formatAudioTime = (sec: number) => {
    if (isNaN(sec)) return "00:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Filtered reciters
  const filteredReciters = useMemo(() => {
    if (!reciterSearch.trim()) return reciters;
    const q = reciterSearch.trim().toLowerCase();
    return reciters.filter((r) => r.reciter_name.toLowerCase().includes(q));
  }, [reciters, reciterSearch]);

  // Filtered surahs
  const filteredSurahs = useMemo(() => {
    if (!surahSearch.trim()) return SURAH_LIST;
    const q = surahSearch.trim().toLowerCase();
    return SURAH_LIST.filter(
      (s) =>
        s.nameAr.includes(q) ||
        s.nameEn.toLowerCase().includes(q) ||
        String(s.number).includes(q)
    );
  }, [surahSearch]);

  return (
    <div
      ref={containerRef}
      id="mushaf-page-viewer-root"
      className={`space-y-4 sm:space-y-5 select-none transition-colors duration-300 ${
        isFullscreen ? "p-4 bg-[#061A14] min-h-screen overflow-y-auto" : ""
      }`}
    >
      {/* Hidden Audio Player Element */}
      <audio
        ref={audioRef}
        onTimeUpdate={() => {
          if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) setDuration(audioRef.current.duration);
        }}
        onEnded={() => {
          if (audioMode === "ayah") {
            playNextAyah();
          } else {
            setIsPlaying(false);
            // Auto advance to next surah
            const nextNum = (pageSurah.number % 114) + 1;
            const nextS = SURAH_LIST.find((s) => s.number === nextNum);
            if (nextS) handleSelectSurahAndAyah(nextS, 1);
          }
        }}
        onError={() => {
          console.warn("Audio element error, attempting to move to next or recover");
        }}
      />

      {/* ========================================================================= */}
      {/* 1. TOP READING TOOLS & THEMES BAR (فوق كل صفحة مصحف) */}
      {/* ========================================================================= */}
      <div
        id="mushaf-reading-toolbar"
        className={`p-3 sm:p-4 rounded-2xl sm:rounded-3xl border shadow-xs transition-all ${
          mushafTheme === "high_contrast_yellow"
            ? "bg-black border-yellow-500/60 text-yellow-300 shadow-[0_0_20px_rgba(250,204,21,0.15)]"
            : mushafTheme === "paper"
            ? "bg-[#FAF5EB] border-[#D4AF37]/35 text-[#3D2817]"
            : mushafTheme === "night"
            ? "bg-slate-900/95 border-slate-800 text-white"
            : mushafTheme === "sepia"
            ? "bg-[#F4EEDD] border-[#C49A45]/40 text-[#2C1810]"
            : mushafTheme === "light"
            ? "bg-white border-amber-200 text-slate-900"
            : `${styles.cardBg} ${styles.cardBorder}`
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Section A: Reading Themes (ثيمات مختلفة للقراءة) */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 pl-1">
              المظهر:
            </span>

            <button
              onClick={() => {
                soundEngine.playTasbihClick();
                setMushafTheme("high_contrast_yellow");
                speechEngine.speakEgyptian(
                  "تم تفعيل نمط القراءة الليلية الخاص بالبصيرة: أصفر فاتح على أسود فاحم مع حجب تام للضوء الأزرق لراحة العين."
                );
              }}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1 ${
                mushafTheme === "high_contrast_yellow"
                  ? "bg-yellow-400 text-black border-yellow-500 shadow-[0_0_12px_rgba(250,204,21,0.4)]"
                  : "bg-black/90 text-yellow-400 border-yellow-500/50 hover:bg-black"
              }`}
              title="القراءة الليلية الخاصة بوضع البصيرة: أصفر فاتح على أسود مع حجب الضوء الأزرق لراحة العين"
            >
              <Eye className="w-3.5 h-3.5 text-yellow-400" />
              <span>ليلي بصيرة (أصفر/أسود)</span>
            </button>

            <button
              onClick={() => setMushafTheme("natural")}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1 ${
                mushafTheme === "natural"
                  ? "bg-emerald-600 text-white border-emerald-700 shadow-xs"
                  : styles.btnSecondary
              }`}
              title="طبيعي زمردي"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>طبيعي</span>
            </button>

            <button
              onClick={() => setMushafTheme("paper")}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1 ${
                mushafTheme === "paper"
                  ? "bg-[#C49A45] text-white border-[#A88030] shadow-xs"
                  : styles.btnSecondary
              }`}
              title="ورقي تراثي يحاكي أوراق المصاحف القديمة"
            >
              <Feather className="w-3.5 h-3.5" />
              <span>ورقي</span>
            </button>

            <button
              onClick={() => setMushafTheme("sepia")}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1 ${
                mushafTheme === "sepia"
                  ? "bg-[#8B5A2B] text-white border-[#68401C] shadow-xs"
                  : styles.btnSecondary
              }`}
              title="ورق عتيق دافئ"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>عتيق</span>
            </button>

            <button
              onClick={() => setMushafTheme("night")}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1 ${
                mushafTheme === "night"
                  ? "bg-slate-800 text-white border-slate-700 shadow-xs"
                  : styles.btnSecondary
              }`}
              title="ليلي خافت للقراءة في الظلام"
            >
              <Moon className="w-3.5 h-3.5 text-amber-400" />
              <span>ليلي</span>
            </button>

            <button
              onClick={() => setMushafTheme("light")}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1 ${
                mushafTheme === "light"
                  ? "bg-amber-600 text-white border-amber-700 shadow-xs"
                  : styles.btnSecondary
              }`}
              title="فاتح ناصع عالي التباين"
            >
              <Sun className="w-3.5 h-3.5" />
              <span>فاتح</span>
            </button>
          </div>

          {/* Section B: Reciter Selector & Surah/Ayah Chooser */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Choose Reciter Button (استعراض للقراء) */}
            <button
              onClick={() => setIsRecitersModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 transition"
              title="استعراض واختيار القارئ"
            >
              <Headphones className="w-3.5 h-3.5" />
              <span className="max-w-[130px] truncate">{selectedReciter.reciter_name}</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {/* Choose Surah & Ayah Button (تحديد سورة أو آية) */}
            <button
              onClick={() => setIsSurahModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 transition"
              title="فهرس السور واختيار الآية"
            >
              <List className="w-3.5 h-3.5" />
              <span>سورة {pageSurah.nameAr}</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {/* Quick Ayah Start Point Selector Button (تحديد من أين يبدأ التلاوة بالصفحة) */}
            <button
              onClick={() => setIsAyahPickerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-teal-500/10 hover:bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-500/30 transition"
              title="تحديد آية البداية في هذه الصفحة"
            >
              <Disc className="w-3.5 h-3.5" />
              <span>
                {activeAyah
                  ? `الآية ${activeAyah.numberInSurah}`
                  : `آيات ص ${currentPage}`}
              </span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {/* View Mode Toggle: صورة المصحف 604 | نص الصفحة */}
            <div className={`flex items-center p-0.5 rounded-xl border ${styles.innerBg} ${styles.innerBorder}`}>
              <button
                onClick={() => setDisplayMode("image")}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition ${
                  displayMode === "image"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-500 dark:text-zinc-400 hover:text-emerald-500"
                }`}
                title="عرض مصحف المدينة عالي الدقة (604 صفحة)"
              >
                صورة المصحف
              </button>
              <button
                onClick={() => setDisplayMode("text")}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition ${
                  displayMode === "text"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-500 dark:text-zinc-400 hover:text-emerald-500"
                }`}
                title="عرض نص الآيات مع أرقامها وتفاصيلها"
              >
                نص الصفحة
              </button>
            </div>
          </div>

          {/* Section C: Reading Tools (Zoom, Bookmark, Fullscreen) */}
          <div className="flex items-center gap-1.5">
            {displayMode === "image" && (
              <>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(1.5, z + 0.1))}
                  className={`p-1.5 rounded-xl border transition ${styles.btnSecondary}`}
                  title="تكبير الصفحة"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.1))}
                  className={`p-1.5 rounded-xl border transition ${styles.btnSecondary}`}
                  title="تصغير الصفحة"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            {/* Bookmark button */}
            <button
              onClick={toggleBookmark}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition ${
                bookmarkPage === currentPage
                  ? "bg-[#D4AF37] text-white border-[#B38F24] shadow-xs"
                  : styles.btnSecondary
              }`}
              title={bookmarkPage === currentPage ? "إزالة العلامة" : "حفظ علامة القراءة"}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span className="hidden md:inline">علامة</span>
            </button>

            {bookmarkPage && bookmarkPage !== currentPage && (
              <button
                onClick={jumpToBookmark}
                className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 transition hover:scale-105"
                title={`الانتقال إلى العلامة المحفوظة (صفحة ${bookmarkPage})`}
              >
                ص {bookmarkPage}
              </button>
            )}

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className={`p-1.5 rounded-xl border transition ${styles.btnSecondary}`}
              title={isFullscreen ? "إنهاء ملء الشاشة" : "ملء الشاشة للقراءة المريحة"}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Audio Player Strip Attached to Toolbar */}
        <div className="mt-3 pt-3 border-t border-black/5 dark:border-white/5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* Previous Ayah Button */}
            <button
              onClick={playPrevAyah}
              className={`p-2 rounded-xl border transition ${styles.btnSecondary}`}
              title="الآية السابقة"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>

            {/* Play/Pause Button */}
            <button
              onClick={togglePlayAudio}
              className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-xs active:scale-95 transition"
              title={isPlaying ? "إيقاف مؤقت" : "تشغيل التلاوة"}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>

            {/* Next Ayah Button */}
            <button
              onClick={playNextAyah}
              className={`p-2 rounded-xl border transition ${styles.btnSecondary}`}
              title="الآية التالية"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>

            <div className="flex flex-col">
              <span className="text-xs font-bold flex items-center gap-1.5">
                <span>
                  {audioMode === "ayah" && activeAyah
                    ? `آية (${activeAyah.numberInSurah}) • سورة ${activeAyah.surahNameAr || pageSurah.nameAr}`
                    : `سورة ${pageSurah.nameAr}`}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  {selectedEveryAyahReciter?.name || selectedReciter.reciter_name}
                </span>
              </span>
              <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">
                {formatAudioTime(currentTime)} / {formatAudioTime(duration)}
                {audioMode === "ayah" && activeAyah && ` • صفحة ${activeAyah.page}`}
              </span>
            </div>
          </div>

          {/* Audio Range Seeker */}
          <div className="flex-1 min-w-[140px] max-w-xs sm:max-w-md flex items-center gap-2">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full accent-emerald-500 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-1.5">
            {/* Audio Mode Toggle (تلاوة آية تلو آية vs سورة كاملة) */}
            <div className={`flex items-center p-0.5 rounded-xl border ${styles.innerBg} ${styles.innerBorder}`}>
              <button
                onClick={() => setAudioMode("ayah")}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                  audioMode === "ayah"
                    ? "bg-teal-600 text-white shadow-xs"
                    : "text-slate-500 hover:text-teal-600"
                }`}
                title="تلاوة حسب الآيات مع التحديد والتنقل الدقيق"
              >
                بالآية
              </button>
              <button
                onClick={() => setAudioMode("surah")}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                  audioMode === "surah"
                    ? "bg-teal-600 text-white shadow-xs"
                    : "text-slate-500 hover:text-teal-600"
                }`}
                title="تلاوة السورة كاملة متواصلة"
              >
                السورة
              </button>
            </div>

            {/* Speed toggle */}
            <button
              onClick={() => {
                const next = playbackSpeed === 1 ? 1.25 : playbackSpeed === 1.25 ? 0.75 : 1;
                setPlaybackSpeed(next);
                if (audioRef.current) audioRef.current.playbackRate = next;
              }}
              className="px-2 py-1 rounded-lg text-[10px] font-mono font-bold bg-slate-500/10 hover:bg-slate-500/20 text-slate-700 dark:text-slate-300 border border-slate-500/20"
              title="تغيير سرعة التلاوة"
            >
              {playbackSpeed}x
            </button>

            {/* Mute */}
            <button
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.muted = !isMuted;
                  setIsMuted(!isMuted);
                }
              }}
              className="p-1.5 rounded-lg border border-slate-500/20 hover:bg-slate-500/10 text-slate-600 dark:text-slate-300"
              title={isMuted ? "إلغاء الكتم" : "كتم"}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. PAGE NAVIGATION BAR (صفحة X من 604 مع الأزرار والشريط) */}
      {/* ========================================================================= */}
      <div
        id="mushaf-page-navigation"
        className={`p-3 rounded-2xl border flex flex-wrap items-center justify-between gap-3 ${
          mushafTheme === "paper"
            ? "bg-[#FAF5EB] border-[#D4AF37]/35"
            : mushafTheme === "sepia"
            ? "bg-[#F4EEDD] border-[#C49A45]/40"
            : mushafTheme === "night"
            ? "bg-slate-900 border-slate-800"
            : `${styles.innerBg} ${styles.innerBorder}`
        }`}
      >
        {/* Next / Prev Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= 604}
            className={`p-2 rounded-xl border transition disabled:opacity-30 ${styles.btnSecondary}`}
            title="الصفحة التالية (الزر الأيمن أو سهم لوحة المفاتيح)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              صفحة
            </span>
            <input
              type="number"
              min={1}
              max={604}
              value={inputPage}
              onChange={(e) => setInputPage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const p = parseInt(inputPage);
                  if (!isNaN(p)) goToPage(p);
                }
              }}
              className="w-14 text-center font-mono font-bold text-xs px-2 py-1 rounded-lg border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
            />
            <span className="text-xs text-slate-500 dark:text-zinc-400">
              من ٦٠٤
            </span>
          </div>

          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className={`p-2 rounded-xl border transition disabled:opacity-30 ${styles.btnSecondary}`}
            title="الصفحة السابقة (الزر الأيسر أو سهم لوحة المفاتيح)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Current Juz & Surah Badges */}
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            {currentJuz.nameAr}
          </span>
          <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            سورة {pageSurah.nameAr} ({pageSurah.type === "meccan" ? "مكية" : "مدنية"})
          </span>
        </div>

        {/* Page Slider for rapid scrolling */}
        <div className="w-full sm:w-auto sm:flex-1 max-w-xs flex items-center gap-2">
          <input
            type="range"
            min={1}
            max={604}
            value={currentPage}
            onChange={(e) => goToPage(Number(e.target.value))}
            className="w-full accent-emerald-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN MUSHAF PAGE CANVAS (صور صفحات المصحف 604 من API) */}
      {/* ========================================================================= */}
      <div
        id="mushaf-page-canvas-container"
        className={`relative rounded-2xl sm:rounded-3xl border shadow-lg overflow-hidden flex flex-col items-center justify-center min-h-[500px] sm:min-h-[720px] transition-all p-2 sm:p-6 ${
          mushafTheme === "high_contrast_yellow"
            ? "bg-black border-yellow-500/50 shadow-[0_0_30px_rgba(0,0,0,0.9)] text-yellow-300"
            : mushafTheme === "paper"
            ? "bg-[#FAF5EB] border-[#D4AF37]/50 shadow-[#D4AF37]/10"
            : mushafTheme === "sepia"
            ? "bg-[#F4EEDD] border-[#C49A45]/60 shadow-[#C49A45]/15"
            : mushafTheme === "night"
            ? "bg-[#090D14] border-slate-800 shadow-black/40"
            : mushafTheme === "light"
            ? "bg-[#FCFCFD] border-slate-200 shadow-slate-200/50"
            : "bg-[#04140F] border-emerald-900/60 shadow-emerald-950/20"
        }`}
      >
        {/* Blue Light Protection & High Contrast Indicator */}
        {mushafTheme === "high_contrast_yellow" && (
          <div className="w-full mb-3 px-4 py-2 rounded-xl bg-yellow-950/70 border border-yellow-500/50 flex flex-wrap items-center justify-between text-yellow-300 text-xs font-bold gap-2">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-yellow-400 shrink-0" />
              <span>وضع القراءة الليلية للبصيرة: تباين فائق (أصفر فاتح على أسود فاحم)</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-yellow-400 text-black font-bold">
              حماية العين وحجب الضوء الأزرق 🌙
            </span>
          </div>
        )}

        {/* Bookmark ribbon indicator on page corner */}
        {bookmarkPage === currentPage && (
          <div className="absolute top-0 left-6 z-20">
            <div className="bg-gradient-to-b from-[#D4AF37] to-[#B38F24] text-white px-2.5 py-4 rounded-b-xl shadow-md font-bold text-[11px] flex flex-col items-center">
              <Bookmark className="w-4 h-4 fill-current mb-0.5" />
              <span>علامة</span>
            </div>
          </div>
        )}

        {/* DISPLAY MODE 1: IMAGE FROM https://quran.yousefheiba.com/api/quranPagesImage */}
        {displayMode === "image" && (
          <div
            className="w-full flex justify-center items-center overflow-auto transition-transform duration-200"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {/* Loading spinner */}
            {!imageLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/10 backdrop-blur-xs">
                <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
                <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">
                  جاري تحميل صفحة المصحف {currentPage}...
                </span>
              </div>
            )}

            {/* High Resolution Page Image */}
            <img
              src={currentImageUrl}
              alt={`مصحف المدينة - صفحة ${currentPage}`}
              onLoad={() => setImageLoaded(true)}
              onError={handleImageError}
              className={`max-w-full max-h-[85vh] w-auto h-auto object-contain rounded-xl transition-opacity duration-300 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              } ${
                mushafTheme === "night"
                  ? "invert hue-rotate-180 brightness-90 contrast-110 drop-shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                  : mushafTheme === "paper" || mushafTheme === "sepia"
                  ? "mix-blend-multiply contrast-105"
                  : ""
              }`}
              style={{
                filter:
                  mushafTheme === "high_contrast_yellow"
                    ? "invert(1) hue-rotate(180deg) sepia(1) saturate(8) hue-rotate(15deg) contrast(1.3) brightness(0.95)"
                    : mushafTheme === "sepia"
                    ? "sepia(0.2) contrast(1.05)"
                    : undefined,
              }}
            />
          </div>
        )}

        {/* DISPLAY MODE 2: INTERACTIVE PAGE TEXT WITH SURAH & AYAHS */}
        {displayMode === "text" && (
          <div className="w-full max-w-3xl px-4 py-8 space-y-6">
            {isPageTextLoading ? (
              <div className="text-center py-20">
                <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs font-bold text-slate-500">جاري جلب نص الآيات الشريفة...</p>
              </div>
            ) : pageTextData?.data?.ayahs ? (
              <div className="space-y-6">
                {/* Surah Banner Header */}
                <div
                  className={`text-center p-4 rounded-2xl border ${
                    mushafTheme === "high_contrast_yellow"
                      ? "bg-yellow-950/60 border-yellow-500/60 text-yellow-300"
                      : "bg-gradient-to-r from-emerald-600/15 via-[#D4AF37]/15 to-emerald-600/15 border border-[#D4AF37]/30"
                  }`}
                >
                  <h3 className="text-xl font-bold font-['Amiri',serif]">
                    سورة {pageSurah.nameAr}
                  </h3>
                  <p
                    className={`text-xs mt-1 ${
                      mushafTheme === "high_contrast_yellow"
                        ? "text-yellow-400"
                        : "text-slate-500 dark:text-zinc-400"
                    }`}
                  >
                    {currentJuz.nameAr} • صفحة {currentPage}
                  </p>
                </div>

                {/* Ayahs text paragraphs */}
                <div className="leading-[2.8] text-justify font-['Amiri',serif] text-xl sm:text-2xl px-2">
                  {pageTextData.data.ayahs.map((ayah) => {
                    const isCurrentActive = activeAyah && activeAyah.number === ayah.number;
                    return (
                      <span
                        key={ayah.number}
                        className={`p-1.5 rounded-xl transition inline cursor-pointer ${
                          isCurrentActive
                            ? mushafTheme === "high_contrast_yellow"
                              ? "bg-yellow-400 text-black ring-2 ring-yellow-400 font-bold"
                              : "bg-emerald-500/25 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/40 font-bold"
                            : mushafTheme === "high_contrast_yellow"
                            ? "text-yellow-300 hover:bg-yellow-500/20"
                            : "hover:bg-emerald-500/10"
                        }`}
                        onClick={() => {
                          soundEngine.playTasbihClick();
                          // Find matching PageAyah object
                          const matchedPageAyah: PageAyah = {
                            number: ayah.number,
                            numberInSurah: ayah.numberInSurah,
                            text: ayah.text,
                            surahNumber: pageSurah.number,
                            surahNameAr: pageSurah.nameAr,
                            page: currentPage,
                            juz: currentJuz.number,
                          };
                          playAyahAudio(matchedPageAyah, true);
                          speechEngine.speak(`الآية ${ayah.numberInSurah} بصوت الشيخ ${selectedEveryAyahReciter.name}`);
                        }}
                        title={`اضغط للبدء بتلاوة الآية ${ayah.numberInSurah} بصوت ${selectedEveryAyahReciter.name}`}
                      >
                        {ayah.text}{" "}
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 mx-1 rounded-full text-xs font-bold font-mono border align-middle transition ${
                            isCurrentActive
                              ? mushafTheme === "high_contrast_yellow"
                                ? "bg-black text-yellow-300 border-black scale-110 shadow-xs"
                                : "bg-emerald-600 text-white border-emerald-600 scale-110 shadow-xs"
                              : mushafTheme === "high_contrast_yellow"
                              ? "border-yellow-400 text-yellow-300 bg-yellow-950/60"
                              : "border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                          }`}
                        >
                          {ayah.numberInSurah}
                        </span>{" "}
                      </span>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-base font-bold">عرض صفحة المصحف الشريف</p>
                <p className="text-xs text-slate-500 mt-1">
                  يمكنك التبديل إلى "صورة المصحف" للاطلاع على نسخة مجمع الملك فهد عالية الجودة.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Page Footer Navigation Hints */}
        <div className="w-full mt-4 pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= 604}
            className="hover:text-emerald-500 font-bold transition flex items-center gap-1"
          >
            <span>التالية</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <span className="font-mono text-[11px]">
            {currentPage} / 604
          </span>

          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="hover:text-emerald-500 font-bold transition flex items-center gap-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>السابقة</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. MODAL: RECITERS BROWSER (استعراض للقراء) */}
      {/* ========================================================================= */}
      {isRecitersModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
          onClick={() => setIsRecitersModalOpen(false)}
        >
          <div
            className={`w-full max-w-2xl max-h-[85vh] rounded-3xl border shadow-2xl p-6 overflow-hidden flex flex-col ${
              styles.cardBg
            } ${styles.cardBorder}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-lg font-black ${styles.titleText}`}>
                    استعراض القراء والتلاوات
                  </h3>
                  <p className={`text-xs ${styles.mutedText}`}>
                    اختر القارئ المفضل لديك للاستماع لآيات وسور القرآن الكريم
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsRecitersModalOpen(false)}
                className={`p-2 rounded-xl border ${styles.btnSecondary}`}
              >
                ✕
              </button>
            </div>

            {/* Reciter Search */}
            <div className="py-4">
              <div className="relative">
                <Search className={`absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${styles.mutedText}`} />
                <input
                  type="text"
                  value={reciterSearch}
                  onChange={(e) => setReciterSearch(e.target.value)}
                  placeholder="ابحث باسم الشيخ القارئ (مثل: العفاسي، عبد الباسط، المعيقلي)..."
                  className={`w-full pr-10 pl-4 py-2.5 rounded-2xl border text-xs sm:text-sm font-medium focus:outline-hidden ${
                    styles.innerBg
                  } ${styles.innerBorder} ${styles.titleText}`}
                />
              </div>
            </div>

            {/* Reciters List with EveryAyah and Famous Reciters */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-2">
              <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 px-1 py-1">
                القراء المتاحون للتلاوة آية تلو آية وسور كاملة ({QURAN_RECITERS.length} قارئ):
              </div>
              {QURAN_RECITERS.filter((ea) =>
                ea.name.toLowerCase().includes(reciterSearch.trim().toLowerCase())
              ).map((eaReciter) => {
                const isSelected = selectedEveryAyahReciter.id === eaReciter.id;
                return (
                  <div
                    key={eaReciter.id}
                    onClick={() => handleSelectEveryAyahReciter(eaReciter)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "bg-emerald-600/15 border-emerald-500 text-emerald-600 dark:text-emerald-400"
                        : `${styles.innerBg} ${styles.innerBorder} hover:border-emerald-500/40`
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                        {eaReciter.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold">
                          {eaReciter.name}
                        </h4>
                        <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">
                          {eaReciter.subname || eaReciter.everyAyahFolder}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-500">
                        <Check className="w-4 h-4" />
                        <span>محدد</span>
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL: AYAH START POINT PICKER (تحديد من أين يبدأ في الصفحة) */}
      {/* ========================================================================= */}
      {isAyahPickerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
          onClick={() => setIsAyahPickerOpen(false)}
        >
          <div
            className={`w-full max-w-2xl max-h-[85vh] rounded-3xl border shadow-2xl p-6 overflow-hidden flex flex-col ${
              styles.cardBg
            } ${styles.cardBorder}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                  <Disc className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-lg font-black ${styles.titleText}`}>
                    تحديد من أين يبدأ في صفحة {currentPage}
                  </h3>
                  <p className={`text-xs ${styles.mutedText}`}>
                    اختر الآية التي ترغب بأن يبدأ الشيخ {selectedEveryAyahReciter.name} التلاوة منها
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAyahPickerOpen(false)}
                className={`p-2 rounded-xl border ${styles.btnSecondary}`}
              >
                ✕
              </button>
            </div>

            {/* Quick action bar */}
            <div className="py-3 flex items-center justify-between gap-2">
              <span className="text-xs text-slate-500 font-bold">
                آيات صفحة {currentPage} ({pageAyahs.length} آية)
              </span>
              {pageAyahs.length > 0 && (
                <button
                  onClick={() => {
                    playAyahAudio(pageAyahs[0], true);
                    setIsAyahPickerOpen(false);
                  }}
                  className="px-3 py-1 rounded-xl text-xs font-bold bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/30"
                >
                  البدء من أول الصفحة (آية {pageAyahs[0].numberInSurah})
                </button>
              )}
            </div>

            {/* Page Ayahs list */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-2.5">
              {isPageAyahsLoading ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs text-slate-500">جاري تحميل آيات الصفحة...</p>
                </div>
              ) : pageAyahs.length > 0 ? (
                pageAyahs.map((ayah) => {
                  const isActive = activeAyah && activeAyah.number === ayah.number;
                  return (
                    <div
                      key={ayah.number}
                      onClick={() => {
                        soundEngine.playTasbihClick();
                        playAyahAudio(ayah, true);
                        setIsAyahPickerOpen(false);
                        speechEngine.speak(`بدء التلاوة من الآية ${ayah.numberInSurah} بسورة ${ayah.surahNameAr || pageSurah.nameAr}`);
                      }}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                        isActive
                          ? "bg-teal-500/15 border-teal-500 text-teal-800 dark:text-teal-300 shadow-xs"
                          : `${styles.innerBg} ${styles.innerBorder} hover:border-teal-500/40`
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`w-8 h-8 rounded-xl font-mono text-xs font-bold flex items-center justify-center shrink-0 border mt-0.5 ${
                            isActive
                              ? "bg-teal-600 text-white border-teal-600"
                              : "bg-teal-500/10 text-teal-600 border-teal-500/20"
                          }`}
                        >
                          {ayah.numberInSurah}
                        </span>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-teal-700 dark:text-teal-400">
                              سورة {ayah.surahNameAr || pageSurah.nameAr}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              (آية {ayah.numberInSurah})
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm font-['Amiri',serif] leading-relaxed line-clamp-2">
                            {ayah.text}
                          </p>
                        </div>
                      </div>

                      <button
                        className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          isActive
                            ? "bg-teal-600 text-white shadow-xs"
                            : "bg-teal-500/10 hover:bg-teal-500/20 text-teal-700 dark:text-teal-300"
                        }`}
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>{isActive ? "يقرأ الآن" : "ابدأ من هنا"}</span>
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10">
                  <p className="text-xs text-slate-500">لا توجد آيات محملة لهذه الصفحة حالياً.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL: SURAH & AYAH PICKER (تحديد سورة أو آية ومقرئ) */}
      {/* ========================================================================= */}
      {isSurahModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
          onClick={() => setIsSurahModalOpen(false)}
        >
          <div
            className={`w-full max-w-2xl max-h-[85vh] rounded-3xl border shadow-2xl p-6 overflow-hidden flex flex-col ${
              styles.cardBg
            } ${styles.cardBorder}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <List className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-lg font-black ${styles.titleText}`}>
                    فهرس سور القرآن الكريم (١١٤ سورة)
                  </h3>
                  <p className={`text-xs ${styles.mutedText}`}>
                    اختر السورة والآية للانتقال المباشر وتفعيل التلاوة
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsSurahModalOpen(false)}
                className={`p-2 rounded-xl border ${styles.btnSecondary}`}
              >
                ✕
              </button>
            </div>

            {/* Surah Search */}
            <div className="py-4">
              <div className="relative">
                <Search className={`absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${styles.mutedText}`} />
                <input
                  type="text"
                  value={surahSearch}
                  onChange={(e) => setSurahSearch(e.target.value)}
                  placeholder="ابحث عن السورة بالاسم أو الرقم (مثل: البقرة، الكهف، 18)..."
                  className={`w-full pr-10 pl-4 py-2.5 rounded-2xl border text-xs sm:text-sm font-medium focus:outline-hidden ${
                    styles.innerBg
                  } ${styles.innerBorder} ${styles.titleText}`}
                />
              </div>
            </div>

            {/* Surahs List */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-2">
              {filteredSurahs.map((s) => {
                const isSelected = selectedSurah.number === s.number;
                return (
                  <div
                    key={s.number}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-400"
                        : `${styles.innerBg} ${styles.innerBorder} hover:border-amber-500/40`
                    }`}
                  >
                    <div
                      className="flex items-center gap-3 cursor-pointer flex-1"
                      onClick={() => handleSelectSurahAndAyah(s, 1)}
                    >
                      <span className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center font-mono text-xs font-bold">
                        {s.number}
                      </span>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold">
                          سورة {s.nameAr}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-zinc-400">
                          <span>{s.type === "meccan" ? "مكية" : "مدنية"}</span>
                          <span>•</span>
                          <span>{s.ayatCount} آية</span>
                          <span>•</span>
                          <span>صفحة {s.startPage}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleSelectSurahAndAyah(s, 1)}
                        className="text-xs font-bold text-amber-600 dark:text-amber-400 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 transition flex items-center gap-1"
                        title="البدء من الآية الأولى"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>من الآية ١</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
