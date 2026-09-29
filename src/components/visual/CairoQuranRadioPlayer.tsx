import React, { useState, useRef, useEffect } from "react";
import {
  Radio,
  Play,
  Pause,
  Volume2,
  VolumeX,
  RadioTower,
  RotateCw,
  Sparkles,
  Signal,
  CheckCircle2,
  Headphones,
} from "lucide-react";
import { ThemeMode } from "../../types";
import { getThemeStyles } from "../../utils/themeClasses";
import { soundEngine } from "../../utils/soundEngine";
import { speechEngine } from "../../utils/speechEngine";
import { audioCoordinator } from "../../services/mp3QuranService";

interface Props {
  theme?: ThemeMode;
  variant?: "full" | "compact" | "banner";
  className?: string;
}

const CAIRO_RADIO_STREAM_URL = "https://quran.yousefheiba.com/api/radio";

export const CairoQuranRadioPlayer: React.FC<Props> = ({
  theme = "natural",
  variant = "full",
  className = "",
}) => {
  const styles = getThemeStyles(theme);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.9);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [streamStatus, setStreamStatus] = useState<"idle" | "connecting" | "live" | "error">("idle");
  const [listenersEst, setListenersEst] = useState<number>(14250);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync with global audio pause event
  useEffect(() => {
    const handlePauseAll = (e: any) => {
      if (e?.detail?.sender !== "cairo-radio" && audioRef.current && isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        setStreamStatus("idle");
      }
    };
    window.addEventListener("noor-pause-all-audio", handlePauseAll);
    return () => window.removeEventListener("noor-pause-all-audio", handlePauseAll);
  }, [isPlaying]);

  const togglePlay = async () => {
    soundEngine.playTasbihClick();
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      setStreamStatus("idle");
      speechEngine.speakNavFeedback("تم إيقاف إذاعة القرآن الكريم من القاهرة مؤقتاً.");
    } else {
      setIsLoading(true);
      setStreamStatus("connecting");
      speechEngine.speakNavFeedback("جاري تشغيل البث المباشر لإذاعة القرآن الكريم من القاهرة.");

      try {
        audioCoordinator.startPlayback("cairo-radio", audioRef.current);
        // Force timestamp to break cache if reconnecting
        audioRef.current.src = `${CAIRO_RADIO_STREAM_URL}?t=${Date.now()}`;
        audioRef.current.volume = isMuted ? 0 : volume;
        await audioRef.current.play();
        setIsPlaying(true);
        setIsLoading(false);
        setStreamStatus("live");
      } catch (err) {
        console.error("Failed to start Cairo Radio stream:", err);
        setIsPlaying(false);
        setIsLoading(false);
        setStreamStatus("error");
      }
    }
  };

  const toggleMute = () => {
    soundEngine.playTasbihClick();
    if (!audioRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioRef.current.muted = nextMuted;
    if (nextMuted) {
      audioRef.current.volume = 0;
    } else {
      audioRef.current.volume = volume;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
      if (newVol > 0 && isMuted) {
        setIsMuted(false);
        audioRef.current.muted = false;
      }
    }
  };

  const handleReconnect = () => {
    soundEngine.playTasbihClick();
    if (!audioRef.current) return;
    setIsLoading(true);
    setStreamStatus("connecting");
    audioRef.current.src = `${CAIRO_RADIO_STREAM_URL}?reload=${Date.now()}`;
    audioRef.current
      .play()
      .then(() => {
        setIsPlaying(true);
        setIsLoading(false);
        setStreamStatus("live");
      })
      .catch(() => {
        setIsPlaying(false);
        setIsLoading(false);
        setStreamStatus("error");
      });
  };

  if (variant === "compact") {
    return (
      <div
        id="cairo-radio-compact"
        className={`p-3 sm:p-4 rounded-2xl sm:rounded-3xl border flex items-center justify-between gap-3 shadow-md transition-all ${
          styles.cardBg
        } ${styles.cardBorder} ${className}`}
      >
        <audio
          ref={audioRef}
          preload="none"
          onEnded={() => {
            setIsPlaying(false);
            setStreamStatus("idle");
          }}
          onError={() => {
            setIsPlaying(false);
            setIsLoading(false);
            setStreamStatus("error");
          }}
        />

        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-600 flex items-center justify-center text-white shrink-0 shadow-md">
            <RadioTower className={`w-5 h-5 ${isPlaying ? "animate-pulse" : ""}`} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                بث مباشر 24/7
              </span>
            </div>
            <h4 className={`text-xs sm:text-sm font-bold truncate font-alexandria ${styles.titleText}`}>
              إذاعة القرآن الكريم من القاهرة
            </h4>
          </div>
        </div>

        <button
          onClick={togglePlay}
          disabled={isLoading}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md transition active:scale-95 shrink-0 ${
            isPlaying
              ? "bg-rose-600 hover:bg-rose-700"
              : "bg-emerald-600 hover:bg-emerald-700"
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5" />
              <span>إيقاف</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isLoading ? "جاري الاتصال..." : "استماع"}</span>
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div
      id="cairo-radio-player-dedicated"
      className={`rounded-3xl p-5 sm:p-6 border shadow-xl relative overflow-hidden transition-all duration-300 ${
        styles.cardBg
      } ${styles.cardBorder} ${className}`}
    >
      <audio
        ref={audioRef}
        preload="none"
        onEnded={() => {
          setIsPlaying(false);
          setStreamStatus("idle");
        }}
        onError={() => {
          setIsPlaying(false);
          setIsLoading(false);
          setStreamStatus("error");
        }}
      />

      {/* Decorative Golden Accent Glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-[#D4AF37]/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
        {/* Left Side: Station Identity & Live Status */}
        <div className="flex items-start sm:items-center gap-4">
          <div className="relative shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-[#D4AF37] via-emerald-600 to-teal-800 flex items-center justify-center text-white shadow-lg p-0.5">
              <div className="w-full h-full rounded-[22px] bg-black/20 backdrop-blur-xs flex flex-col items-center justify-center text-center p-2">
                <Radio className={`w-7 h-7 sm:w-8 sm:h-8 ${isPlaying ? "animate-bounce" : ""}`} />
                <span className="text-[9px] font-bold font-mono tracking-wider mt-0.5 text-amber-200">
                  CAIRO
                </span>
              </div>
            </div>
            {isPlaying && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white dark:border-black"></span>
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                بث حي ومباشر
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/10 text-slate-500 dark:text-slate-300">
                FM 93.7 MHz
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold">
                أعرق إذاعة إسلامية 1964م
              </span>
            </div>

            <h3 className={`text-lg sm:text-xl md:text-2xl font-black font-alexandria tracking-tight ${styles.titleText}`}>
              إذاعة القرآن الكريم من القاهرة
            </h3>

            <p className={`text-xs sm:text-sm line-clamp-2 max-w-xl leading-relaxed ${styles.mutedText}`}>
              البث المباشر الرسمي لإذاعة القرآن الكريم من القاهرة، تلاوات نادرة لأعلام القراء وبرامج الفتاوى والتفسير على مدار 24 ساعة دون انقطاع.
            </p>
          </div>
        </div>

        {/* Right Side: Player Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          {/* Volume Control */}
          <div className={`flex items-center gap-2 p-2 rounded-2xl border ${styles.innerBg} ${styles.innerBorder}`}>
            <button
              onClick={toggleMute}
              className={`p-2 rounded-xl transition ${
                isMuted ? "text-rose-500 bg-rose-500/10" : `${styles.mutedText} hover:${styles.bodyText}`
              }`}
              title={isMuted ? "تشغيل الصوت" : "كتم الصوت"}
              aria-label={isMuted ? "تشغيل الصوت" : "كتم الصوت"}
            >
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-20 sm:w-24 accent-emerald-500 cursor-pointer h-1.5 rounded-lg bg-black/10 dark:bg-white/10"
              title={`مستوى الصوت: ${Math.round(volume * 100)}%`}
              aria-label="مستوى الصوت"
            />
            <span className={`text-[10px] font-mono w-7 text-center ${styles.mutedText}`}>
              {isMuted ? "0%" : `${Math.round(volume * 100)}%`}
            </span>
          </div>

          {/* Reconnect button */}
          <button
            onClick={handleReconnect}
            className={`p-3 rounded-2xl border transition hover:rotate-180 duration-500 ${styles.innerBg} ${styles.innerBorder} ${styles.mutedText} hover:${styles.bodyText}`}
            title="تحديث وإعادة الاتصال بالبث"
            aria-label="تحديث وإعادة الاتصال بالبث"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* Main Big Play/Pause Button */}
          <button
            onClick={togglePlay}
            disabled={isLoading}
            className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm text-white shadow-lg active:scale-95 transition-all duration-200 ${
              isPlaying
                ? "bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-700 hover:to-red-800 ring-2 ring-rose-500/30"
                : "bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 shadow-emerald-900/20"
            }`}
          >
            {isLoading ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>جاري الاتصال...</span>
              </>
            ) : isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>إيقاف البث</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>استماع مباشر الآن</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Visualizer Waves & Radio Metadata Footer */}
      <div className={`mt-5 pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 ${styles.innerBorder}`}>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
            <Signal className="w-3.5 h-3.5" />
            {streamStatus === "live" ? "متصل بالخادم الرسمي" : streamStatus === "connecting" ? "جاري المزامنة..." : "جاهز للبث"}
          </span>
          <span className="text-slate-400 dark:text-slate-600">•</span>
          <span className={`text-[11px] font-mono ${styles.mutedText}`}>
            MP3 128kbps Stereo High Quality
          </span>
        </div>

        {/* Dynamic Animated Visualizer Bars */}
        {isPlaying ? (
          <div className="flex items-center gap-1 h-5 px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
            {[35, 70, 95, 50, 85, 45, 100, 60, 90, 40, 75, 55, 80, 65].map((h, i) => (
              <div
                key={i}
                className="w-1 bg-gradient-to-t from-emerald-500 to-teal-400 rounded-full animate-pulse"
                style={{
                  height: `${h}%`,
                  animationDelay: `${i * 65}ms`,
                  animationDuration: "600ms",
                }}
              />
            ))}
          </div>
        ) : (
          <div className={`text-[11px] font-mono flex items-center gap-1 ${styles.mutedText}`}>
            <Headphones className="w-3.5 h-3.5 text-amber-500" />
            <span>بث رسمي عبر شبكة إذاعة القرآن الكريم</span>
          </div>
        )}
      </div>
    </div>
  );
};
