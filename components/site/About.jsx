'use client';

import { ORGS } from "@/lib/data";

export const About = ({ aboutImage }) => {
  const portraitSrc = aboutImage || "/images/mihir-portrait.jpg";

  return (
    <section
      id="about"
      data-testid="about-section"
      className="w-full bg-[#050505] text-[#F5F5F5] px-5 py-16 sm:px-12 md:py-24 max-w-7xl mx-auto overflow-hidden scroll-mt-20"
    >
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12 w-full">
        {/* Optimized Portrait Container Frame */}
        <div
          data-testid="about-image-wrap"
          className="relative w-full max-w-sm aspect-[3/4] rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800/60 shadow-xl group shrink-0"
        >
          <img
            src={portraitSrc}
            alt="Mihir Ranva"
            className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
          />

          {/* Premium Integrated 'Since 2009' Badge Component Overlay */}
          <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-md border border-zinc-800/80 px-4 py-2.5 rounded-lg text-right shadow-2xl">
            <span className="text-[9px] font-bold tracking-widest text-zinc-500 uppercase block mb-0.5">
              Established
            </span>
            <span className="text-sm font-mono font-semibold text-emerald-400 tracking-wide">
              SINCE 2009
            </span>
          </div>
        </div>

        {/* Biography Content Grid */}
        <div className="flex-1 space-y-5 text-left w-full">
          <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase block">
            About Mihir • Core Biography
          </span>

          <h2
            className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-white leading-tight"
            data-testid="about-heading"
          >
            Bridging Tech &amp; Conservation
          </h2>

          <div className="space-y-4 text-sm sm:text-base leading-relaxed text-zinc-300 font-light text-left">
            <p>
              Based in Junagadh, Gujarat, my journey began with a childhood passion for nature that evolved into a dedicated career documenting bird ecology, wildlife behaviours, and fragile ecosystems. I believe in capturing wildlife stories for conservation, not just documentation—creating impact-driven imagery that goes beyond aesthetics to highlight ecological importance and inspire biodiversity awareness.
            </p>
            <p>
              Bridging the worlds of technology and nature, I leverage my analytical IT background to enhance modern digital field monitoring, data accuracy, and visual preservation.
            </p>
            <p>
              Through certified workshop partnerships with Canon India and SBI RSETI, active civic training with Podar International School and Sakkarbaug Zoological Garden, and grassroots avian and wildlife rescue operations, my work combines scientific documentation with community stewardship.
            </p>
          </div>

          {/* Member & Affiliations */}
          <div className="pt-3">
            <p className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase mb-3">
              Member &amp; Affiliations
            </p>
            <div className="flex flex-wrap gap-2 sm:gap-2.5">
              {ORGS.map((o) => (
                <span
                  key={o}
                  className="px-3.5 py-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 text-xs text-zinc-300 hover:border-zinc-700 transition-colors"
                >
                  {o}
                </span>
              ))}
            </div>
          </div>

          {/* Editorial Quote */}
          <div className="pt-3 border-l-2 border-emerald-400 pl-4 sm:pl-5">
            <p className="font-serif italic text-lg sm:text-xl text-white leading-snug">
              “Capturing Wildlife Stories for Conservation, Not Just Documentation.”
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
