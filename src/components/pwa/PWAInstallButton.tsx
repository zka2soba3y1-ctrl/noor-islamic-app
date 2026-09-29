import React, { useState } from "react";
import { Download, Check, Share, Smartphone, Sparkles, X } from "lucide-react";
import { usePWAInstall } from "../../hooks/usePWAInstall";
import { soundEngine } from "../../utils/soundEngine";

interface Props {
  variant?: "nav" | "banner" | "button";
}

export const PWAInstallButton: React.FC<Props> = ({ variant = "nav" }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [hasDismissedBanner, setHasDismissedBanner] = useState(false);

  // If already installed in standalone mode, show subtle indicator or hide
  if (isInstalled) {
    if (variant === "nav") {
      return (
        <span
          id="pwa-installed-badge"
          className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-[#059669]/15 text-[#10B981] border border-[#059669]/30"
          title="التطبيق مثبت ويعمل بكامل صلاحيات PWA وأوفلاين"
        >
          <Check className="w-3 h-3 text-[#10B981]" />
          <span>مثبت PWA</span>
        </span>
      );
    }
    return null;
  }

  const handleInstallClick = async () => {
    soundEngine.playTasbihClick();
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }
    await install();
  };

  if (variant === "banner" && !hasDismissedBanner) {
    return (
      <aside
        aria-label="تثبيت تطبيق النور"
        className="glass-panel border border-[#D4AF37]/35 bg-gradient-to-r from-[#061A14]/95 via-[#0A2E23]/95 to-[#061A14]/95 rounded-2xl p-3 sm:p-4 relative overflow-hidden shadow-[0_4px_20px_rgba(212,175,55,0.15)] flex flex-col sm:flex-row items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3 text-right w-full sm:w-auto">
          <img
            src="https://i.ibb.co/pBdt7pHC/3.png"
            alt="شعار النور"
            className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl border border-[#D4AF37]/40 shadow-sm shrink-0 object-contain bg-[#061A14]"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/app-logo.png";
            }}
            referrerPolicy="no-referrer"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-bold text-white whitespace-nowrap">
                تثبيت تطبيق النور (PWA)
              </h4>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#F3E7C4] border border-[#D4AF37]/40 whitespace-nowrap">
                تثبيت فوري
              </span>
            </div>
            {/* Grid Metrics & Counters */}
            <div className="flex items-center gap-2 text-[10px] text-zinc-300 font-mono">
              <span className="text-emerald-400 font-bold">100% أوفلاين</span>
              <span className="text-zinc-600">•</span>
              <span>بدون متجر</span>
              <span className="text-zinc-600">•</span>
              <span className="text-amber-300">وصول فوري</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => setHasDismissedBanner(true)}
            className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-white/5 transition"
            title="إخفاء"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B68C1C] hover:brightness-110 text-black font-bold text-xs shadow-md transition active:scale-95 whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تثبيت الآن</span>
          </button>
        </div>
      </aside>
    );
  }

  return (
    <>
      <button
        id="btn-pwa-install-nav"
        onClick={handleInstallClick}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#D4AF37]/20 to-[#B68C1C]/15 hover:from-[#D4AF37]/30 hover:to-[#B68C1C]/25 text-[#F3E7C4] border border-[#D4AF37]/40 text-xs font-bold transition-all shadow-[0_0_12px_rgba(212,175,55,0.2)] active:scale-95"
        title="تثبيت تطبيق النور الإسلامي (PWA)"
      >
        <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
        <span className="hidden sm:inline">تثبيت التطبيق</span>
        <span className="sm:hidden">تثبيت</span>
      </button>

      {/* iOS Installation Instruction Modal */}
      {showIOSGuide && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="ios-install-title"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-[#121214] border border-[#D4AF37]/40 rounded-3xl max-w-md w-full p-6 text-right space-y-4 shadow-[0_0_40px_rgba(212,175,55,0.25)] relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 left-4 p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#061A14] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 id="ios-install-title" className="text-lg font-bold text-white">
                  تثبيت التطبيق على أجهزة آيفون وآيباد
                </h3>
                <p className="text-xs text-zinc-400">متصفح Safari</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-zinc-200 bg-white/5 p-4 rounded-2xl border border-white/10 leading-relaxed">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#D4AF37] text-black font-bold flex items-center justify-center shrink-0 text-[11px]">
                  1
                </span>
                <p>
                  اضغط على زر المشاركة <Share className="w-3.5 h-3.5 inline mx-1 text-[#D4AF37]" /> في شريط متصفح Safari بالأسفل أو الأعلى.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#D4AF37] text-black font-bold flex items-center justify-center shrink-0 text-[11px]">
                  2
                </span>
                <p>مرر للأسفل واختر <strong>"إضافة إلى الشاشة الرئيسية" (Add to Home Screen)</strong>.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#D4AF37] text-black font-bold flex items-center justify-center shrink-0 text-[11px]">
                  3
                </span>
                <p>اضغط على <strong>"إضافة" (Add)</strong> في أعلى الزاوية ليظهر رمز التطبيق الرسمي بجودة عالية على شاشتك.</p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs transition"
            >
              فهمت ذلك، إغلاق
            </button>
          </div>
        </div>
      )}
    </>
  );
};
