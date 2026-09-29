import React, { useState, useEffect } from "react";
import {
  Bell,
  BellOff,
  Sun,
  Moon,
  Clock,
  Sparkles,
  Volume2,
  Mic,
  ShieldCheck,
  Check,
  Play,
  RotateCcw,
} from "lucide-react";
import {
  athkarNotificationService,
  AthkarNotificationSettings,
} from "../../services/athkarNotificationService";
import { soundEngine } from "../../utils/soundEngine";
import { speechEngine } from "../../utils/speechEngine";

interface Props {
  theme?: string;
}

export const AthkarNotificationSettingsCard: React.FC<Props> = ({ theme = "emerald" }) => {
  const [settings, setSettings] = useState<AthkarNotificationSettings>(() =>
    athkarNotificationService.getSettings()
  );
  const [permission, setPermission] = useState<string>(() =>
    athkarNotificationService.getPermissionStatus()
  );
  const [testSuccess, setTestSuccess] = useState<boolean>(false);

  useEffect(() => {
    const handleSettingsChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ settings: AthkarNotificationSettings }>;
      if (customEvent.detail?.settings) {
        setSettings(customEvent.detail.settings);
      }
    };

    window.addEventListener("noor-athkar-notification-changed", handleSettingsChange);
    return () => {
      window.removeEventListener("noor-athkar-notification-changed", handleSettingsChange);
    };
  }, []);

  const handleToggleMaster = () => {
    soundEngine.playTasbihClick();
    const result = athkarNotificationService.toggle();
    setSettings(athkarNotificationService.getSettings());
    if (result.isEnabled) {
      speechEngine.speak("تم تفعيل تنبيهات الأذكار اليومية.");
    } else {
      speechEngine.speak("تم إيقاف تنبيهات الأذكار.");
    }
  };

  const handleUpdate = (partial: Partial<AthkarNotificationSettings>) => {
    soundEngine.playTasbihClick();
    athkarNotificationService.saveSettings(partial);
    setSettings(athkarNotificationService.getSettings());
  };

  const handleRequestPermission = async () => {
    soundEngine.playTasbihClick();
    const result = await athkarNotificationService.requestPermission();
    setPermission(result);
  };

  const handleTriggerTest = (type: "morning" | "evening" | "sleep" | "periodic") => {
    soundEngine.playTasbihClick();
    athkarNotificationService.triggerTestAlert(type);
    setTestSuccess(true);
    setTimeout(() => setTestSuccess(false), 3000);
  };

  return (
    <div
      id="athkar-notification-settings-card"
      className="p-5 md:p-6 rounded-3xl bg-gradient-to-b from-white/80 via-white/50 to-white/90 dark:from-zinc-900/90 dark:via-zinc-900/70 dark:to-zinc-900/90 backdrop-blur-xl border border-black/5 dark:border-white/10 shadow-xl space-y-5 text-zinc-900 dark:text-zinc-100 transition-all"
    >
      {/* Header with Master Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-black/5 dark:border-white/10">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-sm ${
              settings.masterEnabled
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
            }`}
          >
            {settings.masterEnabled ? (
              <Bell className="w-5 h-5 animate-pulse" />
            ) : (
              <BellOff className="w-5 h-5" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-base md:text-lg flex items-center gap-2">
              <span>نظام التنبيهات الذكي للأذكار</span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                  settings.masterEnabled
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    : "bg-red-500/10 text-red-500 border-red-500/20"
                }`}
              >
                {settings.masterEnabled ? "مفعّل" : "متوقف"}
              </span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              تذكير في المواعيد المحددة للصباح والمساء والنوم والتسبيح
            </p>
          </div>
        </div>

        {/* Master Toggle Button */}
        <button
          id="btn-toggle-master-athkar-notifications"
          onClick={handleToggleMaster}
          className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-sm ${
            settings.masterEnabled
              ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20"
              : "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700"
          }`}
        >
          {settings.masterEnabled ? (
            <>
              <BellOff className="w-4 h-4" />
              <span>إيقاف جميع التنبيهات</span>
            </>
          ) : (
            <>
              <Bell className="w-4 h-4" />
              <span>تفعيل التنبيهات</span>
            </>
          )}
        </button>
      </div>

      {/* Voice Assistant Control Hint */}
      <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
        <Mic className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
        <p className="leading-relaxed">
          <strong className="font-bold">التحكم الصوتي عبر رفيق النور:</strong> يمكنك إيقاف
          التنبيهات أو تشغيلها في أي وقت بنطق أمر بسيط مثل:{" "}
          <span className="font-mono font-bold underline">«أوقف التنبيهات»</span> أو{" "}
          <span className="font-mono font-bold underline">«شغّل تنبيهات الأذكار»</span>.
        </p>
      </div>

      {/* Detailed Schedules Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Morning Athkar */}
        <div
          className={`p-3.5 rounded-2xl border transition-all ${
            settings.morningEnabled && settings.masterEnabled
              ? "bg-amber-500/[0.06] border-amber-500/30"
              : "bg-black/[0.02] dark:bg-white/[0.02] border-black/5 dark:border-white/5 opacity-70"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold">أذكار الصباح</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.morningEnabled}
                onChange={(e) => handleUpdate({ morningEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-zinc-300 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between gap-2 mt-2">
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">وقت التنبيه:</span>
            <input
              type="time"
              value={settings.morningTime}
              onChange={(e) => handleUpdate({ morningTime: e.target.value })}
              className="px-2 py-1 rounded-xl bg-white dark:bg-zinc-800 border border-black/10 dark:border-white/10 text-xs font-mono font-bold text-center"
            />
          </div>
        </div>

        {/* Evening Athkar */}
        <div
          className={`p-3.5 rounded-2xl border transition-all ${
            settings.eveningEnabled && settings.masterEnabled
              ? "bg-teal-500/[0.06] border-teal-500/30"
              : "bg-black/[0.02] dark:bg-white/[0.02] border-black/5 dark:border-white/5 opacity-70"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-teal-500" />
              <span className="text-xs font-bold">أذكار المساء</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.eveningEnabled}
                onChange={(e) => handleUpdate({ eveningEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-zinc-300 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between gap-2 mt-2">
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">وقت التنبيه:</span>
            <input
              type="time"
              value={settings.eveningTime}
              onChange={(e) => handleUpdate({ eveningTime: e.target.value })}
              className="px-2 py-1 rounded-xl bg-white dark:bg-zinc-800 border border-black/10 dark:border-white/10 text-xs font-mono font-bold text-center"
            />
          </div>
        </div>

        {/* Sleep Athkar */}
        <div
          className={`p-3.5 rounded-2xl border transition-all ${
            settings.sleepEnabled && settings.masterEnabled
              ? "bg-indigo-500/[0.06] border-indigo-500/30"
              : "bg-black/[0.02] dark:bg-white/[0.02] border-black/5 dark:border-white/5 opacity-70"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-bold">أذكار النوم</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.sleepEnabled}
                onChange={(e) => handleUpdate({ sleepEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-zinc-300 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between gap-2 mt-2">
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">وقت التنبيه:</span>
            <input
              type="time"
              value={settings.sleepTime}
              onChange={(e) => handleUpdate({ sleepTime: e.target.value })}
              className="px-2 py-1 rounded-xl bg-white dark:bg-zinc-800 border border-black/10 dark:border-white/10 text-xs font-mono font-bold text-center"
            />
          </div>
        </div>
      </div>

      {/* Auxiliary Settings: Sound, Voice Announcement & Periodic Dhikr */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        {/* Serene Chime sound */}
        <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-medium">نغمة التنبيه الهادئة</span>
          </div>
          <input
            type="checkbox"
            checked={settings.soundAlert}
            onChange={(e) => handleUpdate({ soundAlert: e.target.checked })}
            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
          />
        </div>

        {/* Voice Announcement */}
        <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-medium">النطق الصوتي الترحيبي</span>
          </div>
          <input
            type="checkbox"
            checked={settings.voiceAnnouncement}
            onChange={(e) => handleUpdate({ voiceAnnouncement: e.target.checked })}
            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
          />
        </div>

        {/* Periodic Dhikr */}
        <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-teal-500" />
            <span className="text-xs font-medium">تذكير الصلاة على النبي ﷺ</span>
          </div>
          <input
            type="checkbox"
            checked={settings.periodicEnabled}
            onChange={(e) => handleUpdate({ periodicEnabled: e.target.checked })}
            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Push Permission & Instant Test Toolbar */}
      <div className="pt-3 border-t border-black/5 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
        {/* Permission status badge */}
        <div className="flex items-center gap-2">
          {permission === "granted" ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>إشعارات المتصفح مفعلة</span>
            </span>
          ) : (
            <button
              onClick={handleRequestPermission}
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>طلب إذن إشعارات المتصفح والنظام</span>
            </button>
          )}
        </div>

        {/* Test Buttons */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">تجربة فورية:</span>
          <button
            onClick={() => handleTriggerTest("morning")}
            className="px-2.5 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-300 text-xs font-medium transition"
          >
            الصباح
          </button>
          <button
            onClick={() => handleTriggerTest("evening")}
            className="px-2.5 py-1 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-600 dark:text-teal-300 text-xs font-medium transition"
          >
            المساء
          </button>
          <button
            onClick={() => handleTriggerTest("sleep")}
            className="px-2.5 py-1 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-xs font-medium transition"
          >
            النوم
          </button>
        </div>
      </div>
    </div>
  );
};
