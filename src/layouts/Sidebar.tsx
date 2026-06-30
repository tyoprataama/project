import { NavLink, useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import { navItems } from "../constants/navigation";
import { useAuth } from "../context/AuthContext";

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    onNavigate?.();
    navigate("/admin/login", { replace: true });
  };

  return (
    <nav className="flex h-full flex-col gap-1 overflow-y-auto p-4 scrollbar-thin">
      <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">
        Menu
      </p>
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === "/admin"}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              isActive
                ? "bg-tulus-50 text-tulus-700"
                : "text-ink-muted hover:bg-slate-50 hover:text-ink"
            }`
          }
        >
          <item.icon size={18} />
          {item.label}
        </NavLink>
      ))}

      <button
        onClick={handleLogout}
        className="mt-auto flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-muted transition hover:bg-red-50 hover:text-red-600"
      >
        <FiLogOut size={18} /> Keluar
      </button>
    </nav>
  );
}
