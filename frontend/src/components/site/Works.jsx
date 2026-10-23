import { WORKS } from "@/lib/data";
import { Reveal, RevealLinesInView } from "./Reveal";
import { ArrowUpRight } from "lucide-react";

export const Works = () => (
  <section id="works" data-testid="works-section" className="relative z-10 py-24 md:py-32 bg-[#050505]">
    <div className="max-w-[1600px] mx-auto px-6 md:px-12">
      <div className="max-w-2xl mb-16">
        <p className="font-mono-accent text-xs uppercase tracking-[0.3em] text-accent mb-4">
          Published Work
        </p>
        <h2 className="font-serif text-5xl md:text-7xl tracking-tight text-white leading-[0.9]">
          <RevealLinesInView lines={["Books &", "Publications"]} testId="works-heading" />
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {WORKS.map((w, i) => {
          const Wrapper = w.link ? "a" : "div";
          return (
            <Reveal key={w.title} delay={i * 0.1}>
              <Wrapper
                {...(w.link ? { href: w.link, target: "_blank", rel: "noopener noreferrer" } : {})}
                data-testid={`work-${i}`}
                className="group block h-full border border-white/10 p-8 md:p-12 hover:border-accent/50 transition-colors duration-500 bg-[#0A0A0A]"
              >
                <div className="flex items-center justify-between mb-8">
                  <span className="font-mono-accent text-xs uppercase tracking-[0.2em] text-accent">
                    {w.type} · {w.year}
                  </span>
                  {w.link && (
                    <ArrowUpRight
                      size={22}
                      className="text-neutral-500 group-hover:text-accent group-hover:-translate-y-1 group-hover:translate-x-1 transition-all duration-500"
                    />
                  )}
                </div>
                <h3 className="font-serif text-3xl md:text-4xl text-white leading-tight mb-5">{w.title}</h3>
                <p className="text-neutral-400 leading-relaxed mb-8">{w.desc}</p>
                <span className="text-sm uppercase tracking-[0.15em] text-neutral-300 hover-underline">
                  {w.linkLabel}
                </span>
              </Wrapper>
            </Reveal>
          );
        })}
      </div>
    </div>
  </section>
);
