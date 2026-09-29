import React, { useState } from "react";
import {
  Download,
  Smartphone,
  Share,
  Sparkles,
  X,
  CheckCircle2,
  WifiOff,
  Bell,
  ShieldCheck,
} from "lucide-react";
import { usePWAInstall } from "../../hooks/usePWAInstall";
import { soundEngine } from "../../utils/soundEngine";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // If already installed, never show this modal
  const hasInstalledLocal =
    typeof window !== "undefined" &&
    (localStorage.getItem("noor_pwa_installed") === "true" || isInstalled);

  if (!isOpen || hasInstalledLocal) {
    return null;
  }

  const handleInstallClick = async () => {
    soundEngine.playTasbihClick();
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }
    setIsInstalling(true);
    try {
      const success = await install();
      if (success) {
        localStorage.setItem("noor_pwa_installed", "true");
        onClose();
      }
    } catch {
      // Fallback
    } finally {
      setIsInstalling(false);
    }
  };

  const handleSkip = () => {
    soundEngine.playTasbihClick();
    // Remember dismissal for this session
    localStorage.setItem("noor_pwa_dismissed_session", "true");
    onClose();
  };

  const handleAlreadyInstalled = () => {
    soundEngine.playTasbihClick();
    localStorage.setItem("noor_pwa_installed", "true");
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pwa-install-title"
      className="fixed inset-0 z-[220] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-300 select-none"
      dir="rtl"
    >
      {/* Central Modal Container */}
      <div className="w-full max-w-md rounded-3xl bg-gradient-to-b from-[#0B2119] via-[#071912] to-[#040D09] border-2 border-[#D4AF37]/50 shadow-[0_0_60px_rgba(16,185,129,0.35)] overflow-hidden relative z-10 flex flex-col p-5 sm:p-6 text-center text-white">
        
        {/* Close / Dismiss Button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 left-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          title="إغلاق ومتابعة في المتصفح"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Ambient Glow */}
        <div className="absolute top-0 right-1/2 translate-x-1/2 w-48 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* App Logo with Radiant Green Ring */}
        <div className="relative inline-flex items-center justify-center mx-auto my-2">
          <div className="w-24 h-24 rounded-full bg-emerald-500/20 blur-xl absolute" />
          <div className="w-20 h-20 rounded-full border border-[#D4AF37]/40 animate-spin [animation-duration:30s] absolute" />
          <div className="w-18 h-18 rounded-2xl bg-[#061A14] border-2 border-[#D4AF37] p-2 flex items-center justify-center shadow-[0_0_25px_rgba(212,175,55,0.4)] relative z-10">
            <img
              src="https://i.ibb.co/pBdt7pHC/3.png"
              alt="شعار تطبيق النور"
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/app-logo.png";
              }}
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Title & Short Spiritual Subtitle */}
        <div className="space-y-1 mt-1 mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#F3E7C4] text-[10px] font-bold">
            <Sparkles className="w-3 h-3 text-[#D4AF37]" />
            <span>تطبيق ويب تقدمي معتمد (PWA)</span>
          </div>
          <h2
            id="pwa-install-title"
            className="text-lg sm:text-xl font-black font-alexandria text-white"
          >
            تثبيت تطبيق النور الإسلامي
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
            احصل على تجربة عبادية خاشعة ومستقلة على هاتفك أو حاسوبك بضغطة زر واحدة.
          </p>
        </div>

        {/* 4 Core Features Grid */}
        <div className="grid grid-cols-2 gap-2 text-right mb-5">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Download className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-white leading-tight">تثبيت فوري</div>
              <div className="text-[9px] text-slate-400">بدون متجر تطبيقات</div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <WifiOff className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-white leading-tight">100% أوفلاين</div>
              <div className="text-[9px] text-slate-400">المصحف والأذكار</div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center shrink-0">
              <Bell className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-white leading-tight">تنبيهات الصلاة</div>
              <div className="text-[9px] text-slate-400">أذان ومواقيت دقيقة</div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-white leading-tight">وقف لوجه الله</div>
              <div className="text-[9px] text-slate-400">خالٍ من الإعلانات</div>
            </div>
          </div>
        </div>

        {/* iOS Step Guide if detected */}
        {showIOSGuide && isIOS && (
          <div className="mb-4 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-right space-y-2 text-xs">
            <div className="font-bold text-amber-300 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4" />
              <span>خطوات التثبيت على الآيفون والآيباد (Safari):</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-200 text-[11px]">
              <li>اضغط على زر المشاركة <Share className="w-3 h-3 inline mx-1 text-amber-300" /> في متصفح Safari.</li>
              <li>مرر للأسفل واختر <strong>"إضافة إلى الشاشة الرئيسية" (Add to Home Screen)</strong>.</li>
              <li>اضغط على <strong>"إضافة" (Add)</strong> أعلى الزاوية ليثبت التطبيق فوراً.</li>
            </ol>
          </div>
        )}

        {/* Primary Action Button: تثبيت التطبيق الآن */}
        <div className="space-y-2">
          <button
            id="btn-pwa-install-modal-confirm"
            onClick={handleInstallClick}
            disabled={isInstalling}
            className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#F3DE8A] to-[#D4AF37] hover:brightness-110 text-slate-950 font-black text-xs sm:text-sm shadow-[0_0_25px_rgba(212,175,55,0.45)] transition-all active:scale-95 flex items-center justify-center gap-2 border border-amber-200 cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-950" />
            <span>{isInstalling ? "جارٍ بدء التثبيت..." : "تثبيت التطبيق الآن على جهازك"}</span>
          </button>

          {/* Secondary Actions: لاحقاً / تم التثبيت مسبقاً */}
          <div className="flex items-center justify-between text-xs pt-1">
            <button
              onClick={handleSkip}
              className="text-slate-400 hover:text-slate-200 text-[11px] font-medium transition cursor-pointer px-2 py-1"
            >
              متابعة في المتصفح (لاحقاً)
            </button>

            <button
              onClick={handleAlreadyInstalled}
              className="text-emerald-400 hover:text-emerald-300 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer px-2 py-1"
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>قمت بالتثبيت مسبقاً</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
