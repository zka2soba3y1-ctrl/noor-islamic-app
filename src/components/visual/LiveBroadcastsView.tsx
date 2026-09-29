import React, { useState, useRef, useEffect } from "react";
import {
  Tv,
  Radio,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Sparkles,
  ExternalLink,
  Info,
  Maximize2,
  RadioTower,
  CheckCircle2,
} from "lucide-react";
import Hls from "hls.js";
import { LIVE_STREAMS_LIST, LiveStreamItem } from "../../data/liveStreamsData";
import { soundEngine } from "../../utils/soundEngine";
import { ThemeMode } from "../../types";
import { getThemeStyles } from "../../utils/themeClasses";
import { audioCoordinator } from "../../services/mp3QuranService";
import { CairoQuranRadioPlayer } from "./CairoQuranRadioPlayer";
import { speechEngine } from "../../utils/speechEngine";

interface Props {
  theme?: ThemeMode;
}

export const LiveBroadcastsView: React.FC<Props> = ({ theme = "natural" }) => {
  const styles = getThemeStyles(theme);
  const { isPaper, isNight, isLight } = styles;

  const [activeTab, setActiveTab] = useState<"cairo" | "tv" | "radio">("cairo");
  const [selectedTvStream, setSelectedTvStream] = useState<LiveStreamItem>(
    LIVE_STREAMS_LIST[0] // Makkah Live
  );
  const [selectedStation, setSelectedStation] = useState<LiveStreamItem>(
    LIVE_STREAMS_LIST[2] // Cairo Radio
  );
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [videoError, setVideoError] = useState<boolean>(false);

  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const videoPlayerRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Listen to global audio pause event to avoid collisions
  useEffect(() => {
    const handlePauseAll = (e: any) => {
      if (e?.detail?.sender !== "radio" && audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        setIsPlayingAudio(false);
      }
    };
    window.addEventListener("noor-pause-all-audio", handlePauseAll);
    return () => window.removeEventListener("noor-pause-all-audio", handlePauseAll);
  }, []);

  const tvStreams = LIVE_STREAMS_LIST.filter((s) => !s.isAudioOnly);
  const radioStations = LIVE_STREAMS_LIST.filter((s) => s.isAudioOnly);

  // Setup HLS for Video
  useEffect(() => {
    if (activeTab !== "tv") return;
    const video = videoPlayerRef.current;
    if (!video) return;

    setVideoError(false);

    // Destroy existing Hls instance if any
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const streamUrl = selectedTvStream.hlsUrl || selectedTvStream.streamUrl;

    if (Hls.isSupported() && streamUrl.endsWith(".m3u8")) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hlsRef.current = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          console.warn("HLS fatal error, trying recover or fallback:", data);
          setVideoError(true);
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Native Safari HLS
      video.src = streamUrl;
      video.addEventListener("loadedmetadata", () => {
        video.play().catch(() => {});
      });
      video.addEventListener("error", () => {
        setVideoError(true);
      });
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [selectedTvStream, activeTab]);

  const handleSelectTv = (stream: LiveStreamItem) => {
    soundEngine.playTasbihClick();
    setSelectedTvStream(stream);
  };

  const handleSelectStation = (station: LiveStreamItem) => {
    soundEngine.playTasbihClick();
    setSelectedStation(station);
    setIsPlayingAudio(true);
    if (audioPlayerRef.current) {
      audioCoordinator.startPlayback("radio", audioPlayerRef.current);
      audioPlayerRef.current.src = station.streamUrl;
      audioPlayerRef.current.play().catch(() => {});
    }
  };

  const toggleAudio = () => {
    if (!audioPlayerRef.current) return;
    if (isPlayingAudio) {
      audioPlayerRef.current.pause();
      setIsPlayingAudio(false);
      audioCoordinator.stopPlayback("radio");
    } else {
      audioCoordinator.startPlayback("radio", audioPlayerRef.current);
      audioPlayerRef.current.src = selectedStation.streamUrl;
      audioPlayerRef.current.play().catch(() => {});
      setIsPlayingAudio(true);
    }
  };

  const toggleMute = () => {
    if (!audioPlayerRef.current) return;
    audioPlayerRef.current.muted = !isAudioMuted;
    setIsAudioMuted(!isAudioMuted);
  };

  const handleFullscreen = () => {
    if (videoPlayerRef.current) {
      if (videoPlayerRef.current.requestFullscreen) {
        videoPlayerRef.current.requestFullscreen();
      }
    }
  };

  return (
    <div id="live-broadcasts-view" className="space-y-4 sm:space-y-6 animate-fadeIn">
      {/* Hidden Audio Player for Radio */}
      <audio
        ref={audioPlayerRef}
        onPlay={() => setIsPlayingAudio(true)}
        onPause={() => setIsPlayingAudio(false)}
        onError={() => setIsPlayingAudio(false)}
      />

      {/* Header Banner */}
      <div className={`rounded-2xl sm:rounded-3xl p-4 sm:p-6 border transition-all ${styles.cardBg} ${styles.cardBorder} ${styles.cardShadow}`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 border ${styles.badgeBg} ${styles.badgeBorder} ${styles.accentText}`}>
              <Tv className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <span className={`text-[10px] uppercase tracking-wider font-mono font-bold block ${styles.accentText}`}>
                البث المباشر المعتمد • على مدار 24 ساعة
              </span>
              <h2 className={`text-base sm:text-xl font-bold font-alexandria ${styles.titleText}`}>
                البث المباشر لقنوات الحرمين وإذاعات القرآن
              </h2>
              <p className={`text-xs max-w-xl line-clamp-1 sm:line-clamp-none ${styles.mutedText}`}>
                مشاهدة البث المباشر لقناة القرآن الكريم (مكة) والسنة النبوية (المدينة)، وإذاعة القرآن الكريم من القاهرة و15+ إذاعة تلاوات.
              </p>
            </div>
          </div>

          {/* Sub Tab Switcher */}
          <div className={`flex items-center gap-1 p-1 rounded-2xl border self-stretch md:self-auto ${styles.innerBg} ${styles.innerBorder}`}>
            <button
              onClick={() => {
                soundEngine.playTasbihClick();
                setActiveTab("cairo");
                speechEngine.speakNavFeedback("تم فتح مشغل إذاعة القرآن الكريم من القاهرة مباشر");
              }}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === "cairo" ? styles.btnPrimary : styles.btnSecondary
              }`}
            >
              <RadioTower className="w-3.5 h-3.5" />
              <span>إذاعة القاهرة مباشر</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playTasbihClick();
                setActiveTab("tv");
                speechEngine.speakNavFeedback("تم فتح قنوات الحرمين الشريفين مباشر");
              }}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === "tv" ? styles.btnPrimary : styles.btnSecondary
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>قنوات الحرمين TV</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playTasbihClick();
                setActiveTab("radio");
                speechEngine.speakNavFeedback("تم فتح مكتبة إذاعات القرآن الكريم");
              }}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === "radio" ? styles.btnPrimary : styles.btnSecondary
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>محطات القرآن ({radioStations.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 0: DEDICATED CAIRO RADIO PLAYER */}
      {activeTab === "cairo" && (
        <div className="space-y-4">
          <CairoQuranRadioPlayer theme={theme} variant="full" />
        </div>
      )}

      {/* VIEW 1: HARAMAIN TV LIVE */}
      {activeTab === "tv" && (
        <div className="space-y-4">
          {/* Main Video Stream Container */}
          <div className={`rounded-3xl border overflow-hidden shadow-xl relative ${styles.cardBg} ${styles.cardBorder}`}>
            {/* Top Stream Bar */}
            <div className={`px-4 py-3 border-b flex items-center justify-between ${styles.innerBorder} ${
              styles.isNatural ? "bg-[#061A14]" : styles.isPaper ? "bg-[#F7EFE1]" : styles.isNight ? "bg-black/60" : "bg-slate-50"
            }`}>
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span className="text-xs font-bold text-red-500 font-mono">LIVE مباشر</span>
                <span className={`text-xs font-bold font-alexandria truncate ${styles.titleText}`}>
                  {selectedTvStream.nameAr}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleFullscreen}
                  className={`p-1.5 rounded-xl border text-xs transition ${styles.btnSecondary}`}
                  title="ملء الشاشة"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Video Player */}
            <div className="relative aspect-video w-full bg-black flex items-center justify-center">
              {!videoError ? (
                <video
                  ref={videoPlayerRef}
                  controls
                  playsInline
                  autoPlay
                  className="w-full h-full object-contain"
                />
              ) : selectedTvStream.embedUrl ? (
                <iframe
                  src={selectedTvStream.embedUrl}
                  title={selectedTvStream.nameAr}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="text-center p-6 text-white space-y-2">
                  <p className="text-sm">جاري محاولة الاتصال بالبث المباشر...</p>
                  <button
                    onClick={() => setVideoError(false)}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 text-xs font-bold"
                  >
                    إعادة المحاولة
                  </button>
                </div>
              )}
            </div>

            {/* Channel Selection Buttons */}
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tvStreams.map((stream) => {
                const isSelected = selectedTvStream.id === stream.id;
                return (
                  <button
                    key={stream.id}
                    onClick={() => handleSelectTv(stream)}
                    className={`p-3.5 rounded-2xl border text-right transition-all duration-200 flex items-center justify-between gap-3 ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-500/10 shadow-sm"
                        : `${styles.innerBg} ${styles.innerBorder} hover:border-emerald-500/40`
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? "bg-emerald-600 text-white" : "bg-emerald-500/10 text-emerald-600"
                      }`}>
                        <Tv className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className={`text-xs sm:text-sm font-bold font-alexandria ${styles.titleText}`}>
                          {stream.nameAr}
                        </h4>
                        <span className={`text-[10px] block mt-0.5 ${styles.mutedText}`}>
                          بث رسمي فائق الدقة 24/7
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                        يعرض الآن
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: QURAN RADIO STATIONS */}
      {activeTab === "radio" && (
        <div className="space-y-4">
          {/* Active Radio Station Player Bar */}
          <div className={`rounded-3xl p-4 sm:p-6 border shadow-lg space-y-4 ${styles.cardBg} ${styles.cardBorder}`}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#D4AF37] to-emerald-600 flex items-center justify-center text-white shadow-md shrink-0">
                  <RadioTower className={`w-7 h-7 ${isPlayingAudio ? "animate-bounce" : ""}`} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      بث صوتي مباشر
                    </span>
                  </div>
                  <h3 className={`text-base sm:text-lg font-bold font-alexandria truncate ${styles.titleText}`}>
                    {selectedStation.nameAr}
                  </h3>
                  <p className={`text-xs line-clamp-1 ${styles.mutedText}`}>
                    {selectedStation.descriptionAr}
                  </p>
                </div>
              </div>

              {/* Player Controls */}
              <div className="flex items-center gap-2 self-stretch sm:self-auto justify-center">
                <button
                  onClick={toggleMute}
                  className={`p-2.5 rounded-2xl border transition ${styles.btnSecondary}`}
                  title={isAudioMuted ? "إلغاء الكتم" : "كتم الصوت"}
                >
                  {isAudioMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                </button>

                <button
                  onClick={toggleAudio}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs shadow-md active:scale-95 transition"
                >
                  {isPlayingAudio ? (
                    <>
                      <Pause className="w-4 h-4" />
                      <span>إيقاف مؤقت</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>تشغيل الإذاعة</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Visualizer Waves */}
            {isPlayingAudio && (
              <div className="flex items-center justify-center gap-1 h-6">
                {[40, 75, 100, 50, 90, 60, 80, 30, 95, 70, 45, 85].map((h, i) => (
                  <div
                    key={i}
                    className="w-1 bg-emerald-500 rounded-full animate-pulse"
                    style={{
                      height: `${h}%`,
                      animationDelay: `${i * 80}ms`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Radio Stations Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {radioStations.map((station) => {
              const isSelected = selectedStation.id === station.id;
              const isCurrentPlaying = isSelected && isPlayingAudio;

              return (
                <div
                  key={station.id}
                  onClick={() => handleSelectStation(station)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between gap-3 ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-500/10 shadow-sm"
                      : `${styles.cardBg} ${styles.cardBorder} hover:border-emerald-500/40`
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-xs sm:text-sm font-bold font-alexandria truncate ${styles.titleText}`}>
                        {station.nameAr}
                      </h4>
                      {isCurrentPlaying && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      )}
                    </div>
                    <p className={`text-[11px] line-clamp-2 leading-relaxed ${styles.mutedText}`}>
                      {station.descriptionAr}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-slate-800/60">
                    <span className={`text-[10px] font-mono ${styles.mutedText}`}>
                      MP3 High Quality
                    </span>
                    <button
                      className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-xl transition ${
                        isCurrentPlaying
                          ? "bg-emerald-500 text-white"
                          : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {isCurrentPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
                      <span>{isCurrentPlaying ? "يعمل" : "استماع"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
