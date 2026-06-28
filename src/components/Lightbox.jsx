import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { lockScroll, unlockScroll } from "../lib/scrollLock";
import InquiryForm from "./InquiryForm";

export default function Lightbox({ art, onClose, onPrev, onNext }) {
  const isOpen = !!art;
  const overlayRef = useRef(null);
  const closeRef = useRef(null);
  const [zoomed, setZoomed] = useState(false);
  const [inquireOpen, setInquireOpen] = useState(false);

  // Reset zoom whenever the shown artwork changes.
  useEffect(() => {
    setZoomed(false);
  }, [art?.id]);

  // Focus management: capture trigger on open, restore on close. Lock scroll.
  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement;
    closeRef.current?.focus();
    lockScroll();
    return () => {
      unlockScroll();
      if (
        previouslyFocused instanceof HTMLElement &&
        document.contains(previouslyFocused)
      ) {
        previouslyFocused.focus();
      }
    };
  }, [isOpen]);

  // Keyboard: Esc closes, arrows navigate, Tab is trapped inside the dialog.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (inquireOpen) return; // let the inquiry form own the keyboard
      if (e.key === "Escape") return onClose();
      if (e.key === "ArrowLeft") return onPrev();
      if (e.key === "ArrowRight") return onNext();
      if (e.key === "Tab") {
        // Query the whole overlay so the close/prev/next controls are included.
        const nodes = overlayRef.current?.querySelectorAll(
          'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])'
        );
        if (!nodes || nodes.length === 0) return;
        const list = Array.from(nodes);
        const first = list[0];
        const last = list[list.length - 1];
        const activeInside = overlayRef.current.contains(document.activeElement);
        if (e.shiftKey && (document.activeElement === first || !activeInside)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && (document.activeElement === last || !activeInside)) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose, onPrev, onNext, inquireOpen]);

  return (
    <>
      <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-paper/90 p-4 backdrop-blur-md sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-labelledby="lightbox-title"
          aria-describedby="lightbox-desc"
        >
          {/* Close */}
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Close"
            className="absolute right-5 top-5 z-10 grid h-11 w-11 place-items-center rounded-full border border-line bg-paper text-ink transition-colors hover:border-gold hover:text-gold"
          >
            <X size={20} />
          </button>

          {/* Prev / Next */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            aria-label="Previous artwork"
            className="absolute left-3 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-line bg-paper text-ink transition-colors hover:border-gold hover:text-gold sm:left-6"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            aria-label="Next artwork"
            className="absolute right-3 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-line bg-paper text-ink transition-colors hover:border-gold hover:text-gold sm:right-6"
          >
            <ChevronRight size={22} />
          </button>

          {/* Panel */}
          <motion.div
            key={art.id}
            initial={{ opacity: 0, y: 20, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.99 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="grid max-h-[88vh] w-full max-w-5xl grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-3xl border border-line bg-paper-2 shadow-frame-lg md:grid-rows-none md:grid-cols-[1.3fr_1fr]"
          >
            {/* Image on a paper-white mat */}
            <div
              className={`flex min-h-0 max-h-[45vh] items-center justify-center bg-mat p-4 md:max-h-[88vh] ${
                zoomed ? "overflow-auto" : "overflow-hidden"
              }`}
            >
              <img
                src={art.img}
                alt={`${art.title} — ${art.medium}, ${art.dimensions}, ${art.year}`}
                onClick={() => setZoomed((z) => !z)}
                className={`rounded-md transition-transform duration-500 ${
                  zoomed
                    ? "h-[160%] w-auto max-h-none max-w-none cursor-zoom-out"
                    : "max-h-full w-full cursor-zoom-in object-contain"
                }`}
              />
            </div>

            {/* Details */}
            <div className="scrollbar-luxe flex min-h-0 flex-col overflow-y-auto p-7 sm:p-9">
              <div className="flex items-center justify-between">
                <span className="eyebrow">{art.year}</span>
                <span className="inline-flex items-center gap-1.5 text-[0.7rem] uppercase tracking-[0.16em] text-faint">
                  <ZoomIn size={13} /> Tap image to zoom
                </span>
              </div>

              <h3
                id="lightbox-title"
                className="mt-3 font-display text-3xl italic leading-tight text-ink sm:text-4xl"
              >
                {art.title}
              </h3>

              <p id="lightbox-desc" className="mt-4 text-sm leading-relaxed text-muted">
                {art.statement}
              </p>

              <dl className="mt-7 space-y-3 border-t border-line pt-6 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-faint">Medium</dt>
                  <dd className="text-right text-ink">{art.medium}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-faint">Dimensions</dt>
                  <dd className="text-right text-ink">{art.dimensions}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-faint">Price</dt>
                  <dd className="text-right font-medium text-gold">
                    {art.price}
                  </dd>
                </div>
              </dl>

              <button
                onClick={() => setInquireOpen(true)}
                className="mt-8 rounded-full bg-ink px-6 py-3.5 text-center text-xs font-medium uppercase tracking-[0.2em] text-paper transition-colors duration-200 hover:bg-gold-deep"
              >
                Purchase / Inquire
              </button>
              <p className="mt-3 text-center text-[0.7rem] tracking-wide text-faint">
                Private acquisition · Worldwide shipping · Replies within 24h
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      <InquiryForm
        open={inquireOpen}
        onClose={() => setInquireOpen(false)}
        artwork={art}
        type="whatsapp_inquiry"
        source="lightbox"
        heading="Purchase / Inquire"
      />
    </>
  );
}
