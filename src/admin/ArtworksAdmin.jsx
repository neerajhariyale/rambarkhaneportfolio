import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Star, X, UploadCloud } from "lucide-react";
import { supabase } from "../lib/supabase";

const slugify = (s) =>
  (s || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const EMPTY = {
  title: "",
  medium: "Oil on Canvas",
  dimensions: "",
  price: "",
  year: "",
  statement: "",
  collection_id: "",
  is_featured: false,
  is_available: true,
  sort_order: 0,
  image_url: "",
};

export default function ArtworksAdmin() {
  const [items, setItems] = useState([]);
  const [collections, setCollections] = useState([]);
  const [editing, setEditing] = useState(null); // null | EMPTY-shaped object
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [a, c] = await Promise.all([
      supabase.from("artworks").select("*, collection:collections(slug,label)").order("sort_order"),
      supabase.from("collections").select("id, slug, label").order("sort_order"),
    ]);
    setItems(a.data ?? []);
    setCollections(c.data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (art) => {
    if (!confirm(`Delete “${art.title}”? This cannot be undone.`)) return;
    const { error } = await supabase.from("artworks").delete().eq("id", art.id);
    if (error) alert(error.message);
    else load();
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl">Artworks</h1>
          <p className="mt-1 text-sm text-muted">{items.length} works in the catalog</p>
        </div>
        <button
          onClick={() => setEditing({ ...EMPTY, sort_order: items.length })}
          className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-xs font-medium uppercase tracking-[0.16em] text-paper transition-colors hover:bg-gold-deep"
        >
          <Plus size={15} /> Add artwork
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((art) => (
            <div key={art.id} className="overflow-hidden rounded-2xl border border-line bg-mat shadow-frame">
              <div className="relative aspect-[4/3] bg-paper-3">
                {art.image_url && (
                  <img src={art.image_url} alt={art.title} className="h-full w-full object-cover" />
                )}
                {art.is_featured && (
                  <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-ink/80 px-2.5 py-1 text-[0.6rem] uppercase tracking-wide text-paper backdrop-blur">
                    <Star size={11} /> Featured
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-display text-xl italic text-ink">{art.title}</h3>
                <p className="mt-1 text-[0.66rem] uppercase tracking-[0.16em] text-muted">
                  {art.collection?.label || "—"} · {art.price || "—"}
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => setEditing(art)}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-line py-2 text-xs text-ink transition-colors hover:border-gold hover:text-gold"
                  >
                    <Pencil size={13} /> Edit
                  </button>
                  <button
                    onClick={() => remove(art)}
                    className="inline-flex items-center justify-center rounded-lg border border-line px-3 py-2 text-xs text-muted transition-colors hover:border-red-300 hover:text-red-600"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <ArtworkForm
          initial={editing}
          collections={collections}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function ArtworkForm({ initial, collections, onClose, onSaved }) {
  const isEdit = Boolean(initial.id);
  const [form, setForm] = useState({
    ...EMPTY,
    ...initial,
    collection_id: initial.collection_id || "",
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(initial.image_url || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onPick = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      let image_url = form.image_url;
      if (file) {
        const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
        const path = `${slugify(form.title) || "artwork"}-${Date.now()}.${ext}`;
        const up = await supabase.storage
          .from("artworks")
          .upload(path, file, { contentType: file.type, upsert: true });
        if (up.error) throw up.error;
        image_url = supabase.storage.from("artworks").getPublicUrl(path).data.publicUrl;
      }

      const payload = {
        title: form.title,
        slug: slugify(form.title),
        medium: form.medium,
        dimensions: form.dimensions,
        price: form.price,
        year: form.year,
        statement: form.statement,
        collection_id: form.collection_id || null,
        is_featured: form.is_featured,
        is_available: form.is_available,
        sort_order: Number(form.sort_order) || 0,
        image_url,
      };

      const res = isEdit
        ? await supabase.from("artworks").update(payload).eq("id", initial.id)
        : await supabase.from("artworks").insert(payload);
      if (res.error) throw res.error;
      onSaved();
    } catch (err) {
      setError(err.message || "Save failed");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/40 backdrop-blur-sm" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={save}
        className="scrollbar-luxe flex h-full w-full max-w-lg flex-col overflow-y-auto bg-paper p-6 shadow-frame-lg sm:p-8"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-2xl">{isEdit ? "Edit artwork" : "New artwork"}</h2>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full border border-line text-muted hover:text-ink">
            <X size={18} />
          </button>
        </div>

        {/* Image */}
        <label className="mb-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-mat p-5 text-center text-muted hover:border-gold">
          {preview ? (
            <img src={preview} alt="" className="max-h-44 rounded-lg object-contain" />
          ) : (
            <>
              <UploadCloud size={24} />
              <span className="text-xs uppercase tracking-[0.16em]">Upload image</span>
            </>
          )}
          <input type="file" accept="image/*" onChange={onPick} className="hidden" />
          {preview && <span className="text-[0.65rem] uppercase tracking-[0.16em]">Change image</span>}
        </label>

        <div className="grid gap-4">
          <Field label="Title" value={form.title} onChange={(v) => set("title", v)} required />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Medium" value={form.medium} onChange={(v) => set("medium", v)} />
            <Field label="Year" value={form.year} onChange={(v) => set("year", v)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Dimensions" value={form.dimensions} onChange={(v) => set("dimensions", v)} placeholder="30 × 40 in" />
            <Field label="Price" value={form.price} onChange={(v) => set("price", v)} placeholder="$100,000" />
          </div>

          <div>
            <Label>Collection</Label>
            <select
              value={form.collection_id}
              onChange={(e) => set("collection_id", e.target.value)}
              className="w-full rounded-lg border border-line bg-mat px-3.5 py-2.5 text-sm text-ink outline-none focus:border-gold"
            >
              <option value="">— None —</option>
              {collections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>Statement</Label>
            <textarea
              value={form.statement || ""}
              onChange={(e) => set("statement", e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-line bg-mat px-3.5 py-2.5 text-sm text-ink outline-none focus:border-gold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Sort order" type="number" value={form.sort_order} onChange={(v) => set("sort_order", v)} />
            <div className="flex items-end gap-4 pb-1">
              <Toggle label="Featured" checked={form.is_featured} onChange={(v) => set("is_featured", v)} />
              <Toggle label="Available" checked={form.is_available} onChange={(v) => set("is_available", v)} />
            </div>
          </div>
        </div>

        {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-full bg-ink px-6 py-3 text-xs font-medium uppercase tracking-[0.18em] text-paper transition-colors hover:bg-gold-deep disabled:opacity-60"
          >
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create artwork"}
          </button>
          <button type="button" onClick={onClose} className="rounded-full border border-line px-6 py-3 text-xs uppercase tracking-[0.18em] text-muted hover:text-ink">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function Label({ children }) {
  return <span className="mb-1.5 block text-xs uppercase tracking-[0.16em] text-muted">{children}</span>;
}

function Field({ label, value, onChange, type = "text", required, placeholder }) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <input
        type={type}
        required={required}
        placeholder={placeholder}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-line bg-mat px-3.5 py-2.5 text-sm text-ink outline-none focus:border-gold"
      />
    </label>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
      <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-[#856832]" />
      {label}
    </label>
  );
}
