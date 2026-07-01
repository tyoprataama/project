import { useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiMap, FiActivity, FiPieChart } from "react-icons/fi";
import { Container } from "../components/Container";
import { Reveal } from "../components/Reveal";
import { SectionTitle } from "../components/SectionTitle";
import { Stat } from "../components/Stat";
import { FieldShowcaseCard } from "../components/FieldShowcaseCard";
import { FieldDetailModal } from "../components/FieldDetailModal";
import { profile } from "../constants/clientNav";
import { useSeason } from "../../context/SeasonContext";
import type { Field, Season } from "../../types";
import {
  activities,
  gallery,
  fieldsByYear,
  seasonsByYear,
  getSeasonByFieldYear,
  totalRevenueByYear,
  totalExpensesByYear,
  haFromM2,
} from "../../data";
import { formatCompactCurrency } from "../../utils/format";

const capabilities = [
  {
    no: "01",
    icon: FiMap,
    title: "Pemetaan & Status Aset",
    text: "Setiap lahan terdokumentasi lengkap: lokasi, komoditas, luas, dan status operasional secara real-time — pendekatan yang sama dipakai untuk memantau status blok/site tambang.",
  },
  {
    no: "02",
    icon: FiActivity,
    title: "Monitoring Operasional",
    text: "Perkembangan, skor kondisi, dan risiko dipantau berkala. Logika monitoring ini mudah dialihkan ke pemantauan produksi dan kepatuhan (HSE) di pertambangan.",
  },
  {
    no: "03",
    icon: FiPieChart,
    title: "Analisis Ekonomi & Biaya",
    text: "Biaya operasional dan pendapatan dirangkum menjadi margin yang jelas — kerangka cost control yang relevan untuk efisiensi operasi tambang.",
  },
];

export default function ClientHome() {
  const { year } = useSeason();
  const [selected, setSelected] = useState<{
    field: Field;
    season: Season;
  } | null>(null);

  const yearFields = fieldsByYear(year);
  const seasonIds = new Set(seasonsByYear(year).map((s) => s.id));
  const yearActivities = activities.filter((a) => seasonIds.has(a.seasonId));
  const yearGallery = gallery.filter((g) => seasonIds.has(g.seasonId));

  const paired = yearFields
    .map((field) => ({
      field,
      season: getSeasonByFieldYear(field.id, year),
    }))
    .filter(
      (x): x is { field: Field; season: Season } => x.season !== undefined,
    );

  const activeFields = paired.filter(
    (p) => p.season.status === "active",
  ).length;
  const totalArea = yearFields.reduce((s, f) => s + haFromM2(f.areaM2), 0);
  const revenue = totalRevenueByYear(year);
  const expense = totalExpensesByYear(year);
  const net = revenue - expense;

  const featured = [...paired]
    .sort((a, b) => b.season.progress - a.season.progress)
    .slice(0, 3);

  const metrics = [
    {
      v: `${yearFields.length}`,
      l: "Lahan dikelola",
      s: `musim ${year}`,
    },
    {
      v: `${totalArea.toFixed(1)} ha`,
      l: "Total luas lahan",
      s: "tersebar di Kediri",
    },
    {
      v: formatCompactCurrency(revenue),
      l: "Pendapatan tercatat",
      s: `musim ${year}`,
    },
    {
      v: `${yearActivities.length}`,
      l: "Aktivitas lapangan",
      s: "terdokumentasi",
    },
  ];

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-tulus-50/70 via-white to-white">
        <Container className="grid items-center gap-12 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-28">
          <div>
            <Reveal>
              <div className="flex items-center gap-2">
                <span className="h-px w-6 bg-leaf-500" />
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-tulus-600">
                  Portfolio · Manajemen Aset & Operasi
                </span>
              </div>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="mt-5 font-display text-4xl font-medium leading-[1.08] text-ink sm:text-5xl lg:text-6xl">
                Mengelola aset lapangan dengan data yang{" "}
                <span className="text-tulus-700">jelas & terukur</span>.
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-muted">
                Field Management System merangkum operasi lapangan — dari
                aktivitas harian hingga hasil & biaya — menjadi informasi yang
                mudah dibaca. Studi kasus ini menggunakan komoditas tebu, namun
                kerangka kerjanya (manajemen aset, monitoring, cost control,
                catatan keputusan) dirancang agar mudah diimplementasikan ke{" "}
                <span className="font-medium text-ink">
                  sektor industri
                </span>.
                {/* . Dibuat oleh {profile.name}. */}
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  to="/showcase"
                  className="inline-flex items-center gap-2 rounded-full bg-tulus-700 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-tulus-800"
                >
                  Lihat Showcase Data <FiArrowRight size={16} />
                </Link>
                <Link
                  to="/case-study"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-6 py-3 text-sm font-medium text-ink transition-colors hover:border-tulus-300 hover:text-tulus-700"
                >
                  Baca Studi Kasus
                </Link>
              </div>
            </Reveal>
          </div>

          {/* Snapshot panel */}
          <Reveal delay={0.2}>
            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_30px_70px_-40px_rgba(16,35,66,0.55)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink-muted">
                    Ringkasan Operasi
                  </p>
                  <p className="mt-1 font-display text-lg text-ink">
                    Musim Tanam {year}
                  </p>
                </div>
                <span className="rounded-full bg-tulus-50 px-3 py-1 text-xs font-medium text-tulus-700">
                  {year}
                </span>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-5">
                <Stat
                  value={yearFields.length}
                  label="Total Lahan"
                  sub={`${activeFields} aktif`}
                />
                <Stat
                  value={`${totalArea.toFixed(1)} ha`}
                  label="Luas Dikelola"
                  sub={`${yearFields.length} lokasi`}
                />
                <Stat
                  value={formatCompactCurrency(revenue)}
                  label="Total Pendapatan"
                  sub={`musim ${year}`}
                />
                <Stat
                  value={formatCompactCurrency(net)}
                  label="Margin Bersih"
                  sub="pendapatan − biaya"
                />
              </div>

              <div className="mt-6 border-t border-slate-100 pt-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink-muted">Aktivitas tercatat</span>
                  <span className="font-semibold text-ink">
                    {yearActivities.length} kegiatan
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-ink-muted">Dokumentasi visual</span>
                  <span className="font-semibold text-ink">
                    {yearGallery.length} foto
                  </span>
                </div>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* METRICS STRIP */}
      <section className="border-b border-slate-200 bg-white">
        <Container className="grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((m, i) => (
            <Reveal key={m.l} delay={i * 0.05}>
              <Stat value={m.v} label={m.l} sub={m.s} />
            </Reveal>
          ))}
        </Container>
      </section>

      {/* CAPABILITIES */}
      <section className="bg-white py-20 lg:py-28">
        <Container>
          <Reveal>
            <SectionTitle
              eyebrow="Apa yang ditampilkan"
              title="Tiga lapisan informasi untuk keputusan yang lebih baik"
              description="Data mentah dari lapangan diolah menjadi tampilan ringkas — kerangka yang sama dapat dipakai untuk memantau aset, produksi, dan biaya di sektor pertambangan."
            />
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {capabilities.map((c, i) => (
              <Reveal key={c.no} delay={i * 0.08}>
                <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-7 transition-colors hover:border-tulus-200">
                  <div className="flex items-center justify-between">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-tulus-50 text-tulus-700">
                      <c.icon size={20} />
                    </span>
                    <span className="font-display text-2xl text-slate-200">
                      {c.no}
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-xl font-medium text-ink">
                    {c.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                    {c.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* FEATURED FIELDS */}
      <section className="border-t border-slate-200 bg-slate-50/60 py-20 lg:py-28">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <Reveal>
              <SectionTitle
                eyebrow="Lahan unggulan"
                title="Sorotan lahan musim ini"
              />
            </Reveal>
            <Reveal>
              <Link
                to="/showcase"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-tulus-700 hover:text-tulus-800"
              >
                Lihat semua lahan <FiArrowRight size={15} />
              </Link>
            </Reveal>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((f, i) => (
              <Reveal key={f.field.id} delay={i * 0.08}>
                <FieldShowcaseCard
                  field={f.field}
                  season={f.season}
                  onSelect={() => setSelected(f)}
                />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="bg-white py-20 lg:py-28">
        <Container>
          <Reveal>
            <div className="overflow-hidden rounded-3xl bg-tulus-900 px-8 py-14 text-center sm:px-16">
              <h2 className="mx-auto max-w-2xl font-display text-3xl font-medium leading-tight text-white sm:text-4xl">
                Ingin melihat bagaimana data ini dirangkum?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-tulus-100">
                Jelajahi showcase data lengkap dengan ringkasan ekonomi,
                monitoring tanaman, dan dokumentasi — atau baca latar belakang
                teknis dan relevansi pertambangan di studi kasus.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  to="/showcase"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-tulus-900 transition-colors hover:bg-tulus-50"
                >
                  Lihat Showcase Data <FiArrowRight size={16} />
                </Link>
                <Link
                  to="/case-study"
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
                >
                  Baca Studi Kasus
                </Link>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      <FieldDetailModal
        open={selected !== null}
        field={selected?.field ?? null}
        season={selected?.season ?? null}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
