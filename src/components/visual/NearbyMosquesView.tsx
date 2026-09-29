import React, { useState, useEffect } from "react";
import {
  MapPin,
  Compass,
  Navigation,
  ExternalLink,
  Search,
  Sparkles,
  Info,
  Loader2,
} from "lucide-react";
import {
  FAMOUS_GLOBAL_MOSQUES,
  calculateDistanceKm,
  MosqueItem,
} from "../../data/mosquesData";
import { CITIES_PRESETS, CityPreset } from "../../utils/prayerCalculator";
import { soundEngine } from "../../utils/soundEngine";
import { ThemeMode } from "../../types";
import { getThemeStyles } from "../../utils/themeClasses";

interface Props {
  theme?: ThemeMode;
}

export const NearbyMosquesView: React.FC<Props> = ({ theme = "natural" }) => {
  const styles = getThemeStyles(theme);
  const { isPaper, isNight, isLight } = styles;

  const [selectedCity, setSelectedCity] = useState<CityPreset>(CITIES_PRESETS[0]); // Makkah
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>({
    lat: CITIES_PRESETS[0].lat,
    lng: CITIES_PRESETS[0].lng,
  });
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationStatus, setLocationStatus] = useState<string>("مكة المكرمة (الافتراضي)");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Sort mosques by distance from current user coordinates
  const sortedMosques = React.useMemo(() => {
    if (!userLocation) return FAMOUS_GLOBAL_MOSQUES;
    const withDistance = FAMOUS_GLOBAL_MOSQUES.map((m) => {
      const dist = calculateDistanceKm(userLocation.lat, userLocation.lng, m.lat, m.lng);
      return { ...m, distanceKm: dist };
    });

    const filtered = withDistance.filter(
      (m) =>
        m.nameAr.includes(searchQuery) ||
        m.cityAr.includes(searchQuery) ||
        m.countryAr.includes(searchQuery) ||
        m.nameEn.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filtered.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
  }, [userLocation, searchQuery]);

  const handleGetCurrentLocation = () => {
    soundEngine.playTasbihClick();
    if (!navigator.geolocation) {
      alert("خاصية تحديد الموقع الجغرافي غير مدعومة في متصفحك.");
      return;
    }

    setIsLocating(true);
    setLocationStatus("جاري الاتصال بالأقمار الصناعية لتحديد موقعك...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setLocationStatus(`موقعك الجغرافي: (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`);
      },
      (error) => {
        setIsLocating(false);
        setLocationStatus("تعذر جلب الموقع الدقيق، تم الاعتماد على المدينة المختارة.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSelectCity = (city: CityPreset) => {
    soundEngine.playTasbihClick();
    setSelectedCity(city);
    setUserLocation({ lat: city.lat, lng: city.lng });
    setLocationStatus(`مدينة: ${city.nameAr}`);
  };

  return (
    <div id="nearby-mosques-view" className="space-y-4 sm:space-y-6">
      {/* Header Banner */}
      <div className={`rounded-2xl sm:rounded-3xl p-4 sm:p-6 border transition-all ${styles.cardBg} ${styles.cardBorder} ${styles.cardShadow}`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 border ${styles.badgeBg} ${styles.badgeBorder} ${styles.accentText}`}>
              <MapPin className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <span className={`text-[10px] uppercase tracking-wider font-mono font-bold block ${styles.accentText}`}>
                Mosque Navigation & Locator
              </span>
              <h2 className={`text-base sm:text-xl font-bold font-alexandria ${styles.titleText}`}>
                دليل المساجد والجوامع القريبة والعالمية
              </h2>
              <p className={`text-xs max-w-xl line-clamp-1 sm:line-clamp-none ${styles.mutedText}`}>
                استكشف المساجد القريبة وحساب المسافة بدقة الكيلومتر، مع ربط مباشر لخرائط الملاحة.
              </p>
            </div>
          </div>

          <button
            onClick={handleGetCurrentLocation}
            disabled={isLocating}
            className={`flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl font-bold text-xs transition active:scale-95 whitespace-nowrap ${styles.btnPrimary}`}
          >
            {isLocating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4" />
            )}
            <span>{isLocating ? "جاري التحديد..." : "تحديد موقعي الحالي GPS"}</span>
          </button>
        </div>

        {/* Current status bar */}
        <div className={`mt-3.5 p-2.5 sm:p-3 rounded-xl border flex items-center justify-between text-xs ${styles.innerBg} ${styles.innerBorder}`}>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className={styles.mutedText}>
              المرجع الحالي: <strong className={styles.titleText}>{locationStatus}</strong>
            </span>
          </span>
          <span className={`font-mono text-[10px] ${styles.mutedText}`}>OpenStreetMap</span>
        </div>

        {/* City Filter Presets */}
        <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <span className={`text-xs whitespace-nowrap ${styles.mutedText}`}>المدن:</span>
          {CITIES_PRESETS.map((city) => (
            <button
              key={city.nameEn}
              onClick={() => handleSelectCity(city)}
              className={`px-3 py-1 rounded-xl text-xs whitespace-nowrap transition border ${
                selectedCity.nameEn === city.nameEn
                  ? styles.btnPrimary
                  : styles.btnSecondary
              }`}
            >
              {city.nameAr}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="mt-3 relative">
          <Search className={`w-4 h-4 absolute right-3.5 top-2.5 ${styles.mutedText}`} />
          <input
            type="text"
            placeholder="ابحث باسم المسجد أو المدينة أو الدولة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full border rounded-xl pr-10 pl-3 py-2 text-xs focus:outline-none ${styles.inputBg} ${styles.inputBorder} ${styles.inputText}`}
          />
        </div>
      </div>

      {/* Mosques Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
        {sortedMosques.map((mosque) => (
          <div
            key={mosque.id}
            className={`rounded-2xl sm:rounded-3xl p-4 sm:p-5 border transition-all space-y-3 relative ${styles.cardBg} ${styles.cardBorder} hover:shadow-md`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold ${styles.accentText}`}>
                    {mosque.cityAr} • {mosque.countryAr}
                  </span>
                  {mosque.isSanctuary && (
                    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${styles.badgeBg} ${styles.badgeBorder} ${styles.accentText}`}>
                      حرم مقدس
                    </span>
                  )}
                </div>
                <h3 className={`text-sm sm:text-base font-bold font-alexandria ${styles.titleText}`}>
                  {mosque.nameAr}
                </h3>
                <span className={`text-[11px] font-mono block ${styles.mutedText}`}>{mosque.nameEn}</span>
              </div>

              {/* Distance badge */}
              <div className={`shrink-0 px-3 py-1.5 rounded-xl border text-center font-mono ${styles.innerBg} ${styles.innerBorder}`}>
                <span className={`text-xs sm:text-sm font-bold block ${styles.accentText}`}>
                  {mosque.distanceKm}
                </span>
                <span className={`text-[9px] uppercase ${styles.mutedText}`}>كم يبعد</span>
              </div>
            </div>

            <p className={`text-xs leading-relaxed ${styles.mutedText}`}>
              {mosque.historicalNoteAr}
            </p>

            <div className={`flex items-center justify-between pt-2 border-t text-xs ${styles.innerBorder} ${styles.mutedText}`}>
              {mosque.capacity ? (
                <span>
                  السعة: <strong className={styles.titleText}>{mosque.capacity.toLocaleString()} مصلٍ</strong>
                </span>
              ) : <span></span>}

              {/* Navigation button to Google Maps / OpenStreetMap */}
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${mosque.lat},${mosque.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs transition ${styles.btnSecondary}`}
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>الملاحة والاتجاه</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
