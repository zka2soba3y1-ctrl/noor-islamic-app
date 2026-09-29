import React, { useState } from "react";
import {
  ArrowRight,
  Share2,
  Check,
  Home,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { ThemeMode } from "../../types";
import { getThemeStyles } from "../../utils/themeClasses";
import { soundEngine } from "../../utils/soundEngine";
import { speechEngine } from "../../utils/speechEngine";

interface SubpageHeroProps {
  theme?: ThemeMode;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  badge?: string;
  soul?: string;
  onBackToHome: () => void;
  categoryName?: string;
  extraActions?: React.ReactNode;
}

export const SubpageHero: React.FC<SubpageHeroProps> = ({
  theme = "natural",
  title,
  subtitle,
  icon,
  badge = "صفحة مستقلة",
  soul = "نور الإسلام",
  onBackToHome,
  categoryName,
  extraActions,
}) => {
  const styles = getThemeStyles(theme);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    soundEngine.playTasbihClick();
    const shareData = {
      title: `${title} - مشروع النور الإسلامي`,
      text: `${title}: ${subtitle}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // user cancelled or share failed
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        speechEngine.speakNavFeedback("تم نسخ رابط الصفحة للمشاركة");
        setTimeout(() => setCopied(false), 2500);
      } catch (err) {
        console.warn("Failed to copy link:", err);
      }
    }
  };

  const handleBack = () => {
    soundEngine.playTasbihClick();
    speechEngine.speakNavFeedback("العودة إلى الصفحة الرئيسية");
    onBackToHome();
  };

  return (
    <div
      id="subpage-hero"
      className={`relative overflow-hidden rounded-2xl sm:rounded-3xl border transition-all ${styles.cardBg} ${styles.cardBorder} ${styles.cardShadow} p-4 sm:p-6 mb-4 sm:mb-6`}
    >
      {/* Decorative Aura */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      {/* Top Bar: Breadcrumb & Actions */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 mb-4 sm:mb-5 pb-3 border-b border-slate-200/50 dark:border-slate-800/60">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-medium">
          <button
            onClick={handleBack}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl transition ${styles.innerBg} ${styles.mutedText} hover:${styles.bodyText} border ${styles.innerBorder}`}
            title="الرجوع للرئيسية"
          >
            <Home className="w-3.5 h-3.5" />
            <span>الرئيسية</span>
          </button>
          <span className={styles.mutedText}>/</span>
          {categoryName && (
            <>
              <span className={styles.mutedText}>{categoryName}</span>
              <span className={styles.mutedText}>/</span>
            </>
          )}
          <span className={`font-bold ${styles.accentText} truncate max-w-[150px] sm:max-w-xs`}>
            {title}
          </span>
        </div>

        {/* Action Buttons: Back + Share */}
        <div className="flex items-center gap-2">
          {extraActions}
          <button
            id="subpage-share-btn"
            onClick={handleShare}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border active:scale-95 ${
              copied
                ? "bg-emerald-600 text-white border-emerald-500"
                : `${styles.innerBg} ${styles.cardBorder} ${styles.bodyText} hover:${styles.accentText}`
            }`}
            title="مشاركة الصفحة"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>تم النسخ</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">مشاركة</span>
              </>
            )}
          </button>

          <button
            id="subpage-back-btn"
            onClick={handleBack}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition border active:scale-95 ${styles.btnPrimary}`}
            title="الرجوع للقائمة الرئيسية"
          >
            <ArrowRight className="w-4 h-4" />
            <span>الرئيسية</span>
          </button>
        </div>
      </div>

      {/* Main Hero Details */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3 sm:gap-4">
          <div
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 border shadow-sm ${styles.badgeBg} ${styles.badgeBorder} ${styles.accentText}`}
          >
            {icon}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${styles.badgeBg} ${styles.badgeBorder} ${styles.accentText}`}
              >
                {soul}
              </span>
              <span
                className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
              >
                {badge}
              </span>
            </div>

            <h1 className={`text-base sm:text-xl font-medium font-alexandria tracking-tight ${styles.titleText}`}>
              {title}
            </h1>

            <p className={`text-xs sm:text-sm max-w-2xl leading-relaxed ${styles.mutedText}`}>
              {subtitle}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
