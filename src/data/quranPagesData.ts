export interface JuzItem {
  number: number;
  nameAr: string;
  startSurahName: string;
  startSurahNumber: number;
  startAyah: number;
  startPage: number;
  endPage: number;
}

export const ALL_JUZ_LIST: JuzItem[] = [
  { number: 1, nameAr: "الجزء ١ (الم)", startSurahName: "الفاتحة", startSurahNumber: 1, startAyah: 1, startPage: 1, endPage: 21 },
  { number: 2, nameAr: "الجزء ٢ (سيقول)", startSurahName: "البقرة", startSurahNumber: 2, startAyah: 142, startPage: 22, endPage: 41 },
  { number: 3, nameAr: "الجزء ٣ (تلك الرسل)", startSurahName: "البقرة", startSurahNumber: 2, startAyah: 253, startPage: 42, endPage: 61 },
  { number: 4, nameAr: "الجزء ٤ (لن تنالوا)", startSurahName: "آل عمران", startSurahNumber: 3, startAyah: 93, startPage: 62, endPage: 81 },
  { number: 5, nameAr: "الجزء ٥ (والمحصنات)", startSurahName: "النساء", startSurahNumber: 4, startAyah: 24, startPage: 82, endPage: 101 },
  { number: 6, nameAr: "الجزء ٦ (لا يحب الله)", startSurahName: "النساء", startSurahNumber: 4, startAyah: 148, startPage: 102, endPage: 121 },
  { number: 7, nameAr: "الجزء ٧ (وإذا سمعوا)", startSurahName: "المائدة", startSurahNumber: 5, startAyah: 82, startPage: 122, endPage: 141 },
  { number: 8, nameAr: "الجزء ٨ (ولو أننا)", startSurahName: "الأنعام", startSurahNumber: 6, startAyah: 111, startPage: 142, endPage: 161 },
  { number: 9, nameAr: "الجزء ٩ (قال الملأ)", startSurahName: "الأعراف", startSurahNumber: 7, startAyah: 88, startPage: 162, endPage: 181 },
  { number: 10, nameAr: "الجزء ١٠ (واعلموا)", startSurahName: "الأنفال", startSurahNumber: 8, startAyah: 41, startPage: 182, endPage: 201 },
  { number: 11, nameAr: "الجزء ١١ (يعتذرون)", startSurahName: "التوبة", startSurahNumber: 9, startAyah: 93, startPage: 202, endPage: 221 },
  { number: 12, nameAr: "الجزء ١٢ (وما من دابة)", startSurahName: "هود", startSurahNumber: 11, startAyah: 6, startPage: 222, endPage: 241 },
  { number: 13, nameAr: "الجزء ١٣ (وما أبرئ)", startSurahName: "يوسف", startSurahNumber: 12, startAyah: 53, startPage: 242, endPage: 261 },
  { number: 14, nameAr: "الجزء ١٤ (ربما)", startSurahName: "الحجر", startSurahNumber: 15, startAyah: 1, startPage: 262, endPage: 281 },
  { number: 15, nameAr: "الجزء ١٥ (سبحان)", startSurahName: "الإسراء", startSurahNumber: 17, startAyah: 1, startPage: 282, endPage: 301 },
  { number: 16, nameAr: "الجزء ١٦ (قال ألم)", startSurahName: "الكهف", startSurahNumber: 18, startAyah: 75, startPage: 302, endPage: 321 },
  { number: 17, nameAr: "الجزء ١٧ (اقترب)", startSurahName: "الأنبياء", startSurahNumber: 21, startAyah: 1, startPage: 322, endPage: 341 },
  { number: 18, nameAr: "الجزء ١٨ (قد أفلح)", startSurahName: "المؤمنون", startSurahNumber: 23, startAyah: 1, startPage: 342, endPage: 361 },
  { number: 19, nameAr: "الجزء ١٩ (وقال الذين)", startSurahName: "الفرقان", startSurahNumber: 25, startAyah: 21, startPage: 362, endPage: 381 },
  { number: 20, nameAr: "الجزء ٢٠ (أمن خلق)", startSurahName: "النمل", startSurahNumber: 27, startAyah: 56, startPage: 382, endPage: 401 },
  { number: 21, nameAr: "الجزء ٢١ (اتل ما أوحي)", startSurahName: "العنكبوت", startSurahNumber: 29, startAyah: 46, startPage: 402, endPage: 421 },
  { number: 22, nameAr: "الجزء ٢٢ (ومن يقنت)", startSurahName: "الأحزاب", startSurahNumber: 33, startAyah: 31, startPage: 422, endPage: 441 },
  { number: 23, nameAr: "الجزء ٢٣ (وما لي)", startSurahName: "يس", startSurahNumber: 36, startAyah: 28, startPage: 442, endPage: 461 },
  { number: 24, nameAr: "الجزء ٢٤ (فمن أظلم)", startSurahName: "الزمر", startSurahNumber: 39, startAyah: 32, startPage: 462, endPage: 481 },
  { number: 25, nameAr: "الجزء ٢٥ (إليه يرد)", startSurahName: "فصلت", startSurahNumber: 41, startAyah: 47, startPage: 482, endPage: 501 },
  { number: 26, nameAr: "الجزء ٢٦ (حم)", startSurahName: "الأحقاف", startSurahNumber: 46, startAyah: 1, startPage: 502, endPage: 521 },
  { number: 27, nameAr: "الجزء ٢٧ (قال فما خطبكم)", startSurahName: "الذاريات", startSurahNumber: 51, startAyah: 31, startPage: 522, endPage: 541 },
  { number: 28, nameAr: "الجزء ٢٨ (قد سمع)", startSurahName: "المجادلة", startSurahNumber: 58, startAyah: 1, startPage: 542, endPage: 561 },
  { number: 29, nameAr: "الجزء ٢٩ (تبارك)", startSurahName: "الملك", startSurahNumber: 67, startAyah: 1, startPage: 562, endPage: 581 },
  { number: 30, nameAr: "الجزء ٣٠ (عمّ)", startSurahName: "النبأ", startSurahNumber: 78, startAyah: 1, startPage: 582, endPage: 604 },
];

/**
 * Returns formatted 3-digit page number (e.g. 1 -> "001", 604 -> "604")
 */
export function formatPageCode(page: number): string {
  if (page < 10) return `00${page}`;
  if (page < 100) return `0${page}`;
  return `${page}`;
}

/**
 * High quality Madinah Quran Mushaf Page image from official King Fahd Quran pages API
 */
export function getMushafPageImageUrl(page: number): string {
  const code = formatPageCode(page);
  return `https://quran.yousefheiba.com/api/quran-pages/${code}.png`;
}

export function getMushafPageImageMirrors(page: number): string[] {
  const code = formatPageCode(page);
  return [
    `https://quran.yousefheiba.com/api/quran-pages/${code}.png`,
    `https://android.quran.com/data/width_1260/page${code}.png`,
    `https://everyayah.com/data/quranpages_png/page${code}.png`,
    `https://cdn.islamic.network/quran/images/high-resolution/${page}.png`,
    `https://raw.githubusercontent.com/The-Quran-Project/Quran-Pages/master/images/${code}.png`,
  ];
}

/**
 * Returns which Juz a given page belongs to
 */
export function getJuzForPage(page: number): JuzItem {
  const found = ALL_JUZ_LIST.find((j) => page >= j.startPage && page <= j.endPage);
  return found || ALL_JUZ_LIST[0];
}

/**
 * Medina Mushaf 604-page starting page for all 114 surahs (1-indexed)
 */
export const SURAH_START_PAGE_MAP: number[] = [
  0, // 0 index dummy
  1, 2, 50, 77, 106, 128, 151, 177, 187, 208, // 1-10
  221, 235, 249, 255, 262, 267, 282, 293, 305, 312, // 11-20
  322, 332, 342, 350, 359, 367, 377, 385, 396, 404, // 21-30
  411, 415, 418, 428, 434, 440, 446, 453, 458, 467, // 31-40
  477, 483, 489, 496, 499, 502, 507, 511, 515, 518, // 41-50
  520, 523, 526, 528, 531, 534, 537, 542, 545, 549, // 51-60
  551, 553, 554, 556, 558, 560, 562, 564, 566, 568, // 61-70
  570, 572, 574, 575, 577, 578, 580, 582, 583, 585, // 71-80
  586, 587, 587, 589, 590, 591, 591, 592, 593, 594, // 81-90
  595, 595, 596, 596, 597, 597, 598, 598, 599, 599, // 91-100
  600, 600, 601, 601, 601, 602, 602, 602, 603, 603, // 101-110
  603, 604, 604, 604 // 111-114
];

export function getSurahStartPage(surahNumber: number): number {
  if (surahNumber >= 1 && surahNumber <= 114) {
    return SURAH_START_PAGE_MAP[surahNumber] || 1;
  }
  return 1;
}
