import { FiCalendar } from "react-icons/fi";
import { useSeason } from "../../context/SeasonContext";

// Pemilih musim tanam global untuk situs publik.
// Mengubah tahun otomatis memperbarui seluruh section yang memakai useSeason().
export function SeasonSelector({
  compact = false,
  onSelect,
}: {
  compact?: boolean;
  onSelect?: () => void;
}) {
  const { year, setYear, years } = useSeason();

  return (
    <label
      className={`inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm ${
        compact ? "" : "shadow-sm"
      }`}
    >
      <FiCalendar size={14} className="text-tulus-600" />
      <span className="text-xs font-medium text-ink-muted">Musim</span>
      <select
        value={year}
        onChange={(e) => {
          setYear(Number(e.target.value));
          onSelect?.();
        }}
        aria-label="Pilih musim tanam"
        className="cursor-pointer bg-transparent pr-1 text-sm font-semibold text-tulus-700 outline-none"
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </label>
  );
}
