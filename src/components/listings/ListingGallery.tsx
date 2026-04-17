"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";

interface ListingGalleryProps {
  photos: string[];
  alt: string;
}

export function ListingGallery({ photos, alt }: ListingGalleryProps) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const validPhotos = photos.length > 0 ? photos : [];
  const hasPhotos = validPhotos.length > 0;

  function prev() {
    setActive((i) => (i === 0 ? validPhotos.length - 1 : i - 1));
  }
  function next() {
    setActive((i) => (i === validPhotos.length - 1 ? 0 : i + 1));
  }

  if (!hasPhotos) {
    return (
      <div className="aspect-square bg-slate-100 rounded-2xl flex items-center justify-center text-slate-300">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="m21 15-5-5L5 21" />
        </svg>
      </div>
    );
  }

  return (
    <>
      {/* Main image */}
      <div className="space-y-3">
        <div
          className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 cursor-zoom-in group"
          onClick={() => setLightbox(true)}
        >
          <Image
            src={validPhotos[active]}
            alt={`${alt}, photo ${active + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={active === 0}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <ZoomIn
              size={28}
              className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow"
            />
          </div>

          {/* Nav arrows */}
          {validPhotos.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow hover:bg-white transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow hover:bg-white transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </>
          )}

          {/* Dot indicator */}
          {validPhotos.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {validPhotos.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setActive(i); }}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    i === active ? "bg-white w-4" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {validPhotos.length > 1 && (
          <div className="grid grid-cols-5 gap-2">
            {validPhotos.map((src, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                  i === active
                    ? "border-[#00B4FF] shadow-sm"
                    : "border-transparent hover:border-slate-200"
                }`}
              >
                <Image
                  src={src}
                  alt={`Thumbnail ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightbox(false)}
        >
          <button
            onClick={() => setLightbox(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <X size={20} />
          </button>

          {validPhotos.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          <div
            className="relative w-[90vw] h-[90vh] max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={validPhotos[active]}
              alt={alt}
              fill
              className="object-contain"
              sizes="90vw"
            />
          </div>

          <p className="absolute bottom-4 text-white/60 text-sm">
            {active + 1} / {validPhotos.length}
          </p>
        </div>
      )}
    </>
  );
}
