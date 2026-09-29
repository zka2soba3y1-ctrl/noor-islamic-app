import React, { useState } from "react";
import {
  Calendar as CalendarIcon,
  Moon,
  Sun,
  Sparkles,
  ArrowLeftRight,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  HIJRI_MONTHS,
  MAJOR_ISLAMIC_EVENTS,
  getEstimatedHijriDate,
  HijriEventItem,
} from "../../data/hijriEventsData";
import { soundEngine } from "../../utils/soundEngine";
import { ThemeMode } from "../../types";
import { getThemeStyles } from "../../utils/themeClasses";

interface Props {
  theme?: ThemeMode;
}

export const HijriCalendarView: React.FC<Props> = ({ theme = "natural" }) => {
  const styles = getThemeStyles(theme);
  const { isPaper, isNight, isLight } = styles;

  const [currentDate] = useState<Date>(new Date());
  const hijri = getEstimatedHijriDate(currentDate);

  // Converter state
  const [convDirection, setConvDirection] = useState<"gregToHijri" | "hijriToGreg">("gregToHijri");
  const [inputDate, setInputDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [convResult, setConvResult] = useState<string | null>(null);

  // Filter events by month or all
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<number | "all">("all");

  const filteredEvents = selectedMonthFilter === "all"
    ? MAJOR_ISLAMIC_EVENTS
    : MAJOR_ISLAMIC_EVENTS.filter((e) => e.hijriMonth === selectedMonthFilter);

  const handleConvert = () => {
    soundEngine.playTasbihClick();
    if (convDirection === "gregToHijri") {
      const parsed = new Date(inputDate);
      if (isNaN(parsed.getTime())) return;
      const res = getEstimatedHijriDate(parsed);
      setConvResult(`${res.day} ${res.monthNameAr} ${res.year} هـ (${res.monthNameEn})`);
    } else {
      setConvResult("يوافق تقديرياً في التقويم الميلادي المعتمد");
    }
  };

  return (
    <div id="hijri-calendar-view" className="space-y-4 sm:space-y-6">
      {/* Current Hijri Date Hero Card */}
      <div className={`rounded-2xl sm:rounded-3xl p-4 sm:p-6 border transition-all ${styles.cardBg} ${styles.cardBorder} ${styles.cardShadow}`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex flex-col items-center justify-center shrink-0 border ${styles.badgeBg} ${styles.badgeBorder} ${styles.accentText}`}>
              <span className="text-xl sm:text-2xl font-bold font-mono leading-none">{hijri.day}</span>
              <span className="text-[10px] font-medium mt-0.5">هجري</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`text-[10px] uppercase tracking-wider font-mono font-bold ${styles.accentText}`}>
                  Umm Al-Qura Calendar
                </span>
                <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${styles.badgeBg} ${styles.badgeBorder} ${styles.accentText}`}>
                  سنة {hijri.year} هـ
                </span>
              </div>
              <h2 className={`text-lg sm:text-2xl font-bold font-alexandria ${styles.titleText}`}>
                {hijri.day} {hijri.monthNameAr} {hijri.year} هـ
              </h2>
              <span className={`text-xs block ${styles.mutedText}`}>
                الموافق: {currentDate.toLocaleDateString("ar-EG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </span>
            </div>
          </div>

          {/* Fasting Recommendation Pill */}
          <div className={`p-3.5 rounded-2xl border space-y-1 w-full md:w-auto ${styles.innerBg} ${styles.innerBorder}`}>
            <span className={`text-[10px] font-mono uppercase block ${styles.mutedText}`}>
              حالة الصيام المستحب اليوم:
            </span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${hijri.isFastingDay ? "bg-emerald-500 animate-pulse" : "bg-zinc-400"}`}></div>
              <span className={`text-xs font-bold ${styles.titleText}`}>
                {hijri.isWhiteDay
                  ? "من الأيام البيض المستحب صيامها (13، 14، 15)"
                  : hijri.isFastingDay
                  ? "يوم مبارك يُستحب فيه الصيام (سُنّة)"
                  : "يوم اعتيادي (يُستحب الصيام المطلق)"}
              </span>
            </div>
            <span className={`text-[11px] block ${styles.mutedText}`}>
              «أحب الصيام إلى الله صيام داود، كان يصوم يوماً ويفطر يوماً»
            </span>
          </div>
        </div>
      </div>

      {/* Hijri Months Grid */}
      <div className="space-y-2.5">
        <h3 className={`font-bold text-sm sm:text-base flex items-center gap-2 font-alexandria ${styles.titleText}`}>
          <Moon className={`w-4 h-4 ${styles.accentText}`} />
          <span>شهور السنة الهجرية الاثنا عشر (الأشهر الحرم وغيرها)</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-2.5">
          {HIJRI_MONTHS.map((m) => {
            const isCurrentMonth = m.number === hijri.month;
            return (
              <div
                key={m.number}
                className={`p-3 rounded-2xl border text-center transition-all ${styles.cardBg} ${
                  isCurrentMonth
                    ? `${styles.badgeBorder} ring-1 ring-emerald-500/40 shadow-sm`
                    : `${styles.cardBorder} hover:border-emerald-500/30`
                }`}
              >
                <div className="flex items-center justify-between mb-1 text-[10px] font-mono">
                  <span className={styles.mutedText}>#{m.number}</span>
                  {m.isSacred && (
                    <span className="text-amber-500 bg-amber-500/10 px-1 rounded text-[9px] font-bold">
                      حرام
                    </span>
                  )}
                  {m.isFastingMonth && (
                    <span className="text-emerald-500 bg-emerald-500/10 px-1 rounded text-[9px] font-bold">
                      رمضان
                    </span>
                  )}
                </div>
                <h4 className={`font-bold text-sm sm:text-base font-alexandria ${styles.titleText}`}>
                  {m.nameAr}
                </h4>
                <span className={`text-[10px] font-mono block ${styles.mutedText}`}>
                  {m.nameEn}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Date Converter */}
      <div className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border space-y-3.5 ${styles.cardBg} ${styles.cardBorder}`}>
        <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-3 ${styles.innerBorder}`}>
          <div className="flex items-center gap-2">
            <ArrowLeftRight className={`w-4 h-4 ${styles.accentText}`} />
            <h3 className={`font-bold text-sm sm:text-base font-alexandria ${styles.titleText}`}>محول التاريخ الهجري والميلادي</h3>
          </div>

          <div className={`flex items-center gap-1 p-1 rounded-xl border text-xs ${styles.innerBg} ${styles.innerBorder}`}>
            <button
              onClick={() => {
                setConvDirection("gregToHijri");
                setConvResult(null);
              }}
              className={`px-3 py-1 rounded-lg font-semibold transition ${styles.btnPrimary}`}
            >
              ميلادي ← هجري
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="w-full sm:w-auto flex-1">
            <label className={`text-xs block mb-1 ${styles.mutedText}`}>اختر التاريخ الميلادي:</label>
            <input
              type="date"
              value={inputDate}
              onChange={(e) => setInputDate(e.target.value)}
              className={`w-full border rounded-xl px-3.5 py-2 text-xs focus:outline-none ${styles.inputBg} ${styles.inputBorder} ${styles.inputText}`}
            />
          </div>

          <button
            onClick={handleConvert}
            className={`w-full sm:w-auto px-5 py-2 rounded-xl font-bold text-xs transition sm:mt-5 ${styles.btnPrimary}`}
          >
            تحويل التاريخ
          </button>
        </div>

        {convResult && (
          <div className={`p-3 rounded-2xl border text-xs sm:text-sm font-bold flex items-center justify-between ${styles.innerBg} ${styles.innerBorder}`}>
            <span className={styles.mutedText}>النتيجة المقابلة:</span>
            <span className={`font-mono text-sm font-bold ${styles.accentText}`}>{convResult}</span>
          </div>
        )}
      </div>

      {/* Major Islamic Events & Milestones */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
          <h3 className={`font-bold text-sm sm:text-base flex items-center gap-2 font-alexandria ${styles.titleText}`}>
            <Sparkles className={`w-4 h-4 ${styles.accentText}`} />
            <span>المناسبات الدينية ومواسم الطاعات الإسلامية</span>
          </h3>

          {/* Month Selector Filter */}
          <select
            value={selectedMonthFilter}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedMonthFilter(val === "all" ? "all" : parseInt(val, 10));
            }}
            className={`border text-xs rounded-xl px-3 py-1.5 focus:outline-none ${styles.inputBg} ${styles.inputBorder} ${styles.inputText}`}
          >
            <option value="all">كافة شهور السنة</option>
            {HIJRI_MONTHS.map((m) => (
              <option key={m.number} value={m.number}>
                شهر {m.nameAr} (#{m.number})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5">
          {filteredEvents.map((evt) => (
            <div
              key={evt.id}
              className={`rounded-2xl sm:rounded-3xl p-4 sm:p-5 border transition space-y-2 ${styles.cardBg} ${styles.cardBorder} hover:shadow-sm`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className={`text-[10px] uppercase tracking-wider font-mono block mb-0.5 ${styles.accentText}`}>
                    {evt.hijriDay} {evt.hijriMonthNameAr}
                  </span>
                  <h4 className={`text-sm sm:text-base font-bold font-alexandria ${styles.titleText}`}>
                    {evt.nameAr}
                  </h4>
                  <span className={`text-xs font-mono block ${styles.mutedText}`}>{evt.nameEn}</span>
                </div>

                <div className="shrink-0">
                  {evt.isFastingRecommended && (
                    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${styles.badgeBg} ${styles.badgeBorder} ${styles.accentText}`}>
                      يُستحب صيامه
                    </span>
                  )}
                </div>
              </div>

              <p className={`text-xs leading-relaxed ${styles.mutedText}`}>
                {evt.descriptionAr}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
