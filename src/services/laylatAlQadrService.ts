/**
 * Laylat Al-Qadr Service: Fetches comprehensive insights from https://quran.yousefheiba.com/api/laylatAlQadr
 * Provides rich spiritual content, verified Quranic & Hadith evidences, signs, and worship checklist.
 */

export interface LaylatAlQadrData {
  definition: {
    name: string;
    value: string;
  };
  virtue: {
    name: string;
    value: string;
  };
  quranic_evidence: {
    name: string;
    surah_al_qadr: string;
    surah_al_dukhan?: string;
  };
  hadith_evidence: {
    name: string;
    bukhari: string;
    muslim: string;
  };
  naming_reasons: {
    name: string;
    greatness: string;
    predestination: string;
  };
  signs: {
    name: string;
    confirmed: string[];
    unconfirmed: string[];
  };
  recommended_acts: {
    name: string;
    acts: string[];
  };
  importance: {
    name: string;
    quran_revelation: string;
    angels_descend: string;
    decrees_written: string;
  };
  scholars_opinions: {
    name: string;
    ibn_kathir: string;
    ibn_taymiyyah: string;
  };
  date: {
    name: string;
    value: string;
  };
}

const LAYLAT_AL_QADR_API_URL = "https://quran.yousefheiba.com/api/laylatAlQadr";
const CACHE_KEY = "noor_laylat_al_qadr_cache_v1";

export async function fetchLaylatAlQadrData(): Promise<LaylatAlQadrData> {
  try {
    const response = await fetch(LAYLAT_AL_QADR_API_URL, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });

    if (response.ok) {
      const json = await response.json();
      if (json && json.laylat_al_qadr) {
        if (typeof window !== "undefined") {
          localStorage.setItem(CACHE_KEY, JSON.stringify(json.laylat_al_qadr));
        }
        return json.laylat_al_qadr;
      }
    }
  } catch (error) {
    console.warn("Laylat Al-Qadr API network fetch failed, using fallback or cache:", error);
  }

  // Fallback 1: LocalStorage Cache
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {}
  }

  // Fallback 2: Comprehensive offline data
  return OFFLINE_LAYLAT_AL_QADR;
}

export const OFFLINE_LAYLAT_AL_QADR: LaylatAlQadrData = {
  definition: {
    name: "التعريف",
    value: "ليلة القدر هي إحدى ليالي العشر الأواخر من شهر رمضان، وتعد من أعظم ليالي السنة في الإسلام حيث أنزل فيها القرآن الكريم.",
  },
  virtue: {
    name: "الفضل",
    value: "ليلة القدر خير من ألف شهر كما ورد في القرآن الكريم، أي أن العبادة فيها تعدل عبادة 83 سنة و4 أشهر.",
  },
  quranic_evidence: {
    name: "الأدلة من القرآن",
    surah_al_qadr: "إِنَّا أَنْزَلْنَاهُ فِي لَيْلَةِ الْقَدْرِ * وَمَا أَدْرَاكَ مَا لَيْلَةُ الْقَدْرِ * لَيْلَةُ الْقَدْرِ خَيْرٌ مِنْ أَلْفِ شَهْرٍ * تَنَزَّلُ الْمَلَائِكَةُ وَالرُّوحُ فِيهَا بِإِذْنِ رَبِّهِمْ مِنْ كُلِّ أَمْرٍ * سَلَامٌ هِيَ حَتَّى مَطْلَعِ الْفَجْرِ.",
    surah_al_dukhan: "إِنَّا أَنْزَلْنَاهُ فِي لَيْلَةٍ مُبَارَكَةٍ إِنَّا كُنَّا مُنْذِرِينَ * فِيهَا يُفْرَقُ كُلُّ أَمْرٍ حَكِيمٍ.",
  },
  hadith_evidence: {
    name: "الأدلة من السنة",
    bukhari: "من قام ليلة القدر إيمانًا واحتسابًا غُفر له ما تقدم من ذنبه.",
    muslim: "تحروا ليلة القدر في الوتر من العشر الأواخر من رمضان.",
  },
  naming_reasons: {
    name: "تسميتها",
    greatness: "سميت بذلك لرفعتها وعظمتها وجلالة قدرها عند الله تعالى.",
    predestination: "يقدر فيها كل شيء ومقادير الخلائق للسنة القادمة.",
  },
  signs: {
    name: "علاماتها",
    confirmed: [
      "تكون السماء صافية لا حارة ولا باردة (ليلة بلجة سمحة).",
      "يكون القمر مشرقاً كأنه فلقة جفنة دون وهج مؤذٍ.",
      "لا يسمع فيها نباح الكلاب أو نهيق الحمير ويسودها السكينة.",
      "شروق الشمس في صبيحتها بيضاء نقية لا شعاع لها كالقمر ليلة البدر.",
    ],
    unconfirmed: [
      "هدوء الرياح وسكون الطبيعة.",
      "إحساس المسلم بطمأنينة قلب وانشراح صدر غير معتادين.",
    ],
  },
  recommended_acts: {
    name: "الأعمال المستحبة",
    acts: [
      "قيام الليل بالصلاة والتهجد وإطالة الركوع والسجود.",
      "قراءة القرآن الكريم وتدبر معانيه وختمه.",
      "الدعاء المأثور: اللهم إنك عفو تحب العفو فاعف عني.",
      "كثرة الاستغفار وسؤال الله المغفرة والعتق من النيران.",
      "الإكثار من الذكر والتسبيح والتهليل والتكبير.",
      "التوبة الصادقة وتجديد العهد مع الله عز وجل.",
      "الإنفاق والصدقة على الفقراء والمساكين والمحتاجين.",
      "تفطير الصائمين وصلة الأرحام وتطييب الخواطر.",
      "إحياء الليل كله بالطاعة والاعتكاف في بيوت الله.",
    ],
  },
  importance: {
    name: "أهميتها",
    quran_revelation: "فيها ابتداء نزول القرآن الكريم جملة واحدة من اللوح المحفوظ إلى بيت العزة في السماء الدنيا.",
    angels_descend: "تنزل الملائكة وجبريل عليه السلام بالخير والرحمة والبركة والسلام لأهل الأرض.",
    decrees_written: "يتم فيها كتابة وتقدير آجال وأرزاق ومقادير العباد للسنة المقبلة بحكمة بالغة.",
  },
  scholars_opinions: {
    name: "أقوال العلماء",
    ibn_kathir: "ليلة القدر هي أفضل الليالي على الإطلاق، والعمل الصالح فيها خير من العمل في ألف شهر مما سواها.",
    ibn_taymiyyah: "ليلة القدر في العشر الأواخر من رمضان، وأرجاها في الأوتار، ومن اجتهد في العشر كلها نال فضلها يقيناً بإذن الله.",
  },
  date: {
    name: "تاريخها",
    value: "لم يتم تحديد ليلة القدر بليلة واحدة ثابتة ليعظم اجتهاد المسلمين، ولكنها تتنقل في العشر الأواخر من رمضان، وخاصة في الليالي الوترية (21، 23، 25، 27، 29).",
  },
};
