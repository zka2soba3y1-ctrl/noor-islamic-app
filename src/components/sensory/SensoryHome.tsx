import React, { useState, useEffect, useRef } from "react";
import {
  Compass,
  Radio,
  Volume2,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  Sparkles,
  Camera,
  RefreshCw,
  Eye,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { soundEngine } from "../../utils/soundEngine";
import { speechEngine } from "../../utils/speechEngine";
import { SURAH_LIST, getSurahCode, SAMPLE_AYAHS } from "../../data/quranData";
import { TASBIH_TYPES } from "../../data/athkarData";
import { calculateQiblaBearing } from "../../utils/prayerCalculator";
import { GestureHandler } from "../../utils/gestureController";
import { RecitationProgressBar } from "../visual/RecitationProgressBar";
import { HapticPatternsGuideModal } from "./HapticPatternsGuideModal";
import { hapticEngine } from "../../utils/hapticEngine";
import { LazyImage } from "../common/LazyImage";

export const SensoryHome: React.FC = () => {
  // Active sensory tool tab
  const [activeTab, setActiveTab] = useState<"qibla" | "quran" | "tasbih" | "vision">("qibla");
  const [isHapticGuideOpen, setIsHapticGuideOpen] = useState(false);

  // User location / Qibla state
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>({ lat: 24.7136, lng: 46.6753 }); // Riyadh default
  const [qiblaTargetBearing, setQiblaTargetBearing] = useState(247); // Calculated bearing to Makkah
  const [currentHeading, setCurrentHeading] = useState(0);
  const [isCalibrated, setIsCalibrated] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const lockTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasSpokenLockRef = useRef(false);

  // Quran Player state
  const [currentSurahIndex, setCurrentSurahIndex] = useState(0); // 0 = Al-Fatihah
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [reciterServer, setReciterServer] = useState("https://server8.mp3quran.net/afs/");
  const [reciterName, setReciterName] = useState("مشاري راشد العفاسي");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Global audio coordinator to prevent audio collisions & handle voice seeks
  useEffect(() => {
    const handlePause = (e: Event) => {
      const customEvent = e as CustomEvent<{ sender: string }>;
      if (customEvent.detail?.sender !== "sensory") {
        if (audioRef.current && !audioRef.current.paused) {
          audioRef.current.pause();
          setIsPlaying(false);
        }
      }
    };

    const handlePlaySurahEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ surahNumber: number }>;
      if (customEvent.detail?.surahNumber) {
        const idx = SURAH_LIST.findIndex((s) => s.number === customEvent.detail.surahNumber);
        if (idx !== -1) {
          setCurrentSurahIndex(idx);
          setActiveTab("quran");
        }
      }
    };

    const handleSeekAudio = (e: Event) => {
      const detail = (e as CustomEvent<{ deltaSeconds?: number; action?: string }>).detail;
      if (!audioRef.current) return;
      if (detail?.action === "restart") {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
        setAudioProgress(0);
      } else if (detail?.action === "resume") {
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
      } else if (typeof detail?.deltaSeconds === "number") {
        const newTime = Math.max(
          0,
          Math.min(audioRef.current.duration || 1000, audioRef.current.currentTime + detail.deltaSeconds)
        );
        audioRef.current.currentTime = newTime;
        setAudioProgress(newTime);
      }
    };

    window.addEventListener("noor-pause-all-audio", handlePause);
    window.addEventListener("noor-play-surah", handlePlaySurahEvent);
    window.addEventListener("noor-seek-audio", handleSeekAudio);
    return () => {
      window.removeEventListener("noor-pause-all-audio", handlePause);
      window.removeEventListener("noor-play-surah", handlePlaySurahEvent);
      window.removeEventListener("noor-seek-audio", handleSeekAudio);
    };
  }, []);

  // Sensory Tasbih state
  const [tasbihCount, setTasbihCount] = useState(0);
  const [selectedThikrIndex, setSelectedThikrIndex] = useState(0);

  // Vision AI state
  const [visionMode, setVisionMode] = useState<"prayer_rug" | "mushaf_text" | "general_scene">("prayer_rug");
  const [cameraActive, setCameraActive] = useState(false);
  const [visionResult, setVisionResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastCapturedSnapshot, setLastCapturedSnapshot] = useState<string | null>(null);
  const [capturedHistory, setCapturedHistory] = useState<Array<{ id: string; url: string; timestamp: string; label: string }>>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Initialize GPS coords for Qibla calculation
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserCoords(coords);
          const bearing = calculateQiblaBearing(coords.lat, coords.lng);
          setQiblaTargetBearing(bearing);
        },
        () => {
          // Fallback to default
        }
      );
    }

    // Throttled device orientation listener for compass to ensure smooth performance on low-end devices
    let lastHeadingUpdate = 0;
    let lastRecordedHeading = -999;
    const handleOrientation = (e: DeviceOrientationEvent) => {
      const now = Date.now();
      if (now - lastHeadingUpdate < 60) return; // Limit to ~16 FPS max for battery and CPU efficiency
      let compassHeading: number | null = null;
      if ((e as any).webkitCompassHeading !== undefined) {
        // iOS
        compassHeading = (e as any).webkitCompassHeading;
      } else if (e.alpha !== null) {
        // Android / standard (alpha inverted)
        compassHeading = 360 - e.alpha;
      }
      if (compassHeading !== null) {
        const rounded = Math.round(compassHeading);
        if (Math.abs(rounded - lastRecordedHeading) >= 1) {
          lastHeadingUpdate = now;
          lastRecordedHeading = rounded;
          setCurrentHeading(rounded);
        }
      }
    };

    window.addEventListener("deviceorientation", handleOrientation, true);
    return () => {
      window.removeEventListener("deviceorientation", handleOrientation, true);
    };
  }, []);

  // Proportional Qibla Haptics & Audio Loop
  useEffect(() => {
    if (activeTab !== "qibla") return;

    // Calculate angular difference (-180 to 180)
    let diff = (qiblaTargetBearing - currentHeading + 360) % 360;
    if (diff > 180) diff -= 360;
    const absDiff = Math.abs(diff);

    // If within ±3.5 degrees
    if (absDiff <= 3.5) {
      if (!isLocked) {
        if (!lockTimerRef.current) {
          lockTimerRef.current = setTimeout(() => {
            setIsLocked(true);
            soundEngine.playQiblaLocked();
            if (!hasSpokenLockRef.current) {
              speechEngine.speak("توقف، أنت الآن باتجاه القبلة تماماً نحو الكعبة المشرفة.");
              hasSpokenLockRef.current = true;
            }
          }, 800);
        }
      }
    } else {
      if (lockTimerRef.current) {
        clearTimeout(lockTimerRef.current);
        lockTimerRef.current = null;
      }
      if (absDiff > 15) {
        setIsLocked(false);
        hasSpokenLockRef.current = false;
      }
      // Pulsing pip based on proximity
      const timer = setTimeout(() => {
        soundEngine.playQiblaProximityPip(diff);
      }, Math.max(120, absDiff * 14));
      return () => clearTimeout(timer);
    }
  }, [activeTab, currentHeading, qiblaTargetBearing, isLocked]);

  // Handle Tab Switch with voice guidance
  const switchTab = (tab: "qibla" | "quran" | "tasbih" | "vision") => {
    soundEngine.playTasbihClick();
    setActiveTab(tab);
    if (tab === "qibla") {
      speechEngine.speak("رادار القبلة الحسي. استدر بجسدك ببطء، ستتسارع النبضات حتى ينطق الهاتف توقف عند التوجه للكعبة.");
    } else if (tab === "quran") {
      speechEngine.speak(`مشغل القرآن الحركي. السورة الحالية: ${SURAH_LIST[currentSurahIndex].nameAr}. انقر نقراً مزدوجاً للتشغيل أو الإيقاف.`);
    } else if (tab === "tasbih") {
      speechEngine.speak(`السبحة اللمسية. الذكر الحالي: ${TASBIH_TYPES[selectedThikrIndex].name}. اضغط في أي مكان على الشاشة للتسبيح.`);
    } else if (tab === "vision") {
      speechEngine.speak("عين البصيرة بالذكاء الاصطناعي. وجه الكاميرا لتحديد موضع سجادة الصلاة أو قراءة النصوص.");
    }
  };

  // Quran controls
  const togglePlayQuran = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      speechEngine.speak("تم إيقاف التلاوة مؤقتاً");
    } else {
      window.dispatchEvent(
        new CustomEvent("noor-pause-all-audio", { detail: { sender: "sensory" } })
      );
      document.querySelectorAll("audio").forEach((el) => {
        if (el !== audioRef.current) el.pause();
      });
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
      speechEngine.speak(`تلاوة سورة ${SURAH_LIST[currentSurahIndex].nameAr}`);
    }
  };

  const nextSurah = () => {
    const nextIdx = (currentSurahIndex + 1) % SURAH_LIST.length;
    setCurrentSurahIndex(nextIdx);
    speechEngine.speak(`سورة ${SURAH_LIST[nextIdx].nameAr}`);
    setIsPlaying(true);
  };

  const prevSurah = () => {
    const prevIdx = (currentSurahIndex - 1 + SURAH_LIST.length) % SURAH_LIST.length;
    setCurrentSurahIndex(prevIdx);
    speechEngine.speak(`سورة ${SURAH_LIST[prevIdx].nameAr}`);
    setIsPlaying(true);
  };

  const readTafsirAloud = () => {
    const surahNum = SURAH_LIST[currentSurahIndex].number;
    const ayahs = SAMPLE_AYAHS[surahNum];
    if (ayahs && ayahs.length > 0) {
      const firstTafsir = ayahs[0].tafsir;
      speechEngine.speak(`تفسير ميسر لسورة ${SURAH_LIST[currentSurahIndex].nameAr}: ${firstTafsir}`);
    } else {
      speechEngine.speak(`سورة ${SURAH_LIST[currentSurahIndex].nameAr}، سورة ${SURAH_LIST[currentSurahIndex].revelationType === "Meccan" ? "مكية" : "مدنية"}، وعدد آياتها ${SURAH_LIST[currentSurahIndex].numberOfAyahs} آية.`);
    }
  };

  // Tasbih tap
  const handleTasbihTap = () => {
    const newCount = tasbihCount + 1;
    setTasbihCount(newCount);

    if (newCount % 100 === 0) {
      soundEngine.playMilestone100();
      hapticEngine.trigger("tasbih_milestone_100");
      speechEngine.speak(`أتممت مائة تسبيحة، تقبل الله طاعتك.`);
    } else if (newCount % 33 === 0) {
      soundEngine.playMilestone33();
      hapticEngine.trigger("tasbih_milestone_33");
      speechEngine.speak(`ثلاث وثلاثون`);
    } else {
      soundEngine.playTasbihClick();
      hapticEngine.trigger("tasbih_tick");
    }
  };

  const resetTasbih = () => {
    setTasbihCount(0);
    soundEngine.playTasbihClick();
    speechEngine.speak("تم تصفير عداد السبحة");
  };

  // Vision AI Camera Start
  const startCamera = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      speechEngine.speak("تم تفعيل الكاميرا. وجه الهاتف للأمام ثم انقر الزر الكبير في المنتصف لفحص المشهد.");
    } catch {
      speechEngine.speak("تعذر الوصول للكاميرا، يرجى منح إذن الكاميرا.");
    }
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current) return;
    setIsAnalyzing(true);
    soundEngine.playAssistantActivate();
    speechEngine.speak("جارٍ فحص المشهد عبر محرك عين البصيرة...");

    try {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        setLastCapturedSnapshot(dataUrl);
        setCapturedHistory((prev) => [
          {
            id: Date.now().toString(),
            url: dataUrl,
            timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
            label:
              visionMode === "prayer_rug"
                ? "سجادة الصلاة"
                : visionMode === "mushaf_text"
                ? "صفحة المصحف"
                : "وصف الغرفة",
          },
          ...prev.slice(0, 3),
        ]);

        const res = await fetch("/api/gemini/vision", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: dataUrl, mode: visionMode }),
        });

        const data = await res.json();
        const description = data.description || "تم فحص المشهد.";
        setVisionResult(description);

        const speech = data.ttsSpeech || description.slice(0, 150);
        speechEngine.speak(speech);
      }
    } catch {
      speechEngine.speak("عذراً، تعذر تحليل المشهد حالياً. يرجى إعادة المحاولة.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Calculate current diff for display
  let angleDiff = (qiblaTargetBearing - currentHeading + 360) % 360;
  if (angleDiff > 180) angleDiff -= 360;

  const currentSurah = SURAH_LIST[currentSurahIndex];
  const audioSrc = `${reciterServer}${getSurahCode(currentSurah.number)}.mp3`;

  // Advanced Gesture Controller instance for blind multi-touch & haptic interactions
  const gestureHandler = new GestureHandler({
    onDoubleTap: () => {
      if (activeTab === "quran") {
        togglePlayQuran();
      } else if (activeTab === "tasbih") {
        const nextThikr = (selectedThikrIndex + 1) % TASBIH_TYPES.length;
        setSelectedThikrIndex(nextThikr);
        setTasbihCount(0);
        soundEngine.playGestureSuccess();
        speechEngine.speakEgyptian(`الذكر التالي: ${TASBIH_TYPES[nextThikr].name}`);
      } else if (activeTab === "vision") {
        captureAndAnalyze();
      } else if (activeTab === "qibla") {
        speechEngine.speakEgyptian(
          `الفارق الزاوي نحو الكعبة المشرفة: ${Math.abs(Math.round(angleDiff))} درجة. ${
            angleDiff > 0 ? "استدر لليمين" : "استدر لليسار"
          }`
        );
      }
    },
    onSwipeRight: () => {
      if (activeTab === "quran") {
        nextSurah();
      } else {
        const tabs: Array<"qibla" | "quran" | "tasbih" | "vision"> = ["qibla", "quran", "tasbih", "vision"];
        const curIdx = tabs.indexOf(activeTab);
        const next = tabs[(curIdx + 1) % tabs.length];
        switchTab(next);
      }
    },
    onSwipeLeft: () => {
      if (activeTab === "quran") {
        prevSurah();
      } else {
        const tabs: Array<"qibla" | "quran" | "tasbih" | "vision"> = ["qibla", "quran", "tasbih", "vision"];
        const curIdx = tabs.indexOf(activeTab);
        const prev = tabs[(curIdx - 1 + tabs.length) % tabs.length];
        switchTab(prev);
      }
    },
    onTwoFingerTap: () => {
      speechEngine.stop();
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
      soundEngine.playGestureTwoFingerTap();
    },
    onThreeFingerTap: () => {
      const now = new Date();
      const timeStr = `${now.getHours()}:${now.getMinutes() < 10 ? "0" : ""}${now.getMinutes()}`;
      speechEngine.speakEgyptian(`الساعة الآن ${timeStr}`);
    },
    onSingleTap: () => {
      if (activeTab === "tasbih") {
        handleTasbihTap();
      }
    },
    onLongPress: () => {
      soundEngine.playAssistantActivate();
      speechEngine.speakEgyptian(
        `أنت الآن في ${
          activeTab === "qibla"
            ? "رادار القبلة الحسي"
            : activeTab === "quran"
            ? "مشغل القرآن الحركي"
            : activeTab === "tasbih"
            ? "السبحة اللمسية التلقائية"
            : "عين البصيرة بالذكاء الاصطناعي"
        }`
      );
    },
  });

  return (
    <div
      id="sensory-mode-container"
      onTouchStart={gestureHandler.onTouchStart}
      onTouchMove={gestureHandler.onTouchMove}
      onTouchEnd={gestureHandler.onTouchEnd}
      className="min-h-[calc(100vh-60px)] bg-[#09090B] text-[#E4E4E7] flex flex-col font-['Cairo',sans-serif] select-none"
    >
      {/* Hidden Audio Player for gesture recitation */}
      <audio
        ref={audioRef}
        src={audioSrc}
        onEnded={nextSurah}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Top Sensory Mode Accessibility Bar */}
      <div className="bg-[#121214]/90 border-b border-white/5 px-4 sm:px-6 py-3.5 flex items-center justify-between text-[#E4E4E7]">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#059669] animate-pulse shadow-[0_0_8px_#059669]" />
          <span className="font-bold text-sm sm:text-base tracking-wide text-white">
            نمط البصيرة (Accessibility-First UI)
          </span>
          <span className="hidden sm:inline-block text-[10px] uppercase font-mono tracking-widest text-[#059669] bg-[#059669]/10 px-2 py-0.5 rounded-md border border-[#059669]/30">
            Haptic + Audio
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsHapticGuideOpen(true)}
            className="flex items-center gap-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl text-xs font-bold active:scale-95 transition-colors"
            title="دليل أنماط الاهتزاز الذكية (Haptic Patterns) للمكفوفين"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>دليل الاهتزاز (Haptics)</span>
          </button>
          <button
            onClick={() =>
              speechEngine.speak(
                "أهلاً بك في نمط البصيرة. التطبيق مقسم إلى أربعة أركان: رادار القبلة الحسي، مشغل القرآن الحركي، السبحة اللمسية التلقائية، وعين البصيرة بالكاميرا."
              )
            }
            className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-3.5 py-1.5 rounded-xl text-xs font-medium active:scale-95 transition-colors"
            title="نطق التعليمات الصوتية الشاملة"
          >
            <Volume2 className="w-3.5 h-3.5 text-[#059669]" />
            <span>تعليمات صوتية</span>
          </button>
        </div>
      </div>

      {/* 4 Big High-Contrast Touch Tabs */}
      <div className="grid grid-cols-4 border-b border-white/5 bg-[#121214] text-center backdrop-blur-md">
        <button
          id="sensory-tab-qibla"
          onClick={() => switchTab("qibla")}
          className={`py-3.5 px-2 flex flex-col items-center justify-center gap-1.5 transition-all border-b-2 ${
            activeTab === "qibla"
              ? "border-[#059669] bg-[#059669]/15 text-[#059669] font-bold shadow-[inset_0_-2px_8px_rgba(5,150,105,0.3)]"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-xs sm:text-sm font-semibold">القبلة الحسي</span>
        </button>

        <button
          id="sensory-tab-quran"
          onClick={() => switchTab("quran")}
          className={`py-3.5 px-2 flex flex-col items-center justify-center gap-1.5 transition-all border-b-2 ${
            activeTab === "quran"
              ? "border-[#059669] bg-[#059669]/15 text-[#059669] font-bold shadow-[inset_0_-2px_8px_rgba(5,150,105,0.3)]"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Radio className="w-5 h-5" />
          <span className="text-xs sm:text-sm font-semibold">القرآن الحركي</span>
        </button>

        <button
          id="sensory-tab-tasbih"
          onClick={() => switchTab("tasbih")}
          className={`py-3.5 px-2 flex flex-col items-center justify-center gap-1.5 transition-all border-b-2 ${
            activeTab === "tasbih"
              ? "border-[#059669] bg-[#059669]/15 text-[#059669] font-bold shadow-[inset_0_-2px_8px_rgba(5,150,105,0.3)]"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <RefreshCw className="w-5 h-5" />
          <span className="text-xs sm:text-sm font-semibold">السبحة اللمسية</span>
        </button>

        <button
          id="sensory-tab-vision"
          onClick={() => switchTab("vision")}
          className={`py-3.5 px-2 flex flex-col items-center justify-center gap-1.5 transition-all border-b-2 ${
            activeTab === "vision"
              ? "border-[#059669] bg-[#059669]/15 text-[#059669] font-bold shadow-[inset_0_-2px_8px_rgba(5,150,105,0.3)]"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Camera className="w-5 h-5" />
          <span className="text-xs sm:text-sm font-semibold">عين البصيرة</span>
        </button>
      </div>

      {/* Main Sensory Body Content */}
      <div className="flex-1 flex flex-col p-4 sm:p-6 max-w-2xl mx-auto w-full">
        {/* TAB 1: QIBLA RADAR */}
        {activeTab === "qibla" && (
          <div className="flex-1 flex flex-col justify-between items-center text-center space-y-6 py-2">
            {/* Compass status header */}
            <div className="space-y-2">
              <span
                className={`inline-block px-4 py-1.5 rounded-full text-xs sm:text-sm font-mono font-bold tracking-wide transition-all ${
                  isLocked
                    ? "bg-[#10B981] text-black animate-pulse shadow-[0_0_20px_#10B981]"
                    : "glass-panel text-[#10B981] border border-[#10B981]/30"
                }`}
              >
                {isLocked
                  ? "🎯 توقف! أنت باتجاه القبلة تماماً"
                  : `الفارق الزاوي: ${Math.abs(Math.round(angleDiff))}° ${
                      angleDiff > 0 ? "استدر لليمين" : "استدر لليسار"
                    }`}
              </span>
              <p className="text-xs text-zinc-400 max-w-md leading-relaxed">
                استدر بجسدك ببطء حاملاً هاتفك أفقياً. تتسارع النبضات كلما اقتربت من الكعبة المشرفة حتى يصدر رنين الاستقرار.
              </p>
            </div>

            {/* Giant Sensory Compass Dial Target */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
              {/* Pulsing Ripple rings */}
              <div
                className={`absolute inset-0 rounded-full border transition-all duration-300 ${
                  isLocked
                    ? "border-[#10B981] scale-105 bg-[#10B981]/10 qibla-glow animate-pulse"
                    : "border-white/5 bg-black/60 shadow-2xl"
                }`}
              />
              <div className="absolute inset-4 rounded-full border border-white/5" />
              <div className="absolute inset-8 rounded-full border border-[#10B981]/20" />

              {/* Angle Arrow / Kaaba Indicator */}
              <div
                className="absolute inset-6 rounded-full border border-dashed border-[#10B981]/40 flex items-center justify-center transition-transform duration-200"
                style={{
                  transform: `rotate(${angleDiff}deg)`,
                }}
              >
                <div className="absolute -top-3.5 w-8 h-8 rounded-full bg-[#10B981] text-black font-extrabold flex items-center justify-center text-xs shadow-[0_0_15px_rgba(16,185,129,0.5)] border-2 border-white">
                  🕋
                </div>
              </div>

              {/* Center Core Touch Zone */}
              <button
                onClick={() => {
                  soundEngine.playQiblaProximityPip(angleDiff);
                  speechEngine.speak(
                    isLocked
                      ? "أنت باتجاه القبلة تماماً نحو الكعبة المشرفة."
                      : `الفارق الزاوي الحالي ${Math.abs(Math.round(angleDiff))} درجة، ${
                          angleDiff > 0 ? "استدر لليمين" : "استدر لليسار"
                        }`
                  );
                }}
                className={`w-36 h-36 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all active:scale-95 border-2 backdrop-blur-md ${
                  isLocked
                    ? "bg-[#10B981] border-white text-black shadow-[0_0_30px_rgba(16,185,129,0.6)]"
                    : "bg-black/90 border-[#10B981]/40 text-[#10B981] hover:border-[#10B981]"
                }`}
              >
                <Compass className="w-8 h-8 mb-1" />
                <span className="font-mono font-bold text-2xl tracking-tight">
                  {Math.round(currentHeading)}°
                </span>
                <span className="text-[9px] font-mono font-medium uppercase tracking-wider">
                  {isLocked ? "مضبوط" : "البوصلة"}
                </span>
              </button>
            </div>

            {/* Simulated Compass Slider */}
            <div className="w-full glass-panel p-4 rounded-2xl space-y-2 border border-white/5">
              <div className="flex justify-between text-xs text-zinc-400">
                <span>محاكي دوران الجسد (للاختبار):</span>
                <span className="text-[#10B981] font-mono font-bold">{currentHeading}° / هدف القبلة: {qiblaTargetBearing}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={currentHeading}
                onChange={(e) => setCurrentHeading(Number(e.target.value))}
                className="w-full accent-[#10B981] h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Calibration Advice Button */}
            <div className="flex gap-2 w-full">
              <button
                onClick={() => {
                  soundEngine.playAssistantActivate();
                  speechEngine.speak(
                    "لمعايرة البوصلة، أمسك الهاتف وحركه في الهواء على شكل الرقم ثمانية بالإنجليزية لمدة خمس ثوانٍ."
                  );
                }}
                className="flex-1 py-3 glass-panel hover:bg-white/5 border border-white/10 rounded-xl text-zinc-300 text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <RefreshCw className="w-4 h-4 text-[#10B981]" />
                <span>إرشادات معايرة الحساس (رقم 8)</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: GESTURE QURAN PLAYER */}
        {activeTab === "quran" && (
          <div className="flex-1 flex flex-col justify-between items-center text-center space-y-5 py-2">
            {/* Surah title */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#10B981] bg-[#10B981]/10 px-3 py-1 rounded-full border border-[#10B981]/20">
                سورة رقم {currentSurah.number} من 114
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white font-['Amiri',serif]">
                سورة {currentSurah.nameAr}
              </h2>
              <p className="text-xs text-zinc-400 font-mono">
                بصوت: {reciterName} • {currentSurah.revelationType === "Meccan" ? "مكية" : "مدنية"} • {currentSurah.numberOfAyahs} آية
              </p>
            </div>

            {/* Giant Central Gesture Touch Area */}
            <div
              onClick={togglePlayQuran}
              className={`w-56 h-56 sm:w-64 sm:h-64 rounded-3xl border-2 flex flex-col items-center justify-center p-6 cursor-pointer transition-all shadow-2xl active:scale-95 ${
                isPlaying
                  ? "border-[#10B981] bg-[#10B981]/15 text-white shadow-[0_0_35px_rgba(16,185,129,0.3)] animate-pulse"
                  : "glass-panel border-white/10 hover:border-white/20 text-zinc-200"
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-16 h-16 mb-2 text-[#10B981]" />
                  <span className="text-lg font-bold text-white">جارٍ التلاوة</span>
                  <span className="text-xs text-zinc-400 mt-1 font-mono">انقر للإيقاف المؤقت</span>
                </>
              ) : (
                <>
                  <Play className="w-16 h-16 mb-2 ml-1 text-white" />
                  <span className="text-lg font-bold text-white">بدء التلاوة</span>
                  <span className="text-xs text-zinc-400 mt-1 font-mono">انقر في أي مكان للتشغيل</span>
                </>
              )}
            </div>

            {/* Hidden Audio Element with Metadata & Time Sync */}
            <audio
              ref={audioRef}
              src={`${reciterServer}${getSurahCode(currentSurah.number)}.mp3`}
              onTimeUpdate={() => {
                if (audioRef.current) {
                  setAudioProgress(audioRef.current.currentTime);
                }
              }}
              onLoadedMetadata={() => {
                if (audioRef.current) {
                  setAudioDuration(audioRef.current.duration);
                }
              }}
              onEnded={nextSurah}
              className="hidden"
            />

            {/* Dynamic Recitation Progress Bar with Voice Navigation & Blind Accessibility */}
            <div className="w-full">
              <RecitationProgressBar
                currentTime={audioProgress}
                duration={audioDuration}
                isPlaying={isPlaying}
                surahName={currentSurah.nameAr}
                onSeek={(newTime) => {
                  if (audioRef.current) {
                    audioRef.current.currentTime = newTime;
                    setAudioProgress(newTime);
                  }
                }}
                onSeekDelta={(delta) => {
                  if (audioRef.current) {
                    const newTime = Math.max(
                      0,
                      Math.min(audioRef.current.duration || 1000, audioRef.current.currentTime + delta)
                    );
                    audioRef.current.currentTime = newTime;
                    setAudioProgress(newTime);
                    soundEngine.playTasbihClick();
                  }
                }}
                onRestart={() => {
                  if (audioRef.current) {
                    audioRef.current.currentTime = 0;
                    audioRef.current.play().catch(() => {});
                    setAudioProgress(0);
                    setIsPlaying(true);
                    soundEngine.playTasbihClick();
                  }
                }}
                onTogglePlay={togglePlayQuran}
              />
            </div>

            {/* Gesture Quick Navigation Buttons */}
            <div className="grid grid-cols-3 gap-3 w-full">
              <button
                onClick={prevSurah}
                className="py-4 glass-panel glass-panel-hover border border-white/5 rounded-2xl text-zinc-200 font-semibold flex flex-col items-center gap-1.5 transition active:scale-95"
              >
                <SkipBack className="w-5 h-5 text-[#10B981]" />
                <span className="text-xs">السورة السابقة</span>
              </button>

              <button
                onClick={readTafsirAloud}
                className="py-4 glass-panel border border-[#10B981]/40 bg-[#10B981]/10 rounded-2xl text-[#10B981] font-semibold flex flex-col items-center gap-1.5 transition active:scale-95"
              >
                <Volume2 className="w-5 h-5" />
                <span className="text-xs">نطق التفسير</span>
              </button>

              <button
                onClick={nextSurah}
                className="py-4 glass-panel glass-panel-hover border border-white/5 rounded-2xl text-zinc-200 font-semibold flex flex-col items-center gap-1.5 transition active:scale-95"
              >
                <SkipForward className="w-5 h-5 text-[#10B981]" />
                <span className="text-xs">السورة التالية</span>
              </button>
            </div>

            {/* Reciter Selector */}
            <div className="w-full glass-panel border border-white/5 p-3.5 rounded-2xl text-right">
              <span className="text-xs text-zinc-400 block mb-1.5 font-medium">
                تغيير القارئ (سيرفر MP3Quran الصوتي):
              </span>
              <select
                value={reciterServer}
                onChange={(e) => {
                  setReciterServer(e.target.value);
                  const selectedName = e.target.options[e.target.selectedIndex].text;
                  setReciterName(selectedName);
                  speechEngine.speak(`تم اختيار القارئ: ${selectedName}`);
                }}
                className="w-full bg-black/60 border border-white/10 text-white rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#10B981]"
              >
                <option value="https://server8.mp3quran.net/afs/">مشاري راشد العفاسي</option>
                <option value="https://server7.mp3quran.net/basit/">عبد الباسط عبد الصمد</option>
                <option value="https://server13.mp3quran.net/husr/">محمود خليل الحصري</option>
                <option value="https://server7.mp3quran.net/s_gmd/">سعد الغامدي</option>
                <option value="https://server12.mp3quran.net/maher/">ماهر المعيقلي</option>
              </select>
            </div>
          </div>
        )}

        {/* TAB 3: FULL SCREEN SENSORY TASBIH */}
        {activeTab === "tasbih" && (
          <div className="flex-1 flex flex-col justify-between items-center text-center space-y-4 py-2">
            {/* Thikr Header */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#10B981] bg-[#10B981]/10 px-3 py-1 rounded-full border border-[#10B981]/20">
                السبحة اللمسية الحرة
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white font-['Amiri',serif]">
                {TASBIH_TYPES[selectedThikrIndex].name}
              </h2>
              <p className="text-xs text-zinc-400 font-mono">
                المستهدف: {TASBIH_TYPES[selectedThikrIndex].target} • اهتزاز عند كل تسبيحة ونبضة عند 33 و 100
              </p>
            </div>

            {/* Giant Full-Screen Sensory Touch Target */}
            <div
              id="sensory-tasbih-touchpad"
              onClick={handleTasbihTap}
              className="w-full flex-1 min-h-[260px] glass-panel border-2 border-dashed border-white/20 hover:border-[#10B981]/50 rounded-3xl flex flex-col items-center justify-center p-6 cursor-pointer active:scale-98 transition-all shadow-2xl relative overflow-hidden bg-black/60 group"
            >
              <span className="text-7xl sm:text-9xl font-light font-mono text-white group-hover:text-[#10B981] tracking-tight transition-colors">
                {tasbihCount}
              </span>
              <span className="text-xs text-zinc-500 uppercase font-mono tracking-wider mt-2 group-hover:text-zinc-400">
                اضغط في أي مساحة للتسبيح
              </span>
            </div>

            {/* Tasbih Controls */}
            <div className="grid grid-cols-3 gap-2.5 w-full">
              <button
                onClick={() => {
                  const nextThikr = (selectedThikrIndex + 1) % TASBIH_TYPES.length;
                  setSelectedThikrIndex(nextThikr);
                  soundEngine.playTasbihClick();
                  speechEngine.speak(`تم تغيير الذكر إلى: ${TASBIH_TYPES[nextThikr].name}`);
                }}
                className="py-3 glass-panel hover:bg-white/5 border border-white/10 rounded-xl text-zinc-300 text-xs font-medium transition"
              >
                تغيير الذكر
              </button>

              <button
                onClick={() => {
                  speechEngine.speak(`عدد التسبيحات الحالي هو: ${tasbihCount}`);
                }}
                className="py-3 glass-panel hover:bg-white/5 border border-white/10 rounded-xl text-zinc-300 text-xs font-medium transition"
              >
                نطق العدد
              </button>

              <button
                onClick={resetTasbih}
                className="py-3 glass-panel hover:bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-medium transition"
              >
                تصفير العداد
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: VISION AI CAMERA (EIN AL-BASEERAH) */}
        {activeTab === "vision" && (
          <div className="flex-1 flex flex-col justify-between items-center text-center space-y-4 py-2 animate-fadeIn transition-all duration-300">
            {/* Vision Mode Header */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#10B981] bg-[#10B981]/10 px-3 py-1 rounded-full border border-[#10B981]/20">
                عين البصيرة بالذكاء الاصطناعي (Gemini Vision)
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {visionMode === "prayer_rug"
                  ? "تحديد موضع سجادة الصلاة"
                  : visionMode === "mushaf_text"
                  ? "قراءة المصاحف والكتب (OCR)"
                  : "وصف الغرفة والمشهد المحيط"}
              </h2>
            </div>

            {/* Mode selection pills */}
            <div className="grid grid-cols-3 gap-2 w-full">
              <button
                onClick={() => {
                  setVisionMode("prayer_rug");
                  speechEngine.speak("نمط تحديد سجادة الصلاة");
                }}
                className={`py-2 px-2 rounded-xl text-xs font-medium border transition-all ${
                  visionMode === "prayer_rug"
                    ? "bg-[#10B981] text-black font-semibold border-white/20 shadow-[0_0_12px_#10B981]"
                    : "glass-panel text-zinc-400 border-white/5"
                }`}
              >
                سجادة الصلاة
              </button>

              <button
                onClick={() => {
                  setVisionMode("mushaf_text");
                  speechEngine.speak("نمط قراءة المصحف والكتب");
                }}
                className={`py-2 px-2 rounded-xl text-xs font-medium border transition-all ${
                  visionMode === "mushaf_text"
                    ? "bg-[#10B981] text-black font-semibold border-white/20 shadow-[0_0_12px_#10B981]"
                    : "glass-panel text-zinc-400 border-white/5"
                }`}
              >
                قارئ المصحف
              </button>

              <button
                onClick={() => {
                  setVisionMode("general_scene");
                  speechEngine.speak("نمط وصف الغرفة والعوائق");
                }}
                className={`py-2 px-2 rounded-xl text-xs font-medium border transition-all ${
                  visionMode === "general_scene"
                    ? "bg-[#10B981] text-black font-semibold border-white/20 shadow-[0_0_12px_#10B981]"
                    : "glass-panel text-zinc-400 border-white/5"
                }`}
              >
                وصف الغرفة
              </button>
            </div>

            {/* Video Viewport / Trigger Area */}
            <div className="w-full flex-1 min-h-[220px] max-h-[320px] glass-panel border border-white/10 rounded-3xl overflow-hidden relative flex items-center justify-center bg-black/60">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${cameraActive ? "block" : "hidden"}`}
              />

              {!cameraActive ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 relative">
                  {/* Lazy Loaded Visual Guide Banner for smooth loading without freezing */}
                  <div className="w-full max-w-sm mx-auto mb-3">
                    <LazyImage
                      src={
                        visionMode === "prayer_rug"
                          ? "https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=600&q=75"
                          : visionMode === "mushaf_text"
                          ? "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=600&q=75"
                          : "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=75"
                      }
                      alt="دليل إرشادي لعين البصيرة"
                      aspectRatio="aspect-[16/9]"
                      className="rounded-2xl opacity-75 object-cover"
                      containerClassName="max-h-36 border border-emerald-500/20"
                    />
                  </div>

                  <button
                    onClick={startCamera}
                    className="px-6 py-3.5 bg-[#10B981] hover:bg-[#059669] text-black font-bold rounded-2xl flex items-center gap-2 text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95 transition-all cursor-pointer"
                  >
                    <Camera className="w-5 h-5" />
                    <span>تفعيل كاميرا الهاتف</span>
                  </button>
                  <span className="text-[11px] text-zinc-400 mt-2">
                    {visionMode === "prayer_rug"
                      ? "وجه الكاميرا نحو الأرضية لرصد السجادة وبعدها بالخطوات"
                      : visionMode === "mushaf_text"
                      ? "وجه الكاميرا فوق الصفحة لاستخراج الآيات وقراءتها صوتياً"
                      : "وجه الكاميرا للأمام لاستكشاف الأبواب والممرات والأثاث"}
                  </span>
                </div>
              ) : (
                <div className="absolute bottom-3 left-0 right-0 flex justify-center">
                  <button
                    onClick={captureAndAnalyze}
                    disabled={isAnalyzing}
                    className="px-6 py-3 bg-[#10B981] hover:bg-[#059669] text-black font-bold rounded-full flex items-center gap-2 text-xs shadow-2xl active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>جارٍ التحليل...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>فحص وتوجيه صوتي</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Captured History Gallery using Lazy Loading */}
            {capturedHistory.length > 0 && (
              <div className="w-full text-right space-y-1.5">
                <span className="text-[10px] text-zinc-400 font-bold block">
                  آخر اللقطات المفحوصة (تحميل كسول فائق السرعة):
                </span>
                <div className="grid grid-cols-4 gap-2 w-full">
                  {capturedHistory.map((item) => (
                    <div
                      key={item.id}
                      className="group relative cursor-pointer"
                      onClick={() => {
                        setLastCapturedSnapshot(item.url);
                        speechEngine.speak(`لقطة ${item.label} عند الساعة ${item.timestamp}`);
                      }}
                    >
                      <LazyImage
                        src={item.url}
                        alt={item.label}
                        aspectRatio="aspect-square"
                        className="rounded-xl border border-white/10 group-hover:border-emerald-500 transition"
                      />
                      <span className="absolute bottom-0.5 right-0.5 left-0.5 text-[8px] bg-black/70 text-white rounded px-1 text-center truncate">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Result readout box */}
            {visionResult && (
              <div className="w-full glass-panel border border-[#10B981]/30 p-4 rounded-2xl text-sm text-zinc-200 text-right space-y-3 bg-[#10B981]/5">
                <div className="flex items-center justify-between text-xs text-[#10B981] font-bold border-b border-white/5 pb-2">
                  <span>نتيجة التوجيه الذكي:</span>
                  <button
                    onClick={() => speechEngine.speak(visionResult)}
                    className="flex items-center gap-1 text-white bg-white/10 hover:bg-white/15 px-2.5 py-1 rounded-lg border border-white/10 text-xs cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>إعادة النطق</span>
                  </button>
                </div>

                {/* Display Captured Snapshot with Lazy Loading */}
                {lastCapturedSnapshot && (
                  <div className="max-w-xs mx-auto overflow-hidden rounded-xl border border-emerald-500/30">
                    <LazyImage
                      src={lastCapturedSnapshot}
                      alt="اللقطة المحللة"
                      aspectRatio="aspect-video"
                      containerClassName="max-h-28"
                    />
                  </div>
                )}

                <p className="leading-relaxed font-['Cairo',sans-serif]">
                  {visionResult}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Haptic Patterns Guide Modal */}
      <HapticPatternsGuideModal
        isOpen={isHapticGuideOpen}
        onClose={() => setIsHapticGuideOpen(false)}
      />
    </div>
  );
};
