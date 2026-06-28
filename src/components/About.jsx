import { motion } from "framer-motion";
import { artist, about } from "../data/site";
import { fadeUp, stagger, viewportOnce } from "../lib/motion";

export default function About() {
  return (
    <section id="about" className="relative overflow-hidden py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-2 lg:gap-20">
        {/* Portrait — matted & floated, no glow */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportOnce}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-full max-w-md"
        >
          <figure className="rounded-[1.5rem] bg-mat p-3 shadow-frame-lg">
            <div className="overflow-hidden rounded-[1rem] border border-line">
              <img
                src={artist.portrait}
                alt={`Portrait of ${artist.name}`}
                loading="lazy"
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
            <figcaption className="px-1.5 pt-4 text-center">
              <p className="font-display text-2xl text-ink">{artist.name}</p>
              <p className="mt-1 text-[0.7rem] uppercase tracking-[0.22em] text-gold">
                {artist.role}
              </p>
            </figcaption>
          </figure>
        </motion.div>

        {/* Statement */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
        >
          <motion.span variants={fadeUp} className="eyebrow">
            {about.heading}
          </motion.span>
          <motion.h2
            variants={fadeUp}
            className="mt-4 font-display text-4xl leading-tight sm:text-5xl"
          >
            A meditation on{" "}
            <span className="italic text-gradient-gold">balance, energy</span>{" "}
            and emotion.
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="mt-6 text-lg leading-relaxed text-ink-soft"
          >
            {about.lead}
          </motion.p>

          {about.paragraphs.map((p, i) => (
            <motion.p
              key={i}
              variants={fadeUp}
              className="mt-4 text-[0.95rem] leading-relaxed text-muted"
            >
              {p}
            </motion.p>
          ))}

          {/* Specialties */}
          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-2.5">
            {about.specialties.map((s) => (
              <span
                key={s}
                className="rounded-full border border-line bg-paper-3 px-3.5 py-1.5 text-xs tracking-wide text-muted"
              >
                {s}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Stats band */}
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="mx-auto mt-20 grid max-w-5xl grid-cols-2 gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-4"
      >
        {about.stats.map((stat) => (
          <motion.div
            key={stat.label}
            variants={fadeUp}
            className="bg-paper-2 px-6 py-8 text-center"
          >
            <p className="font-display text-4xl text-gold-deep sm:text-5xl">
              {stat.value}
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
