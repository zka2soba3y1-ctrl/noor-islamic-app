import React, { useState, useRef, useEffect } from "react";
import {
  HeartHandshake,
  Volume2,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Hand,
  Compass,
  BookOpen,
  Eye,
  CheckCircle2,
  X,
  MessageCircle,
  HelpCircle,
  ShieldCheck,
  Send,
  Radio,
  Zap,
} from "lucide-react";
import { soundEngine } from "../../utils/soundEngine";
import { speechEngine } from "../../utils/speechEngine";
import { ThemeMode } from "../../types";
import { getThemeStyles } from "../../utils/themeClasses";
import { GestureHandler } from "../../utils/gestureController";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  theme?: ThemeMode;
  onActivateBlindMode?: () => void;
  onOpenQibla?: () => void;
  onOpenQuran?: () => void;
  onOpenAthkar?: () => void;
}

interface TrainingLesson {
  id: string;
  title: string;
  subtitle: string;
  egyptianAudioScript: string;
  bulletPoints: string[];
  recommendedActionText: string;
  gestureType: "double_tap" | "swipe_right" | "two_finger" | "any_tap" | "compass_turn" | "camera_point";
}

const LESSONS: TrainingLesson[] = [
  {
    id: "grip_and_touch",
    title: "الدرس الأول: مسكة الهاتف واللمس الأولي",
    subtitle: "طريقة إمساك الهاتف والتحرك براحة تامة بدون النظر",
    egyptianAudioScript:
      "أهلاً بيك وبصديقنا البطل في تطبيق النور. أول نصيحة للمرافق: علم الكفيف يمسك الموبايل بإيده الشمال براحة، ويستخدم صباع السبابة في إيده اليمين. فهمه إن الشاشة كلها حساسة، ومش مطلوب منه يدور على زرار بعينه لأن التطبيق مصمم بالكامل يشتغل باللمس الحر والصوت الواضح.",
    bulletPoints: [
      "إمساك الهاتف براحة اليد غير المسيطرة لتثبيت زوايا الحركة.",
      "استخدام سبابة اليد الأخرى بحرية عبر مساحة الشاشة بالكامل.",
      "الشاشة مزودة بنبضات اهتزاز حسية تؤكد كل لمسة فوراً.",
    ],
    recommendedActionText: "تفعيل النطق الصوتي الترحيبي",
    gestureType: "any_tap",
  },
  {
    id: "smart_gestures",
    title: "الدرس الثاني: إيماءات اللمس الذكية (الإيماءات السحرية)",
    subtitle: "اللمستان، السحب يمين وشمال، ولمسة الصابعين",
    egyptianAudioScript:
      "يا بطل، اسمعني كويس: لما تعوز تشغل أو توقف أي تلاوة أو تأكد اختيارك، انقر لمستين سريعتين في أي مكان في الشاشة. ولما تعوز تقلب للسورة اللي بعدها، اسحب بصباعك لليمين أو الشمال، ولما تعوز توقف الصوت أو نطق المساعد فوراً، المس الشاشة بصابعين اتنين مع بعض في ثانية واحدة.",
    bulletPoints: [
      "نقرة مزدوجة (Double Tap): تشغيل/إيقاف التلاوة أو اختيار العنصر.",
      "سحب أفقي لليمين/اليسار: الانتقال للسورة أو الذكر التالي والسابق.",
      "لمس بإصبعين (Two Fingers Tap): إسكات فوري للصوت والمساعد.",
    ],
    recommendedActionText: "تدريب على اللمس المزدوج والسحب",
    gestureType: "double_tap",
  },
  {
    id: "tasbih_anywhere",
    title: "الدرس الثالث: السبحة اللمسية في أي مكان",
    subtitle: "التسبيح والذكر بنبضات حسية من غير ما تدور على زرار",
    egyptianAudioScript:
      "في صفحة السبحة والأذكار، مش محتاج تبص على الشاشة ولا تدور على مكان الزرار خالص. كل ما تلمس في أي حتة، الموبايل هيهتز هزة خفيفة ويعد تسبيحة. ولما توصل لثلاثة وثلاثين تسبيحة هيهتز هزتين وينطق لك بصوت عالي، ولما توصل لمية هيديك نغمة إتمام مباركة.",
    bulletPoints: [
      "لمس في أي مساحة حرة على الشاشة يضيف تسبيحة تلقائياً.",
      "اهتزاز حسي (Haptic) ملموس مع كل تسبيحة.",
      "نطق صوتي عند بلوغ 33 وعند إتمام 100 تسبيحة.",
    ],
    recommendedActionText: "فتح وتجربة السبحة اللمسية",
    gestureType: "any_tap",
  },
  {
    id: "audio_qibla",
    title: "الدرس الرابع: رادار القبلة الصوتي والاهتزازي",
    subtitle: "الاستدارة بالجسد حتى سماع نبضات متسارعة واهتزاز ثابت",
    egyptianAudioScript:
      "علم الكفيف يمسك الموبايل مفرود قدام صدره أفقي ويلف بجسمه براحة. الموبايل هيطلع نبضات صوتية بتسرع كل ما يقرب من الكعبة الشريفة. وأول ما وشه يكون في اتجاه القبلة بالظبط، الموبايل هيهتز ويثبت وينطق جملة واحدة واضحة: توقف! أنت الآن باتجاه القبلة تماماً.",
    bulletPoints: [
      "حمل الهاتف أفقياً بمستوى الصدر والاستدارة الهادئة.",
      "نبضات صوتية تزداد تردداً كلما اقترب من زاوية مكة المكرمة.",
      "اهتزاز متصل ونطق صوتي مباشر: (توقف، أنت باتجاه القبلة).",
    ],
    recommendedActionText: "تجربة رادار القبلة الصوتي",
    gestureType: "compass_turn",
  },
  {
    id: "quran_and_reciters",
    title: "الدرس الخامس: المصحف الشريف والتحكم الصوتي",
    subtitle: "تلاوة القرآن وتفسيره بصوت كبار القراء",
    egyptianAudioScript:
      "مشغل القرآن في وضع البصيرة معمول علشان يشتغل بنقرة واحدة. يقدر يختار شيخه المفضل زي الشيخ الحصري، المنشاوي، أو العفاسي. ولما تلمس نقرتين هيقرأ الآيات، ولو دوست على زر التفسير هينطق لك التفسير الميسر للآيات علشان يعيش مع معاني كتاب الله.",
    bulletPoints: [
      "تلاوات نقية من سيرفرات موثوقة لأشهر أئمة القراء.",
      "قراءة التفسير الميسر صوتياً بنقرة واحدة.",
      "التنقل بين السور بالسحب أو بالأمر الصوتي المباشر.",
    ],
    recommendedActionText: "فتح مشغل المصحف الصوتي",
    gestureType: "swipe_right",
  },
  {
    id: "ein_al_baseerah",
    title: "الدرس السادس: عين البصيرة وسجادة الصلاة",
    subtitle: "توجيه الكاميرا للأرض للبحث عن سجادة الصلاة والعوائق",
    egyptianAudioScript:
      "علم الكفيف لما يكون في غرفة جديدة أو في فندق، يشغل خاصية عين البصيرة ويوجه كاميرا الهاتف مائلة للأرض قدامه. الذكاء الاصطناعي هيفحص المكان ويقوله بصوت هادئ: سجادة الصلاة قدامك على بعد خطوتين، أو يقوله الطريق قدامك مفتوح ومفيش عوائق.",
    bulletPoints: [
      "رصد سجادة الصلاة وموقعها وبعدها التقريبي بالخطوات.",
      "قراءة النصوص واللافتات المكتوبة عبر كاميرا الهاتف.",
      "إرشادات صوتية واضحة ومطمئنة لسلامة الحركة.",
    ],
    recommendedActionText: "تجربة عين البصيرة بالذكاء الاصطناعي",
    gestureType: "camera_point",
  },
];

export const BlindCompanionTrainerGuide: React.FC<Props> = ({
  isOpen,
  onClose,
  theme = "natural",
  onActivateBlindMode,
  onOpenQibla,
  onOpenQuran,
  onOpenAthkar,
}) => {
  const styles = getThemeStyles(theme);
  const { isPaper, isNight, isLight } = styles;

  const [activeTab, setActiveTab] = useState<"lessons" | "sandbox" | "ai_consultant">("lessons");
  const [selectedLessonIndex, setSelectedLessonIndex] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Gesture Sandbox State
  const [sandboxFeedback, setSandboxFeedback] = useState<string>(
    "المس مساحة التدريب أدناه: جرب اللمس المزدوج أو السحب يمين وشمال أو لمس الشاشة بإصبعين."
  );
  const [lastDetectedGesture, setLastDetectedGesture] = useState<string | null>(null);
  const sandboxRef = useRef<HTMLDivElement | null>(null);

  // AI Consultant State
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Stop TTS when closing
  useEffect(() => {
    if (!isOpen) {
      speechEngine.stop();
      setIsPlayingAudio(false);
    }
  }, [isOpen]);

  // Handle Play/Stop Egyptian Audio Lesson
  const togglePlayCurrentLessonAudio = (index: number) => {
    const lesson = LESSONS[index];
    if (isPlayingAudio && selectedLessonIndex === index) {
      speechEngine.stop();
      setIsPlayingAudio(false);
    } else {
      setSelectedLessonIndex(index);
      setIsPlayingAudio(true);
      soundEngine.playAssistantActivate();
      speechEngine.speakEgyptian(lesson.egyptianAudioScript, {
        onEnd: () => setIsPlayingAudio(false),
      });
    }
  };

  // Sandbox Gesture Handlers
  const gestureHandler = new GestureHandler({
    onDoubleTap: () => {
      setLastDetectedGesture("نقرة مزدوجة (Double Tap)");
      const feedback = "الله ينور عليك يا بطل! دي نقرة مزدوجة صحيحة 100%! دي بتشغل وتوقف التلاوة.";
      setSandboxFeedback(feedback);
      soundEngine.playGestureSuccess();
      speechEngine.speakEgyptian(feedback);
    },
    onSwipeRight: () => {
      setLastDetectedGesture("سحب لليمين (Swipe Right)");
      const feedback = "ممتاز جداً! ده سحب لليمين، كده أنت بتنتقل للسورة أو الذكر اللي بعده!";
      setSandboxFeedback(feedback);
      soundEngine.playGestureSuccess();
      speechEngine.speakEgyptian(feedback);
    },
    onSwipeLeft: () => {
      setLastDetectedGesture("سحب لليسار (Swipe Left)");
      const feedback = "شاطر جداً! ده سحب لليسار، كده بترجع للسورة أو الذكر السابق!";
      setSandboxFeedback(feedback);
      soundEngine.playGestureSuccess();
      speechEngine.speakEgyptian(feedback);
    },
    onTwoFingerTap: () => {
      setLastDetectedGesture("لمس بإصبعين (Two-Finger Tap)");
      const feedback = "رائع ومبهر! لمست بإصبعين مع بعض، كده الصوت يسكت فوراً في ثانية واحدة!";
      setSandboxFeedback(feedback);
      soundEngine.playGestureSuccess();
      speechEngine.speakEgyptian(feedback);
    },
    onThreeFingerTap: () => {
      setLastDetectedGesture("لمس بثلاثة أصابع (Three-Finger Tap)");
      const now = new Date();
      const timeStr = `${now.getHours()}:${now.getMinutes() < 10 ? "0" : ""}${now.getMinutes()}`;
      const feedback = `تمام التمام! لمست بثلاثة أصابع، الساعة الآن ${timeStr} والصلاة القادمة قريبة بإذن الله.`;
      setSandboxFeedback(feedback);
      soundEngine.playMilestone33();
      speechEngine.speakEgyptian(feedback);
    },
    onSingleTap: () => {
      soundEngine.playTasbihClick();
      setLastDetectedGesture("لمسة حرة عادية (Single Tap)");
      setSandboxFeedback("لمسة واحدة مسجلة بنجاح. لو كررتها مرتين بسرعة ورا بعض هتعمل لمسة مزدوجة.");
    },
    onLongPress: () => {
      setLastDetectedGesture("ضغطة طويلة (Long Press)");
      const feedback = "ضغطة طويلة مسجلة! ده أمر تشغيل المساعد الصوتي الذكي فوراً.";
      setSandboxFeedback(feedback);
      soundEngine.playAssistantActivate();
      speechEngine.speakEgyptian(feedback);
    },
  });

  // Handle AI Consultant Query
  const handleAskConsultant = async () => {
    if (!aiQuestion.trim()) return;
    setIsAiLoading(true);
    soundEngine.playAssistantActivate();

    try {
      const res = await fetch("/api/ai/trainer-consultant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: aiQuestion }),
      });
      const data = await res.json();
      const answer = data.guidance || "بارك الله فيك، تم تسجيل استفسارك بنجاح.";
      setAiAnswer(answer);
      speechEngine.speakEgyptian(answer);
    } catch {
      const fallback =
        "أهلاً بيك، أفضل طريقة لتدريب أخيك الكفيف هي التكرار بصبر، وربط كل حركة بصوت ملموس حتى يحفظ الحركات.";
      setAiAnswer(fallback);
      speechEngine.speakEgyptian(fallback);
    } finally {
      setIsAiLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="blind-companion-guide-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="companion-guide-title"
    >
      <div
        className={`w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all duration-300 ${
          isPaper
            ? "bg-[#FAF5EB] border-[#D6C5A9] text-[#2F1E12]"
            : isNight
            ? "bg-[#0A0F17] border-slate-800 text-slate-100"
            : isLight
            ? "bg-white border-slate-200 text-slate-900"
            : "bg-[#071F18] border-emerald-500/40 text-emerald-50"
        }`}
      >
        {/* Top Header */}
        <div className="relative px-4 sm:px-6 py-4 border-b border-emerald-500/20 flex items-center justify-between bg-gradient-to-r from-emerald-900/40 via-transparent to-amber-900/20">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-950/40">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  id="companion-guide-title"
                  className="font-bold text-base sm:text-lg font-alexandria text-[#D4AF37] dark:text-[#F3E7C4]"
                >
                  دليل المرافق لتدريب الكفيف
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30">
                  شرح بالمصرية 🇪🇬
                </span>
              </div>
              <p className="text-xs opacity-75 font-alexandria">
                رفيق النور المسموع لتدريب المكفوفين على اللمس والإيماءات والعبادة اليومية
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playTasbihClick();
              speechEngine.stop();
              onClose();
            }}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-black/10 dark:bg-white/10 hover:bg-black/20 text-slate-400 hover:text-white transition-colors"
            title="إغلاق الدليل"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Main Navigation Tabs: Lessons, Sandbox, AI Consultant */}
        <div className="flex items-center justify-center gap-2 px-4 py-2.5 border-b border-emerald-500/15 bg-black/5 dark:bg-black/20">
          <button
            onClick={() => {
              soundEngine.playTasbihClick();
              setActiveTab("lessons");
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "lessons"
                ? "bg-[#D4AF37] text-slate-950 shadow-md scale-105"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>دروس الشرح الصوتي بالمصرية</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playTasbihClick();
              setActiveTab("sandbox");
              speechEngine.speakEgyptian(
                "أهلاً بيك في حقل التدريب التفاعلي. خلي صديقك الكفيف يجرب اللمس المزدوج أو السحب، والمساعد هيشجعه فوراً بالصوت."
              );
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "sandbox"
                ? "bg-emerald-600 text-white shadow-md scale-105"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Hand className="w-4 h-4" />
            <span>حقل التدريب التفاعلي للإيماءات</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playTasbihClick();
              setActiveTab("ai_consultant");
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "ai_consultant"
                ? "bg-amber-600 text-white shadow-md scale-105"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>مستشار المرافق بالذكاء الاصطناعي</span>
          </button>
        </div>

        {/* Tab 1: Spoken Lessons in Egyptian Arabic */}
        {activeTab === "lessons" && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs leading-relaxed text-amber-800 dark:text-amber-200">
              <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">رسالة إلى المرافق المبارك:</span>
                اضغط على زر <strong>«تشغيل الشرح الصوتي بالمصرية»</strong> عند كل درس، وضع الهاتف بجوار أخينا أو ابننا الكفيف ليستمع للتوجيه الودود ويبدأ تطبيقه معك خطوة بخطوة.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {LESSONS.map((lesson, idx) => {
                const isSelected = selectedLessonIndex === idx;
                const isThisPlaying = isPlayingAudio && isSelected;

                return (
                  <div
                    key={lesson.id}
                    className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                      isSelected
                        ? "border-[#D4AF37] bg-[#D4AF37]/10 shadow-md ring-1 ring-[#D4AF37]/40"
                        : "border-emerald-500/20 bg-black/10 hover:border-emerald-500/40"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-bold text-[#D4AF37]">
                          الخطوة {idx + 1}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/20 text-slate-300">
                          {lesson.gestureType === "double_tap"
                            ? "لمسة مزدوجة"
                            : lesson.gestureType === "swipe_right"
                            ? "سحب أفقي"
                            : lesson.gestureType === "compass_turn"
                            ? "استدارة بوصلة"
                            : lesson.gestureType === "camera_point"
                            ? "كاميرا ذكية"
                            : "لمس حر"}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold font-alexandria mb-1 text-slate-100">
                        {lesson.title}
                      </h3>
                      <p className="text-xs opacity-80 mb-3 leading-normal">
                        {lesson.subtitle}
                      </p>

                      <ul className="space-y-1.5 mb-4 text-xs opacity-90">
                        {lesson.bulletPoints.map((point, pIdx) => (
                          <li key={pIdx} className="flex items-start gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] shrink-0 mt-1.5" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-3 border-t border-emerald-500/20 flex items-center justify-between gap-2">
                      <button
                        onClick={() => togglePlayCurrentLessonAudio(idx)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all shadow-sm ${
                          isThisPlaying
                            ? "bg-amber-600 text-white animate-pulse"
                            : "bg-gradient-to-r from-[#D4AF37] to-amber-600 text-slate-950 hover:brightness-110"
                        }`}
                      >
                        {isThisPlaying ? (
                          <>
                            <Pause className="w-4 h-4" />
                            <span>إيقاف الشرح الصوتي</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-4 h-4" />
                            <span>شرح صوتي بالمصرية للكفيف</span>
                          </>
                        )}
                      </button>

                      {idx === 0 && onActivateBlindMode && (
                        <button
                          onClick={() => {
                            soundEngine.playTasbihClick();
                            onActivateBlindMode();
                            onClose();
                          }}
                          className="px-2.5 py-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 text-xs font-bold border border-emerald-500/30"
                          title="تفعيل وضع البصيرة الآن"
                        >
                          بدء فوري
                        </button>
                      )}

                      {idx === 3 && onOpenQibla && (
                        <button
                          onClick={() => {
                            soundEngine.playTasbihClick();
                            onOpenQibla();
                            onClose();
                          }}
                          className="px-2.5 py-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 text-xs font-bold border border-emerald-500/30"
                          title="تجربة القبلة"
                        >
                          فتح القبلة
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Interactive Gesture Training Sandbox */}
        {activeTab === "sandbox" && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-1 text-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <Hand className="w-3.5 h-3.5" />
                منطقة التدريب الحي للإيماءات
              </span>
              <h3 className="text-sm font-bold font-alexandria">
                دع صديقك الكفيف يلمس هذه المساحة ويدرب أصابعه
              </h3>
            </div>

            {/* The Big Touch Stage */}
            <div
              ref={sandboxRef}
              onTouchStart={gestureHandler.onTouchStart}
              onTouchMove={gestureHandler.onTouchMove}
              onTouchEnd={gestureHandler.onTouchEnd}
              onClick={() => {
                soundEngine.playTasbihClick();
                setSandboxFeedback("تمت نقرة بالفأرة. على شاشات اللمس جرب النقر المزدوج والسحب بالأصابع.");
              }}
              className="relative w-full h-60 sm:h-72 rounded-3xl border-2 border-dashed border-[#D4AF37]/60 bg-gradient-to-b from-black/40 to-emerald-950/30 flex flex-col items-center justify-center p-6 text-center cursor-pointer select-none active:scale-[0.99] transition-transform shadow-inner"
            >
              <div className="w-16 h-16 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37] flex items-center justify-center mb-3 animate-pulse">
                <Hand className="w-8 h-8 text-[#D4AF37]" />
              </div>

              <div className="font-alexandria font-bold text-sm sm:text-base text-white mb-1">
                المس في أي مكان هنا بإصبعك
              </div>
              <p className="text-xs text-slate-300 max-w-sm">
                (جرب: نقرتين سريعتين • سحب لليمين أو اليسار • لمسة بإصبعين معاً • لمسة بثلاثة أصابع)
              </p>

              {lastDetectedGesture && (
                <div className="mt-3 px-3 py-1 rounded-full bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold animate-bounce">
                  الإيماءة الملتقطة: {lastDetectedGesture}
                </div>
              )}
            </div>

            {/* Live Audio & Visual Feedback Box */}
            <div className="p-4 rounded-2xl bg-black/20 border border-emerald-500/20 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                  <Volume2 className="w-5 h-5 animate-pulse" />
                </div>
                <div className="text-xs font-medium text-slate-200">
                  {sandboxFeedback}
                </div>
              </div>

              <button
                onClick={() => {
                  soundEngine.playAssistantActivate();
                  speechEngine.speakEgyptian(sandboxFeedback);
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 text-xs font-bold whitespace-nowrap"
              >
                إعادة النطق
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: AI Consultant for Blind Companions */}
        {activeTab === "ai_consultant" && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-transparent to-amber-950/30 border border-emerald-500/20 space-y-2">
              <div className="flex items-center gap-2 text-[#D4AF37] font-bold text-sm font-alexandria">
                <Sparkles className="w-4 h-4" />
                <span>مستشار المرافق الذكي (محرك المحرك الذكي)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                هل تواجه صعوبة في تعليم صديقك أو ابنك الكفيف مهارة معينة؟ اسأل المستشار وسيقدم لك نصائح تربوية وعملية بالمصرية لشرح كيفية استخدام التطبيق ومساعدته في أداء العبادات.
              </p>
            </div>

            {/* Predefined Quick Questions */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400">أسئلة شائعة لمرافقي المكفوفين:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "إزاي أعلمه يحدد اتجاه القبلة بنفسه بدون مساعدة؟",
                  "أسهل طريقة لتدريبه على السبحة اللمسية بدون ما يتلخبط؟",
                  "إزاي أخليه يسمع سورة البقرة بصوت الشيخ الحصري بسهولة؟",
                  "إزاي نستخدم كاميرا عين البصيرة علشان يلاقي سجادة الصلاة؟",
                ].map((q, qIdx) => (
                  <button
                    key={qIdx}
                    onClick={() => setAiQuestion(q)}
                    className="text-[11px] px-2.5 py-1 rounded-xl bg-black/20 hover:bg-[#D4AF37]/20 border border-white/10 hover:border-[#D4AF37]/40 text-slate-200 transition-all text-right"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Box */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAskConsultant()}
                placeholder="اكتب سؤالك للمستشار هنا..."
                className="flex-1 px-4 py-2.5 rounded-xl text-xs bg-black/20 border border-emerald-500/30 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
              />
              <button
                onClick={handleAskConsultant}
                disabled={isAiLoading || !aiQuestion.trim()}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-600 text-slate-950 text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 hover:brightness-110 shadow-md"
              >
                {isAiLoading ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>جارٍ التفكير...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>استشارة</span>
                  </>
                )}
              </button>
            </div>

            {/* Result Answer Box */}
            {aiAnswer && (
              <div className="p-4 rounded-2xl bg-emerald-950/25 border border-emerald-500/30 space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 font-alexandria flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    توجيه المستشار للمرافق:
                  </span>
                  <button
                    onClick={() => speechEngine.speakEgyptian(aiAnswer)}
                    className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>استماع صوتي</span>
                  </button>
                </div>
                <p className="text-xs leading-relaxed text-slate-200 whitespace-pre-line">
                  {aiAnswer}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="px-4 sm:px-6 py-3 border-t border-emerald-500/20 bg-black/10 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>تطبيق النور • مصمم بأعلى معايير إمكانية الوصول (W3C WCAG AAA)</span>
          </div>

          <button
            onClick={() => {
              soundEngine.playTasbihClick();
              speechEngine.stop();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold"
          >
            تم الانتهاء
          </button>
        </div>
      </div>
    </div>
  );
};
