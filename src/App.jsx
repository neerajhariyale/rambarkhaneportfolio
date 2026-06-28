import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import PublicSite from "./PublicSite";

// Admin is code-split so it never weighs down the public site bundle.
const AdminLogin = lazy(() => import("./admin/Login"));
const AdminApp = lazy(() => import("./admin/AdminApp"));
const RequireAuth = lazy(() => import("./admin/RequireAuth"));

function AdminFallback() {
  return (
    <div className="grid min-h-screen place-items-center bg-paper text-muted">
      <span className="text-sm uppercase tracking-[0.2em]">Loading…</span>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicSite />} />
      <Route
        path="/admin/login"
        element={
          <Suspense fallback={<AdminFallback />}>
            <AdminLogin />
          </Suspense>
        }
      />
      <Route
        path="/admin/*"
        element={
          <Suspense fallback={<AdminFallback />}>
            <RequireAuth>
              <AdminApp />
            </RequireAuth>
          </Suspense>
        }
      />
    </Routes>
  );
}
