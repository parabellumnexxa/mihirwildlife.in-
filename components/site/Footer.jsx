'use client';

import Link from "next/link";
import { SocialLinks } from "./SocialLinks";

export const Footer = ({ logoUrl, socials = {}, instagram }) => {
  const mergedSocials = {
    ...socials,
    instagram: instagram || socials.instagram,
  };

  return (
    <footer data-testid="site-footer" className="relative z-10 bg-[#050505] border-t border-white/10 py-16">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <img src={logoUrl} alt="Mihir Ranva Photography" className="h-16 w-auto object-contain" />
          ) : (
            <span className="font-serif text-xl text-white">
              Mihir <span className="text-accent">Ranva</span>
            </span>
          )}
        </div>

        {/* Central Social Connect Icons */}
        <div className="flex flex-col items-center gap-3">
          <p className="font-mono-accent text-[11px] uppercase tracking-[0.25em] text-neutral-500">
            Connect & Follow
          </p>
          <SocialLinks socials={mergedSocials} variant="footer" />
        </div>

        {/* Copyright & Admin Link */}
        <div className="flex flex-col md:items-end items-center gap-2">
          <p className="font-serif text-base tracking-wide text-neutral-400 text-center md:text-right">
            © {new Date().getFullYear()} · Mihir Ranva Photography
          </p>
          <Link
            href="/admin"
            data-testid="footer-admin-link"
            className="text-xs uppercase tracking-[0.2em] text-neutral-600 hover:text-accent transition-colors"
          >
            Studio Admin
          </Link>
        </div>
      </div>
    </footer>
  );
};
