export interface MosqueItem {
  id: string;
  nameAr: string;
  nameEn: string;
  cityAr: string;
  cityEn: string;
  countryAr: string;
  countryEn: string;
  lat: number;
  lng: number;
  capacity?: number;
  historicalNoteAr: string;
  historicalNoteEn: string;
  isSanctuary?: boolean;
}

export const FAMOUS_GLOBAL_MOSQUES: MosqueItem[] = [
  {
    id: "m-haram",
    nameAr: "المسجد الحرام والكعبة المشرفة",
    nameEn: "Masjid al-Haram & Holy Kaaba",
    cityAr: "مكة المكرمة",
    cityEn: "Makkah",
    countryAr: "المملكة العربية السعودية",
    countryEn: "Saudi Arabia",
    lat: 21.4225,
    lng: 39.8262,
    capacity: 4000000,
    historicalNoteAr: "أعظم مسجد في الإسلام، قبلة المسلمين في صلاتهم، والصلاة فيه بمائة ألف صلاة.",
    historicalNoteEn: "The holiest site in Islam and Qibla of all Muslims; a single prayer here equals 100,000 elsewhere.",
    isSanctuary: true
  },
  {
    id: "m-nabawi",
    nameAr: "المسجد النبوي الشريف",
    nameEn: "Al-Masjid an-Nabawi",
    cityAr: "المدينة المنورة",
    cityEn: "Madinah",
    countryAr: "المملكة العربية السعودية",
    countryEn: "Saudi Arabia",
    lat: 24.4672,
    lng: 39.6111,
    capacity: 1000000,
    historicalNoteAr: "مسجد رسول الله ﷺ والروضة الشريفة، والصلاة فيه خير من ألف صلاة فيما سواه إلا المسجد الحرام.",
    historicalNoteEn: "The mosque built by Prophet Muhammad (ﷺ) housing the Rawdah; a prayer here equals 1,000 elsewhere.",
    isSanctuary: true
  },
  {
    id: "m-aqsa",
    nameAr: "المسجد الأقصى المبارك وقبة الصخرة",
    nameEn: "Al-Aqsa Mosque & Dome of the Rock",
    cityAr: "القدس الشريف",
    cityEn: "Jerusalem",
    countryAr: "فلسطين",
    countryEn: "Palestine",
    lat: 31.7761,
    lng: 35.2358,
    capacity: 400000,
    historicalNoteAr: "أولى القبلتين وثالث الحرمين الشريفين ومسرى رسول الله ﷺ في ليلة الإسراء والمعراج.",
    historicalNoteEn: "The first Qibla and third holiest sanctuary in Islam; destination of the Prophet's Night Journey.",
    isSanctuary: true
  },
  {
    id: "m-azhar",
    nameAr: "جامع الأزهر الشريف",
    nameEn: "Al-Azhar Mosque",
    cityAr: "القاهرة",
    cityEn: "Cairo",
    countryAr: "مصر",
    countryEn: "Egypt",
    lat: 30.0457,
    lng: 31.2627,
    capacity: 20000,
    historicalNoteAr: "منارة العلم والوسطية في العالم الإسلامي منذ أكثر من ألف عام (تأسس عام 972م).",
    historicalNoteEn: "Historic beacon of Islamic scholarship and moderation founded over a millennium ago (972 CE)."
  },
  {
    id: "m-sultan-ahmet",
    nameAr: "جامع السلطان أحمد (المسجد الأزرق)",
    nameEn: "Sultan Ahmed Mosque (Blue Mosque)",
    cityAr: "إسطنبول",
    cityEn: "Istanbul",
    countryAr: "تركيا",
    countryEn: "Turkey",
    lat: 41.0054,
    lng: 28.9768,
    capacity: 10000,
    historicalNoteAr: "تحفة العمارة العثمانية الشهيرة بمآذنها الست وزخارف البلاط الإزنيقي الأزرق الفاخر.",
    historicalNoteEn: "Iconic masterpiece of Ottoman architecture with six minarets and handmade blue Iznik tiles."
  },
  {
    id: "m-sheikh-zayed",
    nameAr: "جامع الشيخ زايد الكبير",
    nameEn: "Sheikh Zayed Grand Mosque",
    cityAr: "أبوظبي",
    cityEn: "Abu Dhabi",
    countryAr: "الإمارات العربية المتحدة",
    countryEn: "UAE",
    lat: 24.4128,
    lng: 54.4750,
    capacity: 40000,
    historicalNoteAr: "صرح معماري إسلامي حديث يضم أكبر سجادة يدوية وثريات كريستال عملاقة وقباباً رخامية ناصعة.",
    historicalNoteEn: "Modern architectural marvel featuring pristine white marble domes and world's largest hand-knotted carpet."
  },
  {
    id: "m-istiqlal",
    nameAr: "مسجد الاستقلال",
    nameEn: "Istiqlal Mosque",
    cityAr: "جاكرتا",
    cityEn: "Jakarta",
    countryAr: "إندونيسيا",
    countryEn: "Indonesia",
    lat: -6.1702,
    lng: 106.8317,
    capacity: 200000,
    historicalNoteAr: "أكبر مسجد في جنوب شرق آسيا، صُمم كرمز لاستقلال إندونيسيا وتوحيد المسلمين.",
    historicalNoteEn: "The largest mosque in Southeast Asia, built to commemorate Indonesian national independence."
  },
  {
    id: "m-hassan-ii",
    nameAr: "مسجد الحسن الثاني",
    nameEn: "Hassan II Mosque",
    cityAr: "الدار البيضاء",
    cityEn: "Casablanca",
    countryAr: "المغرب",
    countryEn: "Morocco",
    lat: 33.6086,
    lng: -7.6327,
    capacity: 105000,
    historicalNoteAr: "يطل على المحيط الأطلسي، وتصل مئذنته إلى 210 أمتار مع أرضية زجاجية تطل على مياه البحر.",
    historicalNoteEn: "Magnificent mosque projecting over the Atlantic Ocean with a 210-meter minaret."
  }
];

// Helper to calculate distance in Kilometers between two coordinates
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}
