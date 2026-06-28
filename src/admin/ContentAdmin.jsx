import { useEffect, useState } from "react";
import { UploadCloud, Save } from "lucide-react";
import { supabase } from "../lib/supabase";
import { fetchContent, DEFAULT_CONTENT } from "../lib/siteContent";

// Helpers to edit string[] as newline-separated textareas.
const toLines = (arr) => (Array.isArray(arr) ? arr.join("\n") : "");
const fromLines = (s) => s.split("\n").map((x) => x.trim()).filter(Boolean);

async function uploadImage(file, prefix) {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `site/${prefix}-${Date.now()}.${ext}`;
  const up = await supabase.storage.from("artworks").upload(path, file, {
    contentType: file.type,
    upsert: true,
  });
  if (up.error) throw up.error;
  return supabase.storage.from("artworks").getPublicUrl(path).data.publicUrl;
}

async function saveSection(key, value) {
  return supabase
    .from("site_settings")
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
}

export default function ContentAdmin() {
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent().then((c) => {
      setContent(c);
      setLoading(false);
    });
  }, []);

  if (loading) return <p className="text-sm text-muted">Loading…</p>;

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl">Site content</h1>
      <p className="mt-1 text-sm text-muted">
        Edit what visitors see on the public site. Changes go live immediately.
      </p>

      <div className="mt-8 space-y-5">
        <BrandSection initial={content.artist} />
        <AboutSection initial={content.about} />
        <StudioSection initial={content.studio} />
        <ContactSection initial={content.contact} />
        <MarqueeSection initial={content.marquee} />
      </div>
    </div>
  );
}

// ---------- reusable section shell ----------
function Section({ title, children, onSave }) {
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const save = async () => {
    setSaving(true);
    setMsg("");
    try {
      const { error } = await onSave();
      setMsg(error ? `Error: ${error.message}` : "Saved ✓");
    } catch (e) {
      setMsg(`Error: ${e.message}`);
    }
    setSaving(false);
  };

  return (
    <section className="rounded-2xl border border-line bg-mat p-6 shadow-frame">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-2xl text-ink">{title}</h2>
        <div className="flex items-center gap-3">
          {msg && <span className="text-xs text-muted">{msg}</span>}
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-paper hover:bg-gold-deep disabled:opacity-60"
          >
            <Save size={14} /> {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Text({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-[0.16em] text-muted">{label}</span>
      <input
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-line bg-paper px-3.5 py-2.5 text-sm text-ink outline-none focus:border-gold"
      />
    </label>
  );
}

function Area({ label, value, onChange, rows = 4, hint }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-[0.16em] text-muted">{label}</span>
      <textarea
        rows={rows}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-line bg-paper px-3.5 py-2.5 text-sm leading-relaxed text-ink outline-none focus:border-gold"
      />
      {hint && <span className="mt-1 block text-[0.68rem] text-faint">{hint}</span>}
    </label>
  );
}

function ImageField({ label, url, onUploaded, prefix }) {
  const [busy, setBusy] = useState(false);
  const pick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const u = await uploadImage(file, prefix);
      onUploaded(u);
    } catch (err) {
      alert(err.message);
    }
    setBusy(false);
  };
  return (
    <div>
      <span className="mb-1.5 block text-xs uppercase tracking-[0.16em] text-muted">{label}</span>
      <div className="flex items-center gap-4">
        {url && <img src={url} alt="" className="h-20 w-20 rounded-lg border border-line object-cover" />}
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-line px-4 py-2.5 text-xs uppercase tracking-[0.14em] text-muted hover:border-gold hover:text-gold">
          <UploadCloud size={15} /> {busy ? "Uploading…" : url ? "Replace" : "Upload"}
          <input type="file" accept="image/*" onChange={pick} className="hidden" />
        </label>
      </div>
    </div>
  );
}

// ---------- sections ----------
function BrandSection({ initial }) {
  const [f, setF] = useState(initial);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  // Persist images only when they are real uploaded URLs — never the bundler's
  // dev/build path (which would break the site).
  const payload = () => ({
    ...f,
    banner: /^https?:\/\//.test(f.banner || "") ? f.banner : null,
    portrait: /^https?:\/\//.test(f.portrait || "") ? f.portrait : null,
  });
  return (
    <Section title="Home / Brand" onSave={() => saveSection("artist", payload())}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Text label="Name" value={f.name} onChange={(v) => set("name", v)} />
        <Text label="Role" value={f.role} onChange={(v) => set("role", v)} />
      </div>
      <Text label="Subtitle (hero)" value={f.subtitle} onChange={(v) => set("subtitle", v)} />
      <Text label="Titles (nav drawer / contact)" value={f.titles} onChange={(v) => set("titles", v)} />
      <Text label="WhatsApp number (digits, with country code)" value={f.whatsapp} onChange={(v) => set("whatsapp", v)} placeholder="919200636667" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <ImageField label="Hero image" url={f.banner} prefix="hero" onUploaded={(u) => set("banner", u)} />
        <ImageField label="Portrait (About)" url={f.portrait} prefix="portrait" onUploaded={(u) => set("portrait", u)} />
      </div>
    </Section>
  );
}

function AboutSection({ initial }) {
  const [f, setF] = useState({
    ...initial,
    _paragraphs: (initial.paragraphs || []).join("\n\n"),
    _specialties: toLines(initial.specialties),
    _stats: JSON.stringify(initial.stats || [], null, 2),
  });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const build = () => {
    let stats = initial.stats;
    try {
      stats = JSON.parse(f._stats);
    } catch {
      /* keep previous if invalid */
    }
    return {
      heading: f.heading,
      lead: f.lead,
      paragraphs: f._paragraphs.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean),
      specialties: fromLines(f._specialties),
      stats,
    };
  };
  return (
    <Section title="About" onSave={() => saveSection("about", build())}>
      <Text label="Heading" value={f.heading} onChange={(v) => set("heading", v)} />
      <Area label="Lead (intro line)" value={f.lead} onChange={(v) => set("lead", v)} rows={2} />
      <Area label="Paragraphs" value={f._paragraphs} onChange={(v) => set("_paragraphs", v)} rows={8} hint="Separate paragraphs with a blank line." />
      <Area label="Specialties" value={f._specialties} onChange={(v) => set("_specialties", v)} rows={5} hint="One per line." />
      <Area label="Stats (JSON: [{value,label}])" value={f._stats} onChange={(v) => set("_stats", v)} rows={6} hint='e.g. [{"value":"15+","label":"Years Painting"}]' />
    </Section>
  );
}

function StudioSection({ initial }) {
  const [f, setF] = useState({
    ...initial,
    _paragraphs: (initial.paragraphs || []).join("\n\n"),
    _process: JSON.stringify(initial.process || [], null, 2),
  });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const build = () => {
    let process = initial.process;
    try {
      process = JSON.parse(f._process);
    } catch {
      /* keep */
    }
    return {
      heading: f.heading,
      lead: f.lead,
      paragraphs: f._paragraphs.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean),
      process,
    };
  };
  return (
    <Section title="Studio" onSave={() => saveSection("studio", build())}>
      <Text label="Heading" value={f.heading} onChange={(v) => set("heading", v)} />
      <Area label="Lead" value={f.lead} onChange={(v) => set("lead", v)} rows={2} />
      <Area label="Paragraphs" value={f._paragraphs} onChange={(v) => set("_paragraphs", v)} rows={6} hint="Separate paragraphs with a blank line." />
      <Area label="Process steps (JSON: [{step,title,text}])" value={f._process} onChange={(v) => set("_process", v)} rows={10} />
    </Section>
  );
}

function ContactSection({ initial }) {
  const [f, setF] = useState({ ...initial, _address: toLines(initial.address) });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const build = () => ({
    heading: f.heading,
    lead: f.lead,
    name: f.name,
    email: f.email,
    address: fromLines(f._address),
  });
  return (
    <Section title="Contact" onSave={() => saveSection("contact", build())}>
      <Text label="Heading" value={f.heading} onChange={(v) => set("heading", v)} />
      <Area label="Lead" value={f.lead} onChange={(v) => set("lead", v)} rows={2} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Text label="Studio name" value={f.name} onChange={(v) => set("name", v)} />
        <Text label="Email" value={f.email} onChange={(v) => set("email", v)} />
      </div>
      <Area label="Address" value={f._address} onChange={(v) => set("_address", v)} rows={3} hint="One line per row." />
    </Section>
  );
}

function MarqueeSection({ initial }) {
  const [text, setText] = useState(toLines(initial));
  return (
    <Section title="Marquee (scrolling words)" onSave={() => saveSection("marquee", fromLines(text))}>
      <Area label="Phrases" value={text} onChange={setText} rows={6} hint="One phrase per line." />
    </Section>
  );
}
