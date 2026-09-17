import React, { useState, useEffect, useRef } from 'react';
import { optimizeImageUrl } from '../lib/utils';
import { useTheme } from '../context/ThemeContext';

interface LazyCategoryImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  draggable?: boolean;
  className?: string;
}

export default function LazyCategoryImage({
  src,
  alt,
  width = 600,
  height = 800,
  draggable = false,
  className = '',
}: LazyCategoryImageProps) {
  const { theme } = useTheme();
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Proveri da li je slika već učitana iz keša pre prvog renderovanja
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, [src]);

  const optimizedSrc = optimizeImageUrl(src, width);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Elegantni shimmer / skeleton placeholder sa mekom tranzicijom */}
      <div
        aria-hidden="true"
        className={`absolute inset-0 transition-opacity duration-1000 ease-out pointer-events-none ${
          isLoaded ? 'opacity-0' : 'opacity-100'
        } ${
          theme === 'dark'
            ? 'bg-zinc-900 bg-gradient-to-tr from-zinc-950 via-zinc-900 to-zinc-800 animate-pulse'
            : 'bg-stone-100 bg-gradient-to-tr from-stone-200 via-stone-100 to-stone-200 animate-pulse'
        }`}
      >
        {/* Unutrašnji suptilni sjaj za luxury efekat */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_2.5s_infinite]" />
      </div>

      {/* Slika sa glatkom blur-to-clear & fade-in tranzicijom */}
      <img
        ref={imgRef}
        src={hasError ? src : optimizedSrc}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        draggable={draggable}
        referrerPolicy="no-referrer"
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setHasError(true);
          setIsLoaded(true);
        }}
        className={`w-full h-full object-cover will-change-transform transform-gpu transition-all duration-1000 ease-out group-hover:scale-110 pointer-events-none ${
          isLoaded
            ? 'opacity-100 scale-100 blur-0'
            : 'opacity-0 scale-[1.04] blur-md'
        } ${className}`}
      />
    </div>
  );
}
