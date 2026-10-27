'use client';

import { ACHIEVEMENTS } from "@/lib/data";
import { Reveal, RevealLinesInView } from "./Reveal";

export const Achievements = () => (
  <section id="achievements" data-testid="achievements-section" className="relative z-10 py-16 md:py-24 bg-[#0A0A0A] border-y border-white/10">
    <div className="max-w-[1600px] mx-auto px-6 md:px-12">
      <div className="max-w-2xl mb-10">
        <p className="font-mono-accent text-xs uppercase tracking-[0.25em] text-accent mb-2">
          The Journey · 2011 — 2026
        </p>
        <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl tracking-tight text-white leading-tight">
          <RevealLinesInView lines={["Milestones"]} testId="achievements-heading" />
        </h2>
      </div>

      <div className="border-l border-white/15 ml-2 md:ml-3">
        {ACHIEVEMENTS.map((a, i) => (
          <Reveal key={a.year} delay={(i % 2) * 0.05} className="relative pl-8 md:pl-14 pb-12 last:pb-0 group">
            <span className="absolute left-0 top-2 -translate-x-1/2 w-3 h-3 rounded-full bg-neutral-600 group-hover:bg-accent transition-colors duration-500" />
            <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-8">
              <span className="font-mono-accent text-accent text-sm w-16 shrink-0">{a.year}</span>
              <div>
                <h3 className="font-serif text-2xl md:text-3xl text-white mb-1">{a.title}</h3>
                <p className="text-neutral-400 leading-relaxed max-w-2xl">{a.desc}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);
