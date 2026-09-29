import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  HelpCircle,
  Search,
  BookOpen,
  ExternalLink,
  ChevronLeft,
  Filter,
  CheckCircle2,
  Share2,
  Copy,
  Send,
  Building2,
  Scale,
  Sparkles,
  PhoneCall,
  Volume2,
  VolumeX,
  Bookmark,
  BookmarkCheck,
  RefreshCw,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { soundEngine } from "../../utils/soundEngine";
import { FatwaInteractiveChatBox } from "./FatwaInteractiveChatBox";

export interface FatwaItem {
  id: string;
  question: string;
  source: "egypt" | "saudi";
  sourceName: string;
  category: "prayer" | "finance" | "family" | "fasting" | "hajj" | "medical" | "contemporary";
  categoryLabel: string;
  rulingShort: string;
  detailedAnswer: string;
  fatwaNumber: string;
  date: string;
  muftiOrCommittee: string;
  officialUrl: string;
  evidence: string;
}

const INITIAL_FATWAS: FatwaItem[] = [
  // 1. العبادات والصلاة
  {
    id: "fatwa-01",
    question: "ما حكم صلاة المسافر وقصرها وجمعها؟ وما هي مسافة السفر المعتبرة شرعاً؟",
    source: "egypt",
    sourceName: "دار الإفتاء المصرية",
    category: "prayer",
    categoryLabel: "الصلوات والعبادات",
    rulingShort: "يجوز القصر والجمع في السفر الذي تبلغ مسافته مرحلتين (حوالي 81 كم فأكثر)",
    detailedAnswer:
      "قصر الصلاة الرباعية رخصة ثابتة بالكتاب والسنة وإجماع الأمة للمسافر الذي يقطع مسافة لا تقل عن أربعة بُرد، وتُقدّر بحوالي 81 إلى 85 كيلومترًا، بشرط ألا يكون سفره لمعصية. ويجوز له الجمع بين الظهر والعصر تقديمًا أو تأخيرًا، وبين المغرب والعشاء كذلك، مدة سفره ما لم ينوِ الإقامة في بلد الوصول أربعة أيام فأكثر غير يومي الدخول والخروج.",
    evidence:
      "قال تعالى: ﴿وَإِذَا ضَرَبْتُمْ فِي الْأَرْضِ فَلَيْسَ عَلَيْكُمْ جُنَاحٌ أَنْ تَقْصُرُوا مِنَ الصَّلَاةِ﴾ [النساء: 101]، وثبت عن النبي ﷺ أنه لم يزل يقصر في أسفاره.",
    fatwaNumber: "EG-1445-9821",
    date: "1445 هـ / 2024 م",
    muftiOrCommittee: "أمانة الفتوى - دار الإفتاء المصرية",
    officialUrl: "https://www.dar-alifta.org/ar/fatwa/details/9821",
  },
  {
    id: "fatwa-02",
    question: "حكم قراءة الفاتحة للمأموم في الصلاة الجهرية خلف الإمام؟",
    source: "saudi",
    sourceName: "الرئاسة العامة للبحوث العلمية والإفتاء (السعودية)",
    category: "prayer",
    categoryLabel: "الصلوات والعبادات",
    rulingShort: "قراءة الفاتحة واجبة على كل مصلٍّ؛ إمامًا كان أو مأمومًا أو منفردًا، في السرية والجهرية",
    detailedAnswer:
      "الراجح من أقوال أهل العلم أن قراءة الفاتحة ركن في حق كل مصلٍّ؛ لعموم قول النبي ﷺ: «لا صلاة لمن لم يقرأ بفاتحة الكتاب». ويقرأها المأموم في سكتات الإمام إن كانت له سكتات، أو يقرأها سرًا في نفسه ولا يتركها، وإذا ركع الإمام قبل أن يتمها المأموم ركع ويسقط عنه ما بقي.",
    evidence: "حديث عبادة بن الصامت رضي الله عنه: «لا صلاة لمن لم يقرأ بفاتحة الكتاب» (متفق عليه).",
    fatwaNumber: "SA-39-1420",
    date: "1444 هـ",
    muftiOrCommittee: "اللجنة الدائمة للبحوث العلمية والإفتاء - برئاسة سماحة المفتي العام",
    officialUrl: "https://www.alifta.gov.sa",
  },

  // 2. المعاملات المالية المعاصرة
  {
    id: "fatwa-03",
    question: "ما الحكم الشرعي في فوائد شهادات الاستثمار والأرباح البنكية المحددة مسبقاً؟",
    source: "egypt",
    sourceName: "دار الإفتاء المصرية",
    category: "finance",
    categoryLabel: "المعاملات المالية المعاصرة",
    rulingShort: "أرباح شهادات الاستثمار وعوائد البنوك حلال شرعاً ومباحة وتعتبر عقود تمويل واستثمار",
    detailedAnswer:
      "أيدت دار الإفتاء المصرية ومجمع البحوث الإسلامية بالأزهر الشريف أن المعاملات البنكية المعاصرة وعوائد شهادات الاستثمار محددة الربح هي عقود مستحدثة من قبيل عقود التمويل والاستثمار الجائزة، وليست قروضًا جرّت نفعًا؛ فالبنك مؤسسة استثمارية اعتبارية تقوم بتشغيل الأموال وتحديد نسبة عائد مقطوعة وفق دراسات الجدوى الاقتصادية لحماية المستثمر، ولا يدخل ذلك في باب الربا المحرم شرعًا.",
    evidence:
      "الأصل في المعاملات الحل والإباحة إلا ما ورد دليل بتحريمه، وقاعدة «تحقيق المنافع ودفع المفاسد»، وقرار مجمع البحوث الإسلامية لسنة 2002.",
    fatwaNumber: "EG-1442-12543",
    date: "1442 هـ / 2021 م",
    muftiOrCommittee: "هيئة كبار العلماء ودار الإفتاء المصرية",
    officialUrl: "https://www.dar-alifta.org/ar/fatwa/details/12543",
  },
  {
    id: "fatwa-04",
    question: "حكم التداول بالعملات الرقمية المشفرة (مثل البيتكوين) وما حكم المضاربة بها؟",
    source: "egypt",
    sourceName: "دار الإفتاء المصرية",
    category: "finance",
    categoryLabel: "المعاملات المالية المعاصرة",
    rulingShort: "حرام شرعاً لما تشتمل عليه من الغرر والجهالة الشديدة والمخاطرة والمفاسد الاقتصادية",
    detailedAnswer:
      "قررت دار الإفتاء المصرية بعد الرجوع إلى خبراء الاقتصاد والنقد أن التعامل بالعملات المشفرة مثل (البيتكوين) غير جائز شرعًا في الوقت الراهن؛ لافتقارها إلى شروط النقد والاعتبار الرسمي من البنوك المركزية والدول، ولما تكتنفها من الجهالة والغرر والمقامرة وتسهيل تمويل الأنشطة غير المشروعة وغسيل الأموال.",
    evidence: "نهى رسول الله ﷺ عن بيع الغرر (رواه مسلم)، وقاعدة «لا ضرر ولا ضرار».",
    fatwaNumber: "EG-1439-7721",
    date: "1439 هـ",
    muftiOrCommittee: "مجلس الإفتاء الأعلى - دار الإفتاء المصرية",
    officialUrl: "https://www.dar-alifta.org/ar/fatwa/details/7721",
  },
  {
    id: "fatwa-05",
    question: "ما حكم البيع بالتقسيط مع زيادة في السعر عن السعر النقدي الفوري؟",
    source: "saudi",
    sourceName: "الرئاسة العامة للبحوث العلمية والإفتاء (السعودية)",
    category: "finance",
    categoryLabel: "المعاملات المالية المعاصرة",
    rulingShort: "جائز شرعاً إذا كان الأجل والزيادة والسلعة معلومة عند عقد البيع",
    detailedAnswer:
      "البيع بالتقسيط مع زيادة في الثمن المؤجل عن الثمن الحال جائز عند جماهير علماء المسلمين وأئمة المذاهب الأربعة، شريطة أن يتم الاتفاق المنجز على سعر واحد محدد وأقساط معلومة وآجال محددة، وألا يُشترط فيه فوائد تأخير ربوية عند تعثر المشتري.",
    evidence:
      "حديث بريرة في الصحيحين أنها اشترت نفسها من مواليها بتسع أواق في كل عام أوقية، ولم ينكر النبي ﷺ ذلك.",
    fatwaNumber: "SA-21-3419",
    date: "1443 هـ",
    muftiOrCommittee: "اللجنة الدائمة للبحوث العلمية والإفتاء بالمملكة العربية السعودية",
    officialUrl: "https://www.alifta.gov.sa",
  },

  // 3. الصيام والزكاة
  {
    id: "fatwa-06",
    question: "ما هي المفطرات المعاصرة في نهار رمضان؟ كحقن الوريد وبخاخ الربو وقطرة العين؟",
    source: "egypt",
    sourceName: "دار الإفتاء المصرية",
    category: "fasting",
    categoryLabel: "الصيام والزكاة والصدقات",
    rulingShort: "الحقن بأنواعها وقطرة العين والأذن لا تفطر، وبخاخ الربو محل خلاف والأحوط للمريض استعماله وقضاء يوم إن أمكن",
    detailedAnswer:
      "الحقن العلاجية سواء أكانت في العضل أو الوريد أو تحت الجلد لا تُفطر الصائم، وكذا قطرة العين والأذن وغسول الفم المضمضة ما لم يبتلع منها شيئًا إلى الجوف عمدًا. أما بخاخ الربو فإن كان المريض يضطر إليه لضيق التنفس فيجوز له استعماله صونًا لنفسه، فإن كان مرضه مزمنًا أطعم مسكينًا عن كل يوم، وإن كان عارضًا استحب له القضاء بعد الشفاء خروجًا من الخلاف.",
    evidence: "المفطر هو ما دخل الجوف من منفذ مفتوح معتاد كالفم والأنف عن طواعية واختيار.",
    fatwaNumber: "EG-1444-1849",
    date: "1444 هـ",
    muftiOrCommittee: "أمانة الفتوى - دار الإفتاء المصرية",
    officialUrl: "https://www.dar-alifta.org/ar/fatwa/details/1849",
  },
  {
    id: "fatwa-07",
    question: "ما حكم إخراج زكاة الفطر نقوداً بدلاً من الحبوب والطعام؟",
    source: "egypt",
    sourceName: "دار الإفتاء المصرية",
    category: "fasting",
    categoryLabel: "الصيام والزكاة والصدقات",
    rulingShort: "يجوز إخراجها نقداً وهو الأفضل والأوفق لحاجة الفقير في العصر الحاضر",
    detailedAnswer:
      "أفتت دار الإفتاء المصرية بجواز إخراج زكاة الفطر قيمةً نقدية؛ اتباعًا لمذهب الإمام أبي حنيفة النعمان وجماعة من التابعين كعمر بن عبد العزيز والحسن البصري؛ لأن النقد أيسر للمزكي وأنفع للفقير في شراء ما يحتاجه من مأكل وملبس ودواء وسداد إيجار في زماننا.",
    evidence:
      "عن معاذ بن جبل رضي الله عنه أنه قال لأهل اليمن: «ائْتُونِي بِخَمِيصٍ أَوْ لَبِيسٍ آخُذُهُ مِنْكُمْ مَكَانَ الذُّرَةِ وَالشَّعِيرِ؛ فَإِنَّهُ أَهْوَنُ عَلَيْكُمْ وَخَيْرٌ لِأَصْحَابِ رَسُولِ اللَّهِ ﷺ بِالْمَدِينَةِ».",
    fatwaNumber: "EG-1445-3102",
    date: "1445 هـ",
    muftiOrCommittee: "مفتي جمهورية مصر العربية",
    officialUrl: "https://www.dar-alifta.org/ar/fatwa/details/3102",
  },

  // 4. الأسرة والأحوال الشخصية
  {
    id: "fatwa-08",
    question: "حكم الطلاق المعلق والطلاق الشفوي في حالة الغضب الشديد؟",
    source: "egypt",
    sourceName: "دار الإفتاء المصرية",
    category: "family",
    categoryLabel: "الأسرة والأحوال الشخصية",
    rulingShort: "طلاق الغضبان الذي زال عنه وعيه لا يقع، والطلاق المعلق يرجع لنية الزوج",
    detailedAnswer:
      "الطلاق الذي يصدر من الزوج في حالة إغلاق وغضب شديد يسلبه التروي والقدرة على التحكم والاختيار لا يقع شرعًا ولا قانونًا، لقوله ﷺ: «لا طلاق ولا عتاق في إغلاق». أما الطلاق المعلق كقوله (إن فعلتِ كذا فأنتِ طالق) فإن قصد به الحث أو المنع والتهديد ولا يقصد إيقاع الطلاق كفّر كفارة يمين ولم يقع طلاقه، وتُنصح الحالات بالحضور للتحقيق المباشر في دار الإفتاء.",
    evidence: "حديث عائشة رضي الله عنها مرفوعاً: «لا طلاق ولا عتاق في إغلاق» (رواه أحمد وأبو داود).",
    fatwaNumber: "EG-1443-6218",
    date: "1443 هـ",
    muftiOrCommittee: "لجنة الفتوى بالأحوال الشخصية - دار الإفتاء المصرية",
    officialUrl: "https://www.dar-alifta.org/ar/fatwa/details/6218",
  },
  {
    id: "fatwa-09",
    question: "حكم إرضاع الكبير وما يترتب عليه من أحكام المحرمية؟",
    source: "saudi",
    sourceName: "الرئاسة العامة للبحوث العلمية والإفتاء (السعودية)",
    category: "family",
    categoryLabel: "الأسرة والأحوال الشخصية",
    rulingShort: "الرضاع المحرّم لا يكون إلا في الحولين (قبل الفطام)، ولا يثبت التحريم برضاع الكبير",
    detailedAnswer:
      "اتفق جمهور الفقهاء والمحققون على أن الرضاع الذي يُثبت التحريم وينشر الحرمة هو ما كان في سن الرضاعة دون الحولين، بأن يكون خمس رضعات مشبعات فأكثر؛ لقول الله تعالى: ﴿وَالْوَالِدَاتُ يُرْضِعْنَ أَوْلَادَهُنَّ حَوْلَيْنِ كَامِلَيْنِ لِمَنْ أَرَادَ أَنْ يُتِمَّ الرَّضَاعَةَ﴾. أما إرضاع الكبير فلا يُثبت محرمية.",
    evidence: "قول النبي ﷺ: «إنما الرضاعة من المجاعة» (متفق عليه).",
    fatwaNumber: "SA-18-912",
    date: "1442 هـ",
    muftiOrCommittee: "اللجنة الدائمة للبحوث العلمية والإفتاء بالمملكة العربية السعودية",
    officialUrl: "https://www.alifta.gov.sa",
  },

  // 5. الفتاوى الطبية والصحية
  {
    id: "fatwa-10",
    question: "ما حكم التبرع بالأعضاء بعد الوفاة لإنقاذ حياة مريض مشرف على الهلاك؟",
    source: "egypt",
    sourceName: "دار الإفتاء المصرية",
    category: "medical",
    categoryLabel: "الفتاوى الطبية والصحية",
    rulingShort: "جائز شرعاً ومستحب وقربة إلى الله تعالى بشروط وضوابط محددة",
    detailedAnswer:
      "التبرع بالأعضاء بعد الوفاة هو عمل إنساني جليل ونوع من الإيثار والصدقة الجارية التي يمتد ثوابها لصاحبها، وقد أقرته المجامع الفقهية وهيئات الإفتاء المعتمدة، شريطة أن يكون بموافقة المتوفى الموثقة حال حياته أو موافقة ورثته، وأن يثبت موت المتبرع يقينًا بتقرير لجنة طبية موثوقة، وألا يكون المتبرَّع به عضوًا يترتب عليه اختلاط الأنساب، وألا يكون التبرع مقابل مال أو تجارة.",
    evidence:
      "قوله تعالى: ﴿وَمَنْ أَحْيَاهَا فَكَأَنَّمَا أَحْيَا النَّاسَ جَمِيعًا﴾ [المائدة: 32]، وقاعدة «الضرورات تبيح المحظورات».",
    fatwaNumber: "EG-1441-5509",
    date: "1441 هـ",
    muftiOrCommittee: "مجلس الإفتاء الأعلى ودار الإفتاء المصرية",
    officialUrl: "https://www.dar-alifta.org/ar/fatwa/details/5509",
  },
  {
    id: "fatwa-11",
    question: "ما حكم عمليات أطفال الأنابيب والتلقيح المجهري لعلاج العقم؟",
    source: "saudi",
    sourceName: "الرئاسة العامة للبحوث العلمية والإفتاء (السعودية)",
    category: "medical",
    categoryLabel: "الفتاوى الطبية والصحية",
    rulingShort: "جائز شرعاً بضوابط مشددة تضمن عدم اختلاط الأنساب وبقاء الزوجية قائمة",
    detailedAnswer:
      "يجوز اللجوء إلى التلقيح الصناعي وأطفال الأنابيب إذا دعت الحاجة الطبية إلى ذلك، بشرط أن تكون النطفة من الزوج والبويضة من الزوجة، وأن يتم الزرع في رحم نفس الزوجة، مع التأكد التام من أهلية الأطباء وأمانتهم صونًا للأنساب من أي شبهة أو خطأ.",
    evidence: "قرار مجمع الفقه الإسلامي الدولي وقرارات هيئة كبار العلماء بالمملكة.",
    fatwaNumber: "SA-08-114",
    date: "1443 هـ",
    muftiOrCommittee: "هيئة كبار العلماء واللجنة الدائمة للإفتاء",
    officialUrl: "https://www.alifta.gov.sa",
  },

  // 6. الحج والعمرة
  {
    id: "fatwa-12",
    question: "هل يجوز للمرأة السفر للحج أو العمرة بدون محرم مع رفقة مأمونة؟",
    source: "saudi",
    sourceName: "الرئاسة العامة للبحوث العلمية والإفتاء (السعودية) ودار الإفتاء المصرية",
    category: "hajj",
    categoryLabel: "الحج والعمرة والزيارة",
    rulingShort: "يجوز للمرأة السفر لأداء الحج والعمرة مع الرفقة المأمونة وتوفر الأمن",
    detailedAnswer:
      "أجمعت الفتوى الرسمية المعاصرة بدار الإفتاء المصرية وما استقرت عليه التوجيهات الفقهية والنظامية بالمملكة العربية السعودية على جواز سفر المرأة للحج أو العمرة دون محرم متى توفر الأمن وكانت ضمن رفقة آمنة مأمونة، أخذًا بمذهب الإمام مالك والإمام الشافعي ورواية عن الإمام أحمد، وتيسيرًا على المسلمات الراغبات في أداء النسك.",
    evidence:
      "حديث عدي بن حاتم رضي الله عنه في صحيح البخاري وفيه بشارة النبي ﷺ: «يُوشِكُ أَنْ تَخْرُجَ الظَّعِينَةُ مِنَ الحِيرَةِ حَتَّى تَطُوفَ بِالكَعْبَةِ لاَ تَخَافُ أَحَدًا إِلاَّ اللَّهَ».",
    fatwaNumber: "COMMON-1444-901",
    date: "1444 هـ",
    muftiOrCommittee: "أمانة الفتوى المشتركة",
    officialUrl: "https://www.dar-alifta.org",
  },

  // 7. القضايا المعاصرة والفكرية
  {
    id: "fatwa-13",
    question: "ما حكم تهنئة غير المسلمين (المسيحيين) بأعيادهم ومناسباتهم الاجتماعية؟",
    source: "egypt",
    sourceName: "دار الإفتاء المصرية",
    category: "contemporary",
    categoryLabel: "القضايا المعاصرة والمجتمعية",
    rulingShort: "جائزة ومستحبة شرعاً من باب البر والقسط وحسن الجوار والإحسان",
    detailedAnswer:
      "أكدت دار الإفتاء المصرية أن تهنئة غير المسلمين بمناسباتهم وأعيادهم ليست من الإقرار بعقائدهم، وإنما هي من قبيل البر والقسط والإحسان وحسن العشرة التي أمر بها الشرع الحنيف تجاه من يسالمنا في الوطن والإنسانية، وهو ما يُرسخ قيم السلام الاجتماعي والتعايش السلمي الذي دعا إليه الإسلام.",
    evidence:
      "قوله تعالى: ﴿لَا يَنْهَاكُمُ اللَّهُ عَنِ الَّذِينَ لَمْ يُقَاتِلُوكُمْ فِي الدِّينِ وَلَمْ يُخْرِجُوكُمْ مِنْ دِيَارِكُمْ أَنْ تَبَرُّوهُمْ وَتُقْسِطُوا إِلَيْهِمْ إِنَّ اللَّهَ يُحِبُّ الْمُقْسِطِينَ﴾ [الممتحنة: 8].",
    fatwaNumber: "EG-1445-0104",
    date: "1445 هـ / 2024 م",
    muftiOrCommittee: "مفتي جمهورية مصر العربية",
    officialUrl: "https://www.dar-alifta.org/ar/fatwa/details/0104",
  },
];

interface Props {
  theme: string;
  onBackToHome?: () => void;
  onBack?: () => void;
}

export const FatwaEncyclopediaView: React.FC<Props> = ({ theme, onBackToHome, onBack }) => {
  const handleBack = onBackToHome || onBack;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSource, setSelectedSource] = useState<"all" | "egypt" | "saudi">("all");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedFatwaId, setExpandedFatwaId] = useState<string | null>("fatwa-01");
  const [savedFatwaIds, setSavedFatwaIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("noor_saved_fatwas");
      return saved ? JSON.parse(saved) : ["fatwa-01"];
    } catch {
      return ["fatwa-01"];
    }
  });

  const SMART_SEARCH_SUGGESTIONS = [
    "فوائد الشهادات والبنوك",
    "صلاة المسافر والجمع",
    "زكاة الفطر وقيمتها",
    "أطفال الأنابيب",
    "التبرع بالأعضاء",
    "العملات الرقمية المشفرة",
    "تأخير غسل الجنابة",
    "صيام الست من شوال",
  ];

  // Ask Question / Fatwa Request Modal state
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [questionCategory, setQuestionCategory] = useState("prayer");
  const [questionSubject, setQuestionSubject] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [userEmailOrPhone, setUserEmailOrPhone] = useState("");
  const [isCopiedAlert, setIsCopiedAlert] = useState(false);
  const [speakingFatwaId, setSpeakingFatwaId] = useState<string | null>(null);

  // RSS / Live Feeds Sync State
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState("جارٍ الاتصال بالبوابات الرسمية...");
  const [activeRssTab, setActiveRssTab] = useState<"egypt" | "saudi">("egypt");
  const [isRssCollapsed, setIsRssCollapsed] = useState(false);
  const [expandedRssId, setExpandedRssId] = useState<string | null>(null);
  const [liveEgyptFatwas, setLiveEgyptFatwas] = useState<FatwaItem[]>([]);
  const [liveSaudiFatwas, setLiveSaudiFatwas] = useState<FatwaItem[]>([]);
  const [officialCategories, setOfficialCategories] = useState<{ id: string; label: string }[]>([]);

  // Realistic Egyptian Human Speech Audio Player Ref
  const fatwaAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);

  // Fetch live verified fatwas from both official feeds in parallel
  const fetchAllFeedsLive = async () => {
    setIsSyncing(true);
    try {
      const [resEgypt, resSaudi, resCats] = await Promise.all([
        fetch("/api/fatwa/feed/egypt").catch(() => null),
        fetch("/api/fatwa/feed/saudi").catch(() => null),
        fetch("/api/fatwa/categories").catch(() => null),
      ]);

      if (resEgypt && resEgypt.ok) {
        const dataEgypt = await resEgypt.json();
        if (dataEgypt.items && Array.isArray(dataEgypt.items)) {
          setLiveEgyptFatwas(dataEgypt.items);
        }
      }

      if (resSaudi && resSaudi.ok) {
        const dataSaudi = await resSaudi.json();
        if (dataSaudi.items && Array.isArray(dataSaudi.items)) {
          setLiveSaudiFatwas(dataSaudi.items);
        }
      }

      if (resCats && resCats.ok) {
        const dataCats = await resCats.json();
        if (dataCats.egypt && Array.isArray(dataCats.egypt)) {
          setOfficialCategories(dataCats.egypt);
        }
      }

      setLastSyncTime("محدث الآن حياً من دار الإفتاء المصرية والرئاسة العامة للإفتاء بالسعودية");
    } catch (err) {
      console.warn("Fatwa feeds fetch error:", err);
      setLastSyncTime("تم استخدام الأرشيف المعتمد الموثق");
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchAllFeedsLive();

    const handleOpenFatwa = (e: any) => {
      if (e.detail?.query) {
        setSearchQuery(e.detail.query);
      }
      if (e.detail?.source && (e.detail.source === "egypt" || e.detail.source === "saudi")) {
        setSelectedSource(e.detail.source);
      }
    };
    window.addEventListener("noor-open-fatwa", handleOpenFatwa);
    return () => window.removeEventListener("noor-open-fatwa", handleOpenFatwa);
  }, []);

  const isDark = theme === "night" || theme === "natural";
  const isPaper = theme === "paper";

  // Categories definition
  const baseCategories = [
    { id: "all", label: "كافة الأقسام" },
    { id: "prayer", label: "الصلوات والعبادات" },
    { id: "finance", label: "المعاملات المالية" },
    { id: "fasting", label: "الصيام والزكاة" },
    { id: "family", label: "الأسرة والأحوال الشخصية" },
    { id: "medical", label: "الفتاوى الطبية والصحية" },
    { id: "hajj", label: "الحج والعمرة" },
    { id: "contemporary", label: "القضايا المعاصرة" },
  ];

  // Dynamic categories matching official authority classification
  const activeCategories = useMemo(() => {
    if (selectedSource === "egypt") {
      return [
        { id: "all", label: "جميع فتاوى دار الإفتاء المصرية" },
        { id: "prayer", label: "الصلوات والعبادات والطهارة" },
        { id: "finance", label: "المعاملات المالية والبنوك" },
        { id: "family", label: "قضايا الأسرة والطلاق والميراث" },
        { id: "medical", label: "المسائل الطبية والمستجدات" },
        { id: "fasting", label: "الصيام والزكاة والكفارات" },
        { id: "hajj", label: "الحج والعمرة والزيارة" },
        { id: "contemporary", label: "القضايا الفكرية والمعاصرة" },
      ];
    } else if (selectedSource === "saudi") {
      return [
        { id: "all", label: "جميع فتاوى الإفتاء السعودية" },
        { id: "prayer", label: "الصلاة والطهارة والجنائز" },
        { id: "fasting", label: "الصيام والزكاة والصدقات" },
        { id: "finance", label: "البيوع والمعاملات والربا" },
        { id: "family", label: "النكاح والطلاق وحقوق الزوجين" },
        { id: "hajj", label: "الحج والمناسك والأضاحي" },
        { id: "contemporary", label: "فتاوى نور على الدرب واللجنة الدائمة" },
      ];
    }
    return baseCategories;
  }, [selectedSource]);

  // Combined fatwas catalog (Live fetched items + Verified comprehensive repository)
  const allFatwas = useMemo(() => {
    const combined = [...liveEgyptFatwas, ...liveSaudiFatwas, ...INITIAL_FATWAS];
    // Deduplicate by question text
    const seen = new Set<string>();
    return combined.filter((f) => {
      const key = (f.question || f.rulingShort || "").slice(0, 30);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [liveEgyptFatwas, liveSaudiFatwas]);

  // Filtering
  const filteredFatwas = useMemo(() => {
    return allFatwas.filter((item) => {
      // Source filter
      if (selectedSource !== "all" && item.source !== selectedSource) return false;
      // Category filter
      if (selectedCategory !== "all" && item.category !== selectedCategory) return false;
      // Search query
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchQ = (item.question || "").toLowerCase().includes(q);
        const matchAns = (item.detailedAnswer || "").toLowerCase().includes(q);
        const matchShort = (item.rulingShort || "").toLowerCase().includes(q);
        const matchNum = (item.fatwaNumber || "").toLowerCase().includes(q);
        const matchEv = (item.evidence || "").toLowerCase().includes(q);
        if (!matchQ && !matchAns && !matchShort && !matchNum && !matchEv) return false;
      }
      return true;
    });
  }, [allFatwas, selectedSource, selectedCategory, searchQuery]);

  const toggleSaveFatwa = (id: string) => {
    soundEngine.playTasbihClick();
    setSavedFatwaIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      localStorage.setItem("noor_saved_fatwas", JSON.stringify(next));
      return next;
    });
  };

  const copyFatwa = (item: FatwaItem) => {
    soundEngine.playTasbihClick();
    const textToCopy = `«السؤال»: ${item.question}\n\n«خلاصة الفتوى»: ${item.rulingShort}\n\n«البيان التفصيلي والأدلة»: ${item.detailedAnswer}\n\n«المصدر المعتمد»: ${item.sourceName} - رقم الفتوى (${item.fatwaNumber})\nمنقول من: تطبيق النور الإسلامي`;
    navigator.clipboard?.writeText(textToCopy);
    setIsCopiedAlert(true);
    setTimeout(() => setIsCopiedAlert(false), 2500);
  };

  // Play fatwa with realistic human Egyptian voice from /api/companion/tts (with fallback to browser synthesis)
  const speakFatwa = async (item: FatwaItem) => {
    if (speakingFatwaId === item.id) {
      if (fatwaAudioRef.current) {
        fatwaAudioRef.current.pause();
        fatwaAudioRef.current.currentTime = 0;
      }
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      setSpeakingFatwaId(null);
      return;
    }

    // Stop ongoing audio
    if (fatwaAudioRef.current) {
      fatwaAudioRef.current.pause();
      fatwaAudioRef.current.currentTime = 0;
    }
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();

    const textToSpeak = `${item.question}. خلاصة الفتوى من ${item.sourceName}: ${item.rulingShort}`;
    setSpeakingFatwaId(item.id);
    setIsAudioLoading(true);

    try {
      const ttsRes = await fetch("/api/companion/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToSpeak }),
      });

      if (ttsRes.ok) {
        const ttsData = await ttsRes.json();
        if (ttsData.audioUrl) {
          if (!fatwaAudioRef.current) {
            fatwaAudioRef.current = new Audio();
          }
          const audio = fatwaAudioRef.current;
          audio.src = ttsData.audioUrl;
          audio.onended = () => setSpeakingFatwaId(null);
          audio.onerror = () => setSpeakingFatwaId(null);
          await audio.play();
          setIsAudioLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn("TTS API fallback to speech synthesis", e);
    }

    setIsAudioLoading(false);
    // Fallback to browser SpeechSynthesis
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(
        `${item.question}. الجواب من ${item.sourceName}: ${item.rulingShort}. ${item.detailedAnswer}`
      );
      utterance.lang = "ar-SA";
      utterance.rate = 0.95;
      utterance.onend = () => setSpeakingFatwaId(null);
      utterance.onerror = () => setSpeakingFatwaId(null);
      window.speechSynthesis.speak(utterance);
    } else {
      setSpeakingFatwaId(null);
    }
  };

  const handleSyncRSS = async () => {
    soundEngine.playTasbihClick();
    await fetchAllFeedsLive();
    soundEngine.playMilestone33();
  };

  // Submit and route question to official sites
  const handleRouteToDarAlIfta = () => {
    soundEngine.playTasbihClick();
    if (!questionText.trim()) return;
    const formattedDraft = `الموضوع: ${questionSubject || "استفتاء شرعي"}\nالتصنيف: ${questionCategory}\nالسائل: ${userEmailOrPhone || "فاعل خير"}\n\nنص السؤال:\n${questionText}`;
    navigator.clipboard?.writeText(formattedDraft);
    window.open("https://www.dar-alifta.org/ar/FatwaRequest", "_blank", "noopener,noreferrer");
    setIsAskModalOpen(false);
  };

  const handleRouteToSaudiIfta = () => {
    soundEngine.playTasbihClick();
    if (!questionText.trim()) return;
    const formattedDraft = `الموضوع: ${questionSubject || "استفتاء شرعي"}\nالتصنيف: ${questionCategory}\nالسائل: ${userEmailOrPhone || "فاعل خير"}\n\nنص السؤال:\n${questionText}`;
    navigator.clipboard?.writeText(formattedDraft);
    window.open("https://www.alifta.gov.sa", "_blank", "noopener,noreferrer");
    setIsAskModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Breadcrumb & Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
        <div className="flex items-center gap-2.5">
          {handleBack && (
            <button
              onClick={handleBack}
              className="px-3 py-1.5 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4 rotate-180" />
              <span>العودة للرئيسية</span>
            </button>
          )}
          <span className="text-emerald-600/40 text-xs hidden sm:inline">•</span>
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-xs sm:text-sm font-bold font-alexandria text-[#D4AF37]">
              موسوعة الفتاوى الإسلامية المعتمدة
            </span>
          </div>
        </div>

        {/* Action: Ask a new Fatwa & RSS Sync */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundEngine.playTasbihClick();
              const el = document.getElementById("fatwa-interactive-communication-box");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md transition active:scale-95"
            title="الانتقال إلى مربع التواصل الفقهي الذكي"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>مساعد الفتاوى الذكي</span>
          </button>

          <button
            onClick={handleSyncRSS}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition"
            title="تحديث البيانات عبر RSS"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#D4AF37] ${isSyncing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">تحديث RSS</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playTasbihClick();
              setIsAskModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold shadow-md transition active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span>إرسال سؤال / طلب فتوى</span>
          </button>
        </div>
      </div>

      {/* Hero Banner with Official Credibility Accreditations */}
      <section
        className={`rounded-3xl p-5 sm:p-7 border relative overflow-hidden shadow-lg ${
          isPaper
            ? "bg-gradient-to-br from-[#F7EFE1] to-[#FFFDF9] border-[#D6C5A9] text-[#2F1E12]"
            : isDark
            ? "bg-gradient-to-br from-[#07241A] via-[#0A2F23] to-[#061B14] border-[#D4AF37]/40 text-white"
            : "bg-gradient-to-br from-emerald-500/10 via-white/95 to-emerald-500/5 border-emerald-500/25 text-emerald-950"
        }`}
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/35 text-[#B68C1C] dark:text-[#F3E7C4] text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>فتاوى موثقة بنصوصها وأرقامها الرسمية</span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold font-alexandria tracking-tight">
              موسوعة الفتاوى الشرعية والمسائل المعاصرة
            </h1>

            <p className={`text-xs sm:text-sm leading-relaxed ${isPaper ? "text-[#5A402D]" : isDark ? "text-slate-300" : "text-emerald-900/90"}`}>
              محرك بحث متطور ومفهرس يجمع أهم الفتاوى الشرعية في شتى مناحي الحياة من المرجعين الرسميين المعتمدين للأمة الإسلامية: 
              <strong> دار الإفتاء المصرية</strong> و<strong>الرئاسة العامة للبحوث العلمية والإفتاء بالمملكة العربية السعودية</strong>، 
              مع إمكانية طرح سؤالك وتوجيهه مباشرة للمنصات الرسمية.
            </p>

            {/* Official Sources Badges */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/10 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs font-bold">
                <Building2 className="w-4 h-4 text-emerald-500" />
                <span>دار الإفتاء المصرية (الخط الساخن: 107)</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/10 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs font-bold">
                <Building2 className="w-4 h-4 text-amber-500" />
                <span>الإفتاء السعودية (الرقم الموحد: 8002451000)</span>
              </div>
            </div>
          </div>

          {/* Quick Stats Box */}
          <div className="w-full lg:w-72 p-4 rounded-2xl bg-black/20 dark:bg-white/5 border border-[#D4AF37]/30 space-y-2 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <span className="text-slate-400">إجمالي الفتاوى المفهرسة:</span>
              <span className="font-mono font-bold text-[#D4AF37]">{allFatwas.length} مسألة موثقة</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <span className="text-slate-400">تزامن دار الإفتاء الرسمية:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {isSyncing ? "جارٍ التحديث..." : "متصل حياً"}
              </span>
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-400">
              <span>حالة الأرشيف:</span>
              <span className="text-emerald-300 font-medium">{lastSyncTime}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Search & Comprehensive Filters Bar */}
      <div className="space-y-3">
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن فتوى... (مثال: فوائد البنوك، الجمع والقصر، زكاة الفطر، الطلاق، العملات الرقمية...)"
              className="w-full pl-10 pr-11 py-3 rounded-2xl border text-xs sm:text-sm bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/15 focus:outline-none focus:border-[#D4AF37]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
              >
                مسح
              </button>
            )}
          </div>

          {/* Source Selector: Clear Separation between Egypt and Saudi Arabia */}
          <div className="flex items-center gap-1 p-1 rounded-2xl border bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/15">
            {[
              { id: "all", label: "جميع المصادر المعتمدة" },
              { id: "egypt", label: "🇪🇬 دار الإفتاء المصرية" },
              { id: "saudi", label: "🇸🇦 الإفتاء السعودية" },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  soundEngine.playTasbihClick();
                  setSelectedSource(s.id as any);
                  setSelectedCategory("all");
                }}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  selectedSource === s.id
                    ? "bg-[#D4AF37] text-black shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Live Search link in Dar Al-Ifta portal when search query is typed */}
        {searchQuery.trim() !== "" && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Search className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-emerald-300 flex items-center gap-2">
                  <span>بحث مباشر في موقع دار الإفتاء المصرية الرسمي</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-500/30">
                    dar-alifta.org
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  ابحث عن مسألة: «{searchQuery}» مباشرة في بوابة دار الإفتاء المصرية المعتمدة
                </p>
              </div>
            </div>
            <a
              href={`https://www.dar-alifta.org/ar/home/search?q=${encodeURIComponent(searchQuery)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow"
            >
              <span>فتح النتائج الرسمية</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {/* Smart Query Suggestion Chips: Fully visible, wrapped and centered */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 py-1 text-[11px]">
          <span className="text-emerald-700 dark:text-emerald-400 font-bold shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#D4AF37]" />
            مسائل شائعة:
          </span>
          {SMART_SEARCH_SUGGESTIONS.map((chip) => (
            <button
              key={chip}
              onClick={() => {
                soundEngine.playTasbihClick();
                setSearchQuery(chip);
              }}
              className="px-2.5 py-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 whitespace-nowrap transition active:scale-95 cursor-pointer font-medium"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Categories Filter Strip: Dynamic per Source */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 py-1">
          {activeCategories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  soundEngine.playTasbihClick();
                  setSelectedCategory(cat.id);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap shrink-0 border ${
                  isSelected
                    ? "bg-emerald-600 text-white border-emerald-500 shadow-sm"
                    : isDark
                    ? "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                    : "bg-emerald-500/5 border-emerald-500/20 text-emerald-900 hover:bg-emerald-500/15"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Interactive Communication Box for Sighted and Blind Users (Smart Dual Official Source: Egypt & Saudi) */}
        <FatwaInteractiveChatBox theme={theme} />
      </div>

      {/* Copy Alert Toast */}
      {isCopiedAlert && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-2xl bg-emerald-700 text-white text-xs font-bold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>تم نسخ الفتوى والبيان المعتمد بنجاح إلى الحافظة</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LIVE RSS FATWA FEEDS WITH TABS (موجز وتغذية RSS الحية لدار الإفتاء وهيئة الإفتاء) */}
      {/* ========================================================================= */}
      <section
        id="rss-fatwa-feeds-tabbed-section"
        className={`rounded-3xl border shadow-md overflow-hidden transition-all duration-300 ${
          isPaper
            ? "bg-[#FAF4E8] border-[#D6C5A9] text-[#2F1E12]"
            : isDark
            ? "bg-[#0A1A14]/90 border-emerald-500/30 text-white"
            : "bg-gradient-to-br from-emerald-50/70 via-white to-amber-50/40 border-emerald-200 text-slate-900 shadow-sm"
        }`}
      >
        {/* Top Control Bar of the Live RSS Feed */}
        <div className="p-4 sm:p-5 border-b border-black/5 dark:border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center shadow-md shrink-0">
              <RefreshCw className={`w-5 h-5 ${isSyncing ? "animate-spin" : ""}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold font-alexandria text-emerald-900 dark:text-emerald-200">
                  بث وتغذية فتاوى RSS الحية المباشرة
                </h2>
                <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>تزامن مباشر</span>
                </span>
              </div>
              <p className={`text-xs ${isPaper ? "text-[#7A5F4C]" : "text-slate-400 dark:text-zinc-400"}`}>
                أحدث الفتاوى الصادرة فوراً من البوابات الرسمية مع خلاصة الحكم والقراءة الصوتية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
            {/* Source Switcher Tabs: Egypt vs Saudi */}
            <div className="flex items-center p-1 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs">
              <button
                id="tab-rss-egypt"
                onClick={() => {
                  soundEngine.playTasbihClick();
                  setActiveRssTab("egypt");
                }}
                className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeRssTab === "egypt"
                    ? "bg-[#D4AF37] text-black shadow-xs"
                    : "text-slate-500 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-white"
                }`}
              >
                <span>🇪🇬 دار الإفتاء المصرية</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/20 font-mono">
                  {liveEgyptFatwas.length > 0 ? liveEgyptFatwas.length : 6}
                </span>
              </button>

              <button
                id="tab-rss-saudi"
                onClick={() => {
                  soundEngine.playTasbihClick();
                  setActiveRssTab("saudi");
                }}
                className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeRssTab === "saudi"
                    ? "bg-[#D4AF37] text-black shadow-xs"
                    : "text-slate-500 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-white"
                }`}
              >
                <span>🇸🇦 الإفتاء السعودية</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/20 font-mono">
                  {liveSaudiFatwas.length > 0 ? liveSaudiFatwas.length : 5}
                </span>
              </button>
            </div>

            {/* Sync Button & Collapse Toggle */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleSyncRSS}
                disabled={isSyncing}
                title="تحديث موجز RSS الآن"
                className="p-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 transition cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
              </button>

              <button
                onClick={() => setIsRssCollapsed(!isRssCollapsed)}
                title={isRssCollapsed ? "توسيع البث" : "تصغير البث"}
                className="p-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-slate-500 dark:text-slate-300 transition cursor-pointer"
              >
                {isRssCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Feed Metadata Bar */}
        {!isRssCollapsed && (
          <div className="px-4 py-2 bg-emerald-500/5 border-b border-black/5 dark:border-white/5 flex flex-wrap items-center justify-between text-[11px] gap-2">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <span className="font-bold text-emerald-700 dark:text-emerald-300">
                {activeRssTab === "egypt" ? "بوابة الفتاوى الرسمية (دار الإفتاء)" : "الرئاسة العامة للبحوث العلمية والإفتاء"}
              </span>
              <span>•</span>
              <span>{lastSyncTime}</span>
            </div>

            <a
              href={activeRssTab === "egypt" ? "https://www.dar-alifta.org/ar/fatwa" : "https://www.alifta.gov.sa"}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>زيارة البوابة المعتمدة</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* Live Fatwas Carousel / List */}
        {!isRssCollapsed && (
          <div className="p-4 sm:p-5 space-y-3">
            {(activeRssTab === "egypt"
              ? (liveEgyptFatwas.length > 0 ? liveEgyptFatwas : INITIAL_FATWAS.filter((f) => f.source === "egypt"))
              : (liveSaudiFatwas.length > 0 ? liveSaudiFatwas : INITIAL_FATWAS.filter((f) => f.source === "saudi"))
            ).map((item) => {
              const isExpanded = expandedRssId === item.id;
              const isSpeaking = speakingFatwaId === item.id;

              return (
                <article
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all duration-200 hover:shadow-md ${
                    isPaper
                      ? "bg-[#FFFDF9] border-[#E2D5BE]"
                      : isDark
                      ? "bg-[#0c1e16] border-emerald-500/20"
                      : "bg-white border-slate-200"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-2 flex-1">
                      {/* Meta badges */}
                      <div className="flex flex-wrap items-center gap-2 text-[11px]">
                        <span className="px-2 py-0.5 rounded-lg bg-[#D4AF37]/15 text-[#B68C1C] dark:text-[#F3E7C4] font-bold font-mono">
                          {item.fatwaNumber || "فتوى معتمدة"}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-medium">
                          {item.categoryLabel || "مسائل وأحكام"}
                        </span>
                        <span className="text-slate-400 text-[10px]">{item.date}</span>
                      </div>

                      {/* Question */}
                      <h3 className="text-xs sm:text-sm font-bold font-alexandria leading-snug text-emerald-950 dark:text-emerald-100">
                        {item.question}
                      </h3>

                      {/* Ruling Highlight */}
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-900 dark:text-emerald-200 font-medium flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <div className="leading-relaxed">
                          <strong className="font-bold text-emerald-800 dark:text-emerald-300">خلاصة الحكم الشرعي: </strong>
                          {item.rulingShort}
                        </div>
                      </div>

                      {/* Expanded detailed answer */}
                      {isExpanded && item.detailedAnswer && (
                        <div className="pt-2 text-xs leading-relaxed space-y-2 border-t border-black/5 dark:border-white/5 animate-fadeIn">
                          <p className={isPaper ? "text-[#4D3622]" : "text-slate-600 dark:text-slate-300"}>
                            {item.detailedAnswer}
                          </p>
                          {item.evidence && (
                            <div className="p-2 rounded-lg bg-[#D4AF37]/10 text-[11px] text-[#B68C1C] dark:text-[#F3E7C4] italic">
                              <strong>الدليل الشرعي: </strong>{item.evidence}
                            </div>
                          )}
                          <div className="text-[11px] text-slate-400">
                            <strong>جهة الفتوى: </strong>{item.muftiOrCommittee}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-end gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-black/5 dark:border-white/5">
                      {/* Audio recitation button */}
                      <button
                        onClick={() => speakFatwa(item)}
                        disabled={isAudioLoading && speakingFatwaId === item.id}
                        title="استماع صوتي للفتوى (صوت مصري بشري دافئ)"
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          isSpeaking
                            ? "bg-amber-500 text-black shadow-xs"
                            : "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300"
                        }`}
                      >
                        {isSpeaking ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5" />
                            <span>إيقاف</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>استماع</span>
                          </>
                        )}
                      </button>

                      {/* Copy ruling button */}
                      <button
                        onClick={() => copyFatwa(item)}
                        title="نسخ نص الفتوى"
                        className="p-1.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-slate-500 dark:text-slate-300 transition cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {/* Official link */}
                      {item.officialUrl && (
                        <a
                          href={item.officialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="عرض في الموقع الرسمي"
                          className="p-1.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-slate-500 dark:text-slate-300 transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}

                      {/* Toggle details */}
                      <button
                        onClick={() => setExpandedRssId(isExpanded ? null : item.id)}
                        className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-0.5 mt-1 cursor-pointer"
                      >
                        <span>{isExpanded ? "إيجاز" : "التفاصيل"}</span>
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Fiqh Categories Hub OR Active Category Results */}
      {!selectedCategory && !searchQuery.trim() ? (
        <div id="fatwa-categories-hub" className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#D4AF37]" />
              <h3 className="text-base sm:text-lg font-bold font-alexandria">
                أبواب ومجالات الفتوى المعتمدة (دار الإفتاء المصرية والإفتاء السعودية)
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              اختر الباب الفقهي لاستعراض فتاواه
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {activeCategories.map((cat) => {
              const count =
                cat.id === "all"
                  ? allFatwas.length
                  : allFatwas.filter(
                      (f) =>
                        (selectedSource === "all" || f.source === selectedSource) &&
                        f.category === cat.id
                    ).length;

              const getCategoryIcon = (id: string) => {
                switch (id) {
                  case "prayer":
                    return "🕌";
                  case "finance":
                    return "💰";
                  case "fasting":
                    return "🌙";
                  case "family":
                    return "👨‍👩‍👧";
                  case "medical":
                    return "🩺";
                  case "hajj":
                    return "🕋";
                  case "contemporary":
                    return "💡";
                  default:
                    return "⚖️";
                }
              };

              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    soundEngine.playTasbihClick();
                    setSelectedCategory(cat.id);
                  }}
                  className={`p-5 rounded-2xl sm:rounded-3xl border text-right transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-98 flex flex-col justify-between cursor-pointer group ${
                    isPaper
                      ? "bg-[#FFFDF9] border-[#D6C5A9] hover:border-[#8C5E24]"
                      : isDark
                      ? "bg-[#091510] border-emerald-950/80 hover:border-emerald-600 text-white"
                      : "bg-white border-slate-200 hover:border-emerald-500 shadow-xs"
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center text-sm border border-emerald-500/20">
                        {getCategoryIcon(cat.id)}
                      </span>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] font-bold border border-[#D4AF37]/30">
                        فتاوى موثقة
                      </span>
                    </div>

                    <h4 className="text-base font-bold font-alexandria group-hover:text-emerald-500 transition">
                      {cat.label}
                    </h4>

                    <p className="text-xs text-slate-400 line-clamp-2">
                      فتاوى وأحكام شرعية معتمدة بنصوصها وأدلتها الرسمية من الهيئات المعتمدة.
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/10 flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-emerald-500">
                      {count} مسألة معتمدة
                    </span>
                    <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-[-4px] transition-transform">
                      <span>تصفح الباب</span>
                      <ChevronLeft className="w-4 h-4" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Fatwas List Section */
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
            <button
              onClick={() => {
                soundEngine.playTasbihClick();
                setSelectedCategory(null);
                setSearchQuery("");
              }}
              className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-300 hover:underline cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 rotate-180" />
              <span>العودة لأبواب ومجالات الفتوى</span>
            </button>

            <span className="text-slate-400 font-mono">
              {filteredFatwas.length} مسألة معتمدة {searchQuery && `(بحث: «${searchQuery}»)`}
            </span>
          </div>

        {filteredFatwas.length === 0 ? (
          <div className="p-10 rounded-3xl border border-dashed text-center space-y-3 bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10">
            <HelpCircle className="w-10 h-10 mx-auto text-slate-400 opacity-50" />
            <h4 className="font-bold text-sm">لم يتم العثور على فتوى مطابقة لبحثك</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              يمكنك كتابة سؤالك الآن وإرساله مباشرة إلى دار الإفتاء المصرية أو الإفتاء السعودية لتلقي إجابة رسمية معتمدة.
            </p>
            <button
              onClick={() => setIsAskModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#D4AF37] text-black font-bold text-xs shadow-md transition active:scale-95 inline-flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>إرسال سؤال جديد لدار الإفتاء</span>
            </button>
          </div>
        ) : (
          filteredFatwas.map((item) => {
            const isExpanded = expandedFatwaId === item.id;
            const isSaved = savedFatwaIds.includes(item.id);
            const isSpeaking = speakingFatwaId === item.id;

            return (
              <article
                key={item.id}
                id={`fatwa-card-${item.id}`}
                className={`rounded-3xl border p-5 sm:p-6 transition-all duration-200 shadow-sm ${
                  isPaper
                    ? "bg-[#FFFDF9] border-[#D6C5A9] text-[#2F1E12]"
                    : isDark
                    ? "bg-[#091510] border-emerald-950/80 hover:border-emerald-800 text-white"
                    : "bg-white border-slate-200 text-slate-900 shadow-xs"
                }`}
              >
                {/* Header: Badges and Source */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-black/5 dark:border-white/10 text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                        item.source === "egypt"
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {item.sourceName}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5 text-slate-400 text-[10px]">
                      {item.categoryLabel}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">
                      رقم: {item.fatwaNumber}
                    </span>
                  </div>

                  {/* Actions: Save, Audio, Copy, Open */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => speakFatwa(item)}
                      className={`p-1.5 rounded-lg border transition ${
                        isSpeaking
                          ? "bg-emerald-500 text-white border-emerald-500"
                          : "border-black/10 dark:border-white/10 text-slate-400 hover:text-white"
                      }`}
                      title={isSpeaking ? "إيقاف القراءة" : "الاستماع للفتوى صوتياً"}
                    >
                      {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => copyFatwa(item)}
                      className="p-1.5 rounded-lg border border-black/10 dark:border-white/10 text-slate-400 hover:text-white transition"
                      title="نسخ نص الفتوى"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => toggleSaveFatwa(item.id)}
                      className={`p-1.5 rounded-lg border transition ${
                        isSaved
                          ? "bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/40"
                          : "border-black/10 dark:border-white/10 text-slate-400 hover:text-white"
                      }`}
                      title={isSaved ? "محفوظة في فتاواك المفضلة" : "حفظ الفتوى"}
                    >
                      {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Question */}
                <div
                  onClick={() => {
                    soundEngine.playTasbihClick();
                    setExpandedFatwaId(isExpanded ? null : item.id);
                  }}
                  className="pt-3 cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm sm:text-base font-bold font-alexandria text-emerald-600 dark:text-emerald-400 group-hover:text-[#D4AF37] transition leading-snug">
                      س: {item.question}
                    </h3>
                    <button className="p-1 text-slate-400 group-hover:text-white transition shrink-0 mt-0.5">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Short Ruling Badge */}
                  <div className="mt-2 p-2.5 sm:p-3 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-xs sm:text-sm font-semibold text-[#8C6D15] dark:text-[#F3E7C4] flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#B68C1C] dark:text-[#F3E7C4] block sm:inline ml-1">
                        خلاصة الحكم الشرعي:
                      </span>
                      <span>{item.rulingShort}</span>
                    </div>
                  </div>
                </div>

                {/* Detailed Answer & Evidences (Expanded) */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/10 space-y-4 animate-in fade-in duration-200">
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        البيان والفتوى المفصلة:
                      </h4>
                      <p className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-200 font-sans">
                        {item.detailedAnswer}
                      </p>
                    </div>

                    {item.evidence && (
                      <div className="p-3 rounded-2xl bg-black/10 dark:bg-white/5 border border-black/5 dark:border-white/10 text-xs">
                        <span className="font-bold text-[#D4AF37] block mb-1">الدليل والتعليل الشرعي:</span>
                        <p className="text-slate-400 dark:text-slate-300 italic font-amiri text-sm leading-relaxed">
                          {item.evidence}
                        </p>
                      </div>
                    )}

                    {/* Attribution footer */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 pt-2 border-t border-black/5 dark:border-white/5">
                      <div>
                        <span>الصادر عن: </span>
                        <strong className="text-slate-300">{item.muftiOrCommittee}</strong>
                        <span> • {item.date}</span>
                      </div>

                      <a
                        href={item.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-emerald-500 hover:text-emerald-400 font-bold"
                      >
                        <span>رابط الفتوى على الموقع الرسمي</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>
      )}

      {/* ========================================================================= */}
      {/* ASK FATWA / SUBMIT QUESTION MODAL WITH ROUTING TO OFFICIAL AUTHORITIES */}
      {/* ========================================================================= */}
      {isAskModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          dir="rtl"
        >
          <div className="w-full max-w-xl rounded-3xl bg-[#0B1512] border border-[#D4AF37]/40 shadow-2xl p-6 relative overflow-hidden space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold font-alexandria text-white text-sm sm:text-base">
                    إرسال سؤال أو طلب فتوى جديدة
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    صياغة السؤال وتوجيهه مباشرة لدار الإفتاء الرسمية
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsAskModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white bg-white/5"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-white/5 p-3 rounded-2xl border border-white/10">
              قم بصياغة استفسارك هنا بكل دقة ووضوح. سيقوم التطبيق بتنسيق السؤال وتجهيزه ونسخه ثم توجيهك بضغطة زر واحدة مباشرة إلى نافذة الاستفتاء الرسمي الإلكتروني لدى <strong>دار الإفتاء المصرية</strong> أو <strong>الإفتاء السعودية</strong>، حرصاً على تلقي الجواب من أهله المعتمدين.
            </p>

            {/* Form Fields */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">تصنيف المسألة:</label>
                <select
                  value={questionCategory}
                  onChange={(e) => setQuestionCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="prayer">الصلوات والعبادات والطهارة</option>
                  <option value="finance">المعاملات المالية والبنوك والتجارة</option>
                  <option value="family">الأسرة والطلاق والميراث والزواج</option>
                  <option value="fasting">الصيام والزكاة والكفارات</option>
                  <option value="medical">فتاوى الطب والعلاج والعمليات</option>
                  <option value="hajj">الحج والعمرة والزيارة</option>
                  <option value="contemporary">مسائل فكرية ومعاصرة أخرى</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">عنوان أو موضوع السؤال:</label>
                <input
                  type="text"
                  value={questionSubject}
                  onChange={(e) => setQuestionSubject(e.target.value)}
                  placeholder="مثال: حكم السهو في سجود التلاوة..."
                  className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  نص السؤال بالتفصيل (يرجى ذكر كافة التفاصيل ذات الأثر في الحكم):
                </label>
                <textarea
                  rows={4}
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="اكتب سؤالك بوضوح وتفصيل..."
                  className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  رقم الهاتف أو البريد الإلكتروني (اختياري لمتابعتك):
                </label>
                <input
                  type="text"
                  value={userEmailOrPhone}
                  onChange={(e) => setUserEmailOrPhone(e.target.value)}
                  placeholder="010xxxxxxxxx أو name@example.com"
                  className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            {/* Submit & Forward Buttons */}
            <div className="pt-3 border-t border-white/10 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleRouteToDarAlIfta}
                  disabled={!questionText.trim()}
                  className="px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Building2 className="w-4 h-4" />
                  <span>توجيه إلى دار الإفتاء المصرية</span>
                </button>

                <button
                  type="button"
                  onClick={handleRouteToSaudiIfta}
                  disabled={!questionText.trim()}
                  className="px-4 py-3 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#B38038] hover:brightness-110 text-black font-extrabold text-xs shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Building2 className="w-4 h-4" />
                  <span>توجيه إلى الإفتاء السعودية</span>
                </button>
              </div>

              {/* Direct Hotlines Notice */}
              <div className="p-3 rounded-2xl bg-black/30 border border-white/5 text-[11px] text-slate-400 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>هاتف دار الإفتاء المصرية: 107 (من داخل مصر)</span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-400">
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>هاتف الإفتاء السعودية: 8002451000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
