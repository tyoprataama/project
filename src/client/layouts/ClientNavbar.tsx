import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { FiMenu, FiX, FiSun, FiMoon } from "react-icons/fi";
import { Container } from "../components/Container";
import { SeasonSelector } from "../components/SeasonSelector";
import { clientNav } from "../constants/clientNav";
import { useTheme } from "../theme";

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-tulus-500 font-display text-lg font-semibold text-white shadow-sm">
        T.
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-semibold text-ink dark:text-white">
          Taniku
        </span>
      </span>
    </Link>
  );
}

function ThemeToggle({ className = "" }: { className?: string }) {
  const { isDark, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
      title={isDark ? "Mode terang" : "Mode gelap"}
      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border border-slate-200/80 bg-white/60 text-ink-muted transition hover:text-ink hover:shadow-sm dark:border-white/15 dark:bg-white/10 dark:text-white/70 dark:hover:text-white ${className}`}
    >
      {isDark ? <FiSun size={17} /> : <FiMoon size={16} />}
    </button>
  );
}

export function ClientNavbar() {
  const [open, setOpen] = useState(false);

  // Tutup menu mobile saat viewport melebar ke desktop.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => mq.matches && setOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <Container className="pt-3 sm:pt-4">
        {/* Pill navbar floating bergaya glass */}
        <div className="flex h-14 items-center justify-between gap-3 rounded-2xl border border-white/60 bg-white/55 pl-4 pr-3 shadow-[0_10px_30px_-12px_rgba(16,35,66,0.35)] ring-1 ring-white/40 glass-panel overflow-hidden transition-colors dark:border-white/10 dark:bg-[#202020]/55 dark:shadow-[0_12px_34px_-14px_rgba(0,0,0,0.7)] dark:ring-white/5">
          <Brand />

          <nav className="hidden items-center gap-7 md:flex">
            {clientNav.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  `link-underline text-sm font-medium transition-colors ${
                    isActive
                      ? "text-tulus-700 dark:text-white"
                      : "text-ink-muted hover:text-ink dark:text-white/60 dark:hover:text-white"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden md:block">
              <SeasonSelector />
            </div>
            <ThemeToggle />
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
              className="grid h-9 w-9 place-items-center rounded-full text-ink transition hover:bg-black/5 dark:text-white dark:hover:bg-white/10 md:hidden"
            >
              {open ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>

        {/* Panel mobile (glass) */}
        {open ? (
          <div className="mt-2 glass-panel overflow-hidden rounded-2xl border border-white/60 bg-white/80 shadow-lg dark:border-white/10 dark:bg-[#202020]/90 md:hidden">
            <div className="flex flex-col gap-1 p-3">
              {clientNav.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `rounded-xl px-3 py-2.5 text-sm font-medium ${
                      isActive
                        ? "bg-tulus-50 text-tulus-700 dark:bg-white/10 dark:text-white"
                        : "text-ink-muted hover:bg-slate-50 dark:text-white/70 dark:hover:bg-white/5"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <div className="mt-3 px-1">
                <SeasonSelector compact onSelect={() => setOpen(false)} />
              </div>
            </div>
          </div>
        ) : null}
      </Container>
    </header>
  );
}
