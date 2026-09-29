import React from "react";
import {
  ShieldCheck,
  ExternalLink,
  BookCheck,
  Database,
  Lock,
  HeartHandshake,
  X,
} from "lucide-react";
import { soundEngine } from "../../utils/soundEngine";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SourcesAndLicensesModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      id="sources-licenses-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md"
    >
      <div className="glass-panel w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 p-6 sm:p-8 space-y-6 bg-[#0E0E11] text-right">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#059669]/15 border border-[#059669]/30 flex items-center justify-center text-[#059669] shadow-[0_0_15px_rgba(5,150,105,0.3)]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-[#059669] block font-bold">
                Scholarly Verification & API Transparency
              </span>
              <h3 className="text-xl font-bold text-white font-['Amiri',serif]">
                المصادر، التراخيص، والاعتماد العلمي والتقني
              </h3>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playTasbihClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Core Principles */}
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200 leading-relaxed space-y-1">
          <div className="flex items-center gap-2 font-bold text-emerald-300">
            <HeartHandshake className="w-4 h-4" />
            <span>مبادئ الوقف والشفافية (تطبيق النور العالمي)</span>
          </div>
          <p>
            تطبيق ومحرك النور وقف إسلامي تقني خالص لوجه الله تعالى، خلو تام من الإعلانات التجارية، صفر تتبع للبيانات الشخصية أو بيعها، ويعتمد مبدأ المصداقية والاعتمادية دون جعل أي خدمة خارجية نقطة فشل وحيدة.
          </p>
        </div>

        {/* API Catalog Breakdown */}
        <div className="space-y-4">
          <h4 className="font-bold text-sm text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-[#059669]" />
            <span>توثيق الواجهات البرمجية والمصادر المعتمدة:</span>
          </h4>

          <div className="space-y-3 text-xs">
            {/* 1. MP3Quran */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">1. شبكة MP3Quran API v3 الرسمية</span>
                <a
                  href="https://www.mp3quran.net/ar/api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-[#059669] hover:underline inline-flex items-center gap-1 font-mono"
                >
                  mp3quran.net/api <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-zinc-400 leading-relaxed">
                <strong>الاستخدام:</strong> تزويد التطبيق بكتالوج القراء المعتمدين، روابط التلاوات بروايات متعددة (حفص، ورش، قالون)، الإذاعات المباشرة، والتفاسير. يتم التخزين المؤقت للبيانات الوصفية لتجنب الحمل الزائد.
              </p>
            </div>

            {/* 2. AlQuran.cloud & QuranEnc */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">2. AlQuran.cloud & QuranEnc API</span>
                <a
                  href="https://alquran.cloud/api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-[#059669] hover:underline inline-flex items-center gap-1 font-mono"
                >
                  alquran.cloud <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-zinc-400 leading-relaxed">
                <strong>الاستخدام:</strong> النصوص القرآنية بالرسم العثماني المعتمد من مجمع الملك فهد لطباعة المصحف الشريف، وفهرس الـ 604 صفحات والـ 30 جزءاً، وترجمات معاني القرآن العالمية (الإنجليزية، الفرنسية، الأردية، الإندونيسية).
              </p>
            </div>

            {/* 3. AlAdhan & PrayTimes */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">3. AlAdhan API ومكتبات الحساب الفلكي المحلي</span>
                <a
                  href="https://aladhan.com/prayer-times-api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-[#059669] hover:underline inline-flex items-center gap-1 font-mono"
                >
                  aladhan.com <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-zinc-400 leading-relaxed">
                <strong>الاستخدام:</strong> حساب مواقيت الصلاة، زوايا الفجر والعشاء لمختلف الهيئات الفقهية (أم القرى، رابطة العالم الإسلامي، هيئة المساحة المصرية، إسنا)، وحساب اتجاه القبلة والتقويم الهجري مع معالج فلكي محلي يعمل 100% دون إنترنت.
              </p>
            </div>

            {/* 4. Sunnah & Hadith API */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">4. Sunnah.com & Hadith Data Providers</span>
                <a
                  href="https://sunnah.com/developers"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-[#059669] hover:underline inline-flex items-center gap-1 font-mono"
                >
                  sunnah.com <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-zinc-400 leading-relaxed">
                <strong>الاستخدام:</strong> متون الأحاديث النبوية الشريفة من صحيح البخاري وصحيح مسلم ورياض الصالحين والأربعين النووية مع التخريج والدرجة العلمية المعتمدة وتراجم الرواة.
              </p>
            </div>

            {/* 5. OpenStreetMap */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">5. OpenStreetMap (Nominatim / Overpass)</span>
                <a
                  href="https://www.openstreetmap.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-[#059669] hover:underline inline-flex items-center gap-1 font-mono"
                >
                  openstreetmap.org <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-zinc-400 leading-relaxed">
                <strong>الاستخدام:</strong> تحديد مواقع المساجد والجوامع وبيانات الملاحة الجغرافية وفق شروط ترخيص ODbL مع نسبة البيانات لمجتمع OpenStreetMap.
              </p>
            </div>
          </div>
        </div>

        {/* Scholarly Responsibility */}
        <div className="p-4 rounded-2xl bg-black/50 border border-white/10 text-xs text-zinc-400 leading-relaxed space-y-2">
          <span className="font-bold text-white flex items-center gap-2">
            <BookCheck className="w-4 h-4 text-amber-400" />
            <span>تنبيه أمانة شرعية وفقهية:</span>
          </span>
          <p>
            تمت مراجعة النصوص والأذكار والصيغ بدقة بالغة. التطبيق لا يُصدر فتاوى مستقلة في المسائل الخلافية ولا يعتمد على مخرجات الذكاء الاصطناعي دون مصادر معتمدة، بل يحيل المستفتي دائماً لأهل الذكر والهيئات العلمية الرسمية في العالم الإسلامي.
          </p>
        </div>

        {/* Footer Close Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={() => {
              soundEngine.playTasbihClick();
              onClose();
            }}
            className="px-6 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs transition"
          >
            إغلاق نافذة التراخيص
          </button>
        </div>
      </div>
    </div>
  );
};
