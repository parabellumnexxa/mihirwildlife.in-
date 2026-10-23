import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Reveal, RevealLinesInView } from "./Reveal";
import { ORGS } from "@/lib/data";

export const About = ({ aboutImage }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "12%"]);

  return (
    <section id="about" data-testid="about-section" className="relative z-10 py-24 md:py-32 bg-[#050505]">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 grid md:grid-cols-12 gap-10 md:gap-16 items-start">
        {/* Image with clipped frame */}
        <Reveal className="md:col-span-5 relative" testId="about-image-wrap">
          <div ref={ref} className="relative overflow-hidden aspect-[4/5] border border-white/10">
            <motion.img
              style={{ y }}
              src={aboutImage}
              alt="Mihirkumar Ranva"
              className="w-full h-[115%] object-cover object-center"
            />
          </div>
          <div className="absolute -bottom-5 -right-4 md:-right-6 bg-accent text-black px-6 py-4">
            <p className="font-mono-accent text-xs uppercase tracking-[0.15em]">Since</p>
            <p className="font-serif text-4xl leading-none">2009</p>
          </div>
        </Reveal>

        {/* Text */}
        <div className="md:col-span-7 md:pl-6">
          <p className="font-mono-accent text-xs uppercase tracking-[0.3em] text-accent mb-4">
            About the Photographer
          </p>
          <h2 className="font-serif text-4xl md:text-6xl tracking-tight text-white leading-[0.95] mb-8">
            <RevealLinesInView lines={["Birds, behaviour", "& the wild"]} testId="about-heading" />
          </h2>

          <Reveal delay={0.1}>
            <div className="space-y-5 text-neutral-300 text-base md:text-lg leading-relaxed max-w-2xl">
              <p>
                Mihirkumar Ranva is an Indian wildlife photographer, birding educator, and
                conservation advocate based in Junagadh. His work documents birds, wildlife
                behaviour, and natural ecosystems through photography and field observation.
              </p>
              <p>
                With a deep passion for nature since childhood, he focuses on bird ecology,
                wildlife documentation, and conservation storytelling — images that go beyond
                aesthetics to highlight ecological importance and inspire awareness about
                biodiversity.
              </p>
              <p>
                He has led wildlife awareness programs and photography workshops with Canon India,
                SBI RSETI, Podar International School and Sakkarbaug Zoological Garden, and is
                actively involved in wildlife and bird rescue initiatives at the grassroots level.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.2} className="mt-10">
            <p className="font-mono-accent text-xs uppercase tracking-[0.2em] text-neutral-500 mb-4">
              Member & Affiliations
            </p>
            <div className="flex flex-wrap gap-3">
              {ORGS.map((o) => (
                <span key={o} className="px-4 py-2 border border-white/15 text-sm text-neutral-300">
                  {o}
                </span>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.3} className="mt-10 border-l-2 border-accent pl-6">
            <p className="font-serif italic text-2xl md:text-3xl text-white leading-snug">
              “Capturing Wildlife Stories for Conservation, Not Just Documentation.”
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
};
