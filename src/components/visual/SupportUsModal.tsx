import React, { useState } from "react";
import {
  Heart,
  Share2,
  Check,
  Sparkles,
  Copy,
  Gift,
  X,
  Send,
  Coffee,
  Shield,
  Layers,
  Globe,
  ExternalLink,
} from "lucide-react";
import { ThemeMode } from "../../types";
import { getThemeStyles } from "../../utils/themeClasses";
import { soundEngine } from "../../utils/soundEngine";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  theme?: ThemeMode;
}

export const SupportUsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  theme = "natural",
}) => {
  const styles = getThemeStyles(theme);
  const [copiedLink, setCopiedLink] = useState(false);
  const [duaCount, setDuaCount] = useState<number>(() => {
    const saved = localStorage.getItem("noor_user_duas_count");
    return saved ? parseInt(saved, 10) : 42;
  });
  const [hasPrayed, setHasPrayed] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    soundEngine.playTasbihClick();
    const shareUrl = window.location.origin;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleDuaClick = () => {
    soundEngine.playTasbihClick();
    const next = duaCount + 1;
    setDuaCount(next);
    setHasPrayed(true);
    localStorage.setItem("noor_user_duas_count", next.toString());
  };

  const handleShareWhatsApp = () => {
    soundEngine.playTasbihClick();
    const text = encodeURIComponent(
      "🕌 مشروع النور الإسلامي العالمي - تطبيق وموسوعة إسلامية شاملة خالية من الإعلانات:\n" +
        "مصحف المدينة 604 صفحة، أذكار، مواقيت صلاة فلكية، إذاعة القاهرة، وتكافل خيري مباشر لوجه الله تعالى.\n" +
        window.location.origin
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-black/75 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-2xl rounded-3xl p-5 sm:p-7 border shadow-2xl space-y-5 my-auto max-h-[92vh] overflow-y-auto transition-all ${
          styles.cardBg
        } ${styles.cardBorder}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 left-4 p-2 rounded-2xl border transition ${styles.btnSecondary}`}
          title="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header Badge */}
        <div className="text-center space-y-2.5 pt-1">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#B68C1C] dark:text-[#F3E7C4] text-xs font-bold font-mono">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>عمل خالص لوجه الله الكريم • وقف إسلامي دائم</span>
          </div>

          <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-br from-[#D4AF37] via-emerald-600 to-teal-800 p-1 shadow-xl flex items-center justify-center">
            <div className="w-full h-full rounded-2xl bg-black/30 flex items-center justify-center text-white">
              <Heart className="w-8 h-8 fill-rose-500/30 text-white animate-pulse" />
            </div>
          </div>

          <h2 className={`text-xl sm:text-2xl font-black font-alexandria ${styles.titleText}`}>
            ادعمنا لنستمر بإذن الله تعالى
          </h2>

          <p className={`text-xs sm:text-sm max-w-lg mx-auto leading-relaxed ${styles.mutedText}`}>
            نؤكد بيقين تام أن <strong className="text-emerald-600 dark:text-emerald-400">كامل هذا العمل خالص لوجه الله تعالى</strong>، وهو صدقة جارية على روح أمواتنا وأموات المسلمين أجمعين، ومتاح بالمجان للأبد دون أي ربح مادي أو اشتراكات.
          </p>
        </div>

        {/* Support Purpose & Nature */}
        <div className={`p-4 rounded-2xl border space-y-2 text-xs leading-relaxed ${styles.innerBg} ${styles.innerBorder}`}>
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold">
            <Shield className="w-4 h-4" />
            <span>ما هو الهدف من الدعم؟</span>
          </div>
          <p className={styles.bodyText}>
            الدعم هنا هو <strong>للتشجيع الشخصي والعون في الاستمرار</strong>، وسداد تكاليف السيرفرات السحابية، واستضافة قواعد البيانات، وتطوير خصائص ذكاء اصطناعي وأدوات تفاعلية حديثة، ليظل التطبيق صرحاً إسلامياً عالمياً يخدم ملايين المسلمين حول العالم بكفاءة وأمان وسرعة فائقة.
          </p>
        </div>

        {/* 4 Pillars of Support */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* 1. Prayer & Du'aa */}
          <div className={`p-4 rounded-2xl border space-y-2 flex flex-col justify-between ${styles.innerBg} ${styles.innerBorder}`}>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center text-[11px]">1</span>
                  الدعاء المبارك بظهر الغيب
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {duaCount} دعوة
                </span>
              </div>
              <p className={`text-xs ${styles.mutedText}`}>
                دعوة بالقبول، التوفيق، السداد، ومغفرة الذنوب لمن ساهم في بناء وبرمجة هذا العمل ولوالديهم.
              </p>
            </div>
            <button
              onClick={handleDuaClick}
              className={`w-full mt-2 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                hasPrayed
                  ? "bg-emerald-600 text-white"
                  : "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300"
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${hasPrayed ? "fill-white" : ""}`} />
              <span>{hasPrayed ? "جزاك الله خيراً وتقبل دعاءك!" : "أرسل دعوة صالحة (دعوت لكم)"}</span>
            </button>
          </div>

          {/* 2. Spread the App */}
          <div className={`p-4 rounded-2xl border space-y-2 flex flex-col justify-between ${styles.innerBg} ${styles.innerBorder}`}>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center text-[11px]">2</span>
                  نشر الخير («الدال على الخير كفاعله»)
                </span>
              </div>
              <p className={`text-xs ${styles.mutedText}`}>
                انشر التطبيق بين أهلك وأصدقائك وفي المجموعات؛ فلك أجر كل آية تُقرأ وذكرٍ يُرفع.
              </p>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <button
                onClick={handleCopyLink}
                className="flex-1 py-2 rounded-xl text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 transition flex items-center justify-center gap-1"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? "تم النسخ!" : "نسخ الرابط"}</span>
              </button>
              <button
                onClick={handleShareWhatsApp}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#128C7E] dark:text-[#25D366] transition flex items-center justify-center"
                title="مشاركة عبر واتساب"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 3. Server & Infrastructure Support & Mobile Wallets */}
          <div className={`p-4 rounded-2xl border space-y-3 sm:col-span-2 ${styles.innerBg} ${styles.innerBorder}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-600 flex items-center justify-center text-[11px]">3</span>
                التشجيع المادي والمساهمة في استدامة السيرفرات السحابية
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold">
                محافظ إلكترونية مباشرة
              </span>
            </div>
            
            <p className={`text-xs ${styles.mutedText} leading-relaxed`}>
              للتشجيع الشخصي والعون في سداد تكاليف السيرفرات السحابية، واستضافة قواعد البيانات، وضمان سرعة واستقرار هذا الصرح الإسلامي الوقفي لوجه الله تعالى دون توقف، تم تخصيص رقمين مباشرين لاستقبال الدعم عبر المحافظ الإلكترونية وإنستاباي:
            </p>

            {/* The Two Electronic Wallet Numbers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {/* Wallet 1 */}
              <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400">محفظة كاش / إنستاباي (1):</div>
                  <div className="font-mono text-sm font-black text-emerald-600 dark:text-emerald-400 tracking-wider">
                    01068864770
                  </div>
                  <div className="text-[9px] text-slate-500">فودافون كاش • إنستاباي InstaPay</div>
                </div>
                <button
                  onClick={() => {
                    soundEngine.playTasbihClick();
                    navigator.clipboard.writeText("01068864770");
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition flex items-center gap-1 active:scale-95"
                  title="نسخ الرقم"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ</span>
                </button>
              </div>

              {/* Wallet 2 */}
              <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-[#D4AF37]/30 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400">محفظة كاش / إنستاباي (2):</div>
                  <div className="font-mono text-sm font-black text-[#D4AF37] tracking-wider">
                    01155998822
                  </div>
                  <div className="text-[9px] text-slate-500">اتصالات / أورانج / وي كاش • إنستاباي</div>
                </div>
                <button
                  onClick={() => {
                    soundEngine.playTasbihClick();
                    navigator.clipboard.writeText("01155998822");
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-[#B68C1C] dark:text-[#F3E7C4] text-xs font-bold transition flex items-center gap-1 active:scale-95"
                  title="نسخ الرقم"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ</span>
                </button>
              </div>
            </div>

            <div className="text-[11px] font-mono text-slate-400 dark:text-slate-300 pt-1">
              البريد الإلكتروني المعتمد للمراسلة والتعاون التقني: <strong className="text-emerald-500">gbcmasr@gmail.com</strong>
            </div>
          </div>

          {/* 4. Feedback & Feature Suggestions */}
          <div className={`p-4 rounded-2xl border space-y-2 sm:col-span-2 ${styles.innerBg} ${styles.innerBorder}`}>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-600 flex items-center justify-center text-[11px]">4</span>
              المقترحات والأفكار التطويرية
            </span>
            <p className={`text-xs ${styles.mutedText}`}>
              رأيكم ومقترحاتكم القيّمة لتوسيع المنظومة وخدمة القرآن العظيم وعلوم الشريعة السمحة محل عناية واهتمام دائم من فريق العمل.
            </p>
            <a
              href="mailto:gbcmasr@gmail.com?subject=اقتراح لتطبيق النور الإسلامي"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline pt-1"
            >
              <span>إرسال فكرة أو تقرير خطأ</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Noble Dedication Quote */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-[#D4AF37]/10 to-teal-500/10 border border-[#D4AF37]/30 text-center space-y-1">
          <p className="text-xs sm:text-sm font-['Amiri',serif] font-bold text-emerald-800 dark:text-emerald-300">
            «والعمل أيضا نطلب به الأجر والثواب والتوفيق والسداد، ونسأل الله القبول في القول والعمل، وهو صدقة جارية على روح أمواتنا وأموات المسلمين أجمعين»
          </p>
          <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono block">
            All Rights Reserved To All Muslims . Made With Love By Genius
          </span>
        </div>

        {/* Bottom Actions */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
          <span className={`text-[11px] font-mono ${styles.mutedText}`}>
            مشروع النور • وقف إسلامي رقمي حر
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition active:scale-95 shadow-md"
          >
            تقبل الله منا ومنكم
          </button>
        </div>
      </div>
    </div>
  );
};
