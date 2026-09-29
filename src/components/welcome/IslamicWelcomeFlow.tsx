import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  BookOpen,
  Compass,
  Download,
  ShieldCheck,
  Check,
  Smartphone,
  CheckCircle2,
  Database,
  Layers,
} from "lucide-react";
import { soundEngine } from "../../utils/soundEngine";
import { usePWAInstall } from "../../hooks/usePWAInstall";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const IslamicWelcomeFlow: React.FC<Props> = ({ isOpen, onClose }) => {
  // Step 0: Powerful Islamic Animated Intro (Bismillah + Crescent)
  // Step 1: Dual Architecture (Visual & Sensory Blind Mode)
  // Step 2: Comprehensive Quran & Worship Encyclopedia
  // Step 3: PWA Installation & Local SQLite Offline Storage
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const { isInstallable, isInstalled, install } = usePWAInstall();

  // Play Islamic Intro Tone upon opening
  useEffect(() => {
    if (isOpen && currentStep === 0) {
      const timer = setTimeout(() => {
        if (soundEnabled) {
          soundEngine.playIntroIslamicTheme();
        }
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isOpen, currentStep, soundEnabled]);

  if (!isOpen) return null;

  const handleNext = () => {
    soundEngine.playTasbihClick();
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    soundEngine.playTasbihClick();
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    soundEngine.playMilestone33();
    localStorage.setItem("noor_welcome_seen", "true");
    onClose();
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-flow-heading"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300"
      dir="rtl"
    >
      <div className="w-full max-w-2xl bg-[#0B1512] border border-[#D4AF37]/35 rounded-3xl shadow-[0_0_50px_rgba(212,175,55,0.2)] overflow-hidden relative flex flex-col max-h-[92vh]">
        {/* Subtle Background Islamic Pattern Texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10 mix-blend-overlay"
          style={{
            backgroundImage: `url('https://i.ibb.co/pBdt7pHC/3.png')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        {/* Subtle Background Radial Ambient Glow */}
        <div className="absolute top-0 right-1/2 translate-x-1/2 w-96 h-96 bg-[#059669]/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Header Bar */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-white/10 relative z-10">
          <div className="flex items-center gap-2">
            <img
              src="https://i.ibb.co/sJ9F5mbb/1.png"
              alt="شعار النور"
              className="w-8 h-8 rounded-lg border border-[#D4AF37]/40 object-contain bg-[#061A14]"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/app-logo.png";
              }}
              referrerPolicy="no-referrer"
            />
            <span className="text-xs font-bold text-[#F3E7C4] font-alexandria whitespace-nowrap">
              تطبيق النور الإسلامي
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleSound}
              className="p-2 rounded-xl text-zinc-400 hover:text-white bg-white/5 border border-white/10 transition"
              title={soundEnabled ? "كتم الصوت الإرشادي" : "تشغيل الصوت"}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-[#D4AF37]" />
              ) : (
                <VolumeX className="w-4 h-4 text-zinc-500" />
              )}
            </button>
            <button
              onClick={handleComplete}
              className="px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition"
            >
              تخطي
            </button>
          </div>
        </div>

        {/* Body Content Area */}
        <div className="p-5 sm:p-8 overflow-y-auto relative z-10 flex-1 flex flex-col justify-center">
          {/* STEP 0: Powerful Islamic Intro Animation */}
          {currentStep === 0 && (
            <div className="text-center space-y-6 animate-in zoom-in-95 fade-in duration-400">
              <div className="relative inline-flex items-center justify-center">
                {/* Glowing Concentric Ornaments */}
                <div className="absolute inset-0 w-36 h-36 -m-3 rounded-full border border-[#D4AF37]/30 animate-spin [animation-duration:25s]"></div>
                <div className="absolute inset-0 w-44 h-44 -m-7 rounded-full border border-[#059669]/20"></div>

                <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-[#061A14] to-[#0D382B] border-2 border-[#D4AF37] p-2 flex items-center justify-center shadow-[0_0_35px_rgba(212,175,55,0.4)]">
                  <img
                    src="https://i.ibb.co/sJ9F5mbb/1.png"
                    alt="أيقونة تطبيق النور"
                    className="w-full h-full object-contain drop-shadow-md"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/app-logo.png";
                    }}
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {/* Calligraphic Bismillah */}
                <div className="font-['Amiri',serif] text-2xl sm:text-3xl text-[#D4AF37] font-bold tracking-wide drop-shadow-[0_0_12px_rgba(212,175,55,0.3)]">
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </div>

                <h2
                  id="welcome-flow-heading"
                  className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-alexandria"
                >
                  تطبيق النور الإسلامي
                </h2>

                <div className="inline-block px-3.5 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#F3E7C4] text-xs sm:text-sm font-semibold">
                  نوراً للمسلم المبصر – والكفيف
                </div>

                <p className="text-xs sm:text-sm text-zinc-300 max-w-md mx-auto leading-relaxed pt-2">
                  منظومة إسلامية وقفية خالصة، تجمع بين الرؤية التقنية الحديثة، مصحف المدينة المنورة، ودعم متكامل غير مسبوق للمكفوفين بدون إعلانات.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleNext}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#C59B27] to-[#A27A13] hover:brightness-110 text-black font-extrabold text-sm shadow-[0_0_25px_rgba(212,175,55,0.4)] transition-all active:scale-95 flex items-center gap-2 mx-auto"
                >
                  <span>بدء الاستكشاف والجولة</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 1: Dual Architecture (Visual & Sensory Blind Mode) */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in slide-in-from-left-4 fade-in duration-300">
              <div className="text-center space-y-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#D4AF37] bg-[#D4AF37]/15 px-3 py-1 rounded-full border border-[#D4AF37]/30">
                  المرحلة الأولى • الرؤية والرسالة
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white font-alexandria">
                  تطبيقان متكاملان في منصة واحدة
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300">
                  حل تقني ثوري يدمج عموم المسلمين مع إخوانهم المكفوفين وضعاف البصر
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Visual Mode Card */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-[#059669]/40 hover:border-[#059669] transition space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#059669]/20 text-[#10B981] flex items-center justify-center border border-[#059669]/40">
                      <Eye className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white font-alexandria">
                        النمط المرئي الحديث
                      </h4>
                      <span className="text-[11px] text-zinc-400">لعموم المسلمين</span>
                    </div>
                  </div>
                  <ul className="text-xs text-zinc-300 space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                      <span>واجهة بصرية متطورة بتصميم إسلامي فاخر</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                      <span>مواقيت صلاة فلكية ورادار قبلة تفاعلي</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                      <span>سجل تفاعلي لمتابعة الصلوات والعبادات اليومية</span>
                    </li>
                  </ul>
                </div>

                {/* Sensory Blind Mode Card */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-yellow-500/40 hover:border-yellow-400 transition space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-yellow-500/20 text-yellow-300 flex items-center justify-center border border-yellow-500/40">
                      <EyeOff className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white font-alexandria">
                        نمط البصيرة الحسي
                      </h4>
                      <span className="text-[11px] text-zinc-400">للمكفوفين وضعاف البصر</span>
                    </div>
                  </div>
                  <ul className="text-xs text-zinc-300 space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                      <span>شاشة سوداء مطفأة بالكامل لحفظ الطاقة والخصوصية</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                      <span>نظام توجيه صوتي حسي ولمسي ذكي فوري</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                      <span>رادار هابتيك لتحديد القبلة بالاهتزاز بدقة</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-[11px] text-zinc-300 flex items-center gap-2 text-center justify-center">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>وقف تقني 100% لوجه الله تعالى • خلو تام من الإعلانات ومن التتبع</span>
              </div>
            </div>
          )}

          {/* STEP 2: Comprehensive Quran & Worship Encyclopedia */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in slide-in-from-left-4 fade-in duration-300">
              <div className="text-center space-y-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#10B981] bg-[#059669]/15 px-3 py-1 rounded-full border border-[#059669]/30">
                  المرحلة الثانية • المحتوى الشرعي المعتمد
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white font-alexandria">
                  موسوعة إسلامية شاملة ومصحف كامل
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300">
                  محتوى أصيل موثق مبني على مصادر علمية وتلاوات معتمدة
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-3 bg-white/[0.03] border border-white/10 rounded-2xl text-center space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-[#059669]/20 text-[#10B981] flex items-center justify-center mx-auto">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-bold text-white font-alexandria">مصحف المدينة</h4>
                  <p className="text-[11px] text-zinc-400">604 صفحات كاملة برواية حفص وتلاوات 24 قارئاً</p>
                </div>

                <div className="p-3 bg-white/[0.03] border border-white/10 rounded-2xl text-center space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center mx-auto">
                    <Compass className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-bold text-white font-alexandria">مواقيت وقبلة</h4>
                  <p className="text-[11px] text-zinc-400">حساب فلكي دقيق وبوصلة تفاعلية مباشرة</p>
                </div>

                <div className="p-3 bg-white/[0.03] border border-white/10 rounded-2xl text-center space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-[#10B981]/20 text-[#10B981] flex items-center justify-center mx-auto">
                    <Layers className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-bold text-white font-alexandria">الأذكار والحديث</h4>
                  <p className="text-[11px] text-zinc-400">أذكار الصباح والمساء، رياض الصالحين والأربعين</p>
                </div>

                <div className="p-3 bg-white/[0.03] border border-white/10 rounded-2xl text-center space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center mx-auto">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-bold text-white font-alexandria">محاضرات تأصيلية</h4>
                  <p className="text-[11px] text-zinc-400">سلاسل كبار العلماء مصنفة حسب الأبواب</p>
                </div>

                <div className="p-3 bg-white/[0.03] border border-white/10 rounded-2xl text-center space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center mx-auto">
                    <Database className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-bold text-white font-alexandria">حاسبة الزكاة</h4>
                  <p className="text-[11px] text-zinc-400">حساب نصاب الذهب والفضة والأسهم والمدخرات</p>
                </div>

                <div className="p-3 bg-white/[0.03] border border-white/10 rounded-2xl text-center space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-bold text-white font-alexandria">بث مباشر</h4>
                  <p className="text-[11px] text-zinc-400">الحرم المكي والنبوي الشريف وإذاعة القرآن</p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PWA Installation & Local SQLite Storage */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in slide-in-from-left-4 fade-in duration-300 text-center">
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#D4AF37] bg-[#D4AF37]/15 px-3 py-1 rounded-full border border-[#D4AF37]/30">
                  المرحلة الثالثة • تطبيق أصلي متكامل
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white font-alexandria">
                  جاهز للتثبيت السريع والعمل أوفلاين
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 max-w-md mx-auto">
                  يدعم تطبيق النور معايير PWA العالمية، ليعمل كتطبيق جوال أصيل بدون متجر وبدون اتصال دائم بالإنترنت.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#061A14] to-[#0B251D] border border-[#D4AF37]/40 space-y-4 max-w-md mx-auto">
                <div className="flex items-center justify-center gap-3">
                  <img
                    src="/icon.svg"
                    alt="PWA Icon"
                    className="w-14 h-14 rounded-2xl border border-[#D4AF37]/50 shadow-lg object-contain bg-[#061A14]"
                  />
                  <div className="text-right">
                    <h4 className="text-sm font-bold text-white font-alexandria">
                      تثبيت تطبيق النور (PWA)
                    </h4>
                    <p className="text-xs text-zinc-300">
                      أيقونة رسمية على الشاشة الرئيسية • وصول فوري
                    </p>
                    <span className="text-[10px] text-[#10B981] font-mono">
                      ✓ يعمل 100% دون اتصال بالإنترنت • خصوصية تامة
                    </span>
                  </div>
                </div>

                {!isInstalled && (
                  <button
                    onClick={async () => {
                      soundEngine.playTasbihClick();
                      await install();
                    }}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B68C1C] hover:brightness-110 text-black font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>تثبيت التطبيق على جهازك الآن</span>
                  </button>
                )}

                {isInstalled && (
                  <div className="p-2.5 rounded-xl bg-[#059669]/20 border border-[#059669]/40 text-[#10B981] text-xs font-bold flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>التطبيق مثبت ويعمل بكامل إمكانيات PWA!</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-right max-w-md mx-auto text-xs text-zinc-300">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>بياناتك محفوظة محلياً ومشفرة في جهازك</span>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span>متوافق مع Android وiOS وWindows وMac</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Navigation & Controls */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-[#09090B]/60 flex items-center justify-between relative z-10">
          {/* Step Indicators */}
          <div className="flex items-center gap-1.5">
            {[0, 1, 2, 3].map((stepIdx) => (
              <button
                key={stepIdx}
                onClick={() => {
                  soundEngine.playTasbihClick();
                  setCurrentStep(stepIdx);
                }}
                className={`h-2 rounded-full transition-all ${
                  currentStep === stepIdx
                    ? "w-7 bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]"
                    : "w-2 bg-white/20 hover:bg-white/40"
                }`}
                title={`الانتقال إلى الشاشة ${stepIdx + 1}`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition flex items-center gap-1"
              >
                <ChevronRight className="w-4 h-4" />
                <span>السابق</span>
              </button>
            )}

            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                className="px-5 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-[0_0_15px_rgba(5,150,105,0.4)] transition flex items-center gap-1 active:scale-95"
              >
                <span>التالي</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B68C1C] hover:brightness-110 text-black font-extrabold text-xs shadow-[0_0_20px_rgba(212,175,55,0.4)] transition flex items-center gap-1.5 active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>بدء استخدام التطبيق</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
