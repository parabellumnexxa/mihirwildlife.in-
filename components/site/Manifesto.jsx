'use client';

import { useState } from "react";
import { Reveal, RevealLinesInView } from "./Reveal";

const principles = [
  {
    id: "01",
    title: "Story, not spectacle",
    text: "Every frame carries a narrative. I photograph birds and wildlife not merely to capture beauty, but to reveal the ecological threads that hold an ecosystem together.",
    bgImage: "https://res.cloudinary.com/uq0zgy3i/image/upload/q_auto,f_auto,w_1600/portfolio/photos/egigpcktwqqdcpj2ujxu.jpg",
  },
  {
    id: "02",
    title: "Fieldwork before the frame",
    text: "Since 2009, patience in the field — observing behaviour, understanding habitat — has been the foundation. The image is the result of the relationship, never a shortcut.",
    bgImage: "https://res.cloudinary.com/uq0zgy3i/image/upload/q_auto,f_auto,w_1600/portfolio/photos/nzocpu7ql6do2uhyusok.jpg",
  },
  {
    id: "03",
    title: "Conservation as purpose",
    text: "Through rescue work, workshops and education sessions across schools and institutions, photography becomes a tool for awareness and biodiversity protection.",
    bgImage: "https://res.cloudinary.com/uq0zgy3i/image/upload/q_auto,f_auto,w_1600/portfolio/photos/w9hccvbhizziedblagq6.jpg",
  },
  {
    id: "04",
    title: "Documentation with rigour",
    text: "Observations feed research — including publications with the Bombay Natural History Society — because a photograph can also be evidence for science.",
    bgImage: "https://res.cloudinary.com/uq0zgy3i/image/upload/q_auto,f_auto,w_1600/portfolio/photos/uddk7jtlctwmcgthqiua.jpg",
    hasBnhsLink: true,
  },
];

export const Manifesto = () => {
  const [activeBg, setActiveBg] = useState(null);

  return (
    <section id="ethos" data-testid="manifesto-section" className="relative z-10 py-20 md:py-28 bg-[#0A0A0A] border-y border-white/10 overflow-hidden">
      <div id="manifesto" className="sr-only" />

      {/* Fixed Background Image Container for Hover Reveals */}
      {principles.map((p) => (
        <div
          key={p.id}
          style={{ backgroundImage: `url(${p.bgImage})` }}
          className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out pointer-events-none mix-blend-luminosity ${
            activeBg === p.id ? 'opacity-20 scale-100 blur-[2px]' : 'opacity-0 scale-105'
          }`}
        />
      ))}

      {/* Subtle overlay to keep text completely readable */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-transparent to-[#0A0A0A] pointer-events-none" />

      <div className="relative z-10 max-w-[1600px] mx-auto px-6 md:px-12">
        {/* Header Block */}
        <div className="max-w-2xl mb-16">
          <p className="font-mono-accent text-xs uppercase tracking-[0.25em] text-emerald-400 mb-2">
            The Ethos · Core Values
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl tracking-tight text-white leading-tight">
            <RevealLinesInView lines={["A closer look", "at nature"]} testId="manifesto-heading" />
          </h2>
        </div>

        {/* Principles Interactive Grid */}
        <div className="grid md:grid-cols-2 gap-x-16 gap-y-16">
          {principles.map((p, i) => (
            <Reveal
              key={p.id}
              delay={(i % 2) * 0.1}
              className="flex gap-6 md:gap-10 group cursor-default transition-all duration-300"
            >
              <div
                onMouseEnter={() => setActiveBg(p.id)}
                onMouseLeave={() => setActiveBg(null)}
                className="flex gap-6 md:gap-10 w-full"
              >
                {/* Massive Minimalist Number */}
                <span className="font-serif text-6xl md:text-8xl leading-none text-white/10 group-hover:text-emerald-500/40 transition-colors duration-500 shrink-0 select-none">
                  {p.id}
                </span>

                {/* Text Block Container */}
                <div className="pt-2 border-t border-white/10 flex-1 space-y-3">
                  <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl text-white group-hover:text-emerald-400 transition-colors duration-300">
                    {p.title}
                  </h3>
                  <p className="text-neutral-400 leading-relaxed text-sm sm:text-base md:text-lg group-hover:text-zinc-200 transition-colors duration-300">
                    {p.hasBnhsLink ? (
                      <>
                        Observations feed research — including publications with the{" "}
                        <a
                          href="https://www.bnhs.org"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-400 border-b border-emerald-500/30 hover:border-emerald-400 transition-colors"
                        >
                          Bombay Natural History Society
                        </a>{" "}
                        — because a photograph can also be evidence for science.
                      </>
                    ) : (
                      p.text
                    )}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Minimalist Call to Action Section */}
        <div className="text-center pt-20">
          <div className="h-[1px] bg-zinc-800/80 w-24 mx-auto mb-8" />
          <a
            href="#portfolio"
            className="inline-block px-6 py-3 border border-zinc-800 rounded-lg text-xs font-semibold tracking-widest uppercase text-zinc-400 hover:text-white hover:bg-zinc-950 hover:border-zinc-700 transition-all duration-300"
          >
            Explore the Galleries
          </a>
        </div>
      </div>
    </section>
  );
};
