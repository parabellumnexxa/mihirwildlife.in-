'use client';

import { Instagram, Facebook, Linkedin, Mail } from "lucide-react";

// Official X (formerly Twitter) icon component
function XIcon({ size = 16, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

// Official Threads icon component
function ThreadsIcon({ size = 16, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12.186 24c-3.513 0-6.28-1.16-8.225-3.45-1.92-2.261-2.906-5.419-2.932-9.387.026-3.968 1.012-7.126 2.932-9.388C5.906 1.487 8.673.327 12.186.327c3.486 0 6.239 1.146 8.183 3.407 1.867 2.17 2.827 5.234 2.853 9.106h-3.427c-.027-2.986-.68-5.226-1.947-6.666-1.28-1.453-3.16-2.2-5.662-2.2-2.52 0-4.413.76-5.63 2.253-1.226 1.507-1.853 3.827-1.866 6.893.013 3.067.64 5.387 1.866 6.893 1.217 1.494 3.11 2.254 5.63 2.254 2.827 0 4.96-.947 6.347-2.814l2.4 2.4C20.733 22.373 17.52 24 12.186 24zm-.093-6.667c-1.854 0-3.374-.533-4.52-1.586-1.134-1.04-1.72-2.48-1.747-4.28.027-1.8.613-3.24 1.747-4.28 1.146-1.053 2.666-1.587 4.52-1.587 1.853 0 3.373.534 4.52 1.587 1.133 1.04 1.72 2.48 1.746 4.28-.026 1.8-.613 3.24-1.746 4.28-1.147 1.053-2.667 1.586-4.52 1.586zm0-2.88c.987 0 1.8-.306 2.413-.92.6-.613.907-1.44.92-2.453-.013-1.014-.32-1.84-.92-2.454-.613-.613-1.426-.92-2.413-.92-.987 0-1.8.307-2.414.92-.6.614-.906 1.44-.92 2.454.014 1.013.32 1.84.92 2.453.614.614 1.427.92 2.414.92z" />
    </svg>
  );
}

export const USER_SOCIALS = {
  instagram: "https://www.instagram.com/mihirwildlife",
  facebook: "https://facebook.com/mihirwildlife",
  threads: "https://www.threads.com/@mihirwildlife",
  linkedin: "https://www.linkedin.com/in/mihirkumarranva/",
  x: "https://x.com/mihirwildlife",
  email: "mailto:mihirwildlife@gmail.com",
};

export function SocialLinks({
  socials = {},
  variant = "footer", // "footer" | "contact" | "nav" | "floating"
  className = "",
}) {
  const links = [
    {
      name: "Instagram",
      href: socials.instagram || USER_SOCIALS.instagram,
      icon: Instagram,
      ariaLabel: "Follow Mihir on Instagram",
      color: "hover:text-[#E1306C] hover:border-[#E1306C]/50 hover:bg-[#E1306C]/10",
      pillBg: "hover:bg-[#E1306C]/15 hover:border-[#E1306C]/50",
      glow: "hover:shadow-[0_0_20px_rgba(225,48,108,0.35)]",
    },
    {
      name: "Facebook",
      href: socials.facebook || USER_SOCIALS.facebook,
      icon: Facebook,
      ariaLabel: "Connect with Mihir on Facebook",
      color: "hover:text-[#1877F2] hover:border-[#1877F2]/50 hover:bg-[#1877F2]/10",
      pillBg: "hover:bg-[#1877F2]/15 hover:border-[#1877F2]/50",
      glow: "hover:shadow-[0_0_20px_rgba(24,119,242,0.35)]",
    },
    {
      name: "Threads",
      href: socials.threads || USER_SOCIALS.threads,
      icon: ThreadsIcon,
      ariaLabel: "Follow Mihir on Threads",
      color: "hover:text-white hover:border-white/50 hover:bg-white/10",
      pillBg: "hover:bg-white/15 hover:border-white/50",
      glow: "hover:shadow-[0_0_20px_rgba(255,255,255,0.25)]",
    },
    {
      name: "LinkedIn",
      href: socials.linkedin || USER_SOCIALS.linkedin,
      icon: Linkedin,
      ariaLabel: "Connect with Mihir on LinkedIn",
      color: "hover:text-[#0A66C2] hover:border-[#0A66C2]/50 hover:bg-[#0A66C2]/10",
      pillBg: "hover:bg-[#0A66C2]/15 hover:border-[#0A66C2]/50",
      glow: "hover:shadow-[0_0_20px_rgba(10,102,194,0.35)]",
    },
    {
      name: "X",
      href: socials.x || socials.twitter || USER_SOCIALS.x,
      icon: XIcon,
      ariaLabel: "Follow Mihir on X",
      color: "hover:text-white hover:border-white/50 hover:bg-white/10",
      pillBg: "hover:bg-white/15 hover:border-white/50",
      glow: "hover:shadow-[0_0_20px_rgba(255,255,255,0.25)]",
    },
    {
      name: "Email",
      href: socials.email ? `mailto:${socials.email}` : USER_SOCIALS.email,
      icon: Mail,
      ariaLabel: "Send an Email to Mihir",
      color: "hover:text-accent hover:border-accent/50 hover:bg-accent/10",
      pillBg: "hover:bg-accent/15 hover:border-accent/50",
      glow: "hover:shadow-[0_0_20px_rgba(201,162,94,0.35)]",
    },
  ];

  if (variant === "contact") {
    return (
      <div className={`grid grid-cols-2 sm:grid-cols-3 gap-2 ${className}`}>
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.name}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={item.ariaLabel}
              data-testid={`social-link-${item.name.toLowerCase()}`}
              className={`group flex items-center gap-2.5 px-3 py-2 border border-white/10 bg-white/[0.03] rounded-md text-neutral-300 text-xs tracking-wide transition-all duration-200 ${item.pillBg} ${item.color} ${item.glow}`}
            >
              <Icon size={16} className="transition-transform group-hover:scale-110 shrink-0" />
              <span className="font-mono-accent font-medium truncate">{item.name}</span>
            </a>
          );
        })}
      </div>
    );
  }

  if (variant === "nav") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {links.slice(0, 5).map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.name}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={item.ariaLabel}
              title={item.name}
              data-testid={`nav-social-${item.name.toLowerCase()}`}
              className={`w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-neutral-400 bg-white/[0.02] transition-all duration-300 hover:-translate-y-0.5 ${item.color} ${item.glow}`}
            >
              <Icon size={15} />
            </a>
          );
        })}
      </div>
    );
  }

  // Default "footer" variant: Luxury circular social icon dock
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`} data-testid="social-links-footer">
      {links.map((item) => {
        const Icon = item.icon;
        return (
          <a
            key={item.name}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={item.ariaLabel}
            title={item.name}
            data-testid={`footer-social-${item.name.toLowerCase()}`}
            className={`group w-11 h-11 rounded-full border border-white/10 bg-white/[0.03] flex items-center justify-center text-neutral-400 transition-all duration-300 hover:-translate-y-1 ${item.color} ${item.glow}`}
          >
            <Icon size={18} className="transition-transform duration-300 group-hover:scale-115" />
          </a>
        );
      })}
    </div>
  );
}

export default SocialLinks;
