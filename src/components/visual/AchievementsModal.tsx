import React, { useState, useEffect } from "react";
import {
  X,
  Award,
  Flame,
  Star,
  BookOpen,
  CheckCircle2,
  Lock,
  Sparkles,
  Share2,
  TrendingUp,
  Volume2,
} from "lucide-react";
import { achievementsService, UserSpiritualProfile, IslamicBadge } from "../../utils/achievementsService";
import { i18n } from "../../utils/i18n";
import { soundEngine } from "../../utils/soundEngine";
import { speechEngine } from "../../utils/speechEngine";
import { hapticEngine } from "../../utils/hapticEngine";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AchievementsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [profile, setProfile] = useState<UserSpiritualProfile>(() => achievementsService.getProfile());
  const [activeTab, setActiveTab] = useState<"all" | "quran" | "prayer" | "athkar" | "qiyam">("all");
  const [claimedBadgeId, setClaimedBadgeId] = useState<string | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setProfile(achievementsService.getProfile());
    };
    window.addEventListener("noor-achievements-updated", handleUpdate);
    window.addEventListener("noor-badge-unlocked", handleUpdate);
    return () => {
      window.removeEventListener("noor-achievements-updated", handleUpdate);
      window.removeEventListener("noor-badge-unlocked", handleUpdate);
    };
  }, []);

  if (!isOpen) return null;

  const currentLang = i18n.getLanguage();

  const filteredBadges =
    activeTab === "all"
      ? profile.badges
      : profile.badges.filter((b) => b.category === activeTab);

  const unlockedCount = profile.badges.filter((b) => b.isUnlocked).length;
  const progressPercent = Math.round((unlockedCount / profile.badges.length) * 100);

  const handleShareAchievements = () => {
    soundEngine.playTasbihClick();
    const text = `🌟 رتبتي في تطبيق النور: ${profile.levelTitle[currentLang] || profile.levelTitle.ar} | رصيد الحسنات: ${profile.totalHasanat.toLocaleString()} | أوسمة محققة: ${unlockedCount}/${profile.badges.length}`;
    if (navigator.share) {
      navigator.share({ title: "إنجازاتي في تطبيق النور", text });
    } else {
      navigator.clipboard?.writeText(text);
      speechEngine.speak("تم نسخ بطاقة إنجازاتك الروحانية للمشاركة");
    }
  };

  const handleClaimCelebration = (badge: IslamicBadge) => {
    soundEngine.playLevelUpChime();
    hapticEngine.trigger("quran_memorized_success");
    setClaimedBadgeId(badge.id);
    speechEngine.speak(
      `مبارك! وسام: ${badge.title[currentLang] || badge.title.ar}. بارك الله في عبادتك وسعيك.`
    );
    setTimeout(() => setClaimedBadgeId(null), 3000);
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "diamond":
        return "border-cyan-500/40 bg-cyan-500/10 text-cyan-400";
      case "gold":
        return "border-amber-500/40 bg-amber-500/10 text-amber-400";
      case "silver":
        return "border-slate-400/40 bg-slate-400/10 text-slate-300";
      default:
        return "border-emerald-600/40 bg-emerald-600/10 text-emerald-400";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-[#121214] border border-white/10 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>{i18n.t("achievements.title")}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {i18n.t("common.level")} {profile.level}
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                {profile.levelTitle[currentLang] || profile.levelTitle.ar}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareAchievements}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 transition"
              title={i18n.t("common.share")}
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* User Spiritual Score Summary Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-zinc-900 to-amber-950/30 border border-emerald-500/20 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  {i18n.t("common.points")}
                </span>
                <div className="text-3xl font-extrabold text-white flex items-center gap-2 mt-1">
                  <span>+{profile.totalHasanat.toLocaleString()}</span>
                  <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                </div>
              </div>

              {/* Stats Counters Grid */}
              <div className="flex items-center gap-3 text-center">
                <div className="px-3.5 py-2 rounded-2xl bg-white/5 border border-white/10">
                  <div className="text-amber-400 font-extrabold text-base flex items-center justify-center gap-1">
                    <Flame className="w-4 h-4" />
                    <span>{profile.prayerStreak}</span>
                  </div>
                  <span className="text-[10px] text-zinc-400">أيام الصلاة</span>
                </div>

                <div className="px-3.5 py-2 rounded-2xl bg-white/5 border border-white/10">
                  <div className="text-emerald-400 font-extrabold text-base flex items-center justify-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    <span>{profile.juzReadCount}/30</span>
                  </div>
                  <span className="text-[10px] text-zinc-400">أجزاء القرآن</span>
                </div>

                <div className="px-3.5 py-2 rounded-2xl bg-white/5 border border-white/10">
                  <div className="text-cyan-400 font-extrabold text-base flex items-center justify-center gap-1">
                    <Star className="w-4 h-4" />
                    <span>{profile.tasbihTotalCount}</span>
                  </div>
                  <span className="text-[10px] text-zinc-400">تسابيح</span>
                </div>
              </div>
            </div>

            {/* Overall Badges Progress Bar */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex justify-between items-center text-xs text-zinc-300 mb-1.5 font-medium">
                <span>نسبة الأوسمة المكتملة ({unlockedCount}/{profile.badges.length})</span>
                <span className="font-bold text-amber-400">{progressPercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-amber-500 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/5 border border-white/10 overflow-x-auto text-xs">
            <button
              onClick={() => {
                soundEngine.playTasbihClick();
                setActiveTab("all");
              }}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-bold transition ${
                activeTab === "all"
                  ? "bg-amber-500 text-black shadow-md"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              الكل ({profile.badges.length})
            </button>
            <button
              onClick={() => {
                soundEngine.playTasbihClick();
                setActiveTab("quran");
              }}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-bold transition ${
                activeTab === "quran"
                  ? "bg-amber-500 text-black shadow-md"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              القرآن الكريم
            </button>
            <button
              onClick={() => {
                soundEngine.playTasbihClick();
                setActiveTab("prayer");
              }}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-bold transition ${
                activeTab === "prayer"
                  ? "bg-amber-500 text-black shadow-md"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              الصلوات الخمس
            </button>
            <button
              onClick={() => {
                soundEngine.playTasbihClick();
                setActiveTab("athkar");
              }}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-bold transition ${
                activeTab === "athkar"
                  ? "bg-amber-500 text-black shadow-md"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              الأذكار والتسبيح
            </button>
            <button
              onClick={() => {
                soundEngine.playTasbihClick();
                setActiveTab("qiyam");
              }}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-bold transition ${
                activeTab === "qiyam"
                  ? "bg-amber-500 text-black shadow-md"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              قيام الليل
            </button>
          </div>

          {/* Badges Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredBadges.map((badge) => {
              const isUnlocked = badge.isUnlocked;
              const isJustClaimed = claimedBadgeId === badge.id;
              const title = badge.title[currentLang] || badge.title.ar;
              const desc = badge.description[currentLang] || badge.description.ar;
              const pct = Math.min(100, Math.round((badge.currentProgress / badge.target) * 100));

              return (
                <div
                  key={badge.id}
                  className={`p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                    isUnlocked
                      ? "bg-white/[0.04] border-white/15 hover:border-amber-500/40"
                      : "bg-white/[0.01] border-white/5 opacity-70"
                  } ${isJustClaimed ? "ring-2 ring-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.3)] scale-[1.02]" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`text-2xl w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 ${getTierColor(
                        badge.tier
                      )}`}
                    >
                      {badge.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-bold text-sm text-white truncate">{title}</h4>
                        {isUnlocked ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed line-clamp-2">
                        {desc}
                      </p>
                    </div>
                  </div>

                  {/* Progress & Reward Footer */}
                  <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-zinc-400">
                      <span>التقدم:</span>
                      <span className="font-bold text-white">
                        {badge.currentProgress}/{badge.target}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>+{badge.hasanatReward}</span>
                      </span>

                      {isUnlocked && (
                        <button
                          onClick={() => handleClaimCelebration(badge)}
                          className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-[10px] font-bold transition"
                        >
                          احتفال
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar for Locked Badges */}
                  {!isUnlocked && (
                    <div className="w-full h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500/60"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between bg-white/[0.02]">
          <span className="text-xs text-zinc-400">
            «أحب الأعمال إلى الله أدومها وإن قل»
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition"
          >
            {i18n.t("common.close")}
          </button>
        </div>
      </div>
    </div>
  );
};
