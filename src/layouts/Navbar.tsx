import { Link, useNavigate } from "react-router-dom";
import { FiMenu, FiExternalLink, FiLogOut } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

export function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/70 bg-white/85 px-4 backdrop-blur-md lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          aria-label="Buka menu"
          className="rounded-lg p-2 text-ink-muted hover:bg-slate-100 lg:hidden"
        >
          <FiMenu size={20} />
        </button>
        <Link to="/admin" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-tulus-500 font-display text-lg font-semibold text-white">
            T.
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold text-ink">
              Admin
            </span>
            {/* <span className="block text-[11px] uppercase tracking-[0.16em] text-ink-muted">
              Dashboard Admin
            </span> */}
          </span>
        </Link>
      </div>
      <div className="flex items-center gap-2">
        <Link
          to="/"
          className="hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-ink-muted hover:bg-slate-100 sm:flex"
        >
          <FiExternalLink size={15} /> Lihat Situs Publik
        </Link>
        <button
          onClick={handleLogout}
          className="hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-ink-muted hover:bg-red-50 hover:text-red-600 sm:flex"
        >
          <FiLogOut size={15} /> Keluar
        </button>
        <div className="grid h-9 w-9 place-items-center rounded-full bg-tulus-100 text-sm font-semibold text-tulus-700">
          TP
        </div>
      </div>
    </header>
  );
}
