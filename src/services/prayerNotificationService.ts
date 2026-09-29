/**
 * prayerNotificationService.ts
 * Robust Local Prayer Time Notifications Engine for Noor Islamic App
 * 
 * Supports:
 * - Native Web Notification API + Service Worker background scheduling
 * - Works even when the application/tab is closed or minimized
 * - Pre-alert options (at exact time, 5 mins before, 10 mins before)
 * - Automatic Adhan sound trigger and vibration patterns
 * - Full permission handling and instant test notifications
 */

import { adhanService } from "./adhanService";

export interface ScheduledPrayerAlert {
  id: string;
  nameAr: string;
  timeStr: string;
  targetTimestamp: number;
  isPreAlert?: boolean;
}

export type NotificationPermissionStatus = "granted" | "denied" | "default" | "unsupported";

class PrayerNotificationService {
  private isNotificationsEnabled: boolean = true;
  private preAlertMinutes: number = 0; // 0 = exact time, 5 = 5 mins before, 10 = 10 mins before
  private swRegistration: ServiceWorkerRegistration | null = null;
  private clientTimers: NodeJS.Timeout[] = [];
  private lastScheduledPrayers: ScheduledPrayerAlert[] = [];
  private currentCityName: string = "مدينتك";

  constructor() {
    this.init();
  }

  private async init() {
    if (typeof window === "undefined") return;

    // Load persisted preferences
    try {
      const savedEnabled = localStorage.getItem("noor_prayer_notifications_enabled");
      if (savedEnabled !== null) {
        this.isNotificationsEnabled = savedEnabled === "true";
      } else {
        this.isNotificationsEnabled = true; // Enabled by default
      }

      const savedPreAlert = localStorage.getItem("noor_prayer_pre_alert_min");
      if (savedPreAlert) {
        this.preAlertMinutes = parseInt(savedPreAlert, 10) || 0;
      }
    } catch (e) {
      console.warn("Could not load notification preferences:", e);
    }

    // Register Service Worker if supported
    if ("serviceWorker" in navigator) {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js");
        this.swRegistration = reg;
        console.log("[PrayerNotificationService] ServiceWorker registered successfully:", reg.scope);

        // Listen for messages from SW (e.g. adhan trigger when clicking notification)
        navigator.serviceWorker.addEventListener("message", (event) => {
          if (event.data?.type === "PLAY_ADHAN_FROM_NOTIFICATION") {
            adhanService.play({
              prayerName: event.data.prayerName,
              isAutoTrigger: true
            });
          }
        });
      } catch (err) {
        console.warn("[PrayerNotificationService] ServiceWorker registration error:", err);
      }
    }
  }

  /**
   * Check browser notification permission status
   */
  public getPermissionStatus(): NotificationPermissionStatus {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "unsupported";
    }
    return Notification.permission as NotificationPermissionStatus;
  }

  /**
   * Request notification permission from user
   */
  public async requestPermission(): Promise<NotificationPermissionStatus> {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "unsupported";
    }

    try {
      const result = await Notification.requestPermission();
      if (result === "granted") {
        this.setEnabled(true);
        // Dispatch test notification to confirm
        await this.sendTestNotification();
      }
      return result as NotificationPermissionStatus;
    } catch (err) {
      console.warn("Failed to request notification permission:", err);
      return "denied";
    }
  }

  /**
   * Enable or disable prayer notifications
   */
  public setEnabled(enabled: boolean) {
    this.isNotificationsEnabled = enabled;
    try {
      localStorage.setItem("noor_prayer_notifications_enabled", String(enabled));
    } catch {}

    if (!enabled) {
      this.clearClientTimers();
    } else {
      this.syncWithServiceWorker();
    }
  }

  public isEnabled(): boolean {
    return this.isNotificationsEnabled && this.getPermissionStatus() === "granted";
  }

  /**
   * Set pre-alert duration (0, 5, 10, 15 minutes)
   */
  public setPreAlertMinutes(mins: number) {
    this.preAlertMinutes = mins;
    try {
      localStorage.setItem("noor_prayer_pre_alert_min", String(mins));
    } catch {}
    this.syncWithServiceWorker();
  }

  public getPreAlertMinutes(): number {
    return this.preAlertMinutes;
  }

  private clearClientTimers() {
    this.clientTimers.forEach((t) => clearTimeout(t));
    this.clientTimers = [];
  }

  /**
   * Schedule upcoming prayers for today and tomorrow
   */
  public scheduleUpcomingPrayers(
    prayers: Array<{ id: string; nameAr: string; time: string; timestamp?: number }>,
    cityName: string = "مدينتك"
  ) {
    this.currentCityName = cityName;
    if (!this.isNotificationsEnabled || this.getPermissionStatus() !== "granted") {
      return;
    }

    this.clearClientTimers();
    const now = new Date();
    const scheduledList: ScheduledPrayerAlert[] = [];
    const validPrayers = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"];

    prayers.forEach((p) => {
      if (!validPrayers.includes(p.id)) return;

      const timeClean = p.time.replace(/[^\d:]/g, "").slice(0, 5);
      const [hoursStr, minsStr] = timeClean.split(":");
      if (!hoursStr || !minsStr) return;

      const hours = parseInt(hoursStr, 10);
      const mins = parseInt(minsStr, 10);

      // 1. Check today's time
      const todayPrayerDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, mins, 0, 0);
      
      // Exact time alert
      if (todayPrayerDate.getTime() > now.getTime()) {
        scheduledList.push({
          id: p.id,
          nameAr: p.nameAr,
          timeStr: timeClean,
          targetTimestamp: todayPrayerDate.getTime(),
          isPreAlert: false
        });
      }

      // Pre-alert if configured (e.g. 5 or 10 mins before)
      if (this.preAlertMinutes > 0) {
        const preAlertTimestamp = todayPrayerDate.getTime() - this.preAlertMinutes * 60 * 1000;
        if (preAlertTimestamp > now.getTime()) {
          scheduledList.push({
            id: `${p.id}_pre`,
            nameAr: p.nameAr,
            timeStr: timeClean,
            targetTimestamp: preAlertTimestamp,
            isPreAlert: true
          });
        }
      }

      // 2. Also schedule tomorrow's early prayers (Fajr)
      const tomorrowPrayerDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, hours, mins, 0, 0);
      scheduledList.push({
        id: `${p.id}_tomorrow`,
        nameAr: p.nameAr,
        timeStr: timeClean,
        targetTimestamp: tomorrowPrayerDate.getTime(),
        isPreAlert: false
      });
    });

    this.lastScheduledPrayers = scheduledList;

    // 1. Sync with Service Worker for background alerting when closed
    this.syncWithServiceWorker();

    // 2. Also set local in-page timeouts as a fail-safe fallback
    scheduledList.forEach((item) => {
      const delayMs = item.targetTimestamp - Date.now();
      if (delayMs > 0 && delayMs < 12 * 60 * 60 * 1000) {
        const timer = setTimeout(() => {
          this.triggerNotification(item, cityName);
        }, delayMs);
        this.clientTimers.push(timer);
      }
    });
  }

  private syncWithServiceWorker() {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.ready.then((reg) => {
      if (reg.active) {
        reg.active.postMessage({
          type: "SCHEDULE_PRAYER_NOTIFICATIONS",
          prayers: this.lastScheduledPrayers,
          cityName: this.currentCityName
        });
      }
    }).catch((e) => console.warn("SW sync error:", e));
  }

  /**
   * Trigger local notification in foreground/background
   */
  public triggerNotification(item: ScheduledPrayerAlert, cityName: string) {
    if (!this.isNotificationsEnabled || this.getPermissionStatus() !== "granted") {
      return;
    }

    const title = item.isPreAlert
      ? `اقتراب موعد صلاة ${item.nameAr} (${this.preAlertMinutes} دقائق متبقية) ⏳`
      : `حان الآن موعد صلاة ${item.nameAr} 🕌`;

    const body = item.isPreAlert
      ? `استعد للوضوء والصلاة، بقي ${this.preAlertMinutes} دقائق على موعد أذان ${item.nameAr} بتوقيت ${cityName}.`
      : `«إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَوْقُوتًا» • حان الآن وقت صلاة ${item.nameAr} حسب توقيت ${cityName}. تقبل الله طاعتكم.`;

    // 1. Try Service Worker showNotification first (native OS integration)
    if (this.swRegistration && "showNotification" in this.swRegistration) {
      this.swRegistration.showNotification(title, {
        body,
        icon: "https://i.ibb.co/sJ9F5mbb/1.png",
        badge: "https://i.ibb.co/sJ9F5mbb/1.png",
        tag: `prayer-alert-${item.id}`,
        vibrate: [200, 100, 200, 100, 400],
        renotify: true,
        data: { url: "/", prayerId: item.id, action: "adhan" }
      } as any).catch(() => {
        this.fallbackBrowserNotification(title, body);
      });
    } else {
      this.fallbackBrowserNotification(title, body);
    }

    // If exact prayer time and not pre-alert, play Adhan audio
    if (!item.isPreAlert && item.id !== "sunrise") {
      adhanService.play({
        prayerName: item.nameAr,
        isAutoTrigger: true
      });
    }
  }

  private fallbackBrowserNotification(title: string, body: string) {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      try {
        const notif = new Notification(title, {
          body,
          icon: "https://i.ibb.co/sJ9F5mbb/1.png",
          badge: "https://i.ibb.co/sJ9F5mbb/1.png",
          tag: "prayer-alert-fallback"
        });
        notif.onclick = () => {
          window.focus();
          notif.close();
        };
      } catch (err) {
        console.warn("Fallback Notification error:", err);
      }
    }
  }

  /**
   * Send an instant test notification to prove it works
   */
  public async sendTestNotification(): Promise<boolean> {
    const status = this.getPermissionStatus();
    if (status !== "granted") {
      const requested = await this.requestPermission();
      if (requested !== "granted") return false;
    }

    if ("serviceWorker" in navigator) {
      try {
        const reg = await navigator.serviceWorker.ready;
        if (reg.active) {
          reg.active.postMessage({
            type: "TEST_NOTIFICATION",
            cityName: this.currentCityName
          });
          return true;
        }
      } catch {}
    }

    // Fallback if SW not ready
    this.fallbackBrowserNotification(
      "تطبيق النور • تجربة إشعار الصلاة المحلي 🔔",
      `«أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ» • تم تفعيل التنبيهات بنجاح في ${this.currentCityName}. ستصلك الإشعارات في مواعيد الصلاة حتى لو كان التطبيق مغلقاً.`
    );
    return true;
  }

  public getLastScheduledPrayers(): ScheduledPrayerAlert[] {
    return this.lastScheduledPrayers;
  }
}

export const prayerNotificationService = new PrayerNotificationService();
