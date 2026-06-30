import {
  fields,
  reports,
  expenses,
  seasonsByYear,
  fieldsByYear,
  getSeasonByFieldYear,
  getReportBySeason,
  totalRevenueBySeason,
  totalExpensesBySeason,
  totalRevenueByYear,
  totalExpensesByYear,
  haFromM2,
  getAvailableYears,
  totalRevenue,
  totalExpenses,
} from "../../data";
import { deviationInfo } from "../../utils/harvest";

// Label kategori biaya dalam Bahasa Indonesia (dipakai di diagram Struktur Biaya).
const CATEGORY_LABEL_ID: Record<string, string> = {
  seeds: "Benih",
  fertilizer: "Pupuk",
  labor: "Tenaga Kerja",
  equipment: "Peralatan",
  irrigation: "Irigasi",
  pesticide: "Pestisida",
  logistics: "Logistik",
  rent: "Sewa",
  tax: "Pajak",
  other: "Lain-lain",
};

// Pembulatan ringkas.
const round = (n: number, d = 0) => {
  const p = Math.pow(10, d);
  return Math.round(n * p) / p;
};

// =====================================================
// Agregat per tahun (dasar perhitungan KPI)
// =====================================================
const yieldTonByYear = (year: number): number => {
  const ids = new Set(seasonsByYear(year).map((s) => s.id));
  return reports
    .filter((r) => ids.has(r.seasonId))
    .reduce((s, r) => s + r.yieldTon, 0);
};

const reportedM2ByYear = (year: number): number => {
  const ids = new Set(seasonsByYear(year).map((s) => s.id));
  const fids = new Set(
    reports.filter((r) => ids.has(r.seasonId)).map((r) => r.fieldId),
  );
  return Array.from(fids).reduce(
    (s, fid) => s + (fields.find((f) => f.id === fid)?.areaM2 ?? 0),
    0,
  );
};

// Produktivitas dalam kg/m² (1 ton = 1000 kg).
const yieldPerM2ByYear = (year: number): number => {
  const m2 = reportedM2ByYear(year);
  return m2 > 0 ? (yieldTonByYear(year) * 1000) / m2 : 0;
};

const marginByYear = (year: number): number => {
  const rev = totalRevenueByYear(year);
  const exp = totalExpensesByYear(year);
  return rev > 0 ? ((rev - exp) / rev) * 100 : 0;
};

// =====================================================
// KPI hero cards (nilai tahun terpilih + benchmark all-time + sparkline)
// =====================================================
export type KpiFormat = "rp" | "num" | "pct";

export type KpiItem = {
  key: string;
  label: string;
  unit?: string;
  format: KpiFormat;
  current: number;
  benchmark: number;
  benchmarkLabel: string;
  series: number[];
};

export function kpiSummary(year: number): KpiItem[] {
  const years = getAvailableYears()
    .slice()
    .sort((a, b) => a - b);
  const prev = year - 1;
  // Total luas lahan dikelola (m²) pada tahun tertentu.
  const totalAreaM2 = (y: number) =>
    fieldsByYear(y).reduce((s, f) => s + f.areaM2, 0);
  // Margin bersih dalam Rupiah (pendapatan - pengeluaran) pada tahun tertentu.
  const marginRp = (y: number) =>
    totalRevenueByYear(y) - totalExpensesByYear(y);

  return [
    {
      key: "revenue",
      label: "Total Pendapatan",
      format: "rp",
      current: totalRevenueByYear(year),
      benchmark: totalRevenueByYear(prev),
      benchmarkLabel: "tahun sebelumnya",
      series: years.map((y) => totalRevenueByYear(y)),
    },
    {
      key: "expenses",
      label: "Pengeluaran",
      format: "rp",
      current: totalExpensesByYear(year),
      benchmark: totalExpensesByYear(prev),
      benchmarkLabel: "tahun sebelumnya",
      series: years.map((y) => totalExpensesByYear(y)),
    },
    {
      key: "margin",
      label: "Margin Bersih",
      unit: "%",
      format: "pct",
      current: round(marginByYear(year)),
      benchmark: round(marginByYear(prev)),
      benchmarkLabel: "tahun sebelumnya",
      series: years.map((y) => round(marginByYear(y))),
    },
    {
      key: "marginRp",
      label: "Margin Bersih (Rp)",
      format: "rp",
      current: marginRp(year),
      benchmark: marginRp(prev),
      benchmarkLabel: "tahun sebelumnya",
      series: years.map((y) => marginRp(y)),
    },
    {
      key: "marginRpMonthly",
      label: "Laba Bersih / Bulan",
      format: "rp",
      current: round(marginRp(year) / 12),
      benchmark: round(marginRp(prev) / 12),
      benchmarkLabel: "tahun sebelumnya",
      series: years.map((y) => round(marginRp(y) / 12)),
    },
    {
      key: "fields",
      label: "Total Luas Lahan Dikelola",
      unit: "m²",
      format: "num",
      current: totalAreaM2(year),
      benchmark: totalAreaM2(prev),
      benchmarkLabel: "tahun sebelumnya",
      series: years.map((y) => totalAreaM2(y)),
    },
  ];
}

// Akumulasi seluruh waktu (semua musim tercatat, termasuk yang belum panen).
export type AllTimeSummary = {
  revenue: number;
  expenses: number;
  profit: number;
  margin: number;
};

export function allTimeSummary(): AllTimeSummary {
  const revenue = totalRevenue();
  const expenses = totalExpenses();
  const profit = revenue - expenses;
  return {
    revenue,
    expenses,
    profit,
    margin: revenue > 0 ? round((profit / revenue) * 100) : 0,
  };
}

// Tren per tahun untuk grafik garis all-time: pendapatan, pengeluaran, laba
// bersih (Rp) + margin (%) yang saling bersinggungan sepanjang waktu.
export type AllTimeTrendRow = {
  year: number;
  revenue: number;
  expenses: number;
  profit: number;
  margin: number;
};

export function allTimeTrend(): AllTimeTrendRow[] {
  const years = getAvailableYears()
    .slice()
    .sort((a, b) => a - b);
  return years.map((y) => {
    const revenue = totalRevenueByYear(y);
    const expenses = totalExpensesByYear(y);
    const profit = revenue - expenses;
    return {
      year: y,
      revenue,
      expenses,
      profit,
      margin: revenue > 0 ? round((profit / revenue) * 100) : 0,
    };
  });
}

// =====================================================
// Produktivitas per lahan (kg/m²): aktual vs target
// =====================================================
export type YieldRow = {
  field: string;
  shortName: string;
  actual: number;
  target: number;
  harvested: boolean;
  status: string;
};

export function yieldByField(year: number): YieldRow[] {
  return fieldsByYear(year).map((field) => {
    const season = getSeasonByFieldYear(field.id, year);
    const rep = season ? getReportBySeason(season.id) : undefined;
    const m2 = field.areaM2;
    return {
      field: field.name,
      shortName: field.name.replace("Blok Tebu ", ""),
      actual: rep && m2 > 0 ? round((rep.yieldTon * 1000) / m2, 2) : 0,
      target: rep && m2 > 0 ? round((rep.targetTon * 1000) / m2, 2) : 0,
      harvested: !!rep && rep.yieldTon > 0,
      status: season?.status ?? "fallow",
    };
  });
}

// =====================================================
// Komposisi biaya: musim terpilih saja (donut tunggal)
// =====================================================
export type CostRow = {
  category: string;
  year: number;
  yearPct: number;
};

export function costComposition(year: number): {
  yearTotal: number;
  data: CostRow[];
} {
  const yIds = new Set(seasonsByYear(year).map((s) => s.id));
  const yexp = expenses.filter((e) => yIds.has(e.seasonId));
  const yTot = yexp.reduce((s, e) => s + e.amount, 0);
  const byCat = yexp.reduce<Record<string, number>>((m, e) => {
    m[e.category] = (m[e.category] ?? 0) + e.amount;
    return m;
  }, {});
  return {
    yearTotal: yTot,
    data: Object.keys(byCat)
      .map((category) => ({
        category: CATEGORY_LABEL_ID[category] ?? category,
        year: byCat[category] ?? 0,
        yearPct: yTot > 0 ? round(((byCat[category] ?? 0) / yTot) * 100) : 0,
      }))
      .sort((a, b) => b.year - a.year),
  };
}

// =====================================================
// P&L per lahan + margin rata-rata all-time (garis acuan)
// =====================================================
export type PnlRow = {
  field: string;
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
};

export function pnlByField(year: number): {
  rows: PnlRow[];
  allTimeMargin: number;
} {
  const rows = fieldsByYear(year).map((field) => {
    const season = getSeasonByFieldYear(field.id, year);
    const revenue = season ? totalRevenueBySeason(season.id) : 0;
    const cost = season ? totalExpensesBySeason(season.id) : 0;
    return {
      field: field.name.replace("Blok Tebu ", ""),
      revenue,
      cost,
      profit: revenue - cost,
      margin: revenue > 0 ? round(((revenue - cost) / revenue) * 100) : 0,
    };
  });
  const allRev = totalRevenue();
  const allExp = totalExpenses();
  return {
    rows,
    allTimeMargin: allRev > 0 ? round(((allRev - allExp) / allRev) * 100) : 0,
  };
}

// =====================================================
// Durasi tanam–panen: deviasi hari aktualisasi vs perkiraan panen per lahan.
// Negatif = panen lebih cepat / belum jatuh tempo, Positif = telat (overdue).
// =====================================================
export type HarvestDeviationCategory =
  | "cepat"
  | "sesuai"
  | "telat"
  | "berjalan";

export type HarvestDeviationRow = {
  field: string;
  shortName: string;
  deviationDays: number;
  category: HarvestDeviationCategory;
  harvested: boolean;
  detail: string;
};

export function harvestDeviationByField(
  year: number,
  now: Date = new Date(),
): HarvestDeviationRow[] {
  return fieldsByYear(year)
    .map((field): HarvestDeviationRow | null => {
      const season = getSeasonByFieldYear(field.id, year);
      if (!season) return null;
      const dev = deviationInfo(season, now);
      return {
        field: field.name,
        shortName: field.name.replace("Blok Tebu ", ""),
        deviationDays: dev.days,
        category: dev.category,
        harvested: season.status === "harvested",
        detail: dev.detail,
      };
    })
    .filter((r): r is HarvestDeviationRow => r !== null);
}
