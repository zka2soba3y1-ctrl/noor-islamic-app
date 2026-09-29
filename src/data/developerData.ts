/**
 * Developer profile data — Ahmed Bin Ali El-Genius / Genius Business Club
 * Source: GENIUS-LAUNCH-RAG (know.js meta/voice/closing + index.html header/footer)
 * Facts only — no invented numbers. Shown in DeveloperProfileModal.
 */

export interface DeveloperStat {
  value: string;
  label: string;
  detail: string;
}

export interface DeveloperPlatform {
  id: string;
  name: string;
  status: "live" | "dev";
}

export const DEVELOPER = {
  name: "أحمد بن علي الجينيس",
  nameEn: "Ahmed Bin Ali El-Genius",
  title: "مؤسس نادي الجينيس — Genius Business Club",
  age: "40 سنة بفضل الله",
  experience: "21 سنة خبرة في السوق",
  phones: ["01274608158", "01130680225"],
  whatsappInternational: "201130680225",
  email: "ceo@gbc4.com",
  website: "www.gbc4.com",
  websiteUrl: "https://www.gbc4.com",
  membershipWord: "جينيسني",
  voice:
    "السلام عليكم ورحمة الله وبركاته يا غالي ♥ أخوك أحمد بن علي الجينيس، 40 سنة بفضل الله — منهم 21 سنة في السوق ده، اتعلمنا فيهم إن الشغل النضيف هو اللي بيتكلم عن صاحبه. نادي الجينيس مش شركة ولا براند للتباهي، دي منظومة إخوات بتحب الخير: أكتر من 85 موظف ذكاء صناعي شغالين ليل نهار، و15 مشروع حقيقي مبنيين بإيدينا وشغالين لايف على سيرفراتنا الخاصة المؤمنة.",
  closing:
    "«وتعاونوا على البر والتقوى» — إيدينا ممدودة لكل إخواتنا: تعالوا نتعاون، تواصلوا معانا، ادعمونا بدعوة حلوة أو بكلمة طيبة أو بأي دعم مادي أو معنوي تقدروا عليه عشان نكمل المشوار، ولو عندكم أي مشروع إسلامي جارٍ ومحتاج إيد تقنية — إحنا تحت أمركم ونشارك مجانًا لوجه الله. نسأل الله الإخلاص والقبول 🤲",
  mission:
    "رسالتنا باختصار يا سيدي: أي مشروع إسلامي أو خيري محتاج دعم تقني — برمجة، أتمتة، منصات، متاجر، بوتات، تطبيقات — إحنا جاهزين نشارك فيه مجانًا خالصًا لوجه الله، لا بنطلب مقابل ولا بنشترط حاجة. اللي عنده فكرة تنفع المسلمين يكلمنا، واللي عايز يتعاون معانا أهلاً وسهلاً بيه في أي وقت.",
};

export const DEVELOPER_STATS: DeveloperStat[] = [
  { value: "21", label: "سنة خبرة", detail: "في السوق — تسليم فوري وفهم عميق لاحتياجات الكبار وتوجيه الشباب." },
  { value: "15", label: "منصة ومشروع", detail: "تحت هوية واحدة — مبنية بأيدينا وشغالة لايف على السيرفر." },
  { value: "+85", label: "موظف رقمي AI", detail: "يعملون على مدار الساعة في التشغيل والمتابعة والأتمتة." },
  { value: "91", label: "Endpoint حي", detail: "في منصة دينامو الدهب وحدها — بنية API حقيقية." },
  { value: "+100", label: "مهارة تسويقية", detail: "للمنصات الإعلانية وإدارة الحملات والمحتوى." },
  { value: "14", label: "نفق Cloudflare", detail: "بنية سيرفرات سيلف-هوستد مؤمنة ومشفرة." },
];

export const DEVELOPER_PLATFORMS: DeveloperPlatform[] = [
  { id: "noor", name: "نور للكفيف", status: "live" },
  { id: "dynamo", name: "دينامو برو ماكس — الأورجانيك", status: "live" },
  { id: "studio", name: "دينامو ستوديو برو", status: "live" },
  { id: "stores", name: "سبوت ان اونلاين ستورز", status: "live" },
  { id: "spotin", name: "سبوت إن — الشروق ومدينتي", status: "live" },
  { id: "xroom", name: "إكس روم X Room", status: "live" },
  { id: "geniuspos", name: "جينيس POS برو", status: "live" },
  { id: "gbccos", name: "GBC Cosmetics ERP", status: "live" },
  { id: "dahab", name: "دينامو الدهب", status: "live" },
  { id: "ghazl", name: "غزل هوم ستور", status: "live" },
  { id: "qrmenu", name: "سبوت إن المنيو الرقمي (QR)", status: "live" },
  { id: "craftbot", name: "كرافت بوت العالمي", status: "live" },
  { id: "clubapp", name: "تطبيق نادي الجينيس الرسمي", status: "live" },
  { id: "lines", name: "خطوط الإنتاج الخفية", status: "live" },
  { id: "club", name: "خدمات النادي الكاملة GBC", status: "live" },
];

export type ContactTopic = "contact" | "support" | "collab";

export const CONTACT_TOPICS: Array<{ id: ContactTopic; label: string; hint: string }> = [
  { id: "contact", label: "تواصل عام", hint: "سؤال أو استفسار أو سلام" },
  { id: "support", label: "دعم فني", hint: "مشكلة في التطبيق أو اقتراح تحسين" },
  { id: "collab", label: "تعاون / شراكة", hint: "مشروع مشترك أو خدمة من خدمات النادي" },
];

export function buildWhatsAppLink(topic: ContactTopic, name: string, message: string): string {
  const topicLabel = CONTACT_TOPICS.find((t) => t.id === topic)?.label || "تواصل";
  const text = `السلام عليكم يا هندسة 🌟%0Aالموضوع: ${encodeURIComponent(topicLabel)}%0Aالاسم: ${encodeURIComponent(
    name || "زائر تطبيق النور"
  )}%0A%0A${encodeURIComponent(message)}`;
  return `https://wa.me/${DEVELOPER.whatsappInternational}?text=${text}`;
}
