import { useMemo, useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { PageTransition } from "../components/ui/PageTransition";
import { PageHeader } from "../components/ui/PageHeader";
import { Card } from "../components/ui/Card";
import { PeriodFilter } from "../components/ui/PeriodFilter";
import type { Period } from "../components/ui/PeriodFilter";
import {
  fields,
  getReportBySeason,
  totalRevenueBySeason,
  totalExpensesBySeason,
  getRevenuesByField,
  getExpensesByField,
  getSeasonsByField,
  getSeasonByFieldYear,
  getAvailableYears,
  getLatestYear,
  haFromM2,
  useDataVersion,
} from "../data";
import { formatCompactCurrency } from "../utils/format";
import type { Season } from "../types";

interface SeasonBreakdown {
  season: Season;
  target?: number;
  revenue: number;
  expense: number;
  profit: number;
}

interface Row {
  fieldId: string;
  fieldName: string;
  areaM2: number;
  crop: string;
  progress?: number;
  target?: number;
  revenue: number;
  expense: number;
  profit: number;
  breakdown?: SeasonBreakdown[];
}

export default function FieldComparison() {
  useDataVersion();
  const years = getAvailableYears();
  const [period, setPeriod] = useState<Period>(() => getLatestYear());
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const rows = useMemo<Row[]>(() => {
    if (period === "all") {
      return fields.map((f) => {
        const fseasons = getSeasonsByField(f.id);
        const revenue = getRevenuesByField(f.id).reduce(
          (s, r) => s + r.amount,
          0,
        );
        const expense = getExpensesByField(f.id).reduce(
          (s, e) => s + e.amount,
          0,
        );
        const breakdown: SeasonBreakdown[] = fseasons.map((s) => {
          const rev = totalRevenueBySeason(s.id);
          const exp = totalExpensesBySeason(s.id);
          return {
            season: s,
            target: getReportBySeason(s.id)?.targetTon,
            revenue: rev,
            expense: exp,
            profit: rev - exp,
          };
        });
        return {
          fieldId: f.id,
          fieldName: f.name,
          areaM2: f.areaM2,
          crop: fseasons[0]?.crop ?? "-",
          revenue,
          expense,
          profit: revenue - expense,
          breakdown,
        };
      });
    }
    return fields
      .map((f): Row | null => {
        const s = getSeasonByFieldYear(f.id, period);
        if (!s) return null;
        const revenue = totalRevenueBySeason(s.id);
        const expense = totalExpensesBySeason(s.id);
        return {
          fieldId: f.id,
          fieldName: f.name,
          areaM2: f.areaM2,
          crop: s.crop,
          progress: s.progress,
          target: getReportBySeason(s.id)?.targetTon,
          revenue,
          expense,
          profit: revenue - expense,
        };
      })
      .filter((r): r is Row => r !== null);
  }, [period]);

  const totals = rows.reduce(
    (acc, r) => {
      acc.area += haFromM2(r.areaM2);
      acc.target += r.target ?? 0;
      acc.revenue += r.revenue;
      acc.expense += r.expense;
      acc.profit += r.profit;
      return acc;
    },
    { area: 0, target: 0, revenue: 0, expense: 0, profit: 0 },
  );

  const isAll = period === "all";
  const toggle = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <PageTransition>
      <PageHeader
        title="Field Comparison"
        description="Perbandingan kinerja antar lahan per musim atau seluruh waktu."
        actions={
          <PeriodFilter value={period} onChange={setPeriod} years={years} />
        }
      />
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Lahan</th>
              <th className="px-4 py-3">Komoditas</th>
              <th className="px-4 py-3 text-right">Luas (ha)</th>
              <th className="px-4 py-3 text-right">Progress</th>
              <th className="px-4 py-3 text-right">Target (ton)</th>
              <th className="px-4 py-3 text-right">Pendapatan</th>
              <th className="px-4 py-3 text-right">Biaya</th>
              <th className="px-4 py-3 text-right">Laba</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => {
              const open = isAll && expanded[r.fieldId];
              return (
                <FragmentRow
                  key={r.fieldId}
                  row={r}
                  isAll={isAll}
                  open={Boolean(open)}
                  onToggle={() => toggle(r.fieldId)}
                />
              );
            })}
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-10 text-center text-sm text-slate-400"
                >
                  Belum ada musim pada periode ini.
                </td>
              </tr>
            ) : null}
          </tbody>
          <tfoot className="border-t-2 border-slate-200 bg-slate-50 font-semibold text-slate-800">
            <tr>
              <td className="px-4 py-3" colSpan={2}>
                Total Semua Lahan
              </td>
              <td className="px-4 py-3 text-right">{totals.area.toFixed(1)}</td>
              <td className="px-4 py-3 text-right">—</td>
              <td className="px-4 py-3 text-right">
                {totals.target ? totals.target.toFixed(1) : "—"}
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
      {isAll ? (
        <p className="mt-3 text-xs text-slate-400">
          Mode All-time: klik nama lahan untuk melihat rincian laba per musim.
        </p>
      ) : null}
    </PageTransition>
  );
}

function FragmentRow({
  row,
  isAll,
  open,
  onToggle,
}: {
  row: Row;
  isAll: boolean;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr className="hover:bg-slate-50">
        <td className="px-4 py-3 font-medium text-slate-800">
          {isAll && row.breakdown && row.breakdown.length ? (
            <button
              onClick={onToggle}
              className="inline-flex items-center gap-1.5 text-left hover:text-tulus-700"
            >
              <FiChevronDown
                size={14}
                className={`shrink-0 text-slate-400 transition-transform ${
                  open ? "rotate-180" : ""
                }`}
              />
              {row.fieldName}
            </button>
          ) : (
            row.fieldName
          )}
        </td>
        <td className="px-4 py-3 text-slate-600">{row.crop}</td>
        <td className="px-4 py-3 text-right text-slate-600">
          {haFromM2(row.areaM2).toFixed(1)}
        </td>
        <td className="px-4 py-3 text-right text-slate-600">
          {row.progress === undefined ? "—" : `${row.progress}%`}
        </td>
        <td className="px-4 py-3 text-right text-slate-600">
          {row.target ?? "—"}
        </td>
        <td className="px-4 py-3 text-right text-slate-600">
          {formatCompactCurrency(row.revenue)}
        </td>
        <td className="px-4 py-3 text-right text-slate-600">
          {formatCompactCurrency(row.expense)}
        </td>
        <td
          className={`px-4 py-3 text-right font-medium ${
            row.profit >= 0 ? "text-emerald-600" : "text-red-600"
          }`}
        >
          {formatCompactCurrency(row.profit)}
        </td>
      </tr>
      {open && row.breakdown
        ? row.breakdown.map((b) => (
            <tr key={b.season.id} className="bg-slate-50/60 text-xs">
              <td className="py-2 pl-10 pr-4 text-slate-500">
                {b.season.year} · {b.season.label}
              </td>
              <td className="px-4 py-2 text-slate-500">{b.season.crop}</td>
              <td className="px-4 py-2 text-right text-slate-400">—</td>
              <td className="px-4 py-2 text-right text-slate-500">
                {b.season.progress}%
              </td>
              <td className="px-4 py-2 text-right text-slate-500">
                {b.target ?? "—"}
              </td>
              <td className="px-4 py-2 text-right text-slate-500">
                {formatCompactCurrency(b.revenue)}
              </td>
              <td className="px-4 py-2 text-right text-slate-500">
                {formatCompactCurrency(b.expense)}
              </td>
              <td
                className={`px-4 py-2 text-right font-medium ${
                  b.profit >= 0 ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {formatCompactCurrency(b.profit)}
              </td>
            </tr>
          ))
        : null}
    </>
  );
}
