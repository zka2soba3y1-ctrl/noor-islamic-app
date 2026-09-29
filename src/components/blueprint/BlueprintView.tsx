import React, { useState } from "react";
import {
  FileText,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Calendar,
  Layers,
  Smartphone,
  WifiOff,
  Cpu,
  Heart,
  Volume2,
  Download,
  Share2,
  Users,
  Compass,
  Eye,
  EyeOff,
  Sparkles,
  Code2,
  Coins,
  Github,
} from "lucide-react";
import {
  SPRINT_WEEKS,
  ARCHITECTURE_PILLARS,
  KPIS_METRICS,
  OPEN_SOURCE_WAQF,
} from "../../data/blueprintData";
import { speechEngine } from "../../utils/speechEngine";
import { soundEngine } from "../../utils/soundEngine";

export const BlueprintView: React.FC = () => {
  const [activeSprintWeek, setActiveSprintWeek] = useState(1);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const triggerAudioWelcome = () => {
    soundEngine.playAssistantActivate();
    speechEngine.speak(
      "أهلاً بكم في المنصة التعريفية لمشروع النور الإسلامي العالمي. هذا المشروع وقف تقني مستقل غير ربحي، صُمم لخدمة مائتين وثلاثة وخمسين مليون كفيف وضعيف بصر، بالإضافة لعموم المسلمين، بصفر تكلفة تشغيلية."
    );
  };

  const handleSimulatedDownload = () => {
    soundEngine.playMilestone33();
    setDownloadSuccess(true);
    speechEngine.speak("بدأ تجهيز حزمة تطبيق أندرويد المستقل APK برقم الإصدار 1.0 التجريبي.");
    setTimeout(() => {
      setDownloadSuccess(false);
    }, 4000);
  };

  return (
    <div id="blueprint-container" className="max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-10 font-['Cairo',sans-serif] text-[#E4E4E7]">
      {/* Executive Pitch Deck Header Banner */}
      <div className="glass-panel border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-5 relative overflow-hidden bg-gradient-to-b from-white/[0.04] to-transparent">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="bg-white/5 text-zinc-300 border border-white/10 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider">
              وثيقة المشروع التنفيذية • سبتمبر 2026
            </span>
            <span className="bg-[#059669]/15 text-[#059669] border border-[#059669]/30 px-3 py-1 rounded-full text-xs font-mono font-medium">
              100% وقف تقني • صفري التكلفة
            </span>
          </div>

          <button
            onClick={triggerAudioWelcome}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-3.5 py-1.5 rounded-xl text-xs font-medium transition active:scale-95 shadow"
          >
            <Volume2 className="w-4 h-4 text-[#059669]" />
            <span>رسالة ترحيب صوتية للمكفوفين</span>
          </button>
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
          تطبيق ومحرك النور الإسلامي العالمي
          <span className="block text-lg sm:text-xl font-medium text-[#059669] mt-2 font-mono">
            Noor Global Islamic Project & Architecture Blueprint
          </span>
        </h1>

        <p className="text-sm sm:text-base text-zinc-300 max-w-3xl leading-relaxed">
          أول منصة ومحرك إسلامي رقمي عالمي يُهندس من الصفر ليدمج بين فئتين في تطبيق واحد فائق الذكاء: 
          المكفوفين وضعاف البصر وعموم المسلمين المبصرين. انطلق المشروع برؤية قائمة على الوقف التقني الخالص لوجه الله تعالى، متجرداً من أي ربح مالي أو إعلانات تجارية، وبنموذج تشغيلي مستدام يعتمد على صفر تكلفة خوادم.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={handleSimulatedDownload}
            className="flex items-center gap-2 bg-[#059669] hover:bg-[#047857] text-white font-bold px-6 py-3 rounded-2xl shadow-[0_0_25px_rgba(5,150,105,0.35)] transition active:scale-95 text-sm"
          >
            <Download className="w-4 h-4" />
            <span>تحميل حزمة أندرويد (Release APK v1.0)</span>
          </button>

          <a
            href="#sprint-roadmap"
            className="flex items-center gap-2 glass-panel hover:bg-white/5 text-zinc-200 font-medium px-5 py-3 rounded-2xl border border-white/10 transition text-sm"
          >
            <Calendar className="w-4 h-4 text-[#059669]" />
            <span>خطة الـ 30 يوماً للمطور الفردي</span>
          </a>
        </div>

        {downloadSuccess && (
          <div className="bg-[#059669]/10 border border-[#059669]/30 p-3.5 rounded-xl text-[#059669] text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-[#059669]" />
            <span>تم استدعاء حزمة النور بنجاح. التطبيق مهيأ للعمل الفوري دون الحاجة لأي خوادم سحابية خارجية.</span>
          </div>
        )}
      </div>

      {/* SECTION 1: KPIS & IMPACT METRICS */}
      <div className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#059669]" />
          <span>المؤشرات المستهدفة وأثر الوقف التقني</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {KPIS_METRICS.map((kpi, idx) => (
            <div
              key={idx}
              className="glass-panel glass-panel-hover border border-white/5 p-6 rounded-3xl flex flex-col justify-between space-y-3 transition-all"
            >
              <span className="text-3xl sm:text-4xl font-light text-[#059669] font-mono tracking-tight">
                {kpi.metric}
              </span>
              <div>
                <h4 className="font-bold text-base text-white">{kpi.label}</h4>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{kpi.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: THE PROBLEM & MARKET GAP */}
      <div className="glass-panel border border-white/5 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="space-y-1">
          <span className="text-[10px] font-mono font-medium text-[#059669] uppercase tracking-widest">
            المشكلة والفجوة السوقية
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            لماذا يحتاج العالم الإسلامي لمشروع "النور"؟
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-[#121214] p-5 rounded-2xl border border-white/5 space-y-2">
            <span className="w-8 h-8 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center font-mono font-bold">
              1
            </span>
            <h4 className="font-bold text-white text-base">تجاهل 253 مليون كفيف</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              تعتمد 99% من التطبيقات الإسلامية الحالية على واجهات بصرية معقدة وأزرار صغيرة وإعلانات منبثقة مزعجة تعطل قارئات الشاشة كلياً وتجعل العبادة المستقلة شبه مستحيلة.
            </p>
          </div>

          <div className="bg-[#121214] p-5 rounded-2xl border border-white/5 space-y-2">
            <span className="w-8 h-8 rounded-xl bg-[#059669]/15 text-[#059669] border border-[#059669]/30 flex items-center justify-center font-mono font-bold">
              2
            </span>
            <h4 className="font-bold text-white text-base">استغلال البيانات والإعلانات</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              تحويل العبادة إلى سلعة تجارية، مع بيع بيانات المواقع الجغرافية وسجلات الصلوات لشركات الإعلانات والوسطاء، مما ينتهك حرمة الخشوع والخصوصية.
            </p>
          </div>

          <div className="bg-[#121214] p-5 rounded-2xl border border-white/5 space-y-2">
            <span className="w-8 h-8 rounded-xl bg-white/10 text-white border border-white/10 flex items-center justify-center font-mono font-bold">
              3
            </span>
            <h4 className="font-bold text-white text-base">التبعية السحابية والانقطاع</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              تتوقف التطبيقات التقليدية عن العمل عند انقطاع الإنترنت أو انهيار السيرفرات السحابية المكلفة، بينما صُمم "النور" ليعمل محلياً في الصحراء أو السفر دون إنترنت.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 3: ARCHITECTURE PILLARS */}
      <div className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#059669]" />
          <span>الركائز الهندسية الأربعة لمحرك النور</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ARCHITECTURE_PILLARS.map((pillar) => (
            <div
              key={pillar.id}
              className="glass-panel glass-panel-hover border border-white/5 p-6 rounded-3xl space-y-3 transition-all"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#059669]/15 text-[#059669] border border-[#059669]/30 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-white">{pillar.title}</h3>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                {pillar.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 4: 30-DAY SPRINT ROADMAP */}
      <div id="sprint-roadmap" className="glass-panel border border-white/5 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="space-y-1">
          <span className="text-[10px] font-mono font-medium text-[#059669] uppercase tracking-widest">
            خطة العمل التنفيذية (Agile Roadmap)
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            سباق الـ 30 يوماً للمطور الفردي الرشيق
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            جدول زمني تنفيذي محكم يوضح المخرجات البرمجية لكل أسبوع للوصول إلى نسخة إطلاق عالمية مستقرة.
          </p>
        </div>

        {/* Week Selector tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SPRINT_WEEKS.map((s) => (
            <button
              key={s.week}
              onClick={() => setActiveSprintWeek(s.week)}
              className={`p-3 rounded-2xl border text-center font-bold text-xs sm:text-sm transition-all ${
                activeSprintWeek === s.week
                  ? "bg-[#059669] text-white border-white/20 shadow-[0_0_15px_rgba(5,150,105,0.4)]"
                  : "glass-panel text-zinc-400 border-white/5 hover:text-white"
              }`}
            >
              الأسبوع {s.week}
            </button>
          ))}
        </div>

        {/* Active Week Deliverables Card */}
        {(() => {
          const weekData = SPRINT_WEEKS.find((w) => w.week === activeSprintWeek)!;
          return (
            <div className="bg-[#121214] p-6 rounded-3xl border border-white/5 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-[#059669]">{weekData.title}</h3>
                <p className="text-xs sm:text-sm text-zinc-300 mt-1 leading-relaxed">
                  <span className="font-bold text-white">التركيز الجوهري: </span>
                  {weekData.focus}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/5">
                <h4 className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-wider">
                  المخرجات التنفيذية المسلّمة:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {weekData.deliverables.map((deliv, i) => (
                    <div
                      key={i}
                      className="glass-panel border border-white/5 p-3 rounded-xl flex items-start gap-2 text-xs text-zinc-200"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                      <span>{deliv}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* SECTION 5: ZERO COST & SUSTAINABILITY MODEL */}
      <div className="glass-panel border border-[#059669]/30 bg-[#059669]/5 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#059669]/15 text-[#059669] border border-[#059669]/30 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">الاستدامة وصفر التكلفة التشغيلية (Zero-Cost Waqf)</h3>
            <p className="text-xs text-zinc-400">كيف يعمل المشروع إلى الأبد دون الحاجة لتبرعات جارية أو خوادم مدفوعة؟</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-zinc-300 pt-2">
          <div className="bg-[#121214] p-4 rounded-2xl border border-white/5 space-y-1.5">
            <span className="font-bold text-[#059669] block font-mono">1. استغلال شبكات CDN العامة</span>
            <p className="leading-relaxed text-zinc-400">
              تُسحب التلاوات والملفات الصوتية والإذاعات مباشرة من خوادم شبكة MP3Quran المفتوحة وقفياً لعموم المسلمين.
            </p>
          </div>

          <div className="bg-[#121214] p-4 rounded-2xl border border-white/5 space-y-1.5">
            <span className="font-bold text-[#059669] block font-mono">2. المعالجة على العتاد المحلي</span>
            <p className="leading-relaxed text-zinc-400">
              حسابات المواقيت، البوصلة، التوجيه الاهتزازي، ومحرك التوليد الصوتي تتم 100% على معالج هاتف المستخدم.
            </p>
          </div>

          <div className="bg-[#121214] p-4 rounded-2xl border border-white/5 space-y-1.5">
            <span className="font-bold text-[#059669] block font-mono">3. الذكاء الاصطناعي المجاني</span>
            <p className="leading-relaxed text-zinc-400">
              استغلال باقات Gemini Flash المجانية السريعة لمعالجة طلبات الرؤية والرفيق الصوتي بأعلى درجات الكفاءة.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 6: OPEN-SOURCE ENDOWMENT — رخصة الوقف المفتوح */}
      <div className="glass-panel border border-[#D4AF37]/30 bg-gradient-to-b from-[#D4AF37]/[0.07] to-transparent rounded-3xl p-6 sm:p-10 space-y-7">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 px-3 py-1 rounded-full text-xs font-mono font-medium">
              {OPEN_SOURCE_WAQF.badge}
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
            {OPEN_SOURCE_WAQF.title}
          </h2>
          <p className="text-sm sm:text-base text-zinc-300 max-w-4xl leading-loose">
            {OPEN_SOURCE_WAQF.intro}
          </p>
        </div>

        {/* The five freedoms */}
        <div className="space-y-3">
          <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#D4AF37]" />
            <span>{OPEN_SOURCE_WAQF.freedomsTitle}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {OPEN_SOURCE_WAQF.freedoms.map((f, i) => {
              const Icon =
                i === 0 ? Heart : i === 1 ? Code2 : i === 2 ? Share2 : i === 3 ? Coins : ShieldCheck;
              return (
                <div
                  key={i}
                  className="bg-[#121214] p-5 rounded-2xl border border-white/5 space-y-2.5 transition-all hover:border-[#D4AF37]/30"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/12 text-[#D4AF37] border border-[#D4AF37]/25 flex items-center justify-center">
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <h4 className="font-bold text-white text-sm">{f.title}</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Invitation to developers */}
        <div className="bg-[#121214] border border-[#059669]/25 rounded-3xl p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#059669]/15 text-[#059669] border border-[#059669]/30 flex items-center justify-center">
              <Github className="w-5.5 h-5.5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                {OPEN_SOURCE_WAQF.invitationTitle}
              </h3>
              <p className="text-xs text-zinc-400">رسالة مفتوحة لكل من يقرأ هذا الكود</p>
            </div>
          </div>

          <p className="text-sm sm:text-base text-zinc-300 leading-loose">
            {OPEN_SOURCE_WAQF.invitation}
          </p>

          <div className="space-y-2.5">
            {OPEN_SOURCE_WAQF.invitationPoints.map((point, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-200">
                <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                <span className="leading-relaxed">{point}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href="https://github.com/ahmed-genius/noor-islamic-app"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white hover:bg-zinc-200 text-black font-bold px-5 py-2.5 rounded-2xl shadow-md transition active:scale-95 text-sm"
            >
              <Github className="w-4 h-4" />
              <span>الكود المفتوح على GitHub</span>
            </a>
            <a
              href="/"
              className="flex items-center gap-2 glass-panel hover:bg-white/5 text-zinc-200 font-medium px-5 py-2.5 rounded-2xl border border-white/10 transition text-sm"
            >
              <Smartphone className="w-4 h-4 text-[#059669]" />
              <span>جرّب التطبيق الآن</span>
            </a>
          </div>
        </div>

        <p className="text-center text-xs sm:text-sm text-[#D4AF37]/80 leading-relaxed italic max-w-3xl mx-auto">
          {OPEN_SOURCE_WAQF.closingNote}
        </p>
      </div>
    </div>
  );
};
