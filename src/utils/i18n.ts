/**
 * Noor Multilingual Support System (i18n)
 * Supports: Arabic (ar - Default), English (en), French (fr), Urdu (ur)
 * Preserves authentic Arabic text for Quran, Hadith, and Athkar while providing full UI localization.
 */

export type SupportedLanguage = "ar" | "en" | "fr" | "ur";

export interface LanguageMeta {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  dir: "rtl" | "ltr";
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  {
    code: "ar",
    name: "Arabic",
    nativeName: "العربية",
    dir: "rtl",
    flag: "🇸🇦",
  },
  {
    code: "en",
    name: "English",
    nativeName: "English",
    dir: "ltr",
    flag: "🇬🇧",
  },
  {
    code: "fr",
    name: "French",
    nativeName: "Français",
    dir: "ltr",
    flag: "🇫🇷",
  },
  {
    code: "ur",
    name: "Urdu",
    nativeName: "اردو",
    dir: "rtl",
    flag: "🇵🇰",
  },
];

export const TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  ar: {
    // Navigation & Modes
    "nav.visual": "المرئي",
    "nav.sensory": "البصيرة",
    "nav.blueprint": "الخطة",
    "nav.developer": "المطور",
    "nav.companion": "الرفيق",
    "nav.install": "تثبيت",
    "nav.home": "الرئيسية",
    "nav.quran": "المصحف الشريف",
    "nav.prayer_times": "مواقيت الصلاة",
    "nav.athkar": "الأذكار والاستغفار",
    "nav.duas": "الأدعية المأثورة",
    "nav.hadith": "الأحاديث النبوية",
    "nav.lectures": "المحاضرات والدروس",
    "nav.radio": "إذاعة القرآن الكريم",
    "nav.fatwa": "موسوعة الفتاوى",
    "nav.qibla": "اتجاه القبلة",
    "nav.zakat": "حاسبة الزكاة",
    "nav.calendar": "التقويم الهجري",
    "nav.takaful": "التكافل الإنساني",
    "nav.laylat_qadr": "العشر الأواخر",
    "nav.mosques": "المساجد القريبة",
    "nav.achievements": "الأوسمة والإنجازات",
    "nav.wallpapers": "خلفيات إسلامية",
    "nav.settings": "الإعدادات المتقدمة",

    // Common UI
    "app.name": "مشروع ومحرك النور الإسلامي العالمي",
    "app.subtitle": "نوراً للمسلم المبصر والكفيف في كل مكان",
    "common.search": "بحث...",
    "common.play": "تشغيل",
    "common.pause": "إيقاف مؤقت",
    "common.listen": "استماع",
    "common.read": "قراءة",
    "common.share": "مشاركة",
    "common.close": "إغلاق",
    "common.save": "حفظ",
    "common.cancel": "إلغاء",
    "common.back": "رجوع",
    "common.next": "التالي",
    "common.previous": "السابق",
    "common.test": "اختبار",
    "common.active": "مفعل",
    "common.inactive": "معطل",
    "common.level": "المستوى",
    "common.points": "الحسنات",
    "common.streak": "الأيام المتتالية",

    // Gamification
    "achievements.title": "الأوسمة والإنجازات الإسلامية",
    "achievements.subtitle": "رحلتك الروحانية وإنجازاتك اليومية في طاعة الله",
    "achievements.quran_khatmah": "ختمات القرآن الكريم",
    "achievements.prayer_guardian": "المحافظ على الصلوات الخمس",
    "achievements.dhikr_master": "الذاكر المستديم",
    "achievements.night_prayer": "قائم الليل والأسحار",
    "achievements.hifz_champion": "حافظ الوحيين",
    "achievements.unlocked": "أوسمة مُحققة",
    "achievements.locked": "أوسمة قادمة",
    "achievements.claim": "استلام الوسام",

    // Voice Companion & Custom AI
    "companion.title": "الرفيق الصوتي الإسلامي الذكي",
    "companion.shake_hint": "هز الهاتف مرتين للتحدث مجدداً أو مقاطعة الرد السابق",
    "companion.continuous_mode": "محادثة مستمرة بدون توقف",
    "companion.custom_ai": "ربط مساعد ذكي مخصص (API)",
    "companion.listening": "أسمعك الآن بكل اهتمام...",
    "companion.interrupted": "تم استشعار هز الهاتف: تم إيقاف المهمة السابقة وأنا أسمعك الآن!",

    // Wallpapers
    "wallpapers.title": "خلفيات الفن الإسلامي التجريدية",
    "wallpapers.subtitle": "تزيين الواجهة بزخارف إسلامية هادئة تتغير تلقائياً مع أوقات اليوم",
    "wallpapers.auto_time": "تبديل تلقائي حسب وقت اليوم والصلاة",
    "wallpapers.fajr": "فجر الهدى (الفجر والشروق)",
    "wallpapers.dhuhr": "ضحى النور (الظهر والنهار)",
    "wallpapers.asr": "أصيل السكينة (العصر)",
    "wallpapers.maghrib": "شفق المغرب (الغروب)",
    "wallpapers.isha": "سكون الليل (العشاء والتهجد)",
  },

  en: {
    // Navigation & Modes
    "nav.visual": "Visual",
    "nav.sensory": "Sensory",
    "nav.blueprint": "Blueprint",
    "nav.developer": "Developer",
    "nav.companion": "Companion",
    "nav.install": "Install",
    "nav.home": "Home",
    "nav.quran": "Holy Quran",
    "nav.prayer_times": "Prayer Times",
    "nav.athkar": "Athkar & Remembrance",
    "nav.duas": "Supplications (Duas)",
    "nav.hadith": "Prophetic Hadiths",
    "nav.lectures": "Lectures & Lessons",
    "nav.radio": "Cairo Quran Radio",
    "nav.fatwa": "Fatwa Encyclopedia",
    "nav.qibla": "Qibla Direction",
    "nav.zakat": "Zakat Calculator",
    "nav.calendar": "Hijri Calendar",
    "nav.takaful": "Humanitarian Aid",
    "nav.laylat_qadr": "Last 10 Nights",
    "nav.mosques": "Nearby Mosques",
    "nav.achievements": "Badges & Achievements",
    "nav.wallpapers": "Islamic Wallpapers",
    "nav.settings": "Settings",

    // Common UI
    "app.name": "Noor Global Islamic Project",
    "app.subtitle": "Light for every Muslim — sighted and visually impaired",
    "common.search": "Search...",
    "common.play": "Play",
    "common.pause": "Pause",
    "common.listen": "Listen",
    "common.read": "Read",
    "common.share": "Share",
    "common.close": "Close",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.back": "Back",
    "common.next": "Next",
    "common.previous": "Previous",
    "common.test": "Test",
    "common.active": "Active",
    "common.inactive": "Disabled",
    "common.level": "Level",
    "common.points": "Hasanat Score",
    "common.streak": "Day Streak",

    // Gamification
    "achievements.title": "Islamic Badges & Achievements",
    "achievements.subtitle": "Your spiritual journey and daily devotion milestones",
    "achievements.quran_khatmah": "Quran Khatmah Milestones",
    "achievements.prayer_guardian": "On-Time Prayer Guardian",
    "achievements.dhikr_master": "Persistent Dhikr & Tasbih",
    "achievements.night_prayer": "Qiyam & Tahajjud Worshipper",
    "achievements.hifz_champion": "Quran Memorization Master",
    "achievements.unlocked": "Unlocked Badges",
    "achievements.locked": "Upcoming Badges",
    "achievements.claim": "Claim Badge",

    // Voice Companion & Custom AI
    "companion.title": "Smart Islamic Voice Companion",
    "companion.shake_hint": "Double-shake phone to interrupt or speak another command",
    "companion.continuous_mode": "Continuous conversation mode",
    "companion.custom_ai": "Custom AI Assistant (API)",
    "companion.listening": "Listening attentively...",
    "companion.interrupted": "Double-shake detected: Previous task stopped, I am listening!",

    // Wallpapers
    "wallpapers.title": "Serene Islamic Art Wallpapers",
    "wallpapers.subtitle": "Adorn your screen with tranquil geometric art shifting with the time of day",
    "wallpapers.auto_time": "Automatic shift based on time of day & prayer",
    "wallpapers.fajr": "Dawn Light (Fajr & Sunrise)",
    "wallpapers.dhuhr": "Noon Radiance (Dhuhr & Day)",
    "wallpapers.asr": "Serene Afternoon (Asr)",
    "wallpapers.maghrib": "Sunset Dusk (Maghrib)",
    "wallpapers.isha": "Midnight Peace (Isha & Tahajjud)",
  },

  fr: {
    // Navigation & Modes
    "nav.visual": "Visuel",
    "nav.sensory": "Sensoriel",
    "nav.blueprint": "Projet",
    "nav.developer": "Développeur",
    "nav.companion": "Compagnon",
    "nav.install": "Installer",
    "nav.home": "Accueil",
    "nav.quran": "Saint Coran",
    "nav.prayer_times": "Heures de Prière",
    "nav.athkar": "Invocations & Évocations",
    "nav.duas": "Supplications (Duas)",
    "nav.hadith": "Hadiths Prophétiques",
    "nav.lectures": "Conférences & Cours",
    "nav.radio": "Radio du Coran du Caire",
    "nav.fatwa": "Encyclopédie des Fatwas",
    "nav.qibla": "Direction de la Qibla",
    "nav.zakat": "Calculateur de Zakat",
    "nav.calendar": "Calendrier Hégirien",
    "nav.takaful": "Solidarité Humanitaire",
    "nav.laylat_qadr": "Les 10 Dernières Nuits",
    "nav.mosques": "Mosquées Proches",
    "nav.achievements": "Badges & Succès",
    "nav.wallpapers": "Fonds d'écran Islamiques",
    "nav.settings": "Paramètres",

    // Common UI
    "app.name": "Projet Islamique Mondial Al-Noor",
    "app.subtitle": "Une lumière pour chaque musulman voyant et malvoyant",
    "common.search": "Rechercher...",
    "common.play": "Lire",
    "common.pause": "Pause",
    "common.listen": "Écouter",
    "common.read": "Lire",
    "common.share": "Partager",
    "common.close": "Fermer",
    "common.save": "Enregistrer",
    "common.cancel": "Annuler",
    "common.back": "Retour",
    "common.next": "Suivant",
    "common.previous": "Précédent",
    "common.test": "Tester",
    "common.active": "Actif",
    "common.inactive": "Désactivé",
    "common.level": "Niveau",
    "common.points": "Score de Bonnes Actions",
    "common.streak": "Jours Consécutifs",

    // Gamification
    "achievements.title": "Badges & Réussites Spirituelles",
    "achievements.subtitle": "Votre parcours spirituel et jalons d'adoration quotidienne",
    "achievements.quran_khatmah": "Étapes de Récitation du Coran",
    "achievements.prayer_guardian": "Gardien de la Prière à l'Heure",
    "achievements.dhikr_master": "Pratiquant Assidu du Dhikr",
    "achievements.night_prayer": "Fidèle de la Prière Nocturne (Qiyam)",
    "achievements.hifz_champion": "Maître de Mémorisation Coranique",
    "achievements.unlocked": "Badges Obtenus",
    "achievements.locked": "Prochains Badges",
    "achievements.claim": "Réclamer le Badge",

    // Voice Companion & Custom AI
    "companion.title": "Compagnon Vocal Islamique Intelligent",
    "companion.shake_hint": "Secouez le téléphone deux fois pour interrompre ou parler à nouveau",
    "companion.continuous_mode": "Mode conversation continue sans arrêt",
    "companion.custom_ai": "Assistant IA Personnalisé (API)",
    "companion.listening": "J'écoute avec attention...",
    "companion.interrupted": "Double secousse détectée : Tâche précédente arrêtée, je vous écoute !",

    // Wallpapers
    "wallpapers.title": "Fonds d'Art Islamique Géométrique",
    "wallpapers.subtitle": "Des motifs sereins qui s'adaptent selon l'heure de la journée",
    "wallpapers.auto_time": "Changement automatique selon l'heure et la prière",
    "wallpapers.fajr": "Lumière de l'Aube (Fajr & Lever)",
    "wallpapers.dhuhr": "Clarté de Midi (Dhuhr & Jour)",
    "wallpapers.asr": "Sérénité de l'Après-midi (Asr)",
    "wallpapers.maghrib": "Crépuscule Doré (Maghrib)",
    "wallpapers.isha": "Paix Nocturne (Isha & Tahajjud)",
  },

  ur: {
    // Navigation & Modes
    "nav.visual": "بصری موڈ",
    "nav.sensory": "بصیرت موڈ",
    "nav.blueprint": "منصوبہ",
    "nav.developer": "ڈویلپر",
    "nav.companion": "ساتھی",
    "nav.install": "انسٹال",
    "nav.home": "ہوم",
    "nav.quran": "قرآن مجید",
    "nav.prayer_times": "نماز کے اوقات",
    "nav.athkar": "اذکار اور استغفار",
    "nav.duas": "مسنون دعائیں",
    "nav.hadith": "احادیث نبوی",
    "nav.lectures": "دروس اور بیانات",
    "nav.radio": "قاہرہ قرآن ریڈیو",
    "nav.fatwa": "فتوی انسائیکلوپیڈیا",
    "nav.qibla": "قبلہ کا رخ",
    "nav.zakat": "زکوٰۃ کیلکولیٹر",
    "nav.calendar": "ہجری کیلنڈر",
    "nav.takaful": "انسانی ہمدردی",
    "nav.laylat_qadr": "آخری عشرہ",
    "nav.mosques": "قریبی مساجد",
    "nav.achievements": "تمغے اور کامیابیاں",
    "nav.wallpapers": "اسلامی وال پیپرز",
    "nav.settings": "ترتیبات",

    // Common UI
    "app.name": "النور گلوبل اسلامک پروجیکٹ",
    "app.subtitle": "ہر بینا اور نابینا مسلمان کے لیے ایک نور",
    "common.search": "تلاش کریں...",
    "common.play": "چلائیں",
    "common.pause": "روکیں",
    "common.listen": "سنیں",
    "common.read": "پڑھیں",
    "common.share": "شیئر کریں",
    "common.close": "بند کریں",
    "common.save": "محفوظ کریں",
    "common.cancel": "منسوخ",
    "common.back": "واپس",
    "common.next": "اگلا",
    "common.previous": "پچھلا",
    "common.test": "ٹیسٹ",
    "common.active": "فعال",
    "common.inactive": "غیر فعال",
    "common.level": "لیول",
    "common.points": "حسنات سکور",
    "common.streak": "مسلسل دن",

    // Gamification
    "achievements.title": "اسلامی تمغے اور انعامات",
    "achievements.subtitle": "آپ کا روحانی سفر اور روزانہ عبادات کے سنگ میل",
    "achievements.quran_khatmah": "ختم قرآن کے سنگ میل",
    "achievements.prayer_guardian": "پابند صلوٰۃ محافظ",
    "achievements.dhikr_master": "دائمی ذکر و تسبیح",
    "achievements.night_prayer": "نماز تہجد و قیام اللیل",
    "achievements.hifz_champion": "حفظ قرآن کا چیمپئن",
    "achievements.unlocked": "حاصل شدہ تمغے",
    "achievements.locked": "آئندہ تمغے",
    "achievements.claim": "تمغہ وصول کریں",

    // Voice Companion & Custom AI
    "companion.title": "اسمارٹ اسلامی صوتی ساتھی",
    "companion.shake_hint": "دوبارہ بولنے یا روکنے کے لیے فون کو دو بار ہلائیں",
    "companion.continuous_mode": "مسلسل گفتگو کا موڈ",
    "companion.custom_ai": "کسٹم اے آئی معاون (API)",
    "companion.listening": "غور سے سن رہا ہوں...",
    "companion.interrupted": "فون کا ہلنا محسوس ہوا: پچھلا عمل روک دیا گیا، میں سن رہا ہوں!",

    // Wallpapers
    "wallpapers.title": "اسلامی آرٹ وال پیپرز",
    "wallpapers.subtitle": "وقت اور نماز کے اوقات کے ساتھ بدلتے خوبصورت اسلامی پس منظر",
    "wallpapers.auto_time": "وقت کے مطابق خودکار تبدیلی",
    "wallpapers.fajr": "صبح کا نور (فجر و طلوع)",
    "wallpapers.dhuhr": "دوپہر کی تابانی (ظہر)",
    "wallpapers.asr": "عصر کا سکون",
    "wallpapers.maghrib": "شام کی شفق (مغرب)",
    "wallpapers.isha": "رات کی خاموشی (عشاء و تہجد)",
  },
};

class I18nService {
  private currentLang: SupportedLanguage = "ar";

  constructor() {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("noor_language") as SupportedLanguage;
        if (saved && ["ar", "en", "fr", "ur"].includes(saved)) {
          this.currentLang = saved;
        }
      } catch {}
    }
  }

  getLanguage(): SupportedLanguage {
    return this.currentLang;
  }

  getMeta(): LanguageMeta {
    return SUPPORTED_LANGUAGES.find((l) => l.code === this.currentLang) || SUPPORTED_LANGUAGES[0];
  }

  isRTL(): boolean {
    return this.currentLang === "ar" || this.currentLang === "ur";
  }

  setLanguage(lang: SupportedLanguage) {
    if (!["ar", "en", "fr", "ur"].includes(lang)) return;
    this.currentLang = lang;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("noor_language", lang);
        document.documentElement.lang = lang;
        document.documentElement.dir = this.isRTL() ? "rtl" : "ltr";
        window.dispatchEvent(new CustomEvent("noor-language-changed", { detail: { lang } }));
      } catch {}
    }
  }

  t(key: string, fallback?: string): string {
    const dict = TRANSLATIONS[this.currentLang] || TRANSLATIONS.ar;
    if (dict[key]) return dict[key];
    // Fallback to Arabic dictionary if key missing in current language
    if (TRANSLATIONS.ar[key]) return TRANSLATIONS.ar[key];
    return fallback || key;
  }
}

export const i18n = new I18nService();
