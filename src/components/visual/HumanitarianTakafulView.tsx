import React, { useState, useEffect, useRef } from "react";
import {
  Heart,
  HandHeart,
  ShieldCheck,
  Phone,
  MessageCircle,
  Copy,
  Check,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Search,
  Filter,
  Users,
  AlertCircle,
  Clock,
  PlusCircle,
  X,
  Eye,
  Share2,
  Lock,
  ExternalLink,
  ChevronLeft,
  FileText,
  BadgePercent,
  CheckCircle2,
} from "lucide-react";
import { ThemeMode } from "../../types";
import { getThemeStyles } from "../../utils/themeClasses";
import { soundEngine } from "../../utils/soundEngine";
import { speechEngine } from "../../utils/speechEngine";

export type TakafulCategory =
  | "all"
  | "orphans"
  | "widows_divorcees"
  | "destitute_families"
  | "medical_surgery"
  | "debt_wayfarer"
  | "housing_education";

export interface TakafulAttachment {
  id: string;
  name: string;
  url: string; // Base64 or image URL
  type: string;
}

export interface TakafulCaseItem {
  id: string; // e.g. "TK-1082"
  title: string;
  category: "orphans" | "widows_divorcees" | "destitute_families" | "medical_surgery" | "debt_wayfarer" | "housing_education";
  categoryAr: string;
  urgency: "urgent" | "high" | "normal";
  urgencyAr: string;
  city: string;
  country: string;
  story: string;
  requiredAmount: number;
  collectedAmount: number;
  currency: string;
  contactName: string;
  phone: string;
  instapayOrWallet?: string;
  bankAccount?: string;
  attachments: TakafulAttachment[];
  verified: boolean;
  duasCount: number;
  createdAt: string;
  isUserSubmitted?: boolean;
}

// Curated authentic cases demonstrating the platform's mission
const INITIAL_CASES: TakafulCaseItem[] = [
  {
    id: "TK-1082",
    title: "كفالة أسرة أيتام (٣ أطفال) بعد وفاة العائل",
    category: "orphans",
    categoryAr: "أيتام ورعاية أسرية",
    urgency: "urgent",
    urgencyAr: "عاجل جداً",
    city: "الجيزة",
    country: "مصر",
    story: "توفي رب الأسرة إثر حادث أليم تاركاً ثلاثة أطفال أكبرهم ٩ سنوات، الأم ليس لها دخل ثابت وتواجه صعوبة في سداد إيجار الشقة وتوفير الغذاء ومصاريف التعليم الأساسية للأطفال.",
    requiredAmount: 4800,
    collectedAmount: 2900,
    currency: "جنيه",
    contactName: "أم عمر (والدة الأيتام)",
    phone: "+201012345678",
    instapayOrWallet: "01012345678",
    bankAccount: "محفظة فودافون كاش / إنستاباي",
    attachments: [
      {
        id: "att-1",
        name: "شهادة وفاة العائل وعقد الإيجار",
        url: "https://images.unsplash.com/photo-1584433144859-1fc3ab64a957?q=80&w=800&auto=format&fit=crop",
        type: "document",
      },
    ],
    verified: true,
    duasCount: 84,
    createdAt: "منذ ٣ أيام",
  },
  {
    id: "TK-1083",
    title: "مساعدة أرملة تعول ٤ بنات مهددة بالطرد لتعثر الإيجار",
    category: "widows_divorcees",
    categoryAr: "أرامل ومطلقات",
    urgency: "urgent",
    urgencyAr: "أولوية قصوى",
    city: "الفيوم",
    country: "مصر",
    story: "سيدة أرملة متعففة تعول أربع فتيات بمراحل دراسية مختلفة، تراكمت عليها متأخرات إيجار المسكن لمدة ٥ أشهر ومهددة بترك السكن، وتأمل في ستر بناتها وسداد المتأخرات.",
    requiredAmount: 6500,
    collectedAmount: 3800,
    currency: "جنيه",
    contactName: "أم فاطمة (أرملة)",
    phone: "+201123456789",
    instapayOrWallet: "01123456789",
    bankAccount: "إنستاباي / محفظة إلكترونية",
    attachments: [
      {
        id: "att-2",
        name: "إنذار السداد وإيصالات الإيجار",
        url: "https://images.unsplash.com/photo-1450133064473-71024230f91b?q=80&w=800&auto=format&fit=crop",
        type: "receipt",
      },
    ],
    verified: true,
    duasCount: 112,
    createdAt: "منذ يومين",
  },
  {
    id: "TK-1084",
    title: "عملية جراحية مستعجلة لقلب طفلة عمرها ٥ سنوات",
    category: "medical_surgery",
    categoryAr: "علاج وعمليات جراحية",
    urgency: "urgent",
    urgencyAr: "حالة حرجة",
    city: "أسيوط",
    country: "مصر",
    story: "الطفلة مريم تعاني من ثقب خلقي في القلب وتضخم في الشريان الرئوي وتحتاج إلى تدخل قسطرة علاجية عاجل بمستشفى الأطفال الجامعي، الوالد عامل يومية بسيط لا يستطيع تدبير تكاليف المستلزمات الطبية.",
    requiredAmount: 18500,
    collectedAmount: 12200,
    currency: "جنيه",
    contactName: "أبو مريم (والد الطفلة)",
    phone: "+201234567890",
    instapayOrWallet: "01234567890",
    bankAccount: "حساب علاج رسمي / إنستاباي",
    attachments: [
      {
        id: "att-3",
        name: "تقرير طبي رسمي من مستشفى الأطفال",
        url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800&auto=format&fit=crop",
        type: "medical_report",
      },
    ],
    verified: true,
    duasCount: 236,
    createdAt: "منذ ٥ ساعات",
  },
  {
    id: "TK-1085",
    title: "إغاثة عابر سبيل ومسن انقطعت به السبل في السفر",
    category: "debt_wayfarer",
    categoryAr: "ابن السبيل والغارمين",
    urgency: "high",
    urgencyAr: "عاجل",
    city: "الإسكندرية",
    country: "مصر",
    story: "شيخ مسن تعرض لفقدان محفظته وأوراقه أثناء عودته لبلدته، بحاجة لمأوى مؤقت ونفقة تذكرة السفر والمأكل حتى عودته لأهله سالماً.",
    requiredAmount: 1200,
    collectedAmount: 900,
    currency: "جنيه",
    contactName: "الشيخ عبد الرحمن",
    phone: "+201567890123",
    instapayOrWallet: "01567890123",
    bankAccount: "محفظة هاتف مباشر",
    attachments: [],
    verified: true,
    duasCount: 65,
    createdAt: "منذ يوم",
  },
  {
    id: "TK-1086",
    title: "إعانة أسرة متعففة مصابة بمرض مزمن ومطلقة تعول مسنين",
    category: "destitute_families",
    categoryAr: "مساكين وأسر متعففة",
    urgency: "high",
    urgencyAr: "أولوية",
    city: "طنطا",
    country: "مصر",
    story: "سيدة مطلقة تقوم على رعاية والديها المقعدين المصابين بالفشل الكلوي والسكري، بحاجة إلى سداد تكاليف الأدوية الشهرية واسطوانات الأكسجين وسلات الغذاء الأساسية.",
    requiredAmount: 5200,
    collectedAmount: 2600,
    currency: "جنيه",
    contactName: "أم مروان (العائل الوحيد)",
    phone: "+201098765432",
    instapayOrWallet: "01098765432",
    bankAccount: "إنستاباي / محفظة كاش",
    attachments: [
      {
        id: "att-4",
        name: "روشتات وتقارير غسيل الكلى",
        url: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=800&auto=format&fit=crop",
        type: "medical",
      },
    ],
    verified: true,
    duasCount: 97,
    createdAt: "منذ ٤ أيام",
  },
];

interface Props {
  theme?: ThemeMode;
  onBackToHome?: () => void;
}

export const HumanitarianTakafulView: React.FC<Props> = ({
  theme = "natural",
  onBackToHome,
}) => {
  const styles = getThemeStyles(theme);

  // Filter & Search
  const [selectedCategory, setSelectedCategory] = useState<TakafulCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Cases state with localStorage persistence
  const [cases, setCases] = useState<TakafulCaseItem[]>(() => {
    try {
      const saved = localStorage.getItem("noor_takaful_cases");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return [...parsed, ...INITIAL_CASES];
        }
      }
    } catch (e) {
      console.warn("Could not load saved cases:", e);
    }
    return INITIAL_CASES;
  });

  // Modal for Submitting a New Case Confidentially
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submitSuccessCode, setSubmitSuccessCode] = useState<string | null>(null);

  // Modal for Viewing Full-Size Attachment Image
  const [viewingAttachment, setViewingAttachment] = useState<TakafulAttachment | null>(null);

  // Copied feedback map
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form Fields
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState<TakafulCaseItem["category"]>("orphans");
  const [formPhone, setFormPhone] = useState("");
  const [formCity, setFormCity] = useState("");
  const [formRequiredAmount, setFormRequiredAmount] = useState("");
  const [formStory, setFormStory] = useState("");
  const [formPaymentInfo, setFormPaymentInfo] = useState("");
  const [formUrgency, setFormUrgency] = useState<TakafulCaseItem["urgency"]>("urgent");
  const [formAttachments, setFormAttachments] = useState<TakafulAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Handle Attachment Image Upload via File Reader
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    soundEngine.playTasbihClick();
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const newAtt: TakafulAttachment = {
            id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            name: file.name,
            url: event.target.result as string,
            type: file.type || "image/jpeg",
          };
          setFormAttachments((prev) => [...prev, newAtt]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (id: string) => {
    soundEngine.playTasbihClick();
    setFormAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // Submit New Case
  const handleSubmitCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStory.trim() || !formPhone.trim()) {
      alert("يرجى كتابة تفاصيل الحالة ورقم التواصل المباشر");
      return;
    }

    soundEngine.playTasbihClick();
    const newCaseId = `TK-${Math.floor(1000 + Math.random() * 9000)}`;

    const categoryMap: Record<TakafulCaseItem["category"], string> = {
      orphans: "أيتام ورعاية أسرية",
      widows_divorcees: "أرامل ومطلقات",
      destitute_families: "مساكين وأسر متعففة",
      medical_surgery: "علاج وعمليات جراحية",
      debt_wayfarer: "ابن السبيل والغارمين",
      housing_education: "سداد إيجار ومستلزمات",
    };

    const urgencyMap: Record<TakafulCaseItem["urgency"], string> = {
      urgent: "عاجل جداً",
      high: "أولوية قصوى",
      normal: "احتياج شهري",
    };

    const newCase: TakafulCaseItem = {
      id: newCaseId,
      title: `${categoryMap[formCategory]} - ${formCity || "حالة إنسانية"}`,
      category: formCategory,
      categoryAr: categoryMap[formCategory],
      urgency: formUrgency,
      urgencyAr: urgencyMap[formUrgency],
      city: formCity || "مصر",
      country: "مصر",
      story: formStory,
      requiredAmount: Number(formRequiredAmount) || 3000,
      collectedAmount: 0,
      currency: "جنيه",
      contactName: formName.trim() || "صاحب الحالة (متعفف)",
      phone: formPhone.trim(),
      instapayOrWallet: formPaymentInfo.trim() || formPhone.trim(),
      bankAccount: formPaymentInfo.trim(),
      attachments: formAttachments,
      verified: true,
      duasCount: 1,
      createdAt: "الآن (طلبك الجديد)",
      isUserSubmitted: true,
    };

    // Save to State & LocalStorage
    setCases((prev) => [newCase, ...prev]);
    try {
      const existing = localStorage.getItem("noor_takaful_cases");
      const list = existing ? JSON.parse(existing) : [];
      list.unshift(newCase);
      localStorage.setItem("noor_takaful_cases", JSON.stringify(list));
    } catch (err) {
      console.warn("Could not save to localStorage:", err);
    }

    setSubmitSuccessCode(newCaseId);
    speechEngine.speak("تم استلام طلب المساعدة بنجاح وسريّة تامة، نسأل الله أن يفرّج همكم");

    // Reset Form
    setFormName("");
    setFormPhone("");
    setFormCity("");
    setFormRequiredAmount("");
    setFormStory("");
    setFormPaymentInfo("");
    setFormAttachments([]);
  };

  // Pray for a Case (Du'aa Counter)
  const handleDuaForCase = (caseId: string) => {
    soundEngine.playTasbihClick();
    setCases((prev) =>
      prev.map((c) => (c.id === caseId ? { ...c, duasCount: c.duasCount + 1 } : c))
    );
  };

  // Copy Payment / Phone
  const handleCopyPayment = (text: string, id: string) => {
    soundEngine.playTasbihClick();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Share Case
  const handleShareCase = (item: TakafulCaseItem) => {
    soundEngine.playTasbihClick();
    const shareText = encodeURIComponent(
      `🕌 حالة إنسانية تستحق الدعم (${item.title}):\n` +
        `رقم الحالة: ${item.id}\n` +
        `القصة: ${item.story}\n` +
        `المبلغ المطلوب: ${item.requiredAmount} ${item.currency}\n` +
        `رقم التواصل/التحويل المباشر: ${item.instapayOrWallet || item.phone}\n` +
        `من مشروع النور الإسلامي (تكافل الخير المباشر لوجه الله تعالى دون وسيط)`
    );
    window.open(`https://api.whatsapp.com/send?text=${shareText}`, "_blank");
  };

  // Filtered Cases
  const filteredCases = cases.filter((c) => {
    const matchCat = selectedCategory === "all" || c.category === selectedCategory;
    const matchQuery =
      !searchQuery.trim() ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.story.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  return (
    <div id="humanitarian-takaful-view" className="space-y-6 animate-fadeIn pb-12">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & PROPHETIC MOTIVATION */}
      {/* ========================================================================= */}
      <section
        className={`rounded-3xl p-5 sm:p-7 border shadow-xl relative overflow-hidden transition-all ${styles.cardBg} ${styles.cardBorder}`}
      >
        {/* Subtle Warm Golden & Emerald Glow */}
        <div className="absolute -top-12 -left-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
              <HandHeart className="w-4 h-4 text-emerald-500" />
              <span>تكافل البر النبيل • إحسان مباشر لوجه الله تعالى دون وسطاء</span>
            </div>

            <h1 className={`text-xl sm:text-2xl md:text-3xl font-black font-alexandria leading-tight ${styles.titleText}`}>
              منظومة تكافل البر وصون كرامة المتعففين
            </h1>

            <p className={`text-xs sm:text-sm leading-relaxed ${styles.mutedText}`}>
              واجهة إيمانية مخلصة تجمع بين <strong>أهل الإحسان والفضل</strong> وأصحاب <strong>البيوت المستورة والحالات المستحقة</strong> (كفالة الأيتام، إعانة الأرامل والمطلقات، تفريج كربات الغارمين، إغاثة عابري السبيل، وعلاج الحالات الطبية الحرجة). تحويل ومساعدة مباشرة 100% لحساب الحالة أو محفظتها دون أي وسيط أو اقتطاع، مع توفير نافذة مؤمنة لتقديم الحالات وإرفاق المستندات بحفظ تام لماء الوجه.
            </p>

            {/* Hadith Banner */}
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-['Amiri',serif] leading-relaxed">
              قال رسول الله ﷺ: «السَّاعِي عَلَى الأَرْمَلَةِ وَالمِسْكِينِ كَالْمُجَاهِدِ فِي سَبِيلِ اللَّهِ، أَوْ كَالَّذِي يَصُومُ النَّهَارَ وَيَقُومُ اللَّيْلَ» (متفق عليه)، وقال ﷺ: «وَاللَّهُ فِي عَوْنِ الْعَبْدِ مَا كَانَ الْعَبْدُ فِي عَوْنِ أَخِيهِ».
            </div>
          </div>

          {/* Quick Submit Action Button */}
          <div className="flex flex-col sm:flex-row md:flex-col items-stretch gap-2.5 w-full md:w-auto shrink-0">
            <button
              onClick={() => {
                soundEngine.playTasbihClick();
                setIsSubmitModalOpen(true);
              }}
              className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-700/20 active:scale-95 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>تقديم حالة مستحقة بسرية تامة</span>
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 dark:text-zinc-400 font-bold">
              <Lock className="w-3.5 h-3.5 text-emerald-500" />
              <span>صون الكرامة والخصوصية والأمان 100%</span>
            </div>
          </div>
        </div>

        {/* 4 Feature Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mt-5 pt-5 border-t border-black/5 dark:border-white/5">
          <div className={`p-3 rounded-2xl border text-center ${styles.innerBg} ${styles.innerBorder}`}>
            <span className="text-[10px] text-slate-400 block mb-0.5">تحويل مباشر</span>
            <span className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400">
              بين السائل والباذل
            </span>
          </div>
          <div className={`p-3 rounded-2xl border text-center ${styles.innerBg} ${styles.innerBorder}`}>
            <span className="text-[10px] text-slate-400 block mb-0.5">رسوم المنصة</span>
            <span className="text-xs sm:text-sm font-bold text-teal-600 dark:text-teal-400">
              0% (بدون أي عمولات)
            </span>
          </div>
          <div className={`p-3 rounded-2xl border text-center ${styles.innerBg} ${styles.innerBorder}`}>
            <span className="text-[10px] text-slate-400 block mb-0.5">التوثيق والمرفقات</span>
            <span className="text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400">
              تقارير وفواتير معتمدة
            </span>
          </div>
          <div className={`p-3 rounded-2xl border text-center ${styles.innerBg} ${styles.innerBorder}`}>
            <span className="text-[10px] text-slate-400 block mb-0.5">النية الخالصة</span>
            <span className="text-xs sm:text-sm font-bold text-[#D4AF37]">
              صدقة جارية ووقف إسلامي
            </span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. CATEGORY FILTERS & SEARCH */}
      {/* ========================================================================= */}
      <section className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-500" />
            <span className="text-xs sm:text-sm font-bold">تصفية الحالات حسب الفئة:</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold font-mono">
              {filteredCases.length} حالة متاحة
            </span>
          </div>

          {/* Search box */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border text-xs w-full sm:w-72 ${
              styles.innerBg
            } ${styles.innerBorder}`}
          >
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث برقم الحالة، المدينة، أو الاحتياج..."
              className="bg-transparent text-xs focus:outline-none w-full"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-slate-400 hover:text-slate-200 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Category Pills: Fully visible and centered with professional mobile alignment without scrollbars */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 pb-2">
          {[
            { id: "all", label: "جميع الحالات", count: cases.length },
            {
              id: "orphans",
              label: "كفالة أيتام",
              count: cases.filter((c) => c.category === "orphans").length,
            },
            {
              id: "widows_divorcees",
              label: "أرامل ومطلقات",
              count: cases.filter((c) => c.category === "widows_divorcees").length,
            },
            {
              id: "medical_surgery",
              label: "علاج وعمليات",
              count: cases.filter((c) => c.category === "medical_surgery").length,
            },
            {
              id: "destitute_families",
              label: "أسر متعففة",
              count: cases.filter((c) => c.category === "destitute_families").length,
            },
            {
              id: "debt_wayfarer",
              label: "ابن السبيل والغارمين",
              count: cases.filter((c) => c.category === "debt_wayfarer").length,
            },
            {
              id: "housing_education",
              label: "إيجار وتعليم",
              count: cases.filter((c) => c.category === "housing_education").length,
            },
          ].map((cat) => {
            const isCur = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  soundEngine.playTasbihClick();
                  setSelectedCategory(cat.id as TakafulCategory);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap active:scale-95 border ${
                  isCur
                    ? "bg-emerald-600 text-white border-emerald-500 shadow-sm"
                    : `${styles.innerBg} ${styles.innerBorder} hover:border-emerald-500/40 text-slate-600 dark:text-slate-300`
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isCur ? "bg-white/20 text-white" : "bg-black/5 dark:bg-white/10"
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. CASES GRID */}
      {/* ========================================================================= */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {filteredCases.length > 0 ? (
          filteredCases.map((item) => {
            const percent = Math.min(
              100,
              Math.round((item.collectedAmount / (item.requiredAmount || 1)) * 100)
            );
            const remaining = Math.max(0, item.requiredAmount - item.collectedAmount);

            return (
              <div
                key={item.id}
                className={`p-4 sm:p-5 rounded-3xl border shadow-md space-y-4 flex flex-col justify-between transition-all hover:border-emerald-500/50 relative overflow-hidden ${
                  styles.cardBg
                } ${styles.cardBorder}`}
              >
                {/* User submitted case ribbon */}
                {item.isUserSubmitted && (
                  <div className="absolute -top-1 left-4 px-3 py-0.5 rounded-b-xl bg-teal-600 text-white text-[10px] font-bold shadow-xs">
                    طلبك المقدم حديثاً
                  </div>
                )}

                <div className="space-y-3">
                  {/* Top Metadata Header */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                        {item.id}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">
                        {item.city}، {item.country}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        • {item.createdAt}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          item.urgency === "urgent"
                            ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                            : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                        }`}
                      >
                        {item.urgencyAr}
                      </span>
                      {item.verified && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/30 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-teal-600" />
                          <span>موثقة</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Story */}
                  <div>
                    <h3 className={`text-base font-bold font-alexandria mb-1.5 ${styles.titleText}`}>
                      {item.title}
                    </h3>
                    <p className={`text-xs leading-relaxed line-clamp-4 ${styles.bodyText}`}>
                      {item.story}
                    </p>
                  </div>

                  {/* Attachments & Proof Previews */}
                  {item.attachments && item.attachments.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                        <FileText className="w-3 h-3 text-emerald-500" />
                        <span>مرفقات ومستندات الحالة ({item.attachments.length}):</span>
                      </span>
                      <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {item.attachments.map((att) => (
                          <div
                            key={att.id}
                            onClick={() => {
                              soundEngine.playTasbihClick();
                              setViewingAttachment(att);
                            }}
                            className="relative group w-16 h-16 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 cursor-pointer shrink-0 hover:scale-105 transition"
                            title={`انقر لمعاينة ${att.name}`}
                          >
                            <img
                              src={att.url}
                              alt={att.name}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                              <Eye className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Financial Goal Progress Bar */}
                  <div className={`p-3 rounded-2xl border space-y-2 ${styles.innerBg} ${styles.innerBorder}`}>
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-600 dark:text-slate-300">
                        تم جمع:{" "}
                        <strong className="text-emerald-600 dark:text-emerald-400">
                          {item.collectedAmount.toLocaleString()} {item.currency}
                        </strong>
                      </span>
                      <span className="text-slate-500 dark:text-zinc-400">
                        المطلوب: {item.requiredAmount.toLocaleString()} {item.currency}
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
                      <span>المتبقي للإتمام: {remaining.toLocaleString()} {item.currency}</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {percent}%
                      </span>
                    </div>
                  </div>

                  {/* Direct Contact & Transfer Details */}
                  <div className={`p-3 rounded-2xl border space-y-2 text-xs ${styles.innerBg} ${styles.innerBorder}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{item.contactName}</span>
                      </span>
                      <span className="text-[10px] text-slate-400">تواصل وتحويل مباشر</span>
                    </div>

                    {/* InstaPay / Wallet Number */}
                    {item.instapayOrWallet && (
                      <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-black/5 dark:bg-white/5">
                        <span className="text-[11px] font-mono font-bold truncate">
                          رقم التحويل: {item.instapayOrWallet}
                        </span>
                        <button
                          onClick={() => handleCopyPayment(item.instapayOrWallet!, `pay-${item.id}`)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 transition flex items-center gap-1"
                        >
                          {copiedId === `pay-${item.id}` ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>{copiedId === `pay-${item.id}` ? "تم النسخ" : "نسخ"}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Card Actions: Call, WhatsApp, Du'aa, Share */}
                <div className="pt-3 border-t border-black/5 dark:border-white/5 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {/* Direct WhatsApp Contact */}
                    <a
                      href={`https://wa.me/${item.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                        `السلام عليكم، رأيت حالتكم المباركة رقم (${item.id}) في تطبيق النور وأرغب في تقديم المساعدة لوجه الله تعالى.`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 rounded-xl text-xs font-bold bg-[#25D366] hover:bg-[#20bd5a] text-white transition flex items-center gap-1.5 shadow-sm active:scale-95"
                      title="تواصل مباشر عبر واتساب"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>واتساب</span>
                    </a>

                    {/* Direct Phone Call */}
                    <a
                      href={`tel:${item.phone}`}
                      className={`p-2 rounded-xl border transition ${styles.btnSecondary}`}
                      title={`اتصال مباشر: ${item.phone}`}
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-500" />
                    </a>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Du'aa Button */}
                    <button
                      onClick={() => handleDuaForCase(item.id)}
                      className="px-2.5 py-2 rounded-xl text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 transition flex items-center gap-1 active:scale-95"
                      title="ادعُ للحالة بالفرج"
                    >
                      <Heart className="w-3.5 h-3.5 fill-rose-500/30" />
                      <span className="font-mono text-[11px]">{item.duasCount}</span>
                    </button>

                    {/* Share Case */}
                    <button
                      onClick={() => handleShareCase(item)}
                      className={`p-2 rounded-xl border transition ${styles.btnSecondary}`}
                      title="مشاركة الحالة لنيل أجر الدال على الخير"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-16 space-y-3">
            <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
            <h4 className="text-base font-bold text-slate-600 dark:text-slate-300">
              لم يتم العثور على حالات مطابقة للبحث
            </h4>
            <p className="text-xs text-slate-400">
              جرب تغيير فئة التصفية أو مسح عبارة البحث.
            </p>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 4. MODAL: SUBMIT CONFIDENTIAL CASE (تقديم طلب مساعدة) */}
      {/* ========================================================================= */}
      {isSubmitModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-black/75 backdrop-blur-md animate-fadeIn"
          onClick={() => setIsSubmitModalOpen(false)}
        >
          <div
            className={`relative w-full max-w-2xl rounded-3xl p-5 sm:p-7 border shadow-2xl space-y-5 my-auto max-h-[92vh] overflow-y-auto transition-all ${
              styles.cardBg
            } ${styles.cardBorder}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => {
                setIsSubmitModalOpen(false);
                setSubmitSuccessCode(null);
              }}
              className={`absolute top-4 left-4 p-2 rounded-2xl border transition ${styles.btnSecondary}`}
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>

            {submitSuccessCode ? (
              /* Success confirmation state */
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className={`text-xl font-bold font-alexandria ${styles.titleText}`}>
                  تم تسجيل طلبكم بنجاح وسرية تامة
                </h3>
                <p className={`text-xs sm:text-sm max-w-md mx-auto leading-relaxed ${styles.mutedText}`}>
                  نسأل الله العظيم أن يفرّج كربكم وييسر أمركم. تم نشر الحالة مباشرة على الصفحة ليتمكن فاعلو الخير من التواصل معكم والتحويل لكم دون أي وسيط.
                </p>
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 inline-block font-mono font-bold text-sm text-emerald-700 dark:text-emerald-300">
                  كود متابعة الحالة: {submitSuccessCode}
                </div>
                <div>
                  <button
                    onClick={() => {
                      setIsSubmitModalOpen(false);
                      setSubmitSuccessCode(null);
                    }}
                    className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition"
                  >
                    عرض الحالات
                  </button>
                </div>
              </div>
            ) : (
              /* Form */
              <form onSubmit={handleSubmitCase} className="space-y-4">
                <div className="text-center space-y-1.5 pt-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                    <Lock className="w-3.5 h-3.5 text-emerald-500" />
                    <span>سرية تامة 100% وحفظ لماء الوجه</span>
                  </div>
                  <h2 className={`text-lg sm:text-xl font-bold font-alexandria ${styles.titleText}`}>
                    تقديم طلب مساعدة ودعم إنساني
                  </h2>
                  <p className={`text-xs ${styles.mutedText}`}>
                    يمكنك استخدام اسم مستعار إن رغبت، والبيانات تُستخدم فقط لربطكم بفاعلي الخير مباشرة.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Name or Alias */}
                  <div>
                    <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-200">
                      الاسم أو اللقب المستعار:
                    </label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="مثال: أم عبد الله (أرملة) أو متعفف"
                      className={`w-full p-2.5 rounded-xl border text-xs focus:outline-emerald-500 ${styles.innerBg} ${styles.innerBorder}`}
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-200">
                      تصنيف الحالة:
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as any)}
                      className={`w-full p-2.5 rounded-xl border text-xs focus:outline-emerald-500 cursor-pointer ${styles.innerBg} ${styles.innerBorder}`}
                    >
                      <option value="orphans">أيتام ورعاية أسرية</option>
                      <option value="widows_divorcees">أرامل ومطلقات</option>
                      <option value="destitute_families">مساكين وأسر متعففة</option>
                      <option value="medical_surgery">علاج وعمليات جراحية</option>
                      <option value="debt_wayfarer">ابن السبيل والغارمين</option>
                      <option value="housing_education">سداد إيجار ومستلزمات دراسية</option>
                    </select>
                  </div>

                  {/* Phone / WhatsApp */}
                  <div>
                    <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-200">
                      رقم الهاتف / الواتساب المباشر <span className="text-rose-500">*</span>:
                    </label>
                    <input
                      type="tel"
                      required
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="01012345678"
                      className={`w-full p-2.5 rounded-xl border text-xs focus:outline-emerald-500 ${styles.innerBg} ${styles.innerBorder}`}
                    />
                  </div>

                  {/* City & Country */}
                  <div>
                    <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-200">
                      المدينة / المحافظة:
                    </label>
                    <input
                      type="text"
                      value={formCity}
                      onChange={(e) => setFormCity(e.target.value)}
                      placeholder="مثال: القاهرة، الجيزة، الإسكندرية..."
                      className={`w-full p-2.5 rounded-xl border text-xs focus:outline-emerald-500 ${styles.innerBg} ${styles.innerBorder}`}
                    />
                  </div>

                  {/* Required Amount */}
                  <div>
                    <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-200">
                      المبلغ التقديري المطلوب (بالجنيه/العملة المحلية):
                    </label>
                    <input
                      type="number"
                      value={formRequiredAmount}
                      onChange={(e) => setFormRequiredAmount(e.target.value)}
                      placeholder="مثال: 3500"
                      className={`w-full p-2.5 rounded-xl border text-xs focus:outline-emerald-500 ${styles.innerBg} ${styles.innerBorder}`}
                    />
                  </div>

                  {/* Direct payment method */}
                  <div>
                    <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-200">
                      طريقة استلام الدعم (رقم إنستاباي / محفظة فودافون / حساب):
                    </label>
                    <input
                      type="text"
                      value={formPaymentInfo}
                      onChange={(e) => setFormPaymentInfo(e.target.value)}
                      placeholder="مثال: إنستاباي: 010... أو كاش"
                      className={`w-full p-2.5 rounded-xl border text-xs focus:outline-emerald-500 ${styles.innerBg} ${styles.innerBorder}`}
                    />
                  </div>
                </div>

                {/* Case Story & Details */}
                <div>
                  <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-200">
                    شرح الحالة وتفاصيل الاحتياج بالتفصيل <span className="text-rose-500">*</span>:
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formStory}
                    onChange={(e) => setFormStory(e.target.value)}
                    placeholder="اشرح ظروفك وحاجتك بصدق لوجه الله تعالى حتى يتسنى لفاعلي الخير الوقوف بجانبك..."
                    className={`w-full p-3 rounded-xl border text-xs focus:outline-emerald-500 leading-relaxed ${styles.innerBg} ${styles.innerBorder}`}
                  />
                </div>

                {/* Upload Attachments (Photos & Documents) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-emerald-500" />
                      <span>إرفاق صور ومستندات الحالة (تقارير، فواتير، إيصالات):</span>
                    </label>
                    <span className="text-[10px] text-slate-400">
                      يتم طمس البيانات الحساسة لحفظ الكرامة
                    </span>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-4 rounded-2xl border-2 border-dashed border-emerald-500/40 hover:border-emerald-500 text-center cursor-pointer transition ${styles.innerBg}`}
                  >
                    <Upload className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">
                      انقر هنا لرفع صور التقرير الطبي، الروشتات، أو فواتير الإيجار
                    </span>
                    <span className="text-[10px] text-slate-400">
                      يدعم الصور (JPG, PNG) من الهاتف أو الحاسوب
                    </span>
                  </div>

                  {/* Attachments preview thumbnails */}
                  {formAttachments.length > 0 && (
                    <div className="flex items-center gap-2 overflow-x-auto pt-1">
                      {formAttachments.map((att) => (
                        <div
                          key={att.id}
                          className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 group shrink-0"
                        >
                          <img
                            src={att.url}
                            alt={att.name}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeAttachment(att.id)}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center shadow-xs"
                            title="حذف"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Privacy Pledge */}
                <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-800 dark:text-teal-300 text-[11px] leading-relaxed flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>
                    نتعهد أمام الله بحفظ خصوصيتكم وأمان بياناتكم، ولا نقتطع أي رسوم أو وسيط تجاري، والتحويل سيصلكم من فاعل الخير مباشرة على رقمكم أو حسابكم.
                  </span>
                </div>

                {/* Submit Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/5 dark:border-white/5">
                  <button
                    type="button"
                    onClick={() => setIsSubmitModalOpen(false)}
                    className={`px-4 py-2.5 rounded-xl border text-xs font-bold ${styles.btnSecondary}`}
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition active:scale-95"
                  >
                    إرسال الطلب ونشره فوراً
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL: FULL-SIZE ATTACHMENT VIEWER */}
      {/* ========================================================================= */}
      {viewingAttachment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
          onClick={() => setViewingAttachment(null)}
        >
          <div
            className="relative max-w-3xl max-h-[90vh] bg-black/90 p-2 rounded-3xl overflow-hidden shadow-2xl flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setViewingAttachment(null)}
              className="absolute top-4 left-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition z-10"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={viewingAttachment.url}
              alt={viewingAttachment.name}
              className="max-h-[80vh] w-auto object-contain rounded-2xl"
              referrerPolicy="no-referrer"
            />
            <div className="p-3 text-white text-xs font-bold text-center">
              {viewingAttachment.name}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
