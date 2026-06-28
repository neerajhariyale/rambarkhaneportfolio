import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Check, MessageCircle } from "lucide-react";
import { buildWhatsAppLink } from "../data/site";
import { useSite } from "../lib/siteContent";
import { submitLead } from "../lib/track";
import { lockScroll, unlockScroll } from "../lib/scrollLock";

// One modal for both the Contact section and an artwork purchase/inquiry.
// On submit it saves the lead to the admin DB AND opens WhatsApp prefilled.
export default function InquiryForm({
  open,
  onClose,
  artwork = null,
  type = "general",
  source = "contact-form",
  heading = "Make an inquiry",
}) {
  const { artist } = useSite();
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | saving | done
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setStatus("idle");
    setError("");
    setForm({ name: "", email: "", phone: "", message: "" });
    lockScroll();
    return () => unlockScroll();
  }, [open]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus("saving");
    setError("");

    // 1) Save the lead so it lands in the admin portal (never block on failure).
    const { error: dbErr } = await submitLead({ artwork, type, source, ...form });
    if (dbErr) {
      // Still let them reach WhatsApp, but surface a soft notice.
      setError("Saved locally — opening WhatsApp…");
    }

    // 2) Open WhatsApp prefilled with their details + the artwork.
    const url = buildWhatsAppLink(artwork, artist.whatsapp, form);
    window.open(url, "_blank", "noopener,noreferrer");

    setStatus("done");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[95] flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={heading}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md overflow-hidden rounded-3xl border border-line bg-paper shadow-frame-lg"
          >
            <div className="flex items-start justify-between gap-4 border-b border-line p-6">
              <div>
                <span className="eyebrow">{artwork ? "Acquire this work" : "Get in touch"}</span>
                <h3 className="mt-2 font-display text-2xl text-ink">{heading}</h3>
                {artwork && (
                  <p className="mt-1 text-sm text-muted">
                    <span className="italic">{artwork.title}</span>
                    {artwork.price ? ` · ${artwork.price}` : ""}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line text-muted hover:text-ink"
              >
                <X size={18} />
              </button>
            </div>

            {status === "done" ? (
              <div className="p-8 text-center">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-gold/15 text-gold-deep">
                  <Check size={22} />
                </span>
                <h4 className="mt-4 font-display text-2xl text-ink">Thank you</h4>
                <p className="mt-2 text-sm text-muted">
                  Your inquiry was sent. We've opened WhatsApp so you can finish the
                  conversation — the studio will also follow up.
                </p>
                <button
                  onClick={onClose}
                  className="mt-6 rounded-full border border-line px-6 py-2.5 text-xs uppercase tracking-[0.18em] text-ink hover:border-gold hover:text-gold"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4 p-6">
                <Field label="Name" value={form.name} onChange={(v) => set("name", v)} required placeholder="Your name" />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Email" type="email" value={form.email} onChange={(v) => set("email", v)} placeholder="you@email.com" />
                  <Field label="Phone" type="tel" value={form.phone} onChange={(v) => set("phone", v)} required placeholder="+91…" />
                </div>
                <label className="block">
                  <span className="mb-1.5 block text-xs uppercase tracking-[0.16em] text-muted">Message</span>
                  <textarea
                    rows={3}
                    value={form.message}
                    onChange={(e) => set("message", e.target.value)}
                    placeholder={artwork ? "I'd like to purchase / know more about this work…" : "How can we help?"}
                    className="w-full rounded-lg border border-line bg-mat px-3.5 py-2.5 text-sm text-ink outline-none focus:border-gold"
                  />
                </label>

                {error && <p className="text-xs text-muted">{error}</p>}

                <button
                  type="submit"
                  disabled={status === "saving"}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 text-xs font-medium uppercase tracking-[0.2em] text-paper transition-colors hover:bg-gold-deep disabled:opacity-60"
                >
                  <MessageCircle size={15} />
                  {status === "saving" ? "Sending…" : "Send & open WhatsApp"}
                </button>
                <p className="text-center text-[0.7rem] tracking-wide text-faint">
                  Your details reach the studio directly · replies within 24h
                </p>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({ label, value, onChange, type = "text", required, placeholder }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-[0.16em] text-muted">{label}</span>
      <input
        type={type}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-line bg-mat px-3.5 py-2.5 text-sm text-ink outline-none focus:border-gold"
      />
    </label>
  );
}
