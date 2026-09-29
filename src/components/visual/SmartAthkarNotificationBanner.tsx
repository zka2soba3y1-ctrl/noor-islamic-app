import React, { useState, useEffect } from "react";
import {
  Bell,
  Sun,
  Moon,
  Sparkles,
  BookOpen,
  Clock,
  BellOff,
  X,
  Volume2,
  CheckCircle2,
  ChevronLeft,
} from "lucide-react";
import {
  athkarNotificationService,
  InAppAthkarAlert,
} from "../../services/athkarNotificationService";
import { soundEngine } from "../../utils/soundEngine";
import { speechEngine } from "../../utils/speechEngine";

interface Props {
  onNavigateTab?: (tab: string) => void;
}

export const SmartAthkarNotificationBanner: React.FC<Props> = ({ onNavigateTab }) => {
  const [alert, setAlert] = useState<InAppAthkarAlert | null>(null);
  const [isReadingVoice, setIsReadingVoice] = useState(false);
  const [snoozeFeedback, setSnoozeFeedback] = useState<string | null>(null);

  useEffect(() => {
    const handleAlert = (e: Event) => {
      const customEvent = e as CustomEvent<{ alert: InAppAthkarAlert }>;
      if (customEvent.detail?.alert) {
        setAlert(customEvent.detail.alert);
        setSnoozeFeedback(null);
      }
    };

    const handleDismiss = () => {
      setAlert(null);
      setIsReadingVoice(false);
    };

    window.addEventListener("noor-in-app-athkar-alert", handleAlert);
    window.addEventListener("noor-dismiss-athkar-alert", handleDismiss);

    return () => {
      window.removeEventListener("noor-in-app-athkar-alert", handleAlert);
      window.removeEventListener("noor-dismiss-athkar-alert", handleDismiss);
    };
  }, []);

  if (!alert) return null;

  const handleOpenAthkar = () => {
    soundEngine.playTasbihClick();
    if (onNavigateTab) {
      onNavigateTab("hisn_muslim");
    } else {
      window.dispatchEvent(
        new CustomEvent("noor-navigate-tab", { detail: { tab: "hisn_muslim" } })
      );
    }

    // Open target chapter if present
    if (alert.chapterId) {
      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent("noor-open-hisn-chapter", {
            detail: { chapterId: alert.chapterId },
          })
        );
      }, 100);
    }

    athkarNotificationService.dismissAlert();
  };

  const handleSnooze = () => {
    athkarNotificationService.snooze(alert.type, 15);
    setSnoozeFeedback("تم تأجيل التنبيه 15 دقيقة ⏱️");
    setTimeout(() => {
      setAlert(null);
      setSnoozeFeedback(null);
    }, 1200);
  };

  const handleDisableAll = () => {
    soundEngine.playTasbihClick();
    athkarNotificationService.disableAll();
    setSnoozeFeedback("تم إيقاف التنبيهات بالكامل 🔕");
    setTimeout(() => {
      setAlert(null);
      setSnoozeFeedback(null);
    }, 1200);
  };

  const handleDismiss = () => {
    soundEngine.playTasbihClick();
    athkarNotificationService.dismissAlert();
  };

  const handleToggleVoice = () => {
    if (isReadingVoice) {
      speechEngine.stop();
      setIsReadingVoice(false);
    } else {
      speechEngine.speak(alert.thikrSnippet);
      setIsReadingVoice(true);
    }
  };

  const getIcon = () => {
    switch (alert.type) {
      case "morning":
        return <Sun className="w-5 h-5 text-amber-300 animate-spin-slow" />;
      case "evening":
        return <Moon className="w-5 h-5 text-teal-300" />;
      case "sleep":
        return <Moon className="w-5 h-5 text-indigo-300" />;
      case "periodic":
        return <Sparkles className="w-5 h-5 text-emerald-300 animate-pulse" />;
      default:
        return <Bell className="w-5 h-5 text-amber-300 animate-bounce" />;
    }
  };

  const getBadgeStyle = () => {
    switch (alert.type) {
      case "morning":
        return "bg-amber-500/20 text-amber-200 border-amber-500/30";
      case "evening":
        return "bg-teal-500/20 text-teal-200 border-teal-500/30";
      case "sleep":
        return "bg-indigo-500/20 text-indigo-200 border-indigo-500/30";
      default:
        return "bg-emerald-500/20 text-emerald-200 border-emerald-500/30";
    }
  };

  return (
    <div
      id="smart-athkar-notification-banner"
      role="alert"
      aria-live="polite"
      className="fixed top-16 md:top-20 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-2xl px-2 transition-all duration-300"
    >
      <div className="relative overflow-hidden rounded-2xl bg-[#090D16]/95 backdrop-blur-xl border border-emerald-500/40 shadow-[0_12px_40px_rgba(0,0,0,0.7)] p-4 md:p-5 text-white">
        {/* Glow ambient background line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-amber-400 to-teal-500 animate-pulse"></div>

        {snoozeFeedback ? (
          <div className="py-4 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto animate-bounce" />
            <p className="text-base font-bold text-emerald-200">{snoozeFeedback}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Top Bar with Icon & Actions */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center border shadow-inner ${getBadgeStyle()}`}
                >
                  {getIcon()}
                </div>
                <div>
                  <h3 className="font-bold text-sm md:text-base text-zinc-100 flex items-center gap-1.5">
                    <span>{alert.title}</span>
                  </h3>
                  <p className="text-[11px] text-zinc-400 font-medium">
                    {alert.subtitle} • نظام التنبيهات الذكي
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                id="btn-dismiss-athkar-alert"
                onClick={handleDismiss}
                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition border border-white/5"
                title="إغلاق التنبيه"
                aria-label="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Thikr Snippet Card */}
            <div className="p-3 rounded-xl bg-black/40 border border-emerald-500/20 text-right">
              <p className="text-xs md:text-sm font-semibold text-emerald-100/90 leading-relaxed font-alexandria line-clamp-3">
                «{alert.thikrSnippet}»
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/5">
              <div className="flex items-center gap-2">
                {/* Main Read Action */}
                <button
                  id="btn-open-athkar-from-alert"
                  onClick={handleOpenAthkar}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-950/40 transition"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>قراءة في حصن المسلم</span>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                {/* Voice speech toggle */}
                <button
                  id="btn-voice-athkar-alert"
                  onClick={handleToggleVoice}
                  className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-zinc-200 text-xs font-medium flex items-center gap-1 border border-white/10 transition"
                  title="استماع صوتي للذكر"
                >
                  <Volume2 className="w-3.5 h-3.5 text-amber-300" />
                  <span className="hidden sm:inline">
                    {isReadingVoice ? "إيقاف الصوت" : "استماع"}
                  </span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {/* Snooze 15 Mins */}
                <button
                  id="btn-snooze-athkar-alert"
                  onClick={handleSnooze}
                  className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-medium flex items-center gap-1 border border-white/10 transition"
                  title="تأجيل التنبيه 15 دقيقة"
                >
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>تأجيل 15 دقيقة</span>
                </button>

                {/* Quick Disable all alerts */}
                <button
                  id="btn-disable-athkar-alerts"
                  onClick={handleDisableAll}
                  className="px-2.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-200 text-xs font-medium flex items-center gap-1 border border-red-500/20 transition"
                  title="إيقاف التنبيهات بالكامل"
                >
                  <BellOff className="w-3 h-3" />
                  <span className="hidden sm:inline">إيقاف التنبيهات</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
