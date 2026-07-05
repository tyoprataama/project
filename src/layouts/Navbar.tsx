import { Link, useNavigate } from "react-router-dom";
import {
  FiMenu,
  FiExternalLink,
  FiLogOut,
  FiSun,
  FiMoon,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../client/theme";

function ThemeToggle() {
  const { isDark, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
      title={isDark ? "Mode terang" : "Mode gelap"}
      className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-slate-200/80 bg-white/60 text-ink-muted transition hover:text-ink dark:border-white/15 dark:bg-white/10 dark:text-white/70 dark:hover:text-white"
    >
      {isDark ? <FiSun size={17} /> : <FiMoon size={16} />}
    </button>
  );
}

export function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <header className="fixed inset-x-0 top-0 z-40">
      <div className="mx-auto max-w-7xl px-4 pt-3 lg:px-8">
        <div className="glass-panel flex h-14 items-center justify-between gap-3 overflow-hidden rounded-2xl border border-white/60 bg-white/55 pl-2 pr-2 shadow-[0_10px_30px_-12px_rgba(16,35,66,0.35)] ring-1 ring-white/40 dark:border-white/10 dark:bg-[#202020]/55 dark:shadow-[0_12px_34px_-14px_rgba(0,0,0,0.7)] dark:ring-white/5 sm:pl-3 sm:pr-3">
          <div className="flex items-center gap-2">
            <button
              onClick={onMenuClick}
              aria-label="Buka menu"
              className="rounded-lg p-2 text-ink-muted transition hover:bg-black/5 dark:hover:bg-white/10 lg:hidden"
            >
              <FiMenu size={20} />
            </button>
            <Link to="/admin" className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-tulus-500 font-display text-lg font-semibold text-white shadow-sm">
                T.
              </span>
              <span className="leading-tight">
                <span className="block text-sm font-semibold text-ink dark:text-white">
                  Admin
                </span>
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-ink-muted transition hover:bg-black/5 dark:hover:bg-white/10 sm:flex"
            >
              <FiExternalLink size={15} /> Lihat Situs Publik
            </Link>
            <button
              onClick={handleLogout}
              className="hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-ink-muted transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/15 dark:hover:text-[#f0a59c] sm:flex"
            >
              <FiLogOut size={15} /> Keluar
            </button>
            <ThemeToggle />
            <div className="grid h-9 w-9 place-items-center rounded-full bg-tulus-100 text-sm font-semibold text-tulus-700 dark:bg-white/10 dark:text-[#8fbdf0]">
              TP
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
