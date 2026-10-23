import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Frame, Share2 } from "lucide-react";
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

export const Gallery = () => {
  const [photos, setPhotos] = useState([]);
  const [active, setActive] = useState("All");
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);
  const [printOpen, setPrintOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    getPhotos(active === "All" ? null : active)
      .then(setPhotos)
      .finally(() => setLoading(false));
  }, [active]);

  return (
    <section id="gallery" data-testid="gallery-section" className="relative z-10 py-24 md:py-32 bg-[#050505]">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-14">
          <div>
            <p className="font-mono-accent text-xs uppercase tracking-[0.3em] text-accent mb-4">
              The Field Archive
            </p>
            <h2 className="font-serif text-5xl md:text-7xl tracking-tight text-white leading-[0.9]">
              <RevealLinesInView lines={["Selected", "Frames"]} testId="gallery-heading" />
            </h2>
          </div>

          <div className="flex flex-wrap gap-2" data-testid="gallery-filters">
            {CATEGORIES.map((c) => (
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
          <div className="grid grid-cols-1 md:grid-cols-12 auto-rows-[220px] md:auto-rows-[260px] gap-4">
            {photos.map((p, i) => (
              <Reveal
                key={p.id}
                delay={(i % 3) * 0.08}
                className={`${SPANS[i % SPANS.length]} group relative overflow-hidden cursor-pointer bg-neutral-900`}
              >
                <button
                  data-testid={`gallery-item-${i}`}
                  onClick={() => setLightbox(p)}
                  className="absolute inset-0 w-full h-full"
                >
                  <img
                    src={withWatermark(p.image_url)}
                    alt={p.title}
                    loading="lazy"
                    className="w-full h-full object-cover opacity-80 grayscale-[30%] transition-all duration-700 ease-out group-hover:scale-105 group-hover:opacity-100 group-hover:grayscale-0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-0 left-0 p-6 text-left translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    <p className="font-mono-accent text-[10px] uppercase tracking-[0.2em] text-accent mb-1">
                      {p.category}{p.location ? ` · ${p.location}` : ""}
                    </p>
                    <p className="font-serif text-2xl text-white leading-tight">{p.title}</p>
                    {p.title_gu && (
                      <p className="text-sm text-neutral-300 mt-0.5" data-testid={`gallery-gu-${i}`}>{p.title_gu}</p>
                    )}
                  </div>
                </button>
              </Reveal>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            data-testid="gallery-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 md:p-12"
            onClick={() => setLightbox(null)}
          >
            <button
              data-testid="lightbox-close"
              className="absolute top-6 right-6 text-white/70 hover:text-accent z-10"
              onClick={() => setLightbox(null)}
            >
              <X size={32} />
            </button>
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-6xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img src={withWatermark(lightbox.image_url)} alt={lightbox.title} className="w-full max-h-[72vh] object-contain" />
              <div className="mt-5 flex flex-col md:flex-row md:items-end md:justify-between gap-5">
                <div>
                  <p className="font-serif text-3xl text-white">{lightbox.title}</p>
                  {lightbox.title_gu && (
                    <p className="text-lg text-neutral-300 mt-0.5" data-testid="lb-title-gu">{lightbox.title_gu}</p>
                  )}
                  <p className="font-mono-accent text-xs uppercase tracking-[0.2em] text-accent mt-1">
                    {lightbox.category}{lightbox.location ? ` · ${lightbox.location}` : ""}
                  </p>
                  {lightbox.story && (
                    <p className="text-neutral-300 italic max-w-xl mt-3" data-testid="gallery-lb-story">{lightbox.story}</p>
                  )}
                  {(lightbox.camera || lightbox.lens || lightbox.settings) && (
                    <div className="flex flex-wrap gap-x-6 gap-y-1 mt-4 font-mono-accent text-[11px] uppercase tracking-[0.15em] text-neutral-400">
                      {lightbox.camera && <span data-testid="lb-camera">Body · {lightbox.camera}</span>}
                      {lightbox.lens && <span data-testid="lb-lens">Lens · {lightbox.lens}</span>}
                      {lightbox.settings && <span data-testid="lb-settings">{lightbox.settings}</span>}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-3 shrink-0">
                  <button
                    data-testid="lightbox-share"
                    onClick={() => sharePhotoCard(lightbox)}
                    className="group flex items-center gap-3 border border-white/25 px-6 py-3 text-xs uppercase tracking-[0.2em] text-white hover:bg-white hover:text-black transition-colors duration-400"
                  >
                    <Share2 size={16} />
                    Share
                  </button>
                  <button
                    data-testid="lightbox-request-print"
                    onClick={() => setPrintOpen(true)}
                    className="group flex items-center gap-3 border border-white/25 px-6 py-3 text-xs uppercase tracking-[0.2em] text-white hover:bg-accent hover:border-accent hover:text-black transition-colors duration-400"
                  >
                    <Frame size={16} />
                    Request a Print
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <PrintRequestDialog open={printOpen} onOpenChange={setPrintOpen} photo={lightbox} />
    </section>
  );
};
