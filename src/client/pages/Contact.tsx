import { Link } from "react-router-dom";
import { FiGithub, FiMail, FiMapPin, FiArrowUpRight } from "react-icons/fi";
import { Container } from "../components/Container";
import { Reveal } from "../components/Reveal";
import { profile } from "../constants/clientNav";

const links = [
  {
    icon: FiMail,
    label: "Email",
    value: profile.email,
    href: `mailto:${profile.email}`,
  },
  {
    icon: FiGithub,
    label: "GitHub",
    value: profile.githubHandle,
    href: profile.github,
  },
  {
    icon: FiMapPin,
    label: "Lokasi",
    value: profile.location,
    href: null,
  },
];

export default function Contact() {
  return (
    <section className="bg-white">
      <Container className="py-20 lg:py-28">
        <div className="grid gap-14 lg:grid-cols-[1fr_1fr]">
          <div>
            <Reveal>
              <div className="flex items-center gap-2">
                <span className="h-px w-6 bg-leaf-500" />
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-tulus-600">
                  Kontak
                </span>
              </div>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="mt-5 font-display text-4xl font-medium leading-[1.1] text-ink sm:text-5xl">
                Mari berkenalan
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-muted">
                Saya {profile.name}, {profile.role}. Project ini bagian dari
                portfolio saya. Target karier saya adalah berkontribusi di
                industri pertambangan — membangun perangkat digital yang
                merapikan data operasional lapangan. Jika Anda dari tim
                rekrutmen tambang dan tertarik berdiskusi, saya senang
                dihubungi.
              </p>
            </Reveal>
            <Reveal delay={0.12}>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-leaf-50 px-4 py-2 text-sm font-medium text-leaf-700 ring-1 ring-leaf-600/20">
                <span className="h-1.5 w-1.5 rounded-full bg-leaf-500" />
                Terbuka untuk peran di sektor pertambangan
              </div>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={`mailto:${profile.email}`}
                  className="inline-flex items-center gap-2 rounded-full bg-tulus-700 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-tulus-800"
                >
                  Kirim Email <FiArrowUpRight size={16} />
                </a>
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-6 py-3 text-sm font-medium text-ink transition-colors hover:border-tulus-300 hover:text-tulus-700"
                >
                  <FiGithub size={16} /> Lihat GitHub
                </a>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            <div className="rounded-3xl border border-slate-200 bg-slate-50/60 p-7 sm:p-9">
              <ul className="divide-y divide-slate-200">
                {links.map((l) => (
                  <li
                    key={l.label}
                    className="flex items-center gap-4 py-5 first:pt-0 last:pb-0"
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-tulus-700 ring-1 ring-slate-200">
                      <l.icon size={18} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-wide text-ink-muted">
                        {l.label}
                      </p>
                      {l.href ? (
                        <a
                          href={l.href}
                          target={
                            l.href.startsWith("http") ? "_blank" : undefined
                          }
                          rel={
                            l.href.startsWith("http") ? "noreferrer" : undefined
                          }
                          className="break-all font-medium text-ink transition-colors hover:text-tulus-700"
                        >
                          {l.value}
                        </a>
                      ) : (
                        <p className="font-medium text-ink">{l.value}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-7 rounded-2xl bg-tulus-900 p-6 text-center">
                <p className="font-display text-lg text-white">
                  Penasaran dengan hasilnya?
                </p>
                <p className="mt-1.5 text-sm text-tulus-100">
                  Jelajahi data lengkap atau baca latar belakang teknisnya.
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <Link
                    to="/showcase"
                    className="rounded-full bg-white px-4 py-2 text-sm font-medium text-tulus-900 transition-colors hover:bg-tulus-50"
                  >
                    Showcase Data
                  </Link>
                  <Link
                    to="/case-study"
                    className="rounded-full border border-white/30 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
                  >
                    Studi Kasus
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
