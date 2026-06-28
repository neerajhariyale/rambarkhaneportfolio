import { navLinks } from "../data/site";
import { useSite } from "../lib/siteContent";

export default function Footer() {
  const { artist, contact } = useSite();
  const go = (e, id) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="border-t border-line bg-paper-2">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="flex flex-col items-center gap-8 text-center">
          <a
            href="#home"
            onClick={(e) => go(e, "home")}
            className="flex items-baseline gap-2"
          >
            <span className="font-display text-3xl font-semibold text-ink">
              Ram
            </span>
            <span className="font-display text-3xl font-semibold text-gradient-gold">
              Barkhane
            </span>
          </a>

          <div className="rule-gold w-32" />

          <nav className="flex flex-wrap justify-center gap-x-8 gap-y-3">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={(e) => go(e, link.id)}
                className="text-xs uppercase tracking-[0.18em] text-muted transition-colors hover:text-gold"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <a
            href={`mailto:${contact.email}`}
            className="text-sm text-muted transition-colors hover:text-gold"
          >
            {contact.email}
          </a>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-line pt-6 text-xs text-faint sm:flex-row">
          <p>© {artist.name}. All works original and protected.</p>
          <p className="tracking-wide">{artist.titles}</p>
        </div>
      </div>
    </footer>
  );
}
