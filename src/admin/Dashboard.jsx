import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Users, Eye, Inbox, Radio } from "lucide-react";
import { supabase } from "../lib/supabase";

const RANGES = [
  { id: "24h", label: "24 hours", ms: 24 * 3600e3, bucket: "hour" },
  { id: "3d", label: "3 days", ms: 3 * 864e5, bucket: "day" },
  { id: "7d", label: "7 days", ms: 7 * 864e5, bucket: "day" },
  { id: "15d", label: "15 days", ms: 15 * 864e5, bucket: "day" },
  { id: "30d", label: "30 days", ms: 30 * 864e5, bucket: "day" },
];

const PIE_COLORS = ["#856832", "#b8924a", "#1a1a1a", "#9a7b3f", "#c9b285", "#6b6b6b", "#73592c", "#d8c79e"];

function keyFor(d, bucket) {
  const dd = d.getDate();
  const mm = d.getMonth() + 1;
  if (bucket === "hour") return `${dd}/${mm} ${String(d.getHours()).padStart(2, "0")}h`;
  return `${dd}/${mm}`;
}

function buildBuckets(cutoff, bucket) {
  const out = [];
  const cur = new Date(cutoff);
  const now = new Date();
  if (bucket === "hour") {
    cur.setMinutes(0, 0, 0);
    while (cur <= now) {
      out.push(new Date(cur));
      cur.setHours(cur.getHours() + 1);
    }
  } else {
    cur.setHours(0, 0, 0, 0);
    while (cur <= now) {
      out.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }
  }
  return out;
}

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="rounded-2xl border border-line bg-mat p-5 shadow-frame">
      <div className="flex items-center gap-2 text-muted">
        <Icon size={16} />
        <span className="text-[0.68rem] uppercase tracking-[0.18em]">{label}</span>
      </div>
      <p className="mt-3 font-display text-4xl text-ink">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
    </div>
  );
}

export default function Dashboard() {
  const [rangeId, setRangeId] = useState("7d");
  const [visits, setVisits] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const range = RANGES.find((r) => r.id === rangeId);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const cutoff = new Date(Date.now() - range.ms).toISOString();
    Promise.all([
      supabase.from("visits").select("created_at, source, device, session_id").gte("created_at", cutoff),
      supabase.from("leads").select("created_at, type, source, artwork_title").gte("created_at", cutoff),
    ]).then(([v, l]) => {
      if (!active) return;
      setVisits(v.data ?? []);
      setLeads(l.data ?? []);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [rangeId, range.ms]);

  const stats = useMemo(() => {
    const cutoff = Date.now() - range.ms;
    const buckets = buildBuckets(cutoff, range.bucket);
    const counts = Object.fromEntries(buckets.map((b) => [keyFor(b, range.bucket), 0]));
    visits.forEach((v) => {
      const k = keyFor(new Date(v.created_at), range.bucket);
      if (k in counts) counts[k] += 1;
    });
    const series = buckets.map((b) => {
      const k = keyFor(b, range.bucket);
      return { label: k, visits: counts[k] };
    });

    const bySource = {};
    const byDevice = {};
    visits.forEach((v) => {
      const s = v.source || "direct";
      bySource[s] = (bySource[s] || 0) + 1;
      const d = v.device || "unknown";
      byDevice[d] = (byDevice[d] || 0) + 1;
    });
    const pie = Object.entries(bySource)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return {
      series,
      pie,
      byDevice,
      total: visits.length,
      unique: new Set(visits.map((v) => v.session_id).filter(Boolean)).size,
      topSource: pie[0]?.name ?? "—",
    };
  }, [visits, range]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Dashboard</h1>
          <p className="mt-1 text-sm text-muted">Visitor analytics & inquiries</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {RANGES.map((r) => (
            <button
              key={r.id}
              onClick={() => setRangeId(r.id)}
              className={`rounded-full border px-3.5 py-1.5 text-xs uppercase tracking-[0.14em] transition-colors ${
                rangeId === r.id
                  ? "border-ink bg-ink text-paper"
                  : "border-line text-muted hover:border-gold hover:text-gold"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Eye} label="Page views" value={stats.total} sub={`Last ${range.label}`} />
        <StatCard icon={Users} label="Unique visitors" value={stats.unique} sub="By browser session" />
        <StatCard icon={Inbox} label="Inquiries" value={leads.length} sub="WhatsApp / commission" />
        <StatCard icon={Radio} label="Top source" value={stats.topSource} sub="Most traffic from" />
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-line bg-mat p-5 shadow-frame lg:col-span-2">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.16em] text-muted">
            Visitors over time
          </h2>
          <div className="h-72">
            {loading ? (
              <Empty text="Loading…" />
            ) : stats.total === 0 ? (
              <Empty text="No visits in this range yet." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.series} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#856832" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#856832" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4dfd7" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6b6b6b" }} interval="preserveStartEnd" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#6b6b6b" }} width={32} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "1px solid #e4dfd7", fontSize: 12 }}
                    labelStyle={{ color: "#1a1a1a" }}
                  />
                  <Area type="monotone" dataKey="visits" stroke="#856832" strokeWidth={2} fill="url(#gold)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-mat p-5 shadow-frame">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.16em] text-muted">
            Traffic sources
          </h2>
          <div className="h-72">
            {stats.pie.length === 0 ? (
              <Empty text="No data yet." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.pie}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {stats.pie.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e4dfd7", fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Recent inquiries */}
      <div className="mt-6 rounded-2xl border border-line bg-mat p-5 shadow-frame">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.16em] text-muted">
          Recent inquiries
        </h2>
        {leads.length === 0 ? (
          <Empty text="No inquiries in this range yet." small />
        ) : (
          <ul className="divide-y divide-line">
            {leads
              .slice()
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              .slice(0, 8)
              .map((l, i) => (
                <li key={i} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div className="min-w-0">
                    <span className="font-medium text-ink">{l.artwork_title || l.type}</span>
                    <span className="ml-2 text-xs text-muted">via {l.source || "—"}</span>
                  </div>
                  <span className="shrink-0 text-xs text-muted">
                    {new Date(l.created_at).toLocaleString()}
                  </span>
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Empty({ text, small }) {
  return (
    <div className={`grid h-full place-items-center ${small ? "py-8" : ""}`}>
      <span className="text-sm text-muted">{text}</span>
    </div>
  );
}
