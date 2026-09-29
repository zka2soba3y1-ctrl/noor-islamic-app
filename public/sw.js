// public/sw.js
// Service Worker for Noor Islamic Application
// Handles Local Scheduled Prayer Notifications, Background Alerts, and Caching

const CACHE_NAME = "noor-pwa-cache-v1";
const PRAYER_NOTIFICATIONS_STORE = "noor_scheduled_prayers";

// Install event - activate immediately
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Stored timers in SW memory
let scheduledTimers = [];

function clearExistingTimers() {
  scheduledTimers.forEach((timerId) => clearTimeout(timerId));
  scheduledTimers = [];
}

/**
 * Schedule notifications for upcoming prayers
 */
function schedulePrayers(prayers, cityName = "مدينتك") {
  clearExistingTimers();
  const now = Date.now();

  prayers.forEach((prayer) => {
    const diff = prayer.targetTimestamp - now;
    if (diff > 0 && diff < 24 * 60 * 60 * 1000) {
      // Schedule timer for this prayer
      const timerId = setTimeout(() => {
        showPrayerNotification(prayer, cityName);
      }, diff);
      scheduledTimers.push(timerId);
    }
  });
}

/**
 * Display the rich prayer notification
 */
function showPrayerNotification(prayer, cityName) {
  const isJummah = new Date().getDay() === 5 && prayer.id === "dhuhr";
  const title = isJummah
    ? "حان الآن موعد صلاة الجمعة المباركة 🕌"
    : `حان الآن موعد صلاة ${prayer.nameAr} 🕌`;

  const body = prayer.id === "fajr"
    ? `«الصَّلَاةُ خَيْرٌ مِنَ النَّوْمِ» • موعد صلاة الفجر حسب توقيت ${cityName}. انقر لسماع الأذان وتحديد القبلة.`
    : `«إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَوْقُوتًا» • حان وقت صلاة ${prayer.nameAr} بتوقيت ${cityName}.`;

  const options = {
    body,
    icon: "https://i.ibb.co/sJ9F5mbb/1.png",
    badge: "https://i.ibb.co/sJ9F5mbb/1.png",
    tag: `prayer-notification-${prayer.id}-${new Date().toDateString()}`,
    renotify: true,
    requireInteraction: true,
    vibrate: [200, 100, 200, 100, 400],
    data: {
      url: "/",
      prayerId: prayer.id,
      prayerName: prayer.nameAr,
      timestamp: Date.now(),
      action: "adhan"
    },
    actions: [
      { action: "listen_adhan", title: "سماع الأذان 🔊" },
      { action: "open_app", title: "فتح التطبيق 🕌" }
    ]
  };

  self.registration.showNotification(title, options);
}

// Handle messages from the client
self.addEventListener("message", (event) => {
  const data = event.data;
  if (!data) return;

  if (data.type === "SCHEDULE_PRAYER_NOTIFICATIONS") {
    if (Array.isArray(data.prayers)) {
      schedulePrayers(data.prayers, data.cityName || "مدينتك");
    }
  } else if (data.type === "TEST_NOTIFICATION") {
    const testOptions = {
      body: `«أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ» • تم تفعيل التنبيهات بنجاح في ${data.cityName || "مدينتك"}. ستصلك الإشعارات في مواعيد الصلاة حتى لو كان التطبيق مغلقاً.`,
      icon: "https://i.ibb.co/sJ9F5mbb/1.png",
      badge: "https://i.ibb.co/sJ9F5mbb/1.png",
      tag: "test-prayer-notification",
      vibrate: [200, 100, 200],
      data: { url: "/", action: "test" },
      actions: [
        { action: "open_app", title: "فتح تطبيق النور 🕌" }
      ]
    };
    self.registration.showNotification("تطبيق النور • تجربة إشعار الصلاة المحلي 🔔", testOptions);
  } else if (data.type === "ATHKAR_ALERT") {
    const alertOptions = {
      body: data.body || "حان وقت أذكار اليوم المباركة",
      icon: "https://i.ibb.co/sJ9F5mbb/1.png",
      badge: "https://i.ibb.co/sJ9F5mbb/1.png",
      tag: `athkar-notification-${data.category || "daily"}-${Date.now()}`,
      vibrate: [200, 100, 200, 100, 300],
      dir: "rtl",
      data: {
        url: "/?tab=hisn_muslim",
        chapterId: data.chapterId || "morning_evening",
        action: "athkar",
      },
      actions: [
        { action: "read_now", title: "قراءة الأذكار 📖" },
        { action: "dismiss", title: "تم بحمد الله ✔️" },
      ],
    };
    self.registration.showNotification(data.title || "تذكير الأذكار المباركة 📿", alertOptions);
  }
});

// Handle clicking on notifications
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const clickData = event.notification.data || {};
  const isAdhanAction = event.action === "listen_adhan" || clickData.action === "adhan";
  const isAthkarAction = clickData.action === "athkar" || event.action === "read_now";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it
      for (const client of clientList) {
        if ("focus" in client) {
          client.focus();
          if (isAdhanAction) {
            client.postMessage({
              type: "PLAY_ADHAN_FROM_NOTIFICATION",
              prayerId: clickData.prayerId,
              prayerName: clickData.prayerName,
            });
          } else if (isAthkarAction) {
            client.postMessage({
              type: "NAVIGATE_TAB",
              tab: "hisn_muslim",
              chapterId: clickData.chapterId,
            });
          }
          return;
        }
      }
      // Otherwise open a new window
      if (self.clients.openWindow) {
        let targetUrl = "/";
        if (isAdhanAction) targetUrl = "/?action=adhan";
        else if (isAthkarAction) targetUrl = "/?tab=hisn_muslim";
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
