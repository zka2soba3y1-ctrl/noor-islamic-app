import React, { useState, useEffect, useRef } from "react";
import {
  Compass,
  MapPin,
  Sparkles,
  Navigation,
  RotateCw,
  CheckCircle2,
  ShieldCheck,
  Volume2,
  VolumeX,
  Smartphone,
  Sliders,
  Bell,
  Check,
} from "lucide-react";
import { soundEngine } from "../../utils/soundEngine";
import { speechEngine } from "../../utils/speechEngine";
import { hapticEngine } from "../../utils/hapticEngine";
import { i18n } from "../../utils/i18n";
import { ThemeMode } from "../../types";
import { getThemeStyles } from "../../utils/themeClasses";

interface Props {
  qiblaBearing: number;
  cityName: string;
  userLat?: number;
  userLng?: number;
  theme?: ThemeMode;
}

// Kaaba Coordinates in Makkah Al-Mukarramah
const KAABA_LAT = 21.422487;
const KAABA_LNG = 39.826206;

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export const QiblaCompassView: React.FC<Props> = ({
  qiblaBearing,
  cityName,
  userLat = 30.0444,
  userLng = 31.2357,
  theme = "natural",
}) => {
  const styles = getThemeStyles(theme);
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [hasSensor, setHasSensor] = useState<boolean>(false);
  const [permissionRequested, setPermissionRequested] = useState<boolean>(false);
  const [isAligned, setIsAligned] = useState<boolean>(false);
  const [audioAlertEnabled, setAudioAlertEnabled] = useState<boolean>(true);
  const [isManualMode, setIsManualMode] = useState<boolean>(false);
  const [manualSliderValue, setManualSliderValue] = useState<number>(0);

  const playedChimeRef = useRef<boolean>(false);
  const lastSpokenRef = useRef<number>(0);

  const distanceToKaaba = calculateDistanceKm(userLat, userLng, KAABA_LAT, KAABA_LNG);

  // Setup real hardware motion sensor (gyroscope / magnetometer)
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (isManualMode) return;
      let heading = 0;
      if ((e as any).webkitCompassHeading !== undefined) {
        // iOS Safari provides direct magnetic/true heading
        heading = (e as any).webkitCompassHeading;
        setHasSensor(true);
      } else if (e.alpha !== null) {
        // Android / Chrome compass orientation
        heading = 360 - e.alpha;
        setHasSensor(true);
      }
      const rounded = Math.round(heading) % 360;
      setDeviceHeading(rounded);
    };

    if (typeof window !== "undefined" && window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientationabsolute" as any, handleOrientation, true);
      window.addEventListener("deviceorientation", handleOrientation, true);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("deviceorientationabsolute" as any, handleOrientation, true);
        window.removeEventListener("deviceorientation", handleOrientation, true);
      }
    };
  }, [isManualMode]);

  // Request iOS Sensor Permission
  const requestSensorPermission = async () => {
    soundEngine.playTasbihClick();
    if (
      typeof (DeviceOrientationEvent as any) !== "undefined" &&
      typeof (DeviceOrientationEvent as any).requestPermission === "function"
    ) {
      try {
        const response = await (DeviceOrientationEvent as any).requestPermission();
        if (response === "granted") {
          setPermissionRequested(true);
          setHasSensor(true);
        }
      } catch (err) {
        console.warn("Sensor permission error:", err);
      }
    } else {
      setPermissionRequested(true);
    }
  };

  // Check alignment & trigger soft chime + gentle haptic vibration
  useEffect(() => {
    const diff = Math.abs(deviceHeading - qiblaBearing);
    const normalizedDiff = Math.min(diff, 360 - diff);
    const aligned = normalizedDiff <= 4;
    setIsAligned(aligned);

    if (aligned) {
      if (!playedChimeRef.current) {
        if (audioAlertEnabled) {
          // Play dedicated harmonic chord chime
          soundEngine.playQiblaLocked();

          // Trigger tactile haptic pattern for the blind user
          hapticEngine.trigger("qibla_aligned");

          // Soft voice confirmation throttled by 15 seconds
          const now = Date.now();
          if (now - lastSpokenRef.current > 15000) {
            speechEngine.speak("تمت المحاذاة مع اتجاه الكعبة المشرفة");
            lastSpokenRef.current = now;
          }
        }
        playedChimeRef.current = true;
      }
    } else {
      playedChimeRef.current = false;
    }
  }, [deviceHeading, qiblaBearing, audioAlertEnabled]);

  // Handle manual rotation slider
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setManualSliderValue(val);
    setDeviceHeading(val);
  };

  // Angle difference towards Kaaba
  const angleDiff = Math.min(
    Math.abs(deviceHeading - qiblaBearing),
    360 - Math.abs(deviceHeading - qiblaBearing)
  );

  // Relative rotation of Kaaba vector on compass dial
  const kaabaRotation = (qiblaBearing - deviceHeading + 360) % 360;

  return (
    <div id="qibla-compass-view" className="space-y-4 sm:space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div
        className={`rounded-2xl sm:rounded-3xl p-5 sm:p-7 border transition-all ${
          styles.cardBg
        } ${styles.cardBorder} ${styles.cardShadow}`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 border ${
                styles.badgeBg
              } ${styles.badgeBorder} ${styles.accentText}`}
            >
              <Compass className="w-6 h-6 animate-spin-slow" />
            </div>
            <div className="space-y-1">
              <span className={`text-[10px] uppercase font-mono font-bold tracking-wider block ${styles.accentText}`}>
                بوصلة القبلة الفلكية الرقمية التفاعلية
              </span>
              <h2 className={`text-lg sm:text-2xl font-bold font-alexandria ${styles.titleText}`}>
                اتجاه القبلة ومحاذاة الكعبة المشرفة
              </h2>
              <p className={`text-xs max-w-xl leading-relaxed ${styles.mutedText}`}>
                تعتمد على مستشعرات الجوال والحسابات الفلكية الدقيقة مع تنبيه صوتي واهتزاز خفيف عند المحاذاة.
              </p>
            </div>
          </div>

          {/* City, Audio Toggle, and Voice Readout */}
          <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto justify-end">
            <button
              onClick={() => {
                soundEngine.playTasbihClick();
                const guidance = isAligned
                  ? "أنت الآن متجه للكعبة المشرفة تماماً، تقبل الله صلاتك."
                  : `أدر هاتفك بمقدار ${angleDiff} درجة للوصول لاتجاه الكعبة.`;
                speechEngine.speakEgyptian(
                  `اتجاه القبلة في ${cityName} هو ${qiblaBearing} درجة. اتجاهك الحالي ${deviceHeading} درجة. ${guidance}`
                );
              }}
              className="px-3 py-1.5 rounded-2xl border text-xs font-bold transition flex items-center gap-1.5 bg-[#D4AF37]/15 border-[#D4AF37]/35 text-[#D4AF37] hover:bg-[#D4AF37]/25"
              title="نطق اتجاه القبلة والزاوية الحالية صوتياً"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>نطق التوجيه</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playTasbihClick();
                setAudioAlertEnabled(!audioAlertEnabled);
              }}
              className={`px-3 py-1.5 rounded-2xl border text-xs font-bold transition flex items-center gap-1.5 ${
                audioAlertEnabled
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                  : `${styles.innerBg} ${styles.innerBorder} ${styles.mutedText}`
              }`}
              title={audioAlertEnabled ? "التنبيه الصوتي مفعل" : "التنبيه الصوتي معطل"}
            >
              {audioAlertEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{audioAlertEnabled ? "التنبيه نشط" : "كتم"}</span>
            </button>

            <div className={`px-3 py-1.5 rounded-2xl border text-xs font-bold font-mono ${styles.innerBg} ${styles.innerBorder}`}>
              <MapPin className="w-3.5 h-3.5 inline-block ml-1 text-emerald-500" />
              <span>{cityName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Compass Stage */}
      <div
        className={`rounded-3xl p-6 sm:p-10 text-center space-y-6 border shadow-xl relative overflow-hidden ${
          styles.cardBg
        } ${styles.cardBorder}`}
      >
        {/* Alignment State Pill */}
        <div className="flex justify-center">
          {isAligned ? (
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-500 text-white font-black font-alexandria text-xs sm:text-sm shadow-[0_0_25px_rgba(16,185,129,0.55)] animate-pulse">
              <CheckCircle2 className="w-4 h-4" />
              <span>أنت الآن في الاتجاه الصحيح للقبلة تماماً 🕋</span>
            </div>
          ) : (
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold font-mono ${styles.innerBg} ${styles.innerBorder}`}>
              <span>زاوية القبلة: {qiblaBearing}° • الفارق الحالي: {angleDiff}°</span>
            </div>
          )}
        </div>

        {/* 3D Compass Dial */}
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 mx-auto flex items-center justify-center">
          {/* Compass Outer Ring */}
          <div
            className={`absolute inset-0 rounded-full border-4 shadow-inner flex items-center justify-center transition-transform duration-300 ${
              isAligned
                ? "border-emerald-500 ring-4 ring-emerald-500/20 bg-emerald-500/10"
                : styles.isNight
                ? "border-slate-800 bg-[#070A0F]"
                : styles.isPaper
                ? "border-[#D6C5A9] bg-[#F7EFE1]"
                : "border-emerald-500/30 bg-emerald-500/5"
            }`}
            style={{ transform: `rotate(${-deviceHeading}deg)` }}
          >
            {/* Cardinal Directions */}
            <span className="absolute top-2.5 text-xs font-mono font-bold text-red-500">N (شمال)</span>
            <span className="absolute bottom-2.5 text-xs font-mono font-bold text-slate-400">S (جنوب)</span>
            <span className="absolute right-3 text-xs font-mono font-bold text-slate-400">E (شرق)</span>
            <span className="absolute left-3 text-xs font-mono font-bold text-slate-400">W (غرب)</span>

            {/* Inner Ring */}
            <div className="w-44 h-44 sm:w-56 sm:h-56 rounded-full border border-dashed border-slate-300 dark:border-slate-700" />
          </div>

          {/* Kaaba Alignment Ray / Glowing Beam */}
          {isAligned && (
            <div
              className="absolute inset-0 rounded-full pointer-events-none flex items-center justify-center"
              style={{ transform: `rotate(${kaabaRotation}deg)` }}
            >
              <div className="w-1 h-36 sm:h-44 bg-gradient-to-t from-emerald-500 to-transparent shadow-[0_0_15px_#10b981] animate-pulse" />
            </div>
          )}

          {/* Kaaba Indicator Vector */}
          <div
            className="absolute inset-2 sm:inset-4 rounded-full flex items-center justify-center transition-transform duration-300 ease-out pointer-events-none"
            style={{ transform: `rotate(${kaabaRotation}deg)` }}
          >
            <div className="absolute -top-3 sm:-top-4 flex flex-col items-center">
              <div
                className={`w-11 h-11 sm:w-13 sm:h-13 rounded-2xl text-white font-bold flex items-center justify-center shadow-xl border-2 transition-all ${
                  isAligned
                    ? "bg-gradient-to-tr from-emerald-500 to-teal-400 border-white scale-110 shadow-[0_0_20px_#10b981]"
                    : "bg-gradient-to-tr from-[#D4AF37] to-amber-600 border-white"
                }`}
              >
                <span className="text-xl">🕋</span>
              </div>
              <div
                className={`w-0.5 h-16 sm:h-20 ${
                  isAligned
                    ? "bg-gradient-to-b from-emerald-500 to-transparent"
                    : "bg-gradient-to-b from-[#D4AF37] to-transparent"
                }`}
              />
            </div>
          </div>

          {/* Center Heading Display */}
          <div
            className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full border flex flex-col items-center justify-center shadow-md relative z-10 ${
              styles.cardBg
            } ${styles.cardBorder}`}
          >
            <span
              className={`text-2xl sm:text-3xl font-mono font-bold ${
                isAligned ? "text-emerald-500 font-black scale-105" : styles.titleText
              }`}
            >
              {deviceHeading}°
            </span>
            <span className={`text-[10px] font-mono mt-0.5 ${styles.mutedText}`}>
              {isAligned ? "محاذاة كاملة" : `القبلة: ${qiblaBearing}°`}
            </span>
          </div>
        </div>

        {/* Distance and Location Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto pt-2">
          <div className={`p-3 rounded-2xl border text-center ${styles.innerBg} ${styles.innerBorder}`}>
            <span className={`text-[10px] block ${styles.mutedText}`}>المسافة إلى مكة المكرمة</span>
            <span className={`text-sm font-mono font-bold ${styles.titleText}`}>
              {distanceToKaaba.toLocaleString()} كم
            </span>
          </div>

          <div className={`p-3 rounded-2xl border text-center ${styles.innerBg} ${styles.innerBorder}`}>
            <span className={`text-[10px] block ${styles.mutedText}`}>حالة حساس الحركة</span>
            <span className={`text-sm font-mono font-bold ${hasSensor ? "text-emerald-500" : "text-amber-500"}`}>
              {hasSensor ? "مستشعر الهاتف نشط ✓" : "وضع المحاكاة اليدوية"}
            </span>
          </div>
        </div>

        {/* Manual Test Rotation Slider (For testing & PCs) */}
        <div className="max-w-md mx-auto p-4 rounded-2xl border border-black/5 dark:border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className={`font-bold flex items-center gap-1.5 ${styles.titleText}`}>
              <Sliders className="w-3.5 h-3.5 text-emerald-500" />
              <span>محاكاة تدوير الهاتف لتجربة التنبيه</span>
            </span>
            <button
              onClick={() => {
                setIsManualMode(!isManualMode);
                if (!isManualMode) {
                  setDeviceHeading(manualSliderValue);
                }
              }}
              className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 underline"
            >
              {isManualMode ? "إعادة تفعيل المستشعر الحقيقي" : "تجربة المحاكاة اليدوية"}
            </button>
          </div>

          {isManualMode && (
            <div className="space-y-2 pt-1">
              <input
                type="range"
                min="0"
                max="360"
                value={manualSliderValue}
                onChange={handleSliderChange}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>0° (شمال)</span>
                <button
                  onClick={() => {
                    setManualSliderValue(qiblaBearing);
                    setDeviceHeading(qiblaBearing);
                  }}
                  className="text-emerald-600 font-bold hover:underline"
                >
                  محاذاة للقبلة ({qiblaBearing}°)
                </button>
                <span>360°</span>
              </div>
            </div>
          )}
        </div>

        {/* iOS Permission Button if needed */}
        {!permissionRequested && (
          <div className="pt-2">
            <button
              onClick={requestSensorPermission}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm"
            >
              تفعيل مستشعر الاتجاه الجغرافي للجوال
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
