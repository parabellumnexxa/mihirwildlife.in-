'use client';

import React from 'react';
import Image from 'next/image';
import heroBird from '@/public/images/hero-bird.jpg';

export default function HeroSection({ imageSrc = heroBird }) {
  const handleScrollToGallery = () => {
    const gallerySection = document.getElementById('gallery-start') || document.getElementById('portfolio') || document.getElementById('gallery');
    if (gallerySection) {
      if (typeof window !== 'undefined' && window.__lenis) {
        window.__lenis.scrollTo(gallerySection, { offset: -80, duration: 1.2 });
      } else {
        gallerySection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section className="relative min-h-screen w-full bg-black flex flex-col justify-between text-zinc-100 select-none overflow-hidden">
      {/* 1. NEXT.JS OPTIMIZED BACKGROUND IMAGE COMPONENT */}
      {/* 
        - fill: Makes the image component match the exact bounding size of the parent section.
        - priority: Critical LCP image, rendering instantly without lazy-load delays.
        - object-fit: Replaces 'bg-cover bg-center md:bg-right' flawlessly using responsive Tailwind states.
      */}
      <Image
        src={imageSrc}
        alt="Mihir Ranva Wildlife Photography Background"
        fill
        priority
        placeholder="blur"
        sizes="100vw"
        className="object-cover object-center md:object-right z-0 pointer-events-none"
      />

      {/* 2. CINEMATIC GRADIENT LAYER OVERLAY */}
      {/* Absolute layer positioned over Image (z-10) to make sure typography contrasts cleanly */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/90 md:bg-gradient-to-r md:from-black/85 md:via-black/50 md:to-transparent z-10 pointer-events-none" />

      {/* 3. FLOATING INTERACTIVE NAVBAR */}
      <header className="relative z-20 flex justify-between items-center w-full px-6 py-5 md:px-12 max-w-7xl mx-auto">
        <div className="cursor-pointer font-serif text-lg font-semibold tracking-wide text-white">
          Mihir Ranva <span className="text-[10px] tracking-widest font-sans font-normal text-zinc-500 uppercase block md:inline md:ml-2">Photography</span>
        </div>

        <button
          aria-label="Toggle Menu"
          className="p-2 rounded-lg bg-zinc-950/40 border border-zinc-800/40 backdrop-blur-md text-zinc-400 hover:text-white hover:border-zinc-700 transition-all duration-300 active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
      </header>

      {/* 4. HERO TYPOGRAPHY CONTENT FRAME */}
      <div className="relative z-20 max-w-7xl mx-auto w-full px-6 md:px-12 flex-1 flex items-center">
        <div className="max-w-xl space-y-5 md:space-y-6 py-12">
          <span className="text-[9px] md:text-xs font-bold tracking-[0.25em] text-emerald-400 uppercase block">
            IT Professional • Wildlife Photographer • Conservationist
          </span>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-white leading-tight">
            Mihir Ranva
          </h1>

          <p className="text-sm md:text-base leading-relaxed text-zinc-300 max-w-md font-light">
            Bringing technical precision to the art of visual storytelling. By combining advanced digital expertise with a lifelong passion for field biology, I capture compelling wildlife narratives that drive active conservation.
          </p>

          <div className="pt-2">
            <button
              onClick={handleScrollToGallery}
              className="flex items-center space-x-3 group px-5 py-3 border border-zinc-800 bg-zinc-950/40 backdrop-blur-sm rounded-lg text-xs font-semibold tracking-widest uppercase text-zinc-300 hover:text-white hover:bg-zinc-900 hover:border-zinc-700 transition-all duration-300 shadow-xl cursor-pointer"
            >
              <span>Enter the Field</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="w-3.5 h-3.5 text-emerald-400 transition-transform duration-300 group-hover:translate-y-1"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 5. MINIMALIST FOOTER COMPONENT */}
      <footer className="relative z-20 max-w-7xl mx-auto w-full px-6 py-6 md:px-12 flex justify-between items-center text-xs font-mono text-zinc-600 select-none">
        <span>© {new Date().getFullYear()} MIHIR RANVA</span>
        <span className="animate-pulse text-emerald-500/60">•</span>
      </footer>
    </section>
  );
}
