import { FiCalendar } from "react-icons/fi";

export type Period = number | "all";

// Pemilih periode untuk halaman admin: satu musim (tahun) atau seluruh data.
export function PeriodFilter({
  value,
  onChange,
  years,
}: {
  value: Period;
  onChange: (p: Period) => void;
  years: number[];
}) {
  return (
    <label className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm">
      <FiCalendar size={14} className="text-tulus-600" />
      <span className="text-xs font-medium text-slate-500">Periode</span>
      <select
        value={String(value)}
        onChange={(e) =>
          onChange(e.target.value === "all" ? "all" : Number(e.target.value))
        }
        aria-label="Pilih periode musim"
        className="cursor-pointer bg-transparent pr-1 text-sm font-semibold text-tulus-700 outline-none"
      >
        <option value="all">Semua Musim</option>
        {years.map((y) => (
          <option key={y} value={y}>
            Musim {y}
          </option>
        ))}
      </select>
    </label>
  );
}
