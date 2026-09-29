import React, { useState, useRef, useEffect } from "react";
import {
  Tv,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Radio,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Compass,
} from "lucide-react";
import Hls from "hls.js";
import { ThemeMode } from "../../types";
import { getThemeStyles } from "../../utils/themeClasses";
import { soundEngine } from "../../utils/soundEngine";
import { LIVE_STREAMS_LIST, LiveStreamItem } from "../../data/liveStreamsData";

interface Props {
  theme?: ThemeMode;
}

export const QuranLiveTvCard: React.FC<Props> = ({ theme = "natural" }) => {
  const styles = getThemeStyles(theme);
  const { isNatural, isPaper, isNight, isLight } = styles;

  // Default to Makkah Quran TV (first item) or Madinah Sunnah TV
  const [selectedChannel, setSelectedChannel] = useState<"makkah" | "madinah">("makkah");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [useIframeFallback, setUseIframeFallback] = useState<boolean>(false);
  const [isAudioOnlyMode, setIsAudioOnlyMode] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const makkahItem = LIVE_STREAMS_LIST.find((s) => s.id === "tv-makkah") || LIVE_STREAMS_LIST[0];
  const madinahItem = LIVE_STREAMS_LIST.find((s) => s.id === "tv-madinah") || LIVE_STREAMS_LIST[1];
  const currentStream: LiveStreamItem = selectedChannel === "makkah" ? makkahItem : madinahItem;

  // Verified YouTube Live Embed URL
  const youtubeEmbedUrl =
    selectedChannel === "makkah"
      ? "https://www.youtube-nocookie.com/embed/live_stream?channel=UCos52azQNBgW63_9uDJoPDA&autoplay=1&mute=1"
      : "https://www.youtube-nocookie.com/embed/live_stream?channel=UC_x5XG1OV2P6uZZ5FSM9Ttw&autoplay=1&mute=1";

  // Initialize HLS video player
  useEffect(() => {
    const video = videoRef.current;
    if (!video || useIframeFallback || isAudioOnlyMode) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const streamUrl = currentStream.hlsUrl || currentStream.streamUrl;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60,
      });
      hlsRef.current = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (isPlaying) {
          video.play().catch(() => {});
        }
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          console.warn("HLS playback failed, falling back to YouTube live embed:", data);
          setUseIframeFallback(true);
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      video.addEventListener("error", () => {
        setUseIframeFallback(true);
      });
      if (isPlaying) {
        video.play().catch(() => {});
      }
    } else {
      setUseIframeFallback(true);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [selectedChannel, useIframeFallback, isAudioOnlyMode]);

  const handleTogglePlay = () => {
    soundEngine.playTasbihClick();
    if (isAudioOnlyMode) {
      if (audioRef.current) {
        if (isPlaying) {
          audioRef.current.pause();
          setIsPlaying(false);
        } else {
          audioRef.current.play().catch(() => {});
          setIsPlaying(true);
        }
      }
      return;
    }

    if (useIframeFallback) {
      setIsPlaying(!isPlaying);
      return;
    }

    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {
          setUseIframeFallback(true);
          setIsPlaying(true);
        });
      }
    }
  };

  const handleToggleMute = () => {
    soundEngine.playTasbihClick();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleFullscreen = () => {
    soundEngine.playTasbihClick();
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      } else {
        containerRef.current.requestFullscreen().catch(() => {});
      }
    }
  };

  return (
    <div
      id="quran-live-tv-section"
      ref={containerRef}
      className={`rounded-2xl sm:rounded-3xl p-4 sm:p-5 border transition-all flex flex-col justify-between ${
        isNatural
          ? "bg-[#091F17]/95 border-emerald-500/35 text-white shadow-[0_8px_30px_rgba(0,0,0,0.4)]"
          : isPaper
          ? "bg-[#FFFDF9] border-[#D6C5A9] text-[#2F1E12] shadow-[0_8px_30px_rgba(140,94,36,0.08)]"
          : isNight
          ? "bg-[#0C1527]/95 border-slate-700/80 text-white shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
          : "bg-white border-emerald-200 text-slate-900 shadow-[0_8px_30px_rgba(212,175,55,0.12)]"
      }`}
    >
      {/* Hidden Audio for audio-only mode */}
      <audio
        ref={audioRef}
        src="https://backup.qurango.net/radio/tarteel"
        preload="none"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Header Bar: Title, Live Pulsing Indicator & Channel Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-emerald-500/15">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-rose-600 to-red-700 text-white flex items-center justify-center shadow-md shrink-0">
            <Tv className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-black font-alexandria text-slate-900 dark:text-white">
                {selectedChannel === "makkah" ? "قناة القرآن الكريم" : "قناة السنة النبوية"}
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                بث حي مباشر 24/7
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {selectedChannel === "makkah"
                ? "بث مباشر رسمي من المسجد الحرام والكعبة المشرفة بمكة المكرمة"
                : "بث مباشر رسمي من المسجد النبوي الشريف بالمدينة المنورة"}
            </p>
          </div>
        </div>

        {/* Channel Selection Toggle */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
          <button
            onClick={() => {
              soundEngine.playTasbihClick();
              setSelectedChannel("makkah");
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              selectedChannel === "makkah"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            مكة المكرمة
          </button>
          <button
            onClick={() => {
              soundEngine.playTasbihClick();
              setSelectedChannel("madinah");
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              selectedChannel === "madinah"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            المدينة المنورة
          </button>
        </div>
      </div>

      {/* Live Video Player Screen */}
      <div className="my-3 relative rounded-2xl overflow-hidden bg-black aspect-video border border-black/20 shadow-inner group flex items-center justify-center">
        {/* If using YouTube live iframe embed */}
        {useIframeFallback && !isAudioOnlyMode ? (
          <iframe
            src={youtubeEmbedUrl}
            title={currentStream.nameAr}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : isAudioOnlyMode ? (
          /* Audio-only tranquil visualization */
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-emerald-950 via-[#061A13] to-slate-950 p-6 text-center text-white relative">
            <div className="w-16 h-16 rounded-full bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center mb-3 animate-pulse">
              <Radio className="w-8 h-8 text-emerald-400" />
            </div>
            <p className="font-bold text-sm text-emerald-300">وضع الاستماع الصوتي المباشر</p>
            <p className="text-xs text-emerald-400/80 mt-1">تلاوة خاشعة مستمرة من رحاب المسجد الحرام</p>
          </div>
        ) : (
          /* Native / HLS HTML5 Video Stream */
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted={isMuted}
              poster="https://images.unsplash.com/photo-1542816417-0983c9c9ad53?q=80&w=800&auto=format&fit=crop"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />

            {/* Play Overlay if paused */}
            {!isPlaying && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex flex-col items-center justify-center text-white z-10 transition-opacity">
                <button
                  onClick={handleTogglePlay}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-2xl transition-transform active:scale-90 hover:scale-105 cursor-pointer mb-2"
                  title="بدء تشغيل البث المباشر"
                  aria-label="تشغيل البث"
                >
                  <Play className="w-7 h-7 fill-white translate-x-0.5" />
                </button>
                <span className="text-xs sm:text-sm font-bold tracking-wide text-white drop-shadow">
                  اضغط لبدء المشاهدة الحية المباشرة
                </span>
              </div>
            )}
          </>
        )}

        {/* Live Top Floating Tag inside video */}
        <div className="absolute top-2.5 right-2.5 z-20 pointer-events-none flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span>مكة المكرمة • مباشر</span>
        </div>
      </div>

      {/* Footer Controls & Quick Links */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-emerald-500/15">
        
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleTogglePlay}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 active:scale-95 cursor-pointer min-h-[40px] ${
              isPlaying
                ? "bg-rose-600 hover:bg-rose-700 text-white"
                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-white" />
                <span>إيقاف مؤقت</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>مشاهدة البث</span>
              </>
            )}
          </button>

          {!useIframeFallback && (
            <button
              onClick={handleToggleMute}
              className="p-2.5 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition text-slate-700 dark:text-slate-200 cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
              title={isMuted ? "تشغيل الصوت" : "كتم الصوت"}
              aria-label="التحكم بالصوت"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-amber-500" /> : <Volume2 className="w-4 h-4 text-emerald-500" />}
            </button>
          )}

          <button
            onClick={handleFullscreen}
            className="p-2.5 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition text-slate-700 dark:text-slate-200 cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
            title="تكبير الشاشة ملء العرض"
            aria-label="ملء الشاشة"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Secondary Stream Actions */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => {
              soundEngine.playTasbihClick();
              setUseIframeFallback(!useIframeFallback);
            }}
            className="text-[11px] font-bold text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 cursor-pointer"
            title="التبديل بين المشغل السحابي ومصدر البث البديل"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{useIframeFallback ? "المشغل الداخلي" : "مصدر يوتيوب"}</span>
          </button>

          <a
            href="https://www.youtube.com/@SaudiQuranTv/live"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-bold text-[#D4AF37] hover:underline flex items-center gap-1 cursor-pointer"
            title="فتح البث المباشر في يوتيوب في نافذة مستقلة"
          >
            <span>البث الرسمي</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

      </div>
    </div>
  );
};
