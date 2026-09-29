import React, { useState, useEffect } from "react";
import { Clock, Volume2 } from "lucide-react";
import { ThemeMode } from "../../types";
import { soundEngine } from "../../utils/soundEngine";
import { speechEngine } from "../../utils/speechEngine";

interface DigitalClockBadgeProps {
  theme?: ThemeMode;
  className?: string;
}

/**
 * Format Arabic Spoken Time into pleasant natural Arabic speech
 */
function getArabicSpokenTime(d: Date = new Date()): string {
  const hours24 = d.getHours();
  const minutes = d.getMinutes();
  const isPM = hours24 >= 12;
  const hours12 = hours24 % 12 || 12;

  const hoursArabicMap: Record<number, string> = {
    1: "الواحدة",
    2: "الثانية",
    3: "الثالثة",
    4: "الرابعة",
    5: "الخامسة",
    6: "السادسة",
    7: "السابعة",
    8: "الثامنة",
    9: "التاسعة",
    10: "العاشرة",
    11: "الحادية عشرة",
    12: "الثانية عشرة",
  };

  const hourStr = hoursArabicMap[hours12] || `${hours12}`;
  let minStr = "";
  if (minutes === 0) {
    minStr = "تماماً";
  } else if (minutes === 15) {
    minStr = "والرّبع";
  } else if (minutes === 20) {
    minStr = "والثُّلث";
  } else if (minutes === 30) {
    minStr = "والنِّصف";
  } else if (minutes === 40) {
    minStr = "إلا ثُلثاً";
  } else if (minutes === 45) {
    minStr = "إلا رُبعاً";
  } else if (minutes === 1) {
    minStr = "ودقيقة واحدة";
  } else if (minutes === 2) {
    minStr = "ودقيقتان";
  } else if (minutes <= 10) {
    minStr = `و${minutes} دقائق`;
  } else {
    minStr = `و${minutes} دقيقة`;
  }

  const periodStr = isPM ? "مساءً" : "صباحاً";
  return `الساعة الآن ${hourStr} ${minStr} ${periodStr}، بارك الله في وقتك وعمرك يا طيب.`;
}

export const DigitalClockBadge: React.FC<DigitalClockBadgeProps> = ({
  theme = "natural",
  className = "",
}) => {
  const [time, setTime] = useState<Date>(new Date());
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours24 = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();
  const isPM = hours24 >= 12;
  const hours12 = hours24 % 12 || 12;

  const pad = (n: number) => String(n).padStart(2, "0");
  const hoursFormatted = pad(hours12);
  const minutesFormatted = pad(minutes);
  const secondsFormatted = pad(seconds);
  const periodLabel = isPM ? "م" : "ص";
  const periodFull = isPM ? "مساءً" : "صباحاً";

  const handleReadTime = () => {
    soundEngine.playTasbihClick();
    setIsSpeaking(true);
    setShowTooltip(true);

    const spokenText = getArabicSpokenTime(new Date());
    speechEngine.speakEgyptian(spokenText, {
      onEnd: () => {
        setIsSpeaking(false);
        setTimeout(() => setShowTooltip(false), 1500);
      },
    });
  };

  const isPaper = theme === "paper";
  const isLight = theme === "light";

  return (
    <div className="relative inline-block">
      <button
        type="button"
        id="btn-digital-clock-speak"
        onClick={handleReadTime}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => !isSpeaking && setShowTooltip(false)}
        className={`group relative inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full sm:rounded-2xl border transition-all cursor-pointer active:scale-95 select-none ${
          isSpeaking
            ? "ring-2 ring-[#D4AF37] border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.4)] scale-102"
            : isPaper
            ? "bg-[#F5EDE0] border-[#D6C5A9] text-[#2F1E12] hover:border-[#B8860B]/60 shadow-xs"
            : isLight
            ? "bg-slate-50 border-emerald-500/25 text-[#0F172A] hover:border-emerald-500/50 shadow-xs"
            : "bg-black/40 border-[#D4AF37]/30 text-white hover:border-[#D4AF37]/60 shadow-[0_0_12px_rgba(0,0,0,0.5)]"
        } ${className}`}
        title="انقر للاستماع للوقت بصوت ناطق"
        aria-label={`الساعة الرقمية: ${hours12}:${minutesFormatted} ${periodFull}. اضغط للاستماع للوقت بصوت ناطق`}
      >
        {/* Subtle glowing ambient behind numbers */}
        <div className="absolute -inset-0.5 rounded-full sm:rounded-2xl bg-gradient-to-r from-emerald-500/10 via-[#D4AF37]/15 to-emerald-500/10 blur-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        {/* Clock Icon with Pulse or Speaker while reading */}
        <div
          className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
            isSpeaking
              ? "bg-[#D4AF37] text-slate-950 animate-bounce"
              : isPaper
              ? "bg-[#B8860B]/15 text-[#B8860B]"
              : isLight
              ? "bg-emerald-500/15 text-emerald-700"
              : "bg-[#D4AF37]/15 text-[#D4AF37]"
          }`}
        >
          {isSpeaking ? (
            <Volume2 className="w-3 h-3 animate-pulse" />
          ) : (
            <Clock className="w-3 h-3 group-hover:rotate-45 transition-transform duration-300" />
          )}
        </div>

        {/* Digital Time Numerals */}
        <div className="flex items-center gap-0.5 font-mono text-xs sm:text-sm font-black tracking-wider leading-none" dir="ltr">
          <span className="text-emerald-600 dark:text-emerald-300">{hoursFormatted}</span>
          <span className="text-[#D4AF37] animate-pulse font-bold">:</span>
          <span className="text-emerald-600 dark:text-emerald-300">{minutesFormatted}</span>
          <span className="text-[#D4AF37] text-[10px] animate-pulse font-bold hidden xs:inline">:</span>
          <span className="text-slate-400 dark:text-slate-400 text-[10px] font-bold hidden xs:inline">
            {secondsFormatted}
          </span>
        </div>

        {/* Period Badge (ص / م) */}
        <span
          className={`px-1 sm:px-1.5 py-0.5 rounded-md text-[9px] sm:text-[10px] font-black leading-none border ${
            isPM
              ? "bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/40"
              : "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/40"
          }`}
          title={periodFull}
        >
          {periodLabel}
        </span>

        {/* Small Audio Prompt Dot */}
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            isSpeaking ? "bg-[#D4AF37] animate-ping" : "bg-emerald-500/70"
          }`}
        />
      </button>

      {/* Interactive Voice Tooltip */}
      {showTooltip && (
        <div
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-xl bg-slate-900/95 text-[#F3E7C4] text-[10px] font-bold whitespace-nowrap shadow-xl border border-[#D4AF37]/40 z-50 animate-fadeIn pointer-events-none flex items-center gap-1.5"
          dir="rtl"
        >
          <Volume2 className="w-3 h-3 text-[#D4AF37]" />
          <span>{isSpeaking ? "جاري نطق الوقت الآن..." : "اضغط للاستماع للوقت بصوت ناطق"}</span>
        </div>
      )}
    </div>
  );
};
