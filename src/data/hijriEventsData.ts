export interface HijriEventItem {
  id: string;
  nameAr: string;
  nameEn: string;
  hijriDay: number;
  hijriMonth: number;
  hijriMonthNameAr: string;
  hijriMonthNameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  isFastingRecommended?: boolean;
  type: "major_holiday" | "recommended_fasting" | "historical_event";
}

export const HIJRI_MONTHS = [
  { number: 1, nameAr: "مُحَرَّم", nameEn: "Muharram", isSacred: true },
  { number: 2, nameAr: "صَفَر", nameEn: "Safar", isSacred: false },
  { number: 3, nameAr: "رَبِيع الأوَّل", nameEn: "Rabi' al-Awwal", isSacred: false },
  { number: 4, nameAr: "رَبِيع الآخِر", nameEn: "Rabi' al-Thani", isSacred: false },
  { number: 5, nameAr: "جُمَادَى الأُولَى", nameEn: "Jumada al-Awwal", isSacred: false },
  { number: 6, nameAr: "جُمَادَى الآخِرَة", nameEn: "Jumada al-Thani", isSacred: false },
  { number: 7, nameAr: "رَجَب", nameEn: "Rajab", isSacred: true },
  { number: 8, nameAr: "شَعْبَان", nameEn: "Sha'ban", isSacred: false },
  { number: 9, nameAr: "رَمَضَان", nameEn: "Ramadan", isSacred: false, isFastingMonth: true },
  { number: 10, nameAr: "شَوَّال", nameEn: "Shawwal", isSacred: false },
  { number: 11, nameAr: "ذُو القَعْدَة", nameEn: "Dhu al-Qi'dah", isSacred: true },
  { number: 12, nameAr: "ذُو الحِجَّة", nameEn: "Dhu al-Hijjah", isSacred: true },
];

export const MAJOR_ISLAMIC_EVENTS: HijriEventItem[] = [
  {
    id: "hijri-new-year",
    nameAr: "رأس السنة الهجرية",
    nameEn: "Islamic New Year",
    hijriDay: 1,
    hijriMonth: 1,
    hijriMonthNameAr: "محرم",
    hijriMonthNameEn: "Muharram",
    descriptionAr: "ذكرى هجرة النبي ﷺ وبداية التقويم الهجري المبارك.",
    descriptionEn: "Commemoration of the Prophet's migration and the start of the Hijri year.",
    type: "historical_event"
  },
  {
    id: "tasua-ashura",
    nameAr: "تاسوعاء وعاشوراء",
    nameEn: "Tasu'a & Ashura",
    hijriDay: 10,
    hijriMonth: 1,
    hijriMonthNameAr: "محرم",
    hijriMonthNameEn: "Muharram",
    descriptionAr: "يوم نجى الله فيه موسى وقومه من فرعون، وصيامه يكفر ذنوب سنة ماضية.",
    descriptionEn: "The day Allah delivered Prophet Musa from Pharaoh; fasting expiates previous year sins.",
    isFastingRecommended: true,
    type: "recommended_fasting"
  },
  {
    id: "mawlid-nabawi",
    nameAr: "المولد النبوي الشريف",
    nameEn: "Prophet's Birthday",
    hijriDay: 12,
    hijriMonth: 3,
    hijriMonthNameAr: "ربيع الأول",
    hijriMonthNameEn: "Rabi' al-Awwal",
    descriptionAr: "ذكرى ميلاد خاتم الأنبياء والمرسلين نبينا محمد ﷺ رحمة للعالمين.",
    descriptionEn: "Commemoration of the birth of the Messenger Muhammad (ﷺ).",
    type: "historical_event"
  },
  {
    id: "isra-miraj",
    nameAr: "ذكرى الإسراء والمعراج",
    nameEn: "Isra & Mi'raj",
    hijriDay: 27,
    hijriMonth: 7,
    hijriMonthNameAr: "رجب",
    hijriMonthNameEn: "Rajab",
    descriptionAr: "معجزة إِسراء النبي ﷺ من المسجد الحرام إلى الأقصى وعروجه للسموات العلا وفرض الصلوات الخمس.",
    descriptionEn: "The miraculous night journey and ascension to the heavens where the five prayers were prescribed.",
    type: "historical_event"
  },
  {
    id: "nisf-shaban",
    nameAr: "ليلة النصف من شعبان",
    nameEn: "Mid-Sha'ban Night",
    hijriDay: 15,
    hijriMonth: 8,
    hijriMonthNameAr: "شعبان",
    hijriMonthNameEn: "Sha'ban",
    descriptionAr: "ليلة مباركة يستحب فيها قيام الليل والاستغفار ورفع الأعمال إلى الله.",
    descriptionEn: "A blessed night recommended for nocturnal prayers, repentance and supplication.",
    isFastingRecommended: true,
    type: "recommended_fasting"
  },
  {
    id: "ramadan-start",
    nameAr: "أول أيام شهر رمضان المبارك",
    nameEn: "First Day of Ramadan",
    hijriDay: 1,
    hijriMonth: 9,
    hijriMonthNameAr: "رمضان",
    hijriMonthNameEn: "Ramadan",
    descriptionAr: "بداية شهر الصيام والقيام ونزول القرآن والعتق من النار.",
    descriptionEn: "Commencement of the holy month of fasting, night prayers and Quran revelation.",
    isFastingRecommended: true,
    type: "major_holiday"
  },
  {
    id: "laylat-al-qadr",
    nameAr: "ليلة القدر المباركة (العشر الأواخر)",
    nameEn: "Laylat al-Qadr (Night of Decree)",
    hijriDay: 27,
    hijriMonth: 9,
    hijriMonthNameAr: "رمضان",
    hijriMonthNameEn: "Ramadan",
    descriptionAr: "خيرٌ من ألف شهر، تتنزل فيها الملائكة والروح بالسلام حتى مطلع الفجر.",
    descriptionEn: "Better than a thousand months; angels descend with peace until the break of dawn.",
    type: "major_holiday"
  },
  {
    id: "eid-al-fitr",
    nameAr: "عيد الفطر المبارك",
    nameEn: "Eid al-Fitr",
    hijriDay: 1,
    hijriMonth: 10,
    hijriMonthNameAr: "شوال",
    hijriMonthNameEn: "Shawwal",
    descriptionAr: "يوم الفرحة والجوائز للمسلمين بعد إتمام صيام شهر رمضان المبارك.",
    descriptionEn: "Day of celebration and divine reward following the completion of Ramadan.",
    type: "major_holiday"
  },
  {
    id: "shawwal-six",
    nameAr: "صيام الست من شوال",
    nameEn: "Six Days of Shawwal Fasting",
    hijriDay: 2,
    hijriMonth: 10,
    hijriMonthNameAr: "شوال",
    hijriMonthNameEn: "Shawwal",
    descriptionAr: "«من صام رمضان ثم أتبعه بست من شوال كان كصيام الدهر».",
    descriptionEn: "Fasting six days in Shawwal carries the reward of fasting an entire year.",
    isFastingRecommended: true,
    type: "recommended_fasting"
  },
  {
    id: "ten-dhul-hijjah",
    nameAr: "عشر ذي الحجة ويوم عرفة",
    nameEn: "First 10 Days of Dhu al-Hijjah & Day of Arafah",
    hijriDay: 9,
    hijriMonth: 12,
    hijriMonthNameAr: "ذو الحجة",
    hijriMonthNameEn: "Dhu al-Hijjah",
    descriptionAr: "أفضل أيام الدنيا، وصيام يوم عرفة يكفر ذنوب سنتين (ماضية ومستقبلة).",
    descriptionEn: "The most virtuous days; fasting the Day of Arafah expiates sins of two years.",
    isFastingRecommended: true,
    type: "major_holiday"
  },
  {
    id: "eid-al-adha",
    nameAr: "عيد الأضحى المبارك (يوم النحر)",
    nameEn: "Eid al-Adha",
    hijriDay: 10,
    hijriMonth: 12,
    hijriMonthNameAr: "ذو الحجة",
    hijriMonthNameEn: "Dhu al-Hijjah",
    descriptionAr: "عيد التضحية والفداء ومناسك الحج العظيمة وذبح الأضاحي تقرباً لله.",
    descriptionEn: "Feast of Sacrifice commemorating Prophet Ibrahim's devotion and the Hajj pilgrimage.",
    type: "major_holiday"
  }
];

// Helper to estimate Hijri date from Gregorian date mathematically (Umm Al Qura approximation)
export function getEstimatedHijriDate(date: Date = new Date()): {
  day: number;
  month: number;
  monthNameAr: string;
  monthNameEn: string;
  year: number;
  isWhiteDay: boolean;
  isFastingDay: boolean;
} {
  // Use Intl format if supported
  try {
    const formatter = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "numeric",
      year: "numeric"
    });
    const parts = formatter.formatToParts(date);
    const dayPart = parts.find((p) => p.type === "day")?.value;
    const monthPart = parts.find((p) => p.type === "month")?.value;
    const yearPart = parts.find((p) => p.type === "year")?.value;

    const day = dayPart ? parseInt(dayPart, 10) : 15;
    const month = monthPart ? parseInt(monthPart, 10) : 9;
    const year = yearPart ? parseInt(yearPart, 10) : 1448;

    const mMeta = HIJRI_MONTHS.find((m) => m.number === month) || HIJRI_MONTHS[0];
    const isWhiteDay = day === 13 || day === 14 || day === 15;
    const dayOfWeek = date.getDay(); // 1 = Monday, 4 = Thursday
    const isFastingDay = isWhiteDay || dayOfWeek === 1 || dayOfWeek === 4 || month === 9;

    return {
      day,
      month,
      monthNameAr: mMeta.nameAr,
      monthNameEn: mMeta.nameEn,
      year,
      isWhiteDay,
      isFastingDay
    };
  } catch (e) {
    // Graceful fallback for 2026/1448
    return {
      day: 23,
      month: 3,
      monthNameAr: "رَبِيع الأوَّل",
      monthNameEn: "Rabi' al-Awwal",
      year: 1448,
      isWhiteDay: false,
      isFastingDay: false
    };
  }
}
