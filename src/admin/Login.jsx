import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { useAuth } from "../lib/useAuth";

export default function Login() {
  const navigate = useNavigate();
  const session = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Already signed in → go straight to the dashboard.
  useEffect(() => {
    if (session) navigate("/admin", { replace: true });
  }, [session, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      setError("Supabase is not configured (.env.local missing).");
      return;
    }
    setLoading(true);
    setError("");
    // A bare username maps to its synthetic email; a full email is used as-is.
    const id = username.trim();
    const email = id.includes("@") ? id : `${id}@rambarkhane.app`;
    const { error: err } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    navigate("/admin", { replace: true });
  };

  return (
    <div className="grid min-h-screen place-items-center bg-paper px-6 text-ink">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="grid mx-auto mb-5 h-12 w-12 place-items-center rounded-full bg-ink text-paper">
            <Lock size={18} />
          </span>
          <h1 className="font-display text-3xl">
            Studio <span className="italic text-gradient-gold">Admin</span>
          </h1>
          <p className="mt-2 text-sm text-muted">Ram Barkhane portfolio</p>
        </div>

        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-2xl border border-line bg-mat p-7 shadow-frame"
        >
          <div>
            <label htmlFor="username" className="mb-1.5 block text-xs uppercase tracking-[0.18em] text-muted">
              Username
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              required
              placeholder="admin-ram"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-line bg-paper px-3.5 py-2.5 text-sm text-ink outline-none focus:border-gold"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-xs uppercase tracking-[0.18em] text-muted">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-line bg-paper px-3.5 py-2.5 text-sm text-ink outline-none focus:border-gold"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-ink px-6 py-3 text-xs font-medium uppercase tracking-[0.2em] text-paper transition-colors hover:bg-gold-deep disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <a
          href="/"
          className="mt-6 block text-center text-xs uppercase tracking-[0.18em] text-muted transition-colors hover:text-gold"
        >
          ← Back to site
        </a>
      </div>
    </div>
  );
}
