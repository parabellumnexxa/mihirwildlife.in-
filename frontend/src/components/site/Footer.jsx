import { Link } from "react-router-dom";

export const Footer = ({ logoUrl, instagram }) => (
  <footer data-testid="site-footer" className="relative z-10 bg-[#050505] border-t border-white/10 py-14">
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

      <p className="font-serif text-lg tracking-wide text-neutral-300 text-center">
        © {new Date().getFullYear()} · Mihir Ranva Photography
      </p>

      <div className="flex items-center gap-6">
        {instagram && (
          <a
            href={instagram}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="footer-instagram"
            className="text-sm uppercase tracking-[0.15em] text-neutral-400 hover:text-accent transition-colors"
          >
            Instagram
          </a>
        )}
        <Link
          to="/admin"
          data-testid="footer-admin-link"
          className="text-sm uppercase tracking-[0.15em] text-neutral-600 hover:text-accent transition-colors"
        >
          Admin
        </Link>
      </div>
    </div>
  </footer>
);
