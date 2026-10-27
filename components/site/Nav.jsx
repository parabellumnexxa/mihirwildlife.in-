'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowUpRight } from "lucide-react";

export const Nav = ({ logoUrl, blogUrl, showBlog = true }) => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "About", href: "#about" },
    { label: "Portfolio", href: "#portfolio" },
    { label: "Initiatives & Affiliations", href: "#initiatives" },
    ...(showBlog
      ? [
          {
            label: "Blog",
            href: blogUrl && !blogUrl.includes("medium.com/@mihirwildlife") ? blogUrl : "/blog",
            external: true,
          },
        ]
      : []),
    { label: "Contact", href: "#contact" },
  ];

  const go = (href) => {
    setOpen(false);

    // If on a different page (e.g. /blog), navigate home with hash
    if (typeof window !== "undefined" && window.location.pathname !== "/" && window.location.pathname !== "") {
      window.location.href = `/${href}`;
      return;
    }

    // Small delay to allow the mobile drawer animation to start so document height stabilizes
    setTimeout(() => {
      const el = document.querySelector(href);
      if (!el) return;

      if (typeof window !== "undefined" && window.__lenis) {
        window.__lenis.scrollTo(el, { offset: -80, duration: 1.2 });
      } else {
        const top = el.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
      }
    }, 100);
  };

  return (
    <motion.header
      data-testid="site-nav"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-500 ${
        scrolled || open ? "backdrop-blur-xl bg-black/90 border-b border-white/10 shadow-2xl" : "bg-transparent"
      }`}
    >
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
        <a
          href="#top"
          onClick={(e) => { e.preventDefault(); go("#top"); }}
          data-testid="nav-logo"
          className="flex items-center gap-3 group"
        >
          {logoUrl ? (
            <img src={logoUrl} alt="Mihir Ranva Photography" className="h-12 md:h-14 w-auto object-contain" />
          ) : (
            <span className="font-serif text-2xl tracking-tight text-[#F5F5F5]">
              Mihir <span className="text-accent">Ranva</span>
            </span>
          )}
        </a>

        {/* Clean Desktop Navigation (No social icons in header) */}
        <nav className="hidden md:flex items-center gap-9">
          {links.map((l) =>
            l.external ? (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                data-testid={`nav-link-${l.label.toLowerCase()}`}
                className="hover-underline text-sm uppercase tracking-[0.15em] text-neutral-300 hover:text-white transition-colors inline-flex items-center gap-1 group"
              >
                <span>{l.label}</span>
                <ArrowUpRight
                  size={14}
                  className="text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                />
              </a>
            ) : (
              <button
                key={l.label}
                data-testid={`nav-link-${l.label.toLowerCase()}`}
                onClick={() => go(l.href)}
                className="hover-underline text-sm uppercase tracking-[0.15em] text-neutral-300 hover:text-white transition-colors"
              >
                {l.label}
              </button>
            )
          )}
        </nav>

        {/* Mobile menu button */}
        <button
          data-testid="nav-mobile-toggle"
          aria-label="Toggle navigation menu"
          className="md:hidden text-white p-2"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden overflow-hidden bg-black/95 backdrop-blur-2xl border-t border-white/10"
          >
            <div className="flex flex-col px-6 py-8 gap-4">
              {links.map((l) =>
                l.external ? (
                  <a
                    key={l.label}
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid={`nav-mobile-link-${l.label.toLowerCase()}`}
                    onClick={() => setOpen(false)}
                    className="text-left font-serif text-2xl text-neutral-200 flex items-center justify-between py-2 active:text-accent transition-colors"
                  >
                    <span>{l.label}</span>
                    <ArrowUpRight size={22} className="text-accent" />
                  </a>
                ) : (
                  <button
                    key={l.label}
                    type="button"
                    data-testid={`nav-mobile-link-${l.label.toLowerCase()}`}
                    onClick={() => go(l.href)}
                    className="text-left font-serif text-2xl text-neutral-200 py-2 w-full active:text-accent transition-colors cursor-pointer"
                  >
                    {l.label}
                  </button>
                )
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
};
