import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { fadeUp } from "../lib/motion";

// Derive a true aspect ratio from the artwork's stated dimensions
// (e.g. "30 × 40 in" -> "30 / 40"), so works are never force-cropped.
// Guards against zero/degenerate values that would collapse the frame.
function aspectFromDimensions(dim) {
  const m = dim?.match(/(\d+(?:\.\d+)?)\s*[×x]\s*(\d+(?:\.\d+)?)/i);
  return m && +m[1] > 0 && +m[2] > 0 ? `${m[1]} / ${m[2]}` : "4 / 5";
}

export default function ArtworkCard({ art, onOpen }) {
  const ratio = aspectFromDimensions(art.dimensions);

  return (
    <motion.button
      type="button"
      variants={fadeUp}
      onClick={onOpen}
      aria-label={`View ${art.title}`}
      className="group mb-8 block w-full cursor-pointer break-inside-avoid overflow-hidden rounded-xl border border-line bg-mat text-left shadow-frame transition-all duration-500 hover:-translate-y-1 hover:border-gold/40 hover:shadow-frame-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
    >
      {/* Image */}
      <div className="relative overflow-hidden">
        <img
          src={art.img}
          alt={`${art.title} — ${art.medium}, ${art.year}`}
          loading="lazy"
          style={{ aspectRatio: ratio }}
          className="w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
        />

        {/* Explicit click affordance — appears on hover */}
        <div className="absolute inset-0 flex items-center justify-center bg-ink/0 transition-colors duration-500 group-hover:bg-ink/20">
          <span className="inline-flex translate-y-2 items-center gap-2 rounded-full bg-paper/95 px-6 py-3 text-[0.7rem] font-medium uppercase tracking-[0.22em] text-ink opacity-0 shadow-frame-lg backdrop-blur-sm transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            View Work
            <ArrowUpRight size={14} strokeWidth={2} />
          </span>
        </div>
      </div>

      {/* Label */}
      <div className="p-5">
        <h3 className="font-display text-[1.3rem] italic leading-snug text-ink">
          {art.title}
          <span className="not-italic text-base text-muted">, {art.year}</span>
        </h3>
        <p className="mt-2 text-[0.66rem] uppercase tracking-[0.22em] text-muted">
          {art.medium} · {art.dimensions}
        </p>

        {/* Action row — persistent "View" cue so the card always reads as clickable */}
        <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
          <span className="text-sm tracking-wide text-gold">{art.price}</span>
          <span className="inline-flex items-center gap-1.5 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-ink transition-colors duration-300 group-hover:text-gold">
            View
            <ArrowUpRight
              size={13}
              strokeWidth={2}
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </span>
        </div>
      </div>
    </motion.button>
  );
}
