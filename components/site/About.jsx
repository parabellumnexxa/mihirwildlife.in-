'use client';

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Reveal, RevealLinesInView } from "./Reveal";
import { ORGS } from "@/lib/data";

export const About = ({ aboutImage }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "12%"]);

  return (
    <section id="about" data-testid="about-section" className="relative z-10 py-24 md:py-32 bg-[#050505] scroll-mt-20">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 grid md:grid-cols-12 gap-10 md:gap-16 items-start">
        {/* Image with clipped frame */}
        <Reveal className="md:col-span-5 relative" testId="about-image-wrap">
          <div ref={ref} className="relative overflow-hidden aspect-[4/5] border border-white/10">
            <motion.img
              style={{ y }}
              src={aboutImage}
              alt="Mihir Ranva"
              className="w-full h-[115%] object-cover object-center"
            />
          </div>
          <div 
            className="absolute -bottom-5 -right-4 md:-right-6 px-6 py-4 backdrop-blur-md border border-[#C9A25E]/40 shadow-2xl text-white"
            style={{ backgroundColor: 'rgba(201, 162, 94, 0.5)' }}
          >
            <p className="font-mono-accent text-xs uppercase tracking-[0.15em] text-neutral-100/90">Since</p>
            <p className="font-serif text-4xl leading-none font-medium text-white">2009</p>
          </div>
        </Reveal>

        {/* Text */}
        <div className="md:col-span-7 md:pl-6">
          <p className="font-mono-accent text-xs uppercase tracking-[0.25em] text-accent mb-2">
            About Mihir · Core Biography
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight text-white leading-tight mb-5" data-testid="about-heading">
            Bridging Tech &amp; Conservation
          </h2>

          <div>
            <div className="space-y-4 text-neutral-300 text-base md:text-lg leading-relaxed max-w-2xl font-light text-justify">
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
          </div>

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
