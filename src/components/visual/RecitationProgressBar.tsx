import React, { useState, useEffect } from "react";
import {
  RotateCcw,
  RotateCw,
  Volume2,
  Sparkles,
  FastForward,
  Rewind,
  Play,
  Pause,
} from "lucide-react";
import { soundEngine } from "../../utils/soundEngine";
import { speechEngine } from "../../utils/speechEngine";
import { ThemeMode } from "../../types";
import { getThemeStyles } from "../../utils/themeClasses";

interface Props {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onSeek: (seconds: number) => void;
  onTogglePlay?: () => void;
  theme?: ThemeMode;
  variant?: "deck" | "sensory" | "compact";
  audioLabel?: string;
  className?: string;
}

export const RecitationProgressBar: React.FC<Props> = ({
  currentTime,
  duration,
  isPlaying,
  onSeek,
  onTogglePlay,
  theme = "natural",
  variant = "deck",
  audioLabel = "التلاوة المباركة",
  className = "",
}) => {
  const styles = getThemeStyles(theme);
  const isSensory = variant === "sensory";

  const percent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  // Format seconds to mm:ss or hh:mm:ss
  const formatTime = (sec: number) => {
    if (isNaN(sec) || sec < 0) return "00:00";
    const totalSec = Math.floor(sec);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const remainingTime = Math.max(0, duration - currentTime);

  // Quick seeking helper
  const handleSkip = (deltaSeconds: number) => {
    soundEngine.playTasbihClick();
    const newTime = Math.max(0, Math.min(currentTime + deltaSeconds, duration || 999999));
    onSeek(newTime);
    if (speechEngine.isVoiceFeedback() || isSensory) {
      const msg = deltaSeconds > 0 ? `تم تقديم ${deltaSeconds} ثوانٍ` : `تم تأخير ${Math.abs(deltaSeconds)} ثوانٍ`;
      speechEngine.speak(msg);
    }
  };

  const handleRestart = () => {
    soundEngine.playTasbihClick();
    onSeek(0);
    if (speechEngine.isVoiceFeedback() || isSensory) {
      speechEngine.speak("تمت إعادة التلاوة من البداية");
    }
  };

  // Announce position to screen reader / blind user
  const handleAnnounceProgress = () => {
    soundEngine.playTasbihClick();
    const curStr = formatTime(currentTime);
    const durStr = formatTime(duration);
    const text = `موضع التلاوة الحالي هو ${curStr} من إجمالي ${durStr}، بنسبة إنجاز ${Math.round(percent)} بالمائة.`;
    speechEngine.speak(text);
  };

  // Global listener for seek events via voice companion or remote commands
  useEffect(() => {
    const handleVoiceSeekEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{
        deltaSeconds?: number;
        setTime?: number;
        action?: "restart" | "pause" | "play" | "toggle";
      }>;
      const detail = customEvent.detail;
      if (!detail) return;

      if (typeof detail.setTime === "number") {
        onSeek(detail.setTime);
      } else if (typeof detail.deltaSeconds === "number") {
        const newTime = Math.max(0, Math.min(currentTime + detail.deltaSeconds, duration || 999999));
        onSeek(newTime);
      } else if (detail.action === "restart") {
        onSeek(0);
      } else if (detail.action === "toggle" && onTogglePlay) {
        onTogglePlay();
      }
    };

    window.addEventListener("noor-seek-audio", handleVoiceSeekEvent);
    return () => window.removeEventListener("noor-seek-audio", handleVoiceSeekEvent);
  }, [currentTime, duration, onSeek, onTogglePlay]);

  return (
    <div
      id="recitation-progress-bar-container"
      className={`w-full rounded-2xl transition-all ${
        isSensory
          ? "bg-black/90 border-2 border-[#10B981] p-4 text-white shadow-[0_0_20px_rgba(16,185,129,0.2)]"
          : "p-3 sm:p-4 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10"
      } ${className}`}
      role="region"
      aria-label="شريط تقدم التلاوة والتحكم الزمني"
    >
      {/* 1. Header: Status, Percentage, and Time Display */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isPlaying ? "bg-emerald-500 animate-ping" : "bg-zinc-500"
            }`}
          />
          <span className="text-xs font-bold font-alexandria truncate">
            {audioLabel}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            {Math.round(percent)}%
          </span>
        </div>

        {/* Read aloud button for visually impaired */}
        <button
          onClick={handleAnnounceProgress}
          className="flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-emerald-600 dark:text-emerald-400 transition"
          title="نطق موضع التلاوة صوتياً"
          aria-label="نطق موضع التلاوة صوتياً للكفيف"
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">نطق الموضع</span>
        </button>
      </div>

      {/* 2. Main Dynamic Progress Bar Track (Range Slider with Gradient Progress Fill) */}
      <div className="relative w-full my-2">
        {/* Visual Track Behind */}
        <div className="relative w-full h-3 sm:h-3.5 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden border border-black/5 dark:border-white/10 shadow-inner">
          <div
            className={`h-full rounded-full transition-all duration-150 ${
              isPlaying
                ? "bg-gradient-to-r from-[#059669] via-[#10B981] to-[#D4AF37] shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                : "bg-[#059669]"
            }`}
            style={{ width: `${percent}%` }}
          />
          {/* Animated Shimmer beam while playing */}
          {isPlaying && (
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-pulse pointer-events-none"
              style={{ width: `${percent}%` }}
            />
          )}
        </div>

        {/* Real Accessible Range Slider Overlay */}
        <input
          type="range"
          min={0}
          max={duration > 0 ? duration : 100}
          value={currentTime}
          step={0.5}
          onChange={(e) => {
            const val = Number(e.target.value);
            onSeek(val);
          }}
          aria-label="موضع التلاوة الحالي"
          aria-valuemin={0}
          aria-valuemax={duration || 100}
          aria-valuenow={Math.round(currentTime)}
          aria-valuetext={`${formatTime(currentTime)} من ${formatTime(duration)}`}
          className="absolute inset-0 w-full h-3 sm:h-3.5 opacity-0 cursor-pointer"
        />
      </div>

      {/* 3. Time Details: Elapsed Time & Remaining Time */}
      <div className="flex items-center justify-between text-[11px] font-mono font-bold text-zinc-500 dark:text-zinc-400 px-0.5 mb-3">
        <span className="text-emerald-700 dark:text-emerald-300">
          {formatTime(currentTime)}
        </span>
        <div className="flex items-center gap-1.5 text-[10px]">
          <span>المتبقي:</span>
          <span className="font-mono text-[#D4AF37]">
            -{formatTime(remainingTime)}
          </span>
          <span>•</span>
          <span>الإجمالي: {formatTime(duration)}</span>
        </div>
      </div>

      {/* 4. Quick Seek Buttons & Voice Command Hints (Designed for Blind & Sighted Users) */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 pt-2 border-t border-black/5 dark:border-white/10">
        <div className="flex items-center gap-1.5">
          {/* Restart from beginning */}
          <button
            onClick={handleRestart}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-black/40 hover:bg-emerald-500/10 text-xs font-semibold transition active:scale-95"
            title="إعادة التلاوة من البداية (أو قل: عيد من الأول)"
            aria-label="إعادة التلاوة من البداية"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[11px]">من البداية</span>
          </button>

          {/* Rewind 30 seconds */}
          <button
            onClick={() => handleSkip(-30)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-black/40 hover:bg-emerald-500/10 text-xs font-semibold transition active:scale-95"
            title="تأخير 30 ثانية (أو قل: ارجع 30 ثانية)"
            aria-label="تأخير 30 ثانية للخلف"
          >
            <Rewind className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-[11px]">-30ث</span>
          </button>

          {/* Rewind 10 seconds */}
          <button
            onClick={() => handleSkip(-10)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold text-xs transition active:scale-95"
            title="تأخير 10 ثواني (أو قل: ارجع 10 ثواني يا رفيقي)"
            aria-label="تأخير 10 ثواني للخلف"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="text-[11px] font-mono">-10ث</span>
          </button>
        </div>

        {/* Forward buttons */}
        <div className="flex items-center gap-1.5">
          {/* Fast Forward 10 seconds */}
          <button
            onClick={() => handleSkip(10)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold text-xs transition active:scale-95"
            title="تقديم 10 ثواني (أو قل: قدم 10 ثواني يا رفيقي)"
            aria-label="تقديم 10 ثواني للأمام"
          >
            <span className="text-[11px] font-mono">+10ث</span>
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          {/* Fast Forward 30 seconds */}
          <button
            onClick={() => handleSkip(30)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-black/40 hover:bg-emerald-500/10 text-xs font-semibold transition active:scale-95"
            title="تقديم 30 ثانية (أو قل: قدم 30 ثانية)"
            aria-label="تقديم 30 ثانية للأمام"
          >
            <span className="text-[11px]">+30ث</span>
            <FastForward className="w-3.5 h-3.5 text-zinc-400" />
          </button>
        </div>
      </div>

      {/* Voice Assistant Tip */}
      <div className="mt-2.5 pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#D4AF37]" />
          <span>أوامر صوتية: «قدم 10 ثواني»، «ارجع شوية»، «عيد من الأول»</span>
        </span>
        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
          دعم صوتي وحسي كامل
        </span>
      </div>
    </div>
  );
};
