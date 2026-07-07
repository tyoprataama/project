import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  PieChart,
  Pie,
  ComposedChart,
  ReferenceLine,
} from "recharts";
import {
  formatCompactCurrency,
  formatCurrency,
  formatNumber,
} from "../../utils/format";
import { useTheme } from "../theme";
import type {
  KpiItem,
  YieldRow,
  CostRow,
  PnlRow,
  HarvestDeviationRow,
  HarvestDeviationCategory,
} from "../utils/analytics";

// Palet dasar (mode terang).
const COLORS = {
  tulus: "#214e8a",
  tulus300: "#7ea4d6",
  tulus200: "#aec6e8",
  leaf: "#1aa46a",
  leafLight: "#34b27b",
  amber: "#f59e0b",
  red: "#ef4444",
  gold: "#eab308",
  violet: "#8b5cf6",
  slate: "#94a3b8",
  ink: "#0c111b",
  muted: "#5b6675",
  grid: "#eef2f7",
};

const CAT_COLORS_LIGHT = [
  "#214e8a",
  "#1aa46a",
  "#f59e0b",
  "#5181c0",
  "#94a3b8",
  "#7ea4d6",
  "#138a58",
];
const CAT_COLORS_DARK = [
  "#5E9FE8",
  "#72BC8F",
  "#EAC26B",
  "#BF8EDA",
  "#9aa4b2",
  "#4FB9C9",
  "#DE9255",
];

const DEV_COLORS_LIGHT: Record<HarvestDeviationCategory, string> = {
  cepat: "#1aa46a",
  sesuai: "#94a3b8",
  telat: "#ef4444",
  berjalan: "#214e8a",
};
const DEV_COLORS_DARK: Record<HarvestDeviationCategory, string> = {
  cepat: "#72BC8F",
  sesuai: "#9aa4b2",
  telat: "#E97366",
  berjalan: "#5E9FE8",
};

const DEV_LABEL: Record<HarvestDeviationCategory, string> = {
  cepat: "Panen lebih cepat",
  sesuai: "Tepat target",
  telat: "Telat / overdue",
  berjalan: "Sedang berjalan",
};

const DEV_LEGEND: HarvestDeviationCategory[] = [
  "cepat",
  "sesuai",
  "berjalan",
  "telat",
];

// =====================================================
// Palet grafik sadar-tema (light/dark).
// =====================================================
function useChartTheme() {
  const { isDark } = useTheme();
  return {
    isDark,
    text: isDark ? "#ffffff" : COLORS.ink,
    muted: isDark ? "rgba(255,255,255,0.65)" : COLORS.muted,
    grid: isDark ? "rgba(255,255,255,0.10)" : COLORS.grid,
    zero: isDark ? "rgba(255,255,255,0.35)" : COLORS.muted,
    surfaceStroke: isDark ? "#202020" : "#ffffff",
    tooltipBg: isDark ? "#202020" : "#ffffff",
    tooltipBorder: isDark ? "rgba(255,255,255,0.15)" : "#e2e8f0",
    revenue: isDark ? "#5E9FE8" : COLORS.tulus,
    expense: isDark ? "#E97366" : COLORS.red,
    profit: isDark ? "#72BC8F" : COLORS.leaf,
    margin: isDark ? "#EAC26B" : COLORS.gold,
    roi: isDark ? "#B794F4" : COLORS.violet,
    barRevenue: isDark ? "#72BC8F" : COLORS.leaf,
    barCost: isDark ? "#5E9FE8" : COLORS.tulus,
    marginLine: isDark ? "#EAC26B" : COLORS.amber,
    catColors: isDark ? CAT_COLORS_DARK : CAT_COLORS_LIGHT,
    devColors: isDark ? DEV_COLORS_DARK : DEV_COLORS_LIGHT,
  };
}

type ChartTheme = ReturnType<typeof useChartTheme>;

const tooltipStyle = (t: ChartTheme) => ({
  background: t.tooltipBg,
  border: `1px solid ${t.tooltipBorder}`,
  borderRadius: 12,
  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
  color: t.text,
});
const tipTextStyle = (t: ChartTheme) => ({ color: t.text });
const axisTick = (fill: string, size = 12) => ({ fontSize: size, fill });

// Object props statis.
const sparkMargin = { top: 4, bottom: 4, left: 0, right: 0 };
const hMargin = { top: 8, right: 20, bottom: 4, left: 8 };
const pnlMargin = { top: 12, right: 12, bottom: 4, left: 4 };
const devMargin = { top: 8, right: 24, bottom: 4, left: 8 };
const dotSm = { r: 3 };
const lineDot = { r: 3 };
const lineActiveDot = { r: 5 };
const radiusRight: [number, number, number, number] = [0, 4, 4, 0];
const radiusTop: [number, number, number, number] = [4, 4, 0, 0];
const lineCursor = { stroke: "rgba(120,140,170,0.35)", strokeWidth: 1 };

const fmtRp = (v: number) => formatCompactCurrency(Number(v));
const fmtNum = (v: number) => formatNumber(Number(v));
const fmtPct = (v: number) => `${formatNumber(Number(v))}%`;
const yieldTip = (v: number) => `${formatNumber(Number(v))} kg/m²`;
const devTick = (v: number) => `${v}`;
const pnlTip = (v: number, name: string) =>
  name === "Margin %"
    ? `${formatNumber(Number(v))}%`
    : formatCompactCurrency(Number(v));
const dotColor = (c: string) => ({ backgroundColor: c });
const textColor = (c: string) => ({ color: c });

// Format ringkas khusus sumbu Y: 35jt, -35jt, 1,2M, 500rb.
const fmtRpAxis = (v: number) => {
  const n = Number(v);
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000_000)
    return `${sign}${(abs / 1_000_000_000).toFixed(1).replace(".", ",")}M`;
  if (abs >= 1_000_000) return `${sign}${Math.round(abs / 1_000_000)}jt`;
  if (abs >= 1_000) return `${sign}${Math.round(abs / 1_000)}rb`;
  return `${sign}${abs}`;
};
const fmtPctAxis = (v: number) => `${formatNumber(Number(v))}%`;

// ---------- Sparkline ----------
export function Sparkline({
  data,
  color = COLORS.tulus,
}: {
  data: number[];
  color?: string;
}) {
  const d = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={d} margin={sparkMargin}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ---------- All-time tren per tahun (laba / pengeluaran / margin / ROI) ----------
export function AllTimeTrendChart({
  data,
}: {
  data: Array<{
    year: number;
    revenue: number;
    expenses: number;
    profit: number;
    margin: number;
    roi: number;
  }>;
}) {
  const t = useChartTheme();
  const tickMuted = axisTick(t.muted);
  const tickInk = axisTick(t.text);
  return (
    <ResponsiveContainer width="100%" height={340}>
      <ComposedChart data={data} margin={hMargin}>
        <CartesianGrid vertical={false} stroke={t.grid} />
        <XAxis
          dataKey="year"
          tick={tickInk}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          yAxisId="rp"
          tick={tickMuted}
          tickFormatter={fmtRpAxis}
          width={48}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          yAxisId="pct"
          orientation="right"
          tick={tickMuted}
          tickFormatter={fmtPctAxis}
          width={40}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={tooltipStyle(t)}
          labelStyle={tipTextStyle(t)}
          itemStyle={tipTextStyle(t)}
          formatter={(value: number, name: string) =>
            name === "Margin" || name === "ROI"
              ? [`${formatNumber(Number(value))}%`, name]
              : [formatCurrency(Number(value)), name]
          }
          cursor={lineCursor}
        />
        <Legend />
        <ReferenceLine yAxisId="rp" y={0} stroke={t.zero} />
        <Line
          yAxisId="rp"
          type="monotone"
          dataKey="revenue"
          name="Pendapatan"
          stroke={t.revenue}
          strokeWidth={2.5}
          dot={lineDot}
          activeDot={lineActiveDot}
        />
        <Line
          yAxisId="rp"
          type="monotone"
          dataKey="expenses"
          name="Pengeluaran"
          stroke={t.expense}
          strokeWidth={2.5}
          dot={lineDot}
          activeDot={lineActiveDot}
        />
        <Line
          yAxisId="rp"
          type="monotone"
          dataKey="profit"
          name="Laba Bersih"
          stroke={t.profit}
          strokeWidth={2.5}
          dot={lineDot}
          activeDot={lineActiveDot}
        />
        <Line
          yAxisId="pct"
          type="monotone"
          dataKey="margin"
          name="Margin"
          stroke={t.margin}
          strokeWidth={2}
          strokeDasharray="5 4"
          dot={lineDot}
          activeDot={lineActiveDot}
        />
        <Line
          yAxisId="pct"
          type="monotone"
          dataKey="roi"
          name="ROI"
          stroke={t.roi}
          strokeWidth={2}
          strokeDasharray="2 3"
          dot={lineDot}
          activeDot={lineActiveDot}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// ---------- Keuangan per lahan sepanjang waktu (bar pendapatan vs biaya + garis laba) ----------
export function FieldFinanceChart({
  data,
}: {
  data: Array<{
    seasonId: string;
    year: number;
    label: string;
    crop: string;
    revenue: number;
    expenses: number;
    profit: number;
  }>;
}) {
  const t = useChartTheme();
  const tickMuted = axisTick(t.muted);
  const tickInk = axisTick(t.text);
  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data} margin={hMargin}>
        <CartesianGrid vertical={false} stroke={t.grid} />
        <XAxis
          dataKey="year"
          tick={tickInk}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={tickMuted}
          tickFormatter={fmtRpAxis}
          width={48}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={tooltipStyle(t)}
          labelStyle={tipTextStyle(t)}
          itemStyle={tipTextStyle(t)}
          formatter={(value: number, name: string) => [
            formatCurrency(Number(value)),
            name,
          ]}
          cursor={lineCursor}
        />
        <Legend />
        <ReferenceLine y={0} stroke={t.zero} />
        <Bar
          dataKey="revenue"
          name="Pendapatan"
          fill={t.barRevenue}
          radius={radiusTop}
          maxBarSize={26}
        />
        <Bar
          dataKey="expenses"
          name="Pengeluaran"
          fill={t.expense}
          radius={radiusTop}
          maxBarSize={26}
        />
        <Line
          type="monotone"
          dataKey="profit"
          name="Laba Bersih"
          stroke={t.profit}
          strokeWidth={2.5}
          dot={lineDot}
          activeDot={lineActiveDot}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// ---------- KPI hero cards ----------
function formatKpi(it: KpiItem): string {
  if (it.format === "rp") return formatCompactCurrency(it.current);
  if (it.format === "pct") return `${formatNumber(it.current)}%`;
  return `${formatNumber(it.current)}${it.unit ? " " + it.unit : ""}`;
}

export function KpiCards({ items }: { items: KpiItem[] }) {
  const t = useChartTheme();
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((it) => {
        const delta =
          it.benchmark !== 0
            ? Math.round(
                ((it.current - it.benchmark) / Math.abs(it.benchmark)) * 100,
              )
            : 0;
        const up = delta >= 0;
        const negative = it.current < 0;
        return (
          <div
            key={it.key}
            className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#202020]"
          >
            <p className="text-sm font-medium text-ink-muted dark:text-white/60">
              {it.label}
            </p>
            <p
              className={`mt-1 break-words font-display text-3xl font-medium leading-tight ${
                negative
                  ? "text-red-600 dark:text-[#E97366]"
                  : "text-ink dark:text-white"
              }`}
            >
              {formatKpi(it)}
            </p>
            <div className="mt-3 h-10">
              <Sparkline
                data={it.series}
                color={negative ? t.expense : up ? t.profit : t.revenue}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span
                className={
                  up
                    ? "font-medium text-leaf-600 dark:text-[#72BC8F]"
                    : "font-medium text-tulus-700 dark:text-[#8fbdf0]"
                }
              >
                {up ? "\u25B2" : "\u25BC"} {Math.abs(delta)}%
              </span>
              <span className="text-ink-muted dark:text-white/50">
                vs {it.benchmarkLabel}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ----------  per lahan (kg/m²) ----------
export function YieldBulletChart({ data }: { data: YieldRow[] }) {
  const t = useChartTheme();
  const tickMuted = axisTick(t.muted);
  const tickInk = axisTick(t.text);
  return (
    <ResponsiveContainer width="100%" height={Math.max(220, data.length * 66)}>
      <BarChart data={data} layout="vertical" margin={hMargin} barGap={2}>
        <CartesianGrid horizontal={false} stroke={t.grid} />
        <XAxis type="number" tick={tickMuted} tickFormatter={fmtNum} />
        <YAxis
          type="category"
          dataKey="shortName"
          width={96}
          tick={tickInk}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={tooltipStyle(t)}
          labelStyle={tipTextStyle(t)}
          itemStyle={tipTextStyle(t)}
          formatter={yieldTip}
        />
        <Legend />
        <Bar
          dataKey="target"
          name="Target"
          fill={t.isDark ? "#3a5170" : COLORS.tulus200}
          radius={radiusRight}
          barSize={11}
        />
        <Bar
          dataKey="actual"
          name="Aktual"
          fill={t.profit}
          radius={radiusRight}
          barSize={11}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ---------- Komposisi biaya (donut tunggal: musim terpilih) ----------
export function CostDonutChart({
  data,
  year,
}: {
  data: CostRow[];
  year: number;
}) {
  const t = useChartTheme();
  return (
    <div>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Tooltip
            contentStyle={tooltipStyle(t)}
            labelStyle={tipTextStyle(t)}
            itemStyle={tipTextStyle(t)}
            formatter={fmtRp}
          />
          <Pie
            data={data}
            dataKey="year"
            nameKey="category"
            cx="50%"
            cy="50%"
            innerRadius={62}
            outerRadius={104}
            paddingAngle={1}
            isAnimationActive={false}
          >
            {data.map((row, i) => (
              <Cell
                key={`y-${row.category}`}
                fill={t.catColors[i % t.catColors.length]}
                stroke={t.surfaceStroke}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <p className="mt-2 text-center text-xs text-ink-muted dark:text-white/50">
        Komposisi biaya musim {year}
      </p>
      <ul className="mt-5 space-y-2">
        {data.map((row, i) => (
          <li
            key={row.category}
            className="flex items-center justify-between gap-2 text-sm"
          >
            <span className="inline-flex items-center gap-2 capitalize text-ink-muted dark:text-white/60">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={dotColor(t.catColors[i % t.catColors.length])}
              />
              {row.category}
            </span>
            <span className="font-medium text-ink dark:text-white">
              {row.yearPct}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------- P&L per lahan ----------
export function PnLChart({
  rows,
  allTimeMargin,
}: {
  rows: PnlRow[];
  allTimeMargin: number;
}) {
  const t = useChartTheme();
  const tickInk = axisTick(t.text);
  const tickSmall = axisTick(t.muted, 11);
  const marginRefLabel = {
    value: `margin all-time ${allTimeMargin}%`,
    position: "insideBottomRight" as const,
    fontSize: 11,
    fill: t.muted,
  };
  return (
    <ResponsiveContainer width="100%" height={330}>
      <ComposedChart data={rows} margin={pnlMargin}>
        <CartesianGrid stroke={t.grid} vertical={false} />
        <XAxis dataKey="field" tick={tickInk} tickLine={false} />
        <YAxis
          yAxisId="rp"
          tickFormatter={fmtRp}
          tick={tickSmall}
          width={66}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          yAxisId="pct"
          orientation="right"
          tickFormatter={fmtPct}
          tick={tickSmall}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={tooltipStyle(t)}
          labelStyle={tipTextStyle(t)}
          itemStyle={tipTextStyle(t)}
          formatter={pnlTip}
        />
        <Legend />
        <Bar
          yAxisId="rp"
          dataKey="revenue"
          name="Pendapatan"
          fill={t.barRevenue}
          radius={radiusTop}
          barSize={22}
        />
        <Bar
          yAxisId="rp"
          dataKey="cost"
          name="Biaya"
          fill={t.barCost}
          radius={radiusTop}
          barSize={22}
        />
        <Line
          yAxisId="pct"
          type="monotone"
          dataKey="margin"
          name="Margin %"
          stroke={t.marginLine}
          strokeWidth={2}
          dot={dotSm}
        />
        <ReferenceLine
          yAxisId="pct"
          y={allTimeMargin}
          stroke={t.zero}
          strokeDasharray="4 4"
          label={marginRefLabel}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// ---------- Durasi tanam–panen: deviasi hari (diverging bar) ----------
function DeviationTip(props: any) {
  const t = useChartTheme();
  if (!props || !props.active || !props.payload || props.payload.length === 0)
    return null;
  const row = props.payload[0].payload as HarvestDeviationRow;
  return (
    <div className="max-w-[220px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-sm dark:border-white/15 dark:bg-[#202020]">
      <p className="font-medium text-ink dark:text-white">{row.field}</p>
      <p className="font-medium" style={textColor(t.devColors[row.category])}>
        {DEV_LABEL[row.category]}
      </p>
      <p className="mt-0.5 text-ink-muted dark:text-white/60">{row.detail}</p>
    </div>
  );
}

export function HarvestDeviationChart({
  data,
}: {
  data: HarvestDeviationRow[];
}) {
  const t = useChartTheme();
  const tickMuted = axisTick(t.muted);
  const tickInk = axisTick(t.text);
  return (
    <div>
      <ResponsiveContainer
        width="100%"
        height={Math.max(220, data.length * 64)}
      >
        <BarChart data={data} layout="vertical" margin={devMargin}>
          <CartesianGrid horizontal={false} stroke={t.grid} />
          <XAxis type="number" tick={tickMuted} tickFormatter={devTick} />
          <YAxis
            type="category"
            dataKey="shortName"
            width={96}
            tick={tickInk}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={DeviationTip} cursor={false} />
          <ReferenceLine x={0} stroke={t.zero} />
          <Bar
            dataKey="deviationDays"
            name="Deviasi (hari)"
            radius={3}
            barSize={18}
          >
            {data.map((row) => (
              <Cell key={row.field} fill={t.devColors[row.category]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <ul className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs">
        {DEV_LEGEND.map((cat) => (
          <li
            key={cat}
            className="inline-flex items-center gap-2 text-ink-muted dark:text-white/60"
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={dotColor(t.devColors[cat])}
            />
            {DEV_LABEL[cat]}
          </li>
        ))}
      </ul>
    </div>
  );
}
