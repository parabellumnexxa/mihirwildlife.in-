'use client';

import { ACHIEVEMENTS } from "@/lib/data";

export const Achievements = () => (
  <section
    id="achievements"
    data-testid="achievements-section"
    className="w-full bg-[#050505] text-[#F5F5F5] border-y border-zinc-800/60 overflow-hidden scroll-mt-20"
  >
    <div className="px-5 py-16 sm:px-12 md:py-24 max-w-7xl mx-auto">
      {/* Header Block */}
      <div className="max-w-2xl mb-12 sm:mb-16 text-left">
        <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase block mb-2">
          The Journey • 2011 — 2026
        </span>
        <h2
          className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white leading-tight"
          data-testid="achievements-heading"
        >
          Milestones
        </h2>
      </div>

      {/* The Milestones & Timeline Section (Clean offset to eliminate track collision) */}
      <div className="max-w-2xl relative border-l border-zinc-800/80 ml-2 sm:ml-4 space-y-10 py-4">
        {ACHIEVEMENTS.map((a) => (
          <div key={a.year} className="relative pl-8 text-left group">
            {/* Dynamic dot node indicator */}
            <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-zinc-800 group-hover:bg-emerald-400 ring-4 ring-[#050505] transition-colors duration-300" />

            <span className="text-[11px] font-mono tracking-widest text-zinc-500 group-hover:text-emerald-400/80 transition-colors block mb-1">
              {a.year}
            </span>
            <h4 className="text-base sm:text-lg font-medium text-white group-hover:text-emerald-400 transition-colors duration-300">
              {a.title}
            </h4>
            <p className="text-xs sm:text-sm leading-relaxed text-zinc-400 font-light mt-1 max-w-xl">
              {a.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
