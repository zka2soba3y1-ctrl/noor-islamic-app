/**
 * Islamic Gamification & Spiritual Achievements System
 * Tracks religious milestones: Quran Khatmah, On-Time Prayers, Athkar Consistency,
 * Night Prayer (Tahajjud), Memorization (Hifz), and Good Deeds (Hasanat points).
 */

export type BadgeTier = "bronze" | "silver" | "gold" | "diamond";

export interface IslamicBadge {
  id: string;
  category: "quran" | "prayer" | "athkar" | "qiyam" | "hifz" | "community";
  title: {
    ar: string;
    en: string;
    fr: string;
    ur: string;
  };
  description: {
    ar: string;
    en: string;
    fr: string;
    ur: string;
  };
  tier: BadgeTier;
  icon: string; // Emoji or Lucide name identifier
  target: number;
  currentProgress: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  hasanatReward: number;
}

export interface UserSpiritualProfile {
  totalHasanat: number;
  level: number;
  levelTitle: {
    ar: string;
    en: string;
    fr: string;
    ur: string;
  };
  prayerStreak: number;
  athkarStreak: number;
  khatmahCompleted: number;
  juzReadCount: number;
  tasbihTotalCount: number;
  qiyamPrayedCount: number;
  hifzMasteredCount: number;
  badges: IslamicBadge[];
}

const DEFAULT_BADGES: IslamicBadge[] = [
  // Quran Badges
  {
    id: "quran_juz_1",
    category: "quran",
    title: {
      ar: "قارئ الجزء الأول",
      en: "First Juz Reciter",
      fr: "Récitateur du 1er Juz",
      ur: "پہلے پارے کا قاری",
    },
    description: {
      ar: "إتمام قراءة جزء كامل من كتاب الله الكريم بتدبر",
      en: "Completed reading one full Juz of the Holy Quran",
      fr: "A terminé la lecture d'un Juz complet du Saint Coran",
      ur: "قرآن مجید کا ایک مکمل پارہ تلاوت کیا",
    },
    tier: "bronze",
    icon: "📖",
    target: 1,
    currentProgress: 1,
    isUnlocked: true,
    unlockedAt: new Date().toISOString(),
    hasanatReward: 1000,
  },
  {
    id: "quran_juz_5",
    category: "quran",
    title: {
      ar: "رفيق الأجزاء الخمسة",
      en: "Five Juz Companion",
      fr: "Compagnon des 5 Juz",
      ur: "پانچ پاروں کا ساتھی",
    },
    description: {
      ar: "إتمام قراءة خمسة أجزاء من القرآن العظيم",
      en: "Completed reading 5 Juz of the Holy Quran",
      fr: "A terminé la lecture de 5 Juz du Saint Coran",
      ur: "قرآن مجید کے 5 پارے مکمل کیے",
    },
    tier: "silver",
    icon: "📜",
    target: 5,
    currentProgress: 3,
    isUnlocked: false,
    hasanatReward: 5000,
  },
  {
    id: "quran_khatmah_1",
    category: "quran",
    title: {
      ar: "خاتم كتاب الله",
      en: "Quran Khatmah Master",
      fr: "Maître du Khatmah Coranique",
      ur: "خاتم قرآن مجید",
    },
    description: {
      ar: "إتمام ختمة كاملة للمصحف الشريف (604 صفحات)",
      en: "Completed an entire Quran Khatmah (604 pages)",
      fr: "A complété un Khatmah complet du Coran (604 pages)",
      ur: "قرآن مجید کا ایک مکمل ختم (604 صفحات)",
    },
    tier: "diamond",
    icon: "👑",
    target: 30,
    currentProgress: 3,
    isUnlocked: false,
    hasanatReward: 50000,
  },

  // Prayer Badges
  {
    id: "prayer_streak_3",
    category: "prayer",
    title: {
      ar: "مقيم الصلاة المبتدئ",
      en: "3-Day Prayer Devotee",
      fr: "Fidèle de la Prière (3 jours)",
      ur: "تین دن کا پابند نماز",
    },
    description: {
      ar: "الالتزام بالصلوات الخمس في أوقاتها لمدة 3 أيام متتالية",
      en: "Maintained on-time prayers for 3 consecutive days",
      fr: "A accompli les cinq prières à l'heure pendant 3 jours consécutifs",
      ur: "مسلسل 3 دن تمام نمازیں وقت پر ادا کیں",
    },
    tier: "bronze",
    icon: "🕌",
    target: 3,
    currentProgress: 3,
    isUnlocked: true,
    unlockedAt: new Date().toISOString(),
    hasanatReward: 1500,
  },
  {
    id: "prayer_streak_7",
    category: "prayer",
    title: {
      ar: "حارس الصلوات الأسبوعي",
      en: "Weekly Prayer Guardian",
      fr: "Gardien Hebdomadaire des Prières",
      ur: "ہفتہ وار محافظ صلوٰۃ",
    },
    description: {
      ar: "الالتزام التام بالصلوات المفروضة لمدة أسبوع كامل",
      en: "Observed all obligatory prayers for a full week",
      fr: "A observé toutes les prières obligatoires pendant une semaine entière",
      ur: "پورے ایک ہفتے تمام نمازوں کی پابندی کی",
    },
    tier: "silver",
    icon: "🛡️",
    target: 7,
    currentProgress: 5,
    isUnlocked: false,
    hasanatReward: 3500,
  },
  {
    id: "prayer_streak_30",
    category: "prayer",
    title: {
      ar: "المحافظ على الصلوات شهرياً",
      en: "Monthly Prayer Champion",
      fr: "Champion Mensuel des Prières",
      ur: "ماہانہ پابند نماز چیمپئن",
    },
    description: {
      ar: "الالتزام بالصلوات الخمس على وقتها لمدة 30 يوماً متواصلاً",
      en: "Consecutive 30 days of consistent on-time prayers",
      fr: "30 jours consécutifs de prières assidues et ponctuelles",
      ur: "مسلسل 30 دن تک باجماعت و بروقت نماز",
    },
    tier: "gold",
    icon: "⭐",
    target: 30,
    currentProgress: 5,
    isUnlocked: false,
    hasanatReward: 15000,
  },

  // Athkar & Tasbih Badges
  {
    id: "tasbih_100",
    category: "athkar",
    title: {
      ar: "المسبح الذاكر",
      en: "Centurion of Dhikr",
      fr: "Centurion du Dhikr",
      ur: "سو بار تسبیح کرنے والا",
    },
    description: {
      ar: "إتمام 100 تسبيحة وذكر لله تعالى عبر السبحة الإلكترونية",
      en: "Completed 100 counts of Tasbih using the digital Rosary",
      fr: "A effectué 100 louanges (Tasbih) via le chapelet électronique",
      ur: "ڈیجیٹل تسبیح کے ذریعے 100 بار ذکر الٰہی مکمل کیا",
    },
    tier: "bronze",
    icon: "📿",
    target: 100,
    currentProgress: 100,
    isUnlocked: true,
    unlockedAt: new Date().toISOString(),
    hasanatReward: 1000,
  },
  {
    id: "tasbih_1000",
    category: "athkar",
    title: {
      ar: "ألفية الاستغفار والذكر",
      en: "Millennium of Istighfar",
      fr: "Millénaire d'Istighfar",
      ur: "ہزار تسبیحات و استغفار",
    },
    description: {
      ar: "إتمام 1,000 تسبيحة واستغفار وصلاة على النبي ﷺ",
      en: "Completed 1,000 counts of remembrance and Salawat",
      fr: "A complété 1 000 formules de rappel et prières sur le Prophète ﷺ",
      ur: "1000 تسبیحات، درود شریف اور استغفار مکمل کیا",
    },
    tier: "gold",
    icon: "✨",
    target: 1000,
    currentProgress: 450,
    isUnlocked: false,
    hasanatReward: 10000,
  },
  {
    id: "athkar_day_night",
    category: "athkar",
    title: {
      ar: "حصن المسلم اليومي",
      en: "Daily Fortress of Dhikr",
      fr: "Forteresse Quotidienne du Dhikr",
      ur: "روزانہ حصن المسلم",
    },
    description: {
      ar: "المداومة على أذكار الصباح والمساء وأذكار النوم في نفس اليوم",
      en: "Completed morning, evening, and bedtime Athkar in a single day",
      fr: "A récité les évocations du matin, du soir et du coucher le même jour",
      ur: "ایک ہی دن میں صبح، شام اور سوتے وقت کے اذکار مکمل کیے",
    },
    tier: "silver",
    icon: "🌅",
    target: 1,
    currentProgress: 1,
    isUnlocked: true,
    unlockedAt: new Date().toISOString(),
    hasanatReward: 2500,
  },

  // Night Prayer & Hifz
  {
    id: "qiyam_layl",
    category: "qiyam",
    title: {
      ar: "قائم الليل والأسحار",
      en: "Night Vigil (Qiyam)",
      fr: "Fidèle de la Nuit (Tahajjud)",
      ur: "قیام اللیل اور تہجد گزار",
    },
    description: {
      ar: "صلاة ركعتين في جوف الليل أو التهجد مع الاستغفار بالأسحار",
      en: "Prayed Qiyam al-Layl or Tahajjud during late night hours",
      fr: "A accompli la prière de nuit (Qiyam ou Tahajjud)",
      ur: "رات کے پچھلے پہر تہجد یا قیام اللیل ادا کیا",
    },
    tier: "gold",
    icon: "🌙",
    target: 1,
    currentProgress: 1,
    isUnlocked: true,
    unlockedAt: new Date().toISOString(),
    hasanatReward: 8000,
  },
  {
    id: "hifz_mastery",
    category: "hifz",
    title: {
      ar: "حافظ الوحيين المتقن",
      en: "Memorization Champion",
      fr: "Champion de Mémorisation",
      ur: "حفظ قرآن کا ماہر",
    },
    description: {
      ar: "إتمام مراجعة وتثبيت 5 مقاطع قرآنية بنجاح في نظام التكرار المتباعد",
      en: "Mastered 5 Quranic passages via the Spaced Repetition system",
      fr: "A maîtrisé 5 passages coraniques via la répétition espacée",
      ur: "اسپیسڈ ریپیٹیشن سسٹم میں 5 قرآنی حصوں کا پختہ اعادہ کیا",
    },
    tier: "diamond",
    icon: "💎",
    target: 5,
    currentProgress: 2,
    isUnlocked: false,
    hasanatReward: 20000,
  },
];

class AchievementsService {
  private profile: UserSpiritualProfile;

  constructor() {
    this.profile = this.loadProfile();
  }

  private loadProfile(): UserSpiritualProfile {
    if (typeof window === "undefined") {
      return this.getDefaultProfile();
    }
    try {
      const saved = localStorage.getItem("noor_spiritual_profile");
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with DEFAULT_BADGES to ensure new badges are present
        const mergedBadges = DEFAULT_BADGES.map((defBadge) => {
          const found = parsed.badges?.find((b: IslamicBadge) => b.id === defBadge.id);
          return found ? { ...defBadge, ...found } : defBadge;
        });
        return {
          ...parsed,
          badges: mergedBadges,
        };
      }
    } catch {}
    return this.getDefaultProfile();
  }

  private getDefaultProfile(): UserSpiritualProfile {
    return {
      totalHasanat: 7000,
      level: 3,
      levelTitle: {
        ar: "الذاكر المبادر",
        en: "Devoted Seeker",
        fr: "Chercheur Dévoué",
        ur: "مخلص ذاکر",
      },
      prayerStreak: 5,
      athkarStreak: 4,
      khatmahCompleted: 0,
      juzReadCount: 3,
      tasbihTotalCount: 450,
      qiyamPrayedCount: 1,
      hifzMasteredCount: 2,
      badges: DEFAULT_BADGES,
    };
  }

  private saveProfile() {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("noor_spiritual_profile", JSON.stringify(this.profile));
        window.dispatchEvent(
          new CustomEvent("noor-achievements-updated", { detail: { profile: this.profile } })
        );
      } catch {}
    }
  }

  getProfile(): UserSpiritualProfile {
    return this.profile;
  }

  getUnlockedCount(): number {
    return this.profile.badges.filter((b) => b.isUnlocked).length;
  }

  // Record an action (e.g. read Juz, logged prayer, tasbih count)
  recordAction(type: "juz" | "prayer" | "tasbih" | "qiyam" | "hifz", count = 1) {
    if (type === "juz") {
      this.profile.juzReadCount += count;
      if (this.profile.juzReadCount >= 30) {
        this.profile.khatmahCompleted += Math.floor(this.profile.juzReadCount / 30);
        this.profile.juzReadCount = this.profile.juzReadCount % 30;
      }
      this.updateBadgeProgress("quran_juz_1", this.profile.juzReadCount);
      this.updateBadgeProgress("quran_juz_5", this.profile.juzReadCount);
      this.updateBadgeProgress("quran_khatmah_1", this.profile.khatmahCompleted * 30 + this.profile.juzReadCount);
    } else if (type === "prayer") {
      this.profile.prayerStreak += count;
      this.updateBadgeProgress("prayer_streak_3", this.profile.prayerStreak);
      this.updateBadgeProgress("prayer_streak_7", this.profile.prayerStreak);
      this.updateBadgeProgress("prayer_streak_30", this.profile.prayerStreak);
    } else if (type === "tasbih") {
      this.profile.tasbihTotalCount += count;
      this.updateBadgeProgress("tasbih_100", this.profile.tasbihTotalCount);
      this.updateBadgeProgress("tasbih_1000", this.profile.tasbihTotalCount);
    } else if (type === "qiyam") {
      this.profile.qiyamPrayedCount += count;
      this.updateBadgeProgress("qiyam_layl", this.profile.qiyamPrayedCount);
    } else if (type === "hifz") {
      this.profile.hifzMasteredCount += count;
      this.updateBadgeProgress("hifz_mastery", this.profile.hifzMasteredCount);
    }

    this.recalculateLevel();
    this.saveProfile();
  }

  private updateBadgeProgress(badgeId: string, currentVal: number) {
    const badge = this.profile.badges.find((b) => b.id === badgeId);
    if (!badge) return;

    badge.currentProgress = Math.min(badge.target, currentVal);
    if (!badge.isUnlocked && badge.currentProgress >= badge.target) {
      badge.isUnlocked = true;
      badge.unlockedAt = new Date().toISOString();
      this.profile.totalHasanat += badge.hasanatReward;
      window.dispatchEvent(
        new CustomEvent("noor-badge-unlocked", { detail: { badge } })
      );
    }
  }

  private recalculateLevel() {
    const hasanat = this.profile.totalHasanat;
    let level = 1;
    let title = {
      ar: "طالب النور المبتدئ",
      en: "Seeker of Light",
      fr: "Chercheur de Lumière",
      ur: "ابتدائی طالب نور",
    };

    if (hasanat >= 50000) {
      level = 5;
      title = {
        ar: "خادم كتاب الله وسفير النور",
        en: "Ambassador of Light & Quran Guardian",
        fr: "Ambassadeur de Lumière et Gardien du Coran",
        ur: "خادم قرآن اور سفیر نور",
      };
    } else if (hasanat >= 25000) {
      level = 4;
      title = {
        ar: "المتسابق في الخيرات",
        en: "Forefront in Good Deeds",
        fr: "Pionnier des Bonnes Actions",
        ur: "نیکیوں میں سبقت لے جانے والا",
      };
    } else if (hasanat >= 10000) {
      level = 3;
      title = {
        ar: "الذاكر المبادر",
        en: "Devoted Seeker",
        fr: "Chercheur Dévoué",
        ur: "مخلص ذاکر",
      };
    } else if (hasanat >= 3000) {
      level = 2;
      title = {
        ar: "المستمسك بالهدي",
        en: "Steadfast Believer",
        fr: "Croyant Constant",
        ur: "صراط مستقیم کا مسافر",
      };
    }

    this.profile.level = level;
    this.profile.levelTitle = title;
  }
}

export const achievementsService = new AchievementsService();
