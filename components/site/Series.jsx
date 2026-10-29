'use client';

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Share2, Frame, ChevronLeft, ChevronRight } from "lucide-react";
import { getPhotos } from "@/lib/api";
import { withWatermark } from "@/lib/cloudinary";
import { sharePhotoCard } from "@/lib/share";
import { RevealLinesInView, Reveal } from "./Reveal";
import { PrintRequestDialog } from "./PrintRequestDialog";

export const Series = ({ collections = {} }) => {
  const [groups, setGroups] = useState([]);
  const [activeSeries, setActiveSeries] = useState(null);
  const [printOpen, setPrintOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    getPhotos().then((photos) => {
      const map = {};
      photos.forEach((p) => {
        if (p.collection && p.collection.trim()) {
          (map[p.collection] = map[p.collection] || []).push(p);
        }
      });
      setGroups(Object.entries(map).map(([name, items]) => ({ name, items })));
    });
  }, []);

  const lightbox = activeSeries && activeSeries.items ? activeSeries.items[activeSeries.index] : null;

  const closeLightbox = useCallback(() => {
    setActiveSeries(null);
  }, []);

  const handlePrev = useCallback((e) => {
    if (e) e.stopPropagation();
    if (!activeSeries?.items?.length) return;
    setActiveSeries((curr) => {
      if (!curr) return null;
      return {
        ...curr,
        index: curr.index > 0 ? curr.index - 1 : curr.items.length - 1,
      };
    });
  }, [activeSeries]);

  const handleNext = useCallback((e) => {
    if (e) e.stopPropagation();
    if (!activeSeries?.items?.length) return;
    setActiveSeries((curr) => {
      if (!curr) return null;
      return {
        ...curr,
        index: curr.index < curr.items.length - 1 ? curr.index + 1 : 0,
      };
    });
  }, [activeSeries]);

  // Keyboard navigation
  useEffect(() => {
    if (!activeSeries) return;
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
  }, [activeSeries, closeLightbox, handlePrev, handleNext]);

  // Lock background scroll
  useEffect(() => {
    if (activeSeries) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [activeSeries]);

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

  if (groups.length === 0) return null;

  return (
    <section id="series" data-testid="series-section" className="relative z-10 py-16 md:py-24 bg-[#050505] border-t border-white/10 scroll-mt-20">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12">
        <div className="max-w-2xl mb-10">
          <p className="font-mono-accent text-xs uppercase tracking-[0.25em] text-accent mb-2">
            Collections · Photo Essays
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl tracking-tight text-white leading-tight">
            <RevealLinesInView lines={["Field Series"]} testId="series-heading" />
          </h2>
        </div>

        <div className="space-y-28 md:space-y-40">
          {groups.map((g, gi) => {
            const meta = collections[g.name] || {};
            const coverPhoto = g.items.find((p) => p.public_id === meta.cover_public_id) || g.items[0];
            const cover = coverPhoto?.image_url;
            const reversed = gi % 2 === 1;
            return (
              <div
                key={g.name}
                data-testid={`series-group-${gi}`}
                className="grid md:grid-cols-12 gap-8 md:gap-12 items-center"
              >
                {/* Cover */}
                <Reveal className={`md:col-span-7 ${reversed ? "md:order-2" : ""}`}>
                  <button
                    data-testid={`series-cover-${gi}`}
                    onClick={() => {
                      const idx = g.items.findIndex((p) => p.id === coverPhoto?.id);
                      setActiveSeries({ groupName: g.name, items: g.items, index: idx >= 0 ? idx : 0 });
                    }}
                    className="group relative block w-full aspect-[16/10] overflow-hidden bg-neutral-900 border border-white/10 text-left focus:outline-none"
                  >
                    <img
                      src={withWatermark(cover)}
                      alt={g.name}
                      loading="lazy"
                      className="w-full h-full object-cover opacity-90 transition-all duration-[900ms] ease-out group-hover:scale-105 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 p-6 md:p-8 flex items-end gap-4">
                      <span className="font-serif text-5xl md:text-7xl leading-none text-white/40">
                        {String(gi + 1).padStart(2, "0")}
                      </span>
                      <h3 className="font-serif text-3xl md:text-5xl text-white leading-none pb-1">{g.name}</h3>
                    </div>
                  </button>
                </Reveal>

                {/* Caption + thumbnails */}
                <Reveal delay={0.12} className={`md:col-span-5 ${reversed ? "md:order-1" : ""}`}>
                  <p className="font-mono-accent text-xs uppercase tracking-[0.2em] text-accent mb-4">
                    {g.items.length} {g.items.length === 1 ? "frame" : "frames"}
                  </p>
                  <p className="font-serif italic text-2xl md:text-3xl text-neutral-200 leading-snug mb-8">
                    {meta.caption || "A visual story from the field."}
                  </p>
                  <div className="grid grid-cols-4 gap-3" data-testid={`series-thumbs-${gi}`}>
                    {g.items
                      .filter((p) => p.public_id !== meta.cover_public_id)
                      .slice(0, 4)
                      .map((p, i) => (
                        <button
                          key={p.id}
                          data-testid={`series-item-${gi}-${i}`}
                          onClick={() => {
                            const idx = g.items.findIndex((item) => item.id === p.id);
                            setActiveSeries({ groupName: g.name, items: g.items, index: idx >= 0 ? idx : 0 });
                          }}
                          className="group relative aspect-square overflow-hidden bg-neutral-900 border border-white/5 focus:outline-none"
                        >
                          <img
                            src={withWatermark(p.image_url)}
                            alt={p.title}
                            loading="lazy"
                            style={{
                              objectPosition: p.thumbnail_align === "bottom"
                                ? "center bottom"
                                : p.thumbnail_align === "center"
                                ? "center center"
                                : (p.height && p.width && p.height > p.width * 1.05)
                                ? "center 10%"
                                : "center 18%",
                            }}
                            className="w-full h-full object-cover opacity-85 transition-all duration-500 group-hover:opacity-100 group-hover:scale-110"
                          />
                        </button>
                      ))}
                  </div>
                </Reveal>
              </div>
            );
          })}
        </div>
      </div>

      {mounted && typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {lightbox && activeSeries && (
            <motion.div
              data-testid="series-lightbox"
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
              {/* Top Bar: Counter & Series title */}
              <div className="fixed top-5 left-5 sm:top-6 sm:left-8 z-[100000] flex items-center gap-2 pointer-events-none">
                <div className="px-3.5 py-1.5 rounded-full bg-neutral-900/90 backdrop-blur-md border border-white/20 text-xs font-mono-accent uppercase tracking-[0.2em] text-neutral-300 flex items-center gap-1.5 shadow-xl">
                  <span className="text-accent font-semibold">{activeSeries.index + 1}</span>
                  <span className="text-neutral-500">/</span>
                  <span>{activeSeries.items.length}</span>
                </div>
                <span className="hidden sm:inline-flex px-3 py-1.5 rounded-full bg-neutral-900/80 backdrop-blur-md border border-white/10 text-[10px] font-mono-accent uppercase tracking-[0.15em] text-accent">
                  {activeSeries.groupName}
                </span>
              </div>

              {/* High-Visibility Top-Right Close Button in Front */}
              <button
                type="button"
                data-testid="series-lightbox-close"
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
            {activeSeries.items.length > 1 && (
              <button
                type="button"
                data-testid="series-lightbox-prev"
                aria-label="Previous photo (Left arrow)"
                onClick={handlePrev}
                className="fixed left-2 sm:left-5 md:left-8 top-1/2 -translate-y-1/2 z-[130] w-11 h-11 sm:w-13 sm:h-13 md:w-14 md:h-14 rounded-full bg-neutral-900/85 hover:bg-accent hover:text-black text-white border border-white/25 hover:border-accent flex items-center justify-center backdrop-blur-md transition-all duration-300 shadow-2xl active:scale-90 hover:scale-105 cursor-pointer group"
              >
                <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7 transition-transform group-hover:-translate-x-0.5" />
              </button>
            )}

            {/* Next Frame Arrow (Right) */}
            {activeSeries.items.length > 1 && (
              <button
                type="button"
                data-testid="series-lightbox-next"
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
                    <p className="text-base sm:text-lg text-neutral-300 mt-1 font-serif" data-testid="series-lb-gu">
                      {lightbox.title_gu}
                    </p>
                  )}
                  <p className="font-mono-accent text-xs uppercase tracking-[0.2em] text-accent mt-1.5">
                    {lightbox.collection}{lightbox.location ? ` · ${lightbox.location}` : ""}
                  </p>
                  {lightbox.story && (
                    <p className="text-neutral-300 italic text-sm sm:text-base max-w-2xl mt-3 leading-relaxed" data-testid="series-lb-story">
                      {lightbox.story}
                    </p>
                  )}
                  {(lightbox.camera || lightbox.lens || lightbox.settings) && (
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-4 font-mono-accent text-[11px] uppercase tracking-[0.15em] text-neutral-400">
                      {lightbox.camera && (
                        <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10">
                          Body · {lightbox.camera}
                        </span>
                      )}
                      {lightbox.lens && (
                        <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10">
                          Lens · {lightbox.lens}
                        </span>
                      )}
                      {lightbox.settings && (
                        <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10">
                          {lightbox.settings}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0 pt-2 md:pt-0">
                  <button
                    type="button"
                    data-testid="series-share"
                    onClick={() => sharePhotoCard(lightbox)}
                    className="group flex-1 sm:flex-initial flex items-center justify-center gap-2.5 border border-white/25 px-5 py-3 text-xs uppercase tracking-[0.2em] text-white hover:bg-white hover:text-black transition-colors duration-300"
                  >
                    <Share2 size={16} />
                    <span>Share</span>
                  </button>
                  <button
                    type="button"
                    data-testid="series-request-print"
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
