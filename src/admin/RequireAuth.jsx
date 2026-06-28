import { Navigate } from "react-router-dom";
import { useAuth } from "../lib/useAuth";

export default function RequireAuth({ children }) {
  const session = useAuth();

  if (session === undefined) {
    return (
      <div className="grid min-h-screen place-items-center bg-paper text-muted">
        <span className="text-sm uppercase tracking-[0.2em]">Checking session…</span>
      </div>
    );
  }
  if (!session) return <Navigate to="/admin/login" replace />;
  return children;
}
