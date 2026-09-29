import React, { useState, useEffect, useRef } from "react";
import { Image as ImageIcon, RefreshCw } from "lucide-react";

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  aspectRatio?: string; // e.g. "aspect-video", "aspect-square", "aspect-[4/3]"
  fallbackSrc?: string;
  className?: string;
  containerClassName?: string;
  blurEffect?: boolean;
}

/**
 * LazyImage Component
 * High-performance image loader designed for smooth transitions and zero layout shifts.
 * Utilizes IntersectionObserver, async decoding, skeleton placeholder, and graceful fallback.
 */
export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  aspectRatio = "aspect-video",
  fallbackSrc = "https://i.ibb.co/sJ9F5mbb/1.png",
  className = "",
  containerClassName = "",
  blurEffect = true,
  ...imgProps
}) => {
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>("");
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Reset state if src changes
    setIsLoaded(false);
    setHasError(false);

    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setIsInView(true);
      setCurrentSrc(src);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            setCurrentSrc(src);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "200px 0px", // Preload slightly before appearing in viewport
        threshold: 0.01,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [src]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden bg-white/[0.03] border border-white/5 rounded-2xl ${aspectRatio} ${containerClassName}`}
    >
      {/* Skeleton Shimmer Loading Placeholder */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/60 animate-pulse text-zinc-500">
          <ImageIcon className="w-8 h-8 opacity-30 animate-bounce mb-1" />
          <span className="text-[10px] text-zinc-400 font-mono">جارٍ التحميل بسلاسة...</span>
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-950/20 text-zinc-400 p-2 text-center">
          <RefreshCw className="w-5 h-5 text-amber-400 mb-1 opacity-60" />
          <span className="text-[10px]">تعذر تحميل المعاينة</span>
        </div>
      )}

      {/* Real Image with Lazy Loading */}
      {isInView && (
        <img
          src={currentSrc}
          alt={alt}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full object-cover transition-all duration-500 ease-out ${
            isLoaded
              ? "opacity-100 scale-100"
              : `opacity-0 scale-95 ${blurEffect ? "blur-sm" : ""}`
          } ${className}`}
          {...imgProps}
        />
      )}
    </div>
  );
};
