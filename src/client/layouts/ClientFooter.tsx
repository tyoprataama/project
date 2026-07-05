import { Link } from "react-router-dom";
import { FiGithub, FiMail, FiMapPin } from "react-icons/fi";
import { Container } from "../components/Container";
import { clientNav, profile } from "../constants/clientNav";

export function ClientFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-white/10 dark:bg-[#191919]">
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-tulus-500 font-display text-lg font-semibold text-white">
                T.
              </span>
              <span className="font-display text-lg font-medium text-ink dark:text-white">
                Taniku
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-muted dark:text-white/60">
              Studi kasus portfolio: sistem manajemen operasi lapangan berbasis
              data, dirancang untuk pengambilan keputusan yang jelas dan
              terukur.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted dark:text-white/50">
              Navigasi
            </h3>
            <ul className="mt-4 space-y-2.5">
              {clientNav.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className="text-sm text-ink-soft transition-colors hover:text-tulus-700 dark:text-white/70 dark:hover:text-[#5E9FE8]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted dark:text-white/50">
              Kontak
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-soft dark:text-white/70">
              <li>
                {/* <a
                  href={profile.github}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 transition-colors hover:text-tulus-700"
                >
                  <FiGithub size={15} /> {profile.githubHandle}
                </a> */}
              </li>
              <li>
                <a
                  href={`mailto:${profile.email}`}
                  className="inline-flex items-center gap-2 transition-colors hover:text-tulus-700 dark:hover:text-[#5E9FE8]"
                >
                  <FiMail size={15} /> {profile.email}
                </a>
              </li>
              <li className="inline-flex items-center gap-2">
                <FiMapPin size={15} /> {profile.location}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-6 text-xs text-ink-muted dark:border-white/10 dark:text-white/50 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {profile.name}. Dibuat dengan 💙 Vite,
            TypeScript, Tailwind CSS & Claude.
          </p>
          {/* <p>Data ditampilkan dari mock dataset internal.</p> */}
        </div>
      </Container>
    </footer>
  );
}
