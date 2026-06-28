import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

const STATUSES = ["new", "contacted", "closed"];
const STATUS_STYLE = {
  new: "bg-gold/15 text-gold-deep",
  contacted: "bg-blue-50 text-blue-700",
  closed: "bg-paper-3 text-muted",
};

export default function LeadsAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const setStatus = async (lead, status) => {
    setItems((prev) => prev.map((l) => (l.id === lead.id ? { ...l, status } : l)));
    await supabase.from("leads").update({ status, handled: status !== "new" }).eq("id", lead.id);
  };

  const visible = useMemo(
    () => (filter === "all" ? items : items.filter((l) => l.status === filter)),
    [items, filter]
  );

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Inquiries</h1>
          <p className="mt-1 text-sm text-muted">
            {items.length} interest events · tracked with their source
          </p>
        </div>
        <div className="flex gap-1.5">
          {["all", ...STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-full border px-3.5 py-1.5 text-xs uppercase tracking-[0.14em] transition-colors ${
                filter === s ? "border-ink bg-ink text-paper" : "border-line text-muted hover:border-gold hover:text-gold"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : visible.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-line bg-mat py-16 text-sm text-muted">
          No inquiries yet. They appear here when a visitor taps “Inquire / WhatsApp”.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-mat shadow-frame">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-[0.66rem] uppercase tracking-[0.16em] text-muted">
                <th className="px-4 py-3 font-medium">When</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Artwork / Type</th>
                <th className="px-4 py-3 font-medium">Source</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {visible.map((l) => (
                <tr key={l.id} className="hover:bg-paper-2">
                  <td className="whitespace-nowrap px-4 py-3 text-muted">
                    {new Date(l.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3" title={l.message || ""}>
                    {l.name || l.email || l.phone ? (
                      <div>
                        {l.name && <span className="font-medium text-ink">{l.name}</span>}
                        <div className="text-xs text-muted">
                          {[l.email, l.phone].filter(Boolean).join(" · ") || "—"}
                        </div>
                        {l.message && (
                          <div className="mt-0.5 max-w-[220px] truncate text-xs text-faint">
                            “{l.message}”
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-ink">{l.artwork_title || "—"}</span>
                    <span className="ml-2 rounded-full bg-paper-3 px-2 py-0.5 text-[0.6rem] uppercase tracking-wide text-muted">
                      {l.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 capitalize text-ink">{l.source || "—"}</td>
                  <td className="px-4 py-3 text-gold">{l.price || "—"}</td>
                  <td className="px-4 py-3">
                    <select
                      value={l.status}
                      onChange={(e) => setStatus(l, e.target.value)}
                      className={`rounded-full px-2.5 py-1 text-[0.65rem] uppercase tracking-wide outline-none ${STATUS_STYLE[l.status] || ""}`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
