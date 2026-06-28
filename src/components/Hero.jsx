import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { buildWhatsAppLink } from "../data/site";
import { useSite } from "../lib/siteContent";
import { trackLead } from "../lib/track";

const ease = [0.22, 1, 0.36, 1];

export default function Hero() {
  const { artist } = useSite();
  const scrollTo = (e, id) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center overflow-hidden bg-paper pt-28 pb-16 sm:pt-32"
    >
      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        {/* Text column */}
        <div className="order-2 text-center lg:order-1 lg:text-left">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.15 }}
            className="eyebrow"
          >
            {artist.role}
          </motion.span>

          <h1 className="mt-5 font-display text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
            <motion.span
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease, delay: 0.25 }}
              className="block text-ink"
            >
              Where Art
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease, delay: 0.38 }}
              className="block italic text-gradient-gold"
            >
              Meets Luxury
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.5 }}
            className="mx-auto mt-7 max-w-md text-base leading-relaxed text-muted sm:text-lg lg:mx-0"
          >
            {artist.subtitle}. Original abstract masterpieces in oil and
            acrylic — creator of Cracturism &amp; Floating Dotism.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.62 }}
            className="mt-9 flex flex-wrap items-center justify-center gap-x-7 gap-y-4 lg:justify-start"
          >
            <a
              href="#gallery"
              onClick={(e) => scrollTo(e, "gallery")}
              className="rounded-full bg-ink px-8 py-3.5 text-xs font-medium uppercase tracking-[0.2em] text-paper transition-colors duration-200 hover:bg-gold-deep"
            >
              Explore the Collection
            </a>
            <a
              href={buildWhatsAppLink(null, artist.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackLead({ type: "commission", source: "hero" })}
              className="group inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-ink transition-colors duration-200 hover:text-gold"
            >
              <span className="h-px w-7 bg-gold transition-all duration-200 group-hover:w-10" />
              Commission a Piece
            </a>
          </motion.div>

          {/* Trust line */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.85 }}
            className="mt-10 text-xs uppercase tracking-[0.22em] text-faint"
          >
            Private acquisitions &amp; bespoke commissions · Worldwide
          </motion.p>
        </div>

        {/* Framed artwork column */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, ease, delay: 0.2 }}
          className="order-1 lg:order-2"
        >
          <figure className="relative mx-auto max-w-md rounded-[1.5rem] bg-mat p-3 shadow-frame-lg lg:max-w-none">
            <div className="overflow-hidden rounded-[1rem] border border-line">
              <img
                src={artist.banner}
                alt={`Signature work by ${artist.name}`}
                fetchpriority="high"
                className="aspect-[4/5] w-full animate-ken-burns object-cover"
              />
            </div>
            <figcaption className="flex items-baseline justify-between px-1.5 pt-4">
              <span className="font-display text-xl italic text-ink">
                {artist.name}
              </span>
              <span className="text-[0.7rem] uppercase tracking-[0.18em] text-muted">
                Est. Studio · Bhopal
              </span>
            </figcaption>
          </figure>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.a
        href="#about"
        onClick={(e) => scrollTo(e, "about")}
        aria-label="Scroll to about"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 1 }}
        className="absolute bottom-7 left-1/2 z-10 hidden -translate-x-1/2 text-muted transition-colors hover:text-gold sm:block"
      >
        <motion.span
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="block"
        >
          <ArrowDown size={22} />
        </motion.span>
      </motion.a>
    </section>
  );
}
