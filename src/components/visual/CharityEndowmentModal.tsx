import React, { useState } from "react";
import {
  Heart,
  Share2,
  Check,
  Sparkles,
  ShieldCheck,
  Copy,
  Users,
  Award,
  ExternalLink,
  X,
  Gift,
} from "lucide-react";
import { ThemeMode } from "../../types";
import { getThemeStyles } from "../../utils/themeClasses";
import { soundEngine } from "../../utils/soundEngine";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  theme?: ThemeMode;
}

export const CharityEndowmentModal: React.FC<Props> = ({
  isOpen,
  onClose,
  theme = "natural",
}) => {
  const styles = getThemeStyles(theme);
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedPledge, setSelectedPledge] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    soundEngine.playTasbihClick();
    const shareUrl = window.location.origin;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleShareWhatsApp = () => {
    soundEngine.playTasbihClick();
    const text = encodeURIComponent(
      "🕌 تطبيق ومحرك النور الإسلامي الشامل - وقف تقني لوجه الله تعالى:\n" +
        "قرآن كريم، أذكار، مواقيت صلاة، قبلة، بث مباشر للحرمين، خالي تماماً من الإعلانات والتتبع.\n" +
        window.location.origin
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  const handleShareTelegram = () => {
    soundEngine.playTasbihClick();
    const text = encodeURIComponent(
      "🕌 تطبيق ومحرك النور الإسلامي الشامل - وقف تقني لوجه الله تعالى:\n" +
        window.location.origin
    );
    window.open(`https://t.me/share/url?url=${window.location.origin}&text=${text}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-black/75 backdrop-blur-md animate-fadeIn">
      <div
        className={`relative w-full max-w-2xl rounded-3xl p-5 sm:p-8 border shadow-2xl space-y-6 my-auto max-h-[90vh] overflow-y-auto transition-all ${
          styles.cardBg
        } ${styles.cardBorder}`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 left-4 p-2 rounded-2xl border transition ${styles.btnSecondary}`}
          title="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header with Golden Badge */}
        <div className="text-center space-y-3 pt-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#B68C1C] dark:text-[#F3E7C4] text-xs font-bold font-mono">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <span>وقف تقني لوجه الله تعالى • 100% غير ربحي</span>
          </div>

          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-gradient-to-br from-[#D4AF37] via-emerald-600 to-teal-800 p-1 shadow-xl flex items-center justify-center">
            <div className="w-full h-full rounded-2xl bg-black/30 flex items-center justify-center">
              <Gift className="w-8 h-8 sm:w-10 sm:h-10 text-white animate-pulse" />
            </div>
          </div>

          <h2 className={`text-xl sm:text-2xl font-bold font-alexandria ${styles.titleText}`}>
            وقف النور واستمرارية التطبيق الخيري
          </h2>
          <p className={`text-xs sm:text-sm max-w-md mx-auto leading-relaxed ${styles.mutedText}`}>
            صُمم تطبيق النور ليكون صدقة جارية ووقفاً تقنياً إسلامياً خالصاً لوجه الله، مجانياً للأبد، وبلا أي إعلانات أو اشتراكات أو جمع لبيانات المستخدمين.
          </p>
        </div>

        {/* Core Principles Cards (3 Highlights) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className={`p-4 rounded-2xl border text-center space-y-1.5 ${styles.innerBg} ${styles.innerBorder}`}>
            <div className="w-8 h-8 rounded-xl mx-auto flex items-center justify-center bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className={`font-bold text-xs ${styles.titleText}`}>صفرية الإعلانات</h4>
            <p className={`text-[11px] leading-normal ${styles.mutedText}`}>
              لا توجد إعلانات تجارية تقطع خشوع العبادة أو تستغل المستخدم.
            </p>
          </div>

          <div className={`p-4 rounded-2xl border text-center space-y-1.5 ${styles.innerBg} ${styles.innerBorder}`}>
            <div className="w-8 h-8 rounded-xl mx-auto flex items-center justify-center bg-[#D4AF37]/20 text-[#D4AF37]">
              <Heart className="w-4 h-4" />
            </div>
            <h4 className={`font-bold text-xs ${styles.titleText}`}>وقف لوجه الله</h4>
            <p className={`text-[11px] leading-normal ${styles.mutedText}`}>
              المشروع موقوف صدقة جارية لخدمة المسلمين والمكفوفين وضعاف البصر.
            </p>
          </div>

          <div className={`p-4 rounded-2xl border text-center space-y-1.5 ${styles.innerBg} ${styles.innerBorder}`}>
            <div className="w-8 h-8 rounded-xl mx-auto flex items-center justify-center bg-sky-500/20 text-sky-500">
              <Users className="w-4 h-4" />
            </div>
            <h4 className={`font-bold text-xs ${styles.titleText}`}>خصوصية تامة</h4>
            <p className={`text-[11px] leading-normal ${styles.mutedText}`}>
              بياناتك وصلواتك وسجلاتك محفوظة على جهازك فقط دون تتبع.
            </p>
          </div>
        </div>

        {/* Ways to Support & Contribute */}
        <div className="space-y-3.5">
          <h3 className={`text-sm font-bold flex items-center gap-2 ${styles.titleText}`}>
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span>كيف تساهم في استمرارية ودعم الوقف؟</span>
          </h3>

          {/* 1. Spiritual Support - Supplication */}
          <div className={`p-4 rounded-2xl border space-y-2 ${styles.innerBg} ${styles.innerBorder}`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold flex items-center gap-1.5 ${styles.titleText}`}>
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">1</span>
                الدعم المعنوي بالدعاء المبارك
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold">
                أعظم المساهمات
              </span>
            </div>
            <p className={`text-xs leading-relaxed ${styles.bodyText}`}>
              دعوة صالحة بظهر الغيب لكل من ساهم في بناء ونشر هذا المشروع الإسلامي، ولوالديهم بالرحمة والمغفرة وحسن الخاتمة.
            </p>
          </div>

          {/* 2. Spread the Word (الدال على الخير كفاعله) */}
          <div className={`p-4 rounded-2xl border space-y-3 ${styles.innerBg} ${styles.innerBorder}`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold flex items-center gap-1.5 ${styles.titleText}`}>
                <span className="w-6 h-6 rounded-full bg-[#D4AF37] text-black flex items-center justify-center text-[10px] font-bold">2</span>
                نشر التطبيق («الدال على الخير كفاعله»)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#B68C1C] dark:text-[#F3E7C4] font-bold">
                أجر جاري
              </span>
            </div>
            <p className={`text-xs leading-relaxed ${styles.mutedText}`}>
              شارك التطبيق مع عائلتك وأصدقائك ومجموعات الواتساب، فلك مثل أجور صلاتهم وقراءتهم للقرآن إن شاء الله.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition active:scale-95 shadow-sm"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? "تم نسخ الرابط بنجاح!" : "نسخ رابط التطبيق"}</span>
              </button>

              <button
                onClick={handleShareWhatsApp}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs transition active:scale-95 shadow-sm"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>واتساب</span>
              </button>

              <button
                onClick={handleShareTelegram}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0088cc] hover:bg-[#0077b5] text-white font-bold text-xs transition active:scale-95 shadow-sm"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>تيليجرام</span>
              </button>
            </div>
          </div>

          {/* 3. Operational Costs & Hosting Endowment */}
          <div className={`p-4 rounded-2xl border space-y-2.5 ${styles.innerBg} ${styles.innerBorder}`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold flex items-center gap-1.5 ${styles.titleText}`}>
                <span className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-bold">3</span>
                كفالة البنية التحتية والسيرفرات
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-600 dark:text-teal-400 font-bold">
                استمرارية تقنية
              </span>
            </div>
            <p className={`text-xs leading-relaxed ${styles.mutedText}`}>
              تُستخدم التبرعات الاختيارية حصراً في سداد تكاليف استضافة السيرفرات السحابية، شبكات توزيع المحتوى (CDN)، ونطاق التطبيق لضمان بقائه متاحاً للجميع بالمجان طوال 24 ساعة دون توقف.
            </p>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-medium leading-relaxed">
              قال رسول الله ﷺ: «إِذَا مَاتَ الإنْسَانُ انْقَطَعَ عَنْهُ عَمَلُهُ إِلَّا مِنْ ثَلَاثَةٍ: إِلَّا مِنْ صَدَقَةٍ جَارِيَةٍ، أَوْ عِلْمٍ يُنْتَفَعُ بِهِ، أَوْ وَلَدٍ صَالِحٍ يَدْعُو لَهُ» (رواه مسلم).
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
          <span className={`text-[11px] font-mono ${styles.mutedText}`}>
            مشروع النور • وقف إسلامي رقمي حر
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition active:scale-95 shadow-md"
          >
            تقبل الله طاعاتكم
          </button>
        </div>
      </div>
    </div>
  );
};
