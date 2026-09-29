import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  Circle,
  Calendar,
  Sparkles,
  TrendingUp,
  Clock,
  Award,
  ChevronLeft,
  ChevronRight,
  Flame,
  Heart,
} from "lucide-react";
import { sqliteManager, PrayerLogRow, WeeklyStat } from "../../utils/sqliteDb";
import { soundEngine } from "../../utils/soundEngine";
import { speechEngine } from "../../utils/speechEngine";
import { ThemeMode } from "../../types";
import { getThemeStyles } from "../../utils/themeClasses";
import { achievementsService } from "../../utils/achievementsService";

interface SqlitePrayerLogProps {
  prayerTimesList: { id: string; nameAr: string; nameEn: string; time: string }[];
  theme?: ThemeMode;
}

export const SqlitePrayerLog: React.FC<SqlitePrayerLogProps> = ({
  prayerTimesList,
  theme = "natural",
}) => {
  const styles = getThemeStyles(theme);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [logs, setLogs] = useState<PrayerLogRow[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStat[]>([]);

  // Daily prayers and sunnahs
  const defaultPrayers = [
    {
      id: "fajr",
      nameAr: "صلاة الفجر",
      defaultTime: "04:45 ص",
      rakahs: "ركعتان فرضان",
      sunnah: "سنة الفجر ركعتان قبل الفريضة",
      isObligatory: true,
    },
    {
      id: "dhuhr",
      nameAr: "صلاة الظهر",
      defaultTime: "12:15 م",
      rakahs: "أربع ركعات فرض",
      sunnah: "٤ ركعات قبلها وركعتان بعدها",
      isObligatory: true,
    },
    {
      id: "asr",
      nameAr: "صلاة العصر",
      defaultTime: "03:40 م",
      rakahs: "أربع ركعات فرض",
      sunnah: "يُستحب أربع ركعات قبلها",
      isObligatory: true,
    },
    {
      id: "maghrib",
      nameAr: "صلاة المغرب",
      defaultTime: "06:25 م",
      rakahs: "ثلاث ركعات فرض",
      sunnah: "ركعتان مؤكدتان بعدها",
      isObligatory: true,
    },
    {
      id: "isha",
      nameAr: "صلاة العشاء",
      defaultTime: "07:55 م",
      rakahs: "أربع ركعات فرض",
      sunnah: "ركعتان مؤكدتان بعدها",
      isObligatory: true,
    },
    {
      id: "duha",
      nameAr: "صلاة الضحى",
      defaultTime: "07:30 ص",
      rakahs: "سنة الأوابين (ركعتان إلى ثمان)",
      sunnah: "تجزئ عن ٣٦٠ صدقة عن مفاصل البدن",
      isObligatory: false,
    },
    {
      id: "qiyam",
      nameAr: "قيام الليل والوتر",
      defaultTime: "11:30 م",
      rakahs: "نافلة الليل (إحدى عشرة ركعة)",
      sunnah: "شرف المؤمن قيام الليل، والوتر خاتمة صلاة الليل",
      isObligatory: false,
    },
  ];

  // Refresh logs
  const loadData = async (dateStr: string) => {
    const rows = await sqliteManager.getPrayerLogsForDate(dateStr);
    setLogs(rows);
    const stats = await sqliteManager.getWeeklyStats();
    setWeeklyStats(stats);
  };

  useEffect(() => {
    loadData(selectedDate);
  }, [selectedDate]);

  const isCompleted = (prayerId: string): boolean => {
    const row = logs.find((l) => l.prayer_id === prayerId);
    return row ? row.completed === 1 : false;
  };

  const getCompletionTime = (prayerId: string): string | null => {
    const row = logs.find((l) => l.prayer_id === prayerId);
    return row && row.completed === 1 ? row.timestamp : null;
  };

  const handleTogglePrayer = async (prayerId: string, prayerName: string) => {
    const currentlyDone = isCompleted(prayerId);
    const targetStatus = !currentlyDone;

    if (targetStatus) {
      soundEngine.playMilestone33();
      speechEngine.speak(`تقبل الله منكم أداء ${prayerName}`);
      if (prayerId === "qiyam") {
        achievementsService.recordAction("qiyam", 1);
      } else {
        achievementsService.recordAction("prayer", 1);
      }
    } else {
      soundEngine.playTasbihClick();
    }

    await sqliteManager.togglePrayer(selectedDate, prayerId, prayerName, targetStatus);
    await loadData(selectedDate);
  };

  // Obligatory prayers count (out of 5)
  const obligatoryIds = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
  const completedObligatoryCount = logs.filter(
    (l) => obligatoryIds.includes(l.prayer_id) && l.completed === 1
  ).length;
  const totalCompletedToday = logs.filter((l) => l.completed === 1).length;
  const progressPercentage = Math.round((completedObligatoryCount / 5) * 100);

  // Jump date forward/backward
  const handleDateShift = (days: number) => {
    soundEngine.playTasbihClick();
    const curr = new Date(selectedDate);
    curr.setDate(curr.getDate() + days);
    setSelectedDate(curr.toISOString().split("T")[0]);
  };

  return (
    <div id="prayer-log-view" className="space-y-4 sm:space-y-6 animate-fadeIn">
      {/* Top Banner: Devotional Header */}
      <div
        className={`rounded-2xl sm:rounded-3xl p-5 sm:p-7 border transition-all relative overflow-hidden ${
          styles.cardBg
        } ${styles.cardBorder} ${styles.cardShadow}`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 border shadow-sm ${
                styles.badgeBg
              } ${styles.badgeBorder} ${styles.accentText}`}
            >
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <span className={`text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider block ${styles.accentText}`}>
                سجل العبادة والمحافظة على الصلوات
              </span>
              <h2 className={`text-lg sm:text-2xl font-bold font-alexandria ${styles.titleText}`}>
                سجل الصلوات والعبادات اليومية
              </h2>
              <p className={`text-xs max-w-xl leading-relaxed ${styles.mutedText}`}>
                تابع التزامك بأداء الصلوات الخمس المفروضة والسنن الرواتب، واطّلع على معدل التزامك الأسبوعي.
              </p>
            </div>
          </div>

          {/* Quick Date Selector */}
          <div className="flex items-center gap-2 self-stretch md:self-auto justify-between md:justify-end">
            <button
              onClick={() => handleDateShift(-1)}
              className={`p-2 rounded-xl border transition ${styles.btnSecondary}`}
              title="اليوم السابق"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold font-mono ${styles.innerBg} ${styles.innerBorder}`}>
              <Calendar className="w-3.5 h-3.5 inline-block ml-1.5 text-emerald-500" />
              <span>{selectedDate}</span>
            </div>

            <button
              onClick={() => handleDateShift(1)}
              disabled={selectedDate === new Date().toISOString().split("T")[0]}
              className={`p-2 rounded-xl border transition disabled:opacity-30 ${styles.btnSecondary}`}
              title="اليوم التالي"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3 Metric Cards: Progress, Obligatory, Streak */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Progress Card */}
        <div
          className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border space-y-2 ${
            styles.cardBg
          } ${styles.cardBorder} ${styles.cardShadow}`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold ${styles.mutedText}`}>نسبة الإنجاز اليومي</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold font-mono ${styles.titleText}`}>
              {progressPercentage}%
            </span>
            <span className={`text-xs ${styles.mutedText}`}>من الفروض الخمسة</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Obligatory Completed */}
        <div
          className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border space-y-2 ${
            styles.cardBg
          } ${styles.cardBorder} ${styles.cardShadow}`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold ${styles.mutedText}`}>الصلوات المكتملة</span>
            <CheckCircle2 className="w-4 h-4 text-teal-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold font-mono ${styles.accentText}`}>
              {completedObligatoryCount}
            </span>
            <span className={`text-xs ${styles.mutedText}`}>من أصل ٥ صلوات مفروضة</span>
          </div>
          <span className={`text-[11px] block font-mono ${styles.mutedText}`}>
            + {totalCompletedToday - completedObligatoryCount} صلاة نافلة وسنن رواتب
          </span>
        </div>

        {/* Spiritual Encouragement Card */}
        <div
          className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border space-y-2 ${
            styles.cardBg
          } ${styles.cardBorder} ${styles.cardShadow}`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold ${styles.mutedText}`}>فضل المحافظة</span>
            <Award className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold font-alexandria text-[#B68C1C] dark:text-[#F3E7C4]">
              {completedObligatoryCount === 5 ? "يوم مبارك تام الفروض ✨" : "«أحب الأعمال إلى الله الصلاة على وقتها»"}
            </span>
          </div>
          <span className={`text-[11px] block leading-relaxed ${styles.mutedText}`}>
            {completedObligatoryCount === 5
              ? "هنيئاً لك إتمام فرائض اليوم، تقبل الله صالح عملك ورزقك الثبات."
              : "استعن بالله وحافظ على صلواتك في وقتها تنل البركة والسكينة."}
          </span>
        </div>
      </div>

      {/* Prayers Check List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className={`font-bold text-sm sm:text-base font-alexandria ${styles.titleText}`}>
            صلوات اليوم ({selectedDate})
          </h3>
          <span className={`text-xs font-mono ${styles.mutedText}`}>
            انقر على زر الصلاة لتوثيق أدائها
          </span>
        </div>

        <div className="space-y-2.5">
          {defaultPrayers.map((prayer) => {
            const completed = isCompleted(prayer.id);
            const timeRecorded = getCompletionTime(prayer.id);
            const matchingApiTime = prayerTimesList.find((p) => p.id === prayer.id)?.time;

            return (
              <div
                key={prayer.id}
                onClick={() => handleTogglePrayer(prayer.id, prayer.nameAr)}
                className={`p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border flex items-center justify-between gap-3 cursor-pointer transition-all duration-300 active:scale-98 ${
                  completed
                    ? styles.isPaper
                      ? "bg-[#F5EDE0] border-[#8C5E24] shadow-sm"
                      : styles.isNight
                      ? "bg-[#061A14] border-emerald-500/50 shadow-sm"
                      : "bg-emerald-50/80 dark:bg-[#07241A] border-emerald-500/50 shadow-sm"
                    : `${styles.cardBg} ${styles.cardBorder} hover:border-emerald-500/30`
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center shrink-0 border transition-all ${
                      completed
                        ? "bg-emerald-600 border-emerald-400 text-white shadow-md scale-105"
                        : `${styles.innerBg} ${styles.innerBorder} ${styles.mutedText}`
                    }`}
                  >
                    {completed ? (
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className={`font-bold text-sm sm:text-base font-alexandria truncate ${styles.titleText}`}>
                        {prayer.nameAr}
                      </h4>
                      {prayer.isObligatory ? (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">
                          فرض
                        </span>
                      ) : (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#B68C1C] dark:text-[#F3E7C4] font-bold">
                          سنة
                        </span>
                      )}
                    </div>
                    <span className={`text-[11px] block mt-0.5 truncate ${styles.mutedText}`}>
                      {prayer.rakahs} • {prayer.sunnah}
                    </span>
                  </div>
                </div>

                <div className="text-left font-mono shrink-0">
                  <span className={`text-xs font-bold block ${styles.titleText}`}>
                    {matchingApiTime || prayer.defaultTime}
                  </span>
                  {completed ? (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">
                      ✓ أُدّيت
                    </span>
                  ) : (
                    <span className={`text-[10px] ${styles.mutedText} block`}>
                      لم تُسجل
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 7-Day Adherence History */}
      {weeklyStats.length > 0 && (
        <div className={`rounded-3xl p-5 sm:p-6 border space-y-4 ${styles.cardBg} ${styles.cardBorder} ${styles.cardShadow}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-500" />
              <h3 className={`font-bold text-sm sm:text-base font-alexandria ${styles.titleText}`}>
                سجل التزام الأسبوع الماضي
              </h3>
            </div>
            <span className={`text-xs font-mono ${styles.mutedText}`}>
              آخر ٧ أيام
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center">
            {weeklyStats.map((stat) => {
              const dayName = new Date(stat.date).toLocaleDateString("ar-EG", { weekday: "short" });
              const isSelected = stat.date === selectedDate;
              const completedOutOf5 = Math.min(stat.completedCount, 5);
              const heightPct = Math.max(15, (completedOutOf5 / 5) * 100);

              return (
                <div
                  key={stat.date}
                  onClick={() => setSelectedDate(stat.date)}
                  className={`p-2.5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? "ring-2 ring-emerald-500 border-emerald-500 bg-emerald-500/10"
                      : `${styles.innerBg} ${styles.innerBorder} hover:border-emerald-500/40`
                  }`}
                >
                  <span className={`text-[10px] block font-bold truncate ${styles.mutedText}`}>
                    {dayName}
                  </span>

                  <div className="h-16 flex items-end justify-center my-2">
                    <div
                      className="w-4 rounded-full bg-gradient-to-t from-emerald-600 to-teal-400 transition-all duration-300"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>

                  <span className={`text-[11px] font-mono font-bold block ${styles.titleText}`}>
                    {stat.completedCount}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
