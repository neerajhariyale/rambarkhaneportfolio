import { Routes, Route, NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Image, FolderOpen, Inbox, FileText, LogOut, ExternalLink } from "lucide-react";
import { signOut } from "../lib/useAuth";
import Dashboard from "./Dashboard";
import ArtworksAdmin from "./ArtworksAdmin";
import CollectionsAdmin from "./CollectionsAdmin";
import LeadsAdmin from "./LeadsAdmin";
import ContentAdmin from "./ContentAdmin";

const NAV = [
  { to: "/admin", end: true, label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/artworks", label: "Artworks", icon: Image },
  { to: "/admin/collections", label: "Collections", icon: FolderOpen },
  { to: "/admin/content", label: "Content", icon: FileText },
  { to: "/admin/leads", label: "Inquiries", icon: Inbox },
];

export default function AdminApp() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="mx-auto flex max-w-7xl flex-col gap-0 md:flex-row">
        {/* Sidebar */}
        <aside className="sticky top-0 z-20 flex h-auto shrink-0 flex-col border-b border-line bg-paper-2 px-4 py-4 md:h-screen md:w-60 md:border-b-0 md:border-r md:py-7">
          <div className="mb-0 flex items-center justify-between md:mb-8 md:block">
            <a href="/" className="flex items-baseline gap-2">
              <span className="font-display text-xl font-semibold text-ink">Ram</span>
              <span className="font-display text-xl font-semibold text-gradient-gold">Barkhane</span>
            </a>
            <p className="hidden text-[0.65rem] uppercase tracking-[0.22em] text-muted md:mt-1 md:block">
              Studio Admin
            </p>
          </div>

          <nav className="hidden gap-1 md:flex md:flex-col">
            {NAV.map(({ to, end, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    isActive ? "bg-ink text-paper" : "text-muted hover:bg-paper-3 hover:text-ink"
                  }`
                }
              >
                <Icon size={17} />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto hidden flex-col gap-1 md:flex">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted transition-colors hover:bg-paper-3 hover:text-ink"
            >
              <ExternalLink size={17} /> View site
            </a>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted transition-colors hover:bg-paper-3 hover:text-ink"
            >
              <LogOut size={17} /> Sign out
            </button>
          </div>
        </aside>

        {/* Mobile nav */}
        <nav className="flex gap-1 overflow-x-auto border-b border-line bg-paper-2 px-3 py-2 md:hidden">
          {NAV.map(({ to, end, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs transition-colors ${
                  isActive ? "bg-ink text-paper" : "text-muted"
                }`
              }
            >
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
          <button onClick={handleSignOut} className="ml-auto shrink-0 px-3 py-2 text-xs text-muted">
            <LogOut size={15} />
          </button>
        </nav>

        {/* Content */}
        <main className="min-w-0 flex-1 px-5 py-8 sm:px-8">
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="artworks" element={<ArtworksAdmin />} />
            <Route path="collections" element={<CollectionsAdmin />} />
            <Route path="content" element={<ContentAdmin />} />
            <Route path="leads" element={<LeadsAdmin />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
