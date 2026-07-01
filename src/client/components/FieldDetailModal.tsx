import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiX,
  FiMapPin,
  FiCalendar,
  FiActivity,
  FiDollarSign,
  FiImage,
  FiGitBranch,
  FiBookOpen,
  FiTrendingUp,
  FiInfo,
  FiHome,
} from "react-icons/fi";
import type { Field, Season } from "../../types";
import { fieldStatusMeta } from "../constants/fieldMeta";
import {
  getActivitiesBySeason,
  getExpensesBySeason,
  getGalleryBySeason,
  getReportBySeason,
  getDecisionsBySeason,
  getPracticesBySeason,
  getMonitorsBySeason,
  totalExpensesBySeason,
  totalRevenueBySeason,
  haFromM2,
  getFieldById,
  getSeasonById,
} from "../../data";
import {
  formatCurrency,
  formatCompactCurrency,
  formatDate,
  formatNumber,
} from "../../utils/format";
import { WeatherBadge } from "./WeatherBadge";
import {
  deviationInfo,
  growthProgress,
  humanDuration,
  rentalScheduleImpact,
} from "../../utils/harvest";
import { normalizeImageUrl } from "../../utils/image";

const overlayHidden = { opacity: 0 };
const overlayShown = { opacity: 1 };
const overlayTransition = { duration: 0.2 };

const panelHidden = { opacity: 0, y: 28, scale: 0.98 };
const panelShown = { opacity: 1, y: 0, scale: 1 };
const panelExit = { opacity: 0, y: 18, scale: 0.98 };
const panelTransition = { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const };

const barStyle = (pct: number) => ({
  width: `${Math.min(100, Math.max(0, pct))}%`,
});

const ownershipLabel: Record<string, string> = {
  owned: "Milik Sendiri",
  rental: "Sewa",
};

// Label kategori biaya untuk linimasa aktivitas yang sudah memuat pengeluaran.
const expenseCategoryLabel: Record<string, string> = {
  seeds: "Benih",
  fertilizer: "Pupuk",
  labor: "Tenaga Kerja",
  equipment: "Peralatan",
  irrigation: "Irigasi",
  pesticide: "Pestisida",
  logistics: "Logistik",
  rent: "Sewa",
  other: "Lain-lain",
  tax: "Pajak",
};

const activityToneMap: Record<string, string> = {
  completed: "bg-leaf-50 text-leaf-700 ring-leaf-600/20",
  "in-progress": "bg-amber-50 text-amber-700 ring-amber-600/20",
  planned: "bg-tulus-50 text-tulus-700 ring-tulus-600/20",
};
const activityStatusLabel: Record<string, string> = {
  completed: "Selesai",
  "in-progress": "Berjalan",
  planned: "Rencana",
};

const devCalloutClass: Record<string, string> = {
  cepat: "bg-leaf-50 text-leaf-700",
  sesuai: "bg-slate-50 text-ink-muted",
  telat: "bg-red-50 text-red-700",
  berjalan: "bg-tulus-50 text-tulus-700",
};

const impactLabel: Record<string, string> = {
  high: "Tinggi",
  medium: "Sedang",
  low: "Rendah",
};

// Tooltip kontekstual: klik atau hover ikon info untuk memunculkan penjelasan
// section (bukan sekadar tanda tanya).
function HintTooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onBlur={() => setOpen(false)}
        aria-label={text}
        className="grid h-5 w-5 cursor-help place-items-center rounded-full text-ink-muted transition hover:bg-slate-100 hover:text-tulus-700"
      >
        <FiInfo size={13} />
      </button>
      {open ? (
        <span
          role="tooltip"
          className="absolute left-1/2 top-7 z-30 w-60 -translate-x-1/2 rounded-lg bg-ink px-3 py-2 text-xs font-normal normal-case leading-relaxed text-white shadow-lg"
        >
          {text}
        </span>
      ) : null}
    </span>
  );
}

// Section dengan tooltip kontekstual yang menjelaskan isi tiap bagian.
function Section({
  icon: Icon,
  title,
  hint,
  children,
}: {
  icon: typeof FiInfo;
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-slate-100 px-6 py-6 first:border-t-0 sm:px-8">
      <h3 className="mb-4 flex items-center gap-2 font-display text-base font-semibold text-tulus-900">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-tulus-50 text-tulus-700">
          <Icon size={15} />
        </span>
        {title}
        <HintTooltip text={hint} />
      </h3>
      {children}
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-ink-muted">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-ink">{value}</dd>
    </div>
  );
}

export function FieldDetailModal({
  open,
  field,
  season,
  onClose,
}: {
  open: boolean;
  field: Field | null;
  season: Season | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const ready = open && field && season;

  return (
    <AnimatePresence>
      {ready ? (
        <motion.div
          key="field-modal"
          initial={overlayHidden}
          animate={overlayShown}
          exit={overlayHidden}
          transition={overlayTransition}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={`Detail ${field.name}`}
        >
          <motion.div
            initial={panelHidden}
            animate={panelShown}
            exit={panelExit}
            transition={panelTransition}
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-h-[88vh] sm:rounded-3xl"
          >
            <ModalBody field={field} season={season} onClose={onClose} />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function ModalBody({
  field: fieldProp,
  season: seasonProp,
  onClose,
}: {
  field: Field;
  season: Season;
  onClose: () => void;
}) {
  // Ambil ulang data live (by id) agar perubahan admin — mis. biaya sewa —
  // langsung tercermin pada estimasi kerugian/keuntungan sewa.
  const field = getFieldById(fieldProp.id) ?? fieldProp;
  const season = getSeasonById(seasonProp.id) ?? seasonProp;
  const meta = fieldStatusMeta[season.status];
  const isLive = season.status === "active";
  const dev = deviationInfo(season);
  const acts = getActivitiesBySeason(season.id);
  const exps = getExpensesBySeason(season.id);
  const galleryItems = getGalleryBySeason(season.id);
  const report = getReportBySeason(season.id);
  const seasonDecisions = getDecisionsBySeason(season.id);
  const seasonPractices = getPracticesBySeason(season.id);
  const monitors = getMonitorsBySeason(season.id);
  const latestMonitor = monitors[monitors.length - 1];
  const expenseTotal = totalExpensesBySeason(season.id);
  const revenueTotal = totalRevenueBySeason(season.id);
  const progressPct = growthProgress(season);
  // Biaya sewa efektif musim ini mengikuti pengeluaran kategori "rent" pada
  // musim tsb (agar perubahan biaya sewa yang diedit di admin langsung
  // tercermin pada estimasi kerugian/keuntungan), fallback ke biaya sewa lahan.
  const seasonRentExpense = exps
    .filter((e) => e.category === "rent")
    .reduce((sum, e) => sum + e.amount, 0);
  const scheduleImpact = rentalScheduleImpact(
    { ...field, rentalCost: seasonRentExpense || field.rentalCost },
    season,
  );
  const operationalProfit = revenueTotal - expenseTotal;
  // Estimasi laba bersih = laba operasional murni. Dampak sewa (kerugian saat
  // overdue / keuntungan saat lebih cepat panen) DITAMPILKAN TERPISAH sebagai
  // catatan, tidak ditambah/dikurangkan ke angka ini.
  const netProfit = operationalProfit;

  // Linimasa gabungan: aktivitas lapangan + rincian pengeluaran (tanggal & biaya).
  const timeline = [
    ...acts.map((a) => ({ kind: "activity" as const, date: a.date, data: a })),
    ...exps.map((e) => ({ kind: "expense" as const, date: e.date, data: e })),
  ].sort((a, b) => {
  const d = +new Date(b.date) - +new Date(a.date);
  return d !== 0 ? d : a.data.id.localeCompare(b.data.id);
});

  const expenseByCat = exps.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + e.amount;
    return acc;
  }, {});
  const catEntries = Object.entries(expenseByCat).sort((a, b) => b[1] - a[1]);
  const expensesSorted = [...exps].sort((a, b) => b.amount - a.amount);

  return (
    <>
      {/* Header (sticky) */}
      <div className="relative shrink-0 border-b border-slate-100 bg-gradient-to-br from-tulus-50/80 to-white px-6 py-6 sm:px-8">
        <button
          onClick={onClose}
          aria-label="Tutup"
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white text-ink-muted ring-1 ring-slate-200 transition hover:text-ink"
        >
          <FiX size={18} />
        </button>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${meta.className}`}
          >
            {isLive ? (
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-leaf-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-leaf-500" />
              </span>
            ) : (
              <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
            )}
            {isLive ? `${meta.label} · Live` : meta.label}
          </span>
          {/* Cuaca hari ini di samping nama & lokasi */}
          <WeatherBadge bmkgCode={field.bmkgCode} seed={field.location} />
        </div>
        <h2 className="mt-3 pr-10 font-display text-2xl font-semibold text-tulus-900">
          {field.name}
        </h2>
        <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-ink-muted">
          <FiMapPin size={13} /> {field.location} · {season.label}
        </p>
      </div>

      {/* Scrollable content */}
      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin">
        {/* Field Information */}
        <Section
          icon={FiHome}
          title="Informasi Lahan"
          hint="Data permanen lahan: luas, status kepemilikan, dan kondisi tanah."
        >
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <InfoRow
              label="Luas"
              value={`${formatNumber(field.areaM2)} m² (${formatNumber(
                haFromM2(field.areaM2),
              )} ha)`}
            />
            <InfoRow
              label="Kepemilikan"
              value={ownershipLabel[field.ownership]}
            />
            {field.ownership === "rental" && field.rentalCost ? (
              <InfoRow
                label="Biaya Sewa"
                value={formatCompactCurrency(field.rentalCost)}
              />
            ) : null}
            <InfoRow label="Kondisi Tanah" value={field.soilType} />
          </dl>
          {field.notes ? (
            <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm leading-relaxed text-ink-muted">
              {field.notes}
            </p>
          ) : null}
        </Section>

        {/* Current Season + Crop Information */}
        <Section
          icon={FiCalendar}
          title="Musim Tanam & Komoditas"
          hint="Komoditas yang ditanam, jadwal tanam-panen, dan skor kesehatan terkini."
        >
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <InfoRow label="Musim" value={season.label} />
            <InfoRow label="Komoditas" value={season.crop} />
            <InfoRow
              label="Tanggal Tanam"
              value={formatDate(season.plantingDate)}
            />
            <InfoRow
              label="Perkiraan Panen"
              value={formatDate(season.harvestDate)}
            />
            {season.actualHarvestDate ? (
              <InfoRow
                label="Aktualisasi Panen"
                value={formatDate(season.actualHarvestDate)}
              />
            ) : null}
            {latestMonitor ? (
              <InfoRow
                label="Skor Kesehatan"
                value={`${latestMonitor.healthScore}/100`}
              />
            ) : null}
          </dl>
          {season.notes ? (
            <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm leading-relaxed text-ink-muted">
              {season.notes}
            </p>
          ) : null}
          <div
            className={`mt-4 rounded-xl px-4 py-3 text-sm font-medium ${devCalloutClass[dev.category]}`}
          >
            {dev.detail}
            {season.harvestNote ? (
              <span className="mt-1 block font-normal opacity-90">
                {season.harvestNote}
              </span>
            ) : null}
          </div>
        </Section>

        {/* Season Progress */}
        <Section
          icon={FiTrendingUp}
          title="Progress & Hasil"
          hint="Persentase pertumbuhan menuju panen serta perbandingan hasil dengan target (ton)."
        >
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink-muted">Progress pertumbuhan</span>
            <span
              className={`font-semibold ${
                progressPct > 100 ? "text-red-600" : "text-tulus-700"
              }`}
            >
              {formatNumber(progressPct)}%
            </span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all ${
                progressPct > 100 ? "bg-red-500" : "bg-tulus-600"
              }`}
              style={barStyle(progressPct)}
            />
          </div>
          {progressPct !== 100 ? (
            <p className="mt-2 text-xs text-ink-muted">
              {season.status === "harvested"
                ? dev.days > 0
                  ? `Melebihi 100% karena panen mundur ${humanDuration(dev.days)} dari perkiraan (prorata terhadap siklus tanam).`
                  : `Di bawah 100% karena panen ${humanDuration(Math.abs(dev.days))} lebih cepat dari perkiraan (prorata terhadap siklus tanam).`
                : dev.days > 0
                  ? `Sudah melewati perkiraan panen ${humanDuration(dev.days)} (overdue) — progress dihitung dari tanggal terhadap siklus tanam.`
                  : `Progress dihitung dari tanggal: ${humanDuration(Math.abs(dev.days))} lagi menuju perkiraan panen.`}
            </p>
          ) : null}
          {report ? (
            <div className="mt-4 grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl bg-slate-50 px-3 py-3">
                <p className="font-display text-lg font-semibold text-ink">
                  {formatNumber(report.yieldTon)}
                </p>
                <p className="text-xs text-ink-muted">Hasil (ton)</p>
              </div>
              <div className="rounded-xl bg-slate-50 px-3 py-3">
                <p className="font-display text-lg font-semibold text-ink">
                  {formatNumber(report.targetTon)}
                </p>
                <p className="text-xs text-ink-muted">Target (ton)</p>
              </div>
            </div>
          ) : null}
        </Section>

        {/* Timeline of Activities */}
        <Section
          icon={FiActivity}
          title="Linimasa Aktivitas"
          hint="Urutan kegiatan lapangan beserta rincian pengeluaran (tanggal & biaya) dari tanam, perawatan, hingga panen."
        >
          {timeline.length ? (
            <ol className="relative space-y-4 border-l border-slate-200 pl-5">
              {timeline.map((item) =>
                item.kind === "activity" ? (
                  <li key={`act-${item.data.id}`} className="relative">
                    <span className="absolute -left-[1.4rem] top-1 grid h-3 w-3 place-items-center rounded-full bg-tulus-600 ring-4 ring-white" />
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium text-ink">
                        {item.data.title}
                      </p>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${activityToneMap[item.data.status]}`}
                      >
                        {activityStatusLabel[item.data.status]}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-ink-muted">
                      {formatDate(item.data.date)} · {item.data.performedBy}
                    </p>
                    <p className="mt-1 text-sm text-ink-muted">
                      {item.data.description}
                    </p>
                  </li>
                ) : (
                  <li key={`exp-${item.data.id}`} className="relative">
                    <span className="absolute -left-[1.4rem] top-1 grid h-3 w-3 place-items-center rounded-full bg-amber-500 ring-4 ring-white" />
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium text-ink">
                        {expenseCategoryLabel[item.data.category] ??
                          item.data.category}
                        <span className="font-normal text-ink-muted">
                          {" "}
                          · {item.data.description}
                        </span>
                      </p>
                      <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
                        − {formatCurrency(item.data.amount)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-ink-muted">
                      {formatDate(item.data.date)} · Pengeluaran
                    </p>
                  </li>
                ),
              )}
            </ol>
          ) : (
            <p className="text-sm text-ink-muted">
              Belum ada aktivitas tercatat.
            </p>
          )}
        </Section>

        {/* Expenses Summary */}
        <Section
          icon={FiDollarSign}
          title="Ringkasan Biaya"
          hint="Total pendapatan, total biaya operasional, dan rinciannya per kategori."
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-leaf-50 px-4 py-3">
              <p className="text-xs text-leaf-700">Pendapatan</p>
              <p className="mt-0.5 font-display text-lg font-semibold text-leaf-700">
                {formatCurrency(revenueTotal)}
              </p>
            </div>
            <div className="rounded-xl bg-tulus-50 px-4 py-3">
              <p className="text-xs text-tulus-700">Total Biaya</p>
              <p className="mt-0.5 font-display text-lg font-semibold text-tulus-700">
                {formatCurrency(expenseTotal)}
              </p>
            </div>
          </div>
          {expensesSorted.length ? (
            <ul className="mt-4 space-y-2">
              {expensesSorted.map((e) => (
                <li
                  key={e.id}
                  className="flex items-start justify-between gap-3 text-sm"
                >
                  <span className="text-ink-muted">
                    <span className="font-medium text-ink">
                      {expenseCategoryLabel[e.category] ?? e.category}
                    </span>
                  </span>
                  <span className="whitespace-nowrap font-medium text-ink">
                    {formatCurrency(e.amount)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-ink-muted">
              Belum ada biaya tercatat.
            </p>
          )}
        </Section>

        {/* Estimasi Laba/Rugi */}
        <Section
          icon={FiTrendingUp}
          title="Estimasi Laba/Rugi"
          hint="Estimasi laba operasional (pendapatan - biaya) plus dampak jadwal panen terhadap biaya sewa lahan."
        >
          <dl className="grid grid-cols-2 gap-3">
            <InfoRow
              label="Total Pendapatan"
              value={formatCurrency(revenueTotal)}
            />
            <InfoRow label="Total Biaya" value={formatCurrency(expenseTotal)} />
          </dl>
          <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
            <span className="text-sm font-medium text-ink-muted">
              Laba Operasional (Pendapatan − Biaya)
            </span>
            <span
              className={`font-semibold ${
                operationalProfit >= 0 ? "text-leaf-700" : "text-red-600"
              }`}
            >
              {formatCurrency(operationalProfit)}
            </span>
          </div>

          {field.ownership === "rental" ? (
            <div
              className={`mt-4 rounded-xl px-4 py-3 ${
                scheduleImpact.category === "telat" ? "bg-red-50" : "bg-leaf-50"
              }`}
            >
              <p className="flex items-center gap-2 text-sm font-medium text-ink">
                <FiHome size={14} className="text-tulus-600" />
                Lahan Sewa · {scheduleImpact.label}
              </p>
              <p className="mt-1 text-sm text-ink-muted">
                {scheduleImpact.detail}
              </p>
              {scheduleImpact.amount > 0 ? (
                <p className="mt-2 text-sm font-semibold text-red-600">
                  Estimasi kerugian sewa:{" "}
                  {formatCurrency(scheduleImpact.amount)}
                  <span className="ml-1 font-normal text-ink-muted">
                    ({formatCurrency(Math.round(scheduleImpact.dailyRent))}/hari
                    × {scheduleImpact.overdueDays} hari)
                  </span>
                </p>
              ) : scheduleImpact.savingAmount > 0 ? (
                <p className="mt-2 text-sm font-semibold text-leaf-700">
                  Estimasi keuntungan sewa: +
                  {formatCurrency(scheduleImpact.savingAmount)}
                  <span className="ml-1 font-normal text-ink-muted">
                    ({formatCurrency(Math.round(scheduleImpact.dailyRent))}/hari
                    × {scheduleImpact.fasterDays} hari lebih cepat — masa sewa
                    lebih singkat)
                  </span>
                </p>
              ) : (
                <p className="mt-2 text-sm font-medium text-leaf-700">
                  Tidak ada selisih biaya sewa untuk periode ini.
                </p>
              )}
            </div>
          ) : operationalProfit < 0 ? (
            <div className="mt-4 rounded-xl bg-red-50 px-4 py-3">
              <p className="flex items-center gap-2 text-sm font-medium text-red-700">
                <FiInfo size={14} />
                Lahan milik sendiri — periode ini merugi
              </p>
              <p className="mt-1 text-sm text-ink-muted">
                Pendapatan ({formatCurrency(revenueTotal)}) lebih kecil dari
                total biaya ({formatCurrency(expenseTotal)}).
                {catEntries.length
                  ? ` Biaya terbesar: ${catEntries[0][0]} (${formatCurrency(catEntries[0][1])}) — mis. harga pupuk/tebang naik sementara harga jual tebu turun.`
                  : ""}
              </p>
            </div>
          ) : (
            <div className="mt-4 rounded-xl bg-leaf-50 px-4 py-3">
              <p className="text-sm font-medium text-leaf-700">
                Lahan milik sendiri — periode ini untung, tanpa beban sewa.
              </p>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between rounded-xl bg-tulus-50 px-4 py-3">
            <span className="text-sm font-medium text-tulus-700">
              Estimasi Laba Bersih
            </span>
            <span
              className={`font-display text-lg font-semibold ${
                netProfit >= 0 ? "text-leaf-700" : "text-red-600"
              }`}
            >
              {formatCurrency(netProfit)}
            </span>
          </div>
          {field.ownership === "rental" && scheduleImpact.amount > 0 ? (
            <p className="mt-2 text-xs text-ink-muted">
              Catatan: estimasi laba bersih ini belum memperhitungkan estimasi
              kerugian sewa {formatCurrency(scheduleImpact.amount)} akibat
              overdue {humanDuration(scheduleImpact.overdueDays)} (ditampilkan
              terpisah di atas).
            </p>
          ) : field.ownership === "rental" &&
            scheduleImpact.savingAmount > 0 ? (
            <p className="mt-2 text-xs text-ink-muted">
              Catatan: estimasi laba bersih ini belum memperhitungkan estimasi
              keuntungan sewa {formatCurrency(scheduleImpact.savingAmount)}{" "}
              karena panen lebih cepat{" "}
              {humanDuration(scheduleImpact.fasterDays)} (ditampilkan terpisah
              di atas).
            </p>
          ) : null}
        </Section>

        {/* Gallery */}
        <Section
          icon={FiImage}
          title="Galeri Dokumentasi"
          hint="Foto perkembangan tanaman dari fase ke fase."
        >
          {galleryItems.length ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {galleryItems.map((g) => (
                <figure
                  key={g.id}
                  className="overflow-hidden rounded-xl border border-slate-200"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={normalizeImageUrl(g.imageUrl)}
                      alt={g.title}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <figcaption className="px-2.5 py-2">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-tulus-600">
                      {g.stage}
                    </p>
                    <p className="truncate text-xs text-ink">{g.title}</p>
                  </figcaption>
                </figure>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-muted">Belum ada dokumentasi.</p>
          )}
        </Section>

        {/* Decision Log */}
        <Section
          icon={FiGitBranch}
          title="Catatan Keputusan"
          hint="Keputusan operasional penting beserta konteks dan alasannya."
        >
          {seasonDecisions.length ? (
            <ul className="space-y-3">
              {seasonDecisions.map((d) => (
                <li
                  key={d.id}
                  className="rounded-xl border border-slate-200 px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-ink">{d.title}</p>
                    <span className="text-xs text-ink-muted">
                      {formatDate(d.date)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-ink-muted">{d.decision}</p>
                  {d.context ? (
                    <p className="mt-2 text-xs text-ink-muted">
                      <span className="font-semibold text-ink-soft">
                        Konteks:{" "}
                      </span>
                      {d.context}
                    </p>
                  ) : null}
                  {d.rationale ? (
                    <p className="mt-1 text-xs text-ink-muted">
                      <span className="font-semibold text-ink-soft">
                        Alasan:{" "}
                      </span>
                      {d.rationale}
                    </p>
                  ) : null}
                  {d.outcome ? (
                    <p className="mt-1 text-xs text-ink-muted">
                      <span className="font-semibold text-ink-soft">
                        Hasil:{" "}
                      </span>
                      {d.outcome}
                    </p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-600">
                      Dampak: {impactLabel[d.impact] ?? d.impact}
                    </span>
                    <span className="text-ink-muted">oleh {d.decidedBy}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-muted">
              Belum ada keputusan tercatat.
            </p>
          )}
        </Section>

        {/* Field Practices */}
        <Section
          icon={FiBookOpen}
          title="Praktik Lapangan"
          hint="Standar & cara kerja (SOP) yang diterapkan pada lahan ini."
        >
          {seasonPractices.length ? (
            <ul className="space-y-3">
              {seasonPractices.map((p) => (
                <li
                  key={p.id}
                  className="rounded-xl border border-slate-200 px-4 py-3"
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-tulus-600">
                    {p.category}
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-ink">
                    {p.title}
                  </p>
                  <p className="mt-1 text-sm text-ink-muted">{p.description}</p>
                  {p.steps && p.steps.length ? (
                    <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-ink-muted">
                      {p.steps.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-muted">
              Belum ada praktik tercatat.
            </p>
          )}
        </Section>
      </div>
    </>
  );
}
