import { useState } from "react";
import { Container } from "../components/Container";
import { Reveal } from "../components/Reveal";
import { SectionTitle } from "../components/SectionTitle";
import { FieldShowcaseCard } from "../components/FieldShowcaseCard";
import { FieldDetailModal } from "../components/FieldDetailModal";
import {
  KpiCards,
  CostDonutChart,
  PnLChart,
  HarvestDeviationChart,
  AllTimeTrendChart,
} from "../components/Charts";
import { useSeason } from "../../context/SeasonContext";
import { useDataVersion, fieldsByYear, getSeasonByFieldYear } from "../../data";
import {
  kpiSummary,
  costComposition,
  pnlByField,
  harvestDeviationByField,
  allTimeSummary,
  allTimeTrend,
} from "../utils/analytics";
import { formatCompactCurrency, formatNumber } from "../../utils/format";
import type { Field, Season } from "../../types";

export default function Showcase() {
  useDataVersion();
  const { year } = useSeason();
  const [selected, setSelected] = useState<{
    field: Field;
    season: Season;
  } | null>(null);

  const pairs = fieldsByYear(year)
    .map((field) => ({ field, season: getSeasonByFieldYear(field.id, year) }))
    .filter(
      (x): x is { field: Field; season: Season } => x.season !== undefined,
    );

  const kpis = kpiSummary(year);
  const cost = costComposition(year);
  const pnl = pnlByField(year);
  const deviation = harvestDeviationByField(year);
  const allTime = allTimeSummary();
  const allTimeTrendData = allTimeTrend();

  return (
    <>
      {/* Header + KPI hero */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-tulus-50/70 to-white dark:border-white/10 dark:from-[#202020] dark:to-[#191919]">
        <Container className="py-16 lg:py-20">
          <Reveal>
            <SectionTitle
              eyebrow="Showcase Data"
              title="Dashboard kinerja lapangan"
              description="Beberapa indikator utama mengikuti musim yang dipilih dan dibandingkan dengan tahun sebelumnya. Data yang ditampilkan dapat menjadi insight untuk pengambilan keputusan kedepannya."
            />
          </Reveal>
          <div className="mt-10 border-t border-slate-200 pt-8 dark:border-white/10">
            <Reveal>
              <KpiCards items={kpis} />
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Portofolio lahan */}
      <section className="bg-white py-20 dark:bg-[#191919]">
        <Container>
          <Reveal>
            <SectionTitle
              eyebrow="Portofolio lahan"
              title={`Lahan aktif musim ${year}`}
              description="Klik kartu lahan untuk membuka detail lengkap dalam tampilan modal."
            />
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pairs.map((p, i) => (
              <Reveal key={p.field.id} delay={(i % 3) * 0.07}>
                <FieldShowcaseCard
                  field={p.field}
                  season={p.season}
                  onSelect={() => setSelected(p)}
                />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Komposisi biaya */}
      <section className="border-t border-slate-200 bg-slate-50/60 py-20 dark:border-white/10 dark:bg-[#1c1c1c]">
        <Container>
          <Reveal>
            <SectionTitle
              eyebrow="Struktur biaya"
              title="Ke mana biaya mengalir"
              description="Komposisi pengeluaran per kategori pada musim terpilih, dihitung langsung dari rincian biaya nyata tiap lahan."
            />
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-[#202020] sm:p-8">
              <h3 className="font-display text-lg font-medium text-ink dark:text-white">
                Komposisi Biaya
              </h3>
              <p className="mt-1 text-sm text-ink-muted dark:text-white/60">
                Total musim {year}: {formatCompactCurrency(cost.yearTotal)}
              </p>
              <div className="mt-4">
                <CostDonutChart data={cost.data} year={year} />
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Profitabilitas / P&L */}
      <section className="bg-white py-20 dark:bg-[#191919]">
        <Container>
          <Reveal>
            <SectionTitle
              eyebrow="Profitabilitas"
              title="Pendapatan, biaya, dan margin per lahan"
              description="Bar menunjukkan pendapatan vs biaya tiap lahan; garis menunjukkan margin sebagai acuan."
            />
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-[#202020] sm:p-8">
              <PnLChart rows={pnl.rows} allTimeMargin={pnl.allTimeMargin} />
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Durasi tanam–panen (deviasi hari) */}
      <section className="border-t border-slate-200 bg-slate-50/60 py-20 dark:border-white/10 dark:bg-[#1c1c1c]">
        <Container>
          <Reveal>
            <SectionTitle
              eyebrow="Durasi tanam–panen"
              title={`Durasi tanam–panen per lahan (${year})`}
              description="Membandingkan tanggal panen aktual vs target tiap lahan: bar ke kiri berarti panen lebih cepat, ke kanan berarti telat/overdue, netral berarti tepat waktu."
            />
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-[#202020] sm:p-8">
              <HarvestDeviationChart data={deviation} />
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Pendapatan, biaya, margin & ROI all-time (ditempatkan di akhir) */}
      <section className="border-t border-slate-200 bg-white py-20 dark:border-white/10 dark:bg-[#191919]">
        <Container>
          <Reveal>
            <SectionTitle
              eyebrow="All-time"
              title="Pendapatan, biaya, margin, dan ROI all-time"
              description="Akumulasi seluruh musim yang tercatat mulai tahun 2023, termasuk musim yang masih berjalan/belum panen — biaya investasinya sudah masuk meski pendapatannya belum. ROI = laba bersih dibagi total modal, lebih tepat untuk mengukur akumulasi lintas tahun (yield lebih cocok untuk satu musim/tahun)."
            />
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-[#202020]">
                <p className="text-sm font-medium text-ink-muted dark:text-white/60">
                  Total Pendapatan
                </p>
                <p className="mt-1 font-display text-2xl font-medium text-ink dark:text-white">
                  {formatCompactCurrency(allTime.revenue)}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-[#202020]">
                <p className="text-sm font-medium text-ink-muted dark:text-white/60">
                  Total Modal
                </p>
                <p className="mt-1 font-display text-2xl font-medium text-ink dark:text-white">
                  {formatCompactCurrency(allTime.expenses)}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-[#202020]">
                <p className="text-sm font-medium text-ink-muted dark:text-white/60">
                  Laba Bersih
                </p>
                <p className="mt-1 font-display text-2xl font-medium text-ink dark:text-white">
                  {`Rp ${formatNumber(allTime.profit)}`}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-[#202020]">
                <p className="text-sm font-medium text-ink-muted dark:text-white/60">
                  Margin Bersih
                </p>
                <p className="mt-1 font-display text-2xl font-medium text-ink dark:text-white">
                  {allTime.margin}%
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-[#202020]">
                <p className="text-sm font-medium text-ink-muted dark:text-white/60">
                  ROI All-time
                </p>
                <p className="mt-1 font-display text-2xl font-medium text-ink dark:text-white">
                  {allTime.roiPct}%
                </p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-[#202020] sm:p-8">
              <h3 className="font-display text-lg font-medium text-ink dark:text-white">
                Tren laba, pengeluaran, margin &amp; ROI per tahun
              </h3>
              <p className="mt-1 text-sm text-ink-muted dark:text-white/60">
                Garis pendapatan, pengeluaran, dan laba bersih (skala kiri, Rp)
                berpadu dengan margin bersih dan ROI (skala kanan, %) yang
                saling bersinggungan sepanjang 2023&ndash;2026.
              </p>
              <div className="mt-4">
                <AllTimeTrendChart data={allTimeTrendData} />
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
