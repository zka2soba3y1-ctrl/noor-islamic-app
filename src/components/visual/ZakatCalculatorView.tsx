import React, { useState, useMemo } from "react";
import {
  Coins,
  Calculator,
  Scale,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowDownCircle,
  Sparkles,
} from "lucide-react";
import { soundEngine } from "../../utils/soundEngine";
import { ThemeMode } from "../../types";
import { getThemeStyles } from "../../utils/themeClasses";

interface Props {
  theme?: ThemeMode;
}

export const ZakatCalculatorView: React.FC<Props> = ({ theme = "natural" }) => {
  const styles = getThemeStyles(theme);
  const { isNatural, isPaper, isNight, isLight, isDark } = styles;

  // Asset Inputs
  const [cash, setCash] = useState<number>(0);
  const [gold24k, setGold24k] = useState<number>(0);
  const [gold21k, setGold21k] = useState<number>(0);
  const [gold18k, setGold18k] = useState<number>(0);
  const [silverGrams, setSilverGrams] = useState<number>(0);
  const [inventoryValue, setInventoryValue] = useState<number>(0);
  const [debtsDue, setDebtsDue] = useState<number>(0);

  // Market reference prices (customizable)
  const [goldPricePerGram24k, setGoldPricePerGram24k] = useState<number>(75); // USD approx or local currency unit
  const [silverPricePerGram, setSilverPricePerGram] = useState<number>(0.95);
  const [currencySymbol, setCurrencySymbol] = useState<string>("USD ($)");

  // Calculations based on Islamic Jurisprudence
  const calculations = useMemo(() => {
    // Gold equivalent to 24k:
    // 21k = 21/24 purity (0.875)
    // 18k = 18/24 purity (0.75)
    const equivalentPureGoldGrams =
      gold24k + gold21k * (21 / 24) + gold18k * (18 / 24);

    const goldTotalValue = equivalentPureGoldGrams * goldPricePerGram24k;
    const silverTotalValue = silverGrams * silverPricePerGram;

    const totalGrossAssets =
      cash + goldTotalValue + silverTotalValue + inventoryValue;
    const netZakatableWealth = Math.max(0, totalGrossAssets - debtsDue);

    // Nisab thresholds:
    // Gold Nisab: 85 grams of pure gold
    // Silver Nisab: 595 grams of pure silver
    const goldNisabValue = 85 * goldPricePerGram24k;
    const silverNisabValue = 595 * silverPricePerGram;

    // By standard majority of contemporary scholars, gold nisab is prioritized for paper currencies
    const primaryNisabThreshold = goldNisabValue;
    const isNisabReached = netZakatableWealth >= primaryNisabThreshold;

    // Zakat is 2.5% (1/40th - ربع العشر)
    const zakatDue = isNisabReached ? netZakatableWealth * 0.025 : 0;

    return {
      equivalentPureGoldGrams,
      goldTotalValue,
      silverTotalValue,
      totalGrossAssets,
      netZakatableWealth,
      goldNisabValue,
      silverNisabValue,
      isNisabReached,
      zakatDue,
    };
  }, [
    cash,
    gold24k,
    gold21k,
    gold18k,
    silverGrams,
    inventoryValue,
    debtsDue,
    goldPricePerGram24k,
    silverPricePerGram,
  ]);

  const handleReset = () => {
    soundEngine.playTasbihClick();
    setCash(0);
    setGold24k(0);
    setGold21k(0);
    setGold18k(0);
    setSilverGrams(0);
    setInventoryValue(0);
    setDebtsDue(0);
  };

  return (
    <div id="zakat-calculator-view" className="space-y-4 sm:space-y-6">
      {/* Header Banner */}
      <div className={`rounded-2xl sm:rounded-3xl p-4 sm:p-6 border transition-all ${styles.cardBg} ${styles.cardBorder} ${styles.cardShadow}`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 border ${styles.badgeBg} ${styles.badgeBorder} ${styles.accentText}`}>
              <Coins className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <span className={`text-[10px] uppercase tracking-wider font-mono font-bold block ${styles.accentText}`}>
                Third Pillar of Islam • الركن الثالث
              </span>
              <h2 className={`text-base sm:text-xl font-bold font-alexandria ${styles.titleText}`}>
                حاسبة الزكاة الشرعية الشاملة
              </h2>
              <p className={`text-xs max-w-xl line-clamp-1 sm:line-clamp-none ${styles.mutedText}`}>
                حساب دقيق لزكاة الأموال، الذهب، الفضة، وعروض التجارة بنصاب 85 جرام ذهب خالص.
              </p>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className={`px-4 py-2.5 rounded-2xl border text-right ${styles.innerBg} ${styles.innerBorder}`}>
            <span className={`text-[10px] font-mono uppercase block ${styles.mutedText}`}>
              قيمة النصاب المقدرة
            </span>
            <span className={`text-base sm:text-lg font-bold font-mono ${styles.accentText}`}>
              {calculations.goldNisabValue.toLocaleString()} {currencySymbol}
            </span>
            <span className={`text-[10px] block ${styles.mutedText}`}>
              (85 جرام ذهب خالص)
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left 2 Columns: Input Fields */}
        <div className="lg:col-span-2 space-y-4">
          {/* Price Settings */}
          <div className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border space-y-3 ${styles.cardBg} ${styles.cardBorder}`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold flex items-center gap-1.5 ${styles.titleText}`}>
                <Scale className={`w-4 h-4 ${styles.accentText}`} />
                <span>أسعار الذهب والفضة الحالية (قابلة للتعديل حسب بلدك):</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className={`text-[11px] block mb-1 ${styles.mutedText}`}>
                  سعر جرام الذهب عيار 24:
                </label>
                <input
                  type="number"
                  min="0"
                  value={goldPricePerGram24k}
                  onChange={(e) => setGoldPricePerGram24k(Math.max(0, parseFloat(e.target.value) || 0))}
                  className={`w-full border rounded-xl px-3 py-1.5 text-xs font-mono focus:outline-none ${styles.inputBg} ${styles.inputBorder} ${styles.inputText}`}
                />
              </div>

              <div>
                <label className={`text-[11px] block mb-1 ${styles.mutedText}`}>
                  سعر جرام الفضة:
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.05"
                  value={silverPricePerGram}
                  onChange={(e) => setSilverPricePerGram(Math.max(0, parseFloat(e.target.value) || 0))}
                  className={`w-full border rounded-xl px-3 py-1.5 text-xs font-mono focus:outline-none ${styles.inputBg} ${styles.inputBorder} ${styles.inputText}`}
                />
              </div>

              <div>
                <label className={`text-[11px] block mb-1 ${styles.mutedText}`}>
                  رمز / تسمية العملة:
                </label>
                <input
                  type="text"
                  value={currencySymbol}
                  onChange={(e) => setCurrencySymbol(e.target.value)}
                  className={`w-full border rounded-xl px-3 py-1.5 text-xs focus:outline-none ${styles.inputBg} ${styles.inputBorder} ${styles.inputText}`}
                />
              </div>
            </div>
          </div>

          {/* Section 1: Cash & Savings */}
          <div className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border space-y-2.5 ${styles.cardBg} ${styles.cardBorder}`}>
            <h4 className={`text-xs sm:text-sm font-bold border-b pb-2 font-alexandria ${styles.titleText} ${styles.innerBorder}`}>
              1. الأموال النقدية والمدخرات البنكية
            </h4>
            <div>
              <label className={`text-xs block mb-1 ${styles.mutedText}`}>
                إجمالي السيولة النقدية في اليد وحسابات البنوك والودائع:
              </label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={cash || ""}
                onChange={(e) => setCash(Math.max(0, parseFloat(e.target.value) || 0))}
                className={`w-full border rounded-xl px-3.5 py-2 text-sm font-mono focus:outline-none ${styles.inputBg} ${styles.inputBorder} ${styles.inputText}`}
              />
            </div>
          </div>

          {/* Section 2: Gold & Silver */}
          <div className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border space-y-2.5 ${styles.cardBg} ${styles.cardBorder}`}>
            <h4 className={`text-xs sm:text-sm font-bold border-b pb-2 font-alexandria ${styles.titleText} ${styles.innerBorder}`}>
              2. الذهب والفضة (سبائك أو مدخرات غير الحلي المباح)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className={`text-xs block mb-1 ${styles.mutedText}`}>
                  ذهب عيار 24 (جرام):
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={gold24k || ""}
                  onChange={(e) => setGold24k(Math.max(0, parseFloat(e.target.value) || 0))}
                  className={`w-full border rounded-xl px-3 py-1.5 text-xs font-mono focus:outline-none ${styles.inputBg} ${styles.inputBorder} ${styles.inputText}`}
                />
              </div>

              <div>
                <label className={`text-xs block mb-1 ${styles.mutedText}`}>
                  ذهب عيار 21 (جرام):
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={gold21k || ""}
                  onChange={(e) => setGold21k(Math.max(0, parseFloat(e.target.value) || 0))}
                  className={`w-full border rounded-xl px-3 py-1.5 text-xs font-mono focus:outline-none ${styles.inputBg} ${styles.inputBorder} ${styles.inputText}`}
                />
              </div>

              <div>
                <label className={`text-xs block mb-1 ${styles.mutedText}`}>
                  ذهب عيار 18 (جرام):
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={gold18k || ""}
                  onChange={(e) => setGold18k(Math.max(0, parseFloat(e.target.value) || 0))}
                  className={`w-full border rounded-xl px-3 py-1.5 text-xs font-mono focus:outline-none ${styles.inputBg} ${styles.inputBorder} ${styles.inputText}`}
                />
              </div>
            </div>

            <div>
              <label className={`text-xs block mb-1 ${styles.mutedText}`}>
                الفضة بجميع أشكالها (بالجرام):
              </label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={silverGrams || ""}
                onChange={(e) => setSilverGrams(Math.max(0, parseFloat(e.target.value) || 0))}
                className={`w-full border rounded-xl px-3 py-1.5 text-xs font-mono focus:outline-none ${styles.inputBg} ${styles.inputBorder} ${styles.inputText}`}
              />
            </div>
          </div>

          {/* Section 3: Trade Goods & Deductible Debts */}
          <div className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border space-y-2.5 ${styles.cardBg} ${styles.cardBorder}`}>
            <h4 className={`text-xs sm:text-sm font-bold border-b pb-2 font-alexandria ${styles.titleText} ${styles.innerBorder}`}>
              3. عروض التجارة والديون
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className={`text-xs block mb-1 ${styles.mutedText}`}>
                  قيمة بضائع التجارة بسعر السوق الحالي:
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={inventoryValue || ""}
                  onChange={(e) => setInventoryValue(Math.max(0, parseFloat(e.target.value) || 0))}
                  className={`w-full border rounded-xl px-3 py-1.5 text-xs font-mono focus:outline-none ${styles.inputBg} ${styles.inputBorder} ${styles.inputText}`}
                />
              </div>

              <div>
                <label className={`text-xs block mb-1 ${styles.mutedText}`}>
                  الديون الحالة العاجلة الواجب سدادها (تُخصم):
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={debtsDue || ""}
                  onChange={(e) => setDebtsDue(Math.max(0, parseFloat(e.target.value) || 0))}
                  className={`w-full border rounded-xl px-3 py-1.5 text-xs font-mono focus:outline-none ${styles.inputBg} ${styles.inputBorder} ${styles.inputText}`}
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleReset}
            className={`px-3.5 py-1.5 rounded-xl border text-xs transition ${styles.btnSecondary}`}
          >
            تصفير كافة الحقول
          </button>
        </div>

        {/* Right 1 Column: Summary & Result Card */}
        <div className="space-y-4">
          <div className={`p-5 sm:p-6 rounded-2xl sm:rounded-3xl border space-y-4 ${styles.cardBg} ${styles.cardBorder} ${styles.cardShadow}`}>
            <h4 className={`font-bold text-sm sm:text-base border-b pb-2.5 flex items-center gap-2 font-alexandria ${styles.titleText} ${styles.innerBorder}`}>
              <Calculator className={`w-4 h-4 ${styles.accentText}`} />
              <span>خلاصة الحساب الشرعي</span>
            </h4>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className={styles.mutedText}>إجمالي الأصول المقومة:</span>
                <span className={`font-mono font-bold ${styles.titleText}`}>
                  {calculations.totalGrossAssets.toLocaleString()} {currencySymbol}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className={styles.mutedText}>الديون المخصومة:</span>
                <span className="font-mono text-rose-500 font-bold">
                  - {debtsDue.toLocaleString()} {currencySymbol}
                </span>
              </div>

              <div className={`border-t pt-2 flex items-center justify-between ${styles.innerBorder}`}>
                <span className={`font-bold ${styles.titleText}`}>الوعاء الزكوي الصافي:</span>
                <span className={`font-mono font-bold text-sm ${styles.accentText}`}>
                  {calculations.netZakatableWealth.toLocaleString()} {currencySymbol}
                </span>
              </div>

              <div className="flex items-center justify-between pt-0.5">
                <span className={styles.mutedText}>حد النصاب المطلوب (85g ذهب):</span>
                <span className={`font-mono text-xs ${styles.mutedText}`}>
                  {calculations.goldNisabValue.toLocaleString()} {currencySymbol}
                </span>
              </div>
            </div>

            {/* Nisab Status Alert */}
            <div
              className={`p-3.5 rounded-2xl border text-xs leading-relaxed space-y-1 ${
                calculations.isNisabReached
                  ? isPaper
                    ? "bg-[#EFE5D3] border-[#8C5E24]/30 text-[#4A3215]"
                    : isNight
                    ? "bg-sky-950/40 border-sky-500/30 text-sky-200"
                    : "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                  : isPaper
                  ? "bg-[#F7EFE1] border-[#C9B38F]/40 text-[#614725]"
                  : isNight
                  ? "bg-amber-950/30 border-amber-500/30 text-amber-200"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300"
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold">
                {calculations.isNisabReached ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>بلغ المال النصاب الشرعي</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>لم يبلغ المال النصاب الشرعي بعد</span>
                  </>
                )}
              </div>
              <p className="text-[11px] leading-relaxed opacity-90">
                {calculations.isNisabReached
                  ? "إذا حال على هذا المال الحول الهجري الكامل وهو فائض عن الحاجات الأساسية، فالزكاة واجبة بنسبة 2.5%."
                  : "لا تجب الزكاة لكونه أقل من النصاب الشرعي (85 جراماً من الذهب الخالص)، وتُستحب الصدقة التطوعية."}
              </p>
            </div>

            {/* Final Due Amount Card */}
            <div className={`p-4 sm:p-5 rounded-2xl border text-center space-y-1 ${styles.innerBg} ${styles.innerBorder}`}>
              <span className={`text-[10px] uppercase font-mono tracking-wider block font-bold ${styles.accentText}`}>
                مقدار الزكاة الواجب إخراجها (2.5%)
              </span>
              <div className={`text-2xl sm:text-3xl font-mono font-black tracking-tight ${styles.titleText}`}>
                {calculations.zakatDue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </div>
              <span className={`text-xs font-mono ${styles.mutedText}`}>
                {currencySymbol}
              </span>
            </div>
          </div>

          {/* Quranic Recipients Box */}
          <div className={`p-4 rounded-2xl border space-y-1.5 text-xs ${styles.cardBg} ${styles.cardBorder}`}>
            <span className={`font-bold block ${styles.titleText}`}>مصارف الزكاة الثمانية بنص القرآن:</span>
            <p className={`font-['Amiri',serif] text-xs sm:text-sm leading-relaxed ${styles.accentText}`}>
              ﴿إِنَّمَا الصَّدَقَاتُ لِلْفُقَرَاءِ وَالْمَسَاكِينِ وَالْعَامِلِينَ عَلَيْهَا وَالْمُؤَلَّفَةِ قُلُوبُهُمْ وَفِي الرِّقَابِ وَالْغَارِمِينَ وَفِي سَبِيلِ اللَّهِ وَابْنِ السَّبِيلِ فَرِيضَةً مِّنَ اللَّهِ وَاللَّهُ عَلِيمٌ حَكِيمٌ﴾
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
