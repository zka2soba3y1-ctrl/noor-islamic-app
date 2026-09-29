import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  CheckCircle2,
  RotateCcw,
  Volume2,
  VolumeX,
  Award,
  BookOpen,
  Heart,
  Shield,
  Sun,
  Moon,
  Compass,
  Bell,
  Clock,
  Star,
  Check,
  X,
  Flame,
  Filter,
} from "lucide-react";
import {
  MORNING_ATHKAR,
  EVENING_ATHKAR,
  POST_PRAYER_ATHKAR,
  SLEEP_WAKING_ATHKAR,
  RUQYAH_SHARIAH,
  QURANIC_DUAS,
  TASBIH_TYPES,
} from "../../data/athkarData";
import { ThikrItem, ThemeMode } from "../../types";
import { soundEngine } from "../../utils/soundEngine";
import { speechEngine } from "../../utils/speechEngine";
import { hapticEngine } from "../../utils/hapticEngine";
import { getThemeStyles } from "../../utils/themeClasses";
import { AzkarList } from "./AzkarList";
import { HisnMuslimComprehensiveView } from "./HisnMuslimComprehensiveView";
import { HapticPatternsGuideModal } from "../sensory/HapticPatternsGuideModal";
import { achievementsService } from "../../utils/achievementsService";
import { AthkarNotificationSettingsCard } from "./AthkarNotificationSettingsCard";
import { athkarNotificationService } from "../../services/athkarNotificationService";

interface Props {
  theme?: ThemeMode;
}

interface AthkarRemindersConfig {
  enabled: boolean;
  morningTime: string; // e.g. "06:30"
  eveningTime: string; // e.g. "17:30"
  sleepTime: string; // e.g. "22:30"
  soundAlert: boolean;
}

const DEFAULT_REMINDERS: AthkarRemindersConfig = {
  enabled: true,
  morningTime: "06:30",
  eveningTime: "17:30",
  sleepTime: "22:30",
  soundAlert: true,
};

export const AthkarComprehensiveView: React.FC<Props> = ({ theme = "natural" }) => {
  const styles = getThemeStyles(theme);
  const { isNatural, isPaper, isNight, isLight, isDark } = styles;

  const [athkarMode, setAthkarMode] = useState<"hisn" | "api" | "counter">("hisn");
  const [activeTab, setActiveTab] = useState<
    "morning" | "evening" | "post_prayer" | "sleep" | "ruqyah" | "duas" | "favorites" | "tasbih"
  >("morning");

  // Track dynamic counts
  const [morningList, setMorningList] = useState<ThikrItem[]>(MORNING_ATHKAR);
  const [eveningList, setEveningList] = useState<ThikrItem[]>(EVENING_ATHKAR);
  const [postPrayerList, setPostPrayerList] = useState<ThikrItem[]>(POST_PRAYER_ATHKAR);
  const [sleepList, setSleepList] = useState<ThikrItem[]>(SLEEP_WAKING_ATHKAR);
  const [ruqyahList, setRuqyahList] = useState<ThikrItem[]>(RUQYAH_SHARIAH);
  const [duasList, setDuasList] = useState<ThikrItem[]>(QURANIC_DUAS);

  // Favorites state (persisted)
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("noor_athkar_favorites");
      return saved ? JSON.parse(saved) : ["m_1", "m_2", "e_1", "e_2", "p_1"];
    } catch {
      return ["m_1", "m_2", "e_1", "e_2", "p_1"];
    }
  });

  // Frequency read count map (persisted)
  const [readFrequency, setReadFrequency] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem("noor_athkar_frequency");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Reminder settings modal & state
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isHapticGuideOpen, setIsHapticGuideOpen] = useState(false);
  const [reminders, setReminders] = useState<AthkarRemindersConfig>(() => {
    try {
      const saved = localStorage.getItem("noor_athkar_reminders");
      return saved ? JSON.parse(saved) : DEFAULT_REMINDERS;
    } catch {
      return DEFAULT_REMINDERS;
    }
  });

  const [favoritesFilter, setFavoritesFilter] = useState<"all_favorites" | "most_read">("all_favorites");

  // Tasbih state
  const [activeTasbihId, setActiveTasbihId] = useState<string>("subhan_allah");
  const [tasbihCount, setTasbihCount] = useState<number>(0);

  // Save favorites & frequency to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("noor_athkar_favorites", JSON.stringify(favoriteIds));
    } catch {}
  }, [favoriteIds]);

  useEffect(() => {
    try {
      localStorage.setItem("noor_athkar_frequency", JSON.stringify(readFrequency));
    } catch {}
  }, [readFrequency]);

  useEffect(() => {
    try {
      localStorage.setItem("noor_athkar_reminders", JSON.stringify(reminders));
    } catch {}
  }, [reminders]);

  // Daily Scheduled Notifications Engine
  useEffect(() => {
    if (!reminders.enabled) return;

    const lastTriggeredDate = {
      morning: "",
      evening: "",
      sleep: "",
    };

    const checkInterval = setInterval(() => {
      const now = new Date();
      const todayStr = now.toISOString().split("T")[0];
      const currentHours = String(now.getHours()).padStart(2, "0");
      const currentMins = String(now.getMinutes()).padStart(2, "0");
      const currentTime = `${currentHours}:${currentMins}`;

      // Morning Athkar Check
      if (currentTime === reminders.morningTime && lastTriggeredDate.morning !== todayStr) {
        triggerScheduledPushNotification(
          "حان وقت أذكار الصباح المباركة ☀️",
          "«أصبحنا وأصبح الملك لله».. ابدأ يومك بنور الذكر والبركة.",
          "morning"
        );
        lastTriggeredDate.morning = todayStr;
      }

      // Evening Athkar Check
      if (currentTime === reminders.eveningTime && lastTriggeredDate.evening !== todayStr) {
        triggerScheduledPushNotification(
          "حان وقت أذكار المساء وحفظ اليوم 🌙",
          "«أمسينا وأمسى الملك لله».. حصّن نفسك وأهلك بأذكار المساء.",
          "evening"
        );
        lastTriggeredDate.evening = todayStr;
      }

      // Sleep Athkar Check
      if (currentTime === reminders.sleepTime && lastTriggeredDate.sleep !== todayStr) {
        triggerScheduledPushNotification(
          "أذكار النوم وسكينة الروح ✨",
          "«باسمك ربي وضعت جنبي وبك أرفعه».. نوم هانئ وحفظ إلهي مبارك.",
          "sleep"
        );
        lastTriggeredDate.sleep = todayStr;
      }
    }, 20000);

    return () => clearInterval(checkInterval);
  }, [reminders]);

  const triggerScheduledPushNotification = (
    title: string,
    body: string,
    category: "morning" | "evening" | "sleep" = "morning"
  ) => {
    soundEngine.playAthkarAlertHaptic(category);
    if (reminders.soundAlert) {
      soundEngine.playAdhanChime();
    }
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        try {
          new Notification(title, {
            body,
            icon: "/app-logo.png",
            dir: "rtl",
            tag: "athkar-reminder",
          });
        } catch (e) {
          console.warn("Notification error:", e);
        }
      }
    }
  };

  const requestNotificationPermission = async () => {
    soundEngine.playTasbihClick();
    if (typeof window !== "undefined" && "Notification" in window) {
      const perm = await Notification.requestPermission();
      if (perm === "granted") {
        speechEngine.speak("تم تفعيل إشعارات الأذكار اليومية بنجاح، جزاك الله خيراً.");
        triggerScheduledPushNotification("مشروع النور • تم تفعيل التنبيهات 🔔", "ستصلك تذكيرات أذكار الصباح والمساء والنوم في المواعيد المحددة.");
      }
    }
  };

  const testPushNotification = () => {
    soundEngine.playTasbihClick();
    triggerScheduledPushNotification("تجربة إشعار الأذكار اليومي 🔔", "أذكار الصباح والمساء في موعدها المبارك، تقبل الله طاعتكم.");
  };

  // Toggle favorite
  const toggleFavorite = (thikrId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    soundEngine.playTasbihClick();
    setFavoriteIds((prev) =>
      prev.includes(thikrId) ? prev.filter((id) => id !== thikrId) : [...prev, thikrId]
    );
  };

  // Get all known items combined to resolve favorites
  const allKnownAthkar = [
    ...morningList,
    ...eveningList,
    ...postPrayerList,
    ...sleepList,
    ...ruqyahList,
    ...duasList,
  ];

  const getActiveListAndSetter = () => {
    switch (activeTab) {
      case "morning":
        return { list: morningList, setter: setMorningList };
      case "evening":
        return { list: eveningList, setter: setEveningList };
      case "post_prayer":
        return { list: postPrayerList, setter: setPostPrayerList };
      case "sleep":
        return { list: sleepList, setter: setSleepList };
      case "ruqyah":
        return { list: ruqyahList, setter: setRuqyahList };
      case "duas":
        return { list: duasList, setter: setDuasList };
      case "favorites": {
        let favs = allKnownAthkar.filter((item) => favoriteIds.includes(item.id));
        // Remove duplicate IDs if any
        const seen = new Set<string>();
        favs = favs.filter((item) => {
          if (seen.has(item.id)) return false;
          seen.add(item.id);
          return true;
        });

        if (favoritesFilter === "most_read") {
          favs.sort((a, b) => (readFrequency[b.id] || 0) - (readFrequency[a.id] || 0));
        }

        return {
          list: favs,
          setter: (updatedList: ThikrItem[]) => {
            // Update the matching items in their parent lists
            const map = new Map(updatedList.map((i) => [i.id, i]));
            setMorningList((prev) => prev.map((i) => map.get(i.id) || i));
            setEveningList((prev) => prev.map((i) => map.get(i.id) || i));
            setPostPrayerList((prev) => prev.map((i) => map.get(i.id) || i));
            setSleepList((prev) => prev.map((i) => map.get(i.id) || i));
            setRuqyahList((prev) => prev.map((i) => map.get(i.id) || i));
            setDuasList((prev) => prev.map((i) => map.get(i.id) || i));
          },
        };
      }
      default:
        return { list: morningList, setter: setMorningList };
    }
  };

  const handleIncrement = (id: string) => {
    const { list, setter } = getActiveListAndSetter();
    soundEngine.playTasbihClick();

    // Increment frequency
    setReadFrequency((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));

    setter(
      list.map((item) => {
        if (item.id === id) {
          const nextCount = Math.min(item.repeat, item.count + 1);
          if (nextCount === item.repeat) {
            soundEngine.playMilestone33();
            speechEngine.speak("اكتمل هذا الذكر المبارك، تقبل الله منك.");
            achievementsService.recordAction("tasbih", item.repeat);
          }
          return { ...item, count: nextCount };
        }
        return item;
      })
    );
  };

  const handleSpeakThikr = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.playTasbihClick();
    speechEngine.speakEgyptian(text);
  };

  const handleResetCurrentList = () => {
    soundEngine.playTasbihClick();
    const { list, setter } = getActiveListAndSetter();
    setter(list.map((item) => ({ ...item, count: 0 })));
  };

  const handleTasbihClick = () => {
    const nextVal = tasbihCount + 1;
    setTasbihCount(nextVal);
    achievementsService.recordAction("tasbih", 1);
    if (nextVal % 100 === 0) {
      soundEngine.playMilestone100();
    } else if (nextVal % 33 === 0) {
      soundEngine.playMilestone33();
    } else {
      soundEngine.playTasbihClick();
    }
  };

  const { list: currentDisplayList } = getActiveListAndSetter();
  const completedCount = currentDisplayList.filter((i) => i.count >= i.repeat).length;
  const totalCount = currentDisplayList.length;

  return (
    <div id="athkar-comprehensive-view" className="space-y-4 sm:space-y-6 animate-fadeIn">
      {/* Top Mode Selector & Reminders Button */}
      <div
        className={`p-2 rounded-2xl sm:rounded-3xl border flex flex-wrap items-center justify-between gap-2.5 ${styles.innerBg} ${styles.innerBorder}`}
      >
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/5 dark:bg-white/5">
          <button
            onClick={() => {
              soundEngine.playTasbihClick();
              setAthkarMode("hisn");
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              athkarMode === "hisn"
                ? "bg-emerald-600 text-white shadow-xs"
                : `${styles.mutedText} hover:${styles.bodyText}`
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>حصن المسلم الصوتي (جديد)</span>
          </button>
          <button
            onClick={() => {
              soundEngine.playTasbihClick();
              setAthkarMode("api");
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              athkarMode === "api"
                ? "bg-emerald-600 text-white shadow-xs"
                : `${styles.mutedText} hover:${styles.bodyText}`
            }`}
          >
            موسوعة الأذكار المباشرة (API)
          </button>
          <button
            onClick={() => {
              soundEngine.playTasbihClick();
              setAthkarMode("counter");
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              athkarMode === "counter"
                ? "bg-emerald-600 text-white shadow-xs"
                : `${styles.mutedText} hover:${styles.bodyText}`
            }`}
          >
            السبحة والعداد والمفضلة
          </button>
        </div>

        {/* Daily Reminders & Haptic Patterns Quick Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsHapticGuideOpen(true)}
            className="px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
            title="أنماط الاهتزاز النمطي للأذكار والصلوات"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>اهتزاز الأذكار النمطي (Haptics)</span>
          </button>

          <button
            onClick={() => setIsReminderModalOpen(true)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
              reminders.enabled
                ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
                : `${styles.innerBg} ${styles.innerBorder} ${styles.mutedText}`
            }`}
            title="ضبط مواعيد التنبيهات اليومية للأذكار"
          >
            <Bell className="w-3.5 h-3.5 text-amber-500" />
            <span>مواعيد التذكير ({reminders.morningTime})</span>
          </button>
        </div>
      </div>

      {athkarMode === "hisn" ? (
        <HisnMuslimComprehensiveView theme={theme} />
      ) : athkarMode === "api" ? (
        <AzkarList initialTheme={theme} />
      ) : (
        <>
          {/* Header Banner */}
          <div
            className={`rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6 border transition-all ${
              styles.cardBg
            } ${styles.cardBorder} ${styles.cardShadow}`}
          >
            <div className="flex items-start gap-3.5">
              <div
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 border ${styles.badgeBg} ${styles.badgeBorder} ${styles.accentText}`}
              >
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-0.5 text-right">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${styles.badgeBg} ${styles.badgeText} ${styles.badgeBorder}`}
                  >
                    حصن المسلم الجامع
                  </span>
                  <span className={`text-[11px] ${styles.mutedText}`}>
                    أذكار صحيحة ومأثورة بالتشكيل وقائمة المفضلة
                  </span>
                </div>
                <h2 className={`text-base sm:text-xl font-bold tracking-tight font-alexandria ${styles.titleText}`}>
                  الأذكار والأدعية والمفضلة والسبحة
                </h2>
                <p className={`text-xs max-w-xl line-clamp-1 sm:line-clamp-none ${styles.mutedText}`}>
                  موسوعة شاملة مع تنبيهات يومية وقائمة مفضلة للأذكار الأكثر قراءة.
                </p>
              </div>
            </div>

            {activeTab !== "tasbih" && (
              <div className="flex items-center gap-2.5 w-full md:w-auto">
                <div
                  className={`border px-3 py-1.5 rounded-2xl text-xs flex items-center gap-2.5 ${styles.innerBg} ${styles.innerBorder}`}
                >
                  <span className={styles.mutedText}>الإنجاز:</span>
                  <span className={`font-mono font-bold text-xs sm:text-sm ${styles.titleText}`}>
                    {completedCount} / {totalCount}
                  </span>
                  <div className="w-14 sm:w-16 h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${styles.accentBg}`}
                      style={{ width: `${Math.round((completedCount / (totalCount || 1)) * 100)}%` }}
                    />
                  </div>
                </div>

                <button
                  onClick={handleResetCurrentList}
                  className={`p-2 rounded-xl border transition ${styles.btnSecondary}`}
                  title="إعادة تصفير عدادات هذا القسم"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Athkar Section Tabs (Now includes "favorites") */}
          <div
            className={`flex items-center gap-1.5 sm:gap-2 p-1.5 rounded-2xl border overflow-x-auto ${styles.innerBg} ${styles.innerBorder}`}
          >
            {[
              { id: "morning", label: "أذكار الصباح", icon: Sun },
              { id: "evening", label: "أذكار المساء", icon: Moon },
              {
                id: "favorites",
                label: `المفضلة والأكثر قراءة (${favoriteIds.length})`,
                icon: Star,
                isSpecial: true,
              },
              { id: "post_prayer", label: "بعد الصلاة", icon: CheckCircle2 },
              { id: "sleep", label: "النوم والاستيقاظ", icon: Heart },
              { id: "ruqyah", label: "الرقية الشرعية", icon: Shield },
              { id: "duas", label: "أدعية مأثورة", icon: BookOpen },
              { id: "tasbih", label: "السبحة الذكية", icon: Compass },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    soundEngine.playTasbihClick();
                    setActiveTab(tab.id as any);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap active:scale-95 ${
                    isActive
                      ? tab.isSpecial
                        ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-sm"
                        : styles.btnPrimary
                      : tab.isSpecial
                      ? "text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                      : `${styles.mutedText} hover:${styles.bodyText}`
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${tab.isSpecial ? "text-amber-400" : ""}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sub-bar for Favorites Tab */}
          {activeTab === "favorites" && (
            <div className="flex items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    soundEngine.playTasbihClick();
                    setFavoritesFilter("all_favorites");
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                    favoritesFilter === "all_favorites"
                      ? "bg-emerald-600 text-white"
                      : `${styles.innerBg} ${styles.mutedText}`
                  }`}
                >
                  كل المفضلة ({favoriteIds.length})
                </button>
                <button
                  onClick={() => {
                    soundEngine.playTasbihClick();
                    setFavoritesFilter("most_read");
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                    favoritesFilter === "most_read"
                      ? "bg-amber-600 text-white"
                      : `${styles.innerBg} ${styles.mutedText}`
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>الأكثر قراءة وتكراراً</span>
                </button>
              </div>

              <span className={`text-[11px] ${styles.mutedText}`}>
                انقر على النجمة في أي ذكر لإضافته لمفضلتك
              </span>
            </div>
          )}

          {/* TAB CONTENT: ATHKAR LIST OR TASBIH */}
          {activeTab !== "tasbih" ? (
            <div className="space-y-3">
              {currentDisplayList.length === 0 ? (
                <div
                  className={`p-8 rounded-3xl border text-center space-y-3 ${styles.cardBg} ${styles.cardBorder}`}
                >
                  <Star className="w-10 h-10 text-amber-500/40 mx-auto" />
                  <h4 className={`text-base font-bold font-alexandria ${styles.titleText}`}>
                    لا توجد أذكار مضافة للمفضلة بعد
                  </h4>
                  <p className={`text-xs max-w-sm mx-auto ${styles.mutedText}`}>
                    يمكنك تمييز أي ذكر من أذكار الصباح أو المساء أو الأدعية بالنقر على علامة النجمة ⭐ ليظهر هنا فوراً.
                  </p>
                </div>
              ) : (
                currentDisplayList.map((thikr) => {
                  const isDone = thikr.count >= thikr.repeat;
                  const isFav = favoriteIds.includes(thikr.id);
                  const freq = readFrequency[thikr.id] || 0;

                  return (
                    <div
                      key={thikr.id}
                      onClick={() => handleIncrement(thikr.id)}
                      className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border cursor-pointer select-none transition-all duration-300 space-y-2.5 relative overflow-hidden group hover:-translate-y-0.5 active:scale-99 ${
                        isDone
                          ? isPaper
                            ? "bg-[#FAF5EB] border-[#8C5E24] shadow-xs"
                            : isNight
                            ? "bg-[#0B1320] border-sky-500/60 shadow-xs"
                            : "bg-emerald-50/80 border-emerald-500 shadow-xs"
                          : `${styles.cardBg} ${styles.cardBorder} hover:border-emerald-500/40`
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p
                          className={`text-base sm:text-lg font-['Amiri',serif] leading-relaxed text-right flex-1 ${styles.titleText}`}
                        >
                          {thikr.text}
                        </p>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Voice Readout Button */}
                          <button
                            onClick={(e) => handleSpeakThikr(thikr.text, e)}
                            className="p-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 text-slate-400 hover:text-emerald-500 transition"
                            title="استمع للذكر بصوت الشيخ"
                            aria-label="قراءة الذكر صوتياً"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>

                          {/* Star/Favorite Toggle */}
                          <button
                            onClick={(e) => toggleFavorite(thikr.id, e)}
                            className={`p-2 rounded-xl transition ${
                              isFav
                                ? "bg-amber-500/20 text-amber-500"
                                : "bg-black/5 dark:bg-white/5 text-slate-400 hover:text-amber-500"
                            }`}
                            title={isFav ? "إزالة من المفضلة" : "إضافة للمفضلة"}
                            aria-label="تبديل المفضلة"
                          >
                            <Star className={`w-4 h-4 ${isFav ? "fill-amber-500" : ""}`} />
                          </button>

                          {/* Counter Badge */}
                          <div
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono text-xs ${styles.innerBg} ${styles.innerBorder}`}
                          >
                            <span
                              className={`text-sm font-bold ${
                                isDone ? styles.accentText : styles.titleText
                              }`}
                            >
                              {thikr.count}
                            </span>
                            <span className={styles.mutedText}>/</span>
                            <span className={styles.mutedText}>{thikr.repeat}</span>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`flex items-center justify-between pt-2 border-t text-[11px] sm:text-xs ${styles.innerBorder}`}
                      >
                        <span
                          className={`leading-relaxed max-w-2xl line-clamp-1 sm:line-clamp-none ${styles.mutedText}`}
                        >
                          <span className={`font-bold ml-1 ${styles.accentText}`}>الفضل:</span>
                          {thikr.virtue}
                        </span>

                        <div className="flex items-center gap-2 shrink-0">
                          {freq > 0 && (
                            <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                              قرئ {freq} مرة
                            </span>
                          )}

                          {isDone ? (
                            <span
                              className={`font-bold flex items-center gap-1 shrink-0 ${styles.accentText}`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>مكتمل</span>
                            </span>
                          ) : (
                            <span
                              className={`transition-colors shrink-0 text-[10px] sm:text-xs ${styles.mutedText}`}
                            >
                              انقر للعد ({thikr.repeat - thikr.count} متبقي)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* SMART ELECTRONIC TASBIH */
            <div
              className={`rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center space-y-6 border relative overflow-hidden ${styles.cardBg} ${styles.cardBorder} ${styles.cardShadow}`}
            >
              <div className="space-y-1">
                <span
                  className={`text-[10px] font-mono font-bold px-3 py-1 rounded-full border ${styles.badgeBg} ${styles.badgeText} ${styles.badgeBorder}`}
                >
                  السبحة النبضية الذكية التفاعلية
                </span>
                <h3 className={`text-xl sm:text-2xl font-bold font-alexandria mt-1 ${styles.titleText}`}>
                  {TASBIH_TYPES.find((t) => t.id === activeTasbihId)?.name}
                </h3>
              </div>

              {/* Tasbih Formulas Selector */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-2xl">
                {TASBIH_TYPES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      soundEngine.playTasbihClick();
                      setActiveTasbihId(t.id);
                      setTasbihCount(0);
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-medium transition ${
                      activeTasbihId === t.id
                        ? styles.btnPrimary
                        : `${styles.innerBg} ${styles.mutedText} hover:${styles.bodyText} border ${styles.innerBorder}`
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>

              {/* Giant Interactive Click Sphere */}
              <button
                onClick={handleTasbihClick}
                className={`w-44 h-44 sm:w-56 sm:h-56 rounded-full border-2 border-dashed flex flex-col items-center justify-center transition-all duration-300 active:scale-95 shadow-xl relative cursor-pointer ${
                  isPaper
                    ? "bg-[#FAF5EB] border-[#8C5E24]/50 hover:border-[#8C5E24]"
                    : isNight
                    ? "bg-[#05080C] border-sky-500/40 hover:border-sky-400"
                    : "bg-slate-50 border-emerald-500/40 hover:border-emerald-500"
                }`}
              >
                <div className="absolute inset-2.5 rounded-full border border-black/5 dark:border-white/5" />
                <span
                  className={`text-5xl sm:text-6xl font-black font-mono tracking-tight transition-colors ${styles.titleText}`}
                >
                  {tasbihCount}
                </span>
                <span className={`text-[10px] font-mono uppercase tracking-wider mt-1.5 ${styles.mutedText}`}>
                  انقر للتسبيح
                </span>
              </button>

              {/* Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTasbihCount(0)}
                  className={`px-4 py-2 rounded-xl text-xs font-mono transition flex items-center gap-1.5 border ${styles.btnSecondary}`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>تصفير العداد</span>
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* DAILY REMINDERS CONFIGURATION MODAL */}
      {isReminderModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
          <div
            className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden ${styles.cardBg} ${styles.cardBorder}`}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h4 className={`text-base font-bold font-alexandria ${styles.titleText}`}>
                    مواعيد تذكيرات الأذكار اليومية
                  </h4>
                  <p className={`text-[11px] ${styles.mutedText}`}>
                    حدد الوقت المفضل لتنبيهات الصباح والمساء والنوم
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsReminderModalOpen(false)}
                className="p-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5">
              <AthkarNotificationSettingsCard theme={theme} />
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between bg-black/5 dark:bg-white/5">
              <span className={`text-[11px] ${styles.mutedText}`}>
                تُحفظ الإعدادات والمواعيد تلقائياً وتعمل بالتزامن مع رفيق النور
              </span>
              <button
                onClick={() => {
                  soundEngine.playTasbihClick();
                  setIsReminderModalOpen(false);
                }}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Haptic Patterns Guide Modal */}
      <HapticPatternsGuideModal
        isOpen={isHapticGuideOpen}
        onClose={() => setIsHapticGuideOpen(false)}
      />
    </div>
  );
};
