import { useMemo, useState } from "react";
import {
  FiGrid,
  FiMaximize,
  FiActivity,
  FiAlertTriangle,
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
} from "react-icons/fi";
import { PageTransition } from "../components/ui/PageTransition";
import { PageHeader } from "../components/ui/PageHeader";
import { StatisticCard } from "../components/cards/StatisticCard";
import { ActivityCard } from "../components/cards/ActivityCard";
import { Card } from "../components/ui/Card";
import { PeriodFilter } from "../components/ui/PeriodFilter";
import type { Period } from "../components/ui/PeriodFilter";
import {
  fields,
  activities,
  getRevenuesByField,
  getExpensesByField,
  getLatestSeason,
  getSeasonByFieldYear,
  seasonsByYear,
  totalRevenueBySeason,
  totalExpensesBySeason,
  getAvailableYears,
  getLatestYear,
  useDataVersion,
} from "../data";
import { formatNumber, formatCompactCurrency } from "../utils/format";
import { fieldStatusMeta } from "../client/constants/fieldMeta";
import { harvestInfo } from "../utils/harvest";

export default function Overview() {
  // Reaktif terhadap store agar ringkasan selalu mengikuti input terbaru.
  useDataVersion();
  const years = getAvailableYears();
  const [period, setPeriod] = useState<Period>(() => getLatestYear());
  const isAll = period === "all";

  const rows = useMemo(() => {
    return fields.map((f) => {
      const season = isAll
        ? getLatestSeason(f.id)
        : getSeasonByFieldYear(f.id, period as number);
      let revenue: number;
      let expense: number;
      if (isAll) {
        revenue = getRevenuesByField(f.id).reduce((s, r) => s + r.amount, 0);
        expense = getExpensesByField(f.id).reduce((s, e) => s + e.amount, 0);
      } else {
        revenue = season ? totalRevenueBySeason(season.id) : 0;
        expense = season ? totalExpensesBySeason(season.id) : 0;
      }
      const info = season
        ? harvestInfo({
            status: season.status,
            harvestDate: season.harvestDate,
          })
        : null;
      return {
        field: f,
        season,
        info,
        revenue,
        expense,
        profit: revenue - expense,
      };
    });
  }, [period, isAll]);

  const totalAreaM2 = fields.reduce((s, f) => s + f.areaM2, 0);
  const activeCount = rows.filter((r) => r.season?.status === "active").length;
  const overdueCount = rows.filter((r) => r.info?.state === "overdue").length;

  const totals = rows.reduce(
    (acc, r) => {
      acc.revenue += r.revenue;
      acc.expense += r.expense;
      acc.profit += r.profit;
      return acc;
    },
    { revenue: 0, expense: 0, profit: 0 },
  );

  const recent = useMemo(() => {
    let list = activities;
    if (!isAll) {
      const ids = new Set(seasonsByYear(period as number).map((s) => s.id));
      list = activities.filter((a) => ids.has(a.seasonId));
    }
    return [...list]
      .sort((a, b) => +new Date(b.date) - +new Date(a.date))
      .slice(0, 5);
  }, [period, isAll]);

  const periodLabel = isAll ? "seluruh waktu" : `musim ${period}`;

  return (
    <PageTransition>
      <PageHeader
        title="Overview"
        description={`Inti dari seluruh data yang diinput: ringkasan operasional, finansial, dan status panen tiap lahan · ${periodLabel}.`}
        actions={
          <PeriodFilter value={period} onChange={setPeriod} years={years} />
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatisticCard
          label="Total Lahan"
          value={`${fields.length}`}
          icon={FiGrid}
        />
        <StatisticCard
          label="Total Luas"
          value={`${formatNumber(totalAreaM2)} m²`}
          icon={FiMaximize}
          accentClass="bg-blue-50 text-blue-600"
        />
        <StatisticCard
          label={isAll ? "Lahan Aktif (kini)" : "Lahan Aktif"}
          value={`${activeCount}`}
          icon={FiActivity}
          accentClass="bg-amber-50 text-amber-600"
        />
        <StatisticCard
          label="Panen Overdue"
          value={`${overdueCount}`}
          icon={FiAlertTriangle}
          accentClass={
            overdueCount > 0
              ? "bg-red-50 text-red-600"
              : "bg-emerald-50 text-emerald-600"
          }
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <StatisticCard
          label="Total Pendapatan"
          value={formatCompactCurrency(totals.revenue)}
          icon={FiTrendingUp}
          accentClass="bg-emerald-50 text-emerald-600"
        />
        <StatisticCard
          label="Total Biaya"
          value={formatCompactCurrency(totals.expense)}
          icon={FiTrendingDown}
          accentClass="bg-red-50 text-red-600"
        />
        <StatisticCard
          label="Laba Kotor"
          value={formatCompactCurrency(totals.profit)}
          icon={FiDollarSign}
          accentClass="bg-blue-50 text-blue-600"
        />
      </div>

      <h2 className="mb-4 mt-10 font-display text-xl font-medium text-ink">
        Ringkasan per Lahan
      </h2>
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Lahan</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Panen</th>
              <th className="px-4 py-3 text-right">Luas (m²)</th>
              <th className="px-4 py-3 text-right">Pendapatan</th>
              <th className="px-4 py-3 text-right">Biaya</th>
              <th className="px-4 py-3 text-right">Laba</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map(({ field, season, info, revenue, expense, profit }) => {
              const meta = fieldStatusMeta[season?.status ?? "fallow"];
              return (
                <tr key={field.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {field.name}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${meta.className}`}
                    >
                      {meta.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {info && info.state === "overdue" ? (
                      <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
                        Overdue · {info.detail}
                      </span>
                    ) : (
                      <span className="text-xs text-ink-muted">
                        {info ? info.label : "—"}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600">
                    {formatNumber(field.areaM2)}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600">
                    {formatCompactCurrency(revenue)}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600">
                    {formatCompactCurrency(expense)}
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-medium ${
                      profit >= 0 ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {formatCompactCurrency(profit)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="border-t-2 border-slate-200 bg-slate-50 font-semibold text-slate-800">
            <tr>
              <td className="px-4 py-3" colSpan={3}>
                Total Semua Lahan
              </td>
              <td className="px-4 py-3 text-right">
                {formatNumber(totalAreaM2)}
              </td>
              <td className="px-4 py-3 text-right">
                {formatCompactCurrency(totals.revenue)}
              </td>
              <td className="px-4 py-3 text-right">
                {formatCompactCurrency(totals.expense)}
              </td>
              <td
                className={`px-4 py-3 text-right ${
                  totals.profit >= 0 ? "text-emerald-700" : "text-red-700"
                }`}
              >
                {formatCompactCurrency(totals.profit)}
              </td>
            </tr>
          </tfoot>
        </table>
      </Card>

      <h2 className="mb-4 mt-10 font-display text-xl font-medium text-ink">
        Aktivitas Terbaru
      </h2>
      <div className="space-y-3">
        {recent.map((a) => (
          <ActivityCard key={a.id} activity={a} />
        ))}
        {recent.length === 0 ? (
          <p className="text-sm text-slate-400">
            Belum ada aktivitas pada periode ini.
          </p>
        ) : null}
      </div>
    </PageTransition>
  );
}
