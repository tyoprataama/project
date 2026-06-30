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
import type {
  KpiItem,
  YieldRow,
  CostRow,
  PnlRow,
  HarvestDeviationRow,
  HarvestDeviationCategory,
} from "../utils/analytics";

// Palet selaras tema client (biru Tulus + sedikit hijau + slate).
const COLORS = {
  tulus: "#214e8a",
  tulus300: "#7ea4d6",
  tulus200: "#aec6e8",
  leaf: "#1aa46a",
  leafLight: "#34b27b",
  amber: "#f59e0b",
  red: "#ef4444",
  gold: "#eab308",
  slate: "#94a3b8",
  ink: "#0c111b",
  muted: "#5b6675",
  grid: "#eef2f7",
};

const CAT_COLORS = [
  "#214e8a",
  "#1aa46a",
  "#f59e0b",
  "#5181c0",
  "#94a3b8",
  "#7ea4d6",
  "#138a58",
];

const DEV_COLORS: Record<HarvestDeviationCategory, string> = {
  cepat: "#1aa46a",
  sesuai: "#94a3b8",
  telat: "#ef4444",
  berjalan: "#214e8a",
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

// Object props diekstrak ke const agar tidak menulis object literal inline.
const tickMuted = { fontSize: 12, fill: COLORS.muted };
const tickInk = { fontSize: 12, fill: COLORS.ink };
const tickSmall = { fontSize: 11, fill: COLORS.muted };
const sparkMargin = { top: 4, bottom: 4, left: 0, right: 0 };
const hMargin = { top: 8, right: 20, bottom: 4, left: 8 };
const pnlMargin = { top: 12, right: 12, bottom: 4, left: 4 };
const devMargin = { top: 8, right: 24, bottom: 4, left: 8 };
const dotSm = { r: 3 };
const radiusRight: [number, number, number, number] = [0, 4, 4, 0];
const radiusTop: [number, number, number, number] = [4, 4, 0, 0];

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

// ---------- All-time tren per tahun (laba / pengeluaran / margin) ----------
// Format ringkas khusus sumbu Y (hemat ruang di layar HP): 35jt, -35jt, 1,2M, 500rb.
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
const lineCursor = { stroke: "rgba(33,78,138,0.25)", strokeWidth: 1 };
const lineDot = { r: 3 };
const lineActiveDot = { r: 5 };

export function AllTimeTrendChart({
  data,
}: {
  data: Array<{
    year: number;
    revenue: number;
    expenses: number;
    profit: number;
    margin: number;
  }>;
}) {
  return (
    <ResponsiveContainer width="100%" height={340}>
      <ComposedChart data={data} margin={hMargin}>
        <CartesianGrid vertical={false} stroke={COLORS.grid} />
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
          formatter={(value: number, name: string) =>
            name === "Margin"
              ? [`${formatNumber(Number(value))}%`, name]
              : [formatCurrency(Number(value)), name]
          }
          cursor={lineCursor}
        />
        <Legend />
        <ReferenceLine yAxisId="rp" y={0} stroke={COLORS.muted} />
        <Line
          yAxisId="rp"
          type="monotone"
          dataKey="revenue"
          name="Pendapatan"
          stroke={COLORS.tulus}
          strokeWidth={2.5}
          dot={lineDot}
          activeDot={lineActiveDot}
        />
        <Line
          yAxisId="rp"
          type="monotone"
          dataKey="expenses"
          name="Pengeluaran"
          stroke={COLORS.red}
          strokeWidth={2.5}
          dot={lineDot}
          activeDot={lineActiveDot}
        />
        <Line
          yAxisId="rp"
          type="monotone"
          dataKey="profit"
          name="Laba Bersih"
          stroke={COLORS.leaf}
          strokeWidth={2.5}
          dot={lineDot}
          activeDot={lineActiveDot}
        />
        <Line
          yAxisId="pct"
          type="monotone"
          dataKey="margin"
          name="Margin"
          stroke={COLORS.gold}
          strokeWidth={2}
          strokeDasharray="5 4"
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
            className="rounded-2xl border border-slate-200 bg-white p-5"
          >
            <p className="text-sm font-medium text-ink-muted">{it.label}</p>
            <p
              className={`mt-1 break-words font-display text-3xl font-medium leading-tight ${
                negative ? "text-red-600" : "text-ink"
              }`}
            >
              {formatKpi(it)}
            </p>
            <div className="mt-3 h-10">
              <Sparkline
                data={it.series}
                color={
                  negative ? COLORS.red : up ? COLORS.leaf : COLORS.tulus
                }
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span
                className={
                  up
                    ? "font-medium text-leaf-600"
                    : "font-medium text-tulus-700"
                }
              >
                {up ? "\u25B2" : "\u25BC"} {Math.abs(delta)}%
              </span>
              <span className="text-ink-muted">vs {it.benchmarkLabel}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ----------  per lahan (kg/m²) ----------
export function YieldBulletChart({ data }: { data: YieldRow[] }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(220, data.length * 66)}>
      <BarChart data={data} layout="vertical" margin={hMargin} barGap={2}>
        <CartesianGrid horizontal={false} stroke={COLORS.grid} />
        <XAxis type="number" tick={tickMuted} tickFormatter={fmtNum} />
        <YAxis
          type="category"
          dataKey="shortName"
          width={96}
          tick={tickInk}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip formatter={yieldTip} />
        <Legend />
        <Bar
          dataKey="target"
          name="Target"
          fill={COLORS.tulus200}
          radius={radiusRight}
          barSize={11}
        />
        <Bar
          dataKey="actual"
          name="Aktual"
          fill={COLORS.leaf}
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
  return (
    <div>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Tooltip formatter={fmtRp} />
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
                fill={CAT_COLORS[i % CAT_COLORS.length]}
                stroke="#ffffff"
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <p className="mt-2 text-center text-xs text-ink-muted">
        Komposisi biaya musim {year}
      </p>
      <ul className="mt-5 space-y-2">
        {data.map((row, i) => (
          <li
            key={row.category}
            className="flex items-center justify-between gap-2 text-sm"
          >
            <span className="inline-flex items-center gap-2 capitalize text-ink-muted">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={dotColor(CAT_COLORS[i % CAT_COLORS.length])}
              />
              {row.category}
            </span>
            <span className="font-medium text-ink">{row.yearPct}%</span>
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
  const marginRefLabel = {
    value: `margin all-time ${allTimeMargin}%`,
    position: "insideBottomRight" as const,
    fontSize: 11,
    fill: COLORS.slate,
  };
  return (
    <ResponsiveContainer width="100%" height={330}>
      <ComposedChart data={rows} margin={pnlMargin}>
        <CartesianGrid stroke={COLORS.grid} vertical={false} />
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
        <Tooltip formatter={pnlTip} />
        <Legend />
        <Bar
          yAxisId="rp"
          dataKey="revenue"
          name="Pendapatan"
          fill={COLORS.leaf}
          radius={radiusTop}
          barSize={22}
        />
        <Bar
          yAxisId="rp"
          dataKey="cost"
          name="Biaya"
          fill={COLORS.tulus}
          radius={radiusTop}
          barSize={22}
        />
        <Line
          yAxisId="pct"
          type="monotone"
          dataKey="margin"
          name="Margin %"
          stroke={COLORS.amber}
          strokeWidth={2}
          dot={dotSm}
        />
        <ReferenceLine
          yAxisId="pct"
          y={allTimeMargin}
          stroke={COLORS.slate}
          strokeDasharray="4 4"
          label={marginRefLabel}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// ---------- Durasi tanam–panen: deviasi hari (diverging bar) ----------
function DeviationTip(props: any) {
  if (!props || !props.active || !props.payload || props.payload.length === 0)
    return null;
  const row = props.payload[0].payload as HarvestDeviationRow;
  return (
    <div className="max-w-[220px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-sm">
      <p className="font-medium text-ink">{row.field}</p>
      <p className="font-medium" style={textColor(DEV_COLORS[row.category])}>
        {DEV_LABEL[row.category]}
      </p>
      <p className="mt-0.5 text-ink-muted">{row.detail}</p>
    </div>
  );
}

export function HarvestDeviationChart({
  data,
}: {
  data: HarvestDeviationRow[];
}) {
  return (
    <div>
      <ResponsiveContainer
        width="100%"
        height={Math.max(220, data.length * 64)}
      >
        <BarChart data={data} layout="vertical" margin={devMargin}>
          <CartesianGrid horizontal={false} stroke={COLORS.grid} />
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
          <ReferenceLine x={0} stroke={COLORS.muted} />
          <Bar
            dataKey="deviationDays"
            name="Deviasi (hari)"
            radius={3}
            barSize={18}
          >
            {data.map((row) => (
              <Cell key={row.field} fill={DEV_COLORS[row.category]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {/* <p className="mt-2 text-center text-xs text-ink-muted">
        Sumbu negatif = panen lebih cepat / belum jatuh tempo · positif = telat
        (overdue) terhadap target panen.
      </p> */}
      <ul className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs">
        {DEV_LEGEND.map((cat) => (
          <li
            key={cat}
            className="inline-flex items-center gap-2 text-ink-muted"
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={dotColor(DEV_COLORS[cat])}
            />
            {DEV_LABEL[cat]}
          </li>
        ))}
      </ul>
    </div>
  );
}
