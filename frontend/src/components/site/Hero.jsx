import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { RevealLines } from "./Reveal";
import { ArrowDown } from "lucide-react";

export const Hero = ({ heroImage }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      id="top"
      ref={ref}
      data-testid="hero-section"
      className="relative min-h-screen w-full overflow-hidden flex items-end"
    >
      <motion.div style={{ y, scale }} className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Wildlife hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
      </motion.div>

      <motion.div
        style={{ opacity }}
        className="relative z-10 max-w-[1600px] mx-auto w-full px-6 md:px-12 pb-20 md:pb-28"
      >
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="font-mono-accent text-xs md:text-sm uppercase tracking-[0.3em] text-accent mb-6"
        >
          Wildlife Photographer · Birding Educator · Conservation Advocate
        </motion.p>

        <h1 className="font-display font-semibold text-[15vw] md:text-[10vw] leading-[0.85] tracking-tight text-white">
          <RevealLines lines={["Mihirkumar"]} delay={0.3} testId="hero-title-1" />
          <RevealLines
            lines={["Ranva"]}
            delay={0.5}
            className="italic text-accent"
            testId="hero-title-2"
          />
        </h1>

        <div className="mt-8 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 1 }}
            className="max-w-md text-base md:text-lg text-neutral-300 leading-relaxed"
          >
            Capturing wildlife stories for conservation — not just documentation. A visual
            record of birds, behaviour and the ecosystems that bind them.
          </motion.p>

          <motion.a
            href="#gallery"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector("#gallery")?.scrollIntoView({ behavior: "smooth" });
            }}
            data-testid="hero-scroll-cta"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3, duration: 1 }}
            className="group flex items-center gap-3 text-sm uppercase tracking-[0.2em] text-white"
          >
            <span className="hover-underline">Enter the field</span>
            <span className="w-11 h-11 rounded-full border border-white/30 flex items-center justify-center group-hover:bg-accent group-hover:border-accent transition-all duration-500">
              <ArrowDown size={16} className="group-hover:text-black transition-colors" />
            </span>
          </motion.a>
        </div>
      </motion.div>
    </section>
  );
};
