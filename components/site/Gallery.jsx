'use client';

import { useState, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Frame, Share2, ChevronLeft, ChevronRight } from "lucide-react";
import { getPhotos } from "@/lib/api";
import { CATEGORIES } from "@/lib/data";
import { RevealLinesInView, Reveal } from "./Reveal";
import { PrintRequestDialog } from "./PrintRequestDialog";
import { withWatermark } from "@/lib/cloudinary";
import { sharePhotoCard } from "@/lib/share";

// Bento span pattern for editorial asymmetry
const SPANS = [
  "md:col-span-7 md:row-span-2",
  "md:col-span-5",
  "md:col-span-5",
  "md:col-span-4",
  "md:col-span-4",
  "md:col-span-4",
  "md:col-span-6",
  "md:col-span-6",
];

export const Gallery = ({ categories }) => {
  const [photos, setPhotos] = useState([]);
  const [active, setActive] = useState("All");
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [printOpen, setPrintOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filterCategories = useMemo(
    () => [
      "All",
      ...(categories && categories.length > 0
        ? categories
        : CATEGORIES.filter((c) => c !== "All")),
    ],
    [categories]
  );

  useEffect(() => {
    if (active !== "All" && !filterCategories.includes(active)) {
      setActive("All");
    }
  }, [filterCategories, active]);

  useEffect(() => {
    setLoading(true);
    getPhotos(active === "All" ? null : active)
      .then(setPhotos)
      .finally(() => setLoading(false));
  }, [active]);

  const lightbox = lightboxIndex !== null && photos[lightboxIndex] ? photos[lightboxIndex] : null;

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const handlePrev = useCallback((e) => {
    if (e) e.stopPropagation();
    if (!photos.length) return;
    setLightboxIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  }, [photos.length]);

  const handleNext = useCallback((e) => {
    if (e) e.stopPropagation();
    if (!photos.length) return;
    setLightboxIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  }, [photos.length]);

  // Keyboard navigation: Escape to close, Left/Right arrows to navigate
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closeLightbox();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, closeLightbox, handlePrev, handleNext]);

  // Prevent background page scrolling when lightbox is open
  useEffect(() => {
    if (lightboxIndex !== null) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [lightboxIndex]);

  // Touch swipe support for mobile
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 45;
    if (distance > minSwipeDistance) {
      handleNext();
    } else if (distance < -minSwipeDistance) {
      handlePrev();
    }
  };

  return (
    <section id="portfolio" data-testid="gallery-section" className="relative z-10 py-24 md:py-32 bg-[#050505] scroll-mt-20">
      <div id="gallery" className="sr-only" />
      <div className="max-w-[1600px] mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
          <div>
            <p className="font-mono-accent text-xs uppercase tracking-[0.25em] text-accent mb-2">
              The Field Archive
            </p>
            <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl tracking-tight text-white leading-tight">
              <RevealLinesInView lines={["Selected", "Frames"]} testId="gallery-heading" />
            </h2>
          </div>

          <div className="flex flex-wrap gap-2" data-testid="gallery-filters">
            {filterCategories.map((c) => (
              <button
                key={c}
                data-testid={`filter-${c.toLowerCase()}`}
                onClick={() => setActive(c)}
                className={`px-5 py-2 text-xs uppercase tracking-[0.15em] border transition-all duration-400 ${
                  active === c
                    ? "bg-accent border-accent text-black"
                    : "border-white/20 text-neutral-400 hover:border-white/50 hover:text-white"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`${SPANS[i % SPANS.length]} h-72 md:h-96 bg-neutral-900 animate-pulse`} />
            ))}
          </div>
        ) : photos.length === 0 ? (
          <p className="text-neutral-500 py-20 text-center font-serif text-2xl">No frames in this category yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 auto-rows-[260px] sm:auto-rows-[300px] md:auto-rows-[280px] lg:auto-rows-[320px] gap-4">
            {photos.map((p, i) => (
              <Reveal
                key={p.id}
                delay={(i % 3) * 0.08}
                className={`${SPANS[i % SPANS.length]} group relative overflow-hidden cursor-pointer bg-neutral-900 border border-white/5 rounded-sm`}
              >
                <button
                  data-testid={`gallery-item-${i}`}
                  onClick={() => setLightboxIndex(i)}
                  className="absolute inset-0 w-full h-full text-left focus:outline-none"
                >
                  <img
                    src={withWatermark(p.image_url)}
                    alt={p.title}
                    loading="lazy"
                    className="w-full h-full object-cover object-center opacity-95 sm:opacity-90 md:opacity-85 sm:grayscale-[10%] md:grayscale-[20%] transition-all duration-700 ease-out group-hover:scale-105 group-hover:opacity-100 group-hover:grayscale-0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-90 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-0 left-0 p-5 sm:p-6 text-left translate-y-0 opacity-100 md:translate-y-3 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 transition-all duration-500 w-full">
                    <p className="font-mono-accent text-[10px] uppercase tracking-[0.2em] text-accent mb-1">
                      {p.category}{p.location ? ` · ${p.location}` : ""}
                    </p>
                    <p className="font-serif text-xl sm:text-2xl text-white leading-tight truncate">{p.title}</p>
                    {p.title_gu && (
                      <p className="text-xs sm:text-sm text-neutral-300 mt-0.5 truncate" data-testid={`gallery-gu-${i}`}>{p.title_gu}</p>
                    )}
                  </div>
                </button>
              </Reveal>
            ))}
          </div>
        )}
      </div>

      {mounted && typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {lightbox && (
            <motion.div
              data-testid="gallery-lightbox"
              data-lenis-prevent
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-md overflow-y-auto overflow-x-hidden flex items-center justify-center p-3 sm:p-6 md:p-12"
              onClick={closeLightbox}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {/* Top Bar: Frame Counter & Category */}
              <div className="fixed top-5 left-5 sm:top-6 sm:left-8 z-[100000] flex items-center gap-2 pointer-events-none">
                <div className="px-3.5 py-1.5 rounded-full bg-neutral-900/90 backdrop-blur-md border border-white/20 text-xs font-mono-accent uppercase tracking-[0.2em] text-neutral-300 flex items-center gap-1.5 shadow-xl">
                  <span className="text-accent font-semibold">{lightboxIndex + 1}</span>
                  <span className="text-neutral-500">/</span>
                  <span>{photos.length}</span>
                </div>
                {lightbox.category && (
                  <span className="hidden sm:inline-flex px-3 py-1.5 rounded-full bg-neutral-900/80 backdrop-blur-md border border-white/10 text-[10px] font-mono-accent uppercase tracking-[0.15em] text-accent">
                    {lightbox.category}
                  </span>
                )}
              </div>

              {/* High-Visibility Top-Right Close Button in Front */}
              <button
                type="button"
                data-testid="lightbox-close"
                aria-label="Close photo preview"
                className="fixed top-5 right-5 sm:top-6 sm:right-8 z-[100000] flex items-center gap-2.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-neutral-900/95 hover:bg-white text-white hover:text-black border border-white/25 hover:border-white transition-all duration-300 shadow-2xl active:scale-95 cursor-pointer group backdrop-blur-xl"
                onClick={(e) => {
                  e.stopPropagation();
                  closeLightbox();
                }}
              >
                <span className="text-xs uppercase font-mono tracking-[0.2em] font-medium">Close</span>
                <div className="w-5 h-5 rounded-full bg-white/10 group-hover:bg-black/10 flex items-center justify-center transition-colors">
                  <X className="w-3.5 h-3.5 transition-transform group-hover:rotate-90 duration-300" />
                </div>
              </button>

            {/* Previous Frame Arrow (Left) */}
            {photos.length > 1 && (
              <button
                type="button"
                data-testid="lightbox-prev"
                aria-label="Previous photo (Left arrow)"
                onClick={handlePrev}
                className="fixed left-2 sm:left-5 md:left-8 top-1/2 -translate-y-1/2 z-[130] w-11 h-11 sm:w-13 sm:h-13 md:w-14 md:h-14 rounded-full bg-neutral-900/85 hover:bg-accent hover:text-black text-white border border-white/25 hover:border-accent flex items-center justify-center backdrop-blur-md transition-all duration-300 shadow-2xl active:scale-90 hover:scale-105 cursor-pointer group"
              >
                <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7 transition-transform group-hover:-translate-x-0.5" />
              </button>
            )}

            {/* Next Frame Arrow (Right) */}
            {photos.length > 1 && (
              <button
                type="button"
                data-testid="lightbox-next"
                aria-label="Next photo (Right arrow)"
                onClick={handleNext}
                className="fixed right-2 sm:right-5 md:right-8 top-1/2 -translate-y-1/2 z-[130] w-11 h-11 sm:w-13 sm:h-13 md:w-14 md:h-14 rounded-full bg-neutral-900/85 hover:bg-accent hover:text-black text-white border border-white/25 hover:border-accent flex items-center justify-center backdrop-blur-md transition-all duration-300 shadow-2xl active:scale-90 hover:scale-105 cursor-pointer group"
              >
                <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7 transition-transform group-hover:translate-x-0.5" />
              </button>
            )}

            {/* Main Content Modal Card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-6xl w-full my-auto flex flex-col items-center justify-center py-16 sm:py-12 px-2 sm:px-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Photo Area with Responsive Containment */}
              <div className="relative w-full flex items-center justify-center">
                <motion.img
                  key={lightbox.id || lightbox.image_url}
                  src={withWatermark(lightbox.image_url)}
                  alt={lightbox.title}
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.25 }}
                  className="w-auto max-w-full max-h-[54vh] sm:max-h-[62vh] md:max-h-[68vh] lg:max-h-[72vh] object-contain mx-auto select-none rounded shadow-2xl"
                />
              </div>

              {/* Caption and Action Details */}
              <div className="mt-4 sm:mt-6 w-full flex flex-col md:flex-row md:items-end md:justify-between gap-5 bg-neutral-950/80 border border-white/10 backdrop-blur-md p-4 sm:p-6 rounded-lg">
                <div className="min-w-0">
                  <p className="font-serif text-2xl sm:text-3xl md:text-4xl text-white leading-tight break-words">
                    {lightbox.title}
                  </p>
                  {lightbox.title_gu && (
                    <p className="text-base sm:text-lg text-neutral-300 mt-1 font-serif" data-testid="lb-title-gu">
                      {lightbox.title_gu}
                    </p>
                  )}
                  <p className="font-mono-accent text-xs uppercase tracking-[0.2em] text-accent mt-1.5">
                    {lightbox.category}{lightbox.location ? ` · ${lightbox.location}` : ""}
                  </p>
                  {lightbox.story && (
                    <p className="text-neutral-300 italic text-sm sm:text-base max-w-2xl mt-3 leading-relaxed" data-testid="gallery-lb-story">
                      {lightbox.story}
                    </p>
                  )}
                  {(lightbox.camera || lightbox.lens || lightbox.settings) && (
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-4 font-mono-accent text-[11px] uppercase tracking-[0.15em] text-neutral-400">
                      {lightbox.camera && (
                        <span data-testid="lb-camera" className="px-2.5 py-1 rounded bg-white/5 border border-white/10">
                          Body · {lightbox.camera}
                        </span>
                      )}
                      {lightbox.lens && (
                        <span data-testid="lb-lens" className="px-2.5 py-1 rounded bg-white/5 border border-white/10">
                          Lens · {lightbox.lens}
                        </span>
                      )}
                      {lightbox.settings && (
                        <span data-testid="lb-settings" className="px-2.5 py-1 rounded bg-white/5 border border-white/10">
                          {lightbox.settings}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0 pt-2 md:pt-0">
                  <button
                    type="button"
                    data-testid="lightbox-share"
                    onClick={() => sharePhotoCard(lightbox)}
                    className="group flex-1 sm:flex-initial flex items-center justify-center gap-2.5 border border-white/25 px-5 py-3 text-xs uppercase tracking-[0.2em] text-white hover:bg-white hover:text-black transition-colors duration-300"
                  >
                    <Share2 size={16} />
                    <span>Share</span>
                  </button>
                  <button
                    type="button"
                    data-testid="lightbox-request-print"
                    onClick={() => setPrintOpen(true)}
                    className="group flex-1 sm:flex-initial flex items-center justify-center gap-2.5 border border-accent/50 bg-accent/10 px-5 py-3 text-xs uppercase tracking-[0.2em] text-accent hover:bg-accent hover:text-black transition-colors duration-300"
                  >
                    <Frame size={16} />
                    <span>Request Print</span>
                  </button>
                </div>
              </div>

              {/* Mobile Swipe Hint */}
              <p className="text-center font-mono-accent text-[10px] uppercase tracking-[0.2em] text-neutral-500 mt-3 sm:hidden">
                Swipe or use arrows to navigate frames
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
    )}

      <PrintRequestDialog open={printOpen} onOpenChange={setPrintOpen} photo={lightbox} />
    </section>
  );
};
