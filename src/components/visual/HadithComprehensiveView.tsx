import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  BookMarked,
  Search,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Share2,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  ChevronsRight,
  ChevronsLeft,
  LayoutGrid,
  Table as TableIcon,
  RefreshCw,
  Info,
  ShieldCheck,
  BookOpen,
  ArrowRight,
  Compass,
  Layers,
  ScrollText,
  Mic,
  MicOff,
  Filter,
  SlidersHorizontal,
} from "lucide-react";
import {
  HADITH_COLLECTIONS,
  HadithCollectionMeta,
} from "../../data/hadithData";
import { speechEngine } from "../../utils/speechEngine";
import { soundEngine } from "../../utils/soundEngine";
import { hapticEngine } from "../../utils/hapticEngine";
import { ThemeMode } from "../../types";
import { getThemeStyles } from "../../utils/themeClasses";

interface Props {
  theme?: ThemeMode;
  onBackToHome?: () => void;
}

interface LiveHadithItem {
  number: number;
  arab: string;
  id: string;
  bookId: string;
  bookNameAr: string;
  grade: string;
  author?: string;
  dorarVerifyUrl: string;
}

// Major Thematic Fiqh & Sunnah Chapters
const THEMATIC_TOPICS = [
  { id: "iman", title: "كتاب الإيمان والتوحيد", icon: "✨", query: "الإيمان" },
  { id: "tahara", title: "كتاب الطهارة والوضوء", icon: "💧", query: "الطهور" },
  { id: "salah", title: "كتاب الصلاة والمواقيت", icon: "🕌", query: "الصلاة" },
  { id: "zakah", title: "كتاب الزكاة والصدقات", icon: "🪙", query: "الزكاة" },
  { id: "sawm", title: "كتاب الصيام والاعتكاف", icon: "🌙", query: "الصيام" },
  { id: "hajj", title: "كتاب الحج والمناسك", icon: "🕋", query: "الحج" },
  { id: "buyu", title: "كتاب البيوع والمعاملات", icon: "⚖️", query: "البيع" },
  { id: "nikah", title: "كتاب النكاح والأسرة", icon: "💍", query: "النكاح" },
  { id: "adab", title: "كتاب الأخلاق والبر والصلة", icon: "🌿", query: "البر" },
  { id: "riqaq", title: "كتاب الرقاق والزهد", icon: "💎", query: "الجنة" },
  { id: "fitan", title: "كتاب الفتن والملاحم", icon: "🛡️", query: "الفتن" },
  { id: "athkar", title: "كتاب الأذكار والدعوات", icon: "🤲", query: "الدعاء" },
];

export const HadithComprehensiveView: React.FC<Props> = ({
  theme = "natural",
  onBackToHome,
}) => {
  const styles = getThemeStyles(theme);

  // Active book selection (null means on sections/volumes hub, string means viewing that volume)
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(15);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);

  // Data states
  const [hadiths, setHadiths] = useState<LiveHadithItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [jumpHadithNum, setJumpHadithNum] = useState<string>("");

  // View presentation mode: Table vs Cards
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  // Interaction feedback states
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  // Voice Filtering & Grade Filtering states
  const [gradeFilter, setGradeFilter] = useState<"all" | "sahih" | "hasan">("all");
  const [voiceFilterLabel, setVoiceFilterLabel] = useState<string | null>(null);
  const [isVoiceListening, setIsVoiceListening] = useState<boolean>(false);
  const [lastVoiceRecognizedText, setLastVoiceRecognizedText] = useState<string | null>(null);
  const speechRecognitionRef = useRef<any>(null);

  // Current selected book metadata
  const currentBookMeta: HadithCollectionMeta | null = useMemo(() => {
    if (!selectedBook) return null;
    return HADITH_COLLECTIONS.find((b) => b.id === selectedBook) || HADITH_COLLECTIONS[0];
  }, [selectedBook]);

  // Dynamically filtered Hadiths based on voice command & grade filters
  const filteredHadiths = useMemo(() => {
    return hadiths.filter((item) => {
      if (gradeFilter === "sahih") {
        const isSahih =
          item.bookId === "bukhari" ||
          item.bookId === "muslim" ||
          (item.grade && (item.grade.includes("صحيح") || item.grade.includes("أصح")));
        if (!isSahih) return false;
      } else if (gradeFilter === "hasan") {
        const isHasanOrSahih =
          item.bookId === "bukhari" ||
          item.bookId === "muslim" ||
          (item.grade &&
            (item.grade.includes("حسن") ||
              item.grade.includes("صحيح") ||
              item.grade.includes("أصح")));
        if (!isHasanOrSahih) return false;
      }
      return true;
    });
  }, [hadiths, gradeFilter]);

  // Fetch Hadiths from backend proxy
  const fetchHadiths = async (bookId: string, pageNum: number) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/hadith/page?book=${bookId}&page=${pageNum}&limit=${pageSize}`);
      if (!res.ok) {
        throw new Error("HTTP error " + res.status);
      }
      const data = await res.json();
      if (data && data.items) {
        setHadiths(data.items);
        setTotalPages(data.totalPages || Math.ceil(data.total / pageSize) || 1);
        setTotalItems(data.total || 100);
      } else {
        setHadiths([]);
      }
    } catch (err: any) {
      console.error("Failed to load hadith page:", err);
      setErrorMsg("تعذر تحميل الأحاديث من الخادم حالياً. يرجى التحقق من الاتصال وإعادة المحاولة.");
    } finally {
      setIsLoading(false);
    }
  };

  // Perform search across the current collection or global
  const performSearch = async (queryText: string, bookId?: string) => {
    const q = queryText.trim();
    if (!q) {
      if (bookId || selectedBook) {
        fetchHadiths(bookId || selectedBook!, page);
      }
      return;
    }

    setIsSearching(true);
    setErrorMsg(null);
    const targetBook = bookId || selectedBook || "bukhari";
    if (!selectedBook) {
      setSelectedBook(targetBook);
    }

    try {
      const res = await fetch(`/api/hadith/search?q=${encodeURIComponent(q)}&book=${targetBook}`);
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      if (data && data.items) {
        setHadiths(data.items);
        setTotalPages(1);
        setTotalItems(data.totalFound || data.items.length);
      } else {
        setHadiths([]);
        setTotalItems(0);
      }
    } catch (err) {
      console.error("Hadith search error:", err);
      setErrorMsg("تعذر إجراء البحث، يرجى إعادة المحاولة.");
    } finally {
      setIsSearching(false);
    }
  };

  // On book change or page change (when a book is selected)
  useEffect(() => {
    if (selectedBook && !searchQuery.trim()) {
      fetchHadiths(selectedBook, page);
    }
  }, [selectedBook, page]);

  const handleOpenBook = (bookId: string) => {
    soundEngine.playTasbihClick();
    setSelectedBook(bookId);
    setPage(1);
    setSearchQuery("");
    setJumpHadithNum("");
    const bookName = HADITH_COLLECTIONS.find((b) => b.id === bookId)?.nameAr || "";
    speechEngine.speakNavFeedback(`تم فتح ${bookName}`);
  };

  const handleReturnToVolumesHub = () => {
    soundEngine.playTasbihClick();
    setSelectedBook(null);
    setSearchQuery("");
    setHadiths([]);
    speechEngine.speakNavFeedback("العودة لمجلدات وأقسام الحديث");
  };

  const handleOpenThematicTopic = (topic: typeof THEMATIC_TOPICS[0]) => {
    soundEngine.playTasbihClick();
    setSelectedBook("bukhari");
    setSearchQuery(topic.query);
    setPage(1);
    performSearch(topic.query, "bukhari");
    speechEngine.speakNavFeedback(`استعراض أحاديث ${topic.title}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      performSearch(searchQuery);
    }
  };

  const handleClearSearch = () => {
    soundEngine.playTasbihClick();
    setSearchQuery("");
    if (selectedBook) {
      fetchHadiths(selectedBook, 1);
    }
    setPage(1);
  };

  const handleJumpToHadith = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(jumpHadithNum.trim(), 10);
    if (!isNaN(num) && num > 0 && selectedBook) {
      soundEngine.playTasbihClick();
      const targetPage = Math.max(1, Math.ceil(num / pageSize));
      setPage(targetPage);
      setSearchQuery("");
    }
  };

  const handleCopy = (item: LiveHadithItem) => {
    const text = `${item.arab}\n\n[${item.bookNameAr} - حديث رقم ${item.number} - الدرجة: ${item.grade}]\nالمصدر الموثق: الموسوعة الحديثية (الدرر السنية dorar.net)`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    soundEngine.playTasbihClick();
    setTimeout(() => setCopiedId(null), 2500);
    speechEngine.speakNavFeedback("تم نسخ الحديث مع التخريج إلى الحافظة");
  };

  const handleSpeak = (item: LiveHadithItem) => {
    if (speakingId === item.id) {
      speechEngine.stop();
      setSpeakingId(null);
    } else {
      speechEngine.stop();
      setSpeakingId(item.id);
      speechEngine.speak(
        `${item.bookNameAr}، الحديث رقم ${item.number}. ${item.arab}`,
        { onEnd: () => setSpeakingId(null) }
      );
    }
  };

  const handleShare = (item: LiveHadithItem) => {
    soundEngine.playTasbihClick();
    if (navigator.share) {
      navigator
        .share({
          title: `${item.bookNameAr} - حديث ${item.number}`,
          text: `${item.arab}\n\nرقم الحديث: ${item.number}\nالكتاب: ${item.bookNameAr}`,
          url: item.dorarVerifyUrl,
        })
        .catch(() => {});
    } else {
      handleCopy(item);
    }
  };

  // =========================================================================
  // VOICE FILTERING ENGINE (فقط أحاديث صحيحة / فقط من صحيح البخاري / صحيح مسلم)
  // =========================================================================
  const applyVoiceFilter = (
    type: "sahih" | "bukhari" | "muslim" | "hasan" | "clear",
    customQuery?: string
  ) => {
    soundEngine.playQiblaLocked();
    hapticEngine.trigger("assistant_respond");

    if (type === "clear") {
      setGradeFilter("all");
      setVoiceFilterLabel(null);
      speechEngine.speak("تم إلغاء الفلترة الصوتية وعرض جميع الأحاديث الشريفة.");
      if (customQuery !== undefined) {
        setSearchQuery(customQuery);
        if (customQuery.trim()) {
          performSearch(customQuery.trim());
        }
      }
      return;
    }

    if (type === "sahih") {
      setGradeFilter("sahih");
      setVoiceFilterLabel("فقط أحاديث صحيحة");
      speechEngine.speak("تم تطبيق الفلترة الصوتية: عرض الأحاديث الصحيحة فقط مع التخريج المعتمد.");
      const q = customQuery !== undefined ? customQuery : searchQuery;
      if (customQuery !== undefined) setSearchQuery(customQuery);
      if (q.trim()) {
        performSearch(q.trim(), selectedBook || "bukhari");
      } else if (!selectedBook) {
        setSelectedBook("bukhari");
        fetchHadiths("bukhari", 1);
      }
    } else if (type === "bukhari") {
      setGradeFilter("sahih");
      setSelectedBook("bukhari");
      setVoiceFilterLabel("فقط من صحيح البخاري");
      speechEngine.speak("تم تطبيق الفلترة الصوتية: عرض أحاديث صحيح البخاري فقط المعتمدة بالإجماع.");
      const q = customQuery !== undefined ? customQuery : searchQuery;
      if (customQuery !== undefined) setSearchQuery(customQuery);
      if (q.trim()) {
        performSearch(q.trim(), "bukhari");
      } else {
        fetchHadiths("bukhari", 1);
      }
    } else if (type === "muslim") {
      setGradeFilter("sahih");
      setSelectedBook("muslim");
      setVoiceFilterLabel("فقط من صحيح مسلم");
      speechEngine.speak("تم تطبيق الفلترة الصوتية: عرض أحاديث صحيح مسلم فقط المعتمدة بالإجماع.");
      const q = customQuery !== undefined ? customQuery : searchQuery;
      if (customQuery !== undefined) setSearchQuery(customQuery);
      if (q.trim()) {
        performSearch(q.trim(), "muslim");
      } else {
        fetchHadiths("muslim", 1);
      }
    } else if (type === "hasan") {
      setGradeFilter("hasan");
      setVoiceFilterLabel("فقط أحاديث حسنة");
      speechEngine.speak("تم تطبيق الفلترة الصوتية: عرض الأحاديث المقبولة والحسنة والصحيحة.");
      const q = customQuery !== undefined ? customQuery : searchQuery;
      if (customQuery !== undefined) setSearchQuery(customQuery);
      if (q.trim()) {
        performSearch(q.trim(), selectedBook || "bukhari");
      }
    }
  };

  const handleVoiceRecognitionResult = (rawText: string) => {
    setLastVoiceRecognizedText(rawText);
    const clean = rawText
      .toLowerCase()
      .replace(/[ًٌٍَُِّْـ]/g, "")
      .replace(/[أإآ]/g, "ا")
      .replace(/ة/g, "ه")
      .replace(/ى/g, "ي")
      .trim();

    // Extract search query if present, e.g. "ابحث عن الصبر فقط أحاديث صحيحة"
    let extractedTopic = "";
    const topicMatch = clean.match(/(?:ابحث عن|بحث عن|عن|ابحث في المكتبة عن)\s+([^فقط]+?)(?:\s+فقط|\s+من|$)/);
    if (topicMatch && topicMatch[1]) {
      extractedTopic = topicMatch[1].trim();
    }

    // 1. "فقط من صحيح البخاري"
    if (
      clean.includes("صحيح البخاري") ||
      clean.includes("من البخاري") ||
      clean.includes("فقط البخاري") ||
      clean.includes("كتاب البخاري")
    ) {
      applyVoiceFilter("bukhari", extractedTopic || undefined);
      return;
    }

    // 2. "فقط من صحيح مسلم"
    if (
      clean.includes("صحيح مسلم") ||
      clean.includes("من مسلم") ||
      clean.includes("فقط مسلم") ||
      clean.includes("كتاب مسلم")
    ) {
      applyVoiceFilter("muslim", extractedTopic || undefined);
      return;
    }

    // 3. "فقط أحاديث صحيحة"
    if (
      clean.includes("احاديث صحيحه") ||
      clean.includes("احاديث صحيحة") ||
      clean.includes("الاحاديث الصحيحه") ||
      clean.includes("الاحاديث الصحيحة") ||
      clean.includes("فقط صحيح") ||
      clean.includes("فقط الصحيح") ||
      clean.includes("صحيحة فقط") ||
      clean.includes("صحيحه فقط")
    ) {
      applyVoiceFilter("sahih", extractedTopic || undefined);
      return;
    }

    // 4. "فقط أحاديث حسنة"
    if (
      clean.includes("احاديث حسنه") ||
      clean.includes("احاديث حسنة") ||
      clean.includes("الاحاديث الحسنه") ||
      clean.includes("الاحاديث الحسنة") ||
      clean.includes("حسنة فقط") ||
      clean.includes("حسنه فقط")
    ) {
      applyVoiceFilter("hasan", extractedTopic || undefined);
      return;
    }

    // 5. "إلغاء الفلترة"
    if (
      clean.includes("الغاء الفلترة") ||
      clean.includes("الغي الفلترة") ||
      clean.includes("كل الاحاديث") ||
      clean.includes("عرض الكل") ||
      clean.includes("بدون فلترة")
    ) {
      applyVoiceFilter("clear");
      return;
    }

    // 6. Direct voice search
    setSearchQuery(rawText);
    performSearch(rawText);
    speechEngine.speak(`جاري البحث في الأحاديث الشريفة عن: ${rawText}`);
  };

  const toggleVoiceListening = () => {
    if (isVoiceListening) {
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch (e) {}
      }
      setIsVoiceListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      soundEngine.playTasbihClick();
      speechEngine.speak("ميزة التعرف الصوتي غير مفعلة في المتصفح، يمكنك استخدام أزرار الفلترة السريعة.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "ar-SA";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsVoiceListening(true);
        soundEngine.playAssistantActivate();
        hapticEngine.trigger("assistant_listen");
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) {
          handleVoiceRecognitionResult(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsVoiceListening(false);
      };

      recognition.onend = () => {
        setIsVoiceListening(false);
      };

      speechRecognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn("Recognition start failed:", err);
      setIsVoiceListening(false);
    }
  };

  // Listen to remote voice filter commands from VoiceCompanionModal or external triggers
  useEffect(() => {
    const handleVoiceFilterEvent = (e: any) => {
      const detail = e.detail || {};
      const { grade, book, query, voiceFilterLabel: label } = detail;
      if (book === "bukhari") {
        applyVoiceFilter("bukhari", query || undefined);
      } else if (book === "muslim") {
        applyVoiceFilter("muslim", query || undefined);
      } else if (grade === "sahih") {
        applyVoiceFilter("sahih", query || undefined);
      } else if (grade === "hasan") {
        applyVoiceFilter("hasan", query || undefined);
      } else if (grade === "all" && !book) {
        applyVoiceFilter("clear", query || undefined);
      }
    };

    window.addEventListener("noor-hadith-filter", handleVoiceFilterEvent as EventListener);
    return () => {
      window.removeEventListener("noor-hadith-filter", handleVoiceFilterEvent as EventListener);
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, [selectedBook, searchQuery]);

  // =========================================================================
  // VIEW 1: VOLUMES & SECTIONS NAVIGATION HUB (No default dumped hadiths)
  // =========================================================================
  if (!selectedBook && !searchQuery.trim()) {
    return (
      <div id="hadith-volumes-hub" className="space-y-6">
        {/* Universal Search Bar & Voice Filtering across Sunnah */}
        <div className={`rounded-2xl sm:rounded-3xl p-4 sm:p-5 border space-y-3.5 ${styles.cardBg} ${styles.cardBorder} ${styles.cardShadow}`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-500" />
              <div>
                <h3 className={`text-sm sm:text-base font-bold font-alexandria ${styles.titleText}`}>
                  البحث في المكتبة والفلترة الصوتية الذكية
                </h3>
                <p className={`text-[11px] ${styles.mutedText}`}>
                  ابحث بالكلمة أو اضغط الميكروفون وقل: <strong className="text-emerald-500">«فقط أحاديث صحيحة»</strong> أو <strong className="text-emerald-500">«فقط من صحيح البخاري»</strong>
                </p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>مكتبة موثقة بالدرر السنية</span>
            </span>
          </div>

          {/* Search Input with Voice Mic */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className={`w-4 h-4 absolute right-3.5 top-3.5 ${styles.mutedText}`} />
            <input
              type="text"
              placeholder="ابحث بلفظ من متن الحديث... أو استخدم الفلترة الصوتية المباشرة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full border rounded-2xl pr-10 pl-36 py-3 text-xs sm:text-sm focus:outline-none ${styles.inputBg} ${styles.inputBorder} ${styles.inputText}`}
            />
            <div className="absolute left-2 top-2 flex items-center gap-1.5">
              {/* Microphone Voice Filter Button */}
              <button
                type="button"
                onClick={toggleVoiceListening}
                className={`p-2 rounded-xl border transition-all flex items-center justify-center ${
                  isVoiceListening
                    ? "bg-red-500 text-white border-red-500 animate-pulse shadow-lg shadow-red-500/30 ring-2 ring-red-400"
                    : "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                }`}
                title={isVoiceListening ? "إيقاف الاستماع الصوتي" : "تحدث بالأمر الصوتي: قل فقط أحاديث صحيحة أو فقط من صحيح البخاري"}
              >
                {isVoiceListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Submit Search Button */}
              <button
                type="submit"
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${styles.btnPrimary}`}
              >
                بحث فوري
              </button>
            </div>
          </form>

          {/* Active Voice Listening Live Banner */}
          {isVoiceListening && (
            <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between gap-2 animate-pulse">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-300">
                  🎙️ أنا أستمع إليك الآن... تفضل بالقول: «فقط أحاديث صحيحة» أو «فقط من صحيح البخاري» أو «فقط من صحيح مسلم»
                </span>
              </div>
              <button
                onClick={toggleVoiceListening}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 font-bold"
              >
                إيقاف
              </button>
            </div>
          )}

          {/* Active Voice Filter Notification Banner */}
          {voiceFilterLabel && (
            <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent border border-emerald-500/30 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500 animate-spin" />
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-300">
                  ✨ تم تطبيق الفلترة الصوتية فورياً:
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-200 font-bold border border-emerald-500/30">
                  {voiceFilterLabel}
                </span>
              </div>
              <button
                onClick={() => applyVoiceFilter("clear")}
                className="text-xs px-2.5 py-1 rounded-lg bg-zinc-500/10 hover:bg-zinc-500/20 text-zinc-400 hover:text-zinc-200 font-bold flex items-center gap-1 transition"
              >
                <span>إلغاء الفلترة</span>
                <span>✕</span>
              </button>
            </div>
          )}

          {/* Interactive Voice Filter Chips (Speak or Tap) */}
          <div className="flex items-center flex-wrap gap-2 pt-1 border-t border-black/5 dark:border-white/5">
            <span className={`text-xs font-semibold flex items-center gap-1.5 ${styles.mutedText}`}>
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-500" />
              <span>أوامر الفلترة الصوتية:</span>
            </span>

            <button
              onClick={() => applyVoiceFilter("sahih")}
              className={`text-xs px-3 py-1.5 rounded-xl font-bold border transition flex items-center gap-1.5 cursor-pointer ${
                gradeFilter === "sahih" && !selectedBook
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                  : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/20"
              }`}
            >
              <Mic className="w-3 h-3" />
              <span>فقط أحاديث صحيحة</span>
            </button>

            <button
              onClick={() => applyVoiceFilter("bukhari")}
              className={`text-xs px-3 py-1.5 rounded-xl font-bold border transition flex items-center gap-1.5 cursor-pointer ${
                selectedBook === "bukhari" && gradeFilter === "sahih"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                  : "bg-teal-500/10 hover:bg-teal-500/20 text-teal-600 dark:text-teal-300 border-teal-500/20"
              }`}
            >
              <Mic className="w-3 h-3" />
              <span>فقط من صحيح البخاري</span>
            </button>

            <button
              onClick={() => applyVoiceFilter("muslim")}
              className={`text-xs px-3 py-1.5 rounded-xl font-bold border transition flex items-center gap-1.5 cursor-pointer ${
                selectedBook === "muslim" && gradeFilter === "sahih"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                  : "bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border-cyan-500/20"
              }`}
            >
              <Mic className="w-3 h-3" />
              <span>فقط من صحيح مسلم</span>
            </button>

            <button
              onClick={() => applyVoiceFilter("hasan")}
              className={`text-xs px-3 py-1.5 rounded-xl font-bold border transition flex items-center gap-1.5 cursor-pointer ${
                gradeFilter === "hasan"
                  ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                  : "bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/20"
              }`}
            >
              <Mic className="w-3 h-3" />
              <span>فقط أحاديث حسنة</span>
            </button>

            {voiceFilterLabel && (
              <button
                onClick={() => applyVoiceFilter("clear")}
                className="text-xs px-2.5 py-1.5 rounded-xl font-bold border border-zinc-500/20 text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
              >
                ✕ عرض الكل
              </button>
            )}
          </div>
        </div>

        {/* SECTION 1: THE 9 MAJOR HADITH VOLUMES & COLLECTIONS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-500" />
              <h3 className={`text-base sm:text-lg font-bold font-alexandria ${styles.titleText}`}>
                أمهات كتب السنة النبوية المطهرة (المجلدات التسعة)
              </h3>
            </div>
            <span className={`text-xs ${styles.mutedText}`}>
              اختر الكتاب لاستعراض أحاديثه
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {HADITH_COLLECTIONS.map((col, idx) => (
              <button
                key={col.id}
                onClick={() => handleOpenBook(col.id)}
                className={`group p-4 sm:p-5 rounded-2xl sm:rounded-3xl border text-right transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-98 flex flex-col justify-between cursor-pointer ${styles.cardBg} ${styles.cardBorder} hover:border-emerald-500/50`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold flex items-center justify-center text-xs border border-emerald-500/20">
                      {idx + 1}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                      {col.gradeAr}
                    </span>
                  </div>

                  <h4 className={`text-base font-bold font-alexandria transition group-hover:text-emerald-500 ${styles.titleText}`}>
                    {col.nameAr}
                  </h4>

                  <p className={`text-xs ${styles.mutedText}`}>
                    {col.authorAr}
                  </p>
                </div>

                <div className={`mt-4 pt-3 border-t flex items-center justify-between ${styles.innerBorder}`}>
                  <div className="flex items-center gap-1.5 font-mono text-xs">
                    <span className="font-bold text-emerald-500">{col.total.toLocaleString("ar-EG")}</span>
                    <span className={styles.mutedText}>حديث معتمد</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-[-4px] transition-transform">
                    <span>تصفح المجلد</span>
                    <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* SECTION 2: THEMATIC HADITH CHAPTERS & BOOKS (أبواب السنة ومجلدات الفقه) */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ScrollText className="w-5 h-5 text-amber-500" />
              <h3 className={`text-base sm:text-lg font-bold font-alexandria ${styles.titleText}`}>
                أبواب الفقه ومجلدات السنة الموضوعية
              </h3>
            </div>
            <span className={`text-xs ${styles.mutedText}`}>
              تصفح الأحاديث حسب الأبواب
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
            {THEMATIC_TOPICS.map((topic) => (
              <button
                key={topic.id}
                onClick={() => handleOpenThematicTopic(topic)}
                className={`p-3.5 rounded-2xl border text-right transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm active:scale-98 flex items-center gap-3 cursor-pointer ${styles.cardBg} ${styles.cardBorder} hover:border-amber-500/40`}
              >
                <span className="text-xl shrink-0">{topic.icon}</span>
                <div className="min-w-0">
                  <div className={`text-xs sm:text-sm font-bold truncate ${styles.titleText}`}>
                    {topic.title}
                  </div>
                  <div className={`text-[10px] ${styles.mutedText}`}>
                    أحاديث موضوع «{topic.query}»
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Dorar.net Direct Verification Alert */}
        <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
            <span className={styles.bodyText}>
              توثيق الأحاديث وتخريجها معتمد وفق منهج أئمة الحديث الشريف عبر واجهة الموسوعة الحديثية (الدرر السنية dorar.net).
            </span>
          </div>
          <a
            href="https://dorar.net/hadith"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400 hover:underline shrink-0 text-xs px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
          >
            <span>بوابة الدرر السنية</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: ACTIVE VOLUME HADITHS VIEW (With Pagination, Search, Audio, and Verification)
  // =========================================================================
  return (
    <div id="hadith-encyclopedia-view" className="space-y-4 sm:space-y-6">
      {/* Top Header & Navigation Bar */}
      <div className={`rounded-2xl sm:rounded-3xl p-4 sm:p-5 border transition-all ${styles.cardBg} ${styles.cardBorder} ${styles.cardShadow}`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            {/* Return to Volumes Hub button */}
            <button
              onClick={handleReturnToVolumesHub}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition border shrink-0 ${styles.btnPrimary}`}
              title="الرجوع لمجلدات وأقسام الحديث"
            >
              <ArrowRight className="w-4 h-4" />
              <span>أقسام ومجلدات الحديث</span>
            </button>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${styles.badgeBg} ${styles.badgeBorder} ${styles.badgeText}`}>
                  {currentBookMeta?.nameAr || "البحث في السنة"}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold">
                  {currentBookMeta?.gradeAr || "موثق بالدرر السنية"}
                </span>
              </div>
              <p className={`text-xs ${styles.mutedText}`}>
                {currentBookMeta ? `المؤلف: ${currentBookMeta.authorAr} • إجمالي الأحاديث: ${currentBookMeta.total.toLocaleString("ar-EG")}` : "نتائج البحث المباشر"}
              </p>
            </div>
          </div>

          {/* Stats Badge & View Mode Toggle */}
          <div className="flex items-center gap-2 self-stretch md:self-auto justify-between md:justify-end">
            <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border font-mono text-xs ${styles.innerBg} ${styles.innerBorder}`}>
              <span className={`font-bold text-sm ${styles.accentText}`}>
                {gradeFilter !== "all"
                  ? filteredHadiths.length.toLocaleString("ar-EG")
                  : totalItems.toLocaleString("ar-EG")}
              </span>
              <span className={styles.mutedText}>
                {gradeFilter !== "all" ? "حديث مصفّى" : "حديث"}
              </span>
            </div>

            {/* View Mode Toggle: Table vs Cards */}
            <div className={`flex items-center p-1 rounded-xl border ${styles.innerBg} ${styles.innerBorder}`}>
              <button
                onClick={() => {
                  soundEngine.playTasbihClick();
                  setViewMode("cards");
                }}
                className={`p-1.5 rounded-lg text-xs transition ${
                  viewMode === "cards" ? styles.btnPrimary : `${styles.mutedText} hover:${styles.bodyText}`
                }`}
                title="عرض البطاقات"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  soundEngine.playTasbihClick();
                  setViewMode("table");
                }}
                className={`p-1.5 rounded-lg text-xs transition ${
                  viewMode === "table" ? styles.btnPrimary : `${styles.mutedText} hover:${styles.bodyText}`
                }`}
                title="عرض الجدول"
              >
                <TableIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Search & Jump Tools */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-2.5">
          {/* Main Keyword Search with Voice Mic */}
          <form onSubmit={handleSearchSubmit} className="relative md:col-span-8">
            <Search className={`w-4 h-4 absolute right-3.5 top-3.5 ${styles.mutedText}`} />
            <input
              type="text"
              placeholder="ابحث بكلمة أو تحدث بالميكروفون (مثال: فقط أحاديث صحيحة)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full border rounded-2xl pr-10 pl-28 py-2.5 text-xs sm:text-sm focus:outline-none ${styles.inputBg} ${styles.inputBorder} ${styles.inputText}`}
            />
            <div className="absolute left-2 top-2 flex items-center gap-1.5">
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="px-1.5 py-1 rounded-lg text-[10px] text-zinc-400 hover:text-zinc-200"
                >
                  مسح
                </button>
              )}

              {/* Voice Filter Mic Button */}
              <button
                type="button"
                onClick={toggleVoiceListening}
                className={`p-1.5 rounded-lg border transition-all flex items-center justify-center ${
                  isVoiceListening
                    ? "bg-red-500 text-white border-red-500 animate-pulse shadow-md shadow-red-500/20"
                    : "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                }`}
                title={isVoiceListening ? "إيقاف الاستماع الصوتي" : "تحدث بالأمر الصوتي (فقط أحاديث صحيحة، فقط من صحيح البخاري)"}
              >
                {isVoiceListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              </button>

              <button
                type="submit"
                className={`px-3 py-1 rounded-xl text-xs font-bold transition ${styles.btnPrimary}`}
              >
                بحث
              </button>
            </div>
          </form>

          {/* Jump directly to Hadith Number */}
          <form onSubmit={handleJumpToHadith} className="relative md:col-span-4 flex gap-1.5">
            <input
              type="number"
              min="1"
              max={currentBookMeta?.total || 7000}
              placeholder={`انتقال لرقم حديث...`}
              value={jumpHadithNum}
              onChange={(e) => setJumpHadithNum(e.target.value)}
              className={`w-full border rounded-2xl px-3.5 py-2.5 text-xs focus:outline-none ${styles.inputBg} ${styles.inputBorder} ${styles.inputText}`}
            />
            <button
              type="submit"
              className={`px-3 py-2 rounded-2xl text-xs font-bold shrink-0 transition ${styles.btnSecondary}`}
            >
              انتقال
            </button>
          </form>
        </div>

        {/* View 2 Voice Listening Live Indicator */}
        {isVoiceListening && (
          <div className="mt-3 p-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between gap-2 animate-pulse">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-300">
                🎙️ استمع إليك الآن... تفضل بالقول: «فقط أحاديث صحيحة» أو «فقط من صحيح البخاري» أو «فقط من صحيح مسلم»
              </span>
            </div>
            <button
              onClick={toggleVoiceListening}
              className="text-[10px] px-2 py-0.5 rounded-lg bg-red-500/20 text-red-400 font-bold"
            >
              إيقاف
            </button>
          </div>
        )}

        {/* View 2 Active Voice Filter Banner */}
        {voiceFilterLabel && (
          <div className="mt-3 p-2.5 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent border border-emerald-500/30 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500 animate-spin" />
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-300">
                الفلترة الصوتية النشطة:
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-200 font-bold border border-emerald-500/30">
                {voiceFilterLabel}
              </span>
              <span className={`text-[11px] ${styles.mutedText}`}>
                ({filteredHadiths.length.toLocaleString("ar-EG")} حديث مطابق في الصفحة)
              </span>
            </div>
            <button
              onClick={() => applyVoiceFilter("clear")}
              className="text-[11px] px-2 py-0.5 rounded-lg bg-zinc-500/10 hover:bg-zinc-500/20 text-zinc-400 hover:text-zinc-200 font-bold transition flex items-center gap-1"
            >
              <span>إلغاء الفلترة</span>
              <span>✕</span>
            </button>
          </div>
        )}

        {/* View 2 Voice Filter Quick Buttons Strip */}
        <div className="mt-3 flex items-center flex-wrap gap-1.5 pt-2 border-t border-black/5 dark:border-white/5">
          <span className={`text-xs font-semibold flex items-center gap-1 ${styles.mutedText}`}>
            <Filter className="w-3 h-3 text-emerald-500" />
            <span>فلترة صوتية:</span>
          </span>

          <button
            onClick={() => applyVoiceFilter("sahih")}
            className={`text-[11px] px-2.5 py-1 rounded-xl font-bold border transition flex items-center gap-1 cursor-pointer ${
              gradeFilter === "sahih"
                ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/20"
            }`}
          >
            <Mic className="w-3 h-3" />
            <span>فقط أحاديث صحيحة</span>
          </button>

          <button
            onClick={() => applyVoiceFilter("bukhari")}
            className={`text-[11px] px-2.5 py-1 rounded-xl font-bold border transition flex items-center gap-1 cursor-pointer ${
              selectedBook === "bukhari" && gradeFilter === "sahih"
                ? "bg-teal-600 text-white border-teal-600 shadow-sm"
                : "bg-teal-500/10 hover:bg-teal-500/20 text-teal-600 dark:text-teal-300 border-teal-500/20"
            }`}
          >
            <Mic className="w-3 h-3" />
            <span>فقط من صحيح البخاري</span>
          </button>

          <button
            onClick={() => applyVoiceFilter("muslim")}
            className={`text-[11px] px-2.5 py-1 rounded-xl font-bold border transition flex items-center gap-1 cursor-pointer ${
              selectedBook === "muslim" && gradeFilter === "sahih"
                ? "bg-cyan-600 text-white border-cyan-600 shadow-sm"
                : "bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border-cyan-500/20"
            }`}
          >
            <Mic className="w-3 h-3" />
            <span>فقط من صحيح مسلم</span>
          </button>

          <button
            onClick={() => applyVoiceFilter("hasan")}
            className={`text-[11px] px-2.5 py-1 rounded-xl font-bold border transition flex items-center gap-1 cursor-pointer ${
              gradeFilter === "hasan"
                ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                : "bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/20"
            }`}
          >
            <Mic className="w-3 h-3" />
            <span>فقط أحاديث حسنة</span>
          </button>

          {voiceFilterLabel && (
            <button
              onClick={() => applyVoiceFilter("clear")}
              className="text-[11px] px-2 py-1 rounded-xl font-bold border border-zinc-500/20 text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
            >
              ✕ إلغاء الفلترة
            </button>
          )}
        </div>

        {/* Quick Books Switcher Horizontal Strip */}
        <div className="mt-3.5 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {HADITH_COLLECTIONS.map((col) => {
            const isSelected = selectedBook === col.id;
            return (
              <button
                key={col.id}
                onClick={() => handleOpenBook(col.id)}
                className={`px-2.5 py-1 rounded-xl text-xs whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                  isSelected
                    ? `${styles.badgeBg} ${styles.badgeBorder} ${styles.badgeText} font-bold shadow-sm`
                    : `${styles.innerBg} ${styles.innerBorder} ${styles.mutedText} hover:${styles.bodyText}`
                }`}
              >
                <span>{col.nameAr}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className={`rounded-3xl p-12 text-center space-y-3 border ${styles.cardBg} ${styles.cardBorder}`}>
          <RefreshCw className="w-8 h-8 mx-auto text-emerald-500 animate-spin" />
          <p className={`text-sm font-semibold ${styles.titleText}`}>
            جارٍ جلب نصوص الأحاديث الشريفة...
          </p>
          <p className={`text-xs ${styles.mutedText}`}>
            يتم التحميل المباشر من قاعدة بيانات {currentBookMeta?.nameAr || "السنة المطهرة"}
          </p>
        </div>
      )}

      {/* Error state */}
      {!isLoading && errorMsg && (
        <div className={`rounded-3xl p-8 text-center space-y-3 border border-red-500/30 ${styles.cardBg}`}>
          <Info className="w-8 h-8 mx-auto text-red-400" />
          <p className="text-sm text-red-400 font-semibold">{errorMsg}</p>
          <button
            onClick={() => selectedBook && fetchHadiths(selectedBook, page)}
            className={`px-4 py-2 rounded-xl text-xs font-bold ${styles.btnPrimary}`}
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* Empty results - No hadiths fetched */}
      {!isLoading && !errorMsg && hadiths.length === 0 && (
        <div className={`rounded-3xl p-10 text-center space-y-3 border ${styles.cardBg} ${styles.cardBorder}`}>
          <Info className={`w-8 h-8 mx-auto ${styles.mutedText}`} />
          <h4 className={`text-base font-bold ${styles.titleText}`}>لم يتم العثور على أحاديث مطابقة</h4>
          <p className={`text-xs ${styles.mutedText}`}>
            جرّب البحث بكلمة أخرى أو تصفح الأحاديث عبر الأرقام.
          </p>
          <button
            onClick={handleClearSearch}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold ${styles.btnSecondary}`}
          >
            العودة للتصفح
          </button>
        </div>
      )}

      {/* Empty results - Filtered out by voice filter */}
      {!isLoading && !errorMsg && hadiths.length > 0 && filteredHadiths.length === 0 && (
        <div className={`rounded-3xl p-10 text-center space-y-3 border ${styles.cardBg} ${styles.cardBorder}`}>
          <Filter className={`w-8 h-8 mx-auto text-amber-500`} />
          <h4 className={`text-base font-bold ${styles.titleText}`}>
            لم يتم العثور على أحاديث تطابق الفلترة الصوتية ({voiceFilterLabel}) في هذه الصفحة
          </h4>
          <p className={`text-xs ${styles.mutedText}`}>
            تحتوي هذه الصفحة على {hadiths.length.toLocaleString("ar-EG")} حديثاً بدرجات أخرى، يمكنك إلغاء الفلترة لعرض الكل أو التنقل بين صفحات الكتاب.
          </p>
          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              onClick={() => applyVoiceFilter("clear")}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold ${styles.btnPrimary}`}
            >
              إلغاء الفلترة وعرض الكل
            </button>
          </div>
        </div>
      )}

      {/* DISPLAY 1: CARDS VIEW */}
      {!isLoading && !errorMsg && filteredHadiths.length > 0 && viewMode === "cards" && (
        <div className="space-y-3.5">
          {filteredHadiths.map((item) => {
            const isSpeaking = speakingId === item.id;
            const isCopied = copiedId === item.id;

            return (
              <div
                key={item.id}
                className={`rounded-2xl sm:rounded-3xl p-4 sm:p-6 border transition-all space-y-3 relative group hover:-translate-y-0.5 ${styles.cardBg} ${styles.cardBorder} ${styles.cardShadow}`}
              >
                {/* Meta Header */}
                <div className={`flex flex-wrap items-center justify-between gap-2 border-b pb-2.5 ${styles.innerBorder}`}>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold border ${styles.badgeBg} ${styles.badgeText} ${styles.badgeBorder}`}>
                      {item.bookNameAr} #{item.number}
                    </span>
                    <span className={`text-xs font-medium ${styles.mutedText}`}>
                      {item.author || currentBookMeta?.authorAr}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Grade Badge */}
                    <span
                      className={`text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${styles.badgeBg} ${styles.badgeText} ${styles.badgeBorder}`}
                    >
                      {item.grade}
                    </span>

                    {/* Action: TTS Audio Voice */}
                    <button
                      onClick={() => handleSpeak(item)}
                      className={`p-1.5 rounded-xl border transition ${
                        isSpeaking ? styles.btnPrimary : styles.btnSecondary
                      }`}
                      title={isSpeaking ? "إيقاف القراءة" : "الاستماع صوتياً للحديث"}
                    >
                      {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>

                    {/* Action: Copy */}
                    <button
                      onClick={() => handleCopy(item)}
                      className={`p-1.5 rounded-xl border transition ${
                        isCopied ? "bg-emerald-600 text-white border-emerald-600" : styles.btnSecondary
                      }`}
                      title="نسخ الحديث مع التخريج"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>

                    {/* Action: Share */}
                    <button
                      onClick={() => handleShare(item)}
                      className={`p-1.5 rounded-xl border transition ${styles.btnSecondary}`}
                      title="مشاركة الحديث"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Hadith Arabic Text (Sanad & Matn) */}
                <p
                  className={`text-base sm:text-lg leading-loose font-['Amiri',serif] font-normal text-justify ${styles.titleText}`}
                  dir="rtl"
                >
                  {item.arab}
                </p>

                {/* Footer with Verification Link */}
                <div className={`pt-2 border-t flex flex-wrap items-center justify-between gap-2 text-xs ${styles.innerBorder}`}>
                  <span className={`font-mono text-[11px] ${styles.mutedText}`}>
                    رقم الحديث: {item.number} في {item.bookNameAr}
                  </span>
                  <a
                    href={item.dorarVerifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 hover:underline font-bold text-xs"
                  >
                    <span>التحقق في الموسوعة الحديثية (الدرر السنية)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DISPLAY 2: TABULAR VIEW */}
      {!isLoading && !errorMsg && filteredHadiths.length > 0 && viewMode === "table" && (
        <div className={`rounded-2xl sm:rounded-3xl border overflow-hidden ${styles.cardBg} ${styles.cardBorder} ${styles.cardShadow}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs sm:text-sm border-collapse">
              <thead>
                <tr className={`border-b ${styles.innerBorder} ${styles.innerBg}`}>
                  <th className="p-3 sm:p-4 font-bold font-mono text-center w-16">#</th>
                  <th className="p-3 sm:p-4 font-bold">متن وسند الحديث النبوي الشريف</th>
                  <th className="p-3 sm:p-4 font-bold whitespace-nowrap">الكتاب والدرجة</th>
                  <th className="p-3 sm:p-4 font-bold text-center whitespace-nowrap">التحقق بالدرر السنية</th>
                  <th className="p-3 sm:p-4 font-bold text-center whitespace-nowrap">أدوات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {filteredHadiths.map((item) => {
                  const isSpeaking = speakingId === item.id;
                  const isCopied = copiedId === item.id;

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition`}
                    >
                      {/* Number */}
                      <td className="p-3 sm:p-4 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {item.number}
                      </td>

                      {/* Matn & Sanad */}
                      <td className="p-3 sm:p-4 font-['Amiri',serif] text-sm sm:text-base leading-relaxed max-w-xl">
                        {item.arab}
                      </td>

                      {/* Book & Grade */}
                      <td className="p-3 sm:p-4 whitespace-nowrap space-y-1">
                        <div className="font-semibold text-xs">{item.bookNameAr}</div>
                        <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-bold border ${styles.badgeBg} ${styles.badgeText} ${styles.badgeBorder}`}>
                          {item.grade}
                        </span>
                      </td>

                      {/* Dorar.net direct link */}
                      <td className="p-3 sm:p-4 text-center whitespace-nowrap">
                        <a
                          href={item.dorarVerifyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold transition"
                        >
                          <span>فحص الحديث</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>

                      {/* Actions */}
                      <td className="p-3 sm:p-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleSpeak(item)}
                            className={`p-1.5 rounded-lg border transition ${
                              isSpeaking ? styles.btnPrimary : styles.btnSecondary
                            }`}
                            title="استماع صوتي"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleCopy(item)}
                            className={`p-1.5 rounded-lg border transition ${
                              isCopied ? "bg-emerald-600 text-white" : styles.btnSecondary
                            }`}
                            title="نسخ"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => handleShare(item)}
                            className={`p-1.5 rounded-lg border transition ${styles.btnSecondary}`}
                            title="مشاركة"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Bar */}
      {!isLoading && !errorMsg && totalPages > 1 && (
        <div className={`rounded-2xl sm:rounded-3xl p-3 sm:p-4 border flex flex-wrap items-center justify-between gap-3 ${styles.cardBg} ${styles.cardBorder} ${styles.cardShadow}`}>
          <div className={`text-xs font-mono ${styles.mutedText}`}>
            صفحة <span className="font-bold text-emerald-500">{page}</span> من <span className="font-bold">{totalPages}</span>
            <span className="mr-2">({totalItems.toLocaleString("ar-EG")} حديث)</span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* First page */}
            <button
              disabled={page <= 1}
              onClick={() => {
                soundEngine.playTasbihClick();
                setPage(1);
              }}
              className={`p-2 rounded-xl border text-xs font-bold transition disabled:opacity-30 disabled:pointer-events-none ${styles.btnSecondary}`}
              title="الصفحة الأولى"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>

            {/* Previous page */}
            <button
              disabled={page <= 1}
              onClick={() => {
                soundEngine.playTasbihClick();
                setPage((prev) => Math.max(1, prev - 1));
              }}
              className={`px-3 py-2 rounded-xl border text-xs font-bold transition flex items-center gap-1 disabled:opacity-30 disabled:pointer-events-none ${styles.btnSecondary}`}
            >
              <ChevronRight className="w-4 h-4" />
              <span>السابقة</span>
            </button>

            {/* Next page */}
            <button
              disabled={page >= totalPages}
              onClick={() => {
                soundEngine.playTasbihClick();
                setPage((prev) => Math.min(totalPages, prev + 1));
              }}
              className={`px-3 py-2 rounded-xl border text-xs font-bold transition flex items-center gap-1 disabled:opacity-30 disabled:pointer-events-none ${styles.btnPrimary}`}
            >
              <span>التالية</span>
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Last page */}
            <button
              disabled={page >= totalPages}
              onClick={() => {
                soundEngine.playTasbihClick();
                setPage(totalPages);
              }}
              className={`p-2 rounded-xl border text-xs font-bold transition disabled:opacity-30 disabled:pointer-events-none ${styles.btnSecondary}`}
              title="الصفحة الأخيرة"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
