'use client';

import { useState, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Frame, Share2, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { getPhotos } from "@/lib/api";
import { CATEGORIES } from "@/lib/data";
import { RevealLinesInView, Reveal } from "./Reveal";
import { PrintRequestDialog } from "./PrintRequestDialog";
import { withWatermark } from "@/lib/cloudinary";
import { sharePhotoCard } from "@/lib/share";

export const Gallery = ({ categories }) => {
  const [photos, setPhotos] = useState([]);
  const [active, setActive] = useState("All");
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [printOpen, setPrintOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [detectedPortraits, setDetectedPortraits] = useState({});
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      const shareUrl = typeof window !== "undefined" ? window.location.href : "";
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link: ", err);
    }
  };

  const handleImageLoad = (photoId, e) => {
    const { naturalWidth, naturalHeight } = e.target;
    if (naturalHeight > naturalWidth * 1.05) {
      setDetectedPortraits((prev) => (prev[photoId] ? prev : { ...prev, [photoId]: true }));
    }
  };

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

  // In "All", interleave photos across categories so visitors experience a rich, varied mix
  const displayedPhotos = useMemo(() => {
    if (!photos || photos.length === 0) return [];
    if (active !== "All") return photos;

    const categoryBuckets = {};
    const catOrder = [];
    photos.forEach((p) => {
      const cat = p.category || "Wildlife";
      if (!categoryBuckets[cat]) {
        categoryBuckets[cat] = [];
        catOrder.push(cat);
      }
      categoryBuckets[cat].push(p);
    });

    const mixed = [];
    const maxLen = Math.max(...catOrder.map((c) => categoryBuckets[c].length));
    for (let i = 0; i < maxLen; i++) {
      for (const cat of catOrder) {
        if (categoryBuckets[cat][i]) {
          mixed.push(categoryBuckets[cat][i]);
        }
      }
    }
    return mixed;
  }, [photos, active]);

  const lightbox = lightboxIndex !== null && displayedPhotos[lightboxIndex] ? displayedPhotos[lightboxIndex] : null;

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const handlePrev = useCallback((e) => {
    if (e) e.stopPropagation();
    if (!displayedPhotos.length) return;
    setLightboxIndex((prev) => (prev > 0 ? prev - 1 : displayedPhotos.length - 1));
  }, [displayedPhotos.length]);

  const handleNext = useCallback((e) => {
    if (e) e.stopPropagation();
    if (!displayedPhotos.length) return;
    setLightboxIndex((prev) => (prev < displayedPhotos.length - 1 ? prev + 1 : 0));
  }, [displayedPhotos.length]);

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
      <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
          <div>
            <p className="font-mono-accent text-xs uppercase tracking-[0.25em] text-accent mb-2">
              The Field Archive
            </p>
            <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl tracking-tight text-white leading-tight">
              <RevealLinesInView lines={["Selected Frames"]} testId="gallery-heading" />
            </h2>
          </div>

          <div className="flex flex-wrap md:justify-end items-center gap-2" data-testid="gallery-filters">
            {filterCategories.map((c) => (
              <button
                key={c}
                data-testid={`filter-${c.toLowerCase()}`}
                onClick={() => setActive(c)}
                className={`px-4 sm:px-5 py-2 text-xs uppercase tracking-[0.15em] border transition-all duration-300 ${
                  active === c
                    ? "bg-accent border-accent text-black font-semibold shadow-sm"
                    : "border-white/20 text-neutral-400 hover:border-white/50 hover:text-white"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[3/2] rounded-xl bg-zinc-900 animate-pulse" />
            ))}
          </div>
        ) : displayedPhotos.length === 0 ? (
          <p className="text-neutral-500 py-20 text-center font-serif text-2xl">No frames in this category yet.</p>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {displayedPhotos.map((p, i) => {
              const isPortrait =
                (p.height && p.width && p.height > p.width * 1.05) ||
                Boolean(detectedPortraits[p.id]);

              // Optical face & eye framing for wildlife subjects
              const objectPosition = p.thumbnail_align === "bottom"
                ? "center bottom"
                : p.thumbnail_align === "center"
                ? "center center"
                : p.thumbnail_align === "top"
                ? (isPortrait ? "center 8%" : "center 12%")
                : p.thumbnail_align === "face"
                ? (isPortrait ? "center 10%" : "center 15%")
                // Default: anchor onto the face, eyes & crown (upper 10%-18%) so heads/eyes are never cut off
                : (isPortrait ? "center 10%" : "center 18%");

              return (
                <Reveal
                  key={p.id}
                  delay={(i % 3) * 0.06}
                  className="group relative overflow-hidden rounded-xl bg-zinc-900 aspect-[3/2] cursor-pointer shadow-xl transition-all duration-300"
                >
                  <button
                    data-testid={`gallery-item-${i}`}
                    onClick={() => setLightboxIndex(i)}
                    className="w-full h-full text-left focus:outline-none focus:ring-0 outline-none block relative"
                  >
                    <img
                      src={withWatermark(p.image_url)}
                      alt={p.title}
                      loading="lazy"
                      onLoad={(e) => handleImageLoad(p.id, e)}
                      style={{ objectPosition }}
                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                    {/* Responsive Cinematic Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2.5 sm:p-5">
                      <span className="text-[9px] sm:text-[10px] uppercase tracking-wider sm:tracking-widest text-accent font-bold mb-0.5 sm:mb-1 truncate block">
                        {p.category}{p.location ? ` · ${p.location}` : ""}
                      </span>
                      <h3 className="text-xs sm:text-base md:text-lg font-medium text-white tracking-wide truncate">
                        {p.title}
                        {p.title_gu && (
                          <span className="hidden sm:inline text-neutral-400 text-xs sm:text-sm ml-1 font-serif" data-testid={`gallery-gu-${i}`}>
                            ({p.title_gu})
                          </span>
                        )}
                      </h3>
                    </div>
                  </button>
                </Reveal>
              );
            })}
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
              className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-md flex flex-col justify-between overflow-y-auto font-sans text-zinc-100 select-none"
              onClick={closeLightbox}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {/* 1. FLOATING TOP BAR (Counter & Close) */}
              <div className="flex justify-between items-center w-full px-6 py-4 absolute top-0 left-0 z-50 pointer-events-none">
                <div className="text-xs tracking-widest text-zinc-500 font-mono">
                  {lightboxIndex + 1} / {displayedPhotos.length}
                </div>
                {/* Clean, text-free Close icon */}
                <button
                  type="button"
                  data-testid="lightbox-close"
                  aria-label="Close photo preview"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeLightbox();
                  }}
                  className="pointer-events-auto p-2 rounded-full bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-md text-zinc-400 hover:text-white hover:border-zinc-700 transition-all duration-300 cursor-pointer"
                >
                  <X className="w-5 h-5 stroke-[1.5]" />
                </button>
              </div>

              {/* 2. IMAGE CONTAINER WITH FLOATING ARROWS */}
              <div
                className="relative flex-1 flex items-center justify-center px-4 md:px-16 pt-16 pb-4 max-w-5xl mx-auto w-full group"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Left Navigation Arrow */}
                {displayedPhotos.length > 1 && (
                  <button
                    type="button"
                    data-testid="lightbox-prev"
                    aria-label="Previous photo (Left arrow)"
                    onClick={handlePrev}
                    className="absolute left-2 sm:left-4 p-3 rounded-full bg-zinc-900/30 border border-zinc-800/40 backdrop-blur-sm text-zinc-400 opacity-80 md:opacity-0 md:group-hover:opacity-100 hover:text-white hover:border-zinc-700 transition-all duration-300 z-40 cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5 stroke-[2]" />
                  </button>
                )}

                {/* Main Photograph Frame */}
                <motion.img
                  key={lightbox.id || lightbox.image_url}
                  src={withWatermark(lightbox.image_url)}
                  alt={lightbox.title}
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.25 }}
                  className="max-h-[58vh] sm:max-h-[64vh] lg:max-h-[68vh] w-auto max-w-full object-contain rounded shadow-2xl border border-zinc-900 select-none"
                />

                {/* Right Navigation Arrow */}
                {displayedPhotos.length > 1 && (
                  <button
                    type="button"
                    data-testid="lightbox-next"
                    aria-label="Next photo (Right arrow)"
                    onClick={handleNext}
                    className="absolute right-2 sm:right-4 p-3 rounded-full bg-zinc-900/30 border border-zinc-800/40 backdrop-blur-sm text-zinc-400 opacity-80 md:opacity-0 md:group-hover:opacity-100 hover:text-white hover:border-zinc-700 transition-all duration-300 z-40 cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5 stroke-[2]" />
                  </button>
                )}
              </div>

              {/* 3. PHOTO DETAILS & ACTION PANELS */}
              <div
                className="bg-zinc-950/80 border-t border-zinc-900 backdrop-blur-xl w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between gap-6">
                  {/* Left Metadata Section */}
                  <div className="flex-1 space-y-3">
                    <div>
                      <h2 className="text-2xl font-semibold tracking-wide text-white font-serif">
                        {lightbox.title}
                      </h2>
                      {lightbox.title_gu && (
                        <h3 className="text-lg font-medium text-zinc-400 mt-0.5 font-serif" data-testid="lb-title-gu">
                          {lightbox.title_gu}
                        </h3>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 text-[10px] font-bold tracking-widest text-emerald-400 uppercase">
                      <span>{lightbox.category}</span>
                      {lightbox.location && (
                        <>
                          <span className="text-zinc-700">•</span>
                          <span className="text-zinc-400">{lightbox.location}</span>
                        </>
                      )}
                    </div>

                    {lightbox.story && (
                      <p className="text-sm leading-relaxed text-zinc-300 max-w-xl text-justify font-sans" data-testid="gallery-lb-story">
                        {lightbox.story}
                      </p>
                    )}

                    {(lightbox.camera || lightbox.lens || lightbox.settings) && (
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-zinc-500 pt-1">
                        {lightbox.camera && (
                          <span data-testid="lb-camera" className="inline-flex items-center gap-1.5 text-zinc-400">
                            <span>📷</span>
                            <span>{lightbox.camera}</span>
                          </span>
                        )}
                        {lightbox.camera && (lightbox.lens || lightbox.settings) && (
                          <span className="text-zinc-800">|</span>
                        )}
                        {lightbox.lens && (
                          <span data-testid="lb-lens" className="inline-flex items-center gap-1.5 text-zinc-400">
                            <span>🔎</span>
                            <span>{lightbox.lens}</span>
                          </span>
                        )}
                        {lightbox.lens && lightbox.settings && (
                          <span className="text-zinc-800">|</span>
                        )}
                        {lightbox.settings && (
                          <span data-testid="lb-settings" className="text-zinc-400 inline-flex items-center gap-1.5">
                            <span>⚙️</span>
                            <span>{lightbox.settings}</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Side Action Controls */}
                  <div className="flex flex-row md:flex-col justify-end items-end gap-3 self-end w-full md:w-auto shrink-0">
                    {/* Share Action Button */}
                    <button
                      type="button"
                      data-testid="lightbox-share"
                      onClick={handleShare}
                      className={`flex items-center justify-center space-x-2 w-1/2 md:w-44 px-4 py-2.5 rounded-lg border transition-all duration-300 text-xs font-medium tracking-wider uppercase select-none cursor-pointer ${
                        copied
                          ? "bg-emerald-950/30 border-emerald-500/50 text-emerald-400"
                          : "bg-zinc-900/30 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-900 hover:border-zinc-700"
                      }`}
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Share2 className="w-4 h-4" />
                      )}
                      <span>{copied ? "Link Copied!" : "Share Frame"}</span>
                    </button>

                    {/* Request Print Button */}
                    <button
                      type="button"
                      data-testid="lightbox-request-print"
                      onClick={() => setPrintOpen(true)}
                      className="flex items-center justify-center space-x-2 w-1/2 md:w-44 px-4 py-2.5 rounded-lg bg-emerald-600 text-xs font-semibold tracking-wider uppercase text-white hover:bg-emerald-500 shadow-lg shadow-emerald-950/20 transition-all duration-200 cursor-pointer"
                    >
                      <Frame className="w-4 h-4" />
                      <span>Request Print</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      <PrintRequestDialog open={printOpen} onOpenChange={setPrintOpen} photo={lightbox} />
    </section>
  );
};
