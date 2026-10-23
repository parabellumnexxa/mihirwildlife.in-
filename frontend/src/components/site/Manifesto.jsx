import { MANIFESTO } from "@/lib/data";
import { Reveal, RevealLinesInView } from "./Reveal";

export const Manifesto = () => (
  <section id="manifesto" data-testid="manifesto-section" className="relative z-10 py-24 md:py-40 bg-[#0A0A0A] border-y border-white/10">
    <div className="max-w-[1600px] mx-auto px-6 md:px-12">
      <div className="max-w-2xl mb-20">
        <p className="font-mono-accent text-xs uppercase tracking-[0.3em] text-accent mb-4">
          The Ethos
        </p>
        <h2 className="font-serif text-5xl md:text-7xl tracking-tight text-white leading-[0.9]">
          <RevealLinesInView lines={["A closer look", "at nature"]} testId="manifesto-heading" />
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-x-16 gap-y-16">
        {MANIFESTO.map((m, i) => (
          <Reveal key={m.n} delay={(i % 2) * 0.1} className="flex gap-6 md:gap-10 group">
            <span className="font-serif text-6xl md:text-8xl leading-none text-white/10 group-hover:text-accent/60 transition-colors duration-700 shrink-0">
              {m.n}
            </span>
            <div className="pt-2 border-t border-white/10 flex-1">
              <h3 className="font-serif text-3xl md:text-4xl text-white mb-4">{m.title}</h3>
              <p className="text-neutral-400 leading-relaxed text-base md:text-lg">{m.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);
