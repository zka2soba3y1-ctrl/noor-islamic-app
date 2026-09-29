import React, { useState } from "react";
import {
  X,
  User,
  Phone,
  Mail,
  Globe,
  MessageCircle,
  Award,
  Rocket,
  Heart,
  Send,
  BadgeCheck,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import {
  DEVELOPER,
  DEVELOPER_STATS,
  DEVELOPER_PLATFORMS,
  CONTACT_TOPICS,
  ContactTopic,
  buildWhatsAppLink,
} from "../../data/developerData";
import { soundEngine } from "../../utils/soundEngine";
import { speechEngine } from "../../utils/speechEngine";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const DeveloperProfileModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [topic, setTopic] = useState<ContactTopic>("contact");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [showPlatforms, setShowPlatforms] = useState(true);
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;

  const handleSend = () => {
    if (!message.trim()) {
      speechEngine.speak("اكتب رسالتك الأول يا غالي وبعدين دوس إرسال");
      return;
    }
    soundEngine.playTasbihClick();
    window.open(buildWhatsAppLink(topic, name.trim(), message.trim()), "_blank", "noopener");
    setSent(true);
    setTimeout(() => setSent(false), 5000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-label="صفحة المطور"
    >
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl bg-[#121214] border border-[#D4AF37]/30 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-l from-[#D4AF37]/10 to-transparent shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#8C5E24] flex items-center justify-center text-black font-black text-xl shadow-lg shrink-0">
              ج
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>{DEVELOPER.name}</span>
                <BadgeCheck className="w-5 h-5 text-[#D4AF37]" />
              </h2>
              <p className="text-xs text-zinc-400">{DEVELOPER.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/10 transition shrink-0"
            aria-label="إغلاق صفحة المطور"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Voice / bio */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-[#D4AF37]">
              <User className="w-4 h-4" />
              <span className="text-xs font-bold">كلمة المطور</span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-300 leading-loose">{DEVELOPER.voice}</p>
            <p className="text-xs text-zinc-400 leading-relaxed">{DEVELOPER.mission}</p>
            <p className="text-xs font-bold text-[#D4AF37]">{DEVELOPER.closing}</p>
          </div>

          {/* Quick facts */}
          <div className="flex flex-wrap gap-2 text-[11px]">
            <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-zinc-200">
              🎂 {DEVELOPER.age}
            </span>
            <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-zinc-200">
              💼 {DEVELOPER.experience}
            </span>
            <span className="px-3 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] font-bold">
              🔑 كلمة العضوية: «{DEVELOPER.membershipWord}»
            </span>
          </div>

          {/* Stats */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-[#D4AF37]" />
              <span>الأرقام والإنجازات</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {DEVELOPER_STATS.map((s, i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                  <div className="text-2xl font-black text-[#D4AF37] font-mono" dir="ltr">
                    {s.value}
                  </div>
                  <div className="text-xs font-bold text-white">{s.label}</div>
                  <div className="text-[10px] text-zinc-400 leading-relaxed">{s.detail}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Platforms */}
          <div className="space-y-3">
            <button
              onClick={() => setShowPlatforms(!showPlatforms)}
              className="w-full flex items-center justify-between text-sm font-bold text-white"
            >
              <span className="flex items-center gap-2">
                <Rocket className="w-4 h-4 text-[#059669]" />
                <span>مشاريع ومنصات النادي (15)</span>
              </span>
              <ChevronDown
                className={`w-4 h-4 text-zinc-400 transition-transform ${showPlatforms ? "rotate-180" : ""}`}
              />
            </button>
            {showPlatforms && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {DEVELOPER_PLATFORMS.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/10"
                  >
                    <span className="text-xs text-zinc-200 font-medium">{p.name}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                        p.status === "live"
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {p.status === "live" ? "● لايف" : "◐ تطوير"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Contact cards */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#059669]" />
              <span>التواصل المباشر</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DEVELOPER.phones.map((ph) => (
                <a
                  key={ph}
                  href={`tel:${ph}`}
                  className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-emerald-500/40 transition"
                >
                  <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-zinc-400">اتصال / واتساب</div>
                    <div className="text-sm font-bold text-white font-mono" dir="ltr">
                      {ph}
                    </div>
                  </div>
                </a>
              ))}
              <a
                href={`https://wa.me/${DEVELOPER.whatsappInternational}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-emerald-500/40 transition"
              >
                <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs text-zinc-400">واتساب دولي</div>
                  <div className="text-sm font-bold text-white font-mono" dir="ltr">
                    +{DEVELOPER.whatsappInternational}
                  </div>
                </div>
              </a>
              <a
                href={`mailto:${DEVELOPER.email}`}
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-emerald-500/40 transition"
              >
                <div className="p-2 rounded-xl bg-sky-500/15 text-sky-400">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs text-zinc-400">البريد الإلكتروني</div>
                  <div className="text-sm font-bold text-white font-mono" dir="ltr">
                    {DEVELOPER.email}
                  </div>
                </div>
              </a>
              <a
                href={DEVELOPER.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-emerald-500/40 transition sm:col-span-2"
              >
                <div className="p-2 rounded-xl bg-[#D4AF37]/15 text-[#D4AF37]">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs text-zinc-400">الموقع الرسمي — نادي الجينيس</div>
                  <div className="text-sm font-bold text-white font-mono" dir="ltr">
                    {DEVELOPER.website}
                  </div>
                </div>
              </a>
            </div>
          </div>

          {/* Contact / support / collab form */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-[#059669]/10 to-transparent border border-[#059669]/30 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-[#059669]" />
              <span>فورم التواصل — دعم أو تعاون</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {CONTACT_TOPICS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    soundEngine.playTasbihClick();
                    setTopic(t.id);
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition ${
                    topic === t.id
                      ? "bg-[#059669] text-white border-[#059669]"
                      : "bg-white/5 text-zinc-300 border-white/10 hover:border-white/25"
                  }`}
                  title={t.hint}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="اسمك الكريم (اختياري)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/30 border border-white/10 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-[#059669]/60"
            />
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="اكتب رسالتك هنا يا غالي… (دعم فني؟ فكرة تعاون؟ سؤال؟)"
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/30 border border-white/10 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-[#059669]/60 resize-none"
            />
            <button
              onClick={handleSend}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-sm transition active:scale-[0.98]"
            >
              <Send className="w-4 h-4" />
              <span>إرسال عبر واتساب</span>
            </button>
            {sent && (
              <p className="text-xs text-emerald-400 text-center">
                اتفتح واتساب برسالتك — دوس إرسال هناك وتوصلنا بإذن الله ♥
              </p>
            )}
            <p className="text-[10px] text-zinc-500 text-center flex items-center justify-center gap-1">
              <Heart className="w-3 h-3 text-[#D4AF37]" />
              <span>ردنا بيكون فوري بإذن الله — بنجيب من الآخر</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
