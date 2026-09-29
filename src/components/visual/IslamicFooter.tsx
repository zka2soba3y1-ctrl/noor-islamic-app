import React from "react";
import {
  Heart,
  Sparkles,
  BookOpen,
  Clock,
  Compass,
  Radio,
  HandHeart,
  Coins,
  Calendar,
  ShieldCheck,
  Share2,
  Tv,
  Moon,
  Volume2,
} from "lucide-react";
import { ThemeMode } from "../../types";
import { getThemeStyles } from "../../utils/themeClasses";
import { soundEngine } from "../../utils/soundEngine";

interface Props {
  theme?: ThemeMode;
  onNavigateTab: (tabId: string) => void;
  onOpenSupportModal: () => void;
  onOpenSourcesModal: () => void;
  onOpenWelcomeModal: () => void;
}

export const IslamicFooter: React.FC<Props> = ({
  theme = "natural",
  onNavigateTab,
  onOpenSupportModal,
  onOpenSourcesModal,
  onOpenWelcomeModal,
}) => {
  const styles = getThemeStyles(theme);

  const isDark = theme === "night" || theme === "natural";
  const isPaper = theme === "paper";

  return (
    <footer
      id="islamic-global-footer"
      className={`mt-12 rounded-3xl border shadow-xl transition-all overflow-hidden relative ${
        theme === "natural"
          ? "bg-[#071F17]/95 border-emerald-500/30 text-[#E6F4EA]"
          : isPaper
          ? "bg-[#FDF9F0]/95 border-[#D6C5A9] text-[#2F1E12]"
          : theme === "night"
          ? "bg-[#06090F]/95 border-slate-800 text-[#F1F5F9]"
          : "bg-white/95 border-emerald-500/20 text-[#0F172A]"
      }`}
    >
      {/* Top Golden Accent Shimmer */}
      <div className="h-1 w-full bg-gradient-to-r from-emerald-600 via-[#D4AF37] to-teal-700" />

      {/* ========================================================================= */}
      {/* 1. NOBLE SPIRITUAL DEDICATION & ONGOING CHARITY BANNER */}
      {/* ========================================================================= */}
      <div className="px-5 sm:px-8 py-6 border-b border-black/5 dark:border-white/5 bg-gradient-to-b from-black/5 to-transparent text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/35 text-[#B68C1C] dark:text-[#F3E7C4] text-xs font-bold font-mono">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>صدقة جارية ووقف إسلامي لوجه الله تعالى</span>
        </div>

        <p className="text-sm sm:text-base md:text-lg font-['Amiri',serif] font-bold leading-relaxed max-w-3xl mx-auto text-emerald-900 dark:text-emerald-300">
          «اللَّهُمَّ إِنَّا نَسْأَلُكَ التَّوْفِيقَ وَالسَّدَادَ، وَنَسْأَلُكَ الْقَبُولَ فِي الْقَوْلِ وَالْعَمَلِ، وَهَذَا الْعَمَلُ صَدَقَةٌ جَارِيَةٌ عَلَى رُوحِ أَمْوَاتِنَا وَأَمْوَاتِ الْمُسْلِمِينَ أَجْمَعِينَ.. نَسْأَلُكُمُ الدُّعَاءَ لَهُمْ بِالرَّحْمَةِ وَالْمَغْفِرَةِ»
        </p>

        <p className={`text-xs max-w-xl mx-auto ${styles.mutedText}`}>
          مشروع تقني إسلامي حر مهدى للأمة الإسلامية كافة، غير ربحي ومتاح بدون أي إعلانات أو رسوم للأبد.
        </p>
      </div>

      {/* ========================================================================= */}
      {/* 2. 4 COLUMNS: SECTIONS & NAVIGATION */}
      {/* ========================================================================= */}
      <div className="px-5 sm:px-8 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        
        {/* Col 1: Project Identity */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <h3 className={`text-base font-bold font-alexandria ${styles.titleText}`}>
              مشروع النور الإسلامي
            </h3>
          </div>

          <p className={`text-xs leading-relaxed ${styles.mutedText}`}>
            بوابة إسلامية شاملة وموثوقة تجمع بين عراقة المصادر الشرعية ودقة التقنية الحديثة. مصحف المدينة 604 صفحة، أذكار حصن المسلم، مواقيت الصلاة الفلكية، إذاعة القاهرة، وتكافل الحالات الإنسانية المباشر.
          </p>

          <div className="pt-1 flex items-center gap-2">
            <button
              onClick={() => {
                soundEngine.playTasbihClick();
                onOpenSupportModal();
              }}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs transition active:scale-95 shadow-xs flex items-center gap-1.5"
            >
              <Heart className="w-3.5 h-3.5 fill-white" />
              <span>ادعمنا لنستمر</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playTasbihClick();
                onOpenSourcesModal();
              }}
              className={`p-2 rounded-xl border transition ${styles.btnSecondary}`}
              title="المصادر والتراخيص المعتمدة"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </button>
          </div>
        </div>

        {/* Col 2: Quran & Worship */}
        <div className="space-y-3">
          <h4 className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 font-alexandria flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span>المصحف والعبادات</span>
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button
                onClick={() => {
                  soundEngine.playTasbihClick();
                  onNavigateTab("quran");
                }}
                className={`hover:text-emerald-500 transition flex items-center gap-1.5 ${styles.mutedText}`}
              >
                <span>•</span>
                <span>المصحف الشريف (604 صفحة مصورة)</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  soundEngine.playTasbihClick();
                  onNavigateTab("prayers");
                }}
                className={`hover:text-emerald-500 transition flex items-center gap-1.5 ${styles.mutedText}`}
              >
                <span>•</span>
                <span>مواقيت الصلاة الفلكية الدقيقة</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  soundEngine.playTasbihClick();
                  onNavigateTab("athkar");
                }}
                className={`hover:text-emerald-500 transition flex items-center gap-1.5 ${styles.mutedText}`}
              >
                <span>•</span>
                <span>أذكار الصباح والمساء والسبحة النبضية</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  soundEngine.playTasbihClick();
                  onNavigateTab("qibla");
                }}
                className={`hover:text-emerald-500 transition flex items-center gap-1.5 ${styles.mutedText}`}
              >
                <span>•</span>
                <span>بوصلة القبلة التفاعلية 3D</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  soundEngine.playTasbihClick();
                  onNavigateTab("cairo_radio");
                }}
                className={`hover:text-emerald-500 transition flex items-center gap-1.5 ${styles.mutedText}`}
              >
                <span>•</span>
                <span>إذاعة القرآن الكريم من القاهرة مباشر</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Col 3: Knowledge & Takaful */}
        <div className="space-y-3">
          <h4 className="text-xs sm:text-sm font-bold text-[#D4AF37] font-alexandria flex items-center gap-2">
            <HandHeart className="w-4 h-4" />
            <span>التكافل والعلم الشرعي والفتاوى</span>
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button
                onClick={() => {
                  soundEngine.playTasbihClick();
                  onNavigateTab("fatwa");
                }}
                className="hover:text-emerald-500 transition flex items-center gap-1.5 font-bold text-[#D4AF37]"
              >
                <span>⚖</span>
                <span>موسوعة الفتاوى (دار الإفتاء المصرية والسعودية)</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  soundEngine.playTasbihClick();
                  onNavigateTab("takaful");
                }}
                className="hover:text-emerald-500 transition flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400"
              >
                <span>★</span>
                <span>تكافل الخير والحالات الإنسانية (مباشر)</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  soundEngine.playTasbihClick();
                  onNavigateTab("hadith");
                }}
                className={`hover:text-emerald-500 transition flex items-center gap-1.5 ${styles.mutedText}`}
              >
                <span>•</span>
                <span>موسوعة الحديث الشريف وصحيح البخاري</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  soundEngine.playTasbihClick();
                  onNavigateTab("zakat");
                }}
                className={`hover:text-emerald-500 transition flex items-center gap-1.5 ${styles.mutedText}`}
              >
                <span>•</span>
                <span>حاسبة الزكاة الشرعية لجميع الأموال</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  soundEngine.playTasbihClick();
                  onNavigateTab("calendar");
                }}
                className={`hover:text-emerald-500 transition flex items-center gap-1.5 ${styles.mutedText}`}
              >
                <span>•</span>
                <span>التقويم الهجري وأيام البيض ومواسم الخير</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  soundEngine.playTasbihClick();
                  onNavigateTab("laylat_qadr");
                }}
                className={`hover:text-emerald-500 transition flex items-center gap-1.5 ${styles.mutedText}`}
              >
                <span>•</span>
                <span>ليلة القدر المباركة وفضائلها</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Col 4: Ongoing Charity & Principles */}
        <div className="space-y-3">
          <h4 className="text-xs sm:text-sm font-bold text-teal-600 dark:text-teal-400 font-alexandria flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>وقف إسلامي دائم</span>
          </h4>
          <p className={`text-xs leading-relaxed ${styles.mutedText}`}>
            العمل موقوف لوجه الله تعالى دون أي نشاط تجاري. هدفنا خدمة الأمة وتوفير محتوى إسلامي نقي وموثق بدون شاشات إعلانية أو استغلال للبيانات.
          </p>

          <div className="space-y-2 pt-1">
            <button
              onClick={() => {
                soundEngine.playTasbihClick();
                onOpenWelcomeModal();
              }}
              className={`w-full py-2 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${styles.innerBg} ${styles.innerBorder} hover:border-emerald-500/50`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>جولة ترحيبية بالخصائص</span>
            </button>

            <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono text-center">
              دقة حساب فلكية • موثق من مجمع الملك فهد
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. BOTTOM FINAL COPYRIGHT STRIP */}
      {/* ========================================================================= */}
      <div className="px-5 sm:px-8 py-4 border-t border-black/5 dark:border-white/5 bg-black/10 dark:bg-black/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-right">
        
        {/* Right: Explicit requested copyright phrase */}
        <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3">
          <span className="font-mono text-xs font-bold tracking-wide text-[#D4AF37]">
            All Rights Reserved To All Muslims . Made With Love By Genius
          </span>
          <span className="text-[11px] text-slate-400 hidden md:inline">
            • وقف إسلامي حر متاح لكل مسلم ومسلمة
          </span>
        </div>

        {/* Left: Interactive "Support Us" Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundEngine.playTasbihClick();
              onOpenSupportModal();
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs shadow-xs active:scale-95 transition"
            title="ادعمنا لنستمر بأذن الله - عمل خالص لوجه الله"
          >
            <Heart className="w-3.5 h-3.5 fill-white animate-pulse" />
            <span>ادعمنا لنستمر بإذن الله</span>
          </button>
        </div>

      </div>
    </footer>
  );
};
