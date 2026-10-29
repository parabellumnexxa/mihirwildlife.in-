'use client';

import { useState } from "react";

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
    <section
      id="ethos"
      data-testid="manifesto-section"
      className="relative z-10 w-full bg-[#050505] text-[#F5F5F5] border-y border-zinc-800/60 overflow-hidden scroll-mt-20 select-none"
    >
      <div id="manifesto" className="sr-only" />

      {/* Dynamic Background Image Layers for Hover Reveals */}
      {principles.map((p) => (
        <div
          key={p.id}
          style={{ backgroundImage: `url(${p.bgImage})` }}
          className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out pointer-events-none mix-blend-luminosity ${
            activeBg === p.id ? 'opacity-20 scale-100 blur-[2px]' : 'opacity-0 scale-105'
          }`}
        />
      ))}

      {/* Subtle overlay to preserve high readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505] pointer-events-none" />

      <div className="relative z-10 px-5 py-16 sm:px-12 md:py-24 max-w-7xl mx-auto">
        {/* Header Block */}
        <div className="max-w-2xl mb-12 sm:mb-16 text-left">
          <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase block mb-2">
            The Ethos • Core Values
          </span>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white leading-tight"
            data-testid="manifesto-heading"
          >
            A closer look at nature
          </h2>
        </div>

        {/* The Ethos Grid & Values Section (Clean separate-column flex layout) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-10 sm:gap-y-16">
          {principles.map((p) => (
            <div
              key={p.id}
              onMouseEnter={() => setActiveBg(p.id)}
              onMouseLeave={() => setActiveBg(null)}
              className="flex items-start space-x-5 group cursor-default transition-all duration-300"
            >
              {/* Massive structural layout number */}
              <div className="text-3xl sm:text-4xl font-light tracking-tight text-zinc-700 group-hover:text-emerald-500/60 transition-colors duration-300 select-none pt-0.5 w-9 shrink-0 font-mono">
                {p.id}
              </div>

              {/* Text copy section */}
              <div className="space-y-2 flex-1 text-left">
                <h3 className="text-base sm:text-lg font-medium tracking-wide text-white group-hover:text-emerald-400 transition-colors duration-300">
                  {p.title}
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed text-zinc-400 font-light group-hover:text-zinc-200 transition-colors duration-300">
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
          ))}
        </div>

        {/* Minimalist Action Interface */}
        <div className="text-center pt-16 sm:pt-20">
          <div className="h-[1px] bg-zinc-800/80 w-24 mx-auto mb-8" />
          <a
            href="#portfolio"
            className="inline-block px-6 py-3 border border-zinc-800 bg-zinc-950/40 backdrop-blur-sm rounded-lg text-xs font-semibold tracking-widest uppercase text-zinc-300 hover:text-white hover:bg-zinc-900 hover:border-zinc-700 transition-all duration-300 shadow-xl cursor-pointer"
          >
            Explore the Field Archive
          </a>
        </div>
      </div>
    </section>
  );
};
