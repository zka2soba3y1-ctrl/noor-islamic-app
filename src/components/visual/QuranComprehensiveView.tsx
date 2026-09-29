import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Search,
  Volume2,
  VolumeX,
  Bookmark,
  Layers,
  FileText,
  Check,
  Headphones,
  RotateCcw,
  Sparkles,
  SkipForward,
  SkipBack,
  ZoomIn,
  ZoomOut,
  Sun,
  Moon,
  Feather,
  Loader2,
  Copy,
  Brain,
} from "lucide-react";
import { SURAH_LIST } from "../../data/quranData";
import { SurahMeta } from "../../types";
import {
  ALL_JUZ_LIST,
  getMushafPageImageUrl,
  getMushafPageImageMirrors,
  getJuzForPage,
  JuzItem,
} from "../../data/quranPagesData";
import {
  quranApiService,
  ApiReciterItem,
  ApiAyahItem,
  ApiPageAyahDetail,
  FAMOUS_RECITERS,
} from "../../services/quranApiService";
import {
  audioCoordinator,
  mp3QuranService,
  VERIFIED_MP3QURAN_RECITERS,
  MP3QuranReciter,
} from "../../services/mp3QuranService";
import { soundEngine } from "../../utils/soundEngine";
import { ThemeMode } from "../../types";
import { getThemeStyles } from "../../utils/themeClasses";
import { MushafPageViewer } from "./MushafPageViewer";
import { QuranSpacedRepetition } from "./QuranSpacedRepetition";

interface Props {
  theme?: ThemeMode;
}

export const QuranComprehensiveView: React.FC<Props> = ({ theme = "natural" }) => {
  const styles = getThemeStyles(theme);
  const { isNatural, isPaper, isNight, isLight } = styles;

  const [quranTab, setQuranTab] = useState<"pages" | "juz" | "surahs" | "memorization">("pages");
  const [selectedSurah, setSelectedSurah] = useState<SurahMeta>(SURAH_LIST[0]);
  const [currentPage, setCurrentPage] = useState<number>(() => {
    const saved = localStorage.getItem("noor_quran_current_page");
    return saved ? parseInt(saved) || 1 : 1;
  });
  const [bookmarkPage, setBookmarkPage] = useState<number | null>(() => {
    const saved = localStorage.getItem("noor_quran_bookmark");
    return saved ? parseInt(saved) || null : null;
  });

  // Reciters state
  const [reciters, setReciters] = useState<ApiReciterItem[]>(FAMOUS_RECITERS);
  const [selectedReciter, setSelectedReciter] = useState<ApiReciterItem>(FAMOUS_RECITERS[0]);
  const [reciterSearch, setReciterSearch] = useState<string>("");

  // Audio Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Ayahs & Tafsir state
  const [ayahsList, setAyahsList] = useState<ApiAyahItem[]>([]);
  const [isLoadingAyahs, setIsLoadingAyahs] = useState<boolean>(false);
  const [selectedAyahTafsir, setSelectedAyahTafsir] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copiedAyahNum, setCopiedAyahNum] = useState<string | null>(null);

  // Page reading display & Text Mode
  const [pageViewMode, setPageViewMode] = useState<"image" | "text">("image");
  const [pageAyahsData, setPageAyahsData] = useState<ApiPageAyahDetail[]>([]);
  const [isLoadingPageText, setIsLoadingPageText] = useState<boolean>(false);
  const [imgLoadError, setImgLoadError] = useState<boolean>(false);
  const [mirrorIndex, setMirrorIndex] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [readingTone, setReadingTone] = useState<"normal" | "night" | "sepia">(() => {
    if (theme === "paper") return "sepia";
    if (theme === "night") return "night";
    return "normal";
  });
  const [isSavedBookmarkAlert, setIsSavedBookmarkAlert] = useState<boolean>(false);

  // Audio collision prevention: listen to global event
  useEffect(() => {
    const handlePauseAll = (e: any) => {
      if (e?.detail?.sender !== "quran" && audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    };
    window.addEventListener("noor-pause-all-audio", handlePauseAll);
    return () => window.removeEventListener("noor-pause-all-audio", handlePauseAll);
  }, []);

  // Fetch page text when pageViewMode is "text"
  useEffect(() => {
    if (pageViewMode === "text") {
      setIsLoadingPageText(true);
      quranApiService.getQuranPageText(currentPage).then((res) => {
        if (res?.data?.ayahs) {
          setPageAyahsData(res.data.ayahs);
        }
        setIsLoadingPageText(false);
      });
    }
  }, [currentPage, pageViewMode]);

  // Load all 230 reciters on mount
  useEffect(() => {
    let isMounted = true;
    quranApiService.getReciters().then((data) => {
      if (isMounted && data.length > 0) {
        setReciters(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch real ayahs when selected surah changes
  useEffect(() => {
    let isMounted = true;
    setIsLoadingAyahs(true);
    quranApiService.getSurahAyahs(selectedSurah.number).then((data) => {
      if (isMounted) {
        setAyahsList(data);
        setIsLoadingAyahs(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [selectedSurah.number]);

  // Save current page
  useEffect(() => {
    localStorage.setItem("noor_quran_current_page", currentPage.toString());
  }, [currentPage]);

  // Keyboard navigation for Quran pages
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (quranTab !== "pages") return;
      if (e.key === "ArrowLeft") {
        if (currentPage < 604) {
          soundEngine.playTasbihClick();
          setCurrentPage((prev) => prev + 1);
          setImgLoadError(false);
          setMirrorIndex(0);
        }
      } else if (e.key === "ArrowRight") {
        if (currentPage > 1) {
          soundEngine.playTasbihClick();
          setCurrentPage((prev) => prev - 1);
          setImgLoadError(false);
          setMirrorIndex(0);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, quranTab]);

  const saveBookmark = () => {
    soundEngine.playTasbihClick();
    setBookmarkPage(currentPage);
    localStorage.setItem("noor_quran_bookmark", currentPage.toString());
    setIsSavedBookmarkAlert(true);
    setTimeout(() => setIsSavedBookmarkAlert(false), 3000);
  };

  const jumpToBookmark = () => {
    if (bookmarkPage) {
      soundEngine.playTasbihClick();
      setCurrentPage(bookmarkPage);
      setImgLoadError(false);
      setMirrorIndex(0);
      setQuranTab("pages");
    }
  };

  const handleSelectSurah = (surah: SurahMeta, startPlay = true) => {
    soundEngine.playTasbihClick();
    setSelectedSurah(surah);
    const surahJuz = ALL_JUZ_LIST.find((j) => j.startSurahNumber === surah.number);
    if (surahJuz) {
      setCurrentPage(surahJuz.startPage);
    }
    if (startPlay && audioRef.current) {
      audioCoordinator.startPlayback("quran", audioRef.current);
      const audioUrl = quranApiService.getSurahAudioUrl(
        selectedReciter.reciter_short_name,
        surah.number
      );
      audioRef.current.src = audioUrl;
      audioRef.current.playbackRate = playbackSpeed;
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      audioCoordinator.stopPlayback("quran");
    } else {
      audioCoordinator.startPlayback("quran", audioRef.current);
      if (!audioRef.current.src || audioRef.current.src === "") {
        audioRef.current.src = quranApiService.getSurahAudioUrl(
          selectedReciter.reciter_short_name,
          selectedSurah.number
        );
      }
      audioRef.current.playbackRate = playbackSpeed;
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleReciterChange = (reciterShortName: string) => {
    const r = reciters.find((item) => item.reciter_short_name === reciterShortName);
    if (r) {
      setSelectedReciter(r);
      if (audioRef.current) {
        const wasPlaying = isPlaying;
        audioRef.current.src = quranApiService.getSurahAudioUrl(r.reciter_short_name, selectedSurah.number);
        audioRef.current.playbackRate = playbackSpeed;
        if (wasPlaying) {
          audioRef.current.play().catch(() => {});
        }
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const skipSeconds = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(audioRef.current.currentTime + seconds, duration));
    }
  };

  const formatAudioTime = (sec: number) => {
    if (isNaN(sec)) return "00:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleCopyAyah = (text: string, num: string) => {
    soundEngine.playTasbihClick();
    navigator.clipboard.writeText(`${text} ﴿${num}﴾ [سورة ${selectedSurah.nameAr}]`);
    setCopiedAyahNum(num);
    setTimeout(() => setCopiedAyahNum(null), 2500);
  };

  const filteredSurahs = SURAH_LIST.filter(
    (s) =>
      s.nameAr.includes(searchQuery.trim()) ||
      s.nameEn.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
      String(s.number).includes(searchQuery.trim())
  );

  const currentJuz = getJuzForPage(currentPage);

  return (
    <div id="comprehensive-quran-view" className="space-y-4 sm:space-y-6 animate-fadeIn">
      {/* Hidden Audio Player */}
      <audio
        ref={audioRef}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration);
          }
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          const nextNum = (selectedSurah.number % 114) + 1;
          const nextSurah = SURAH_LIST.find((s) => s.number === nextNum);
          if (nextSurah) handleSelectSurah(nextSurah, true);
        }}
        onError={() => setIsPlaying(false)}
      />

      {/* Global Quran Audio Player Deck (المشغل الصوتي الشامل لكبار المقرئين) */}
      <div
        className={`rounded-3xl p-4 sm:p-5 border shadow-lg space-y-3 transition-all ${
          styles.cardBg
        } ${styles.cardBorder}`}
      >
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Right: Surah Info and Playing Status */}
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#D4AF37] to-emerald-600 flex items-center justify-center text-white shadow-md shrink-0">
              <Headphones className={`w-6 h-6 ${isPlaying ? "animate-pulse" : ""}`} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">
                  سورة رقم {selectedSurah.number}
                </span>
                <span className={`text-[11px] font-bold ${styles.mutedText}`}>
                  {selectedSurah.revelationType === "Meccan" ? "مكية" : "مدنية"} • {selectedSurah.numberOfAyahs} آية
                </span>
              </div>
              <h3 className={`text-base sm:text-lg font-bold font-alexandria truncate ${styles.titleText}`}>
                سورة {selectedSurah.nameAr}
              </h3>
            </div>
          </div>

          {/* Center: Reciter Selection Dropdown (230 Reciters from official API) */}
          <div className="flex items-center gap-2 w-full lg:w-auto justify-center">
            <span className={`text-xs font-bold whitespace-nowrap ${styles.mutedText}`}>القارئ:</span>
            <select
              value={selectedReciter.reciter_short_name}
              onChange={(e) => handleReciterChange(e.target.value)}
              className={`text-xs font-bold px-3 py-2 rounded-xl border cursor-pointer max-w-[220px] sm:max-w-[260px] truncate ${
                styles.innerBg
              } ${styles.innerBorder} ${styles.titleText}`}
            >
              {reciters.map((r) => (
                <option
                  key={r.reciter_id || r.reciter_short_name}
                  value={r.reciter_short_name}
                  className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  {r.reciter_name}
                </option>
              ))}
            </select>
          </div>

          {/* Left: Playback Controls */}
          <div className="flex items-center gap-2 self-stretch lg:self-auto justify-center">
            <button
              onClick={() => skipSeconds(-10)}
              className={`p-2 rounded-xl border transition ${styles.btnSecondary}`}
              title="تراجع 10 ثواني"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={toggleAudio}
              className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-md active:scale-95 transition"
              title={isPlaying ? "إيقاف مؤقت" : "تشغيل التلاوة"}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>

            <button
              onClick={() => {
                const nextNum = (selectedSurah.number % 114) + 1;
                const nextSurah = SURAH_LIST.find((s) => s.number === nextNum);
                if (nextSurah) handleSelectSurah(nextSurah, true);
              }}
              className={`p-2 rounded-xl border transition ${styles.btnSecondary}`}
              title="السورة التالية"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.muted = !isAudioMuted;
                  setIsAudioMuted(!isAudioMuted);
                }
              }}
              className={`p-2 rounded-xl border transition ${styles.btnSecondary}`}
              title={isAudioMuted ? "إلغاء الكتم" : "كتم"}
            >
              {isAudioMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Audio Seeker Bar & Time Stamps */}
        <div className="space-y-1 pt-1">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-mono ${styles.mutedText}`}>
              {formatAudioTime(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 accent-emerald-500 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
            />
            <span className={`text-[10px] font-mono ${styles.mutedText}`}>
              {formatAudioTime(duration)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Mode Tabs: الصفحات (604 صفحة) | الأجزاء (30 جزء) | فهرس السور والآيات */}
      <div className={`p-1.5 rounded-2xl border flex items-center gap-1 ${styles.innerBg} ${styles.innerBorder}`}>
        <button
          onClick={() => {
            soundEngine.playTasbihClick();
            setQuranTab("pages");
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            quranTab === "pages" ? styles.btnPrimary : styles.btnSecondary
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>مصحف المدينة (604 صفحة)</span>
        </button>

        <button
          onClick={() => {
            soundEngine.playTasbihClick();
            setQuranTab("surahs");
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            quranTab === "surahs" ? styles.btnPrimary : styles.btnSecondary
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>فهرس السور والآيات</span>
        </button>

        <button
          onClick={() => {
            soundEngine.playTasbihClick();
            setQuranTab("juz");
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            quranTab === "juz" ? styles.btnPrimary : styles.btnSecondary
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>الأجزاء (٣٠ جزءاً)</span>
        </button>

        <button
          onClick={() => {
            soundEngine.playTasbihClick();
            setQuranTab("memorization");
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            quranTab === "memorization"
              ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm"
              : styles.btnSecondary
          }`}
        >
          <Brain className="w-3.5 h-3.5 text-amber-300" />
          <span>الحفظ التكراري 🧠</span>
        </button>
      </div>

      {/* VIEW 1: MUSHAF PAGES (604 Pages with Toolbar, Reading Themes, Reciters, and Surah/Ayah Picker) */}
      {quranTab === "pages" && (
        <MushafPageViewer
          initialPage={currentPage}
          initialTheme={theme}
          onPageChange={(p) => setCurrentPage(p)}
        />
      )}

      {/* VIEW 2: SURAHS INDEX & COMPLETE AYAHS LIST */}
      {quranTab === "surahs" && (
        <div className="space-y-4">
          {/* Surah Search & Active Reader Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h3 className={`font-bold text-base sm:text-lg font-alexandria ${styles.titleText}`}>
              فهرس سور القرآن الكريم (114 سورة)
            </h3>
            <div className="relative w-full sm:max-w-xs">
              <Search className={`w-4 h-4 absolute right-3.5 top-3 ${styles.mutedText}`} />
              <input
                type="text"
                placeholder="ابحث باسم السورة أو رقمها..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full border rounded-2xl pr-10 pl-4 py-2 text-xs focus:outline-none ${styles.inputBg} ${styles.inputBorder} ${styles.inputText}`}
              />
            </div>
          </div>

          {/* Ayahs Display for Selected Surah */}
          <div
            className={`rounded-3xl p-5 sm:p-7 space-y-5 border shadow-lg ${styles.cardBg} ${styles.cardBorder}`}
          >
            <div className={`text-center space-y-2 border-b pb-4 ${styles.innerBorder}`}>
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">
                  سورة {selectedSurah.nameAr}
                </span>
                <span className={`text-xs ${styles.mutedText}`}>
                  {selectedSurah.revelationType === "Meccan" ? "مكية" : "مدنية"} • {ayahsList.length || selectedSurah.numberOfAyahs} آية
                </span>
              </div>
              <span className={`text-2xl sm:text-3xl font-['Amiri',serif] block text-[#D4AF37]`}>
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </span>
            </div>

            {isLoadingAyahs ? (
              <div className="py-12 text-center space-y-3">
                <Loader2 className="w-8 h-8 mx-auto text-emerald-500 animate-spin" />
                <p className={`text-xs font-mono ${styles.mutedText}`}>
                  جاري جلب الآيات الشريفة لسورة {selectedSurah.nameAr}...
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {ayahsList.map((ayah) => (
                  <div
                    key={ayah.number_in_surah || ayah.id}
                    className={`p-4 rounded-2xl border transition space-y-2.5 ${styles.innerBg} ${styles.innerBorder}`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-mono border ${styles.badgeBg} ${styles.badgeText} ${styles.badgeBorder}`}
                      >
                        {ayah.number_in_surah}
                      </span>
                      <button
                        onClick={() => handleCopyAyah(ayah.text, ayah.number_in_surah)}
                        className={`text-xs transition flex items-center gap-1 font-semibold ${styles.mutedText} hover:text-emerald-500`}
                        title="نسخ الآية الكريمة"
                      >
                        {copiedAyahNum === ayah.number_in_surah ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-emerald-500 font-bold">تم النسخ</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>نسخ</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className={`text-xl sm:text-2xl font-['Amiri',serif] leading-loose text-right ${styles.titleText}`}>
                      {ayah.text}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Surah List Catalog Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
            {filteredSurahs.map((surah) => {
              const isSelected = selectedSurah.number === surah.number;
              return (
                <button
                  key={surah.number}
                  onClick={() => handleSelectSurah(surah, false)}
                  className={`p-3 sm:p-3.5 rounded-2xl sm:rounded-3xl border text-right flex items-center justify-between transition-all active:scale-98 ${
                    isSelected
                      ? isPaper
                        ? "bg-[#FAF5EB] border-[#8C5E24] ring-2 ring-[#8C5E24]/30 shadow-md"
                        : isNight
                        ? "bg-[#0F172A] border-sky-400 ring-2 ring-sky-400/30 shadow-md"
                        : "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/30 shadow-md"
                      : `${styles.cardBg} ${styles.cardBorder} hover:border-emerald-500/40`
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold font-mono border ${
                        isSelected
                          ? styles.btnPrimary
                          : `${styles.innerBg} ${styles.innerBorder} ${styles.mutedText}`
                      }`}
                    >
                      {surah.number}
                    </span>
                    <div>
                      <h4 className={`font-bold text-sm font-alexandria ${styles.titleText}`}>
                        سورة {surah.nameAr}
                      </h4>
                      <span className={`text-[10px] sm:text-[11px] font-mono ${styles.mutedText}`}>
                        {surah.nameEn} • {surah.numberOfAyahs} آية
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full font-bold border ${styles.badgeBg} ${styles.badgeText} ${styles.badgeBorder}`}
                  >
                    {surah.revelationType === "Meccan" ? "مكية" : "مدنية"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: ALL 30 JUZ' LIST */}
      {quranTab === "juz" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className={`text-base sm:text-lg font-bold flex items-center gap-2 ${styles.titleText}`}>
              <Layers className="w-5 h-5 text-emerald-500" />
              <span>فهرس أجزاء القرآن الكريم (٣٠ جزءاً كاملاً)</span>
            </h3>
            <span className={`text-xs font-mono ${styles.mutedText}`}>
              انقر على أي جزء للانتقال لصفحاته فوراً
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {ALL_JUZ_LIST.map((juz) => (
              <div
                key={juz.number}
                onClick={() => {
                  soundEngine.playTasbihClick();
                  setCurrentPage(juz.startPage);
                  const matchedSurah = SURAH_LIST.find((s) => s.number === juz.startSurahNumber);
                  if (matchedSurah) setSelectedSurah(matchedSurah);
                  setQuranTab("pages");
                }}
                className={`border p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl cursor-pointer transition-all duration-300 flex items-center justify-between group active:scale-98 hover:-translate-y-0.5 ${
                  styles.cardBg
                } ${styles.cardBorder} ${styles.cardShadow}`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-9 h-9 rounded-xl font-bold font-mono text-xs flex items-center justify-center transition border ${
                      isPaper
                        ? "bg-[#FAF5EB] text-[#8C5E24] border-[#D6C5A9]"
                        : isNight
                        ? "bg-slate-900 text-sky-400 border-slate-800"
                        : "bg-emerald-50 text-emerald-600 border-emerald-200"
                    }`}
                  >
                    {juz.number}
                  </span>
                  <div>
                    <h4 className={`font-bold text-sm sm:text-base font-alexandria ${styles.titleText}`}>
                      {juz.nameAr}
                    </h4>
                    <span className={`text-[11px] font-mono block ${styles.mutedText}`}>
                      صفحة {juz.startPage}
                    </span>
                  </div>
                </div>
                <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-transform group-hover:-translate-x-1" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 4: SPACED REPETITION MEMORIZATION SYSTEM (نظام التكرار المتباعد لتثبيت الحفظ) */}
      {quranTab === "memorization" && (
        <QuranSpacedRepetition theme={theme} />
      )}
    </div>
  );
};
