import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  X,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  Compass,
  Clock,
  BookOpen,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  Headphones,
  Calendar,
  Layers,
  ArrowRight,
  Camera,
  CameraOff,
  RefreshCw,
  Eye,
  SlidersHorizontal,
  FileText,
  Bot,
  Smartphone,
  Shield,
  ExternalLink,
  Bell,
  BellOff,
  Sun,
  Moon,
} from "lucide-react";
import { speechEngine } from "../utils/speechEngine";
import { soundEngine } from "../utils/soundEngine";
import { hapticEngine } from "../utils/hapticEngine";
import { SURAH_LIST } from "../data/quranData";
import {
  calculatePrayerTimes,
  calculateQiblaBearing,
  detectUserAutoLocation,
} from "../utils/prayerCalculator";
import { PrayerTimeItem } from "../types";
import { RecitationProgressBar } from "./visual/RecitationProgressBar";
import { customAiService } from "../utils/customAiService";
import { CustomAISettingsModal } from "./ai/CustomAISettingsModal";
import {
  athkarNotificationService,
  AthkarNotificationSettings,
} from "../services/athkarNotificationService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectSurah?: (surahNumber: number) => void;
  onSwitchMode?: (mode: "sensory" | "visual" | "blueprint") => void;
  onNavigateTab?: (tab: string) => void;
  isBlindModeCall?: boolean;
  shakeWelcomeMessage?: string | null;
}

interface SurahPlayState {
  number: number;
  nameAr: string;
  nameEn: string;
  numberOfAyahs: number;
  audioUrl: string;
  isPlaying: boolean;
  startAyah?: number;
  startFraction?: number;
  descriptionSnippet?: string;
}

// Arabic normalization helper to match user text reliably
function normalizeArabic(text: string): string {
  return text
    .toLowerCase()
    .replace(/[ًٌٍَُِّْـ]/g, "") // remove harakat
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .trim();
}

export const VoiceCompanionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSelectSurah,
  onSwitchMode,
  onNavigateTab,
  isBlindModeCall,
  shakeWelcomeMessage,
}) => {
  const [query, setQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [recognitionInstance, setRecognitionInstance] = useState<any>(null);
  const [statusMessage, setStatusMessage] = useState(
    "تفضل بالتحدث أو كتابة أمرك (مثل: شغل سورة البقرة، موعد صلاة العصر)..."
  );

  // Active Surah Audio Player inside modal
  const [activeSurah, setActiveSurah] = useState<SurahPlayState | null>(null);
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Camera & Visual Eyes for the Blind Companion ("قولي أنت شايف إيه يا رفيقي")
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [cameraVisionMode, setCameraVisionMode] = useState<"general_scene" | "prayer_rug" | "mushaf_text">("general_scene");
  const [cameraFacing, setCameraFacing] = useState<"environment" | "user">("environment");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  // Prayer times card data if queried
  const [prayerTimesData, setPrayerTimesData] = useState<{
    prayers: PrayerTimeItem[];
    nextPrayer: PrayerTimeItem;
    remainingMinutes: number;
    cityName: string;
  } | null>(null);

  // Qibla card data if queried
  const [qiblaBearing, setQiblaBearing] = useState<number | null>(null);

  // Islamic Library fast search result (تفسير آيات، فتاوى فقهية، أحاديث نبوية)
  const [islamicLibraryResult, setIslamicLibraryResult] = useState<{
    category: "tafsir" | "hadith" | "fiqh";
    query: string;
    source?: string;
  } | null>(null);

  // Hisn Al-Muslim Thikr Voice Response Card
  const [hisnResult, setHisnResult] = useState<{
    chapterId: string;
    chapterTitle: string;
    thikrText: string;
    virtue?: string;
    reference?: string;
    repeat?: number;
  } | null>(null);

  // Athkar Notification Control State Card
  const [notificationControlResult, setNotificationControlResult] = useState<{
    command: "disable" | "enable" | "status";
    target: "all" | "morning" | "evening" | "sleep" | "periodic";
    settings: AthkarNotificationSettings;
    timestamp: number;
  } | null>(null);

  // Egyptian Real Human Voice Audio via Gemini TTS (Warm Male Voice: Puck)
  const [currentVoiceAudioUrl, setCurrentVoiceAudioUrl] = useState<string | null>(null);
  const [isVoiceSpeaking, setIsVoiceSpeaking] = useState<boolean>(false);
  const isVoiceSpeakingRef = useRef<boolean>(false);
  const companionVoiceAudioRef = useRef<HTMLAudioElement | null>(null);

  // Live Companion & Direct Continuous Dialogue Mode ("وضع الجاهزية الدائمة للتحدث")
  const [isContinuousChatMode, setIsContinuousChatMode] = useState<boolean>(true);
  const isContinuousChatModeRef = useRef<boolean>(true);
  const isOpenRef = useRef<boolean>(isOpen);
  const isProcessingRef = useRef<boolean>(false);
  const restartListeningTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Custom AI Modal & Shake Interruption Banner
  const [isCustomAiModalOpen, setIsCustomAiModalOpen] = useState(false);
  const [isShakeInterrupted, setIsShakeInterrupted] = useState(false);

  // Double-Shake Interruption: عند هز الهاتف مرتين يتوقف الرفيق فوراً عن المهمة السابقة ويستمع للأمر الجديد
  useEffect(() => {
    const handleShakeInterrupt = (e: Event) => {
      const customEvent = e as CustomEvent<{ fromShake?: boolean }>;
      if (customEvent.detail?.fromShake && isOpenRef.current) {
        stopVoiceAudio();
        stopSurahPlayback();
        speechEngine.stop();
        setIsLoading(false);
        isProcessingRef.current = false;
        pendingPostSpeechActionRef.current = null;

        soundEngine.playAssistantActivate();
        hapticEngine.trigger("assistant_listen");

        setIsShakeInterrupted(true);
        setStatusMessage("⚡ تم استشعار هز الهاتف: تم إيقاف المهمة السابقة وأنا أسمعك الآن!");
        setTimeout(() => setIsShakeInterrupted(false), 3500);

        setTimeout(() => {
          startVoiceListening();
        }, 350);
      }
    };

    window.addEventListener("noor-open-voice-companion", handleShakeInterrupt);
    return () => window.removeEventListener("noor-open-voice-companion", handleShakeInterrupt);
  }, []);

  // Queued action to execute strictly AFTER the voice companion speech ends
  const pendingPostSpeechActionRef = useRef<(() => void) | null>(null);
  const autoCloseOnSurahEndRef = useRef<boolean>(false);

  /**
   * Schedule automatic restart of listening to ensure persistent standby readiness
   */
  const scheduleListeningRestart = (delayMs = 300) => {
    if (restartListeningTimerRef.current) {
      clearTimeout(restartListeningTimerRef.current);
      restartListeningTimerRef.current = null;
    }
    if (!isOpenRef.current || !isContinuousChatModeRef.current) return;
    if (isVoiceSpeakingRef.current || isProcessingRef.current) return;
    if (activeSurah?.isPlaying || (audioRef.current && !audioRef.current.paused)) return;

    restartListeningTimerRef.current = setTimeout(() => {
      if (
        isOpenRef.current &&
        isContinuousChatModeRef.current &&
        !isVoiceSpeakingRef.current &&
        !isProcessingRef.current &&
        !(audioRef.current && !audioRef.current.paused)
      ) {
        startVoiceListening();
      }
    }, delayMs);
  };

  /**
   * Stop any active Quran Surah recitation immediately
   */
  const stopSurahPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setActiveSurah((prev) => (prev ? { ...prev, isPlaying: false } : null));
  };

  // Play realistic human Egyptian male voice audio
  const playVoiceAudio = (audioUrl: string) => {
    try {
      speechEngine.stop();
      if (!companionVoiceAudioRef.current) {
        companionVoiceAudioRef.current = new Audio();
      }
      const audio = companionVoiceAudioRef.current;
      audio.src = audioUrl;
      audio.onplay = () => {
        setIsVoiceSpeaking(true);
        isVoiceSpeakingRef.current = true;
      };

      const handleEnded = () => {
        setIsVoiceSpeaking(false);
        isVoiceSpeakingRef.current = false;

        // 1. If an action is queued (e.g., Quran Surah recitation), execute it strictly AFTER the speech ends
        if (pendingPostSpeechActionRef.current) {
          const action = pendingPostSpeechActionRef.current;
          pendingPostSpeechActionRef.current = null;
          setStatusMessage("بدء تشغيل التلاوة المباركة...");
          action();
        }
        // 2. Otherwise, if Continuous Companion Dialogue Mode is active, automatically listen for the user's next words hands-free
        else if (isContinuousChatModeRef.current) {
          setStatusMessage("أنا جليسك وسامعك يا غالي، اتكلم في أي وقت...");
          setTimeout(() => {
            if (
              isOpenRef.current &&
              isContinuousChatModeRef.current &&
              !isProcessingRef.current &&
              !isVoiceSpeakingRef.current &&
              !(audioRef.current && !audioRef.current.paused)
            ) {
              soundEngine.playAssistantActivate();
              startVoiceListening();
            }
          }, 700);
        }
      };

      audio.onended = handleEnded;
      audio.onerror = () => {
        setIsVoiceSpeaking(false);
        isVoiceSpeakingRef.current = false;
        if (pendingPostSpeechActionRef.current) {
          const action = pendingPostSpeechActionRef.current;
          pendingPostSpeechActionRef.current = null;
          action();
        }
      };

      audio.play().catch((err) => {
        console.warn("Audio play prevented:", err);
        setIsVoiceSpeaking(false);
        isVoiceSpeakingRef.current = false;
        if (pendingPostSpeechActionRef.current) {
          const action = pendingPostSpeechActionRef.current;
          pendingPostSpeechActionRef.current = null;
          action();
        }
      });
    } catch (e) {
      console.error("Audio playback error:", e);
      setIsVoiceSpeaking(false);
      isVoiceSpeakingRef.current = false;
      if (pendingPostSpeechActionRef.current) {
        const action = pendingPostSpeechActionRef.current;
        pendingPostSpeechActionRef.current = null;
        action();
      }
    }
  };

  const stopVoiceAudio = () => {
    if (companionVoiceAudioRef.current) {
      companionVoiceAudioRef.current.pause();
      companionVoiceAudioRef.current.currentTime = 0;
    }
    setIsVoiceSpeaking(false);
    isVoiceSpeakingRef.current = false;
    speechEngine.stop();
  };

  // Speak text using human Egyptian voice endpoint, or fallback to browser TTS with selected voice tone
  const speakEgyptianVoice = async (text: string) => {
    const voiceGender = speechEngine.getVoiceGender();
    try {
      const res = await fetch("/api/companion/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, gender: voiceGender }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.audioUrl) {
          setCurrentVoiceAudioUrl(data.audioUrl);
          playVoiceAudio(data.audioUrl);
          return;
        }
      }
    } catch (err) {
      console.warn("TTS endpoint fallback:", err);
    }

    // Fallback: Browser speech synthesis with configured voice tone (male/female)
    setIsVoiceSpeaking(true);
    isVoiceSpeakingRef.current = true;
    speechEngine.speakEgyptian(text, {
      gender: voiceGender,
      onEnd: () => {
        setIsVoiceSpeaking(false);
        isVoiceSpeakingRef.current = false;
        if (pendingPostSpeechActionRef.current) {
          const action = pendingPostSpeechActionRef.current;
          pendingPostSpeechActionRef.current = null;
          setStatusMessage("بدء تنفيذ الأمر المبارك...");
          action();
        } else if (isContinuousChatModeRef.current) {
          setStatusMessage("أنا جليسك وسامعك يا غالي، اتكلم في أي وقت...");
          setTimeout(() => {
            if (
              isOpenRef.current &&
              isContinuousChatModeRef.current &&
              !isProcessingRef.current &&
              !isVoiceSpeakingRef.current &&
              !(audioRef.current && !audioRef.current.paused)
            ) {
              soundEngine.playAssistantActivate();
              startVoiceListening();
            }
          }, 700);
        }
      },
    });
  };

  useEffect(() => {
    isOpenRef.current = isOpen;
    if (isOpen) {
      // By default, voice assistant stays in persistent "always-ready" continuous standby
      setIsContinuousChatMode(true);
      isContinuousChatModeRef.current = true;

      if (shakeWelcomeMessage) {
        soundEngine.playAssistantActivate();
        setStatusMessage("أهلاً بك يا غالي! أنا رفيقك الذكي وجاهز في خدمتك، تفضل بالأمر الصوتي...");
        setResponse(shakeWelcomeMessage);
        speakEgyptianVoice(shakeWelcomeMessage);
      } else if (isBlindModeCall) {
        soundEngine.playAssistantActivate();
        const welcomeBlind =
          "أهلاً بيك يا غالي في وضع البصيرة للمكفوفين. أنا رفيقك وجليسك وسامعك علطول.. اطلب مني أي حاجة، تقولي شغل سورة كذا، أو اسألني عن الصلاة والقبلة، وممكن تقولي: قولي انت شايف ايه يا رفيقي علشان افتح الكاميرا واوصفلك اللي قدامك.";
        setStatusMessage("وضع الرفيق نشط للمكفوفين • جارٍ الاتصال الصوتي المباشر...");
        setResponse(welcomeBlind);
        speakEgyptianVoice(welcomeBlind);
      } else {
        soundEngine.playAssistantActivate();
        startVoiceListening();
      }
    } else {
      if (restartListeningTimerRef.current) {
        clearTimeout(restartListeningTimerRef.current);
        restartListeningTimerRef.current = null;
      }
      stopCamera();
      stopVoiceListening();
      stopVoiceAudio();
      stopSurahPlayback();
      speechEngine.stop();
      pendingPostSpeechActionRef.current = null;
    }
  }, [isOpen, isBlindModeCall, shakeWelcomeMessage]);

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      setAudioProgress(audio.currentTime);
      setAudioDuration(audio.duration || 0);
    };
    const onEnded = () => {
      if (activeSurah) {
        setActiveSurah((prev) => (prev ? { ...prev, isPlaying: false } : null));
      }
      if (autoCloseOnSurahEndRef.current) {
        autoCloseOnSurahEndRef.current = false;
        setStatusMessage("انتهت التلاوة المباركة، يجري إغلاق النافذة كما طلبت...");
        speechEngine.speakEgyptian("انتهت التلاوة المباركة وتقبل الله طاعتكم يا غالي.", {
          onEnd: () => {
            onClose();
          },
        });
      }
    };
    const onError = () => {
      console.warn("Audio playback error");
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, [activeSurah]);

  const toggleSurahPlayback = () => {
    if (!audioRef.current || !activeSurah) return;
    if (activeSurah.isPlaying) {
      audioRef.current.pause();
      setActiveSurah({ ...activeSurah, isPlaying: false });
    } else {
      audioRef.current.play().catch(() => {});
      setActiveSurah({ ...activeSurah, isPlaying: true });
    }
  };

  /**
   * When user starts speaking again:
   * 1. Quran recitation immediately STOPS
   * 2. Companion speech STOPS
   * 3. Queued actions are cleared
   */
  const startVoiceListening = () => {
    if (!isOpenRef.current) return;
    if (isVoiceSpeakingRef.current || isProcessingRef.current) return;
    if (activeSurah?.isPlaying || (audioRef.current && !audioRef.current.paused)) return;

    // Immediately stop any ongoing Quran recitation when the user talks!
    stopSurahPlayback();
    stopVoiceAudio();
    pendingPostSpeechActionRef.current = null;
    window.dispatchEvent(new CustomEvent("noor-pause-all-audio"));

    setIsListening(true);
    setStatusMessage(
      isContinuousChatModeRef.current
        ? "وضع الجاهزية الدائمة 🟢: أنا سامعك يا غالي، اتكلم في أي وقت دون لمس الشاشة..."
        : "جارٍ الاستماع إليك... (تحدث باللغة العربية)"
    );

    const rec = speechEngine.createRecognition(
      (transcript) => {
        // Immediately make sure Quran recitation is paused when speech is captured
        stopSurahPlayback();
        setQuery(transcript);
        setIsListening(false);
        processQuery(transcript);
      },
      (error) => {
        setIsListening(false);
        const errType = (error as any)?.error;
        // If aborted intentionally or we are actively processing/speaking, ignore and do not loop restart
        if (errType === "aborted" || isProcessingRef.current || isVoiceSpeakingRef.current) {
          return;
        }
        if (isContinuousChatModeRef.current && (errType === "no-speech" || !errType)) {
          setStatusMessage("وضع الجاهزية الدائمة 🟢 • في انتظار صوتك، تحدث في أي وقت...");
          scheduleListeningRestart(600);
        } else if (isContinuousChatModeRef.current) {
          setStatusMessage("المساعد جاهز لسماعك يا غالي... تحدث في أي وقت.");
          scheduleListeningRestart(800);
        } else {
          setStatusMessage("تعذر التقاط الصوت، يمكنك النقر للحديث مجدداً أو الكتابة بالأسفل.");
        }
      },
      () => {
        setIsListening(false);
        if (
          isOpenRef.current &&
          isContinuousChatModeRef.current &&
          !isProcessingRef.current &&
          !isVoiceSpeakingRef.current &&
          !(audioRef.current && !audioRef.current.paused)
        ) {
          scheduleListeningRestart(500);
        }
      }
    );

    if (rec) {
      try {
        rec.start();
        setRecognitionInstance(rec);
      } catch {
        setIsListening(false);
        if (isContinuousChatModeRef.current) {
          scheduleListeningRestart(1000);
        }
      }
    } else {
      setIsListening(false);
      setStatusMessage("التعرف الصوتي غير مدعوم في هذا المتصفح، يمكنك الكتابة في الحقل أدناه.");
    }
  };

  const stopVoiceListening = () => {
    if (restartListeningTimerRef.current) {
      clearTimeout(restartListeningTimerRef.current);
      restartListeningTimerRef.current = null;
    }
    if (recognitionInstance) {
      try {
        recognitionInstance.stop();
      } catch {}
      setRecognitionInstance(null);
    }
    setIsListening(false);
  };

  /**
   * Toggle Continuous Live Conversation Companion Mode
   */
  const toggleContinuousChatMode = () => {
    const next = !isContinuousChatMode;
    setIsContinuousChatMode(next);
    isContinuousChatModeRef.current = next;
    soundEngine.playTasbihClick();

    if (next) {
      const reply =
        "تم تفعيل وضع الجاهزية الدائمة، أنا رفيقك وسامعك علطول يا غالي.. اتكلم في أي وقت والمايك هيفضل شغال ومستنيك.";
      setResponse(reply);
      speakEgyptianVoice(reply);
      speechEngine.announceForScreenReader(
        "تم تفعيل وضع الجاهزية الدائمة للتحدث بدون انقطاع"
      );
    } else {
      stopVoiceListening();
      const reply = "تمام يا غالي، تم إيقاف وضع الجاهزية الدائمة مؤقتاً، وفي أي وقت تحب تتكلم اضغط على المايك.";
      setResponse(reply);
      speakEgyptianVoice(reply);
      speechEngine.announceForScreenReader("تم إيقاف وضع الجاهزية الدائمة.");
    }
  };

  /**
   * Dedicated Surah Audio Playback trigger with precise segment & ayah seeking
   */
  const playSurahAudio = (
    surah: (typeof SURAH_LIST)[number],
    options?: { startAyah?: number; fromLastAyahs?: number; descriptionSnippet?: string }
  ) => {
    const surahPad = String(surah.number).padStart(3, "0");
    const audioUrl = `https://server8.mp3quran.net/afs/${surahPad}.mp3`;

    let startFraction = 0;
    let targetAyah = 1;

    if (options?.fromLastAyahs && options.fromLastAyahs > 0) {
      targetAyah = Math.max(1, surah.numberOfAyahs - options.fromLastAyahs + 1);
      startFraction = (targetAyah - 1) / surah.numberOfAyahs;
    } else if (options?.startAyah && options.startAyah > 1) {
      targetAyah = Math.min(surah.numberOfAyahs, options.startAyah);
      startFraction = (targetAyah - 1) / surah.numberOfAyahs;
    }

    const surahState: SurahPlayState = {
      number: surah.number,
      nameAr: surah.nameAr,
      nameEn: surah.nameEn,
      numberOfAyahs: surah.numberOfAyahs,
      audioUrl,
      isPlaying: true,
      startAyah: targetAyah,
      startFraction,
      descriptionSnippet: options?.descriptionSnippet,
    };

    setActiveSurah(surahState);

    // Play audio directly
    if (audioRef.current) {
      const audio = audioRef.current;
      audio.src = audioUrl;

      const performSeek = () => {
        if (startFraction > 0 && audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
          const targetTime = Math.min(audio.duration - 2, audio.duration * startFraction);
          audio.currentTime = targetTime;
          setAudioProgress(targetTime);
        }
      };

      audio.onloadedmetadata = () => {
        performSeek();
        audio.play().catch((err) => {
          console.warn("Auto-play error:", err);
        });
      };

      audio.play().catch((err) => {
        console.warn("Auto-play prevented by browser:", err);
      });
    }

    // Dispatch event to app
    window.dispatchEvent(
      new CustomEvent("noor-play-surah", {
        detail: {
          surahNumber: surah.number,
          startAyah: targetAyah,
          startFraction,
        },
      })
    );
    if (onSelectSurah) onSelectSurah(surah.number);
  };

  /**
   * Camera Controls & Scene Analysis ("عين البصيرة للمكفوفين")
   */
  const startCamera = async (facing: "environment" | "user" = cameraFacing): Promise<boolean> => {
    try {
      setIsCameraLoading(true);
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing },
      });
      cameraStreamRef.current = stream;
      setIsCameraActive(true);
      setIsCameraLoading(false);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      soundEngine.playAssistantActivate();
      return true;
    } catch (err) {
      console.warn("Camera start failed:", err);
      setIsCameraLoading(false);
      setIsCameraActive(false);
      const errMsg = "يا غالي، يرجى السماح بإذن الكاميرا من المتصفح علشان أقدر أشوف اللي قدامك واوصفهولك.";
      setResponse(errMsg);
      speakEgyptianVoice(errMsg);
      return false;
    }
  };

  const stopCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((t) => t.stop());
      cameraStreamRef.current = null;
    }
    setIsCameraActive(false);
    setIsCameraLoading(false);
  };

  const toggleCameraFacing = async () => {
    const nextFacing = cameraFacing === "environment" ? "user" : "environment";
    setCameraFacing(nextFacing);
    await startCamera(nextFacing);
  };

  const captureAndDescribeScene = async (mode: "general_scene" | "prayer_rug" | "mushaf_text" = cameraVisionMode) => {
    if (!videoRef.current || !isCameraActive) {
      const ok = await startCamera();
      if (!ok) return;
      await new Promise((r) => setTimeout(r, 650));
    }

    setIsLoading(true);
    setStatusMessage("عين البصيرة بتفحص المشهد قدامك بالذكاء الاصطناعي...");
    soundEngine.playAssistantActivate();
    speakEgyptianVoice("ثواني يا غالي، ببص على اللي قدامك واوصفهولك حالا..");

    try {
      const video = videoRef.current;
      if (!video) throw new Error("No video feed");

      const canvas = canvasRef.current || document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("No canvas context");

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);

      const res = await fetch("/api/gemini/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: dataUrl, mode }),
      });

      if (!res.ok) throw new Error("Vision API error");
      const result = await res.json();
      const desc = result.description || "تم فحص المشهد بنجاح يا غالي.";
      setResponse(desc);
      speakEgyptianVoice(result.ttsSpeech || desc);
    } catch (err) {
      console.error("Scene capture error:", err);
      const errMsg = "عذراً يا حبيب قلبي، تأكد من توجيه الهاتف للأمام ووضوح الإضاءة واطلب مني تاني وأنا هشوفلك حاضر.";
      setResponse(errMsg);
      speakEgyptianVoice(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Audio Seeking & Progression Control
   */
  const handleSeekDelta = (deltaSeconds: number) => {
    if (audioRef.current && activeSurah) {
      const newTime = Math.max(0, Math.min(audioRef.current.duration || 1000, audioRef.current.currentTime + deltaSeconds));
      audioRef.current.currentTime = newTime;
      setAudioProgress(newTime);
      soundEngine.playTasbihClick();
    }
    // Also broadcast to global players (like QuranComprehensiveView or SensoryHome)
    window.dispatchEvent(
      new CustomEvent("noor-seek-audio", {
        detail: { deltaSeconds, action: "seek" },
      })
    );
  };

  const handleRestartAudio = () => {
    if (audioRef.current && activeSurah) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
      setAudioProgress(0);
      setActiveSurah({ ...activeSurah, isPlaying: true });
      soundEngine.playTasbihClick();
    }
    window.dispatchEvent(
      new CustomEvent("noor-seek-audio", {
        detail: { action: "restart" },
      })
    );
  };

  /**
   * Comprehensive Intent & Command Engine
   * Executes Surah playback, prayer times calculations, qibla, mode switches, and tafsir questions
   */
  const processQuery = async (inputQuery: string) => {
    const rawText = inputQuery.trim();
    if (!rawText) return;

    // Immediately flag processing to prevent background recognition from restarting and colliding
    isProcessingRef.current = true;
    setIsListening(false);
    if (restartListeningTimerRef.current) {
      clearTimeout(restartListeningTimerRef.current);
      restartListeningTimerRef.current = null;
    }
    if (recognitionInstance) {
      try {
        recognitionInstance.abort();
      } catch {}
    }

    const clean = normalizeArabic(rawText);
    setIsLoading(true);
    setResponse(null);
    setPrayerTimesData(null);
    setQiblaBearing(null);

    // Rely exclusively on natural, soothing, spiritual AI responses with direct voice playback
    // 6. Conversational, Tafsir & Guidance via Custom AI or AI Server
    try {
      if (customAiService.isCustomEnabled()) {
        const customConfig = customAiService.getConfig();
        setStatusMessage(`جاري استشارة النموذج المخصص (${customConfig.modelName})...`);
        const answer = await customAiService.query(rawText, [
          ...(response ? [{ role: "assistant", content: response }] : []),
        ]);
        setResponse(answer);
        speakEgyptianVoice(answer);
        setIsLoading(false);
        return;
      }

      setStatusMessage("الرفيق يستمع إليك ويجيبك بنبرة روحانية مطمئنة وسريعة...");
      const userVoiceGender = speechEngine.getVoiceGender();
      const res = await fetch("/api/gemini/companion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: rawText,
          gender: userVoiceGender,
          voiceGender: userVoiceGender,
        }),
      });

      if (!res.ok) {
        throw new Error("Server error");
      }

      const data = await res.json();
      const answer =
        data.response ||
        "يا هلا بيك يا حبيبي، منور تطبيق النور، ربنا يتقبل منا ومنكم صالح الأعمال.\n\nالمصدر: تطبيق النور الإسلامي";
      setResponse(answer);

      // Execute AI detected action on the fly ("متحكم كامل في التطبيق")
      if (data.action) {
        if (data.action.type === "play_surah" && data.action.surahNumber) {
          const matched = SURAH_LIST.find((s) => s.number === data.action.surahNumber);
          if (matched) {
            autoCloseOnSurahEndRef.current = !!data.action.autoCloseOnEnd;
            const fromLastAyahs = data.action.fromLastAyahs;
            const startAyah = data.action.startAyah;
            let descriptionSnippet: string | undefined = undefined;
            if (fromLastAyahs) {
              descriptionSnippet = `من آخر ${fromLastAyahs} آيات`;
            } else if (startAyah) {
              descriptionSnippet = `بدءاً من الآية ${startAyah}`;
            }

            // Queue surah playback to start strictly AFTER the assistant finishes speaking
            pendingPostSpeechActionRef.current = () => {
              playSurahAudio(matched, { fromLastAyahs, startAyah, descriptionSnippet });
            };
          }
        } else if (data.action.type === "fatwa_query") {
          // Open Fatwa Encyclopedia with search query and preferred source
          setIslamicLibraryResult({
            category: "fiqh",
            query: data.action.query,
            source: data.action.source,
          });
          window.dispatchEvent(
            new CustomEvent("noor-open-fatwa", {
              detail: { query: data.action.query, source: data.action.source },
            })
          );
          window.dispatchEvent(new CustomEvent("noor-navigate-tab", { detail: { tab: "fatwa" } }));
          if (onNavigateTab) onNavigateTab("fatwa");
        } else if (data.action.type === "hadith_filter") {
          hapticEngine.trigger("assistant_respond");
          setIslamicLibraryResult({
            category: "hadith",
            query: data.action.query || data.action.label || "أحاديث نبوية",
            source:
              data.action.book === "bukhari"
                ? "صحيح البخاري"
                : data.action.book === "muslim"
                ? "صحيح مسلم"
                : "الأحاديث الصحيحة",
          });
          window.dispatchEvent(
            new CustomEvent("noor-hadith-filter", {
              detail: {
                grade: data.action.grade || "all",
                book: data.action.book || null,
                query: data.action.query || "",
                voiceFilterLabel: data.action.label || "فلترة صوتية للحديث",
              },
            })
          );
          window.dispatchEvent(new CustomEvent("noor-navigate-tab", { detail: { tab: "hadith" } }));
          if (onNavigateTab) onNavigateTab("hadith");
        } else if (data.action.type === "islamic_library_search") {
          hapticEngine.trigger("assistant_respond");
          setIslamicLibraryResult({
            category: data.action.category || "tafsir",
            query: data.action.query || rawText,
            source: data.action.source,
          });
        } else if (data.action.type === "hisn_muslim") {
          hapticEngine.trigger("assistant_respond");
          setHisnResult({
            chapterId: data.action.chapterId || "morning_evening",
            chapterTitle: data.action.chapterTitle || "حصن المسلم",
            thikrText: data.action.thikrText || rawText,
            virtue: data.action.virtue,
            reference: data.action.reference,
            repeat: data.action.repeat || 1,
          });
          window.dispatchEvent(
            new CustomEvent("noor-open-hisn-chapter", {
              detail: { chapterId: data.action.chapterId },
            })
          );
        } else if (data.action.type === "athkar_notification_control") {
          hapticEngine.trigger("assistant_respond");
          const cmd = data.action.command || "status";
          const tgt = data.action.target || "all";
          if (cmd === "disable") {
            if (tgt === "all") {
              athkarNotificationService.disableAll();
            } else {
              athkarNotificationService.disableTarget(tgt);
            }
          } else if (cmd === "enable") {
            if (tgt === "all") {
              athkarNotificationService.enableAll();
            } else {
              athkarNotificationService.enableTarget(tgt);
            }
          }
          setNotificationControlResult({
            command: cmd,
            target: tgt,
            settings: athkarNotificationService.getSettings(),
            timestamp: Date.now(),
          });
        } else if (data.action.type === "stop_audio") {
          stopSurahPlayback();
          stopVoiceAudio();
          window.dispatchEvent(new CustomEvent("noor-pause-all-audio"));
        } else if (data.action.type === "radio") {
          stopSurahPlayback();
          window.dispatchEvent(new CustomEvent("noor-navigate-tab", { detail: { tab: "cairo_radio" } }));
          if (onNavigateTab) onNavigateTab("cairo_radio");
        } else if (data.action.type === "continuous_chat") {
          const enable = data.action.enable !== false;
          setIsContinuousChatMode(enable);
          isContinuousChatModeRef.current = enable;
        } else if (data.action.type === "prayer_times") {
          try {
            const userLoc = await detectUserAutoLocation();
            const now = new Date();
            const prayers = calculatePrayerTimes(now, userLoc.lat, userLoc.lng, userLoc.timezone, "egypt");
            const nowMs = now.getTime();
            const nextPrayer = prayers.find((p) => p.timestamp > nowMs) || prayers[0];
            const remainingMinutes = Math.max(1, Math.round((nextPrayer.timestamp - nowMs) / 60000));
            setPrayerTimesData({ prayers, nextPrayer, remainingMinutes, cityName: userLoc.nameAr });
          } catch (e) {}
        } else if (data.action.type === "qibla") {
          try {
            const userLoc = await detectUserAutoLocation();
            const bearing = calculateQiblaBearing(userLoc.lat, userLoc.lng);
            setQiblaBearing(bearing);
          } catch (e) {}
        } else if (data.action.type === "navigate" && data.action.tab) {
          window.dispatchEvent(new CustomEvent("noor-navigate-tab", { detail: { tab: data.action.tab } }));
          if (onNavigateTab) onNavigateTab(data.action.tab);
        } else if (data.action.type === "blind_guide" || data.action.type === "switch_mode") {
          const targetMode = data.action.mode || "sensory";
          if (onSwitchMode) onSwitchMode(targetMode);
        } else if (data.action.type === "switch_theme" && data.action.theme) {
          window.dispatchEvent(new CustomEvent("noor-set-theme", { detail: { theme: data.action.theme } }));
        } else if (data.action.type === "open_camera") {
          const mode = data.action.visionMode || "general_scene";
          setCameraVisionMode(mode);
          startCamera().then((ok) => {
            if (ok) {
              setTimeout(() => {
                captureAndDescribeScene(mode);
              }, 700);
            }
          });
        } else if (data.action.type === "seek_audio") {
          const delta = data.action.deltaSeconds || 0;
          if (data.action.action === "restart") {
            handleRestartAudio();
          } else if (data.action.action === "resume") {
            if (audioRef.current && activeSurah) {
              audioRef.current.play().catch(() => {});
              setActiveSurah({ ...activeSurah, isPlaying: true });
            }
            window.dispatchEvent(
              new CustomEvent("noor-seek-audio", { detail: { action: "resume" } })
            );
          } else {
            handleSeekDelta(delta);
          }
        }
      }

      if (data.audioUrl) {
        setCurrentVoiceAudioUrl(data.audioUrl);
        playVoiceAudio(data.audioUrl);
      } else {
        const speechText = data.ttsSpeech || answer;
        speakEgyptianVoice(speechText);
      }
    } catch (err) {
      const fallback =
        "نوّر الله قلبك بالإيمان والسكينة يا أخي المبارك. أنا رفيقك المبارك في كل ما تحتاجه من تلاوات القرآن ومواقيت الصلاة والأذكار، تفضل بما يريح قلبك.";
      setResponse(fallback);
      speakEgyptianVoice(fallback);
    } finally {
      setIsLoading(false);
      isProcessingRef.current = false;
    }
  };

  const handleQuickCommand = (cmd: string) => {
    soundEngine.playTasbihClick();
    setQuery(cmd);
    processQuery(cmd);
  };

  const handleOpenTab = (tab: string) => {
    soundEngine.playTasbihClick();
    window.dispatchEvent(new CustomEvent("noor-navigate-tab", { detail: { tab } }));
    if (onNavigateTab) onNavigateTab(tab);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      id="voice-companion-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      {/* Hidden audio player instance */}
      <audio ref={audioRef} />

      <div
        id="voice-companion-dialog"
        className="w-full max-w-xl bg-[#101413] border border-[#059669]/40 rounded-3xl shadow-[0_0_40px_rgba(5,150,105,0.25)] overflow-hidden text-[#E4E4E7] flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-white/5 bg-[#141A17]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#059669]/15 text-[#059669] border border-[#059669]/30 flex items-center justify-center shadow-[0_0_15px_rgba(5,150,105,0.2)]">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm sm:text-base text-white tracking-tight">
                  الرفيق الإسلامي والجليس الصالح
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 font-mono font-bold">
                  صوت رجل مصري
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                محادثة مباشرة • تلاوة القرآن بعد الصوت • توقف فوري عند كلامك
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Continuous Companion Mode Toggle */}
            <button
              onClick={toggleContinuousChatMode}
              className={`px-3 py-1.5 rounded-2xl text-xs font-bold border transition flex items-center gap-1.5 ${
                isContinuousChatMode
                  ? "bg-emerald-500 text-white border-emerald-400 shadow-[0_0_15px_rgba(5,150,105,0.45)]"
                  : "bg-white/5 hover:bg-white/10 text-zinc-300 border-white/10"
              }`}
              title={
                isContinuousChatMode
                  ? "وضع الجاهزية الدائمة نشط • انقر للإيقاف المؤقت"
                  : "تفعيل وضع الجاهزية الدائمة للتحدث باستمرار"
              }
              aria-label="تبديل وضع الجاهزية الدائمة للتحدث"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isContinuousChatMode ? "bg-white animate-ping" : "bg-emerald-400"
                }`}
              />
              <span className="hidden sm:inline">
                {isContinuousChatMode ? "الجاهزية الدائمة (نشط)" : "تفعيل الجاهزية"}
              </span>
              <span className="sm:hidden">
                {isContinuousChatMode ? "جاهزية دائمية" : "الجاهزية"}
              </span>
            </button>

            {/* Custom AI Config Button */}
            <button
              onClick={() => {
                soundEngine.playTasbihClick();
                setIsCustomAiModalOpen(true);
              }}
              className={`p-2 rounded-xl border transition-colors flex items-center gap-1.5 text-xs ${
                customAiService.isCustomEnabled()
                  ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-bold"
                  : "bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border-white/5"
              }`}
              title="ربط نموذج ذكي مخصص (API & Endpoint & Model)"
              aria-label="إعدادات المساعد الذكي المخصص"
            >
              <Bot className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline text-[11px]">
                {customAiService.isCustomEnabled() ? "نموذج مخصص" : "ربط API"}
              </span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/5 transition-colors"
              title="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Shake Interruption Alert Banner */}
        {isShakeInterrupted && (
          <div className="mx-4 sm:mx-6 mt-3 p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs flex items-center justify-between animate-fadeIn shadow-[0_0_20px_rgba(245,158,11,0.25)]">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-amber-400 animate-bounce" />
              <span className="font-bold">
                ⚡ مقاطعة فورية بالهز: تم إيقاف المهمة السابقة وأنا في انتظار أمرك الصوتي الجديد الآن!
              </span>
            </div>
            <span className="text-[10px] bg-amber-500/30 px-2 py-0.5 rounded-full font-bold">
              استماع فوري
            </span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Status badge */}
          <div
            className={`flex items-center justify-between text-xs px-3.5 py-2.5 rounded-2xl border transition ${
              isContinuousChatMode
                ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
                : "bg-white/[0.03] border-white/5 text-zinc-400"
            }`}
          >
            <span className="flex items-center gap-2 font-mono text-[11px]">
              {isLoading ? (
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_#F59E0B]" />
              ) : isVoiceSpeaking ? (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shadow-[0_0_10px_#10B981]" />
              ) : isListening ? (
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping shadow-[0_0_8px_#F43F5E]" />
              ) : (
                <span className="w-2.5 h-2.5 rounded-full bg-[#059669] shadow-[0_0_8px_#059669]" />
              )}
              {statusMessage}
            </span>
            {isListening && (
              <span className="text-rose-400 font-mono text-[10px] uppercase tracking-wider font-bold">
                مباشر
              </span>
            )}
            {isLoading && (
              <span className="text-amber-400 font-mono text-[10px] uppercase tracking-wider font-bold">
                تفكير...
              </span>
            )}
            {isVoiceSpeaking && (
              <span className="text-emerald-400 font-mono text-[10px] uppercase tracking-wider font-bold">
                يتحدث 🔊
              </span>
            )}
          </div>

          {/* Quick Voice Commands Pills */}
          <div className="space-y-1.5">
            <span className="text-[11px] text-zinc-400 font-semibold block">
              أوامر سريعة بنقرة واحدة أو تحدث بها:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              <button
                onClick={() => handleQuickCommand("كن جليسي وخليك معايا")}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium flex items-center gap-1.5 transition ${
                  isContinuousChatMode
                    ? "bg-emerald-500 text-white font-bold"
                    : "bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30"
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>كن جليسي (محادثة مستمرة)</span>
              </button>
              <button
                onClick={() => handleQuickCommand("قولي انت شايف ايه يا رفيقي")}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-emerald-500/20 hover:from-amber-500/30 hover:to-emerald-500/30 text-amber-300 border border-amber-500/40 whitespace-nowrap font-bold flex items-center gap-1.5 transition shadow-[0_0_12px_rgba(245,158,11,0.2)]"
              >
                <Eye className="w-3.5 h-3.5 text-yellow-400" />
                <span>قولي أنت شايف إيه يا رفيقي (عين البصيرة)</span>
              </button>
              <button
                onClick={() => handleQuickCommand("شغل سورة البقرة وأغلق التطبيق بعد انتهائها")}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 whitespace-nowrap font-medium flex items-center gap-1.5 transition"
              >
                <Play className="w-3 h-3" />
                <span>تشغيل سورة البقرة والإغلاق بعدها</span>
              </button>
              <button
                onClick={() => handleQuickCommand("قدم 10 ثواني")}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 whitespace-nowrap font-medium flex items-center gap-1.5 transition"
              >
                <RotateCcw className="w-3 h-3 scale-x-[-1]" />
                <span>قدم التلاوة 10 ثواني</span>
              </button>
              <button
                onClick={() => handleQuickCommand("أخر 10 ثواني")}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 whitespace-nowrap font-medium flex items-center gap-1.5 transition"
              >
                <RotateCcw className="w-3 h-3" />
                <span>أخر التلاوة 10 ثواني</span>
              </button>
              <button
                onClick={() => handleQuickCommand("أريد فتوى عن حكم صلاة الجماعة من دار الإفتاء المصرية")}
                className="px-3 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 whitespace-nowrap font-medium flex items-center gap-1.5 transition"
              >
                <BookOpen className="w-3 h-3" />
                <span>فتوى صلاة الجماعة (دار الإفتاء)</span>
              </button>
              <button
                onClick={() => handleQuickCommand("تفسير وشرح آية الكرسي")}
                className="px-3 py-1.5 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 border border-teal-500/40 whitespace-nowrap font-bold flex items-center gap-1.5 transition"
              >
                <BookOpen className="w-3 h-3 text-teal-400" />
                <span>تفسير آية الكرسي (تفسير القرآن)</span>
              </button>
              <button
                onClick={() => handleQuickCommand("ما حكم سجود السهو في الصلاة؟")}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 whitespace-nowrap font-bold flex items-center gap-1.5 transition"
              >
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>حكم سجود السهو (فقه)</span>
              </button>
              <button
                onClick={() => handleQuickCommand("شرح حديث إنما الأعمال بالنيات")}
                className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 whitespace-nowrap font-bold flex items-center gap-1.5 transition"
              >
                <FileText className="w-3 h-3 text-amber-400" />
                <span>شرح حديث النيات (حديث نبوي)</span>
              </button>
              <button
                onClick={() => handleQuickCommand("كم باقي على الصلاة القادمة؟")}
                className="px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 whitespace-nowrap font-medium flex items-center gap-1.5 transition"
              >
                <Calendar className="w-3 h-3" />
                <span>كم باقي على الصلاة؟</span>
              </button>
              <button
                onClick={() => handleQuickCommand("أين القبلة الآن؟")}
                className="px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 whitespace-nowrap font-medium flex items-center gap-1.5 transition"
              >
                <Compass className="w-3 h-3" />
                <span>اتجاه القبلة</span>
              </button>
              <button
                onClick={() => handleQuickCommand("شغل إذاعة القرآن الكريم من القاهرة")}
                className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 whitespace-nowrap font-medium flex items-center gap-1.5 transition"
              >
                <Headphones className="w-3 h-3" />
                <span>إذاعة القاهرة مباشر</span>
              </button>
            </div>
          </div>

          {/* CAMERA VISION AI VIEW (عين البصيرة للمكفوفين - الكاميرا والتحكم الصوتي) */}
          {isCameraActive && (
            <div className="p-4 rounded-2xl bg-zinc-950/90 border border-emerald-500/40 space-y-3 shadow-2xl animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-emerald-400" />
                    <span>عين البصيرة نشطة • الكاميرا تبصر ما أمامك الآن</span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={toggleCameraFacing}
                    className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold flex items-center gap-1 transition"
                    title="تبديل الكاميرا (أمامية/خلفية)"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>{cameraFacing === "environment" ? "خلفية" : "أمامية"}</span>
                  </button>
                  <button
                    onClick={stopCamera}
                    className="p-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs transition"
                    title="إغلاق الكاميرا"
                  >
                    <CameraOff className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Video viewfinder */}
              <div className="relative rounded-xl overflow-hidden aspect-video bg-zinc-900 border border-white/10 flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />

                {isCameraLoading && (
                  <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-xs text-emerald-300 gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" />
                    <span>جارٍ فتح الكاميرا...</span>
                  </div>
                )}
              </div>

              {/* Camera Action Buttons for blind and voice assistance */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => captureAndDescribeScene(cameraVisionMode)}
                  disabled={isLoading}
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40 transition"
                >
                  <Eye className="w-4 h-4" />
                  <span>{isLoading ? "جاري الفحص..." : "قولي انت شايف ايه؟"}</span>
                </button>

                <button
                  onClick={() => {
                    const nextMode =
                      cameraVisionMode === "general_scene"
                        ? "prayer_rug"
                        : cameraVisionMode === "prayer_rug"
                        ? "mushaf_text"
                        : "general_scene";
                    setCameraVisionMode(nextMode);
                    const modeLabels = {
                      general_scene: "المشهد العام والأشياء المحيطة",
                      prayer_rug: "البحث عن سجادة الصلاة والقبلة",
                      mushaf_text: "قراءة ورقة أو نص المصحف",
                    };
                    speechEngine.speakEgyptian(`تم اختيار وضع: ${modeLabels[nextMode]}`);
                  }}
                  className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-zinc-200 font-bold text-xs flex items-center justify-center gap-2 border border-white/10 transition"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="truncate">
                    {cameraVisionMode === "prayer_rug"
                      ? "سجادة الصلاة"
                      : cameraVisionMode === "mushaf_text"
                      ? "قراءة ورقة"
                      : "المشهد العام"}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* ACTIVE SURAH AUDIO PLAYER WIDGET */}
          {activeSurah && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#059669]/20 via-[#059669]/5 to-transparent border border-[#059669]/40 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleSurahPlayback}
                    className="w-12 h-12 rounded-2xl bg-[#059669] hover:bg-[#047857] text-white flex items-center justify-center shadow-[0_0_20px_rgba(5,150,105,0.4)] transition"
                  >
                    {activeSurah.isPlaying ? (
                      <Pause className="w-5 h-5 fill-current" />
                    ) : (
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    )}
                  </button>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-base text-white">
                        سورة {activeSurah.nameAr}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                        {activeSurah.numberOfAyahs} آية
                      </span>
                      {activeSurah.descriptionSnippet && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#F3E7C4] border border-[#D4AF37]/40 font-bold">
                          {activeSurah.descriptionSnippet}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-emerald-300/80">
                      بصوت الشيخ مشاري بن راشد العفاسي
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenTab("quran")}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white border border-white/10 flex items-center gap-1.5 transition"
                >
                  <span>عرض المصحف</span>
                  <BookOpen className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Dynamic Recitation Progress Bar with Voice Navigation & Blind Accessibility */}
              <RecitationProgressBar
                currentTime={audioProgress}
                duration={audioDuration}
                isPlaying={activeSurah.isPlaying}
                surahName={activeSurah.nameAr}
                onSeek={(newTime) => {
                  if (audioRef.current) {
                    audioRef.current.currentTime = newTime;
                    setAudioProgress(newTime);
                  }
                }}
                onSeekDelta={(delta) => handleSeekDelta(delta)}
                onRestart={handleRestartAudio}
                onTogglePlay={toggleSurahPlayback}
              />
            </div>
          )}

          {/* PRAYER TIMES INTERACTIVE CARD */}
          {prayerTimesData && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-sm text-white">
                    مواقيت الصلاة لمدينة {prayerTimesData.cityName}
                  </span>
                </div>
                <button
                  onClick={() => handleOpenTab("prayers")}
                  className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
                >
                  <span>فتح الجدول الكامل</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
                {prayerTimesData.prayers.map((p) => {
                  const isNext = p.id === prayerTimesData.nextPrayer.id;
                  return (
                    <div
                      key={p.id}
                      className={`p-2 rounded-xl border text-xs transition ${
                        isNext
                          ? "bg-amber-500/25 border-amber-400 text-white font-bold shadow-sm"
                          : "bg-black/30 border-white/5 text-zinc-300"
                      }`}
                    >
                      <div className="text-[11px] opacity-80">{p.nameAr}</div>
                      <div className="text-sm font-mono font-bold mt-0.5">
                        {p.time}
                      </div>
                      {isNext && (
                        <div className="text-[9px] text-amber-300 font-bold mt-0.5">
                          القادمة
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* QIBLA COMPASS CARD */}
          {qiblaBearing !== null && (
            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/40">
                  <Compass className="w-5 h-5 animate-spin-slow" />
                </div>
                <div>
                  <div className="font-bold text-sm text-white">
                    اتجاه القبلة الشريفة: {qiblaBearing}°
                  </div>
                  <p className="text-xs text-zinc-400">
                    بزاوية مباشرة نحو الكعبة المشرفة في مكة المكرمة
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleOpenTab("qibla")}
                className="px-3 py-1.5 rounded-xl bg-indigo-500 text-white font-bold text-xs hover:bg-indigo-600 transition"
              >
                فتح البوصلة
              </button>
            </div>
          )}

          {/* ISLAMIC LIBRARY RESEARCH BADGE & SUMMARY */}
          {islamicLibraryResult && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-950/50 via-emerald-950/30 to-amber-950/30 border border-teal-500/40 space-y-2.5 shadow-lg animate-fadeIn">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center border border-teal-500/30">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-teal-300 block">
                      المكتبة الإسلامية والبحث الفوري المدمج
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      {islamicLibraryResult.category === "tafsir"
                        ? "📖 تفسير وبيان معاني الآيات الكريمة"
                        : islamicLibraryResult.category === "hadith"
                        ? "📜 الحديث النبوي الشريف وشروحه"
                        : "⚖️ المسائل الفقهية والأحكام الشرعية"}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  مرجع معتمد موثق
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-zinc-300 pt-1 border-t border-white/5">
                <span className="truncate max-w-[240px]">
                  السؤال: <strong className="text-white">{islamicLibraryResult.query}</strong>
                </span>
                {islamicLibraryResult.category === "fiqh" && (
                  <button
                    onClick={() => {
                      window.dispatchEvent(
                        new CustomEvent("noor-open-fatwa", {
                          detail: {
                            query: islamicLibraryResult.query,
                            source: islamicLibraryResult.source,
                          },
                        })
                      );
                      handleOpenTab("fatwa");
                    }}
                    className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-bold"
                  >
                    <span>فتح موسوعة الفتاوى</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
                {islamicLibraryResult.category === "hadith" && (
                  <button
                    onClick={() => {
                      window.dispatchEvent(
                        new CustomEvent("noor-navigate-tab", { detail: { tab: "hadith" } })
                      );
                      handleOpenTab("hadith");
                    }}
                    className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-bold"
                  >
                    <span>فتح نتائج البحث في المكتبة</span>
                    <ArrowRight className="w-3 h-3 rotate-180" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* HISN AL-MUSLIM DYNAMIC THIKR CARD */}
          {hisnResult && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-teal-950/40 to-black/60 border border-emerald-500/40 space-y-3 shadow-xl animate-fadeIn">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-500/30">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-emerald-300 block">
                      {hisnResult.chapterTitle}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      أذكار حصن المسلم الموثقة
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    التكرار: {hisnResult.repeat || 1}
                  </span>
                  <button
                    onClick={() => {
                      handleOpenTab("hisn_muslim");
                      window.dispatchEvent(
                        new CustomEvent("noor-open-hisn-chapter", {
                          detail: { chapterId: hisnResult.chapterId },
                        })
                      );
                    }}
                    className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <span>فتح الباب بالتطبيق</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Spoken Thikr Text */}
              <div className="p-3.5 rounded-xl bg-black/40 border border-emerald-500/25 text-right">
                <p className="text-sm font-semibold text-emerald-100 leading-relaxed font-alexandria">
                  «{hisnResult.thikrText}»
                </p>
                {hisnResult.virtue && (
                  <p className="text-xs text-amber-300/90 mt-2 font-medium">
                    ✨ فضل الذكر: {hisnResult.virtue}
                  </p>
                )}
                {hisnResult.reference && (
                  <p className="text-[10px] text-zinc-400 mt-1">
                    📖 المرجع: {hisnResult.reference}
                  </p>
                )}
              </div>

              {/* Audio Controls */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  onClick={() => {
                    if (isVoiceSpeaking) {
                      stopVoiceAudio();
                    } else {
                      speechEngine.speak(hisnResult.thikrText);
                      setIsVoiceSpeaking(true);
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600/40 hover:bg-emerald-600/60 text-emerald-200 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{isVoiceSpeaking ? "إيقاف الصوت" : "استماع للذكر بصوت فوري"}</span>
                </button>

                <button
                  onClick={() => {
                    handleOpenTab("hisn_muslim");
                    window.dispatchEvent(
                      new CustomEvent("noor-open-hisn-chapter", {
                        detail: { chapterId: hisnResult.chapterId },
                      })
                    );
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white border border-white/10 flex items-center gap-1.5 transition"
                >
                  <span>عرض حصن المسلم كاملاً</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* ATHKAR SMART NOTIFICATION CONTROL INTERACTIVE CARD */}
          {notificationControlResult && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-zinc-900/60 to-emerald-950/40 border border-amber-500/30 space-y-3 shadow-xl animate-fadeIn">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
                      notificationControlResult.settings.masterEnabled
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        : "bg-red-500/20 text-red-300 border-red-500/30"
                    }`}
                  >
                    {notificationControlResult.settings.masterEnabled ? (
                      <Bell className="w-4 h-4" />
                    ) : (
                      <BellOff className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-xs text-zinc-200 block">
                      إشعارات الأذكار الذكية
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      تحكم فوري عبر المساعد الصوتي
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                    notificationControlResult.settings.masterEnabled
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : "bg-red-500/20 text-red-300 border-red-500/30"
                  }`}
                >
                  {notificationControlResult.settings.masterEnabled ? "مفعّلة 🔔" : "متوقفة 🔕"}
                </span>
              </div>

              {/* Schedules Grid */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div
                  className={`p-2 rounded-xl border ${
                    notificationControlResult.settings.morningEnabled &&
                    notificationControlResult.settings.masterEnabled
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-200"
                      : "bg-black/20 border-white/5 text-zinc-500"
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 mx-auto mb-1 text-amber-400" />
                  <div className="font-bold text-[11px]">الصباح</div>
                  <div className="text-[10px] font-mono">
                    {notificationControlResult.settings.morningTime}
                  </div>
                </div>

                <div
                  className={`p-2 rounded-xl border ${
                    notificationControlResult.settings.eveningEnabled &&
                    notificationControlResult.settings.masterEnabled
                      ? "bg-teal-500/10 border-teal-500/30 text-teal-200"
                      : "bg-black/20 border-white/5 text-zinc-500"
                  }`}
                >
                  <Moon className="w-3.5 h-3.5 mx-auto mb-1 text-teal-400" />
                  <div className="font-bold text-[11px]">المساء</div>
                  <div className="text-[10px] font-mono">
                    {notificationControlResult.settings.eveningTime}
                  </div>
                </div>

                <div
                  className={`p-2 rounded-xl border ${
                    notificationControlResult.settings.sleepEnabled &&
                    notificationControlResult.settings.masterEnabled
                      ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-200"
                      : "bg-black/20 border-white/5 text-zinc-500"
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 mx-auto mb-1 text-indigo-400" />
                  <div className="font-bold text-[11px]">النوم</div>
                  <div className="text-[10px] font-mono">
                    {notificationControlResult.settings.sleepTime}
                  </div>
                </div>
              </div>

              {/* Action Buttons in card */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
                <button
                  onClick={() => {
                    const res = athkarNotificationService.toggle();
                    setNotificationControlResult((prev) =>
                      prev
                        ? {
                            ...prev,
                            settings: athkarNotificationService.getSettings(),
                          }
                        : null
                    );
                    soundEngine.playTasbihClick();
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                    notificationControlResult.settings.masterEnabled
                      ? "bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30"
                      : "bg-emerald-600/40 hover:bg-emerald-600/60 text-emerald-200 border border-emerald-500/30"
                  }`}
                >
                  {notificationControlResult.settings.masterEnabled ? (
                    <>
                      <BellOff className="w-3.5 h-3.5" />
                      <span>إيقاف التنبيهات</span>
                    </>
                  ) : (
                    <>
                      <Bell className="w-3.5 h-3.5" />
                      <span>تفعيل التنبيهات</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      athkarNotificationService.triggerTestAlert("morning");
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-zinc-200 border border-white/10 flex items-center gap-1 transition"
                  >
                    <span>تجربة تنبيه</span>
                  </button>

                  <button
                    onClick={() => {
                      handleOpenTab("hisn_muslim");
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-xs text-emerald-200 border border-emerald-500/30 flex items-center gap-1 transition"
                  >
                    <span>فتح الأذكار</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* RESPONSE MESSAGE BUBBLE WITH HUMAN VOICE CONTROLS */}
          {response && (
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3 text-justify">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    رفيق النور وجليسك (صوت رجل مصري ودود)
                  </span>
                  {isVoiceSpeaking && (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      <span>يتحدث الآن...</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {isVoiceSpeaking ? (
                    <button
                      onClick={stopVoiceAudio}
                      className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs flex items-center gap-1 transition"
                      title="إيقاف الصوت"
                    >
                      <Pause className="w-3 h-3" />
                      <span>إيقاف</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (currentVoiceAudioUrl) {
                          playVoiceAudio(currentVoiceAudioUrl);
                        } else {
                          speakEgyptianVoice(response);
                        }
                      }}
                      className="px-2.5 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs flex items-center gap-1 transition"
                      title="استماع للصوت البشري"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>استماع</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Sound Wave Animation if speaking */}
              {isVoiceSpeaking && (
                <div className="flex items-center justify-center gap-1 py-1.5 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="w-1 h-3 bg-emerald-400 rounded-full animate-bounce [animation-delay:0ms]" />
                  <div className="w-1 h-5 bg-emerald-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <div className="w-1 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:300ms]" />
                  <div className="w-1 h-6 bg-emerald-400 rounded-full animate-bounce [animation-delay:75ms]" />
                  <div className="w-1 h-4 bg-emerald-400 rounded-full animate-bounce [animation-delay:225ms]" />
                  <div className="w-1 h-3 bg-emerald-400 rounded-full animate-bounce [animation-delay:120ms]" />
                  <span className="text-[11px] text-emerald-300 font-sans mr-2">
                    نطق مصري وقور (صوت رجل) من Gemini 3.1 TTS
                  </span>
                </div>
              )}

              {/* Notice when audio command is queued to start after speech */}
              {pendingPostSpeechActionRef.current && isVoiceSpeaking && (
                <div className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl flex items-center gap-1.5 animate-pulse">
                  <Volume2 className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>
                    الرفيق يتحدث أولاً.. وستبدأ التلاوة المباركة فور انتهاء صوته. تحدث في أي وقت لإيقافها.
                  </span>
                </div>
              )}

              <p className="text-sm sm:text-base leading-relaxed text-zinc-100 font-['Cairo',sans-serif]">
                {response}
              </p>
            </div>
          )}

          {isLoading && (
            <div className="py-6 text-center space-y-2">
              <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mx-auto" />
              <p className="text-xs text-zinc-400 font-mono">
                جارٍ تنفيذ الأمر وتجهيز الإجابة...
              </p>
            </div>
          )}
        </div>

        {/* Query Input Bar */}
        <div className="p-3 sm:p-4 border-t border-white/5 bg-[#141A17] flex items-center gap-2">
          <input
            type="text"
            placeholder="اكتب أمرك هنا (مثل: شغل سورة الكهف، موعد صلاة المغرب)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                processQuery(query);
              }
            }}
            className="flex-1 bg-white/[0.05] border border-white/10 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
          />

          {/* Speak / Mic Toggle */}
          <button
            onClick={isListening ? stopVoiceListening : startVoiceListening}
            className={`p-2.5 rounded-2xl border transition ${
              isListening
                ? "bg-red-500/20 text-red-400 border-red-500/40 animate-pulse"
                : "bg-white/5 text-zinc-300 hover:text-white border-white/10"
            }`}
            title={isListening ? "إيقاف الاستماع" : "التحدث بصوتك"}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Send Button */}
          <button
            onClick={() => processQuery(query)}
            disabled={!query.trim() || isLoading}
            className="p-2.5 rounded-2xl bg-[#059669] hover:bg-[#047857] text-white disabled:opacity-40 disabled:pointer-events-none transition shadow-sm"
            title="إرسال"
          >
            <Send className="w-5 h-5 rtl:-rotate-90" />
          </button>
        </div>

        {/* Custom AI Settings Modal */}
        <CustomAISettingsModal
          isOpen={isCustomAiModalOpen}
          onClose={() => setIsCustomAiModalOpen(false)}
        />
      </div>
    </div>
  );
};
