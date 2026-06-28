import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Star, X } from "lucide-react";
import { supabase } from "../lib/supabase";

const slugify = (s) =>
  (s || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const EMPTY = { slug: "", label: "", description: "", sort_order: 0, is_featured: false };

export default function CollectionsAdmin() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("collections").select("*").order("sort_order");
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (c) => {
    if (!confirm(`Delete collection “${c.label}”? Artworks will be unassigned.`)) return;
    const { error } = await supabase.from("collections").delete().eq("id", c.id);
    if (error) alert(error.message);
    else load();
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl">Collections</h1>
          <p className="mt-1 text-sm text-muted">{items.length} collections</p>
        </div>
        <button
          onClick={() => setEditing({ ...EMPTY, sort_order: items.length + 1 })}
          className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-xs font-medium uppercase tracking-[0.16em] text-paper transition-colors hover:bg-gold-deep"
        >
          <Plus size={15} /> Add collection
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-mat shadow-frame">
          <ul className="divide-y divide-line">
            {items.map((c) => (
              <li key={c.id} className="flex items-center gap-4 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-xl text-ink">{c.label}</h3>
                    {c.is_featured && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2 py-0.5 text-[0.6rem] uppercase tracking-wide text-gold-deep">
                        <Star size={10} /> Featured
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted">
                    /{c.slug} · order {c.sort_order}
                    {c.description ? ` · ${c.description}` : ""}
                  </p>
                </div>
                <button onClick={() => setEditing(c)} className="grid h-9 w-9 place-items-center rounded-lg border border-line text-ink hover:border-gold hover:text-gold">
                  <Pencil size={14} />
                </button>
                <button onClick={() => remove(c)} className="grid h-9 w-9 place-items-center rounded-lg border border-line text-muted hover:border-red-300 hover:text-red-600">
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {editing && (
        <CollectionForm
          initial={editing}
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

function CollectionForm({ initial, onClose, onSaved }) {
  const isEdit = Boolean(initial.id);
  const [form, setForm] = useState({ ...EMPTY, ...initial });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      slug: form.slug ? slugify(form.slug) : slugify(form.label),
      label: form.label,
      description: form.description,
      sort_order: Number(form.sort_order) || 0,
      is_featured: form.is_featured,
    };
    const res = isEdit
      ? await supabase.from("collections").update(payload).eq("id", initial.id)
      : await supabase.from("collections").insert(payload);
    if (res.error) {
      setError(res.error.message);
      setSaving(false);
    } else onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/40 backdrop-blur-sm" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={save}
        className="flex h-full w-full max-w-md flex-col bg-paper p-6 shadow-frame-lg sm:p-8"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-2xl">{isEdit ? "Edit collection" : "New collection"}</h2>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full border border-line text-muted hover:text-ink">
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-4">
          <Field label="Label" value={form.label} onChange={(v) => set("label", v)} required placeholder="The Masterpiece Collection" />
          <Field label="Slug (URL key)" value={form.slug} onChange={(v) => set("slug", v)} placeholder="auto from label" />
          <label className="block">
            <span className="mb-1.5 block text-xs uppercase tracking-[0.16em] text-muted">Description</span>
            <textarea
              value={form.description || ""}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-line bg-mat px-3.5 py-2.5 text-sm text-ink outline-none focus:border-gold"
            />
          </label>
          <div className="flex items-center justify-between">
            <Field label="Sort order" type="number" value={form.sort_order} onChange={(v) => set("sort_order", v)} />
            <label className="flex cursor-pointer items-center gap-2 pt-5 text-sm text-ink">
              <input type="checkbox" checked={!!form.is_featured} onChange={(e) => set("is_featured", e.target.checked)} className="h-4 w-4 accent-[#856832]" />
              Featured collection
            </label>
          </div>
        </div>

        {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <div className="mt-6 flex gap-3">
          <button type="submit" disabled={saving} className="flex-1 rounded-full bg-ink px-6 py-3 text-xs font-medium uppercase tracking-[0.18em] text-paper transition-colors hover:bg-gold-deep disabled:opacity-60">
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create"}
          </button>
          <button type="button" onClick={onClose} className="rounded-full border border-line px-6 py-3 text-xs uppercase tracking-[0.18em] text-muted hover:text-ink">
            Cancel
          </button>
        </div>
      </form>
    </div>
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
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-line bg-mat px-3.5 py-2.5 text-sm text-ink outline-none focus:border-gold"
      />
    </label>
  );
}
