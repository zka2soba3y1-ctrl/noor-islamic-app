/**
 * athkarNotificationService.ts
 * Smart In-App and Push Notification Engine for Noor Islamic App
 * 
 * Manages:
 * - In-app visual alerts (banners, toast, audio chimes, haptics)
 * - Native browser Web Push notifications with Service Worker support
 * - Precise time scheduling for Morning, Evening, and Sleep Athkar
 * - Periodic remembrance reminders (e.g. Salawat on the Prophet ﷺ)
 * - Complete programmatic control via AI Voice Companion (رفيق النور)
 */

import { soundEngine } from "../utils/soundEngine";
import { speechEngine } from "../utils/speechEngine";

export interface AthkarNotificationSettings {
  masterEnabled: boolean;
  morningEnabled: boolean;
  morningTime: string; // e.g. "06:30"
  eveningEnabled: boolean;
  eveningTime: string; // e.g. "17:00"
  sleepEnabled: boolean;
  sleepTime: string;   // e.g. "22:30"
  periodicEnabled: boolean;
  periodicIntervalMins: number; // e.g. 120
  soundAlert: boolean;
  voiceAnnouncement: boolean;
}

export type NotificationPermissionStatus =
  | "default"
  | "denied"
  | "granted"
  | "unsupported";

export interface InAppAthkarAlert {
  id: string;
  type: "morning" | "evening" | "sleep" | "periodic" | "test";
  title: string;
  subtitle: string;
  thikrSnippet: string;
  chapterId: string;
  timestamp: number;
}

const STORAGE_KEY = "noor_athkar_notification_settings";
const TRIGGER_DATES_KEY = "noor_athkar_notification_triggers";

const DEFAULT_SETTINGS: AthkarNotificationSettings = {
  masterEnabled: true,
  morningEnabled: true,
  morningTime: "06:30",
  eveningEnabled: true,
  eveningTime: "17:00",
  sleepEnabled: true,
  sleepTime: "22:30",
  periodicEnabled: true,
  periodicIntervalMins: 120,
  soundAlert: true,
  voiceAnnouncement: true,
};

class AthkarNotificationService {
  private settings: AthkarNotificationSettings = { ...DEFAULT_SETTINGS };
  private activeAlert: InAppAthkarAlert | null = null;
  private checkInterval: NodeJS.Timeout | null = null;
  private snoozedAlerts: { [type: string]: number } = {}; // type -> timestamp until snoozed
  private swRegistration: ServiceWorkerRegistration | null = null;

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === "undefined") return;

    // 1. Load persisted settings
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn("Could not load Athkar notification settings:", e);
    }

    // 2. Register Service Worker reference if available
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg) this.swRegistration = reg;
      });
    }

    // 3. Start background checker loop
    this.startChecker();
  }

  public getSettings(): AthkarNotificationSettings {
    return { ...this.settings };
  }

  public getActiveAlert(): InAppAthkarAlert | null {
    return this.activeAlert;
  }

  public saveSettings(newSettings: Partial<AthkarNotificationSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
    } catch (e) {
      console.warn("Could not save Athkar notification settings:", e);
    }
    this.broadcastChange();
  }

  private broadcastChange() {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("noor-athkar-notification-changed", {
          detail: { settings: this.getSettings() },
        })
      );
    }
  }

  // ==========================================
  // AI VOICE COMPANION (رفيق النور) CONTROLS
  // ==========================================

  /**
   * Disable all Athkar notifications (called by Voice Companion command)
   */
  public disableAll(): { success: boolean; messageAr: string } {
    this.saveSettings({ masterEnabled: false });
    this.dismissAlert();
    return {
      success: true,
      messageAr:
        "أبشر يا غالي، تم إيقاف تنبيهات الأذكار بالكامل. لن يزعجك أي إشعار، ويمكنك إعادة تفعيلها بأي وقت عبر قول 'شغّل التنبيهات' أو من إعدادات الأذكار.",
    };
  }

  /**
   * Enable all Athkar notifications (called by Voice Companion command)
   */
  public enableAll(): { success: boolean; messageAr: string } {
    this.saveSettings({ masterEnabled: true });
    return {
      success: true,
      messageAr:
        "تم تفعيل تنبيهات الأذكار بنجاح! سنقوم بتذكيرك بأذكار الصباح والمساء والنوم في أوقاتها المباركة إن شاء الله.",
    };
  }

  /**
   * Toggle master Athkar notifications switch
   */
  public toggle(): { isEnabled: boolean; messageAr: string } {
    const nextState = !this.settings.masterEnabled;
    this.saveSettings({ masterEnabled: nextState });
    if (!nextState) {
      this.dismissAlert();
      return {
        isEnabled: false,
        messageAr: "تم إيقاف تنبيهات الأذكار بناءً على طلبك.",
      };
    }
    return {
      isEnabled: true,
      messageAr: "تم تفعيل تنبيهات الأذكار بنجاح.",
    };
  }

  /**
   * Disable a specific category (e.g. morning, evening, sleep)
   */
  public disableTarget(
    target: "morning" | "evening" | "sleep" | "periodic"
  ): { success: boolean; messageAr: string } {
    if (target === "morning") {
      this.saveSettings({ morningEnabled: false });
      return { success: true, messageAr: "تم إيقاف تنبيه أذكار الصباح." };
    } else if (target === "evening") {
      this.saveSettings({ eveningEnabled: false });
      return { success: true, messageAr: "تم إيقاف تنبيه أذكار المساء." };
    } else if (target === "sleep") {
      this.saveSettings({ sleepEnabled: false });
      return { success: true, messageAr: "تم إيقاف تنبيه أذكار النوم." };
    } else {
      this.saveSettings({ periodicEnabled: false });
      return { success: true, messageAr: "تم إيقاف التذكير الدوري بالصلاة على النبي ﷺ." };
    }
  }

  /**
   * Enable a specific category (e.g. morning, evening, sleep)
   */
  public enableTarget(
    target: "morning" | "evening" | "sleep" | "periodic"
  ): { success: boolean; messageAr: string } {
    if (target === "morning") {
      this.saveSettings({ masterEnabled: true, morningEnabled: true });
      return { success: true, messageAr: "تم تفعيل تنبيه أذكار الصباح في الساعة " + this.settings.morningTime + "." };
    } else if (target === "evening") {
      this.saveSettings({ masterEnabled: true, eveningEnabled: true });
      return { success: true, messageAr: "تم تفعيل تنبيه أذكار المساء في الساعة " + this.settings.eveningTime + "." };
    } else if (target === "sleep") {
      this.saveSettings({ masterEnabled: true, sleepEnabled: true });
      return { success: true, messageAr: "تم تفعيل تنبيه أذكار النوم في الساعة " + this.settings.sleepTime + "." };
    } else {
      this.saveSettings({ masterEnabled: true, periodicEnabled: true });
      return { success: true, messageAr: "تم تفعيل التذكير الدوري بالصلاة على النبي ﷺ." };
    }
  }

  /**
   * Get verbal and human-friendly status summary for AI companion
   */
  public getStatusSummary(): {
    isEnabled: boolean;
    summaryText: string;
    activeRemindersCount: number;
  } {
    if (!this.settings.masterEnabled) {
      return {
        isEnabled: false,
        summaryText: "تنبيهات الأذكار معطلة حالياً. يمكنك تفعيلها في أي وقت.",
        activeRemindersCount: 0,
      };
    }

    const activeList: string[] = [];
    if (this.settings.morningEnabled) activeList.push(`الصباح (${this.settings.morningTime})`);
    if (this.settings.eveningEnabled) activeList.push(`المساء (${this.settings.eveningTime})`);
    if (this.settings.sleepEnabled) activeList.push(`النوم (${this.settings.sleepTime})`);
    if (this.settings.periodicEnabled) activeList.push("التسبيح الدوري");

    const summaryText =
      activeList.length > 0
        ? `تنبيهات الأذكار مفعلة لمواعيد: ${activeList.join("، ")}.`
        : "تنبيهات الأذكار مفعلة كإعداد عام ولكن جميع الأبواب الفرعية متوقفة.";

    return {
      isEnabled: true,
      summaryText,
      activeRemindersCount: activeList.length,
    };
  }

  // ==========================================
  // SCHEDULER & CHECKER ENGINE
  // ==========================================

  private startChecker() {
    if (this.checkInterval) clearInterval(this.checkInterval);

    // Check every 15 seconds
    this.checkInterval = setInterval(() => {
      this.performScheduleCheck();
    }, 15000);
  }

  private getTriggerHistory(): { [key: string]: string } {
    try {
      const stored = localStorage.getItem(TRIGGER_DATES_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  private saveTriggerHistory(history: { [key: string]: string }) {
    try {
      localStorage.setItem(TRIGGER_DATES_KEY, JSON.stringify(history));
    } catch {}
  }

  private performScheduleCheck() {
    if (!this.settings.masterEnabled) return;

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const currentHours = String(now.getHours()).padStart(2, "0");
    const currentMins = String(now.getMinutes()).padStart(2, "0");
    const currentTimeStr = `${currentHours}:${currentMins}`;
    const currentTimestamp = now.getTime();

    const history = this.getTriggerHistory();

    // 1. Morning Athkar
    if (
      this.settings.morningEnabled &&
      currentTimeStr === this.settings.morningTime &&
      history.morning !== todayStr &&
      (!this.snoozedAlerts.morning || currentTimestamp > this.snoozedAlerts.morning)
    ) {
      this.triggerAlert({
        id: `morning-${todayStr}`,
        type: "morning",
        title: "حان وقت أذكار الصباح المباركة 🌅",
        subtitle: "«أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ»",
        thikrSnippet:
          "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.",
        chapterId: "morning_evening",
        timestamp: currentTimestamp,
      });
      history.morning = todayStr;
      this.saveTriggerHistory(history);
      delete this.snoozedAlerts.morning;
      return;
    }

    // 2. Evening Athkar
    if (
      this.settings.eveningEnabled &&
      currentTimeStr === this.settings.eveningTime &&
      history.evening !== todayStr &&
      (!this.snoozedAlerts.evening || currentTimestamp > this.snoozedAlerts.evening)
    ) {
      this.triggerAlert({
        id: `evening-${todayStr}`,
        type: "evening",
        title: "حان موعد أذكار المساء وحفظ اليوم 🌇",
        subtitle: "«أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ»",
        thikrSnippet:
          "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.",
        chapterId: "morning_evening",
        timestamp: currentTimestamp,
      });
      history.evening = todayStr;
      this.saveTriggerHistory(history);
      delete this.snoozedAlerts.evening;
      return;
    }

    // 3. Sleep Athkar
    if (
      this.settings.sleepEnabled &&
      currentTimeStr === this.settings.sleepTime &&
      history.sleep !== todayStr &&
      (!this.snoozedAlerts.sleep || currentTimestamp > this.snoozedAlerts.sleep)
    ) {
      this.triggerAlert({
        id: `sleep-${todayStr}`,
        type: "sleep",
        title: "أذكار النوم وتحصين الليل 🌙",
        subtitle: "«بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي وَبِكَ أَرْفَعُهُ»",
        thikrSnippet:
          "بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي، وَبِكَ أَرْفَعُهُ، فَإِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ.",
        chapterId: "waking_sleep",
        timestamp: currentTimestamp,
      });
      history.sleep = todayStr;
      this.saveTriggerHistory(history);
      delete this.snoozedAlerts.sleep;
      return;
    }

    // 4. Periodic Dhikr reminder (e.g. every 120 minutes)
    if (this.settings.periodicEnabled) {
      const lastPeriodic = parseInt(history.periodic || "0", 10);
      const intervalMs = (this.settings.periodicIntervalMins || 120) * 60 * 1000;
      if (
        currentTimestamp - lastPeriodic > intervalMs &&
        (!this.snoozedAlerts.periodic || currentTimestamp > this.snoozedAlerts.periodic)
      ) {
        this.triggerAlert({
          id: `periodic-${currentTimestamp}`,
          type: "periodic",
          title: "تذكير بطيب الذكر والصلاة على النبي ﷺ 📿",
          subtitle: "«أَلاَ بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ»",
          thikrSnippet:
            "اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى نَبِيِّنَا مُحَمَّدٍ، سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ.",
          chapterId: "virtues_tasbih",
          timestamp: currentTimestamp,
        });
        history.periodic = String(currentTimestamp);
        this.saveTriggerHistory(history);
        delete this.snoozedAlerts.periodic;
      }
    }
  }

  // ==========================================
  // ALERT DISPATCH & PRESENTATION
  // ==========================================

  public triggerAlert(alert: InAppAthkarAlert) {
    this.activeAlert = alert;

    // 1. Play serene chime and haptic feedback
    if (this.settings.soundAlert) {
      soundEngine.playAthkarNotificationChime();
    }
    soundEngine.playAthkarAlertHaptic(alert.type);

    // 2. Spoken voice announcement if enabled
    if (this.settings.voiceAnnouncement) {
      try {
        let announcement = "";
        if (alert.type === "morning") {
          announcement = "حان الآن موعد أذكار الصباح المباركة، أصبحنا وأصبح الملك لله.";
        } else if (alert.type === "evening") {
          announcement = "حان الآن موعد أذكار المساء، أمسينا وأمسى الملك لله.";
        } else if (alert.type === "sleep") {
          announcement = "طابت ليلتكم، حان وقت أذكار النوم والتحصين.";
        } else {
          announcement = "تذكير طيب: صلّ على النبي محمد ﷺ واذكر الله.";
        }
        speechEngine.speak(announcement);
      } catch (e) {
        console.warn("Speech announcement error:", e);
      }
    }

    // 3. Dispatch In-App Window Event for global UI Banner
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("noor-in-app-athkar-alert", {
          detail: { alert },
        })
      );
    }

    // 4. Send Native Web Notification if supported & permitted
    this.sendNativePushNotification(alert);
  }

  private sendNativePushNotification(alert: InAppAthkarAlert) {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    const title = alert.title;
    const body = `${alert.subtitle}\n${alert.thikrSnippet.substring(0, 100)}...`;

    // Try Service Worker first
    if (this.swRegistration && "showNotification" in this.swRegistration) {
      this.swRegistration
        .showNotification(title, {
          body,
          icon: "https://i.ibb.co/sJ9F5mbb/1.png",
          badge: "https://i.ibb.co/sJ9F5mbb/1.png",
          tag: `athkar-${alert.type}-${new Date().toDateString()}`,
          vibrate: [200, 100, 200, 100, 300],
          data: {
            url: "/?tab=hisn_muslim",
            chapterId: alert.chapterId,
            action: "athkar",
          },
          actions: [
            { action: "read_now", title: "قراءة الآن 📖" },
            { action: "dismiss", title: "تم بحمد الله ✔️" },
          ],
        } as any)
        .catch(() => {
          this.fallbackBrowserNotification(title, body, alert.chapterId);
        });
    } else {
      this.fallbackBrowserNotification(title, body, alert.chapterId);
    }
  }

  private fallbackBrowserNotification(title: string, body: string, chapterId: string) {
    try {
      const notif = new Notification(title, {
        body,
        icon: "https://i.ibb.co/sJ9F5mbb/1.png",
        tag: "athkar-fallback",
        dir: "rtl",
      });
      notif.onclick = () => {
        window.focus();
        window.dispatchEvent(
          new CustomEvent("noor-open-hisn-chapter", {
            detail: { chapterId },
          })
        );
        notif.close();
      };
    } catch (e) {
      console.warn("Fallback notification error:", e);
    }
  }

  /**
   * Request browser notification permission
   */
  public async requestPermission(): Promise<NotificationPermissionStatus> {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "unsupported" as NotificationPermissionStatus;
    }
    try {
      const result = await Notification.requestPermission();
      if (result === "granted") {
        this.triggerTestAlert("morning");
      }
      return result as NotificationPermissionStatus;
    } catch {
      return "denied" as NotificationPermissionStatus;
    }
  }

  public getPermissionStatus(): NotificationPermissionStatus {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "unsupported" as NotificationPermissionStatus;
    }
    return Notification.permission as NotificationPermissionStatus;
  }

  // ==========================================
  // DISMISS & SNOOZE ACTIONS
  // ==========================================

  public dismissAlert() {
    this.activeAlert = null;
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("noor-dismiss-athkar-alert"));
    }
  }

  public snooze(type: string, minutes: number = 15) {
    const snoozeUntil = Date.now() + minutes * 60 * 1000;
    this.snoozedAlerts[type] = snoozeUntil;
    this.dismissAlert();
    soundEngine.playTasbihClick();
  }

  /**
   * Trigger an instant live test alert
   */
  public triggerTestAlert(type: "morning" | "evening" | "sleep" | "periodic" = "morning") {
    let title = "تجربة تنبيه أذكار الصباح 🌅";
    let subtitle = "«أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ»";
    let thikrSnippet =
      "أَصْبَحْنَا عَلَى فِطْرَةِ الإِسْلاَمِ، وَعَلَى كَلِمَةِ الإِخْلاَصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ.";
    let chapterId = "morning_evening";

    if (type === "evening") {
      title = "تجربة تنبيه أذكار المساء 🌇";
      subtitle = "«أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ»";
      thikrSnippet =
        "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ رَبِّ الْعَالَمِينَ، اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ هَذِهِ اللَّيْلَةِ فَتْحَهَا وَنَصْرَهَا وَنُورَهَا وَبَرَكَتَهَا.";
    } else if (type === "sleep") {
      title = "تجربة تنبيه أذكار النوم 🌙";
      subtitle = "«بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي»";
      thikrSnippet =
        "اللَّهُمَّ خَلَقْتَ نَفْسِي وَأَنْتَ تَوَفَّاهَا، لَكَ مَمَاتُهَا وَمَحْيَاهَا، إِنْ أَحْيَيْتَهَا فَاحْفَظْهَا، وَإِنْ أَمَتَّهَا فَاغْفِرْ لَهَا.";
      chapterId = "waking_sleep";
    }

    this.triggerAlert({
      id: `test-${Date.now()}`,
      type,
      title,
      subtitle,
      thikrSnippet,
      chapterId,
      timestamp: Date.now(),
    });
  }
}

export const athkarNotificationService = new AthkarNotificationService();
