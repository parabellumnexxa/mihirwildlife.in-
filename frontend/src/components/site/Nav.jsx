import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const LINKS = [
  { label: "Gallery", href: "#gallery" },
  { label: "Series", href: "#series" },
  { label: "Ethos", href: "#manifesto" },
  { label: "About", href: "#about" },
  { label: "Journey", href: "#achievements" },
  { label: "Works", href: "#works" },
  { label: "Contact", href: "#contact" },
];

export const Nav = ({ logoUrl }) => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (href) => {
    setOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.header
      data-testid="site-nav"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-500 ${
        scrolled ? "backdrop-blur-xl bg-black/60 border-b border-white/10" : "bg-transparent"
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

        <nav className="hidden md:flex items-center gap-9">
          {LINKS.map((l) => (
            <button
              key={l.href}
              data-testid={`nav-link-${l.label.toLowerCase()}`}
              onClick={() => go(l.href)}
              className="hover-underline text-sm uppercase tracking-[0.15em] text-neutral-300 hover:text-white transition-colors"
            >
              {l.label}
            </button>
          ))}
        </nav>

        <button
          data-testid="nav-mobile-toggle"
          className="md:hidden text-white"
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
            className="md:hidden overflow-hidden bg-black/90 backdrop-blur-xl border-t border-white/10"
          >
            <div className="flex flex-col px-6 py-6 gap-5">
              {LINKS.map((l) => (
                <button
                  key={l.href}
                  data-testid={`nav-mobile-link-${l.label.toLowerCase()}`}
                  onClick={() => go(l.href)}
                  className="text-left font-serif text-2xl text-neutral-200"
                >
                  {l.label}
                </button>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
};
