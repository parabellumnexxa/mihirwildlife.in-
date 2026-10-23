import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Share2 } from "lucide-react";
import { getPhotos } from "@/lib/api";
import { withWatermark } from "@/lib/cloudinary";
import { sharePhotoCard } from "@/lib/share";
import { RevealLinesInView, Reveal } from "./Reveal";
import { PrintRequestDialog } from "./PrintRequestDialog";

const BASE = "https://res.cloudinary.com/uq0zgy3i/image/upload/q_auto,f_auto,w_1200/";

export const Series = ({ collections = {} }) => {
  const [groups, setGroups] = useState([]);
  const [lightbox, setLightbox] = useState(null);
  const [printOpen, setPrintOpen] = useState(false);

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

  if (groups.length === 0) return null;

  return (
    <section id="series" data-testid="series-section" className="relative z-10 py-24 md:py-32 bg-[#050505] border-t border-white/10">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12">
        <div className="max-w-2xl mb-20">
          <p className="font-mono-accent text-xs uppercase tracking-[0.3em] text-accent mb-4">
            Collections · Photo Essays
          </p>
          <h2 className="font-serif text-5xl md:text-7xl tracking-tight text-white leading-[0.9]">
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
                    onClick={() => setLightbox(coverPhoto)}
                    className="group relative block w-full aspect-[16/10] overflow-hidden bg-neutral-900 border border-white/10"
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
                          onClick={() => setLightbox(p)}
                          className="group relative aspect-square overflow-hidden bg-neutral-900"
                        >
                          <img
                            src={withWatermark(p.image_url)}
                            alt={p.title}
                            loading="lazy"
                            className="w-full h-full object-cover opacity-75 transition-all duration-500 group-hover:opacity-100 group-hover:scale-110"
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

      <AnimatePresence>
        {lightbox && (
          <motion.div
            data-testid="series-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 md:p-12"
            onClick={() => setLightbox(null)}
          >
            <button className="absolute top-6 right-6 text-white/70 hover:text-accent z-10" onClick={() => setLightbox(null)}>
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
                    <p className="text-lg text-neutral-300 mt-0.5" data-testid="series-lb-gu">{lightbox.title_gu}</p>
                  )}
                  <p className="font-mono-accent text-xs uppercase tracking-[0.2em] text-accent mt-1">
                    {lightbox.collection}{lightbox.location ? ` · ${lightbox.location}` : ""}
                  </p>
                  {lightbox.story && (
                    <p className="text-neutral-300 italic max-w-xl mt-3" data-testid="series-lb-story">{lightbox.story}</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-3 shrink-0">
                  <button
                    data-testid="series-share"
                    onClick={() => sharePhotoCard(lightbox)}
                    className="border border-white/25 px-6 py-3 text-xs uppercase tracking-[0.2em] text-white hover:bg-white hover:text-black transition-colors duration-400 flex items-center gap-3"
                  >
                    <Share2 size={16} /> Share
                  </button>
                  <button
                    data-testid="series-request-print"
                    onClick={() => setPrintOpen(true)}
                    className="border border-white/25 px-6 py-3 text-xs uppercase tracking-[0.2em] text-white hover:bg-accent hover:border-accent hover:text-black transition-colors duration-400"
                  >
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
