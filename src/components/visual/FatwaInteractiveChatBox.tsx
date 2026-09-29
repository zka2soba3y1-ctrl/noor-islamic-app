import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Copy,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Scale,
  Eye,
  Ear,
  Building2,
  Share2,
  HelpCircle,
  MessageSquare,
  Compass,
} from "lucide-react";
import { soundEngine } from "../../utils/soundEngine";
import { speechEngine } from "../../utils/speechEngine";

export interface FatwaConsultantMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  source?: "both" | "egypt" | "saudi";
  audioUrl?: string | null;
  egyptUrl?: string;
  saudiUrl?: string;
  timestamp: string;
}

interface Props {
  theme?: string;
  defaultExpanded?: boolean;
}

export const FatwaInteractiveChatBox: React.FC<Props> = ({
  theme = "emerald",
  defaultExpanded = true,
}) => {
  const [messages, setMessages] = useState<FatwaConsultantMessage[]>([
    {
      id: "welcome-msg",
      sender: "assistant",
      text: `أهلاً ومرحباً بك يا غالي. أنا «المستشار الفقهي الذكي» بمشروع النور، مدعوم بمحرك الذكاء الاصطناعي الفقهي.
أنا مرتبط وموجّه للبحث الصارم في أوثق مرجعين رسميين للأمة الإسلامية:
1. 🇪🇬 **بوابة دار الإفتاء المصرية الرسمية (dar-alifta.org)**
2. 🇸🇦 **بوابة الرئاسة العامة للبحوث العلمية والإفتاء وهيئة كبار العلماء بالمملكة العربية السعودية (alifta.gov.sa)**

اكتب سؤالك أو انقر زر الميكروفون وتحدث بصوتك، وسأوافيك بالبيان المعتمد من المصدرين فوراً مع إمكانية سماع الإجابة بصوت رجل مصري وقور.`,
      timestamp: "الآن",
      source: "both",
      egyptUrl: "https://www.dar-alifta.org",
      saudiUrl: "https://www.alifta.gov.sa",
    },
  ]);

  const [inputQuery, setInputQuery] = useState("");
  const [selectedSource, setSelectedSource] = useState<"both" | "egypt" | "saudi">("both");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isBlindAccessibilityMode, setIsBlindAccessibilityMode] = useState(false);
  const [autoVoicePlay, setAutoVoicePlay] = useState(true);

  // Audio Playback
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Copy notification
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const isDark = theme === "night" || theme === "natural";
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Handle Voice Input
  const startListening = () => {
    soundEngine.playAssistantActivate();
    speechEngine.stop();
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      setIsPlayingAudio(false);
    }

    setIsListening(true);
    speechEngine.announceForScreenReader("جارٍ الاستماع لسؤالك الفقهي، تحدث الآن...");

    const rec = speechEngine.createRecognition(
      (transcript) => {
        setIsListening(false);
        soundEngine.playTasbihClick();
        if (transcript.trim()) {
          setInputQuery(transcript);
          handleSendMessage(transcript);
        }
      },
      (err) => {
        console.warn("Speech recognition error:", err);
        setIsListening(false);
        speechEngine.announceForScreenReader("تعذر التقاط الصوت، يمكنك النقر للحديث مجدداً.");
      },
      () => {
        setIsListening(false);
      }
    );

    if (rec) {
      try {
        rec.start();
      } catch (e) {
        setIsListening(false);
      }
    } else {
      setIsListening(false);
      alert("التعرف الصوتي غير مدعوم في هذا المتصفح، يرجى كتابة السؤال.");
    }
  };

  const stopListening = () => {
    setIsListening(false);
    soundEngine.playTasbihClick();
  };

  // Play realistic Egyptian audio or speak via speech synthesis
  const playMessageAudio = async (msg: FatwaConsultantMessage) => {
    if (isPlayingAudio && playingMessageId === msg.id) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      speechEngine.stop();
      setIsPlayingAudio(false);
      setPlayingMessageId(null);
      return;
    }

    soundEngine.playTasbihClick();
    speechEngine.stop();
    setIsPlayingAudio(true);
    setPlayingMessageId(msg.id);

    if (msg.audioUrl) {
      if (!audioPlayerRef.current) {
        audioPlayerRef.current = new Audio();
      }
      const audio = audioPlayerRef.current;
      audio.src = msg.audioUrl;
      audio.onended = () => {
        setIsPlayingAudio(false);
        setPlayingMessageId(null);
      };
      audio.onerror = () => {
        setIsPlayingAudio(false);
        setPlayingMessageId(null);
        // Fallback to speechEngine with clean complete text
        const spokenText = msg.text.replace(/[*#_`]/g, "").replace(/https?:\/\/\S+/g, "").trim();
        speechEngine.speakEgyptian(spokenText, {
          gender: speechEngine.getVoiceGender(),
          onEnd: () => {
            setIsPlayingAudio(false);
            setPlayingMessageId(null);
          },
        });
      };
      try {
        await audio.play();
      } catch (err) {
        console.warn("Audio play prevented:", err);
        setIsPlayingAudio(false);
        setPlayingMessageId(null);
      }
    } else {
      // Fallback with clean complete text
      const spokenText = msg.text.replace(/[*#_`]/g, "").replace(/https?:\/\/\S+/g, "").trim();
      speechEngine.speakEgyptian(spokenText, {
        gender: speechEngine.getVoiceGender(),
        onEnd: () => {
          setIsPlayingAudio(false);
          setPlayingMessageId(null);
        },
      });
    }
  };

  // Send question to the Smart Fatwa Consultant
  const handleSendMessage = async (customQuery?: string) => {
    const q = (customQuery || inputQuery).trim();
    if (!q || isLoading) return;

    soundEngine.playTasbihClick();
    setInputQuery("");
    setIsLoading(true);

    const userMessage: FatwaConsultantMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: q,
      timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    speechEngine.announceForScreenReader("جارٍ استخراج الفتوى المعتمدة من دار الإفتاء المصرية والسعودية بمحرك الذكاء الاصطناعي...");

    try {
      const res = await fetch("/api/ai/fatwa-consultant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          preferredSource: selectedSource,
          userType: isBlindAccessibilityMode ? "blind" : "all",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMsg: FatwaConsultantMessage = {
          id: `ai-${Date.now()}`,
          sender: "assistant",
          text: data.answer || "تم استخراج البيان الفقهي المعتمد من المصادر الرسمية.",
          audioUrl: data.audioUrl || null,
          source: selectedSource,
          egyptUrl: data.egyptOfficialSearchUrl || `https://www.dar-alifta.org/ar/home/search?q=${encodeURIComponent(q)}`,
          saudiUrl: data.saudiOfficialSearchUrl || "https://www.alifta.gov.sa",
          timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
        };

        setMessages((prev) => [...prev, assistantMsg]);
        soundEngine.playMilestone33();

        // Auto play audio for blind accessibility mode or if autoVoicePlay is on
        if (autoVoicePlay || isBlindAccessibilityMode) {
          setTimeout(() => {
            playMessageAudio(assistantMsg);
          }, 300);
        }
      } else {
        throw new Error("API failed");
      }
    } catch (error) {
      console.error("Fatwa Consultant error:", error);
      const errorMsg: FatwaConsultantMessage = {
        id: `err-${Date.now()}`,
        sender: "assistant",
        text: `عذراً يا طيب، حدث بطء في الاتصال بمحرك الذكاء الاصطناعي. يمكنك البحث المباشر في البوابات الرسمية:
- 🇪🇬 [بحث مباشر في دار الإفتاء المصرية](https://www.dar-alifta.org/ar/home/search?q=${encodeURIComponent(q)})
- 🇸🇦 [بوابة الرئاسة العامة للإفتاء بالسعودية](https://www.alifta.gov.sa)`,
        timestamp: "الآن",
        source: selectedSource,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    soundEngine.playTasbihClick();
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    speechEngine.announceForScreenReader("تم نسخ نص الفتوى والبيان بنجاح");
    setTimeout(() => setCopiedId(null), 2500);
  };

  const COMMON_QUESTIONS = [
    "ما حكم فوائد شهادات الاستثمار وأرباح البنوك؟",
    "ما حكم صلاة المسافر وجمعه وقصره؟",
    "حكم إخراج زكاة الفطر قيمة نقدية؟",
    "ما حكم التعامل بالعملات الرقمية المشفرة (البيتكوين)؟",
    "هل قطرة العين وبخاخ الربو من مفطرات الصائم؟",
    "حكم الطلاق المعلق والطلاق الشفوي؟",
    "ما حكم عمليات التلقيح الصناعي وأطفال الأنابيب؟",
  ];

  return (
    <section
      id="fatwa-interactive-communication-box"
      aria-label="مربع التواصل الفقهي الذكي مع المستخدم"
      className={`rounded-3xl border shadow-xl overflow-hidden transition-all duration-300 ${
        isDark
          ? "bg-gradient-to-b from-[#081f16] via-[#051710] to-[#030e0a] border-emerald-500/30 text-white"
          : "bg-gradient-to-b from-white via-emerald-50/25 to-teal-50/30 border-emerald-500/25 text-zinc-900"
      }`}
    >
      {/* Top Banner & Accessibility Controller */}
      <div className="p-4 sm:p-5 border-b border-emerald-500/20 bg-emerald-500/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-amber-600 flex items-center justify-center text-black font-extrabold shadow-md shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-alexandria text-emerald-400">
                  مربع التواصل الفقهي المباشر (المحرك الذكي)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/35">
                  Gemini Dual-Source
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                مساعد فقهي تفاعلي يربطك مباشرة بدار الإفتاء المصرية والرئاسة العامة للإفتاء بالسعودية • للمبصر والكفيف
              </p>
            </div>
          </div>

          {/* Mode Switchers: Blind / Sighted + Voice Auto Read */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                soundEngine.playTasbihClick();
                const next = !isBlindAccessibilityMode;
                setIsBlindAccessibilityMode(next);
                if (next) {
                  setAutoVoicePlay(true);
                  speechEngine.announceForScreenReader(
                    "تم تفعيل نمط الكفيف: تم تكبير الأزرار وتشغيل النطق الصوتي التلقائي بصوت رجل مصري."
                  );
                } else {
                  speechEngine.announceForScreenReader("تم العودة للنمط المعتاد للمبصرين.");
                }
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                isBlindAccessibilityMode
                  ? "bg-purple-600 text-white border-purple-400 shadow-[0_0_15px_rgba(147,51,234,0.4)]"
                  : "bg-black/10 dark:bg-white/5 hover:bg-black/20 text-zinc-300 border-white/10"
              }`}
              title="تفعيل واجهة محسنة للمكفوفين وضعاف البصر"
              aria-label="تبديل نمط الواجهة بين المبصر والكفيف"
            >
              {isBlindAccessibilityMode ? (
                <>
                  <Ear className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                  <span>نمط الكفيف (نشط)</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-zinc-400" />
                  <span>واجهة الكفيف / ضعيف البصر</span>
                </>
              )}
            </button>

            {/* Voice auto-readout toggle */}
            <button
              onClick={() => {
                soundEngine.playTasbihClick();
                setAutoVoicePlay(!autoVoicePlay);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition flex items-center gap-1.5 ${
                autoVoicePlay
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  : "bg-black/10 dark:bg-white/5 text-zinc-400 border-white/10"
              }`}
              title="نطق الفتوى تلقائياً بصوت مصري عند استلامها"
            >
              {autoVoicePlay ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>نطق تلقائي (مفعل)</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-zinc-400" />
                  <span>نطق بالطلب</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Source selector tabs */}
        <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <Building2 className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="font-semibold">المصدر المعتمد للبحث:</span>
          </div>

          <div className="flex items-center gap-1.5 bg-black/20 dark:bg-white/5 p-1 rounded-2xl border border-white/10">
            {[
              { id: "both", label: "المصدران معاً (مقارنة شاملة)", icon: "⚖️" },
              { id: "egypt", label: "🇪🇬 دار الإفتاء المصرية فقط", icon: "🇪🇬" },
              { id: "saudi", label: "🇸🇦 هيئة كبار العلماء بالسعودية فقط", icon: "🇸🇦" },
            ].map((src) => (
              <button
                key={src.id}
                onClick={() => {
                  soundEngine.playTasbihClick();
                  setSelectedSource(src.id as any);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  selectedSource === src.id
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <span>{src.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Suggested Quick Questions for Instant 1-Click Inquiry */}
      <div className="p-3 bg-black/10 dark:bg-white/[0.02] border-b border-white/5 overflow-x-auto scrollbar-none flex items-center gap-2">
        <span className="text-[11px] font-bold text-[#D4AF37] whitespace-nowrap flex items-center gap-1 shrink-0 px-1">
          <Sparkles className="w-3 h-3" />
          <span>مسائل شائعة للبحث الفوري:</span>
        </span>
        {COMMON_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => {
              handleSendMessage(q);
            }}
            className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 transition active:scale-95 shrink-0"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Interactive Messages Dialogue Stream */}
      <div
        className="p-4 sm:p-6 space-y-5 max-h-[520px] overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-500/20"
        role="log"
        aria-live="polite"
      >
        {messages.map((msg) => {
          const isAssistant = msg.sender === "assistant";
          const isCurrentlyPlaying = isPlayingAudio && playingMessageId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isAssistant ? "items-start" : "items-end"} gap-1.5`}
            >
              {/* Sender label */}
              <div className="flex items-center gap-2 text-[11px] text-zinc-400 px-1">
                {isAssistant ? (
                  <>
                    <span className="font-bold text-emerald-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                      المستشار الفقهي الذكي (Gemini AI)
                    </span>
                    <span>• {msg.timestamp}</span>
                  </>
                ) : (
                  <>
                    <span>{msg.timestamp} •</span>
                    <span className="font-bold text-teal-300">سؤالك المبارك</span>
                  </>
                )}
              </div>

              {/* Message Box */}
              <div
                className={`rounded-3xl p-4 sm:p-5 max-w-3xl leading-relaxed text-xs sm:text-sm border transition shadow-sm ${
                  isAssistant
                    ? isDark
                      ? "bg-[#0a2318] border-emerald-500/30 text-zinc-100"
                      : "bg-white border-emerald-500/20 text-zinc-800 shadow"
                    : "bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-transparent"
                }`}
              >
                {/* Content formatted */}
                <div className="whitespace-pre-line font-sans space-y-2">
                  {msg.text}
                </div>

                {/* Direct Verification Links & Audio Actions (for assistant messages) */}
                {isAssistant && (
                  <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                    {/* Official Portals Link Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      {msg.egyptUrl && (
                        <a
                          href={msg.egyptUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 transition font-medium"
                          title="التحقق من الفتوى في موقع دار الإفتاء المصرية الرسمي"
                        >
                          <span>بوابة دار الإفتاء المصرية 🇪🇬</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {msg.saudiUrl && (
                        <a
                          href={msg.saudiUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 transition font-medium"
                          title="التحقق من الفتوى في موقع الرئاسة العامة للإفتاء بالسعودية"
                        >
                          <span>بوابة الإفتاء السعودية 🇸🇦</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    {/* Audio & Copy Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => playMessageAudio(msg)}
                        className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                          isCurrentlyPlaying
                            ? "bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse"
                            : "bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30"
                        }`}
                        title={
                          isCurrentlyPlaying
                            ? "إيقاف الصوت"
                            : "استمع للفتوى كاملة بصوت رجل مصري وقور"
                        }
                        aria-label="استماع للفتوى بصوت رجل مصري"
                      >
                        {isCurrentlyPlaying ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5" />
                            <span>إيقاف النطق</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>استمع للفتوى (صوت رجل مصري)</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => copyToClipboard(msg.text, msg.id)}
                        className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/5 transition"
                        title="نسخ نص الفتوى"
                        aria-label="نسخ الفتوى"
                      >
                        {copiedId === msg.id ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Spinner Indicator */}
        {isLoading && (
          <div className="flex items-center gap-3 p-4 rounded-3xl bg-emerald-950/30 border border-emerald-500/20 text-emerald-300 max-w-md animate-pulse">
            <RefreshCw className="w-4 h-4 animate-spin text-[#D4AF37]" />
            <div className="space-y-0.5">
              <span className="text-xs font-bold">
                جارٍ فحص المسألة وتوثيقها بالمحرك الذكي...
              </span>
              <p className="text-[11px] text-zinc-400">
                مطابقة الفتوى بين دار الإفتاء المصرية وهيئة كبار العلماء بالسعودية
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Section (Voice-First for Blind Users & Text for Sighted Users) */}
      <div className="p-4 sm:p-5 border-t border-emerald-500/20 bg-emerald-500/[0.03]">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Large Voice Recording Button (Accessible for Blind Users) */}
          <button
            onClick={isListening ? stopListening : startListening}
            className={`px-4 sm:px-5 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition shadow-md active:scale-95 shrink-0 ${
              isListening
                ? "bg-red-600 text-white animate-pulse border-2 border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                : isBlindAccessibilityMode
                ? "bg-purple-600 hover:bg-purple-500 text-white border-2 border-purple-400 text-sm py-4 shadow-lg"
                : "bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400 text-xs"
            }`}
            title={
              isListening
                ? "جاري الاستماع إليك.. انقر للإيقاف"
                : "تحدث بصوتك بالمسألة الفقهية (مخصص للمكفوفين والمبصرين)"
            }
            aria-label={isListening ? "إيقاف الميكروفون" : "التحدث صوتياً بالمسألة الفقهية"}
          >
            {isListening ? (
              <>
                <MicOff className="w-5 h-5 animate-bounce" />
                <span>جاري الاستماع...</span>
              </>
            ) : (
              <>
                <Mic className="w-5 h-5 text-yellow-300" />
                <span>تحدث صوتياً</span>
              </>
            )}
          </button>

          {/* Text Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={
                isBlindAccessibilityMode
                  ? "انقر زر «تحدث صوتياً» أو اكتب سؤالك هنا..."
                  : "اكتب مسألتك الفقهية للبحث الموثق في مصر والسعودية..."
              }
              className={`w-full px-4 py-3 rounded-2xl border text-xs sm:text-sm transition focus:outline-none focus:border-[#D4AF37] ${
                isDark
                  ? "bg-black/40 border-white/15 text-white placeholder:text-zinc-500"
                  : "bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-400 shadow-inner"
              }`}
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading || !inputQuery.trim()}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-amber-600 hover:brightness-110 text-black font-extrabold text-xs shadow-md transition disabled:opacity-40 flex items-center justify-center gap-1.5 active:scale-95 shrink-0"
            aria-label="إرسال المسألة الفقهية للمستشار"
          >
            <Send className="w-4 h-4" />
            <span>طلب الفتوى</span>
          </button>
        </div>

        {/* Accessibility guidance note */}
        <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-2 px-1">
          <span>
            💡 للمكفوفين: اضغط على زر «تحدث صوتياً» والفظ سؤالك بالعربية، وسينطق الرفيق الجواب فوراً.
          </span>
          <span className="hidden sm:inline font-mono text-[#D4AF37]">
            دار الإفتاء 107 • الإفتاء السعودية 8002451000
          </span>
        </div>
      </div>
    </section>
  );
};
