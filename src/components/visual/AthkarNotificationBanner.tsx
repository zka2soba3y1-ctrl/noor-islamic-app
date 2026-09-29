import React, { useState, useEffect } from "react";
import {
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Sparkles,
  BookOpen,
  ChevronLeft,
  X,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import { ThemeMode } from "../../types";
import { soundEngine } from "../../utils/soundEngine";
import { speechEngine } from "../../utils/speechEngine";

interface DhikrNotificationItem {
  id: string;
  text: string;
  repeat: number;
  virtue: string;
  source: string;
}

const MORNING_ATHKAR: DhikrNotificationItem[] = [
  {
    id: "m_1",
    text: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ. رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ.",
    repeat: 1,
    virtue: "من قالها حين يصبح حُفظ في يومه ورزقه الله بركة الصباح وسرور النهار.",
    source: "صحيح مسلم",
  },
  {
    id: "m_2",
    text: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ.",
    repeat: 1,
    virtue: "سيّد الاستغفار: من قالها موقناً بها حين يصبح فمات من يومه دخل الجنة.",
    source: "صحيح البخاري",
  },
  {
    id: "m_3",
    text: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ.",
    repeat: 3,
    virtue: "من قالها ثلاثاً إذا أصبح لم يضره شيء حتى يمسي.",
    source: "سنن أبي داود والترمذي",
  },
  {
    id: "m_4",
    text: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ، وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ.",
    repeat: 1,
    virtue: "دعاء تفريج الكرب وصلاح الحال في كل أمور الدنيا والآخرة.",
    source: "المستدرك على الصحيحين",
  },
  {
    id: "m_5",
    text: "اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَهَ إِلَّا أَنْتَ. اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْكُفْرِ وَالْفَقْرِ، وَأَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، لَا إِلَهَ إِلَّا أَنْتَ.",
    repeat: 3,
    virtue: "حفظ العافية وصحة الجسد والحواس والاستعاذة من الفقر وعذاب القبر.",
    source: "سنن أبي داود",
  },
];

const EVENING_ATHKAR: DhikrNotificationItem[] = [
  {
    id: "e_1",
    text: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ. رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا.",
    repeat: 1,
    virtue: "حفظ العبد في ليلته ونيل بركة المساء ودفع شرور الليل ووساوسه.",
    source: "صحيح مسلم",
  },
  {
    id: "e_2",
    text: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ.",
    repeat: 1,
    virtue: "سيّد الاستغفار: من قالها موقناً بها حين يمسي فمات من ليلته دخل الجنة.",
    source: "صحيح البخاري",
  },
  {
    id: "e_3",
    text: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ.",
    repeat: 3,
    virtue: "من قالها حين يمسي ثلاث مرات لم يضره حُمَةٌ ولا لدغة ولا سوء في ليلته.",
    source: "صحيح مسلم",
  },
  {
    id: "e_4",
    text: "حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ.",
    repeat: 7,
    virtue: "من قالها سبع مرات حين يصبح وحين يمسي كفاه الله ما أهمه من أمر الدنيا والآخرة.",
    source: "سنن أبي داود",
  },
  {
    id: "e_5",
    text: "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ.",
    repeat: 1,
    virtue: "إقرار بالتوحيد واللجوء إلى الله في كل حين والتسليم لأمره سبحانه.",
    source: "سنن الترمذي",
  },
];

interface AthkarNotificationBannerProps {
  theme: ThemeMode;
  onNavigateToAzkar: () => void;
}

export const AthkarNotificationBanner: React.FC<AthkarNotificationBannerProps> = ({
  theme,
  onNavigateToAzkar,
}) => {
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [completedDhikrs, setCompletedDhikrs] = useState<Record<string, boolean>>({});

  // Determine whether it's Morning or Evening
  const currentHour = new Date().getHours();
  const isMorning = currentHour >= 4 && currentHour < 12;
  const activeList = isMorning ? MORNING_ATHKAR : EVENING_ATHKAR;
  const currentDhikr = activeList[currentIndex % activeList.length];

  // Stop speech when component unmounts
  useEffect(() => {
    return () => {
      speechEngine.stop();
    };
  }, []);

  const handleSmartVoiceRead = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    soundEngine.playTasbihClick();

    if (isSpeaking) {
      speechEngine.stop();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    const spokenIntro = isMorning
      ? "حان الآن موعد أذكار الصباح المباركة، استمع ورَدِّد معي يا غالي:"
      : "حان الآن موعد أذكار المساء وحفظ النفس، استمع ورَدِّد معي يا غالي:";

    const fullSpoken = `${spokenIntro} ${currentDhikr.text}.. ${currentDhikr.virtue}`;

    speechEngine.speak(fullSpoken, {
      rate: 0.93,
      onEnd: () => {
        setIsSpeaking(false);
        setCompletedDhikrs((prev) => ({ ...prev, [currentDhikr.id]: true }));
      },
    });
  };

  const handleNextDhikr = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    soundEngine.playTasbihClick();
    speechEngine.stop();
    setIsSpeaking(false);
    setCurrentIndex((prev) => (prev + 1) % activeList.length);
  };

  const handleDismiss = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    soundEngine.playTasbihClick();
    speechEngine.stop();
    setIsSpeaking(false);
    setIsDismissed(true);
  };

  if (isDismissed) {
    return (
      <div className="flex items-center justify-between p-2.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          {isMorning ? (
            <Sun className="w-3.5 h-3.5 text-amber-500" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-indigo-400" />
          )}
          <span>
            تم تصغير إشعار {isMorning ? "أذكار الصباح" : "أذكار المساء"}
          </span>
        </div>
        <button
          onClick={() => setIsDismissed(false)}
          className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
        >
          عرض الإشعار
        </button>
      </div>
    );
  }

  const isPaper = theme === "paper";
  const isLight = theme === "light";
  const isNight = theme === "night";

  return (
    <section
      id="athkar-notification-banner"
      aria-label="إشعار الأذكار اليومية"
      onClick={handleSmartVoiceRead}
      className={`relative rounded-3xl p-4 sm:p-5 border shadow-lg transition-all duration-300 cursor-pointer overflow-hidden group ${
        isSpeaking
          ? "ring-2 ring-[#D4AF37] border-[#D4AF37] shadow-[0_0_25px_rgba(212,175,55,0.25)]"
          : isPaper
          ? "bg-gradient-to-br from-[#FFFDF9] via-[#FAF3E7] to-[#F5ECE0] border-[#D6C5A9] text-[#2F1E12]"
          : isLight
          ? "bg-gradient-to-br from-white via-emerald-50/50 to-amber-50/40 border-emerald-500/30 text-[#0F172A]"
          : isNight
          ? "bg-gradient-to-br from-[#06090F] via-[#0A101C] to-[#05070B] border-slate-800 text-white"
          : "bg-gradient-to-br from-[#07241A]/95 via-[#0A2E22]/95 to-[#071D15]/95 border-emerald-500/35 text-white"
      }`}
    >
      {/* Decorative Golden Top Line */}
      <div
        className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${
          isMorning
            ? "from-amber-500 via-[#D4AF37] to-amber-500"
            : "from-indigo-500 via-emerald-400 to-indigo-500"
        } opacity-80`}
      />

      {/* Floating Ambient Glowing Orb */}
      <div
        className={`absolute -bottom-10 -left-10 w-44 h-44 rounded-full blur-2xl pointer-events-none ${
          isMorning ? "bg-amber-500/10" : "bg-emerald-500/10"
        }`}
      />

      <div className="relative z-10 space-y-3">
        {/* Banner Top Bar */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            {/* Pulsing Sun/Moon Beacon */}
            <div
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl border flex items-center justify-center relative shadow-sm ${
                isMorning
                  ? "bg-amber-500/15 border-amber-500/40 text-amber-500 shadow-amber-500/10"
                  : "bg-indigo-500/15 border-indigo-500/40 text-indigo-400 shadow-indigo-500/10"
              }`}
            >
              {isMorning ? (
                <Sun className="w-5 h-5 animate-[spin_40s_linear_infinite]" />
              ) : (
                <Moon className="w-5 h-5 animate-pulse" />
              )}
              {/* Pulsing Alert Ping */}
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#D4AF37] rounded-full border-2 border-slate-900 animate-ping" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-black font-alexandria text-[#D4AF37] dark:text-[#F3E7C4]">
                  {isMorning ? "أذكار الصباح المباركة" : "أذكار المساء وحفظ النفس"}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
                  حان وقتها الآن ⏰
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                انقر على الذكر أو زر القراءة الصوتية للاستماع المباشر والترديد
              </p>
            </div>
          </div>

          {/* Action buttons: Next & Dismiss */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleNextDhikr}
              className="p-1.5 rounded-xl border border-emerald-500/25 bg-black/5 dark:bg-white/5 hover:bg-black/10 text-slate-600 dark:text-slate-300 transition"
              title="الذكر التالي"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="p-1.5 rounded-xl border border-slate-200/50 dark:border-slate-800 bg-black/5 dark:bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition"
              title="إخفاء الإشعار"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Featured Dhikr Card with Full Tashkeel */}
        <div
          className={`p-3.5 sm:p-4.5 rounded-2xl border transition-all ${
            isSpeaking
              ? "bg-[#D4AF37]/10 border-[#D4AF37]/50 shadow-inner"
              : isPaper
              ? "bg-[#FAF5EB] border-[#D6C5A9]/70"
              : isLight
              ? "bg-emerald-500/5 border-emerald-500/20"
              : "bg-black/25 border-emerald-500/20"
          }`}
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
                التكرار: {currentDhikr.repeat === 1 ? "مرة واحدة" : `${currentDhikr.repeat} مرات`}
              </span>
              <span className="text-[10px] text-slate-400">
                • {currentDhikr.source}
              </span>
            </div>

            {completedDhikrs[currentDhikr.id] && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500">
                <CheckCircle2 className="w-3 h-3" />
                <span>تم الاستماع</span>
              </span>
            )}
          </div>

          <p className="text-sm sm:text-base font-bold font-alexandria leading-relaxed text-slate-800 dark:text-slate-100">
            {currentDhikr.text}
          </p>

          <p className="mt-2 text-[11px] text-[#D4AF37] dark:text-[#F3E7C4]/90 flex items-center gap-1">
            <Sparkles className="w-3 h-3 shrink-0" />
            <span>{currentDhikr.virtue}</span>
          </p>
        </div>

        {/* Banner Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          {/* Smart Voice Button */}
          <button
            type="button"
            onClick={handleSmartVoiceRead}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-md cursor-pointer active:scale-95 ${
              isSpeaking
                ? "bg-gradient-to-r from-amber-500 to-[#D4AF37] text-slate-950 ring-2 ring-amber-400"
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20"
            }`}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-4 h-4 animate-pulse" />
                <span>إيقاف القراءة الصوتية</span>
                <span className="flex items-center gap-0.5 mr-1">
                  <span className="w-1 h-3 bg-slate-950 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1 h-4 bg-slate-950 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1 h-2 bg-slate-950 rounded-full animate-bounce" />
                </span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-[#F3E7C4]" />
                <span>قراءة صوتية ذكية للذكر 🔊</span>
              </>
            )}
          </button>

          {/* Navigate to Full Azkar View */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              soundEngine.playTasbihClick();
              speechEngine.stop();
              onNavigateToAzkar();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-emerald-500/30 hover:border-emerald-500/60 text-emerald-700 dark:text-emerald-300 bg-black/5 dark:bg-white/5 transition cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
            <span>الأذكار كاملة</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
};
