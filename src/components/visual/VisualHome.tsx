import React, { useState, useEffect, useRef } from "react";
import {
  Compass,
  Clock,
  BookOpen,
  MapPin,
  Sparkles,
  Info,
  Calendar,
  Volume2,
  VolumeX,
  BookMarked,
  Shield,
  Coins,
  ShieldCheck,
  RefreshCw,
  Sun,
  Moon,
  Tv,
  ListCheck,
  GraduationCap,
  ChevronLeft,
  Flame,
  Radio,
  Share2,
  Settings,
  Search,
  Filter,
  Heart,
  RadioTower,
  Headphones,
  HandHeart,
  Scale,
  EyeOff,
  HeartHandshake,
  Home,
  ArrowRight,
  Layers,
  Award,
  Palette,
} from "lucide-react";
import { soundEngine } from "../../utils/soundEngine";
import { speechEngine } from "../../utils/speechEngine";
import {
  calculatePrayerTimes,
  calculateQiblaBearing,
  formatRemainingTime,
  CITIES_PRESETS,
  CALCULATION_METHODS,
  CityPreset,
  detectUserAutoLocation,
} from "../../utils/prayerCalculator";
import { PrayerTimeItem, ThemeMode } from "../../types";
import { SqlitePrayerLog } from "./SqlitePrayerLog";
import { QuranComprehensiveView } from "./QuranComprehensiveView";
import { AthkarComprehensiveView } from "./AthkarComprehensiveView";
import { HisnMuslimComprehensiveView } from "./HisnMuslimComprehensiveView";
import { LecturesComprehensiveView } from "./LecturesComprehensiveView";
import { HadithComprehensiveView } from "./HadithComprehensiveView";
import { HijriCalendarView } from "./HijriCalendarView";
import { ZakatCalculatorView } from "./ZakatCalculatorView";
import { NearbyMosquesView } from "./NearbyMosquesView";
import { LiveBroadcastsView } from "./LiveBroadcastsView";
import { DuasComprehensiveView } from "./DuasComprehensiveView";
import { LaylatAlQadrView } from "./LaylatAlQadrView";
import { CairoQuranRadioPlayer } from "./CairoQuranRadioPlayer";
import { SourcesAndLicensesModal } from "./SourcesAndLicensesModal";
import { IslamicWelcomeFlow } from "../welcome/IslamicWelcomeFlow";
import { WorldClassIslamicIntroModal } from "../welcome/WorldClassIslamicIntroModal";
import { PWAInstallButton } from "../pwa/PWAInstallButton";
import { PWAInstallModal } from "../pwa/PWAInstallModal";
import { AdvancedSettingsModal } from "./AdvancedSettingsModal";
import { PrayerTimesDashboard } from "./PrayerTimesDashboard";
import { DigitalClockBadge } from "./DigitalClockBadge";
import { AthkarNotificationBanner } from "./AthkarNotificationBanner";
import { KhatmahProgressSection } from "./KhatmahProgressSection";
import { HourlyThikrWidget } from "./HourlyThikrWidget";
import { QuranLiveTvCard } from "./QuranLiveTvCard";
import { QiblaCompassView } from "./QiblaCompassView";
import { HumanitarianTakafulView } from "./HumanitarianTakafulView";
import { FatwaEncyclopediaView } from "./FatwaEncyclopediaView";
import { BlindCompanionTrainerGuide } from "./BlindCompanionTrainerGuide";
import { SubpageHero } from "./SubpageHero";
import { IslamicFooter } from "./IslamicFooter";
import { SupportUsModal } from "./SupportUsModal";
import { getThemeStyles } from "../../utils/themeClasses";
import { AchievementsModal } from "./AchievementsModal";
import { WallpaperSelectorModal } from "./WallpaperSelectorModal";
import { wallpaperManager, IslamicWallpaper } from "../../utils/wallpaperManager";
import { i18n } from "../../utils/i18n";
import { adhanService } from "../../services/adhanService";
import { AdhanAudioPlayerModal } from "./AdhanAudioPlayerModal";
import { AdhanPrayerBanner } from "./AdhanPrayerBanner";
import { prayerNotificationService } from "../../services/prayerNotificationService";

export const VisualHome: React.FC = () => {
  // Theme state supporting 4 profiles: natural, paper, night, light
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem("noor_theme");
    if (saved === "light" || saved === "paper" || saved === "night" || saved === "natural") {
      return saved as ThemeMode;
    }
    return "natural";
  });

  // Adhan state
  const [isAdhanModalOpen, setIsAdhanModalOpen] = useState(false);
  const [isAdhanPlaying, setIsAdhanPlaying] = useState(false);
  const [currentAdhanTitle, setCurrentAdhanTitle] = useState("");
  const [isAutoAdhanEnabled, setIsAutoAdhanEnabled] = useState(() => adhanService.isAutoAdhanEnabled());

  const handleThemeChange = (newTheme: ThemeMode) => {
    soundEngine.playTasbihClick();
    setTheme(newTheme);
    localStorage.setItem("noor_theme", newTheme);
    speechEngine.speakThemeFeedback(newTheme);
  };

  // Sync background body and HTML dark class to ensure perfect themes across the entire app
  useEffect(() => {
    const isDarkMode = theme === "natural" || theme === "night";
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    const bgMap: Record<ThemeMode, string> = {
      natural: "#061611",
      paper: "#FAF5EB",
      night: "#040608",
      light: "#F8FAFC",
    };
    document.body.style.backgroundColor = bgMap[theme] || "#061611";
    document.body.style.color =
      theme === "paper" ? "#2F1E12" : theme === "light" ? "#0F172A" : "#E4E4E7";
  }, [theme]);

  // Main active tab - starts on 'home' hub
  const [activeTab, setActiveTab] = useState<string>("home");

  useEffect(() => {
    const handleNavEvent = (e: any) => {
      if (e.detail?.tab) {
        setActiveTab(e.detail.tab);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };
    const handleThemeEvent = (e: any) => {
      if (e.detail?.theme && ["natural", "paper", "night", "light"].includes(e.detail.theme)) {
        setTheme(e.detail.theme);
        localStorage.setItem("noor_visual_theme", e.detail.theme);
      }
    };
    window.addEventListener("noor-navigate-tab", handleNavEvent);
    window.addEventListener("noor-set-theme", handleThemeEvent);
    return () => {
      window.removeEventListener("noor-navigate-tab", handleNavEvent);
      window.removeEventListener("noor-set-theme", handleThemeEvent);
    };
  }, []);

  const [isSourcesOpen, setIsSourcesOpen] = useState<boolean>(false);
  const [isWelcomeOpen, setIsWelcomeOpen] = useState<boolean>(false);
  const [isIntroModalOpen, setIsIntroModalOpen] = useState<boolean>(false);
  const [isPWAModalOpen, setIsPWAModalOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState<boolean>(false);
  const [isCompanionGuideOpen, setIsCompanionGuideOpen] = useState<boolean>(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState<boolean>(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState<boolean>(false);
  const [isWallpapersOpen, setIsWallpapersOpen] = useState<boolean>(false);
  const [activeWallpaper, setActiveWallpaper] = useState<IslamicWallpaper>(() =>
    wallpaperManager.getCurrentWallpaper()
  );
  const [wallpaperOpacity, setWallpaperOpacity] = useState<number>(() =>
    wallpaperManager.getOpacity()
  );
  const [wallpaperBlur, setWallpaperBlur] = useState<number>(() =>
    wallpaperManager.getBlur()
  );

  useEffect(() => {
    const handleWpChange = () => {
      setActiveWallpaper(wallpaperManager.getCurrentWallpaper());
      setWallpaperOpacity(wallpaperManager.getOpacity());
      setWallpaperBlur(wallpaperManager.getBlur());
    };
    const handleOpenAch = () => setIsAchievementsOpen(true);
    const handleOpenWp = () => setIsWallpapersOpen(true);

    window.addEventListener("noor-wallpaper-changed", handleWpChange);
    window.addEventListener("noor-open-achievements", handleOpenAch);
    window.addEventListener("noor-open-wallpapers", handleOpenWp);
    return () => {
      window.removeEventListener("noor-wallpaper-changed", handleWpChange);
      window.removeEventListener("noor-open-achievements", handleOpenAch);
      window.removeEventListener("noor-open-wallpapers", handleOpenWp);
    };
  }, []);

  // Sensory voice assistant mode for blind users (وضع البصيرة للمكفوفين)
  const [isBlindMode, setIsBlindMode] = useState<boolean>(() => speechEngine.isVoiceFeedback());

  const handleToggleBlindMode = () => {
    soundEngine.playTasbihClick();
    const nextState = speechEngine.toggleVoiceFeedback();
    setIsBlindMode(nextState);
  };

  // Advanced settings state
  const [asrJuristic, setAsrJuristic] = useState<"standard" | "hanafi">(() => {
    return (localStorage.getItem("noor_asr_juristic") as "standard" | "hanafi") || "standard";
  });
  const [fontSize, setFontSize] = useState<"normal" | "medium" | "large">(() => {
    return (localStorage.getItem("noor_font_size") as "normal" | "medium" | "large") || "normal";
  });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem("noor_sound_enabled") !== "false";
  });
  const [adhanReciter, setAdhanReciter] = useState<"makkah" | "madinah" | "quds">(() => {
    return (localStorage.getItem("noor_adhan_reciter") as any) || "makkah";
  });

  // Category filter & quick search
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Ref to smooth scroll to active content
  const activeContentRef = useRef<HTMLDivElement | null>(null);

  // Initial Startup Lifecycle: Intro check & PWA install popup check (never shows if user already installed)
  useEffect(() => {
    const hasSeenIntro = localStorage.getItem("noor_intro_completed");
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    const isMarkedInstalled = localStorage.getItem("noor_pwa_installed") === "true";
    const isSessionDismissed = localStorage.getItem("noor_pwa_dismissed_session") === "true";

    if (!hasSeenIntro) {
      setIsIntroModalOpen(true);
    } else if (!isStandalone && !isMarkedInstalled && !isSessionDismissed) {
      // Returning user who hasn't installed: open PWA install popup modal after load
      const timer = setTimeout(() => {
        setIsPWAModalOpen(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleIntroComplete = () => {
    setIsIntroModalOpen(false);
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    const isMarkedInstalled = localStorage.getItem("noor_pwa_installed") === "true";
    // If not already installed, show the PWA install popup modal
    if (!isStandalone && !isMarkedInstalled) {
      setTimeout(() => {
        setIsPWAModalOpen(true);
      }, 400);
    }
  };

  // Selected city & calculation method
  const [selectedCity, setSelectedCity] = useState<CityPreset & { isAutoDetected?: boolean }>(CITIES_PRESETS[0]);
  const [selectedMethod, setSelectedMethod] = useState("makkah");

  // Auto-detect user geographic location & timezone
  useEffect(() => {
    const runAutoLocation = async () => {
      setIsDetectingLocation(true);
      try {
        const autoPreset = await detectUserAutoLocation();
        setSelectedCity(autoPreset);
      } catch (e) {
        // Keep fallback
      } finally {
        setIsDetectingLocation(false);
      }
    };
    runAutoLocation();
  }, []);

  const handleRefreshLocation = async () => {
    soundEngine.playTasbihClick();
    setIsDetectingLocation(true);
    try {
      localStorage.removeItem("noor_auto_geo");
      const autoPreset = await detectUserAutoLocation();
      setSelectedCity(autoPreset);
    } catch (e) {
      // Keep existing
    } finally {
      setIsDetectingLocation(false);
    }
  };

  // Prayers calculation state
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimeItem[]>([]);
  const [countdownText, setCountdownText] = useState("");
  const [nextPrayerName, setNextPrayerName] = useState("");

  // Qibla Compass state
  const [qiblaBearing, setQiblaBearing] = useState(0);
  const [compassHeading, setCompassHeading] = useState(0);

  // Recalculate prayers and Qibla when city or method changes
  useEffect(() => {
    const times = calculatePrayerTimes(
      new Date(),
      selectedCity.lat,
      selectedCity.lng,
      selectedCity.timezone,
      selectedMethod
    );
    setPrayerTimes(times);

    const bearing = calculateQiblaBearing(selectedCity.lat, selectedCity.lng);
    setQiblaBearing(bearing);

    const nextP = times.find((p) => p.isNext);
    if (nextP) {
      setNextPrayerName(nextP.nameAr);
    }

    // Schedule local prayer notifications via Service Worker background alerts
    prayerNotificationService.scheduleUpcomingPrayers(times, selectedCity.nameAr);
  }, [selectedCity, selectedMethod]);

  // Adhan real-time synchronization and event handlers
  useEffect(() => {
    const unsub = adhanService.subscribe((s) => {
      setIsAdhanPlaying(s.isPlaying);
      const meta = adhanService.getActiveReciterMeta();
      setCurrentAdhanTitle(meta?.nameAr || "");
      setIsAutoAdhanEnabled(adhanService.isAutoAdhanEnabled());
    });
    setIsAdhanPlaying(adhanService.getIsPlaying());
    setCurrentAdhanTitle(adhanService.getActiveReciterMeta()?.nameAr || "");

    const handlePlayRequest = () => {
      setIsAdhanModalOpen(true);
      adhanService.play();
    };
    const handleStopRequest = () => {
      adhanService.stop();
    };

    window.addEventListener("noor-play-adhan-request", handlePlayRequest);
    window.addEventListener("noor-stop-adhan-request", handleStopRequest);

    return () => {
      unsub();
      window.removeEventListener("noor-play-adhan-request", handlePlayRequest);
      window.removeEventListener("noor-stop-adhan-request", handleStopRequest);
    };
  }, []);

  // Real-time Countdown timer loop & automatic Adhan trigger at prayer times
  useEffect(() => {
    const updateCountdown = () => {
      const nextP = prayerTimes.find((p) => p.isNext);
      if (nextP) {
        const remaining = formatRemainingTime(nextP.timestamp);
        setCountdownText(remaining.text);
      }

      // Check automatic prayer time Adhan trigger
      if (prayerTimes.length > 0) {
        adhanService.checkPrayerTimeTrigger(prayerTimes, selectedCity.nameAr);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [prayerTimes, selectedCity]);

  // Device orientation for 3D visual compass (throttled for high performance on lightweight devices)
  useEffect(() => {
    let lastHeadingUpdate = 0;
    let lastRecordedHeading = -999;
    const handleOrientation = (e: DeviceOrientationEvent) => {
      const now = Date.now();
      if (now - lastHeadingUpdate < 60) return; // Cap at ~16 FPS max to keep CPU light
      let heading: number | null = null;
      if ((e as any).webkitCompassHeading !== undefined) {
        heading = (e as any).webkitCompassHeading;
      } else if (e.alpha !== null) {
        heading = 360 - e.alpha;
      }
      if (heading !== null) {
        const rounded = Math.round(heading);
        if (Math.abs(rounded - lastRecordedHeading) >= 1) {
          lastHeadingUpdate = now;
          lastRecordedHeading = rounded;
          setCompassHeading(rounded);
        }
      }
    };

    window.addEventListener("deviceorientation", handleOrientation, true);
    return () => window.removeEventListener("deviceorientation", handleOrientation, true);
  }, []);

  // Hijri date string
  const today = new Date();
  const hijriFormatter = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const hijriDateStr = hijriFormatter.format(today);

  // Switch tab and smooth scroll to top with voice feedback strictly in blind mode (وضع البصيرة للمكفوفين)
  const handleTabSelect = (tabId: string) => {
    soundEngine.playTasbihClick();
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: "instant" });
    const selectedFunction = appFunctions.find((f) => f.id === tabId);
    if (speechEngine.isVoiceFeedback()) {
      if (selectedFunction) {
        speechEngine.speakNavFeedback(selectedFunction.title, selectedFunction.desc);
      } else {
        speechEngine.speakNavFeedback(tabId);
      }
    } else {
      if (selectedFunction) {
        speechEngine.announceForScreenReader(`قسم ${selectedFunction.title}`);
      }
    }
  };

  // Concise list of interactive functions with Quran & Worship first, and Takaful & Fatwa in the final section
  const appFunctions = [
    {
      id: "quran",
      category: "quran",
      title: "المصحف الشريف",
      soul: "مصحف المدينة المنورة",
      desc: "تلاوة وتفسير 604 صفحة",
      badge: "عثماني موثق",
      icon: <BookOpen className="w-5 h-5 text-emerald-500" />,
      color: "from-emerald-500/25 via-teal-500/15 to-transparent",
      border: "border-emerald-500/35 hover:border-emerald-500/70",
      accentBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
      counters: [
        { label: "صفحة", val: "604", color: "text-emerald-500 dark:text-emerald-400" },
        { label: "سورة", val: "114", color: "text-teal-500 dark:text-teal-400" },
        { label: "جزء", val: "30", color: "text-[#D4AF37]" },
      ],
    },
    {
      id: "prayers",
      category: "worship",
      title: "مواقيت الصلاة",
      soul: "حساب فلكي دقيق",
      desc: "مواقيت الصلاة وتنبيه الأذان",
      badge: "دقة فلكية",
      icon: <Clock className="w-5 h-5 text-amber-500" />,
      color: "from-amber-500/25 via-yellow-500/15 to-transparent",
      border: "border-amber-500/35 hover:border-amber-500/70",
      accentBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
      counters: [
        { label: "القادمة", val: nextPrayerName, color: "text-amber-500 dark:text-amber-400" },
        { label: "متبقي", val: countdownText.split(" ")[0] || "--", color: "text-emerald-500 dark:text-emerald-400" },
        { label: "فروض", val: "5", color: "text-[#D4AF37]" },
      ],
    },
    {
      id: "qibla",
      category: "worship",
      title: "بوصلة القبلة 3D",
      soul: "الكعبة المشرفة",
      desc: "توجيه حي وتفاعلي 360°",
      badge: "3D تفاعلي",
      icon: <Compass className="w-5 h-5 text-sky-500" />,
      color: "from-sky-500/25 via-blue-500/15 to-transparent",
      border: "border-sky-500/35 hover:border-sky-500/70",
      accentBg: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30",
      counters: [
        { label: "الزاوية", val: `${qiblaBearing}°`, color: "text-sky-500 dark:text-sky-400" },
        { label: "استشعار", val: "360°", color: "text-blue-500 dark:text-blue-400" },
        { label: "الوجهة", val: "مكة", color: "text-[#D4AF37]" },
      ],
    },
    {
      id: "athkar",
      category: "quran",
      title: "الأذكار والسبحة",
      soul: "حصن المسلم",
      desc: "أذكار الصباح والمساء والسبحة",
      badge: "عداد نبضي",
      icon: <BookMarked className="w-5 h-5 text-emerald-400" />,
      color: "from-emerald-600/25 via-teal-600/15 to-transparent",
      border: "border-emerald-500/35 hover:border-emerald-500/70",
      accentBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
      counters: [
        { label: "أذكار", val: "132+", color: "text-emerald-500 dark:text-emerald-400" },
        { label: "تسبيحة", val: "33", color: "text-teal-500 dark:text-teal-400" },
        { label: "الورد", val: "يومي", color: "text-[#D4AF37]" },
      ],
    },
    {
      id: "hisn_muslim",
      category: "quran",
      title: "حصن المسلم",
      soul: "أذكار الكتاب والسنة",
      desc: "قراءة صوتية فورية لكافة أبواب الأذكار",
      badge: "صوت وفضائل",
      icon: <Shield className="w-5 h-5 text-emerald-400" />,
      color: "from-emerald-600/30 via-teal-600/20 to-transparent",
      border: "border-emerald-500/40 hover:border-emerald-500/80",
      accentBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
      counters: [
        { label: "الأبواب", val: "12", color: "text-emerald-500 dark:text-emerald-400" },
        { label: "القراءة", val: "صوتية", color: "text-amber-500 dark:text-amber-400" },
        { label: "المصدر", val: "محققة", color: "text-[#D4AF37]" },
      ],
    },
    {
      id: "log",
      category: "worship",
      title: "سجل الصلوات",
      soul: "متابعة الفروض",
      desc: "توثيق الصلوات والسنن محلياً",
      badge: "سجل شخصي",
      icon: <ListCheck className="w-5 h-5 text-indigo-400" />,
      color: "from-indigo-500/25 via-purple-500/15 to-transparent",
      border: "border-indigo-500/35 hover:border-indigo-500/70",
      accentBg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
      counters: [
        { label: "الالتزام", val: "100%", color: "text-indigo-500 dark:text-indigo-400" },
        { label: "اليوم", val: "5/5", color: "text-purple-500 dark:text-purple-400" },
        { label: "التخزين", val: "آمن", color: "text-[#D4AF37]" },
      ],
    },
    {
      id: "hadith",
      category: "quran",
      title: "الحديث الشريف",
      soul: "صحيح البخاري ومسلم",
      desc: "أحاديث نبوية وشروحها المعتمدة",
      badge: "سند موثق",
      icon: <Sparkles className="w-5 h-5 text-yellow-400" />,
      color: "from-yellow-500/25 via-amber-500/15 to-transparent",
      border: "border-yellow-500/35 hover:border-yellow-500/70",
      accentBg: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30",
      counters: [
        { label: "حديث", val: "7,563", color: "text-yellow-500 dark:text-yellow-400" },
        { label: "الأصل", val: "البخاري", color: "text-amber-500 dark:text-amber-400" },
        { label: "الدرجة", val: "صحيح", color: "text-[#D4AF37]" },
      ],
    },
    {
      id: "lectures",
      category: "knowledge",
      title: "الدروس والمحاضرات",
      soul: "كبار العلماء",
      desc: "صوتيات ودروس علمية نافعة",
      badge: "صوتيات MP3",
      icon: <GraduationCap className="w-5 h-5 text-purple-400" />,
      color: "from-purple-500/25 via-pink-500/15 to-transparent",
      border: "border-purple-500/35 hover:border-purple-500/70",
      accentBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
      counters: [
        { label: "درس", val: "120+", color: "text-purple-500 dark:text-purple-400" },
        { label: "علماء", val: "24", color: "text-pink-500 dark:text-pink-400" },
        { label: "الاستماع", val: "أوفلاين", color: "text-[#D4AF37]" },
      ],
    },
    {
      id: "calendar",
      category: "knowledge",
      title: "التقويم الهجري",
      soul: "تقويم أم القرى",
      desc: "الأيام البيض ومواسم العبادة",
      badge: "أم القرى",
      icon: <Calendar className="w-5 h-5 text-teal-400" />,
      color: "from-teal-500/25 via-emerald-500/15 to-transparent",
      border: "border-teal-500/35 hover:border-teal-500/70",
      accentBg: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30",
      counters: [
        { label: "هجري", val: "1447", color: "text-teal-500 dark:text-teal-400" },
        { label: "البيض", val: "13-15", color: "text-emerald-500 dark:text-emerald-400" },
        { label: "التوثيق", val: "رسمي", color: "text-[#D4AF37]" },
      ],
    },
    {
      id: "zakat",
      category: "knowledge",
      title: "حاسبة الزكاة",
      soul: "فريضة الركن الثالث",
      desc: "حساب نصاب المال والذهب والفضة",
      badge: "حساب فوري",
      icon: <Coins className="w-5 h-5 text-amber-400" />,
      color: "from-amber-500/25 via-orange-500/15 to-transparent",
      border: "border-amber-500/35 hover:border-amber-500/70",
      accentBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
      counters: [
        { label: "النسبة", val: "2.5%", color: "text-amber-500 dark:text-amber-400" },
        { label: "نصاب ذهب", val: "85g", color: "text-orange-500 dark:text-orange-400" },
        { label: "النتيجة", val: "فورية", color: "text-[#D4AF37]" },
      ],
    },
    {
      id: "mosques",
      category: "worship",
      title: "المساجد القريبة",
      soul: "بيوت الله",
      desc: "ملاحة حية لأقرب مسجد بدقة GPS",
      badge: "ملاحة GPS",
      icon: <MapPin className="w-5 h-5 text-emerald-500" />,
      color: "from-emerald-500/25 via-cyan-500/15 to-transparent",
      border: "border-cyan-500/35 hover:border-cyan-500/70",
      accentBg: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30",
      counters: [
        { label: "ملاحة", val: "GPS", color: "text-cyan-500 dark:text-cyan-400" },
        { label: "الأقرب", val: "350m", color: "text-emerald-500 dark:text-emerald-400" },
        { label: "التوجيه", val: "مباشر", color: "text-[#D4AF37]" },
      ],
    },
    {
      id: "live",
      category: "media_ai",
      title: "البث المباشر",
      soul: "الحرمان الشريفان",
      desc: "بث مكة المكرمة والمدينة المنورة",
      badge: "24/7 HD",
      icon: <Tv className="w-5 h-5 text-rose-400" />,
      color: "from-rose-500/25 via-red-500/15 to-transparent",
      border: "border-rose-500/35 hover:border-rose-500/70",
      accentBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
      counters: [
        { label: "بث حي", val: "24/7", color: "text-rose-500 dark:text-rose-400" },
        { label: "قنوات", val: "2", color: "text-red-500 dark:text-red-400" },
        { label: "الجودة", val: "FHD", color: "text-[#D4AF37]" },
      ],
    },
    {
      id: "duas",
      category: "quran",
      title: "الأدعية المأثورة",
      soul: "الكتاب والسنة",
      desc: "أدعية مختارة مع تكرار صوتي",
      badge: "تكرار صوتي",
      icon: <Heart className="w-5 h-5 text-rose-500" />,
      color: "from-rose-500/25 via-pink-500/15 to-transparent",
      border: "border-rose-500/35 hover:border-rose-500/70",
      accentBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
      counters: [
        { label: "أدعية", val: "69", color: "text-rose-500 dark:text-rose-400" },
        { label: "تصنيفات", val: "4", color: "text-pink-500 dark:text-pink-400" },
        { label: "التكرار", val: "صوتي", color: "text-[#D4AF37]" },
      ],
    },
    {
      id: "laylat_qadr",
      category: "knowledge",
      title: "ليلة القدر المباركة",
      soul: "خير من ألف شهر",
      desc: "فضائل وأدعية العشر الأواخر",
      badge: "العشر الأواخر",
      icon: <Moon className="w-5 h-5 text-amber-400" />,
      color: "from-amber-500/25 via-yellow-500/15 to-transparent",
      border: "border-amber-500/35 hover:border-amber-500/70",
      accentBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
      counters: [
        { label: "الفضل", val: "1000 شهر", color: "text-amber-500 dark:text-amber-400" },
        { label: "العلامات", val: "موثقة", color: "text-emerald-500 dark:text-emerald-400" },
        { label: "العبادة", val: "83 سنة", color: "text-[#D4AF37]" },
      ],
    },
    {
      id: "cairo_radio",
      category: "media_ai",
      title: "إذاعة القاهرة",
      soul: "إذاعة القرآن الكريم",
      desc: "بث مباشر 24 ساعة دون انقطاع",
      badge: "بث حي FM",
      icon: <RadioTower className="w-5 h-5 text-emerald-500" />,
      color: "from-emerald-500/25 via-teal-500/15 to-transparent",
      border: "border-emerald-500/35 hover:border-emerald-500/70",
      accentBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
      counters: [
        { label: "بث حي", val: "24/7", color: "text-emerald-500 dark:text-emerald-400" },
        { label: "الموجة", val: "FM", color: "text-amber-500 dark:text-amber-400" },
        { label: "الجودة", val: "HQ", color: "text-[#D4AF37]" },
      ],
    },
    {
      id: "fatwa",
      category: "knowledge",
      title: "الفتاوى الشرعية",
      soul: "دار الإفتاء والأزهر",
      desc: "فتاوى موثقة وبحث فوري معتمد",
      badge: "معتمد وموثق",
      icon: <Scale className="w-5 h-5 text-[#D4AF37]" />,
      color: "from-amber-600/30 via-[#D4AF37]/20 to-transparent",
      border: "border-[#D4AF37]/60 hover:border-[#D4AF37]/90",
      accentBg: "bg-[#D4AF37]/15 text-[#B68C1C] dark:text-[#F3E7C4] border-[#D4AF37]/40",
      counters: [
        { label: "المصدر", val: "رسمي", color: "text-[#D4AF37]" },
        { label: "البحث", val: "فوري", color: "text-emerald-500 dark:text-emerald-400" },
        { label: "التوجيه", val: "مباشر", color: "text-teal-500 dark:text-teal-400" },
      ],
    },
    {
      id: "takaful",
      category: "takaful",
      title: "تكافل الخير",
      soul: "كفالة وإعانة الأسر",
      desc: "كفالة أيتام، علاج، وسداد ديون",
      badge: "دعم مباشر",
      icon: <HandHeart className="w-5 h-5 text-emerald-400" />,
      color: "from-emerald-600/30 via-[#D4AF37]/20 to-transparent",
      border: "border-[#D4AF37]/60 hover:border-[#D4AF37]/90",
      accentBg: "bg-[#D4AF37]/15 text-[#B68C1C] dark:text-[#F3E7C4] border-[#D4AF37]/40",
      counters: [
        { label: "العمولة", val: "0%", color: "text-emerald-500 dark:text-emerald-400" },
        { label: "الخصوصية", val: "100%", color: "text-[#D4AF37]" },
        { label: "المرفقات", val: "موثقة", color: "text-teal-500 dark:text-teal-400" },
      ],
    },
  ];

  // Theme variation booleans & styles
  const styles = getThemeStyles(theme);
  const isPaper = theme === "paper";
  const isLight = theme === "light";
  const isNight = theme === "night";
  const isNatural = theme === "natural";
  const isDark = theme === "night" || theme === "natural";

  // Subpage or Home Hub state helpers
  const isHome = activeTab === "home";
  const currentFn = appFunctions.find((f) => f.id === activeTab);
  const categoryLabelMap: Record<string, string> = {
    takaful: "تكافل الخير والبر",
    worship: "الصلوات والعبادات",
    quran: "القرآن والسنة النبوية",
    knowledge: "المعارف والعلوم الشرعية",
    media_ai: "البث المباشر والوسائط",
  };

  // Filter functions by active category and search query
  const filteredFunctions = appFunctions.filter((fn) => {
    const matchCategory = selectedCategory === "all" || fn.category === selectedCategory;
    const matchQuery =
      !searchQuery.trim() ||
      fn.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fn.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fn.soul.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchQuery;
  });

  return (
    <div
      id="visual-home-root"
      dir="rtl"
      className={`min-h-screen w-full transition-colors duration-300 relative overflow-x-hidden ${
        isNatural
          ? "bg-[#061611] text-[#E6F4EA]"
          : isPaper
          ? "bg-[#FAF5EB] text-[#2F1E12]"
          : isNight
          ? "bg-[#040608] text-[#F1F5F9]"
          : "bg-[#F8FAFB] text-[#0F172A]"
      }`}
    >
      {/* ========================================================================= */}
      {/* 1. AUTHENTIC ISLAMIC BACKGROUND TEXTURE & AMBIENT ANIMATIONS */}
      {/* ========================================================================= */}
      {/* Authentic Islamic Geometric Pattern Texture */}
      <div
        className="fixed inset-0 pointer-events-none z-0 mix-blend-overlay transition-opacity duration-500 animate-pulse-glow"
        style={{
          backgroundImage: `url('/app-logo.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: isPaper ? 0.05 : isLight ? 0.04 : isNatural ? 0.08 : 0.06,
        }}
      />

      {/* Dynamic Time-of-Day Islamic Art Wallpaper */}
      <div
        className="fixed inset-0 pointer-events-none z-0 transition-all duration-1000"
        style={{
          background: activeWallpaper.gradient,
          opacity: wallpaperOpacity,
        }}
      />
      <div
        className="fixed inset-0 pointer-events-none z-0 transition-all duration-1000"
        style={{
          backgroundImage: activeWallpaper.svgPattern,
          opacity: wallpaperOpacity * 1.6,
          filter: wallpaperBlur > 0 ? `blur(${wallpaperBlur}px)` : undefined,
        }}
      />

      {/* Floating Animated Light Orbs for Movement, Life, and Spirit */}
      <div className={`fixed top-10 right-1/4 w-80 h-80 rounded-full blur-3xl pointer-events-none z-0 animate-float-slow ${
        isPaper ? "bg-[#D4AF37]/5" : isLight ? "bg-emerald-500/8" : "bg-emerald-500/10"
      }`} />
      <div className={`fixed bottom-20 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none z-0 animate-float-slow [animation-delay:2s] ${
        isPaper ? "bg-[#8C5E24]/5" : "bg-[#D4AF37]/10"
      }`} />

      {/* Floating Islamic Geometry Accent */}
      <div className="fixed -top-16 -left-16 w-64 h-64 border border-[#D4AF37]/10 rounded-full pointer-events-none z-0 animate-spin-veryslow hidden sm:block" />
      <div className="fixed -bottom-16 -right-16 w-72 h-72 border border-emerald-500/10 rounded-full pointer-events-none z-0 animate-spin-veryslow hidden sm:block" />

      {/* ========================================================================= */}
      {/* 2. MAIN FLUID RESPONSIVE CONTAINER */}
      {/* ========================================================================= */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-2.5 sm:px-5 lg:px-8 py-2.5 sm:py-5 pb-24 sm:pb-28 space-y-3.5 sm:space-y-5">
        
        {/* ========================================================================= */}
        {/* 3. NEW GRAND RESPONSIVE HEADER WITH WIDE OFFICIAL LOGO & 4-THEME SWITCHER */}
        {/* ========================================================================= */}
        <header
          id="visual-top-header"
          className={`rounded-2xl sm:rounded-3xl p-3 sm:p-4.5 transition-all shadow-md border relative overflow-hidden ${
            isNatural
              ? "bg-[#0A221A]/95 border-emerald-500/30 text-white backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
              : isPaper
              ? "bg-[#FFFDF9]/95 border-[#D6C5A9] text-[#2F1E12] backdrop-blur-xl shadow-[0_4px_20px_rgba(180,150,110,0.15)]"
              : isNight
              ? "bg-[#0A0F17]/95 border-slate-800 text-white backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.6)]"
              : "bg-white/95 border-emerald-600/25 text-[#0F172A] shadow-[0_4px_20px_rgba(212,175,55,0.08)] backdrop-blur-xl"
          }`}
        >
          {/* Subtle Top Golden Accent Line */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-75" />

          {/* ========================================================================= */}
          {/* MOBILE-ONLY SPIRITUAL PRESENTATION (شعار كبير مناسب بأشعة ضوئية مميزة فوق التاريخ مع إخفاء الاسم بالكامل في الرئيسية) */}
          {/* ========================================================================= */}
          {isHome ? (
            <div className="flex sm:hidden flex-col items-center justify-center text-center w-full pt-3 pb-2 space-y-3">
              {/* Grand Spiritual Animated Logo with Radiant Light Rays & Divine Glow (شعاع ضوئي نير مميز) */}
              <div
                onClick={() => {
                  soundEngine.playTasbihClick();
                  handleTabSelect("home");
                }}
                className="relative flex items-center justify-center w-36 h-36 cursor-pointer active:scale-95 transition-transform"
                title="القائمة الرئيسية"
              >
                {/* Outer Glowing Green Aura & Celestial Ambient Glow (شعاع أخضر متوهج) */}
                <div className="absolute -inset-6 rounded-full bg-gradient-to-r from-emerald-500/40 via-teal-400/50 to-emerald-500/40 blur-3xl animate-pulse pointer-events-none" />

                {/* Radiant Spinning Green Light Beam Rays (الشعاع الأخضر المتوهج المميز الممتد) */}
                <div
                  className="absolute -inset-8 rounded-full animate-spin-veryslow pointer-events-none opacity-90"
                  style={{
                    background:
                      "conic-gradient(from 0deg, transparent 0deg, rgba(16,185,129,0.7) 10deg, transparent 20deg, rgba(52,211,153,0.85) 35deg, transparent 50deg, rgba(16,185,129,0.7) 65deg, transparent 80deg, rgba(5,150,105,0.8) 95deg, transparent 110deg, rgba(52,211,153,0.85) 125deg, transparent 140deg, rgba(16,185,129,0.7) 155deg, transparent 170deg, rgba(52,211,153,0.85) 185deg, transparent 200deg, rgba(16,185,129,0.7) 215deg, transparent 230deg, rgba(5,150,105,0.8) 245deg, transparent 260deg, rgba(52,211,153,0.85) 275deg, transparent 290deg, rgba(16,185,129,0.7) 305deg, transparent 320deg, rgba(52,211,153,0.85) 335deg, transparent 350deg, rgba(16,185,129,0.7) 360deg)",
                    WebkitMaskImage: "radial-gradient(circle, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 78%)",
                    maskImage: "radial-gradient(circle, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 78%)",
                  }}
                />

                {/* Decorative Concentric Dashed Green Ring */}
                <div className="absolute -inset-2 rounded-full border-2 border-dashed border-emerald-400/80 animate-[spin_50s_linear_infinite] pointer-events-none" />

                {/* Inner Pulsing Sacred Ring */}
                <div className="absolute -inset-0.5 rounded-3xl border border-emerald-400/60 animate-pulse pointer-events-none" />

                {/* Official Grand Logo Container - Preserving exact outer container, logo image enlarged inside */}
                <div
                  className={`relative w-32 h-32 rounded-3xl p-1 flex items-center justify-center border-2 border-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.6),inset_0_0_15px_rgba(5,150,105,0.4)] backdrop-blur-xl overflow-hidden ${
                    isPaper
                      ? "bg-gradient-to-br from-[#FFF9F0]/90 via-[#F5EEE2]/95 to-[#EAE0CD]/90"
                      : isLight
                      ? "bg-gradient-to-br from-white/95 via-emerald-50/95 to-teal-50/90 shadow-emerald-900/10"
                      : "bg-gradient-to-br from-[#071D16]/95 via-[#0C2B22]/95 to-[#04140F]/95"
                  }`}
                >
                  <img
                    src="https://i.ibb.co/pBdt7pHC/3.png"
                    alt="شعار مشروع النور الإسلامي"
                    className="w-full h-full object-contain scale-130 filter drop-shadow-[0_8px_24px_rgba(16,185,129,0.85)] hover:scale-140 transition-transform duration-300"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/app-logo.png";
                    }}
                    referrerPolicy="no-referrer"
                  />

                  {/* Subtle Spiritual Badge on Corner */}
                  <span className="absolute -bottom-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-md border border-white/40">
                    النور
                  </span>
                </div>
              </div>

              {/* Hijri Date and Digital Clock directly below the radiant logo */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                <DigitalClockBadge theme={theme} />
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                  <span>{hijriDateStr || "٢٥ ربيع الأول ١٤٤٨ هـ"}</span>
                </div>
              </div>
            </div>
          ) : (
            /* Subpage Compact Mobile Bar */
            <div className="flex sm:hidden items-center justify-between gap-2 w-full py-1 border-b border-emerald-500/15 mb-2">
              <button
                onClick={() => handleTabSelect("home")}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold text-xs shadow-xs active:scale-95 transition cursor-pointer"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>الرئيسية</span>
              </button>
              <div className="flex items-center gap-1.5 truncate">
                <div className="w-6 h-6 rounded-lg bg-[#D4AF37]/15 flex items-center justify-center shrink-0">
                  {currentFn?.icon || <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />}
                </div>
                <span className="text-xs font-black font-alexandria text-[#D4AF37] dark:text-[#F3E7C4] truncate">
                  {currentFn?.title || "مشروع النور"}
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
            
            {/* Desktop-only: Project Title in ONE single line as requested */}
            <div className="hidden sm:flex items-center gap-2.5 w-full lg:w-auto justify-between lg:justify-start shrink-0">
              <div
                onClick={() => handleTabSelect("home")}
                className="flex items-center gap-2.5 whitespace-nowrap cursor-pointer hover:opacity-90 transition active:scale-98"
                title="العودة للقائمة الرئيسية"
              >
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border shadow-xs shrink-0 ${
                  isPaper
                    ? "bg-[#8C5E24] text-white border-[#D6C5A9]"
                    : isLight
                    ? "bg-emerald-500/15 text-emerald-800 border-emerald-500/30"
                    : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                }`}>
                  <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div className="flex items-baseline gap-2 whitespace-nowrap">
                  <h1 className={`text-base sm:text-lg font-black font-alexandria whitespace-nowrap leading-none ${styles.titleText}`}>
                    مشروع النور الإسلامي
                  </h1>
                  <span className="text-[10px] sm:text-[11px] font-bold whitespace-nowrap hidden sm:inline text-amber-500/80">
                    • المصحف • الأذكار • الصلاة • الفتاوى
                  </span>
                </div>
              </div>

              {/* Home Navigation Button when inside a subpage */}
              {!isHome && (
                <button
                  id="btn-header-back-home"
                  onClick={() => handleTabSelect("home")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer whitespace-nowrap"
                  title="العودة للقائمة الرئيسية"
                  aria-label="العودة للقائمة الرئيسية"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>الرئيسية</span>
                </button>
              )}

              {/* Desktop Digital Clock with Audio Readout & Hijri Date Badge */}
              <div className="flex items-center gap-2">
                <DigitalClockBadge theme={theme} />
                <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border whitespace-nowrap bg-emerald-500/10 border-emerald-500/25 text-emerald-700 dark:text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>٢٥ ربيع الأول ١٤٤٨ هـ</span>
                </div>
              </div>
            </div>

            {/* Quick Actions Bar under Logo & Title: Horizontal Scrollable Ribbon with Full, Non-Truncated Arabic Labels */}
            <div
              id="header-quick-actions-bar"
              className="flex items-center gap-2 sm:gap-2.5 w-full pt-3 border-t border-emerald-500/20 overflow-x-auto pb-2 scrollbar-none px-1 justify-start lg:justify-between"
            >
              {/* 1. وضع البصيرة للمكفوفين (Voice Sensory Mode) */}
              <button
                id="btn-blind-mode-toggle"
                onClick={handleToggleBlindMode}
                className={`flex-shrink-0 flex flex-col items-center justify-center min-w-[70px] sm:min-w-[76px] px-2 py-1.5 rounded-2xl transition-all active:scale-95 cursor-pointer group ${
                  isBlindMode
                    ? "bg-emerald-600/20 border border-emerald-400/60"
                    : "hover:bg-black/5 dark:hover:bg-white/5"
                }`}
                title={isBlindMode ? "وضع البصيرة للمكفوفين: مفعّل" : "تفعيل وضع البصيرة للمكفوفين والمساعد الصوتي"}
                aria-label="تبديل وضع البصيرة للمكفوفين والمساعد الصوتي"
              >
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center relative transition-transform group-hover:scale-105 ${
                    isBlindMode
                      ? "bg-emerald-600 text-white border-emerald-400 shadow-md ring-2 ring-emerald-500/40"
                      : isNatural
                      ? "bg-[#0F2F23] text-emerald-300 border-emerald-500/30"
                      : isPaper
                      ? "bg-[#FAF5EB] text-[#3D2817] border-[#D6C5A9]"
                      : isNight
                      ? "bg-[#0D141F] text-slate-300 border-slate-800"
                      : "bg-emerald-500/10 text-emerald-900 border-emerald-500/25"
                  }`}
                >
                  <EyeOff className={`w-4 h-4 ${isBlindMode ? "text-white" : "text-emerald-500"}`} />
                  {isBlindMode && (
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full animate-ping" />
                  )}
                </div>
                <span className="text-[11px] sm:text-xs font-bold text-center mt-1 whitespace-nowrap leading-tight text-slate-700 dark:text-slate-200">
                  البصيرة
                </span>
              </button>

              {/* 2. سماع الأذان المبارك */}
              <button
                id="btn-quick-adhan"
                onClick={() => {
                  soundEngine.playTasbihClick();
                  setIsAdhanModalOpen(true);
                }}
                className={`flex-shrink-0 flex flex-col items-center justify-center min-w-[70px] sm:min-w-[76px] px-2 py-1.5 rounded-2xl transition-all active:scale-95 cursor-pointer group ${
                  isAdhanPlaying
                    ? "bg-amber-500/20 border border-amber-400/60 animate-pulse"
                    : "hover:bg-black/5 dark:hover:bg-white/5"
                }`}
                title="سماع الأذان بصوت الحرم المكي الشريف والمساجد الكبرى"
                aria-label="سماع الأذان"
              >
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center relative transition-transform group-hover:scale-105 ${
                    isAdhanPlaying
                      ? "bg-amber-600 text-white border-amber-400 shadow-md"
                      : isNatural
                      ? "bg-emerald-600/30 text-[#D4AF37] border-emerald-500/40"
                      : isPaper
                      ? "bg-[#FAF5EB] text-[#B68C1C] border-[#D6C5A9]"
                      : isNight
                      ? "bg-[#0D141F] text-[#D4AF37] border-slate-800"
                      : "bg-emerald-500/10 text-emerald-800 border-emerald-500/25"
                  }`}
                >
                  <Volume2 className="w-4 h-4 text-[#D4AF37]" />
                  {isAdhanPlaying && (
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-400 border-2 border-white rounded-full animate-ping" />
                  )}
                </div>
                <span className="text-[11px] sm:text-xs font-bold text-center mt-1 whitespace-nowrap leading-tight text-slate-700 dark:text-slate-200">
                  سماع الأذان
                </span>
              </button>

              {/* 3. الرفيق الإسلامي الذكي */}
              <button
                id="btn-voice-companion-header"
                onClick={() => {
                  soundEngine.playAssistantActivate();
                  window.dispatchEvent(new CustomEvent("noor-open-voice-companion"));
                }}
                className="flex-shrink-0 flex flex-col items-center justify-center min-w-[70px] sm:min-w-[76px] px-2 py-1.5 rounded-2xl transition-all active:scale-95 cursor-pointer group hover:bg-black/5 dark:hover:bg-white/5"
                title="استدعاء الرفيق الإسلامي الذكي (أوامر صوتية وبحث شامل)"
                aria-label="استدعاء الرفيق الإسلامي الذكي"
              >
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-105 relative ${
                    isNatural
                      ? "bg-emerald-600/30 text-emerald-200 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                      : isPaper
                      ? "bg-[#D4AF37]/20 text-[#8C5E24] border-[#D4AF37]/40"
                      : isNight
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : "bg-emerald-600 text-white border-emerald-600"
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-[#D4AF37] animate-pulse" />
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                </div>
                <span className="text-[11px] sm:text-xs font-bold text-center mt-1 whitespace-nowrap leading-tight text-slate-700 dark:text-slate-200">
                  الرفيق الذكي
                </span>
              </button>

              {/* 4. دليل المرافق لتدريب الكفيف */}
              <button
                id="btn-companion-guide-toggle"
                onClick={() => {
                  soundEngine.playTasbihClick();
                  setIsCompanionGuideOpen(true);
                  speechEngine.speakEgyptian(
                    "أهلاً بيك في دليل المرافق لتدريب الكفيف. استمع للشرح الصوتي بالمصرية وتدرب على الإيماءات اللمسية."
                  );
                }}
                className="flex-shrink-0 flex flex-col items-center justify-center min-w-[70px] sm:min-w-[76px] px-2 py-1.5 rounded-2xl transition-all active:scale-95 cursor-pointer group hover:bg-black/5 dark:hover:bg-white/5"
                title="دليل المرافق لتدريب الكفيف • شرح صوتي بالمصرية 🇪🇬"
                aria-label="فتح دليل المرافق لتدريب الكفيف"
              >
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center relative transition-transform group-hover:scale-105 ${
                    isNatural
                      ? "bg-[#0F2F23] text-[#D4AF37] border-emerald-500/30"
                      : isPaper
                      ? "bg-[#FAF5EB] text-[#B68C1C] border-[#D6C5A9]"
                      : isNight
                      ? "bg-[#0D141F] text-amber-400 border-slate-800"
                      : "bg-amber-500/10 text-amber-800 border-amber-500/25"
                  }`}
                >
                  <HeartHandshake className="w-4 h-4 text-[#D4AF37]" />
                  <span className="absolute -top-1 -right-1 text-[7px] px-1 rounded-full bg-amber-500 text-slate-950 font-black">
                    🇪🇬
                  </span>
                </div>
                <span className="text-[11px] sm:text-xs font-bold text-center mt-1 whitespace-nowrap leading-tight text-slate-700 dark:text-slate-200">
                  دليل المرافق
                </span>
              </button>

              {/* 5. موقع GPS وتحديث الإحداثيات */}
              <button
                id="btn-refresh-location"
                onClick={handleRefreshLocation}
                disabled={isDetectingLocation}
                className="flex-shrink-0 flex flex-col items-center justify-center min-w-[70px] sm:min-w-[76px] px-2 py-1.5 rounded-2xl transition-all active:scale-95 cursor-pointer group hover:bg-black/5 dark:hover:bg-white/5"
                title={`الموقع: ${selectedCity.nameAr} • اضغط لتحديث GPS`}
                aria-label="تحديث موقع الـ GPS"
              >
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-105 ${
                    isNatural
                      ? "bg-[#0F2F23] text-emerald-300 border-emerald-500/30"
                      : isPaper
                      ? "bg-[#FAF5EB] text-[#3D2817] border-[#D6C5A9]"
                      : isNight
                      ? "bg-[#0D141F] text-slate-300 border-slate-800"
                      : "bg-emerald-500/10 text-emerald-900 border-emerald-500/25"
                  }`}
                >
                  {isDetectingLocation ? (
                    <RefreshCw className="w-4 h-4 text-emerald-500 animate-spin" />
                  ) : (
                    <MapPin className="w-4 h-4 text-emerald-500" />
                  )}
                </div>
                <span className="text-[11px] sm:text-xs font-bold text-center mt-1 whitespace-nowrap leading-tight text-slate-700 dark:text-slate-200">
                  تحديث GPS
                </span>
              </button>

              {/* 6. شاشة الانترو والاستفتاح المبارك */}
              <button
                id="btn-welcome-flow"
                onClick={() => {
                  soundEngine.playTasbihClick();
                  setIsIntroModalOpen(true);
                }}
                className="flex-shrink-0 flex flex-col items-center justify-center min-w-[70px] sm:min-w-[76px] px-2 py-1.5 rounded-2xl transition-all active:scale-95 cursor-pointer group hover:bg-black/5 dark:hover:bg-white/5"
                title="شاشة الانترو والاستفتاح (بصوت القارئ)"
                aria-label="عرض الانترو والتهيئة الرسمية"
              >
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-105 ${
                    isNatural
                      ? "bg-[#0F2F23] text-[#D4AF37] border-emerald-500/30"
                      : isPaper
                      ? "bg-[#FAF5EB] text-[#B68C1C] border-[#D6C5A9]"
                      : isNight
                      ? "bg-[#0D141F] text-[#D4AF37] border-slate-800"
                      : "bg-emerald-500/10 text-amber-700 border-emerald-500/25"
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                </div>
                <span className="text-[11px] sm:text-xs font-bold text-center mt-1 whitespace-nowrap leading-tight text-slate-700 dark:text-slate-200">
                  الانترو
                </span>
              </button>

              {/* 7. المظهر والألوان */}
              <button
                id="btn-theme-cycle"
                onClick={() => {
                  soundEngine.playTasbihClick();
                  const modes: ThemeMode[] = ["natural", "paper", "night", "light"];
                  const curIdx = modes.indexOf(theme);
                  const nextTheme = modes[(curIdx + 1) % modes.length];
                  handleThemeChange(nextTheme);
                }}
                className="flex-shrink-0 flex flex-col items-center justify-center min-w-[70px] sm:min-w-[76px] px-2 py-1.5 rounded-2xl transition-all active:scale-95 cursor-pointer group hover:bg-black/5 dark:hover:bg-white/5"
                title={`المظهر: ${theme === 'natural' ? 'طبيعي 🌿' : theme === 'paper' ? 'ورقي 📜' : theme === 'night' ? 'ليلي 🌙' : 'فاتح ☀️'} (اضغط للتبديل)`}
                aria-label="تبديل مظهر التطبيق"
              >
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center text-sm transition-transform group-hover:scale-105 ${
                    isNatural
                      ? "bg-[#0F2F23] border-emerald-500/30"
                      : isPaper
                      ? "bg-[#FAF5EB] border-[#D6C5A9]"
                      : isNight
                      ? "bg-[#0D141F] border-slate-800"
                      : "bg-emerald-500/10 border-emerald-500/25"
                  }`}
                >
                  <span>{theme === "natural" ? "🌿" : theme === "paper" ? "📜" : theme === "night" ? "🌙" : "☀️"}</span>
                </div>
                <span className="text-[11px] sm:text-xs font-bold text-center mt-1 whitespace-nowrap leading-tight text-slate-700 dark:text-slate-200">
                  المظهر
                </span>
              </button>

              {/* 8. التقويم الهجري */}
              <button
                id="btn-calendar-quick"
                onClick={() => handleTabSelect("calendar")}
                className="flex-shrink-0 flex flex-col items-center justify-center min-w-[70px] sm:min-w-[76px] px-2 py-1.5 rounded-2xl transition-all active:scale-95 cursor-pointer group hover:bg-black/5 dark:hover:bg-white/5"
                title={`التقويم الهجري: ${hijriDateStr}`}
                aria-label="عرض التقويم الهجري"
              >
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-105 ${
                    isNatural
                      ? "bg-[#0F2F23] text-teal-300 border-emerald-500/30"
                      : isPaper
                      ? "bg-[#FAF5EB] text-[#3D2817] border-[#D6C5A9]"
                      : isNight
                      ? "bg-[#0D141F] text-teal-300 border-slate-800"
                      : "bg-emerald-500/10 text-teal-800 border-emerald-500/25"
                  }`}
                >
                  <Calendar className="w-4 h-4 text-teal-500" />
                </div>
                <span className="text-[11px] sm:text-xs font-bold text-center mt-1 whitespace-nowrap leading-tight text-slate-700 dark:text-slate-200">
                  التقويم
                </span>
              </button>

              {/* 9. تكافل الحالات الإنسانية والوقف */}
              <button
                id="btn-takaful-quick"
                onClick={() => handleTabSelect("takaful")}
                className="flex-shrink-0 flex flex-col items-center justify-center min-w-[70px] sm:min-w-[76px] px-2 py-1.5 rounded-2xl transition-all active:scale-95 cursor-pointer group hover:bg-black/5 dark:hover:bg-white/5"
                title="تكافل البر وصون المتعففين ومحافظ الدعم"
                aria-label="تكافل البر والحالات الإنسانية"
              >
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-105 ${
                    isNatural
                      ? "bg-[#0F2F23] text-rose-300 border-emerald-500/30"
                      : isPaper
                      ? "bg-[#FAF5EB] text-rose-800 border-[#D6C5A9]"
                      : isNight
                      ? "bg-[#0D141F] text-rose-400 border-slate-800"
                      : "bg-emerald-500/10 text-rose-700 border-emerald-500/25"
                  }`}
                >
                  <HandHeart className="w-4 h-4 text-rose-500" />
                </div>
                <span className="text-[11px] sm:text-xs font-bold text-center mt-1 whitespace-nowrap leading-tight text-slate-700 dark:text-slate-200">
                  تكافل البر
                </span>
              </button>

              {/* 10. الأوسمة والإنجازات الروحانية */}
              <button
                id="btn-achievements-quick"
                onClick={() => {
                  soundEngine.playTasbihClick();
                  setIsAchievementsOpen(true);
                }}
                className="flex-shrink-0 flex flex-col items-center justify-center min-w-[70px] sm:min-w-[76px] px-2 py-1.5 rounded-2xl transition-all active:scale-95 cursor-pointer group hover:bg-black/5 dark:hover:bg-white/5"
                title="أوسمة وإنجازات الختمات والصلوات والأذكار"
                aria-label="فتح الأوسمة والإنجازات"
              >
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-105 relative ${
                    isNatural
                      ? "bg-[#0F2F23] text-amber-400 border-amber-500/40"
                      : isPaper
                      ? "bg-[#FAF5EB] text-amber-700 border-[#D6C5A9]"
                      : isNight
                      ? "bg-[#0D141F] text-amber-400 border-slate-800"
                      : "bg-amber-500/10 text-amber-800 border-amber-500/25"
                  }`}
                >
                  <Award className="w-4 h-4 text-amber-400" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full animate-ping" />
                </div>
                <span className="text-[11px] sm:text-xs font-bold text-center mt-1 whitespace-nowrap leading-tight text-slate-700 dark:text-slate-200">
                  الأوسمة
                </span>
              </button>

              {/* 11. خلفيات الفن الإسلامي */}
              <button
                id="btn-wallpapers-quick"
                onClick={() => {
                  soundEngine.playTasbihClick();
                  setIsWallpapersOpen(true);
                }}
                className="flex-shrink-0 flex flex-col items-center justify-center min-w-[70px] sm:min-w-[76px] px-2 py-1.5 rounded-2xl transition-all active:scale-95 cursor-pointer group hover:bg-black/5 dark:hover:bg-white/5"
                title="خلفيات الفن الإسلامي التجريدي حسب أوقات اليوم والصلاة"
                aria-label="تغيير خلفيات الفن الإسلامي"
              >
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-105 ${
                    isNatural
                      ? "bg-[#0F2F23] text-emerald-300 border-emerald-500/30"
                      : isPaper
                      ? "bg-[#FAF5EB] text-emerald-800 border-[#D6C5A9]"
                      : isNight
                      ? "bg-[#0D141F] text-emerald-400 border-slate-800"
                      : "bg-emerald-500/10 text-emerald-700 border-emerald-500/25"
                  }`}
                >
                  <Palette className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-[11px] sm:text-xs font-bold text-center mt-1 whitespace-nowrap leading-tight text-slate-700 dark:text-slate-200">
                  الخلفيات
                </span>
              </button>

              {/* 12. الإعدادات المتقدمة */}
              <button
                id="btn-settings-open"
                onClick={() => {
                  soundEngine.playTasbihClick();
                  setIsSettingsOpen(true);
                }}
                className="flex-shrink-0 flex flex-col items-center justify-center min-w-[70px] sm:min-w-[76px] px-2 py-1.5 rounded-2xl transition-all active:scale-95 cursor-pointer group hover:bg-black/5 dark:hover:bg-white/5"
                title="الإعدادات والخصائص المتطورة"
                aria-label="فتح الإعدادات"
              >
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-105 ${
                    isNatural
                      ? "bg-[#0F2F23] text-emerald-300 border-emerald-500/30"
                      : isPaper
                      ? "bg-[#FAF5EB] text-[#3D2817] border-[#D6C5A9]"
                      : isNight
                      ? "bg-[#0D141F] text-slate-300 border-slate-800"
                      : "bg-emerald-500/10 text-emerald-900 border-emerald-500/25"
                  }`}
                >
                  <Settings className="w-4 h-4 text-emerald-500" />
                </div>
                <span className="text-[11px] sm:text-xs font-bold text-center mt-1 whitespace-nowrap leading-tight text-slate-700 dark:text-slate-200">
                  الإعدادات
                </span>
              </button>

              {/* 13. التراخيص والمصادر الموثقة */}
              <button
                id="btn-sources-open"
                onClick={() => {
                  soundEngine.playTasbihClick();
                  setIsSourcesOpen(true);
                }}
                className="flex-shrink-0 flex flex-col items-center justify-center min-w-[70px] sm:min-w-[76px] px-2 py-1.5 rounded-2xl transition-all active:scale-95 cursor-pointer group hover:bg-black/5 dark:hover:bg-white/5"
                title="المصادر والتراخيص الرسمية"
                aria-label="المصادر والتراخيص"
              >
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-105 ${
                    isNatural
                      ? "bg-[#0F2F23] text-emerald-300 border-emerald-500/30"
                      : isPaper
                      ? "bg-[#FAF5EB] text-[#3D2817] border-[#D6C5A9]"
                      : isNight
                      ? "bg-[#0D141F] text-slate-300 border-slate-800"
                      : "bg-emerald-500/10 text-emerald-900 border-emerald-500/25"
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                </div>
                <span className="text-[11px] sm:text-xs font-bold text-center mt-1 whitespace-nowrap leading-tight text-slate-700 dark:text-slate-200">
                  المصادر
                </span>
              </button>
            </div>

          </div>
        </header>

        {/* PWA In-App Install Prompt Banner */}
        <PWAInstallButton variant="banner" />

        {/* ========================================================================= */}
        {/* 4. DEVELOPED ISLAMIC HERO SECTION: SPIRITUAL MOSQUE ARCH & LIVE ADHAN HUB */}
        {/* ========================================================================= */}
        <section
          id="hero-prayer-banner"
          aria-label="الواجهة الرئيسية ومواقيت الصلاة والأذان"
          className={`rounded-3xl p-4 sm:p-6 transition-all shadow-xl border relative overflow-hidden backdrop-blur-md ${
            isNatural
              ? "bg-gradient-to-br from-[#061A13]/95 via-[#0A261C]/95 to-[#04120D]/95 border-emerald-500/40 text-white shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
              : isPaper
              ? "bg-gradient-to-br from-[#FFFDF8]/95 via-[#FAF4E8]/95 to-[#F3E9D5]/95 border-[#D6C5A9] text-[#2F1E12] shadow-[0_12px_40px_rgba(140,94,36,0.1)]"
              : isNight
              ? "bg-gradient-to-br from-[#06090F]/95 via-[#0C1422]/95 to-[#06090F]/95 border-slate-800 text-white shadow-[0_12px_40px_rgba(0,0,0,0.7)]"
              : "bg-gradient-to-br from-emerald-50/95 via-white to-amber-50/80 border-emerald-300 text-[#0F172A] shadow-[0_12px_40px_rgba(212,175,55,0.15)]"
          }`}
        >
          {/* Authentic Islamic Architectural Mosque Arch in the Background */}
          <div
            className="absolute inset-0 pointer-events-none z-0 mix-blend-overlay transition-opacity duration-500"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1542816417-0983c9c9ad53?q=80&w=1200&auto=format&fit=crop')`,
              backgroundSize: "cover",
              backgroundPosition: "center 30%",
              opacity: isPaper ? 0.14 : isLight ? 0.12 : isNatural ? 0.22 : 0.18,
            }}
          />

          {/* Subtle Ambient Spiritual Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Header: Quranic Calming Ayah & Today's Hijri Date */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-emerald-500/20">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-xs sm:text-sm font-amiri font-bold text-emerald-600 dark:text-emerald-300">
                «أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ»
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] sm:text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300">
                {hijriDateStr}
              </span>
              <span className="text-[11px] sm:text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/25 text-amber-700 dark:text-amber-300">
                {selectedCity.nameAr}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 relative z-10 items-center">
            
            {/* Left/Main Column: Grand Prayer Countdown & Next Prayer Highlight (7 cols) */}
            <div className="lg:col-span-7 flex items-center gap-4">
              
              {/* Grand Glowing Mosque / Clock Medallion */}
              <div
                onClick={() => {
                  soundEngine.playTasbihClick();
                  handleTabSelect("prayer");
                }}
                className="relative shrink-0 cursor-pointer active:scale-95 transition-transform group"
                title="مواقيت الصلاة والأذان - اضغط للعرض الشامل"
              >
                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex flex-col items-center justify-center shadow-lg transition-transform group-hover:scale-105 ${
                  isPaper
                    ? "bg-gradient-to-br from-[#8C5E24] to-[#B38038] text-white border border-[#D6C5A9]"
                    : isLight
                    ? "bg-gradient-to-br from-emerald-600 to-teal-700 text-white border border-emerald-500"
                    : "bg-gradient-to-br from-[#D4AF37] via-emerald-600 to-teal-800 text-white border border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.35)]"
                }`}>
                  <Clock className="w-8 h-8 sm:w-9 sm:h-9 drop-shadow" />
                  <span className="text-[10px] font-bold mt-0.5 opacity-90">الصلاة</span>
                </div>
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full animate-ping" />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
              </div>

              {/* Prayer Info & Countdown */}
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-black font-alexandria text-amber-500 dark:text-amber-400">
                    الصلاة القادمة: {nextPrayerName || "الفجر"}
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-300">
                    حساب فلكي دقيق 100%
                  </span>
                </div>

                {/* High-visibility Countdown Timer */}
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-mono font-black tracking-tight text-[#D4AF37] dark:text-[#F3E7C4] drop-shadow-sm">
                    متبقي {countdownText || "--:--:--"}
                  </span>
                </div>

                {/* Prayer Times Mini Strip */}
                <div className="flex items-center gap-1.5 sm:gap-2 mt-2.5 overflow-x-auto scrollbar-none pb-1">
                  {prayerTimes.map((p, pIdx) => (
                    <div
                      key={p.id || p.nameEn || `prayer-${pIdx}`}
                      onClick={() => handleTabSelect("prayer")}
                      className={`px-2 py-1 rounded-xl text-[10px] sm:text-[11px] font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1 ${
                        p.isNext
                          ? "bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400/50 scale-105"
                          : isPaper
                          ? "bg-[#FAF5EB] text-[#5C3D24] border border-[#D6C5A9]"
                          : isNight
                          ? "bg-slate-800/80 text-slate-300 border border-slate-700/60"
                          : "bg-emerald-500/10 text-emerald-900 border border-emerald-500/20"
                      }`}
                      title={`${p.nameAr}: ${p.time}`}
                    >
                      <span>{p.nameAr}</span>
                      <span className="font-mono text-[9px] opacity-85">{p.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Live Adhan Interactive Station & Quick Direct Actions (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-2.5 border-t lg:border-t-0 lg:border-r border-emerald-500/20 lg:pr-5 pt-3 lg:pt-0">
              
              {/* Adhan Card / Live Audio Station */}
              <div className={`p-3 rounded-2xl border transition-all ${
                isAdhanPlaying
                  ? "bg-amber-500/15 border-amber-500/50 shadow-md ring-1 ring-amber-500/30"
                  : isNatural
                  ? "bg-[#091F17]/80 border-emerald-500/30"
                  : isPaper
                  ? "bg-[#FAF5EB] border-[#D6C5A9]"
                  : isNight
                  ? "bg-slate-900/80 border-slate-800"
                  : "bg-white border-emerald-200 shadow-xs"
              }`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isAdhanPlaying ? "bg-amber-500 text-white animate-pulse" : "bg-emerald-600 text-white"
                    }`}>
                      <Volume2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-black text-slate-900 dark:text-slate-100">
                          {isAdhanPlaying ? "الأذان المبارك يصدح الآن" : "صوت الأذان في مواقيت الصلاة"}
                        </p>
                        {isAdhanPlaying && (
                          <span className="flex items-center gap-0.5">
                            <span className="w-1 h-3 bg-amber-400 rounded-full animate-bounce" />
                            <span className="w-1 h-4 bg-amber-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                            <span className="w-1 h-2.5 bg-amber-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {isAdhanPlaying
                          ? (currentAdhanTitle || "أذان الحرم المكي الشريف")
                          : "الأذان التلقائي: " + (isAutoAdhanEnabled ? "مفعّل في المواقيت 🔔" : "صامت 🔕")}
                      </p>
                    </div>
                  </div>

                  {/* Direct Play / Stop Adhan Button */}
                  {isAdhanPlaying ? (
                    <button
                      id="btn-stop-hero-adhan"
                      onClick={() => {
                        soundEngine.playTasbihClick();
                        adhanService.stop();
                      }}
                      className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow-md transition active:scale-95 shrink-0 flex items-center gap-2 cursor-pointer whitespace-nowrap min-h-[42px] animate-pulse"
                      title="إيقاف صوت الأذان مباشرة"
                      aria-label="إيقاف الأذان"
                    >
                      <VolumeX className="w-4 h-4" />
                      <span>إيقاف صوت الأذان</span>
                    </button>
                  ) : (
                    <button
                      id="btn-play-hero-adhan"
                      onClick={() => {
                        soundEngine.playTasbihClick();
                        adhanService.play();
                      }}
                      className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 font-black text-xs sm:text-sm shadow-md transition active:scale-95 shrink-0 flex items-center gap-2 cursor-pointer whitespace-nowrap min-h-[42px]"
                      title="تشغيل صوت الأذان مباشرة فوراً"
                      aria-label="سماع الأذان مباشرة"
                    >
                      <Volume2 className="w-4 h-4 text-slate-950" />
                      <span>تشغيل الأذان المباشر</span>
                    </button>
                  )}
                </div>

                {/* Sub-controls: Toggle Auto-Adhan & Reciter / Custom Audio Selector */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 mt-2.5 border-t border-emerald-500/15 text-xs">
                  <button
                    id="btn-toggle-auto-adhan"
                    onClick={() => {
                      soundEngine.playTasbihClick();
                      const nextVal = !isAutoAdhanEnabled;
                      adhanService.setAutoAdhanEnabled(nextVal);
                      setIsAutoAdhanEnabled(nextVal);
                    }}
                    className={`font-bold transition flex items-center gap-1.5 cursor-pointer py-1 px-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 whitespace-nowrap ${
                      isAutoAdhanEnabled ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500"
                    }`}
                    title="تشغيل الأذان تلقائياً عند حلول موعد كل صلاة"
                  >
                    <span>{isAutoAdhanEnabled ? "🔔 أذان المواقيت التلقائي: مفعّل" : "🔕 أذان المواقيت التلقائي: معطّل"}</span>
                  </button>

                  <button
                    id="btn-open-adhan-selector"
                    onClick={() => {
                      soundEngine.playTasbihClick();
                      setIsAdhanModalOpen(true);
                    }}
                    className="font-bold text-[#D4AF37] hover:underline flex items-center gap-1.5 cursor-pointer py-1 px-2 rounded-lg hover:bg-[#D4AF37]/10 whitespace-nowrap"
                    title="تغيير صوت المؤذن أو رفع ملف أذان مخصص"
                  >
                    <span>تخصيص المؤذن / رفع ملف صوت</span>
                    <span>←</span>
                  </button>
                </div>
              </div>

              {/* Direct Spiritual Shortcuts: Qibla & Mushaf */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  id="btn-hero-qibla"
                  onClick={() => handleTabSelect("qibla")}
                  className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl text-xs sm:text-sm font-bold transition active:scale-95 border cursor-pointer min-h-[42px] whitespace-nowrap ${
                    isNatural
                      ? "bg-[#0C291F] hover:bg-[#12382B] text-white border-emerald-500/30"
                      : isPaper
                      ? "bg-[#FAF5EB] hover:bg-[#F3ECE0] text-[#2F1E12] border-[#D6C5A9]"
                      : isNight
                      ? "bg-slate-800 hover:bg-slate-700 text-white border-slate-700"
                      : "bg-white hover:bg-slate-100 text-slate-800 border-slate-200 shadow-xs"
                  }`}
                  title="الانتقال لبوصلة القبلة ثلاثية الأبعاد"
                  aria-label="القبلة ثلاثية الأبعاد"
                >
                  <Compass className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>القبلة ثلاثية الأبعاد</span>
                </button>

                <button
                  id="btn-hero-quran"
                  onClick={() => handleTabSelect("quran")}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 text-[#8C5E24] dark:text-[#F3E7C4] border border-[#D4AF37]/40 font-bold text-xs sm:text-sm transition active:scale-95 cursor-pointer min-h-[42px] whitespace-nowrap"
                  title="تلاوة القرآن الكريم والاستماع للقرّاء"
                  aria-label="المصحف المرتل"
                >
                  <BookOpen className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span>المصحف المرتل</span>
                </button>
              </div>

            </div>

          </div>

          {/* 3. HOURLY THIKR HERO WIDGET (ذكر الساعة المتجدد تلقائياً كل ساعة بتنسيق روحاني جذاب) */}
          <HourlyThikrWidget theme={theme} />
        </section>

        {/* ========================================================================= */}
        {/* CONDITIONAL DISPLAY: HOME HUB vs INDEPENDENT SUBPAGE VIEW */}
        {/* ========================================================================= */}
        {isHome ? (
          <>
            {/* 1. ATHKAR SMART NOTIFICATION BANNER (Morning/Evening Athkar with Smart Voice Readout) */}
            <AthkarNotificationBanner
              theme={theme}
              onOpenAthkar={() => handleTabSelect("athkar")}
            />

            {/* 2. QURAN LIVE TV & KHATMAH TRACKER (مربع مشاهدة قناة القرآن الكريم يمين قسم تتبع الختمة مناصفة) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
              {/* Right Box in RTL: Saudi Quran Live TV (بث مباشر من الحرم المكي الشريف) */}
              <QuranLiveTvCard theme={theme} />

              {/* Left Box in RTL: Khatmah Progress Section (تتبع تقدم الختمة والتحفيز الروحاني) */}
              <KhatmahProgressSection
                theme={theme}
                onOpenMushaf={() => handleTabSelect("quran")}
              />
            </div>

        {/* ========================================================================= */}
        {/* 5. INTERACTIVE FUNCTIONS & BANNERS HUB (STARTS WITH QURAN & PRAYER FIRST) */}
        {/* ========================================================================= */}
        <section id="interactive-functions-hub" className="space-y-3">
          
          {/* Section Header with Refined Golden Title and Search Input */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <h3 className="text-xs sm:text-sm font-bold whitespace-nowrap truncate font-alexandria text-[#D4AF37] dark:text-[#F3E7C4]">
                الوظائف والخدمات الإسلامية التفاعلية
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                {filteredFunctions.length} خدمة
              </span>
            </div>
            
            {/* Quick Search Input */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs w-full sm:w-56 ${
              isNatural ? "bg-[#0A221A] border-emerald-500/30 text-white"
              : isPaper ? "bg-[#FFFDF9] border-[#D6C5A9] text-[#2F1E12]"
              : isNight ? "bg-slate-900 border-slate-800 text-white"
              : "bg-white border-slate-200 text-[#0F172A]"
            }`}>
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في الخصائص..."
                className="bg-transparent text-xs focus:outline-none w-full"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-slate-400 hover:text-slate-200 text-xs">
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Chips Bar: Fully visible, wrapped and centered with professional mobile alignment */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 py-1">
            {[
              { id: "all", label: "الكل", count: appFunctions.length },
              { id: "quran", label: "القرآن والسنة", count: appFunctions.filter((f) => f.category === "quran").length },
              { id: "worship", label: "الصلوات والعبادات", count: appFunctions.filter((f) => f.category === "worship").length },
              { id: "media_ai", label: "البث والوسائط", count: appFunctions.filter((f) => f.category === "media_ai").length },
              { id: "knowledge", label: "المعارف والعلوم", count: appFunctions.filter((f) => f.category === "knowledge").length },
              { id: "takaful", label: "تكافل الخير", count: appFunctions.filter((f) => f.category === "takaful").length },
            ].map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    soundEngine.playTasbihClick();
                    setSelectedCategory(cat.id);
                  }}
                  className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap shrink-0 active:scale-95 border min-h-[38px] ${
                    isSelected
                      ? isLight
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                        : isPaper
                        ? "bg-[#8C5E24] text-white border-[#8C5E24] shadow-xs"
                        : isNatural
                        ? "bg-emerald-500 text-slate-950 font-black border-emerald-400 shadow-sm"
                        : "bg-sky-500 text-slate-950 font-black border-sky-400 shadow-sm"
                      : isNatural
                      ? "bg-[#092018] text-slate-300 border-emerald-500/20 hover:border-emerald-500/50"
                      : isPaper
                      ? "bg-[#FAF5EB] text-[#3D2817] border-[#D6C5A9] hover:border-[#8C5E24]/60"
                      : isNight
                      ? "bg-[#0A0F17] text-slate-300 border-slate-800 hover:border-slate-700"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 shadow-2xs"
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-normal ${
                    isSelected ? "bg-black/20 text-white" : "bg-black/10 dark:bg-white/10 text-slate-400"
                  }`}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 12 Interactive Banners / Cards with Dedicated Style, Spiritual Soul, Grid Division, and Counters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3.5">
            {filteredFunctions.map((fn) => {
              const isActive = activeTab === fn.id;
              return (
                <button
                  key={fn.id}
                  id={`btn-fn-${fn.id}`}
                  onClick={() => handleTabSelect(fn.id)}
                  className={`group relative p-3 sm:p-3.5 rounded-2xl sm:rounded-3xl border text-right transition-all duration-300 hover:-translate-y-1 hover:shadow-xl active:scale-98 flex flex-col justify-between overflow-hidden cursor-pointer ${
                    isActive
                      ? isLight
                        ? "bg-emerald-50/95 border-emerald-500 ring-2 ring-emerald-500/40 shadow-lg"
                        : isPaper
                        ? "bg-[#F5EDE0] border-[#8C5E24] ring-2 ring-[#8C5E24]/40 shadow-lg"
                        : isNatural
                        ? "bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/40 shadow-lg"
                        : "bg-slate-900/80 border-sky-500 ring-2 ring-sky-500/40 shadow-lg"
                      : isNatural
                      ? `bg-[#0B2119]/90 ${fn.border} hover:bg-[#0F2A20]`
                      : isPaper
                      ? `bg-[#FFFDF9]/95 border-[#D6C5A9] hover:bg-[#FAF6EE] shadow-xs`
                      : isNight
                      ? `bg-[#0A0F17]/95 border-slate-800 hover:bg-[#0F1622]`
                      : `bg-white border-slate-200/90 hover:border-emerald-500/40 hover:bg-slate-50/80 shadow-xs`
                  }`}
                >
                  {/* Subtle Card Background Radial Aura */}
                  <div
                    className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${fn.color} rounded-full blur-2xl opacity-40 group-hover:opacity-90 transition duration-500 pointer-events-none`}
                  />

                  {/* Top Row: Icon, Soul Badge & Status Pill */}
                  <div className="flex items-center justify-between w-full mb-2 relative z-10">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-sm ${
                          isNatural
                            ? "bg-[#061A14] border border-emerald-500/30"
                            : isPaper
                            ? "bg-[#F3ECE0] border border-[#D6C5A9]"
                            : isNight
                            ? "bg-slate-800/90 border border-slate-700/80"
                            : "bg-slate-100 border border-slate-200/80"
                        }`}
                      >
                        {fn.icon}
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${fn.accentBg}`}>
                        {fn.soul}
                      </span>
                    </div>

                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap transition ${
                        isActive
                          ? "bg-emerald-500 text-white border-emerald-400"
                          : isPaper
                          ? "bg-[#FAF5EB] text-[#4A3320] border-[#D6C5A9]"
                          : isDark
                          ? "bg-slate-800/90 text-slate-300 border-slate-700"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {fn.badge}
                    </span>
                  </div>

                  {/* Middle Row: Title and Concise Single-Line Description */}
                  <div className="relative z-10 w-full mb-2 text-right">
                    <h4
                      className={`text-xs sm:text-sm font-bold whitespace-nowrap truncate tracking-tight font-alexandria transition ${
                        isActive
                          ? isPaper ? "text-[#8C5E24]" : "text-emerald-600 dark:text-emerald-400"
                          : isPaper
                          ? "text-[#2F1E12] group-hover:text-[#8C5E24]"
                          : isDark
                          ? "text-slate-100 group-hover:text-emerald-400"
                          : "text-slate-900 group-hover:text-emerald-600"
                      }`}
                    >
                      {fn.title}
                    </h4>
                    <p className={`text-[10px] sm:text-[11px] whitespace-nowrap truncate mt-0.5 ${
                      isPaper ? "text-[#6B513E]" : "text-slate-500 dark:text-slate-400"
                    }`}>
                      {fn.desc}
                    </p>
                  </div>

                  {/* Bottom: Structured Division & Grid with Dynamic Counters */}
                  <div
                    className={`relative z-10 w-full pt-2 border-t grid grid-cols-3 divide-x divide-x-reverse rounded-xl ${
                      isNatural
                        ? "bg-black/30 border-emerald-900/50 divide-emerald-900/50"
                        : isPaper
                        ? "bg-[#F7EFE1]/80 border-[#E2D4BF] divide-[#E2D4BF]"
                        : isNight
                        ? "bg-black/40 border-slate-800/80 divide-slate-800/80"
                        : "bg-slate-50 border-slate-200/80 divide-slate-200/80"
                    }`}
                  >
                    {fn.counters.map((counter, idx) => (
                      <div key={`${fn.id}-counter-${idx}`} className="px-1 text-center flex flex-col items-center">
                        <span className={`text-xs font-black font-mono tracking-tight whitespace-nowrap ${counter.color}`}>
                          {counter.val}
                        </span>
                        <span className={`text-[8px] sm:text-[9px] font-medium whitespace-nowrap mt-0.5 ${
                          isPaper ? "text-[#7A5F4C]" : "text-slate-400 dark:text-slate-400"
                        }`}>
                          {counter.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. FINAL SERVICES SECTION: HUMANITARIAN TAKAFUL & FATWA (القسم الأخير) */}
        {/* ========================================================================= */}
        <section
          id="featured-humanitarian-takaful-banner"
          onClick={() => handleTabSelect("takaful")}
          className={`p-4 sm:p-5 rounded-3xl border shadow-lg cursor-pointer transition-all duration-300 hover:scale-[1.008] relative overflow-hidden group ${
            isNatural
              ? "bg-gradient-to-r from-[#07241A] via-[#0A3324] to-[#07241A] border-[#D4AF37]/60 shadow-[0_8px_30px_rgba(212,175,55,0.15)] text-white"
              : isPaper
              ? "bg-gradient-to-r from-[#FAF2E2] via-[#FFFDF8] to-[#F5EBD7] border-[#D4AF37] shadow-[0_8px_25px_rgba(180,140,80,0.18)] text-[#2F1E12]"
              : isNight
              ? "bg-gradient-to-r from-[#081210] via-[#0E1E1A] to-[#081210] border-[#D4AF37]/50 shadow-[0_8px_30px_rgba(0,0,0,0.7)] text-white"
              : "bg-gradient-to-r from-emerald-50/90 via-amber-50/60 to-teal-50/90 border-[#D4AF37]/70 text-[#0F172A] shadow-[0_8px_30px_rgba(212,175,55,0.14)]"
          }`}
        >
          {/* Subtle Ambient Shimmer */}
          <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-[#D4AF37]/10 via-transparent to-transparent pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
            {/* Right: Icon, Title & Story */}
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-700 to-[#D4AF37] p-0.5 shrink-0 shadow-md group-hover:rotate-3 transition-transform">
                <div className="w-full h-full rounded-2xl bg-black/30 flex items-center justify-center text-white">
                  <HandHeart className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-300" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#B68C1C] dark:text-[#F3E7C4] font-bold font-mono">
                    القسم الأخير • تكافل الخير والبر
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">
                    تحويل مباشر 100% دون وسيط
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-bold font-alexandria text-[#D4AF37] dark:text-[#F3E7C4] flex items-center gap-1.5">
                  <span>تكافل الخير والحالات الإنسانية المتعففة والفتاوى المعتمدة</span>
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                </h3>

                <p className={`text-xs max-w-2xl leading-relaxed ${isPaper ? "text-[#5A402D]" : "text-slate-400 dark:text-zinc-300"}`}>
                  صلة وصل موثوقة ومباشرة بين فاعلي الخير والمتعففين دون أي وسطاء، وبنك الفتاوى الشرعية الموثقة من دار الإفتاء المصرية وهيئة كبار العلماء.
                </p>
              </div>
            </div>

            {/* Left: Quick Actions */}
            <div className="flex flex-row sm:flex-row items-center gap-2 w-full lg:w-auto justify-end shrink-0 pt-2 lg:pt-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  soundEngine.playTasbihClick();
                  handleTabSelect("takaful");
                }}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <Heart className="w-3.5 h-3.5 fill-white" />
                <span>استعراض حالات التكافل</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  soundEngine.playTasbihClick();
                  handleTabSelect("fatwa");
                }}
                className={`px-3.5 py-2.5 rounded-2xl border text-xs font-bold transition active:scale-95 whitespace-nowrap flex items-center gap-1.5 ${
                  isNatural ? "bg-[#0A271C] hover:bg-[#103728] text-emerald-300 border-emerald-500/40"
                  : isPaper ? "bg-[#FAF5EB] hover:bg-[#F3ECE0] text-[#3D2817] border-[#D6C5A9]"
                  : isNight ? "bg-slate-900 hover:bg-slate-800 text-white border-slate-700"
                  : "bg-white hover:bg-slate-50 text-slate-800 border-slate-300 shadow-xs"
                }`}
              >
                <Scale className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>بنك الفتاوى</span>
              </button>
            </div>
          </div>

          {/* Quick Pillars Strip inside the Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-black/5 dark:border-white/5 text-[11px]">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>أيتام ورعاية أسرية</span>
            </div>
            <div className="flex items-center gap-1.5 text-teal-600 dark:text-teal-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
              <span>أرامل ومطلقات ومساكين</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>علاج وعمليات جراحية</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#D4AF37] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
              <span>ابن السبيل وفتاوى موثقة</span>
            </div>
          </div>
        </section>
      </>
    ) : (
      <div id="sub-content-revealed-panel" className="space-y-4 pt-1 animate-fadeIn">
        {/* ========================================================================= */}
        {/* FAST SUBPAGE CONTROL & SIBLING SWITCHER BAR (أعلى المحتوى الفرعي مباشرة) */}
        {/* ========================================================================= */}
        <div className={`p-2.5 sm:p-3 rounded-2xl border backdrop-blur-md flex flex-wrap items-center justify-between gap-2.5 shadow-sm transition-all ${
          isNatural ? "bg-[#082017]/95 border-emerald-500/40 text-white"
          : isPaper ? "bg-[#FAF4E8]/95 border-[#D6C5A9] text-[#2F1E12]"
          : isNight ? "bg-slate-900/95 border-slate-800 text-white"
          : "bg-white/95 border-emerald-200 text-slate-900 shadow-sm"
        }`}>
          <div className="flex items-center gap-2">
            <button
              id="btn-close-subcontent-top"
              onClick={() => handleTabSelect("home")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs shadow-xs active:scale-95 transition cursor-pointer"
              title="إغلاق هذا القسم والعودة للرئيسية"
            >
              <Home className="w-3.5 h-3.5" />
              <span>الرئيسية / إغلاق</span>
            </button>

            <div className="h-4 w-px bg-black/10 dark:bg-white/10 hidden sm:block" />

            <div className="flex items-center gap-1.5 truncate">
              <div className="w-6 h-6 rounded-lg bg-[#D4AF37]/15 flex items-center justify-center text-[#D4AF37] shrink-0">
                {currentFn?.icon || <Sparkles className="w-3.5 h-3.5" />}
              </div>
              <span className="font-alexandria font-bold text-xs sm:text-sm text-emerald-950 dark:text-emerald-100 truncate">
                {currentFn?.title}
              </span>
              {currentFn?.soul && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold hidden md:inline shrink-0">
                  {currentFn?.soul}
                </span>
              )}
            </div>
          </div>

          {/* Sibling fast switcher chips */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 text-xs">
            {[
              { id: "prayers", label: "الصلاة" },
              { id: "quran", label: "المصحف" },
              { id: "athkar", label: "الأذكار" },
              { id: "fatwa", label: "الفتاوى" },
              { id: "hadith", label: "الحديث" },
              { id: "duas", label: "الأدعية" },
              { id: "takaful", label: "التكافل" },
              { id: "cairo_radio", label: "الإذاعة" },
            ]
              .filter((t) => t.id !== activeTab)
              .slice(0, 5)
              .map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleTabSelect(t.id)}
                  className="px-2.5 py-1 rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 font-bold text-[11px] whitespace-nowrap transition cursor-pointer"
                >
                  {t.label}
                </button>
              ))}
          </div>
        </div>

        {/* 7. ACTIVE SUBPAGE VIEW CONTAINER (ANCHORED & SMOOTHLY SCROLLED) */}
        <main ref={activeContentRef} id="active-content-section" className="space-y-4 sm:space-y-6">
          
          {/* TAB 1: PRAYERS VIEW (مواقيت الصلاة) */}
          {activeTab === "prayers" && (
            <PrayerTimesDashboard theme={theme} />
          )}

          {/* TAB 2: QIBLA 3D COMPASS VIEW (بوصلة القبلة التفاعلية بمستشعرات الحركة) */}
          {activeTab === "qibla" && (
            <QiblaCompassView
              qiblaBearing={qiblaBearing}
              cityName={selectedCity.nameAr}
              userLat={selectedCity.lat}
              userLng={selectedCity.lng}
              theme={theme}
            />
          )}

          {/* TAB 3: NOBLE QURAN (المصحف الشريف الشامل) */}
          {activeTab === "quran" && <QuranComprehensiveView theme={theme} />}

          {/* TAB 4: ATHKAR & TASBIH (الأذكار والسبحة النبضية) */}
          {activeTab === "athkar" && <AthkarComprehensiveView theme={theme} />}

          {/* TAB 4b: HISN AL-MUSLIM (حصن المسلم الصوتي) */}
          {(activeTab === "hisn_muslim" || activeTab === "hisn") && (
            <HisnMuslimComprehensiveView theme={theme} />
          )}

          {/* TAB 5: SQLITE PRAYER LOG (سجل الصلوات المحلي) */}
          {activeTab === "log" && <SqlitePrayerLog prayerTimesList={prayerTimes} theme={theme} />}

          {/* TAB 6: HADITH ENCYCLOPEDIA (الحديث الشريف) */}
          {activeTab === "hadith" && <HadithComprehensiveView theme={theme} />}

          {/* TAB 7: ISLAMIC LECTURES (الدروس والمحاضرات) */}
          {activeTab === "lectures" && <LecturesComprehensiveView isBlindMode={false} theme={theme} />}

          {/* TAB 8: HIJRI CALENDAR (التقويم الهجري) */}
          {activeTab === "calendar" && <HijriCalendarView theme={theme} />}

          {/* TAB 9: ZAKAT CALCULATOR (حاسبة الزكاة) */}
          {activeTab === "zakat" && <ZakatCalculatorView theme={theme} />}

          {/* TAB 10: NEARBY MOSQUES (المساجد القريبة) */}
          {activeTab === "mosques" && <NearbyMosquesView theme={theme} />}

          {/* TAB 11: LIVE BROADCASTS (البث المباشر) */}
          {activeTab === "live" && <LiveBroadcastsView theme={theme} />}

          {/* TAB 12: DUAS ENCYCLOPEDIA (الأدعية القرآنية والنبوية مع التكرار الصوتي) */}
          {activeTab === "duas" && <DuasComprehensiveView theme={theme} />}

          {/* TAB 13: LAYLAT AL-QADR (ليلة القدر المباركة) */}
          {activeTab === "laylat_qadr" && <LaylatAlQadrView theme={theme} />}

          {/* TAB 14: CAIRO QURAN RADIO (إذاعة القرآن الكريم من القاهرة مباشر) */}
          {activeTab === "cairo_radio" && (
            <div className="space-y-4">
              <CairoQuranRadioPlayer theme={theme} variant="full" />
            </div>
          )}

          {/* TAB 15: HUMANITARIAN TAKAFUL & DIRECT CHARITY (تكافل الخير والحالات الإنسانية) */}
          {activeTab === "takaful" && (
            <HumanitarianTakafulView
              theme={theme}
              onBackToHome={() => handleTabSelect("home")}
            />
          )}

          {/* TAB 17: FATWA ENCYCLOPEDIA (موسوعة الفتاوى الإسلامية المعتمدة) */}
          {activeTab === "fatwa" && (
            <FatwaEncyclopediaView
              theme={theme}
              onBack={() => handleTabSelect("home")}
              onBackToHome={() => handleTabSelect("home")}
            />
          )}
        </main>

        {/* ========================================================================= */}
        {/* 8. REST OF CONTENT / OTHER FUNCTIONS UNDER ACTIVE VIEW (وباقي المحتوى تحت) */}
        {/* ========================================================================= */}
        <section id="other-sections-below" className="pt-6 sm:pt-8 border-t border-dashed border-emerald-500/25 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black font-alexandria text-emerald-950 dark:text-emerald-100">
                  باقي أقسام وخدمات التطبيق
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                  تصفح وانتقل مباشرة إلى أي وظيفة أو محتوى آخر دون مغادرة الصفحة
                </p>
              </div>
            </div>

            <button
              onClick={() => handleTabSelect("home")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs active:scale-95 transition cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>الصفحة الرئيسية</span>
            </button>
          </div>

          {/* Sibling Features Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
            {appFunctions
              .filter((fn) => fn.id !== activeTab)
              .map((fn) => (
                <div
                  key={fn.id}
                  onClick={() => handleTabSelect(fn.id)}
                  className={`group rounded-2xl p-3 border transition-all cursor-pointer hover:shadow-md active:scale-95 flex flex-col justify-between ${
                    isNatural
                      ? "bg-[#0A221A]/80 border-emerald-500/30 hover:border-emerald-400 text-white"
                      : isPaper
                      ? "bg-[#FFFDF9] border-[#D6C5A9] hover:border-[#8C5E24] text-[#2F1E12]"
                      : isNight
                      ? "bg-[#0D141F] border-slate-800 hover:border-slate-700 text-white"
                      : "bg-white border-slate-200 hover:border-emerald-500 text-slate-900"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/15 flex items-center justify-center">
                      {fn.icon}
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      {fn.badge}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold line-clamp-1 group-hover:text-emerald-500 transition-colors">{fn.title}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                    {fn.desc}
                  </p>
                </div>
              ))}
          </div>
        </section>
      </div>
    )}

        {/* Global Professional Islamic World-Class Footer */}
        <IslamicFooter
          theme={theme}
          onNavigateTab={(t) => handleTabSelect(t)}
          onOpenSupportModal={() => setIsSupportModalOpen(true)}
          onOpenSourcesModal={() => setIsSourcesOpen(true)}
          onOpenWelcomeModal={() => setIsWelcomeOpen(true)}
        />

      </div>

      {/* Support Us & Ongoing Charity Modal */}
      <SupportUsModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
        theme={theme}
      />

      {/* Advanced Settings & Customization Modal */}
      <AdvancedSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        onThemeChange={handleThemeChange}
        selectedMethod={selectedMethod}
        onMethodChange={(m) => setSelectedMethod(m)}
        asrJuristic={asrJuristic}
        onAsrJuristicChange={(j) => {
          setAsrJuristic(j);
          localStorage.setItem("noor_asr_juristic", j);
        }}
        fontSize={fontSize}
        onFontSizeChange={(s) => {
          setFontSize(s);
          localStorage.setItem("noor_font_size", s);
        }}
        soundEnabled={soundEnabled}
        onSoundEnabledChange={(s) => {
          setSoundEnabled(s);
          localStorage.setItem("noor_sound_enabled", String(s));
        }}
        adhanReciter={adhanReciter}
        onAdhanReciterChange={(r) => {
          setAdhanReciter(r);
          localStorage.setItem("noor_adhan_reciter", r);
        }}
        cityName={selectedCity.nameAr}
        onRefreshLocation={handleRefreshLocation}
      />

      {/* Sources & Scientific Accreditations Modal */}
      <SourcesAndLicensesModal
        isOpen={isSourcesOpen}
        onClose={() => setIsSourcesOpen(false)}
      />

      {/* 3-Screen Professional Islamic Welcome Flow */}
      <IslamicWelcomeFlow
        isOpen={isWelcomeOpen}
        onClose={() => setIsWelcomeOpen(false)}
      />

      {/* World-Class Islamic Intro Animation & Logo Reveal Modal */}
      <WorldClassIslamicIntroModal
        isOpen={isIntroModalOpen}
        onClose={handleIntroComplete}
        onEnterApp={handleIntroComplete}
      />

      {/* Standalone PWA Install Modal Prompt (Only shows if NOT installed before) */}
      <PWAInstallModal
        isOpen={isPWAModalOpen}
        onClose={() => setIsPWAModalOpen(false)}
      />

      {/* Blind Companion Trainer & Voice Guide Modal */}
      <BlindCompanionTrainerGuide
        isOpen={isCompanionGuideOpen}
        onClose={() => setIsCompanionGuideOpen(false)}
        theme={theme}
        onActivateBlindMode={() => {
          if (!isBlindMode) handleToggleBlindMode();
        }}
        onOpenQibla={() => handleTabSelect("qibla")}
        onOpenQuran={() => handleTabSelect("quran")}
        onOpenAthkar={() => handleTabSelect("athkar")}
      />

      {/* Spiritual Achievements & Gamification Badges Modal */}
      <AchievementsModal
        isOpen={isAchievementsOpen}
        onClose={() => setIsAchievementsOpen(false)}
      />

      {/* Time-of-Day Islamic Art Wallpapers Modal */}
      <WallpaperSelectorModal
        isOpen={isWallpapersOpen}
        onClose={() => setIsWallpapersOpen(false)}
      />

      {/* Adhan Audio Player Modal & Audio File Selector */}
      <AdhanAudioPlayerModal
        isOpen={isAdhanModalOpen}
        onClose={() => setIsAdhanModalOpen(false)}
        theme={theme}
      />

      {/* Live Adhan Fullscreen/Top Prayer Banner Alert */}
      <AdhanPrayerBanner theme={theme} />
      {/* ========================================================================= */}
      {/* 7. MODERN ISLAMIC FLOATING BOTTOM NAVIGATION BAR WITH CENTRAL SMART COMPANION BALLOON */}
      {/* ========================================================================= */}
      <nav
        id="bottom-navigation-menu-bar"
        aria-label="القائمة السفلية"
        className="fixed bottom-0 inset-x-0 z-40 pb-[max(env(safe-area-inset-bottom),0.5rem)] px-3 pointer-events-none"
      >
        <div
          className={`pointer-events-auto max-w-lg mx-auto px-4 py-1.5 rounded-3xl border backdrop-blur-xl shadow-2xl flex items-center justify-between transition-all ${
            isNatural
              ? "bg-[#091F17]/95 border-emerald-500/40 text-slate-300 shadow-[0_10px_35px_rgba(0,0,0,0.6)]"
              : isPaper
              ? "bg-[#FAF5EB]/95 border-[#D6C5A9] text-[#2F1E12] shadow-[0_10px_35px_rgba(140,94,36,0.2)]"
              : isNight
              ? "bg-[#080E18]/95 border-slate-800 text-slate-300 shadow-[0_10px_35px_rgba(0,0,0,0.8)]"
              : "bg-white/95 border-emerald-100 text-slate-700 shadow-[0_10px_35px_rgba(16,185,129,0.18)]"
          }`}
        >
          {/* 1. الرئيسية (Home) */}
          <button
            id="bottom-nav-home"
            onClick={() => {
              soundEngine.playTasbihClick();
              handleTabSelect("home");
            }}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all cursor-pointer ${
              isHome
                ? "text-emerald-600 dark:text-emerald-400 font-bold scale-105"
                : "text-slate-500 hover:text-emerald-500 dark:text-slate-400 opacity-80 hover:opacity-100"
            }`}
            title="الرئيسية"
          >
            <Home className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-alexandria font-medium leading-none">الرئيسية</span>
            {isHome && <span className="w-1.5 h-1.5 mt-1 rounded-full bg-emerald-500" />}
          </button>

          {/* 2. المصحف (Quran) */}
          <button
            id="bottom-nav-quran"
            onClick={() => {
              soundEngine.playTasbihClick();
              handleTabSelect("quran");
            }}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all cursor-pointer ${
              activeTab === "quran"
                ? "text-emerald-600 dark:text-emerald-400 font-bold scale-105"
                : "text-slate-500 hover:text-emerald-500 dark:text-slate-400 opacity-80 hover:opacity-100"
            }`}
            title="المصحف الشريف"
          >
            <BookOpen className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-alexandria font-medium leading-none">المصحف</span>
            {activeTab === "quran" && <span className="w-1.5 h-1.5 mt-1 rounded-full bg-emerald-500" />}
          </button>

          {/* 3. CENTER: بالون المرافق الذكي العائم (Floating Smart Companion Balloon) */}
          <div className="relative -mt-6 sm:-mt-7 flex flex-col items-center px-1">
            <button
              id="floating-voice-companion-btn"
              onClick={() => {
                soundEngine.playAssistantActivate();
                window.dispatchEvent(new CustomEvent("noor-open-voice-companion"));
              }}
              className="relative group p-0.5 rounded-full bg-gradient-to-tr from-emerald-500 via-[#D4AF37] to-teal-400 shadow-[0_12px_28px_rgba(5,150,105,0.5)] hover:shadow-[0_16px_36px_rgba(212,175,55,0.6)] transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
              title="تحدث مع الرفيق الذكي الصوتي"
              aria-label="الرفيق الإسلامي الذكي"
            >
              {/* Animated Glow / Pulse Ring */}
              <span className="absolute -inset-1.5 rounded-full bg-[#D4AF37]/30 animate-pulse blur-xs pointer-events-none" />
              <span className="absolute -inset-1 rounded-full bg-emerald-500/40 animate-ping opacity-40 pointer-events-none" />

              {/* Inner Balloon Sphere */}
              <div className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-b from-emerald-600 via-teal-700 to-emerald-900 border-2 border-amber-300/70 flex flex-col items-center justify-center text-white overflow-hidden shadow-inner">
                {/* Sparkle & Wave Indicators */}
                <div className="relative flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-amber-300 animate-spin-veryslow" />
                </div>
                {/* Soundwave Bars */}
                <div className="flex items-center gap-0.5 mt-0.5">
                  <span className="w-0.5 h-2 bg-amber-300 rounded-full animate-pulse" />
                  <span className="w-0.5 h-3 bg-white rounded-full" />
                  <span className="w-0.5 h-2 bg-amber-300 rounded-full animate-pulse" />
                </div>
              </div>
            </button>
            <span className="text-[10px] font-alexandria font-bold text-[#D4AF37] dark:text-[#F3E7C4] mt-0.5 drop-shadow-xs whitespace-nowrap">
              الرفيق الذكي
            </span>
          </div>

          {/* 4. الصلاة (Prayer Times) */}
          <button
            id="bottom-nav-prayers"
            onClick={() => {
              soundEngine.playTasbihClick();
              handleTabSelect("prayers");
            }}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all cursor-pointer ${
              activeTab === "prayers"
                ? "text-amber-600 dark:text-amber-400 font-bold scale-105"
                : "text-slate-500 hover:text-amber-500 dark:text-slate-400 opacity-80 hover:opacity-100"
            }`}
            title="مواقيت الصلاة"
          >
            <Clock className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-alexandria font-medium leading-none">الصلاة</span>
            {activeTab === "prayers" && <span className="w-1.5 h-1.5 mt-1 rounded-full bg-amber-500" />}
          </button>

          {/* 5. الأذكار (Athkar & Tasbih) */}
          <button
            id="bottom-nav-athkar"
            onClick={() => {
              soundEngine.playTasbihClick();
              handleTabSelect("athkar");
            }}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all cursor-pointer ${
              activeTab === "athkar"
                ? "text-emerald-600 dark:text-emerald-400 font-bold scale-105"
                : "text-slate-500 hover:text-emerald-500 dark:text-slate-400 opacity-80 hover:opacity-100"
            }`}
            title="الأذكار والسبحة"
          >
            <BookMarked className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-alexandria font-medium leading-none">الأذكار</span>
            {activeTab === "athkar" && <span className="w-1.5 h-1.5 mt-1 rounded-full bg-emerald-500" />}
          </button>
        </div>
      </nav>
    </div>
  );
};
