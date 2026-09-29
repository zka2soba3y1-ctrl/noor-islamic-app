import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  GraduationCap,
  Sparkles,
  Clock,
  User,
  BookOpen,
  CheckCircle2,
  Volume2,
  ListFilter,
  VolumeX,
} from "lucide-react";
import { ISLAMIC_LECTURES, LectureItem } from "../../data/lecturesData";
import { soundEngine } from "../../utils/soundEngine";
import { speechEngine } from "../../utils/speechEngine";
import { ThemeMode } from "../../types";
import { getThemeStyles } from "../../utils/themeClasses";
import { audioCoordinator } from "../../services/mp3QuranService";

interface Props {
  isBlindMode?: boolean;
  theme?: ThemeMode;
}

export const LecturesComprehensiveView: React.FC<Props> = ({ isBlindMode = false, theme = "natural" }) => {
  const styles = getThemeStyles(theme);
  const { isPaper, isNight, isLight } = styles;

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeLecture, setActiveLecture] = useState<LectureItem>(ISLAMIC_LECTURES[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackProgress, setPlaybackProgress] = useState<number>(0);
  const [currentTimeFormatted, setCurrentTimeFormatted] = useState<string>("00:00");
  const [audioDurationFormatted, setAudioDurationFormatted] = useState<string>("00:00");

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Listen to global audio coordinator so different media never collide
  useEffect(() => {
    const handlePauseOthers = (e: Event) => {
      const customEvent = e as CustomEvent<{ sender: string }>;
      if (customEvent.detail?.sender !== "lecture") {
        if (audioRef.current && !audioRef.current.paused) {
          audioRef.current.pause();
          setIsPlaying(false);
        }
      }
    };

    window.addEventListener("noor-pause-all-audio", handlePauseOthers);
    return () => {
      window.removeEventListener("noor-pause-all-audio", handlePauseOthers);
    };
  }, []);

  const handleToggleLecture = (lec: LectureItem) => {
    soundEngine.playTasbihClick();

    if (activeLecture.id === lec.id && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      audioCoordinator.stopPlayback("lecture");
    } else {
      if (audioRef.current) {
        audioCoordinator.startPlayback("lecture", audioRef.current);
      } else {
        audioCoordinator.stopPlayback();
      }

      setActiveLecture(lec);
      setIsPlaying(true);

      if (audioRef.current) {
        audioRef.current.src = lec.audioUrl;
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }

      // ONLY speak TTS notification if the app is currently in Blind/Sensory mode
      if (isBlindMode) {
        speechEngine.speak(`تشغيل درس: ${lec.title} لفضيلة ${lec.scholar}`);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration || 1;
      setPlaybackProgress((current / duration) * 100);

      const mins = Math.floor(current / 60);
      const secs = Math.floor(current % 60);
      setCurrentTimeFormatted(`${mins}:${secs < 10 ? "0" : ""}${secs}`);

      if (audioRef.current.duration) {
        const dMins = Math.floor(audioRef.current.duration / 60);
        const dSecs = Math.floor(audioRef.current.duration % 60);
        setAudioDurationFormatted(`${dMins}:${dSecs < 10 ? "0" : ""}${dSecs}`);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (audioRef.current && audioRef.current.duration) {
      audioRef.current.currentTime = (value / 100) * audioRef.current.duration;
      setPlaybackProgress(value);
    }
  };

  const filteredLectures =
    selectedCategory === "all"
      ? ISLAMIC_LECTURES
      : ISLAMIC_LECTURES.filter((l) => l.category === selectedCategory);

  const categories = [
    { id: "all", nameAr: "جميع الأبواب" },
    { id: "fiqh", nameAr: "فقه الصلاة والعبادات" },
    { id: "seerah", nameAr: "السيرة النبوية" },
    { id: "tafsir", nameAr: "التفسير والتدبر" },
    { id: "stories", nameAr: "قصص الأنبياء" },
    { id: "tazkiyah", nameAr: "تزكية النفس" },
    { id: "aqeedah", nameAr: "العقيدة وأصول الإيمان" },
  ];

  return (
    <div id="lectures-comprehensive-view" className="space-y-4 sm:space-y-6">
      {/* Hidden Audio Player */}
      <audio
        ref={audioRef}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Header Banner */}
      <div className={`rounded-2xl sm:rounded-3xl p-4 sm:p-6 border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden ${styles.cardBg} ${styles.cardBorder} ${styles.cardShadow}`}>
        <div className="flex items-start gap-3.5">
          <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 border ${styles.badgeBg} ${styles.badgeBorder} ${styles.accentText}`}>
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${styles.badgeBg} ${styles.badgeBorder} ${styles.accentText}`}>
                المكتبة العلمية
              </span>
              <span className={`text-[11px] ${styles.mutedText}`}>سلاسل تأصيلية موثوقة</span>
            </div>
            <h2 className={`text-base sm:text-xl font-bold font-alexandria ${styles.titleText}`}>
              محاضرات ودروس كبار العلماء والدعاة
            </h2>
            <p className={`text-xs max-w-xl line-clamp-1 sm:line-clamp-none ${styles.mutedText}`}>
              منظومة صوتية لتزكية القلوب، فقه الصلاة، مدارسة السيرة، وفهم أصول الدين.
            </p>
          </div>
        </div>

        {/* Currently Playing Card */}
        {isPlaying && (
          <div className={`p-3.5 rounded-2xl border flex flex-col gap-2 w-full md:w-80 shadow-md ${styles.innerBg} ${styles.innerBorder}`}>
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${styles.btnPrimary}`}>
                <Volume2 className="w-4 h-4 animate-pulse" />
              </div>
              <div className="text-right flex-1 min-w-0">
                <span className={`text-[10px] font-mono font-bold block ${styles.accentText}`}>
                  قيد الاستماع الآن:
                </span>
                <h4 className={`text-xs font-bold truncate font-alexandria ${styles.titleText}`}>
                  {activeLecture.title}
                </h4>
                <span className={`text-[11px] block truncate ${styles.mutedText}`}>{activeLecture.scholar}</span>
              </div>
            </div>

            {/* Seeking bar */}
            <div className="space-y-1 pt-1">
              <input
                type="range"
                min="0"
                max="100"
                value={playbackProgress}
                onChange={handleSeek}
                className="w-full h-1 rounded-lg appearance-none cursor-pointer accent-emerald-500 bg-black/20 dark:bg-white/20"
              />
              <div className={`flex justify-between text-[10px] font-mono ${styles.mutedText}`}>
                <span>{currentTimeFormatted}</span>
                <span>{audioDurationFormatted !== "00:00" ? audioDurationFormatted : activeLecture.duration}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              soundEngine.playTasbihClick();
              setSelectedCategory(cat.id);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap border ${
              selectedCategory === cat.id
                ? styles.btnPrimary
                : styles.btnSecondary
            }`}
          >
            {cat.nameAr}
          </button>
        ))}
      </div>

      {/* Lectures Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
        {filteredLectures.map((lecture) => {
          const isCurrentActive = activeLecture.id === lecture.id && isPlaying;
          return (
            <div
              key={lecture.id}
              className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all duration-200 space-y-3 relative overflow-hidden ${styles.cardBg} ${
                isCurrentActive
                  ? `${styles.badgeBorder} ring-1 ring-emerald-500/40 shadow-md`
                  : `${styles.cardBorder} hover:shadow-sm`
              }`}
            >
              {/* Category & Duration Tags */}
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${styles.badgeBg} ${styles.badgeBorder} ${styles.accentText}`}>
                  {lecture.categoryAr}
                </span>
                <div className={`flex items-center gap-1.5 text-xs font-mono ${styles.mutedText}`}>
                  <Clock className={`w-3.5 h-3.5 ${styles.accentText}`} />
                  <span>{lecture.duration}</span>
                </div>
              </div>

              {/* Title & Scholar */}
              <div className="space-y-0.5">
                <h3 className={`text-sm sm:text-base font-bold font-alexandria ${styles.titleText}`}>
                  {lecture.title}
                </h3>
                <div className={`flex items-center gap-1.5 text-xs font-medium ${styles.accentText}`}>
                  <User className="w-3.5 h-3.5" />
                  <span>{lecture.scholar}</span>
                </div>
              </div>

              {/* Summary */}
              <p className={`text-xs leading-relaxed p-2.5 rounded-xl border ${styles.innerBg} ${styles.innerBorder} ${styles.mutedText}`}>
                {lecture.summary}
              </p>

              {/* Key takeaways bullet points */}
              <div className="space-y-1">
                <span className={`text-[10px] font-bold block ${styles.mutedText}`}>أبرز المحاور:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  {lecture.keyPoints.map((point, pIdx) => (
                    <div key={pIdx} className={`flex items-start gap-1.5 text-[11px] ${styles.mutedText}`}>
                      <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Play/Pause Bar */}
              <div className={`pt-2 border-t flex items-center justify-between ${styles.innerBorder}`}>
                <button
                  onClick={() => handleToggleLecture(lecture)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 ${
                    isCurrentActive
                      ? styles.btnPrimary
                      : styles.btnSecondary
                  }`}
                >
                  {isCurrentActive ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>إيقاف مؤقت</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>استماع للدرس</span>
                    </>
                  )}
                </button>

                <span className={`text-[10px] font-mono ${styles.mutedText}`}>صوت نقي</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
