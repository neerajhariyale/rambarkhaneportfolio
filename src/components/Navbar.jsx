import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { artist, navLinks } from "../data/site";
import { lockScroll, unlockScroll } from "../lib/scrollLock";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState("home");

  // Frost the bar after a little scroll.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Highlight the section currently in view.
  useEffect(() => {
    const sections = navLinks
      .map((l) => document.getElementById(l.id))
      .filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  // Lock scroll while the mobile drawer is open (ref-counted so it
  // coexists with the lightbox's lock).
  useEffect(() => {
    if (!menuOpen) return;
    lockScroll();
    return () => unlockScroll();
  }, [menuOpen]);

  const go = (e, id) => {
    e.preventDefault();
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6"
      >
        <nav
          className={`mx-auto flex max-w-7xl items-center justify-between rounded-full px-5 py-3 transition-all duration-500 sm:px-7 ${
            scrolled ? "glass shadow-frame" : "border border-transparent bg-transparent"
          }`}
        >
          {/* Wordmark */}
          <a
            href="#home"
            onClick={(e) => go(e, "home")}
            className="group flex items-baseline gap-2"
          >
            <span className="font-display text-2xl font-semibold tracking-wide text-ink">
              Ram
            </span>
            <span className="font-display text-2xl font-semibold tracking-wide text-gradient-gold">
              Barkhane
            </span>
          </a>

          {/* Desktop links */}
          <ul className="hidden items-center gap-9 md:flex">
            {navLinks.map((link) => (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  onClick={(e) => go(e, link.id)}
                  className={`relative text-sm uppercase tracking-[0.18em] transition-colors duration-200 hover:text-gold ${
                    active === link.id ? "text-gold" : "text-muted"
                  }`}
                >
                  {link.label}
                  {active === link.id && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute -bottom-1.5 left-0 h-px w-full bg-gold"
                    />
                  )}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <a
              href="#gallery"
              onClick={(e) => go(e, "gallery")}
              className="hidden rounded-full bg-ink px-5 py-2 text-xs font-medium uppercase tracking-[0.18em] text-paper transition-colors duration-200 hover:bg-gold-deep md:inline-block"
            >
              View Collection
            </a>

            {/* Mobile toggle */}
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="grid h-11 w-11 place-items-center rounded-full border border-line text-ink transition-colors hover:border-gold hover:text-gold md:hidden"
            >
              <Menu size={20} />
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-[60] bg-ink/30 backdrop-blur-sm md:hidden"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 right-0 z-[70] flex w-[80%] max-w-sm flex-col bg-paper p-8 shadow-frame-lg md:hidden"
            >
              <div className="mb-12 flex items-center justify-between">
                <span className="font-display text-xl text-gradient-gold">
                  Ram Barkhane
                </span>
                <button
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close menu"
                  className="grid h-11 w-11 place-items-center rounded-full border border-line text-ink transition-colors hover:border-gold hover:text-gold"
                >
                  <X size={20} />
                </button>
              </div>

              <ul className="flex flex-col gap-2">
                {navLinks.map((link, i) => (
                  <motion.li
                    key={link.id}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.07 }}
                  >
                    <a
                      href={`#${link.id}`}
                      onClick={(e) => go(e, link.id)}
                      className="block border-b border-line py-4 font-display text-3xl text-ink transition-colors hover:text-gold"
                    >
                      {link.label}
                    </a>
                  </motion.li>
                ))}
              </ul>

              <a
                href="#contact"
                onClick={(e) => go(e, "contact")}
                className="mt-auto rounded-full bg-ink px-6 py-3 text-center text-xs font-medium uppercase tracking-[0.18em] text-paper transition-colors duration-200 hover:bg-gold-deep"
              >
                Inquire Now
              </a>
              <p className="mt-6 text-xs tracking-wide text-muted">
                {artist.titles}
              </p>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
