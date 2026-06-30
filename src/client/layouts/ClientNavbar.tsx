import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import { Container } from "../components/Container";
import { SeasonSelector } from "../components/SeasonSelector";
import { clientNav, profile } from "../constants/clientNav";

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-tulus-500 font-display text-lg font-semibold text-white">
        T.
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-semibold text-ink">Taniku</span>
        {/* <span className="block text-[11px] uppercase tracking-[0.16em] text-ink-muted">
          {profile.name}
        </span> */}
      </span>
    </Link>
  );
}

export function ClientNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between">
        <Brand />

        <nav className="hidden items-center gap-8 md:flex">
          {clientNav.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `link-underline text-sm font-medium transition-colors ${
                  isActive ? "text-tulus-700" : "text-ink-muted hover:text-ink"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:block">
          <SeasonSelector />
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
          className="rounded-lg p-2 text-ink md:hidden"
        >
          {open ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </Container>

      {open ? (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {clientNav.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2.5 text-sm font-medium ${
                    isActive
                      ? "bg-tulus-50 text-tulus-700"
                      : "text-ink-muted hover:bg-slate-50"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <div className="mt-3 px-1">
              <SeasonSelector compact />
            </div>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
