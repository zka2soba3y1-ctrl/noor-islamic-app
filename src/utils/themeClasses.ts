import { ThemeMode } from "../types";

export interface ThemeClasses {
  isNatural: boolean;
  isPaper: boolean;
  isNight: boolean;
  isLight: boolean;
  isDark: boolean;

  // Backgrounds & Panels
  pageBg: string;
  cardBg: string;
  cardBorder: string;
  cardShadow: string;
  innerBg: string;
  innerBorder: string;

  // Typography
  titleText: string;
  bodyText: string;
  mutedText: string;
  accentText: string;
  accentBg: string;

  // Badges & Pills
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;

  // Buttons
  btnPrimary: string;
  btnSecondary: string;

  // Inputs
  inputBg: string;
  inputBorder: string;
  inputText: string;
}

export function getThemeStyles(theme: ThemeMode | string = "natural"): ThemeClasses {
  const isNatural = theme === "natural";
  const isPaper = theme === "paper";
  const isNight = theme === "night";
  const isLight = theme === "light";
  const isDark = isNatural || isNight;

  if (isPaper) {
    return {
      isNatural,
      isPaper,
      isNight,
      isLight,
      isDark,
      pageBg: "bg-[#F7EFE1]",
      cardBg: "bg-[#FFFDF9]",
      cardBorder: "border-[#D6C5A9]",
      cardShadow: "shadow-xs",
      innerBg: "bg-[#FAF5EB]",
      innerBorder: "border-[#E2D4BF]",
      titleText: "text-[#2F1E12]",
      bodyText: "text-[#4A3320]",
      mutedText: "text-[#7A5F4C]",
      accentText: "text-[#8C5E24]",
      accentBg: "bg-[#8C5E24]",
      badgeBg: "bg-[#FAF5EB]",
      badgeText: "text-[#5C3D1E]",
      badgeBorder: "border-[#D6C5A9]",
      btnPrimary: "bg-[#8C5E24] hover:bg-[#724B1B] text-white shadow-xs",
      btnSecondary: "bg-[#FAF5EB] hover:bg-[#F2E5D0] text-[#4A3320] border border-[#D6C5A9]",
      inputBg: "bg-[#FAF5EB]",
      inputBorder: "border-[#D6C5A9]",
      inputText: "text-[#2F1E12]",
    };
  }

  if (isLight) {
    return {
      isNatural,
      isPaper,
      isNight,
      isLight,
      isDark,
      pageBg: "bg-[#F2F8F5]",
      cardBg: "bg-white/95",
      cardBorder: "border-emerald-500/25",
      cardShadow: "shadow-sm shadow-emerald-950/5",
      innerBg: "bg-emerald-500/5",
      innerBorder: "border-emerald-500/20",
      titleText: "text-emerald-950",
      bodyText: "text-emerald-900/90",
      mutedText: "text-emerald-800/70",
      accentText: "text-emerald-600",
      accentBg: "bg-emerald-600",
      badgeBg: "bg-emerald-500/10",
      badgeText: "text-emerald-800",
      badgeBorder: "border-emerald-500/30",
      btnPrimary: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs",
      btnSecondary: "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-900 border border-emerald-500/25 shadow-2xs",
      inputBg: "bg-emerald-500/5",
      inputBorder: "border-emerald-500/25",
      inputText: "text-emerald-950",
    };
  }

  if (isNight) {
    return {
      isNatural,
      isPaper,
      isNight,
      isLight,
      isDark,
      pageBg: "bg-[#070A0F]",
      cardBg: "bg-[#0A0F17]",
      cardBorder: "border-slate-800",
      cardShadow: "shadow-md shadow-black/40",
      innerBg: "bg-[#05080C]",
      innerBorder: "border-slate-800/80",
      titleText: "text-slate-100",
      bodyText: "text-slate-300",
      mutedText: "text-slate-400",
      accentText: "text-sky-400",
      accentBg: "bg-sky-500",
      badgeBg: "bg-sky-950/40",
      badgeText: "text-sky-300",
      badgeBorder: "border-sky-500/30",
      btnPrimary: "bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold shadow-xs",
      btnSecondary: "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800",
      inputBg: "bg-[#05080C]",
      inputBorder: "border-slate-800",
      inputText: "text-slate-100",
    };
  }

  // Default: natural
  return {
    isNatural: true,
    isPaper: false,
    isNight: false,
    isLight: false,
    isDark: true,
    pageBg: "bg-[#06140F]",
    cardBg: "bg-[#0A2017]",
    cardBorder: "border-emerald-500/30",
    cardShadow: "shadow-md shadow-black/40",
    innerBg: "bg-[#040E0A]",
    innerBorder: "border-emerald-500/20",
    titleText: "text-emerald-50",
    bodyText: "text-slate-200",
    mutedText: "text-emerald-200/70",
    accentText: "text-emerald-400",
    accentBg: "bg-emerald-500",
    badgeBg: "bg-emerald-950/60",
    badgeText: "text-emerald-300",
    badgeBorder: "border-emerald-500/40",
    btnPrimary: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs",
    btnSecondary: "bg-[#06140F] hover:bg-emerald-950/60 text-emerald-100 border border-emerald-500/30",
    inputBg: "bg-[#040E0A]",
    inputBorder: "border-emerald-500/30",
    inputText: "text-emerald-50",
  };
}
