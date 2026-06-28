import { motion } from "framer-motion";
import { Mail, MapPin, MessageCircle, Clock } from "lucide-react";
import { contact, artist, buildWhatsAppLink } from "../data/site";
import { fadeUp, stagger, viewportOnce } from "../lib/motion";

export default function Contact() {
  return (
    <section id="contact" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="overflow-hidden rounded-[2rem] border border-line bg-paper-2 p-8 shadow-frame sm:p-14"
        >
          <div className="grid gap-10 md:grid-cols-2">
            {/* Left: invitation */}
            <div>
              <motion.span variants={fadeUp} className="eyebrow">
                {contact.heading}
              </motion.span>
              <motion.h2
                variants={fadeUp}
                className="mt-4 font-display text-4xl leading-tight sm:text-5xl"
              >
                Let's create something{" "}
                <span className="italic text-gradient-gold">timeless</span>.
              </motion.h2>
              <motion.p variants={fadeUp} className="mt-5 text-muted">
                {contact.lead}
              </motion.p>

              <motion.a
                variants={fadeUp}
                href={buildWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2.5 rounded-full bg-ink px-7 py-3.5 text-xs font-medium uppercase tracking-[0.2em] text-paper transition-colors duration-200 hover:bg-gold-deep"
              >
                <MessageCircle size={16} />
                Message on WhatsApp
              </motion.a>

              <motion.p
                variants={fadeUp}
                className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-faint"
              >
                <Clock size={13} /> Replies within 24 hours
              </motion.p>
            </div>

            {/* Right: details */}
            <motion.div
              variants={fadeUp}
              className="flex flex-col gap-6 md:border-l md:border-line md:pl-10"
            >
              <div className="flex gap-4">
                <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gold/40 text-gold">
                  <MapPin size={18} />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-faint">
                    Studio
                  </p>
                  <p className="mt-1.5 font-display text-xl text-ink">
                    {contact.name}
                  </p>
                  {contact.address.map((line) => (
                    <p key={line} className="text-sm text-muted">
                      {line}
                    </p>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gold/40 text-gold">
                  <Mail size={18} />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-faint">
                    Email
                  </p>
                  <a
                    href={`mailto:${contact.email}`}
                    className="mt-1.5 block text-sm text-ink underline-offset-4 transition-colors hover:text-gold hover:underline"
                  >
                    {contact.email}
                  </a>
                </div>
              </div>

              <p className="mt-2 text-xs leading-relaxed text-faint">
                {artist.titles}
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
