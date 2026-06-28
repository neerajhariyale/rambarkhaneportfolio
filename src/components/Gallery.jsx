import { useMemo, useState } from "react";
import { motion, LayoutGroup } from "framer-motion";
import { useCatalog } from "../lib/catalog";
import { fadeUp, stagger, viewportOnce } from "../lib/motion";
import ArtworkCard from "./ArtworkCard";
import Lightbox from "./Lightbox";

export default function Gallery() {
  const { artworks, collections } = useCatalog();
  const [filter, setFilter] = useState("all");
  const [openIndex, setOpenIndex] = useState(null);

  const visible = useMemo(
    () =>
      filter === "all"
        ? artworks
        : artworks.filter((a) => a.collection === filter),
    [filter, artworks]
  );

  // Reset the lightbox when the filter changes so the positional index
  // never points at a stale / out-of-range artwork.
  const selectFilter = (id) => {
    setFilter(id);
    setOpenIndex(null);
  };

  const openArt = openIndex !== null ? visible[openIndex] : null;
  const move = (dir) =>
    setOpenIndex((i) => (i + dir + visible.length) % visible.length);

  return (
    <section id="gallery" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        {/* Heading */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="text-center"
        >
          <span className="eyebrow">The Gallery</span>
          <h2 className="mt-4 font-display text-4xl sm:text-6xl">
            Featured{" "}
            <span className="italic text-gradient-gold">Collection</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-muted">
            Original works available for private acquisition. Select a piece to
            view it in detail.
          </p>
        </motion.div>

        {/* Filter tabs */}
        <LayoutGroup>
          <div className="mt-12 flex flex-wrap justify-center gap-2.5">
            {collections.map((c) => (
              <button
                key={c.id}
                onClick={() => selectFilter(c.id)}
                className={`relative isolate inline-flex min-h-[44px] items-center justify-center rounded-full border px-6 text-[0.7rem] uppercase tracking-[0.2em] transition-colors duration-300 ${
                  filter === c.id
                    ? "border-ink text-paper"
                    : "border-line text-muted hover:border-gold hover:text-gold"
                }`}
              >
                {filter === c.id && (
                  <motion.span
                    layoutId="filter-pill"
                    className="absolute inset-0 rounded-full bg-ink"
                    transition={{ type: "spring", stiffness: 400, damping: 34 }}
                  />
                )}
                <span className="relative z-10">{c.label}</span>
              </button>
            ))}
          </div>
        </LayoutGroup>

        {/* Masonry grid — true aspect ratios; remounts (re-staggers) per filter */}
        <motion.div
          key={filter}
          variants={stagger}
          initial="hidden"
          animate="show"
          className="mt-14 columns-1 gap-7 sm:columns-2 lg:columns-3"
        >
          {visible.map((art, i) => (
            <ArtworkCard key={art.id} art={art} onOpen={() => setOpenIndex(i)} />
          ))}
        </motion.div>
      </div>

      <Lightbox
        art={openArt}
        onClose={() => setOpenIndex(null)}
        onPrev={() => move(-1)}
        onNext={() => move(1)}
      />
    </section>
  );
}
