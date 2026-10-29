'use client';

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import NextImage from "next/image";
import { ArrowDown } from "lucide-react";

const DEFAULT_HERO_IMAGES = [
  "https://res.cloudinary.com/uq0zgy3i/image/upload/v1793089356/portfolio/brand/zbzkn3hwd1j05ihagzqv.jpg",
  "https://res.cloudinary.com/uq0zgy3i/image/upload/q_auto,f_auto,w_2200/lion_pride_9_de9akv.jpg",
  "https://res.cloudinary.com/uq0zgy3i/image/upload/q_auto,f_auto,w_2200/070A1006_ncv8gi.jpg",
  "https://res.cloudinary.com/uq0zgy3i/image/upload/q_auto,f_auto,w_2200/lion_pride_3_jwn89m.jpg",
  "https://res.cloudinary.com/uq0zgy3i/image/upload/q_auto,f_auto,w_1600/lion_pride_13_q5bwgp.jpg",
];

export const Hero = ({ heroImage, heroImages = [] }) => {
  const ref = useRef(null);

  // Parallax and scroll effects
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.18]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);

  // Compile valid hero images list
  const activeImages = (heroImages && heroImages.length > 0)
    ? heroImages.map((img) => (typeof img === "string" ? img : img?.url)).filter(Boolean)
    : [heroImage, ...DEFAULT_HERO_IMAGES.slice(1)].filter(Boolean);

  const images = activeImages.length > 0 ? activeImages : DEFAULT_HERO_IMAGES;

  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  // 10-second automatic photo rotation
  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(nextSlide, 10000);
    return () => clearInterval(interval);
  }, [images.length, nextSlide]);

  // Preload next image for instant, smooth crossfading
  useEffect(() => {
    if (images.length <= 1) return;
    if (typeof window !== "undefined") {
      const nextImg = new window.Image();
      const nextIdx = (currentIndex + 1) % images.length;
      nextImg.src = images[nextIdx];
    }
  }, [currentIndex, images]);

  const scrollToPortfolio = (e) => {
    e.preventDefault();
    const el = document.querySelector("#portfolio") || document.querySelector("#gallery");
    if (!el) return;
    if (typeof window !== "undefined" && window.__lenis) {
      window.__lenis.scrollTo(el, { offset: -80, duration: 1.2 });
    } else {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    }
  };

  return (
    <section
      id="top"
      ref={ref}
      data-testid="hero-section"
      className="relative min-h-screen w-full overflow-hidden flex items-end scroll-mt-20 select-none"
    >
      {/* Background Slideshow with Parallax & Ken Burns Effect */}
      <motion.div style={{ y: bgY, scale: bgScale }} className="absolute inset-0 z-0">
        <AnimatePresence initial={false} mode="sync">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <NextImage
              src={images[currentIndex]}
              alt={`Wildlife hero slide ${currentIndex + 1}`}
              fill
              priority={currentIndex === 0}
              sizes="100vw"
              className="object-cover object-center md:object-right pointer-events-none"
            />
          </motion.div>
        </AnimatePresence>

        {/* Dark Cinematic Gradient Overlay: Guarantees 100% typography readability on mobile, asymmetric fade on desktop */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/95 md:bg-gradient-to-r md:from-black/85 md:via-black/50 md:to-transparent z-0 pointer-events-none" />
        <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30 pointer-events-none" />
      </motion.div>

      {/* Hero Content Overlay */}
      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-10 max-w-[1600px] mx-auto w-full px-6 md:px-16 pb-16 sm:pb-20 md:pb-28"
      >
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="font-mono-accent text-[10px] md:text-xs uppercase tracking-[0.25em] text-accent mb-4 md:mb-6 font-bold"
        >
          IT Professional · Wildlife Photographer · Conservationist
        </motion.h2>

        <h1 className="font-display font-semibold text-5xl sm:text-7xl md:text-8xl lg:text-[7.5vw] xl:text-[8vw] leading-[0.9] tracking-tight text-white flex flex-wrap sm:flex-nowrap items-baseline gap-x-3 sm:gap-x-5 md:gap-x-7">
          <span data-testid="hero-title-1" className="overflow-hidden inline-block">
            <motion.span
              className="inline-block"
              initial={{ y: "110%" }}
              animate={{ y: 0 }}
              transition={{ duration: 1, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              Mihir
            </motion.span>
          </span>
          <span data-testid="hero-title-2" className="overflow-hidden inline-block italic text-accent">
            <motion.span
              className="inline-block"
              initial={{ y: "110%" }}
              animate={{ y: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              Ranva
            </motion.span>
          </span>
        </h1>

        <div className="mt-8 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 1 }}
            className="max-w-2xl text-sm sm:text-base md:text-lg text-zinc-300 leading-relaxed font-light"
          >
            Bringing technical precision to the art of visual storytelling. By combining advanced digital expertise with a lifelong passion for field biology, I capture compelling wildlife narratives that drive active conservation. My work serves as a precise digital and visual record of avian life, behaviour, and the intricate ecosystems that sustain them.
          </motion.p>

          <motion.a
            href="#portfolio"
            onClick={scrollToPortfolio}
            data-testid="hero-scroll-cta"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 1 }}
            className="group flex items-center gap-3 text-xs sm:text-sm uppercase tracking-[0.2em] text-white cursor-pointer"
          >
            <span className="hover-underline">Enter the field</span>
            <span className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-white/30 flex items-center justify-center group-hover:bg-accent group-hover:border-accent transition-all duration-500">
              <ArrowDown size={16} className="group-hover:text-black transition-colors" />
            </span>
          </motion.a>
        </div>
      </motion.div>
    </section>
  );
};
