export interface LiveStreamItem {
  id: string;
  nameAr: string;
  nameEn: string;
  category: "tv_haramain" | "quran_radio" | "reciter_radio" | "specialized_radio";
  streamUrl: string;
  hlsUrl?: string;
  embedUrl?: string;
  descriptionAr: string;
  descriptionEn: string;
  posterImage?: string;
  isAudioOnly: boolean;
}

export const LIVE_STREAMS_LIST: LiveStreamItem[] = [
  // Holy Sanctuaries Live Broadcasts (Real Akamai HLS Live Streams from user Gist)
  {
    id: "tv-makkah",
    nameAr: "قناة القرآن الكريم - مكة المكرمة (بث مباشر رسمي)",
    nameEn: "Saudi Quran TV - Makkah Live",
    category: "tv_haramain",
    streamUrl: "https://cdn-globecast.akamaized.net/live/eds/saudi_quran/hls_roku/index.m3u8",
    hlsUrl: "https://cdn-globecast.akamaized.net/live/eds/saudi_quran/hls_roku/index.m3u8",
    embedUrl: "https://www.youtube-nocookie.com/embed/live_stream?channel=UCos52azQNBgW63_9uDJoPDA",
    descriptionAr: "بث حي مباشر عالي الدقة على مدار 24 ساعة من الكعبة المشرفة والمسجد الحرام بمكة المكرمة مع تلاوات خاشعة.",
    descriptionEn: "24/7 Official HLS Live broadcast from the Holy Kaaba and Grand Mosque in Makkah.",
    isAudioOnly: false
  },
  {
    id: "tv-madinah",
    nameAr: "قناة السنة النبوية - المدينة المنورة (بث مباشر رسمي)",
    nameEn: "Saudi Sunnah TV - Madinah Live",
    category: "tv_haramain",
    streamUrl: "https://cdn-globecast.akamaized.net/live/eds/saudi_sunnah/hls_roku/index.m3u8",
    hlsUrl: "https://cdn-globecast.akamaized.net/live/eds/saudi_sunnah/hls_roku/index.m3u8",
    embedUrl: "https://www.youtube-nocookie.com/embed/live_stream?channel=UC_x5XG1OV2P6uZZ5FSM9Ttw",
    descriptionAr: "بث حي مباشر على مدار الساعة من المسجد النبوي الشريف بالمدينة المنورة والروضة الشريفة مع أحاديث نبوية.",
    descriptionEn: "24/7 Official HLS Live broadcast from Al-Masjid an-Nabawi in Madinah.",
    isAudioOnly: false
  },

  // Cairo Quran Radio (Real endpoint from quran.yousefheiba.com)
  {
    id: "rad-cairo-quran",
    nameAr: "إذاعة القرآن الكريم من القاهرة (بث مباشر)",
    nameEn: "Cairo Holy Quran Radio - Official Live",
    category: "quran_radio",
    streamUrl: "https://quran.yousefheiba.com/api/radio",
    descriptionAr: "البث المباشر الرسمي لإذاعة القرآن الكريم من القاهرة على مدار الساعة، برامج وتلاوات كبار قراء مصر والعالم الإسلامي.",
    descriptionEn: "24/7 Live stream of Cairo Holy Quran Radio.",
    isAudioOnly: true
  },

  // Curated MP3Quran & Qurango High Quality Live Audio Radios
  {
    id: "rad-general-tarteel",
    nameAr: "إذاعة القرآن الكريم - ترتيل",
    nameEn: "Holy Quran Radio - Tarteel",
    category: "quran_radio",
    streamUrl: "https://backup.qurango.net/radio/tarteel",
    descriptionAr: "بث متواصل لأعذب التلاوات القرآنية المرتلة لكبار مشاهير القراء في العالم الإسلامي.",
    descriptionEn: "Continuous recitation from the world's most renowned reciters.",
    isAudioOnly: true
  },
  {
    id: "rad-salma",
    nameAr: "إذاعة تلاوات خاشعة",
    nameEn: "Sublime & Reflective Recitations",
    category: "quran_radio",
    streamUrl: "https://backup.qurango.net/radio/salma",
    descriptionAr: "تلاوات مؤثرة وخاشعة تهز القلوب وتملأ النفس سكينة واطمئناناً.",
    descriptionEn: "Heartfelt, deeply moving recitations for peace and tranquility.",
    isAudioOnly: true
  },
  {
    id: "rad-afs",
    nameAr: "إذاعة الشيخ مشاري راشد العفاسي",
    nameEn: "Sheikh Mishary Al-Afasy Radio",
    category: "reciter_radio",
    streamUrl: "https://backup.qurango.net/radio/mishary_alafasi",
    descriptionAr: "تلاوات المصحف المرتل برواية حفص بصوت القارئ مشاري راشد العفاسي على مدار الساعة.",
    descriptionEn: "24/7 recitations by Sheikh Mishary Rashid Al-Afasy.",
    isAudioOnly: true
  },
  {
    id: "rad-basit",
    nameAr: "إذاعة الشيخ عبد الباسط عبد الصمد",
    nameEn: "Sheikh Abdulbasit Abdulsamad Radio",
    category: "reciter_radio",
    streamUrl: "https://backup.qurango.net/radio/abdulbasit_abdulsamad_mojawwad",
    descriptionAr: "روائع التلاوات المجودة للشيخ عبد الباسط عبد الصمد رحمه الله.",
    descriptionEn: "Timeless Mujawwad recitations by the legendary Sheikh Abdulbasit Abdulsamad.",
    isAudioOnly: true
  },
  {
    id: "rad-minshawi",
    nameAr: "إذاعة الشيخ محمد صديق المنشاوي",
    nameEn: "Sheikh Mohamed Siddiq Al-Minshawi Radio",
    category: "reciter_radio",
    streamUrl: "https://backup.qurango.net/radio/mohammed_siddiq_alminshawi",
    descriptionAr: "الصوت الباكي، تلاوات نادرة ومؤثرة للشيخ محمد صديق المنشاوي.",
    descriptionEn: "Emotional and soul-stirring recitations by Sheikh Al-Minshawi.",
    isAudioOnly: true
  },
  {
    id: "rad-hussary",
    nameAr: "إذاعة الشيخ محمود خليل الحصري",
    nameEn: "Sheikh Mahmoud Khalil Al-Hussary Radio",
    category: "reciter_radio",
    streamUrl: "https://backup.qurango.net/radio/mahmoud_khalil_alhussary",
    descriptionAr: "شيخ عموم المقارئ المصرية، التلاوة المتقنة برواية حفص وقصر المنفصل.",
    descriptionEn: "Master of Tajweed Sheikh Al-Hussary.",
    isAudioOnly: true
  },
  {
    id: "rad-shuraim",
    nameAr: "إذاعة الشيخ سعود الشريم",
    nameEn: "Sheikh Saud Al-Shuraim Radio",
    category: "reciter_radio",
    streamUrl: "https://backup.qurango.net/radio/saud_alshuraim",
    descriptionAr: "تلاوات الحرم المكي الشريف بصوت إمام المسجد الحرام الشيخ الدكتور سعود الشريم.",
    descriptionEn: "Makkah Grand Mosque recitations by Sheikh Saud Al-Shuraim.",
    isAudioOnly: true
  },
  {
    id: "rad-sudais",
    nameAr: "إذاعة الشيخ عبد الرحمن السديس",
    nameEn: "Sheikh Abdulrahman Al-Sudais Radio",
    category: "reciter_radio",
    streamUrl: "https://backup.qurango.net/radio/abdulrahman_alsudaes",
    descriptionAr: "تلاوات الحرم المكي الشريف بصوت إمام وخطيب المسجد الحرام الشيخ عبد الرحمن السديس.",
    descriptionEn: "Recitations from Makkah by Sheikh Abdulrahman Al-Sudais.",
    isAudioOnly: true
  },
  {
    id: "rad-ghamdi",
    nameAr: "إذاعة الشيخ سعد الغامدي",
    nameEn: "Sheikh Saad Al-Ghamdi Radio",
    category: "reciter_radio",
    streamUrl: "https://backup.qurango.net/radio/saad_alghamdi",
    descriptionAr: "تلاوات ندية خاشعة بصوت القارئ الشيخ سعد بن سعيد الغامدي.",
    descriptionEn: "Sweet recitations by Sheikh Saad Al-Ghamdi.",
    isAudioOnly: true
  },
  {
    id: "rad-muaiqly",
    nameAr: "إذاعة الشيخ ماهر المعيقلي",
    nameEn: "Sheikh Maher Al-Muaiqly Radio",
    category: "reciter_radio",
    streamUrl: "https://backup.qurango.net/radio/maher_almuaiqly",
    descriptionAr: "تلاوات الحرم المكي الشريف بصوت إمام المسجد الحرام الشيخ الدكتور ماهر المعيقلي.",
    descriptionEn: "Makkah Grand Mosque recitations by Sheikh Maher Al-Muaiqly.",
    isAudioOnly: true
  },
  {
    id: "rad-fatwa",
    nameAr: "إذاعة الفتاوى الشرعية",
    nameEn: "Islamic Fatwa Radio",
    category: "specialized_radio",
    streamUrl: "https://backup.qurango.net/radio/fatwa",
    descriptionAr: "فتاوى كبار علماء الأمة الإسلامية في العبادات والمعاملات وفقه الصيام والصلاة.",
    descriptionEn: "Reliable Islamic legal rulings and answers from renowned scholars.",
    isAudioOnly: true
  },
  {
    id: "rad-roqya",
    nameAr: "إذاعة الرقية الشرعية",
    nameEn: "Ruqyah Shariah Radio",
    category: "specialized_radio",
    streamUrl: "https://backup.qurango.net/radio/roqiah",
    descriptionAr: "الرقية الشرعية الثابتة من الكتاب والسنة لعلاج الحسد والعين والسكينة النفسية.",
    descriptionEn: "Authentic Quranic healing and supplications for peace of mind.",
    isAudioOnly: true
  },
  {
    id: "rad-tafsir",
    nameAr: "إذاعة تفسير القرآن الكريم",
    nameEn: "Quran Tafsir Radio",
    category: "specialized_radio",
    streamUrl: "https://backup.qurango.net/radio/tafseer",
    descriptionAr: "دروس وشروحات ميسرة لمعاني آيات الذكر الحكيم.",
    descriptionEn: "Simplified explanations and exegesis of Quranic verses.",
    isAudioOnly: true
  }
];
