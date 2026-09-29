import React, { useState, useEffect } from "react";
import {
  Bell,
  BellRing,
  BellOff,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Send,
  Volume2,
  ShieldCheck,
  ChevronDown
} from "lucide-react";
import { prayerNotificationService, NotificationPermissionStatus } from "../../services/prayerNotificationService";
import { adhanService } from "../../services/adhanService";
import { soundEngine } from "../../utils/soundEngine";
import { speechEngine } from "../../utils/speechEngine";
import { ThemeMode } from "../../types";
import { getThemeStyles } from "../../utils/themeClasses";

interface Props {
  theme?: ThemeMode;
  cityName?: string;
}

export const LocalPrayerNotificationsCard: React.FC<Props> = ({
  theme = "natural",
  cityName = "مدينتك"
}) => {
  const styles = getThemeStyles(theme);

  const [permission, setPermission] = useState<NotificationPermissionStatus>("default");
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const [preAlertMins, setPreAlertMins] = useState<number>(0);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testSuccessMsg, setTestSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const status = prayerNotificationService.getPermissionStatus();
    setPermission(status);
    setIsEnabled(prayerNotificationService.isEnabled());
    setPreAlertMins(prayerNotificationService.getPreAlertMinutes());
  }, []);

  const handleRequestPermission = async () => {
    soundEngine.playTasbihClick();
    const result = await prayerNotificationService.requestPermission();
    setPermission(result);
    setIsEnabled(prayerNotificationService.isEnabled());

    if (result === "granted") {
      speechEngine.speak("تم تفعيل إشعارات الأذان المحلية بنجاح، ستصلك التنبيهات في مواعيد الصلاة حتى لو كان التطبيق مغلقاً.");
      setTestSuccessMsg("تم تفعيل الإشعارات بنجاح! تم إرسال إشعار تجريبي لجهازك.");
    } else if (result === "denied") {
      speechEngine.speak("تم رفض إذن الإشعارات من المتصفح. يمكنك تفعيله من إعدادات الموقع.");
    }
  };

  const handleToggle = () => {
    soundEngine.playTasbihClick();
    if (permission !== "granted") {
      handleRequestPermission();
      return;
    }
    const next = !isEnabled;
    setIsEnabled(next);
    prayerNotificationService.setEnabled(next);
    if (next) {
      speechEngine.speak("تم تفعيل إشعارات مواقيت الصلاة");
    } else {
      speechEngine.speak("تم إيقاف إشعارات مواقيت الصلاة مؤقتاً");
    }
  };

  const handlePreAlertChange = (mins: number) => {
    soundEngine.playTasbihClick();
    setPreAlertMins(mins);
    prayerNotificationService.setPreAlertMinutes(mins);
    speechEngine.speak(
      mins === 0
        ? "سيتم التنبيه في موعد الأذان تماماً"
        : `سيتم التنبيه قبل موعد الأذان بـ ${mins} دقائق`
    );
  };

  const handleSendTest = async () => {
    soundEngine.playTasbihClick();
    setIsTesting(true);
    setTestSuccessMsg(null);
    try {
      const ok = await prayerNotificationService.sendTestNotification();
      if (ok) {
        setTestSuccessMsg("تم إرسال الإشعار التجريبي بنجاح إلى شاشة جهازك 🔔");
        soundEngine.playGestureSuccess();
      } else {
        setTestSuccessMsg("يرجى السماح بالإشعارات في المتصفح لتجربة الإشعار");
      }
    } catch {
      setTestSuccessMsg("تعذر إرسال الإشعار التجريبي");
    } finally {
      setIsTesting(false);
      setTimeout(() => setTestSuccessMsg(null), 5000);
    }
  };

  return (
    <div
      id="local-prayer-notifications-card"
      className={`p-5 sm:p-6 rounded-2xl sm:rounded-3xl border transition-all ${styles.cardBg} ${styles.cardBorder} shadow-sm space-y-4`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-black/5 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md ${
              isEnabled && permission === "granted"
                ? "bg-gradient-to-tr from-emerald-600 to-teal-700 shadow-emerald-500/20"
                : "bg-zinc-700"
            }`}
          >
            {isEnabled && permission === "granted" ? (
              <BellRing className="w-5 h-5 animate-bounce" />
            ) : (
              <BellOff className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className={`text-base sm:text-lg font-black ${styles.titleText}`}>
                إشعارات مواقيت الصلاة المحلية
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                تعمل في الخلفية (SW)
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              تنبيهات فورية دقيقة على جهازك عند دخول وقت الأذان حتى في حالة إغلاق التطبيق
            </p>
          </div>
        </div>

        {/* Enable/Disable Toggle */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={handleToggle}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-2 cursor-pointer shadow-sm ${
              isEnabled && permission === "granted"
                ? "bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-700"
                : "bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10"
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>
              {permission !== "granted"
                ? "تفعيل الإذن والتنبيهات"
                : isEnabled
                ? "التنبيهات مفعلة 🟢"
                : "التنبيهات متوقفة ⚪"}
            </span>
          </button>
        </div>
      </div>

      {/* Permission warning if not granted */}
      {permission !== "granted" && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-between text-xs gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              {permission === "denied"
                ? "تم حظر إشعارات المتصفح، يرجى تفعيلها من إعدادات القفل في شريط المتصفح لتصلك مواعيد الصلاة."
                : "يحتاج التطبيق لإذن الإشعارات ليرسل لك تنبيهات الأذان عند إغلاق الشاشة."}
            </span>
          </div>
          {permission === "default" && (
            <button
              onClick={handleRequestPermission}
              className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold hover:bg-amber-700 transition whitespace-nowrap cursor-pointer"
            >
              منح الإذن الآن
            </button>
          )}
        </div>
      )}

      {/* Success feedback toast message */}
      {testSuccessMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{testSuccessMsg}</span>
        </div>
      )}

      {/* Controls & Options Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Pre-alert timing select */}
        <div className={`p-3 rounded-xl border ${styles.innerBg} ${styles.innerBorder} flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-bold text-slate-600 dark:text-zinc-300">
              موعد وصول التنبيه:
            </span>
          </div>
          <select
            value={preAlertMins}
            onChange={(e) => handlePreAlertChange(parseInt(e.target.value, 10))}
            className="text-xs font-bold bg-transparent text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-lg px-2.5 py-1 cursor-pointer focus:outline-none"
          >
            <option value={0} className="bg-zinc-900 text-white">في موعد الأذان تماماً</option>
            <option value={5} className="bg-zinc-900 text-white">قبل الأذان بـ 5 دقائق (للاستعداد)</option>
            <option value={10} className="bg-zinc-900 text-white">قبل الأذان بـ 10 دقائق</option>
            <option value={15} className="bg-zinc-900 text-white">قبل الأذان بـ 15 دقيقة</option>
          </select>
        </div>

        {/* Test Notification Trigger */}
        <div className={`p-3 rounded-xl border ${styles.innerBg} ${styles.innerBorder} flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-sky-500" />
            <span className="text-xs font-bold text-slate-600 dark:text-zinc-300">
              اختبار الإشعار المباشر:
            </span>
          </div>
          <button
            onClick={handleSendTest}
            disabled={isTesting}
            className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3 h-3" />
            <span>{isTesting ? "جاري الإرسال..." : "إرسال إشعار تجريبي"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
