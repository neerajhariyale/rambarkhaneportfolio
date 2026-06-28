import { useSite } from "../lib/siteContent";

// Seamless infinite marquee — the row is duplicated and translated -50%.
export default function Marquee() {
  const { marquee } = useSite();
  const row = [...marquee, ...marquee];

  return (
    <div className="relative overflow-hidden border-y border-line bg-paper-2 py-5">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-paper-2 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-paper-2 to-transparent" />

      <div className="flex w-max animate-marquee">
        {row.map((phrase, i) => (
          <div
            key={i}
            className="flex items-center"
            aria-hidden={i >= marquee.length}
          >
            <span className="px-8 font-display text-xl italic tracking-wide text-muted sm:text-2xl">
              {phrase}
            </span>
            <span className="text-gold">&#10022;</span>
          </div>
        ))}
      </div>
    </div>
  );
}
