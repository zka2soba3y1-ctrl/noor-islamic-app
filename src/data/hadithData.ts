export interface HadithItem {
  id: string;
  collection: string;
  collectionNameAr: string;
  collectionNameEn?: string;
  hadithNumber: number;
  chapterAr?: string;
  chapterEn?: string;
  narratorAr?: string;
  matnAr: string;
  matnEn?: string;
  grade: string;
  gradeEn?: string;
  reference?: string;
  tags?: string[];
  dorarVerifyUrl?: string;
}

export interface HadithCollectionMeta {
  id: string;
  nameAr: string;
  nameEn: string;
  authorAr: string;
  total: number;
  gradeAr: string;
}

export const HADITH_COLLECTIONS: HadithCollectionMeta[] = [
  {
    id: "bukhari",
    nameAr: "صحيح البخاري",
    nameEn: "Sahih Al-Bukhari",
    authorAr: "الإمام محمد بن إسماعيل البخاري",
    total: 7008,
    gradeAr: "أصح كتب الحديث بالإجماع",
  },
  {
    id: "muslim",
    nameAr: "صحيح مسلم",
    nameEn: "Sahih Muslim",
    authorAr: "الإمام مسلم بن الحجاج النيسابوري",
    total: 4930,
    gradeAr: "صحيح بالإجماع",
  },
  {
    id: "abu-dawud",
    nameAr: "سنن أبي داود",
    nameEn: "Sunan Abi Dawud",
    authorAr: "الإمام أبو داود السجستاني",
    total: 4590,
    gradeAr: "سنن صحاح وحسان",
  },
  {
    id: "tirmidzi",
    nameAr: "جامع الترمذي",
    nameEn: "Jami' at-Tirmidhi",
    authorAr: "الإمام أبو عيسى الترمذي",
    total: 3956,
    gradeAr: "الجامع المختصر والسنن",
  },
  {
    id: "nasai",
    nameAr: "سنن النسائي",
    nameEn: "Sunan an-Nasa'i",
    authorAr: "الإمام أحمد بن شعيب النسائي",
    total: 5758,
    gradeAr: "المجتبى من السنن",
  },
  {
    id: "ibnu-majah",
    nameAr: "سنن ابن ماجه",
    nameEn: "Sunan Ibn Majah",
    authorAr: "الإمام ابن ماجه القزويني",
    total: 4341,
    gradeAr: "السنن الأربعة",
  },
  {
    id: "malik",
    nameAr: "موطأ مالك",
    nameEn: "Muwatta Malik",
    authorAr: "الإمام مالك بن أنس (إمام دار الهجرة)",
    total: 1850,
    gradeAr: "أصح كتب الآثار والفقه",
  },
  {
    id: "ahmad",
    nameAr: "مسند أحمد",
    nameEn: "Musnad Ahmad",
    authorAr: "الإمام أحمد بن حنبل الشيباني",
    total: 4305,
    gradeAr: "المسند الجامع الكبير",
  },
  {
    id: "darimi",
    nameAr: "سنن الدارمي",
    nameEn: "Sunan ad-Darimi",
    authorAr: "الإمام عبد الله بن عبد الرحمن الدارمي",
    total: 3367,
    gradeAr: "سنن وآثار معتبرة",
  },
  {
    id: "nawawi40",
    nameAr: "الأربعون النووية",
    nameEn: "40 Hadith Nawawi",
    authorAr: "الإمام يحيى بن شرف النووي",
    total: 42,
    gradeAr: "صحيح وحسن معتمد",
  },
];

export const HADITH_DATABASE: HadithItem[] = [
  {
    id: "h-1",
    collection: "nawawi40",
    collectionNameAr: "الأربعون النووية",
    collectionNameEn: "40 Hadith Nawawi",
    hadithNumber: 1,
    chapterAr: "الإخلاص والنية",
    chapterEn: "Sincerity & Intention",
    narratorAr: "عمر بن الخطاب رضي الله عنه",
    matnAr: "سَمِعْتُ رَسُولَ اللَّهِ ﷺ يَقُولُ: «إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى، فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى دُنْيَا يُصِيبُهَا، أَوْ إِلَى امْرَأَةٍ يَنْكِحُهَا، فَهِجْرَتُهُ إِلَى مَا هَاجَرَ إِلَيْهِ».",
    matnEn: "I heard the Messenger of Allah (ﷺ) say: 'Actions are judged by motives (intentions), so each man will have what he intended. Thus, he whose migration was for Allah and His Messenger, his migration is for Allah and His Messenger; but he whose migration was for some worldly thing he might gain, or for a wife he might marry, his migration is for that for which he migrated.'",
    grade: "متفق عليه",
    gradeEn: "Muttafaqun Alayh",
    reference: "رواه البخاري (1) ومسلم (1907)",
    tags: ["النية", "الإخلاص", "الهجرة", "أساسيات الإسلام"]
  },
  {
    id: "h-2",
    collection: "nawawi40",
    collectionNameAr: "الأربعون النووية",
    collectionNameEn: "40 Hadith Nawawi",
    hadithNumber: 2,
    chapterAr: "مراتب الدين (الإسلام والإيمان والإحسان)",
    chapterEn: "Pillars of Islam, Iman and Ihsan",
    narratorAr: "عمر بن الخطاب رضي الله عنه",
    matnAr: "بَيْنَمَا نَحْنُ عِنْدَ رَسُولِ اللَّهِ ﷺ ذَاتَ يَوْمٍ، إِذْ طَلَعَ عَلَيْنَا رَجُلٌ شَدِيدُ بَيَاضِ الثِّيَابِ شَدِيدُ سَوَادِ الشَّعَرِ، لا يُرَى عَلَيْهِ أَثَرُ السَّفَرِ وَلا يَعْرِفُهُ مِنَّا أَحَدٌ... فَقَالَ: يَا مُحَمَّدُ أَخْبِرْنِي عَنِ الإِسْلامِ؟ فَقَالَ ﷺ: «الإِسْلامُ أَنْ تَشْهَدَ أَنْ لا إِلَهَ إِلا اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ، وَتُقِيمَ الصَّلاةَ، وَتُؤْتِيَ الزَّكَاةَ، وَتَصُومَ رَمَضَانَ، وَتَحُجَّ الْبَيْتَ إِنِ اسْتَطَعْتَ إِلَيْهِ سَبِيلا»... قَالَ: فَأَخْبِرْنِي عَنِ الإِحْسَانِ؟ قَالَ: «أَنْ تَعْبُدَ اللَّهَ كَأَنَّكَ تَرَاهُ، فَإِنْ لَمْ تَكُنْ تَرَاهُ فَإِنَّهُ يَرَاكَ»... ثُمَّ قَالَ ﷺ: «فَإِنَّهُ جِبْرِيلُ أَتَاكُمْ يُعَلِّمُكُمْ دِينَكُمْ».",
    matnEn: "While we were one day sitting with the Messenger of Allah (ﷺ), there appeared before us a man with very white clothing and very black hair. No marks of travel were on him, and none of us knew him... He said: 'O Muhammad, inform me about Islam.' The Messenger of Allah (ﷺ) said: 'Islam is to testify that there is no god but Allah and Muhammad is the messenger of Allah, to perform the prayers, to pay the Zakat, to fast in Ramadan, and to make the pilgrimage to the House if you are able.'... He said: 'Inform me about Ihsan.' He replied: 'It is to worship Allah as if you can see Him, for if you do not see Him, He surely sees you.'... Then he said: 'That was Gabriel who came to teach you your religion.'",
    grade: "صحيح",
    gradeEn: "Sahih",
    reference: "رواه مسلم (8)",
    tags: ["حديث جبريل", "أركان الإسلام", "الإيمان", "الإحسان", "عقيدة"]
  },
  {
    id: "h-3",
    collection: "bukhari",
    collectionNameAr: "صحيح البخاري",
    collectionNameEn: "Sahih Al-Bukhari",
    hadithNumber: 5027,
    chapterAr: "فضائل القرآن",
    chapterEn: "Virtues of the Quran",
    narratorAr: "عثمان بن عفان رضي الله عنه",
    matnAr: "عَنِ النَّبِيِّ ﷺ قَالَ: «خَيْرُكُمْ مَنْ تَعَلَّمَ القُرْآنَ وَعَلَّمَهُ».",
    matnEn: "The Prophet (ﷺ) said: 'The best among you (Muslims) are those who learn the Qur'an and teach it.'",
    grade: "صحيح",
    gradeEn: "Sahih",
    reference: "صحيح البخاري، كتاب فضائل القرآن، باب خيركم من تعلم القرآن وعلمه",
    tags: ["القرآن الكريم", "التعليم", "فضل العلم"]
  },
  {
    id: "h-4",
    collection: "bukhari",
    collectionNameAr: "صحيح البخاري",
    collectionNameEn: "Sahih Al-Bukhari",
    hadithNumber: 13,
    chapterAr: "كتاب الإيمان",
    chapterEn: "Book of Faith",
    narratorAr: "أنس بن مالك رضي الله عنه",
    matnAr: "عَنِ النَّبِيِّ ﷺ قَالَ: «لا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ».",
    matnEn: "The Prophet (ﷺ) said: 'None of you truly believes until he loves for his brother what he loves for himself.'",
    grade: "متفق عليه",
    gradeEn: "Muttafaqun Alayh",
    reference: "صحيح البخاري (13) وصحيح مسلم (45)",
    tags: ["الأخوة", "الإيمان", "المحبة", "مكارم الأخلاق"]
  },
  {
    id: "h-5",
    collection: "muslim",
    collectionNameAr: "صحيح مسلم",
    collectionNameEn: "Sahih Muslim",
    hadithNumber: 2699,
    chapterAr: "فضل مجالس الذكر وطلب العلم",
    chapterEn: "Virtues of Gathering for Dhikr & Knowledge",
    narratorAr: "أبو هريرة رضي الله عنه",
    matnAr: "قَالَ رَسُولُ اللَّهِ ﷺ: «مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا، سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ، وَمَا اجْتَمَعَ قَوْمٌ فِي بَيْتٍ مِنْ بُيُوتِ اللَّهِ، يَتْلُونَ كِتَابَ اللَّهِ، وَيَتَدَارَسُونَهُ بَيْنَهُمْ، إِلا نَزَلَتْ عَلَيْهِمُ السَّكِينَةُ، وَغَشِيَتْهُمُ الرَّحْمَةُ، وَحَفَّتْهُمُ الْمَلائِكَةُ، وَذَكَرَهُمُ اللَّهُ فِيمَنْ عِنْدَهُ».",
    matnEn: "The Messenger of Allah (ﷺ) said: 'Whoever follows a path in pursuit of knowledge, Allah will make easy for him a path to Paradise. No people gather together in one of the houses of Allah, reciting the Book of Allah and studying it among themselves, except that tranquility descends upon them, mercy envelops them, the angels surround them, and Allah mentions them among those who are with Him.'",
    grade: "صحيح",
    gradeEn: "Sahih",
    reference: "صحيح مسلم (2699)",
    tags: ["طلب العلم", "السكينة", "حلقات القرآن", "الجنة"]
  },
  {
    id: "h-6",
    collection: "muslim",
    collectionNameAr: "صحيح مسلم",
    collectionNameEn: "Sahih Muslim",
    hadithNumber: 223,
    chapterAr: "فضل الطهور والصلاة",
    chapterEn: "Virtue of Purification & Prayer",
    narratorAr: "أبو مالك الأشعري رضي الله عنه",
    matnAr: "قَالَ رَسُولُ اللَّهِ ﷺ: «الطُّهُورُ شَطْرُ الإِيمَانِ، وَالْحَمْدُ لِلَّهِ تَمْلأُ الْمِيزَانَ، وَسُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ تَمْلآنِ - أَوْ تَمْلأُ - مَا بَيْنَ السَّمَاوَاتِ وَالأَرْضِ، وَالصَّلاةُ نُورٌ، وَالصَّدَقَةُ بُرْهَانٌ، وَالصَّبْرُ ضِيَاءٌ، وَالْقُرْآنُ حُجَّةٌ لَكَ أَوْ عَلَيْكَ، كُلُّ النَّاسِ يَغْدُو فَبَائِعٌ نَفْسَهُ فَمُعْتِقُهَا أَوْ مُوبِقُهَا».",
    matnEn: "The Messenger of Allah (ﷺ) said: 'Purity is half of iman (faith). 'Al-hamdu lillah' (praise be to Allah) fills the scale. 'Subhan Allah' (glory be to Allah) and 'Al-hamdu lillah' fill that which is between heaven and earth. Prayer is a light, charity is a proof, patience is illumination, and the Qur'an is an argument for you or against you. Every person starts his day as a vendor of his soul, either freeing it or bringing about its ruin.'",
    grade: "صحيح",
    gradeEn: "Sahih",
    reference: "صحيح مسلم (223)",
    tags: ["الطهور", "الأذكار", "الصلاة", "الصبر", "الصدقة"]
  },
  {
    id: "h-7",
    collection: "riyad",
    collectionNameAr: "رياض الصالحين",
    collectionNameEn: "Riyad as-Salihin",
    hadithNumber: 54,
    chapterAr: "باب الصدق",
    chapterEn: "Chapter on Truthfulness",
    narratorAr: "عبد الله بن مسعود رضي الله عنه",
    matnAr: "عَنِ النَّبِيِّ ﷺ قَالَ: «إِنَّ الصِّدْقَ يَهْدِي إِلَى البِرِّ، وَإِنَّ البِرَّ يَهْدِي إِلَى الجَنَّةِ، وَإِنَّ الرَّجُلَ لَيَصْدُقُ حَتَّى يُكْتَبَ صِدِّيقًا، وَإِنَّ الكَذِبَ يَهْدِي إِلَى الفُجُورِ، وَإِنَّ الفُجُورَ يَهْدِي إِلَى النَّارِ، وَإِنَّ الرَّجُلَ لَيَكْذِبُ حَتَّى يُكْتَبَ كَذَّابًا».",
    matnEn: "The Prophet (ﷺ) said: 'Truthfulness leads to righteousness, and righteousness leads to Paradise. And a man keeps on telling the truth until he becomes a truthful person. Falsehood leads to wickedness, and wickedness leads to the Hell Fire, and a man keeps on telling lies until he is written as a liar before Allah.'",
    grade: "متفق عليه",
    gradeEn: "Muttafaqun Alayh",
    reference: "صحيح البخاري (6094) وصحيح مسلم (2607)",
    tags: ["الصدق", "البر", "الأخلاق", "الجنة"]
  },
  {
    id: "h-8",
    collection: "bukhari",
    collectionNameAr: "صحيح البخاري",
    collectionNameEn: "Sahih Al-Bukhari",
    hadithNumber: 6011,
    chapterAr: "الرحمة بالخلق",
    chapterEn: "Mercy to Creation",
    narratorAr: "عبد الله بن عمرو رضي الله عنهما",
    matnAr: "قَالَ رَسُولُ اللَّهِ ﷺ: «الرَّاحِمُونَ يَرْحَمُهُمُ الرَّحْمَنُ، ارْحَمُوا مَنْ فِي الأَرْضِ يَرْحَمْكُمْ مَنْ فِي السَّمَاءِ».",
    matnEn: "The Messenger of Allah (ﷺ) said: 'The merciful will be shown mercy by the Most Merciful. Be merciful to those on the earth and the One in the heavens will have mercy upon you.'",
    grade: "صحيح",
    gradeEn: "Sahih",
    reference: "سنن أبي داود (4941) والترمذي (1924) وأصله في الصحيح",
    tags: ["الرحمة", "الإحسان", "الرفق"]
  },
  {
    id: "h-9",
    collection: "nawawi40",
    collectionNameAr: "الأربعون النووية",
    collectionNameEn: "40 Hadith Nawawi",
    hadithNumber: 15,
    chapterAr: "حفظ اللسان وإكرام الضيف والجار",
    chapterEn: "Guarding Speech & Honoring Neighbors",
    narratorAr: "أبو هريرة رضي الله عنه",
    matnAr: "عَنْ رَسُولِ اللَّهِ ﷺ قَالَ: «مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ، وَمَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيُكْرِمْ جَارَهُ، وَمَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيُكْرِمْ ضَيْفَهُ».",
    matnEn: "The Messenger of Allah (ﷺ) said: 'Let him who believes in Allah and the Last Day speak good, or keep silent; and let him who believes in Allah and the Last Day be generous to his neighbor; and let him who believes in Allah and the Last Day be generous to his guest.'",
    grade: "متفق عليه",
    gradeEn: "Muttafaqun Alayh",
    reference: "رواه البخاري (6018) ومسلم (47)",
    tags: ["حفظ اللسان", "إكرام الجار", "الضيافة", "الأخلاق"]
  },
  {
    id: "h-10",
    collection: "riyad",
    collectionNameAr: "رياض الصالحين",
    collectionNameEn: "Riyad as-Salihin",
    hadithNumber: 1408,
    chapterAr: "فضل الاستغفار والتوبة",
    chapterEn: "Virtue of Seeking Forgiveness & Repentance",
    narratorAr: "أنس بن مالك رضي الله عنه",
    matnAr: "سَمِعْتُ رَسُولَ اللَّهِ ﷺ يَقُولُ: «قَالَ اللَّهُ تَبَارَكَ وَتَعَالَى: يَا ابْنَ آدَمَ، إِنَّكَ مَا دَعَوْتَنِي وَرَجَوْتَنِي غَفَرْتُ لَكَ عَلَى مَا كَانَ فِيكَ وَلا أُبَالِي، يَا ابْنَ آدَمَ، لَوْ بَلَغَتْ ذُنُوبُكَ عَنَانَ السَّمَاءِ ثُمَّ اسْتَغْفَرْتَنِي غَفَرْتُ لَكَ، يَا ابْنَ آدَمَ، إِنَّكَ لَوْ أَتَيْتَنِي بِقُرَابِ الأَرْضِ خَطَايَا ثُمَّ لَقِيتَنِي لا تُشْرِكُ بِي شَيْئًا لأَتَيْتُكَ بِقُرَابِهَا مَغْفِرَةً».",
    matnEn: "I heard the Messenger of Allah (ﷺ) say: 'Allah the Almighty said: O son of Adam, so long as you call upon Me and ask of Me, I shall forgive you for what you have done, and I shall not mind. O son of Adam, were your sins to reach the clouds of the sky and were you then to ask forgiveness of Me, I would forgive you. O son of Adam, were you to come to Me with sins nearly as great as the earth and were you then to face Me, ascribing no partner to Me, I would bring you forgiveness nearly as great as it.'",
    grade: "صحيح",
    gradeEn: "Sahih",
    reference: "رواه الترمذي (3540) وقال حديث حسن صحيح",
    tags: ["حديث قدسي", "التوبة", "المغفرة", "سعة رحمة الله", "التوحيد"]
  }
];
