/**
 * Islamic Art & Time-of-Day Wallpapers Manager
 * Manages serene abstract Islamic geometric patterns and art backgrounds,
 * with automatic time-of-day switching (Fajr, Dhuhr, Asr, Maghrib, Isha)
 * or manual user override with customizable opacity and blur.
 */

export interface IslamicWallpaper {
  id: string;
  name: {
    ar: string;
    en: string;
    fr: string;
    ur: string;
  };
  timePeriod: "fajr" | "dhuhr" | "asr" | "maghrib" | "isha" | "neutral";
  /** Wallpaper overall tone — drives the "dark/light" badge and text-contrast hint. */
  tone: "dark" | "light";
  /** Theme that keeps texts clearly readable over this wallpaper. */
  recommendedTheme: "natural" | "paper" | "night" | "light";
  description: {
    ar: string;
    en: string;
    fr: string;
    ur: string;
  };
  gradient: string;
  svgPattern: string; // SVG data uri or overlay pattern
  imageUrl?: string;
  accentColor: string;
}

export const ISLAMIC_WALLPAPERS: IslamicWallpaper[] = [
  {
    id: "fajr_emerald_dawn",
    name: {
      ar: "فجر الهدى والسكينة",
      en: "Emerald Dawn (Fajr)",
      fr: "Aube Émeraude (Fajr)",
      ur: "صبح کا نور اور سکینت",
    },
    timePeriod: "fajr",
    tone: "dark",
    recommendedTheme: "natural",
    description: {
      ar: "تدرج هادئ من الزمردي والذهبي الفاتح المستوحى من سكينة الفجر وشروق الشمس",
      en: "Tranquil emerald and soft amber hues inspired by dawn's peace",
      fr: "Nuances émeraude et ambre doux inspirées par la paix de l'aube",
      ur: "صبح کی پرسکون روشنی سے متاثر زمردی اور ہلکے سنہری رنگ",
    },
    gradient: "linear-gradient(145deg, rgba(6,30,22,0.85) 0%, rgba(13,60,45,0.75) 50%, rgba(26,75,55,0.65) 100%)",
    svgPattern: `radial-gradient(circle at 20% 30%, rgba(5,150,105,0.2) 0%, transparent 60%), radial-gradient(circle at 80% 70%, rgba(212,175,55,0.12) 0%, transparent 50%)`,
    accentColor: "#059669",
  },
  {
    id: "dhuhr_golden_radiance",
    name: {
      ar: "ضحى النور والضياء",
      en: "Golden Radiance (Dhuhr)",
      fr: "Rayonnement Doré (Dhuhr)",
      ur: "دوپہر کی تابانی اور ضیاء",
    },
    timePeriod: "dhuhr",
    tone: "light",
    recommendedTheme: "paper",
    description: {
      ar: "أنوار النهار الذهبية الصافية مع لمسات هندسية إسلامية مشرقة ومتوازنة",
      en: "Radiant golden daylight with balanced Islamic arabesque motifs",
      fr: "Lumière dorée du jour avec motifs arabesques harmonieux",
      ur: "سنہری سورج کی کرنوں سے آراستہ متوازن اسلامی نقش و نگار",
    },
    gradient: "linear-gradient(135deg, rgba(20,28,24,0.85) 0%, rgba(35,45,30,0.75) 50%, rgba(50,55,35,0.65) 100%)",
    svgPattern: `radial-gradient(circle at 50% 20%, rgba(234,179,8,0.15) 0%, transparent 55%), radial-gradient(circle at 20% 80%, rgba(16,185,129,0.12) 0%, transparent 50%)`,
    accentColor: "#EAB308",
  },
  {
    id: "asr_amber_tranquility",
    name: {
      ar: "أصيل العصر والسكينة",
      en: "Amber Serenity (Asr)",
      fr: "Sérénité d'Ambre (Asr)",
      ur: "عصر کا دلکش سکون",
    },
    timePeriod: "asr",
    tone: "dark",
    recommendedTheme: "natural",
    description: {
      ar: "ألوان العصر الدافئة من العنبر والبرونز التجريدي مع ظلال الزخارف الرقيقة",
      en: "Warm amber and bronze dusk hues with delicate sacred geometric shadows",
      fr: "Teintes chaudes d'ambre et de bronze avec ombres géométriques délicates",
      ur: "عنبر اور کانسی کے خوبصورت سائے اور نقوش",
    },
    gradient: "linear-gradient(145deg, rgba(25,20,18,0.85) 0%, rgba(45,32,25,0.75) 50%, rgba(65,45,30,0.65) 100%)",
    svgPattern: `radial-gradient(circle at 75% 30%, rgba(245,158,11,0.16) 0%, transparent 60%), radial-gradient(circle at 25% 75%, rgba(217,119,6,0.12) 0%, transparent 50%)`,
    accentColor: "#F59E0B",
  },
  {
    id: "maghrib_dusk_indigo",
    name: {
      ar: "شفق المغرب والغروب",
      en: "Twilight Sunset (Maghrib)",
      fr: "Crépuscule d'Indigo (Maghrib)",
      ur: "مغرب کی دلکش شفق",
    },
    timePeriod: "maghrib",
    tone: "dark",
    recommendedTheme: "night",
    description: {
      ar: "شفق الغروب الساحر الذي يمزج البنفسجي والوردي الغروبي مع النيلي العميق",
      en: "Mesmerizing dusk blending warm terracotta, twilight rose, and indigo",
      fr: "Crépuscule envoûtant mêlant rose crépusculaire et indigo profond",
      ur: "غروب آفتاب کا دلکش منظر اور نیلی شفق",
    },
    gradient: "linear-gradient(135deg, rgba(20,15,30,0.88) 0%, rgba(38,20,45,0.78) 50%, rgba(55,25,50,0.68) 100%)",
    svgPattern: `radial-gradient(circle at 80% 25%, rgba(236,72,153,0.14) 0%, transparent 55%), radial-gradient(circle at 20% 75%, rgba(99,102,241,0.16) 0%, transparent 60%)`,
    accentColor: "#EC4899",
  },
  {
    id: "isha_midnight_celestial",
    name: {
      ar: "سكون الليل والنجوم (العشاء)",
      en: "Celestial Midnight (Isha)",
      fr: "Nuit Céleste & Étoiles (Isha)",
      ur: "رات کی خاموشی اور ستارے (عشاء)",
    },
    timePeriod: "isha",
    tone: "dark",
    recommendedTheme: "night",
    description: {
      ar: "كحلي ليلي ملكي عميق مرصع ببريق ذهبي خافت يشبه سماء الليل الصافية",
      en: "Deep royal celestial navy dotted with faint golden geometric starlight",
      fr: "Bleu nuit céleste et profond ponctué de légères étoiles dorées",
      ur: "گہرا شاہانہ نیلا آسمان اور ستاروں کی دھیمی چمک",
    },
    gradient: "linear-gradient(150deg, rgba(8,12,24,0.92) 0%, rgba(12,20,38,0.85) 50%, rgba(15,25,50,0.75) 100%)",
    svgPattern: `radial-gradient(circle at 50% 30%, rgba(59,130,246,0.15) 0%, transparent 60%), radial-gradient(circle at 70% 80%, rgba(212,175,55,0.1) 0%, transparent 50%)`,
    accentColor: "#3B82F6",
  },
  {
    id: "classic_geometric_mosaic",
    name: {
      ar: "الموزاييك الإسلامي الهندسي",
      en: "Classic Islamic Mosaic",
      fr: "Mosaïque Islamique Classique",
      ur: "کلاسیکی اسلامی جیومیٹرک موزیک",
    },
    timePeriod: "neutral",
    tone: "dark",
    recommendedTheme: "natural",
    description: {
      ar: "زخارف هندسية إسلامية كلاسيكية متكررة بدقة متناهية تحاكي عمارة المساجد الكبرى",
      en: "Intricate repetitive Islamic geometric stars resembling grand mosque architecture",
      fr: "Étoiles géométriques islamiques précises inspirées des grandes mosquées",
      ur: "مساجد کے فن تعمیر سے ہم آہنگ روایتی ہندسی ستارے",
    },
    gradient: "linear-gradient(145deg, rgba(12,18,16,0.9) 0%, rgba(18,28,24,0.82) 50%, rgba(22,35,30,0.75) 100%)",
    svgPattern: `radial-gradient(circle at 30% 30%, rgba(5,150,105,0.18) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(212,175,55,0.14) 0%, transparent 50%)`,
    accentColor: "#10B981",
  },
  {
    id: "kaaba_black_gold",
    name: {
      ar: "كسوة الكعبة — أسود وذهبي",
      en: "Kaaba Kiswa — Black & Gold",
      fr: "Kiswa de la Kaaba — Noir et Or",
      ur: "غلاف کعبہ — سیاہ اور سنہری",
    },
    timePeriod: "neutral",
    tone: "dark",
    recommendedTheme: "night",
    description: {
      ar: "سواد كسوة الكعبة المشرفة المطرز بخيوط الذهب — هيبة ووقار يليق بأعظم بقاع الأرض",
      en: "The black Kiswa of the Holy Kaaba embroidered with gold — majesty befitting the noblest place on earth",
      fr: "La Kiswa noire de la Sainte Kaaba brodée d'or — majesté digne du lieu le plus noble",
      ur: "خانہ کعبہ کے سیاہ غلاف پر سنہری کڑھائی — عظمت و وقار کا پیکر",
    },
    gradient: "linear-gradient(150deg, rgba(5,5,8,0.94) 0%, rgba(12,12,18,0.88) 45%, rgba(28,22,10,0.8) 100%)",
    svgPattern: `radial-gradient(circle at 50% 15%, rgba(212,175,55,0.22) 0%, transparent 45%), radial-gradient(circle at 20% 85%, rgba(212,175,55,0.1) 0%, transparent 50%), radial-gradient(circle at 85% 80%, rgba(255,255,255,0.05) 0%, transparent 40%)`,
    accentColor: "#D4AF37",
  },
  {
    id: "madinah_green_dome",
    name: {
      ar: "القبة الخضراء — مدينة رسول الله",
      en: "The Green Dome — Madinah",
      fr: "Le Dôme Vert — Médine",
      ur: "سبز گنبد — مدینہ منورہ",
    },
    timePeriod: "neutral",
    tone: "dark",
    recommendedTheme: "natural",
    description: {
      ar: "خضرة القبة النبوية الشريفة في المدينة المنورة — سكينة المحبين وشوق الزائرين",
      en: "The green of the Prophet's Dome in Madinah — serenity of lovers and longing of visitors",
      fr: "Le vert du Dôme du Prophète à Médine — sérénité et nostalgie des visiteurs",
      ur: "مدینہ منورہ کے سبز گنبد کی ٹھنڈک — عاشقوں کا سکون اور زائرین کی تمنا",
    },
    gradient: "linear-gradient(145deg, rgba(4,22,16,0.92) 0%, rgba(6,45,32,0.85) 50%, rgba(10,65,45,0.75) 100%)",
    svgPattern: `radial-gradient(circle at 50% 25%, rgba(16,185,129,0.2) 0%, transparent 55%), radial-gradient(circle at 80% 85%, rgba(212,175,55,0.12) 0%, transparent 50%)`,
    accentColor: "#10B981",
  },
  {
    id: "ramadan_crescent",
    name: {
      ar: "هلال رمضان — ليلة القدر",
      en: "Ramadan Crescent — Laylat al-Qadr",
      fr: "Croissant du Ramadan — Laylat al-Qadr",
      ur: "رمضان کا چاند — شب قدر",
    },
    timePeriod: "neutral",
    tone: "dark",
    recommendedTheme: "night",
    description: {
      ar: "هلال فضي يضيء سماء ليلية عميقة — أجواء رمضان وليالي القدر المباركة",
      en: "A silver crescent lighting a deep night sky — the blessed atmosphere of Ramadan and Laylat al-Qadr",
      fr: "Un croissant argenté illuminant un ciel nocturne profond — l'atmosphère bénie du Ramadan",
      ur: "گہری رات میں چمکتا چاند — رمضان اور شب قدر کی بابرکت فضا",
    },
    gradient: "linear-gradient(155deg, rgba(6,8,20,0.94) 0%, rgba(10,14,34,0.88) 50%, rgba(20,22,48,0.8) 100%)",
    svgPattern: `radial-gradient(circle at 78% 18%, rgba(243,231,196,0.28) 0%, rgba(243,231,196,0.08) 18%, transparent 32%), radial-gradient(circle at 30% 70%, rgba(99,102,241,0.14) 0%, transparent 55%), radial-gradient(circle at 60% 40%, rgba(255,255,255,0.04) 0%, transparent 30%)`,
    accentColor: "#F3E7C4",
  },
];

class WallpaperManager {
  private activeId: string = "auto";
  private opacity: number = 0.25;
  private blur: number = 0; // px

  constructor() {
    if (typeof window !== "undefined") {
      try {
        const savedId = localStorage.getItem("noor_wallpaper_id");
        if (savedId) this.activeId = savedId;
        const savedOp = localStorage.getItem("noor_wallpaper_opacity");
        if (savedOp) this.opacity = parseFloat(savedOp);
        const savedBlur = localStorage.getItem("noor_wallpaper_blur");
        if (savedBlur) this.blur = parseInt(savedBlur, 10);
      } catch {}
    }
  }

  getActiveId(): string {
    return this.activeId;
  }

  getOpacity(): number {
    return this.opacity;
  }

  getBlur(): number {
    return this.blur;
  }

  setWallpaper(id: string) {
    this.activeId = id;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("noor_wallpaper_id", id);
        window.dispatchEvent(new CustomEvent("noor-wallpaper-changed", { detail: { id } }));
      } catch {}
    }
  }

  setOpacity(opacity: number) {
    this.opacity = Math.max(0.05, Math.min(0.8, opacity));
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("noor_wallpaper_opacity", String(this.opacity));
        window.dispatchEvent(
          new CustomEvent("noor-wallpaper-changed", { detail: { opacity: this.opacity } })
        );
      } catch {}
    }
  }

  setBlur(blur: number) {
    this.blur = Math.max(0, Math.min(12, Math.round(blur)));
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("noor_wallpaper_blur", String(this.blur));
        window.dispatchEvent(
          new CustomEvent("noor-wallpaper-changed", { detail: { blur: this.blur } })
        );
      } catch {}
    }
  }

  resetDefaults() {
    this.activeId = "auto";
    this.opacity = 0.25;
    this.blur = 0;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("noor_wallpaper_id", this.activeId);
        localStorage.setItem("noor_wallpaper_opacity", String(this.opacity));
        localStorage.setItem("noor_wallpaper_blur", String(this.blur));
        window.dispatchEvent(new CustomEvent("noor-wallpaper-changed", { detail: { reset: true } }));
      } catch {}
    }
  }

  // Resolves current wallpaper according to time of day if in auto mode
  getCurrentWallpaper(): IslamicWallpaper {
    if (this.activeId !== "auto") {
      const found = ISLAMIC_WALLPAPERS.find((w) => w.id === this.activeId);
      if (found) return found;
    }

    // Auto resolution based on current local hour
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 8) {
      // Fajr & Sunrise
      return ISLAMIC_WALLPAPERS[0];
    } else if (hour >= 8 && hour < 15) {
      // Dhuhr & Noon
      return ISLAMIC_WALLPAPERS[1];
    } else if (hour >= 15 && hour < 18) {
      // Asr
      return ISLAMIC_WALLPAPERS[2];
    } else if (hour >= 18 && hour < 20) {
      // Maghrib
      return ISLAMIC_WALLPAPERS[3];
    } else {
      // Isha & Night
      return ISLAMIC_WALLPAPERS[4];
    }
  }
}

export const wallpaperManager = new WallpaperManager();
