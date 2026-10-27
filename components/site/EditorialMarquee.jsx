'use client';

import Marquee from "react-fast-marquee";

const WORDS = ["Birds", "Conservation", "Ecology", "Wildlife", "Storytelling", "Junagadh", "Fieldwork"];

export const EditorialMarquee = () => (
  <section data-testid="marquee-section" className="relative z-10 py-16 md:py-24 bg-[#050505] overflow-hidden">
    <Marquee speed={30} gradient={false} className="overflow-hidden">
      {WORDS.map((w, i) => (
        <span key={i} className="flex items-center">
          <span className="font-serif italic text-6xl md:text-8xl text-white/90 mx-8">{w}</span>
          <span className="text-accent text-4xl md:text-6xl mx-4">✦</span>
        </span>
      ))}
    </Marquee>
  </section>
);
