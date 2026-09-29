/**
 * Haptic Pattern Engine for Noor Global Islamic Project
 * Provides distinct tactile vibration sequences for prayers, athkar, and blind accessibility
 */

export type HapticPatternType =
  | "prayer_fajr"
  | "prayer_dhuhr"
  | "prayer_asr"
  | "prayer_maghrib"
  | "prayer_isha"
  | "athkar_morning"
  | "athkar_evening"
  | "athkar_sleep"
  | "tasbih_tick"
  | "tasbih_milestone_33"
  | "tasbih_milestone_100"
  | "tasbih_complete"
  | "qibla_aligned"
  | "assistant_listen"
  | "assistant_respond"
  | "quran_memorized_success"
  | "memorization_review_due";

export interface HapticPatternMeta {
  id: HapticPatternType;
  nameAr: string;
  category: "prayer" | "athkar" | "assistant" | "quran";
  pattern: number[];
  descriptionAr: string;
  rhythmDescription: string;
}

export const HAPTIC_PATTERNS_CATALOG: HapticPatternMeta[] = [
  {
    id: "prayer_fajr",
    nameAr: "أذان صلاة الفجر",
    category: "prayer",
    pattern: [250, 100, 350, 150, 550],
    descriptionAr: "نبضات متصاعدة ترمز إلى بزوغ الفجر واليقظة المباركة (الصلاة خير من النوم)",
    rhythmDescription: "نبضة متوسطة، ثم نبضة أطول، ثم نبضة مديدة قوية",
  },
  {
    id: "prayer_dhuhr",
    nameAr: "أذان صلاة الظهر",
    category: "prayer",
    pattern: [300, 150, 300],
    descriptionAr: "نبضتان متوازنتان لمنتصف النهار واستراحة السعي لذكر الله",
    rhythmDescription: "نبضتان متساويتان هادئتان",
  },
  {
    id: "prayer_asr",
    nameAr: "أذان صلاة العصر",
    category: "prayer",
    pattern: [200, 100, 200, 100, 200],
    descriptionAr: "ثلاث نبضات إيقاعية متتابعة لتنبيه الصلاة الوسطى",
    rhythmDescription: "ثلاث نبضات سريعة متلاحقة",
  },
  {
    id: "prayer_maghrib",
    nameAr: "أذان صلاة المغرب",
    category: "prayer",
    pattern: [150, 80, 150, 80, 400],
    descriptionAr: "نبضتان سريعتان تتبعهما نبضة هادئة احتفاءً بمغيب الشمس وموعد الإفطار والسكينة",
    rhythmDescription: "نبضتان رقيقتان تتبعهما نبضة استقرار",
  },
  {
    id: "prayer_isha",
    nameAr: "أذان صلاة العشاء",
    category: "prayer",
    pattern: [400, 200, 400],
    descriptionAr: "نبضتان عميقتان طويلتان تعبران عن سكون الليل وختام صلوات اليوم",
    rhythmDescription: "نبضتان عميقتان مستقرتان",
  },
  {
    id: "athkar_morning",
    nameAr: "تنبيه أذكار الصباح",
    category: "athkar",
    pattern: [100, 80, 150, 80, 250],
    descriptionAr: "إيقاع إشراقة الصباح المتصاعد لبدء اليوم بنور وبركة",
    rhythmDescription: "ثلاث نبضات متصاعدة القوة",
  },
  {
    id: "athkar_evening",
    nameAr: "تنبيه أذكار المساء",
    category: "athkar",
    pattern: [180, 100, 180, 100, 180],
    descriptionAr: "ثلاث نبضات متزنة لحصن المسلم وحفظ الأهل واليوم عند الغروب",
    rhythmDescription: "ثلاث نبضات متساوية ومريحة",
  },
  {
    id: "athkar_sleep",
    nameAr: "تنبيه أذكار النوم",
    category: "athkar",
    pattern: [150, 140, 100, 140, 60],
    descriptionAr: "نبضات متناقصة الشدة تدريجياً لتهيئة الروح والنفس للاسترخاء والنوم الهانئ",
    rhythmDescription: "نبضات متناقصة هادئة",
  },
  {
    id: "tasbih_tick",
    nameAr: "نقرة حبة التسبيح",
    category: "athkar",
    pattern: [25],
    descriptionAr: "نبضة لمسية ميكروية رقيقة تحاكي مرور حبة السبحة بين الأصابع",
    rhythmDescription: "نقرة واحدة خفيفة جداً",
  },
  {
    id: "tasbih_milestone_33",
    nameAr: "محطة اكتمال 33 تسبيحة",
    category: "athkar",
    pattern: [60, 80, 60],
    descriptionAr: "نبضتان احتفاليتان رقيقتان لإشعارك باكتمال دورة 33 تسبيحة دون النظر للشاشة",
    rhythmDescription: "نبضتان متتاليتان",
  },
  {
    id: "tasbih_milestone_100",
    nameAr: "محطة اكتمال 100 تسبيحة",
    category: "athkar",
    pattern: [80, 60, 80, 60, 140],
    descriptionAr: "خماسي لمسي احتفالي لإشعارك ببلوغ المائة والأجر العظيم",
    rhythmDescription: "تسلسل خماسي حافل بالبهجة",
  },
  {
    id: "tasbih_complete",
    nameAr: "اكتمال تكرار الذكر",
    category: "athkar",
    pattern: [60, 40, 60, 40, 150],
    descriptionAr: "نبضات متناغمة تعبر عن إتمام تكرار الذكر",
    rhythmDescription: "نبضتان سريعتان تتبعهما نبضة خاتمة",
  },
  {
    id: "qibla_aligned",
    nameAr: "محاذاة القبلة والكعبة المشرفة",
    category: "assistant",
    pattern: [120, 60, 180, 60, 350],
    descriptionAr: "نبضات حاسمة ومؤكدة تثبت لك أن وجهتك أصبحت متطابقة تماماً مع الكعبة المشرفة",
    rhythmDescription: "تسلسل ثلاثي ينتهي بنبضة ثبات وتأكيد",
  },
  {
    id: "assistant_listen",
    nameAr: "المساعد الصوتي يستمع",
    category: "assistant",
    pattern: [80, 50, 80],
    descriptionAr: "نبضتان خفيفتان لتأكيد فتح الميكروفون وجاهزية المساعد للاستماع لأمرك",
    rhythmDescription: "نبضتان استجابيتان",
  },
  {
    id: "assistant_respond",
    nameAr: "المساعد الصوتي يجيب",
    category: "assistant",
    pattern: [60, 40, 120],
    descriptionAr: "تأكيد لمسي على وصول الإجابة والبدء في نطقها صوتياً",
    rhythmDescription: "نبضة سريعة تليها نبضة متوسطة",
  },
  {
    id: "quran_memorized_success",
    nameAr: "تثبيت حفظ المقطع القرآني",
    category: "quran",
    pattern: [100, 60, 100, 60, 220],
    descriptionAr: "نبضات متتابعة محفزة تعبر عن الإتقان ورفع مستوى الآيات في نظام التكرار المتباعد",
    rhythmDescription: "تسلسل ثلاثي تصاعدي مشجع",
  },
  {
    id: "memorization_review_due",
    nameAr: "تذكير مراجعة الحفظ اليومية",
    category: "quran",
    pattern: [150, 80, 150, 120, 300],
    descriptionAr: "تنبيه لمسي بموعد جلسة تثبيت الحفظ ومراجعة الآيات المستحقة لليوم",
    rhythmDescription: "نبضتان قصيرتان ثم نبضة تأكيدية",
  },
];

class HapticPatternEngine {
  private isEnabled: boolean = true;
  private intensity: "subtle" | "normal" | "strong" = "normal";

  constructor() {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("noor_haptic_enabled");
        if (saved !== null) {
          this.isEnabled = saved === "true";
        }
        const savedIntensity = localStorage.getItem("noor_haptic_intensity") as "subtle" | "normal" | "strong";
        if (savedIntensity && ["subtle", "normal", "strong"].includes(savedIntensity)) {
          this.intensity = savedIntensity;
        }
      } catch {}
    }
  }

  isSupported(): boolean {
    return typeof window !== "undefined" && "navigator" in window && "vibrate" in navigator;
  }

  getEnabled(): boolean {
    return this.isEnabled;
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("noor_haptic_enabled", String(enabled));
      } catch {}
    }
  }

  getIntensity(): "subtle" | "normal" | "strong" {
    return this.intensity;
  }

  setIntensity(intensity: "subtle" | "normal" | "strong") {
    this.intensity = intensity;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("noor_haptic_intensity", intensity);
      } catch {}
    }
  }

  /**
   * Trigger a predefined named haptic pattern
   */
  trigger(patternId: HapticPatternType) {
    if (!this.isEnabled || !this.isSupported()) return;
    const meta = HAPTIC_PATTERNS_CATALOG.find((p) => p.id === patternId);
    if (meta) {
      try {
        const factor = this.intensity === "subtle" ? 0.7 : this.intensity === "strong" ? 1.3 : 1.0;
        const adjustedPattern = meta.pattern.map((d) => Math.round(d * factor));
        navigator.vibrate(adjustedPattern);
      } catch {}
    }
  }

  /**
   * Custom raw vibration pattern
   */
  vibrateRaw(pattern: number | number[]) {
    if (!this.isEnabled || !this.isSupported()) return;
    try {
      navigator.vibrate(pattern);
    } catch {}
  }

  /**
   * Get metadata for a pattern
   */
  getPatternMeta(patternId: HapticPatternType): HapticPatternMeta | undefined {
    return HAPTIC_PATTERNS_CATALOG.find((p) => p.id === patternId);
  }
}

export const hapticEngine = new HapticPatternEngine();
