import { motion } from "framer-motion";
import { studio } from "../data/site";
import { fadeUp, stagger, viewportOnce } from "../lib/motion";

export default function Studio() {
  return (
    <section
      id="studio"
      className="relative border-y border-line bg-paper-2 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20"
        >
          {/* Intro */}
          <div>
            <motion.span variants={fadeUp} className="eyebrow">
              {studio.heading}
            </motion.span>
            <motion.h2
              variants={fadeUp}
              className="mt-4 font-display text-4xl leading-tight sm:text-5xl"
            >
              The <span className="italic text-gradient-gold">process</span>{" "}
              behind the canvas.
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="mt-6 text-lg text-ink-soft"
            >
              {studio.lead}
            </motion.p>
            {studio.paragraphs.map((p, i) => (
              <motion.p
                key={i}
                variants={fadeUp}
                className="mt-4 text-[0.95rem] leading-relaxed text-muted"
              >
                {p}
              </motion.p>
            ))}
          </div>

          {/* Process steps */}
          <motion.ol variants={stagger} className="space-y-4">
            {studio.process.map((step) => (
              <motion.li
                key={step.step}
                variants={fadeUp}
                className="group flex gap-5 rounded-2xl border border-line bg-paper-3 p-6 transition-colors duration-300 hover:border-gold/50"
              >
                <span className="font-display text-3xl text-gold-deep">
                  {step.step}
                </span>
                <div>
                  <h3 className="font-display text-2xl text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">
                    {step.text}
                  </p>
                </div>
              </motion.li>
            ))}
          </motion.ol>
        </motion.div>
      </div>
    </section>
  );
}
