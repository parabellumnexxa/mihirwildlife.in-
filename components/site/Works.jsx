'use client';

import { WORKS } from "@/lib/data";

export const Works = () => (
  <section
    id="works"
    data-testid="works-section"
    className="w-full bg-[#050505] text-[#F5F5F5] overflow-hidden scroll-mt-20"
  >
    <div className="px-5 py-16 sm:px-12 md:py-24 max-w-7xl mx-auto">
      {/* Header Block */}
      <div className="max-w-2xl mb-10 sm:mb-14 text-left">
        <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase block mb-2">
          Published Work
        </span>
        <h2
          className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white leading-tight"
          data-testid="works-heading"
        >
          Books &amp; Publications
        </h2>
      </div>

      {/* Published Work Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {WORKS.map((w, i) => (
          <div
            key={w.title}
            data-testid={`work-${i}`}
            className="bg-zinc-900/30 border border-zinc-800/60 rounded-xl p-5 sm:p-7 flex flex-col justify-between h-full space-y-6 text-left hover:border-zinc-700 transition-all duration-300 group"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
                <span>{w.type}</span>
                <span>{w.year}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-medium text-white tracking-wide group-hover:text-emerald-400 transition-colors">
                {w.title}
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed text-zinc-400 font-light">
                {w.desc}
              </p>
            </div>

            {/* Clean, aligned action interface link button */}
            <div className="pt-2">
              {w.link ? (
                <a
                  href={w.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-[11px] font-semibold tracking-widest text-emerald-400 uppercase border-b border-emerald-500/20 hover:border-emerald-400 pb-1 transition-all duration-300 cursor-pointer"
                >
                  <span>{w.linkLabel || "View on Amazon"}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2.5"
                    stroke="currentColor"
                    className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25" />
                  </svg>
                </a>
              ) : (
                <span className="inline-flex items-center space-x-2 text-[11px] font-semibold tracking-widest text-zinc-500 uppercase border-b border-zinc-800 pb-1">
                  <span>{w.linkLabel || "Archived Research"}</span>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
