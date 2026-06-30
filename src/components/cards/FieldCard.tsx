import type { Field } from "../../types";
import { FiMapPin, FiCalendar } from "react-icons/fi";
import { fieldStatusMeta } from "../../client/constants/fieldMeta";
import { getLatestSeason, haFromM2 } from "../../data";
import { formatDate } from "../../utils/format";

const progressStyle = (pct: number) => ({ width: `${pct}%` });

export function FieldCard({
  field,
  onClick,
}: {
  field: Field;
  onClick?: () => void;
}) {
  const season = getLatestSeason(field.id);
  const meta = season ? fieldStatusMeta[season.status] : null;

  return (
    <button
      onClick={onClick}
      className="w-full rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-tulus-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-lg font-semibold text-tulus-900">
            {field.name}
          </h3>
          <p className="mt-1 flex items-center gap-1 text-sm text-ink-muted">
            <FiMapPin size={13} /> {field.location}
          </p>
        </div>
        {meta ? (
          <span
            className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${meta.className}`}
          >
            {meta.label}
          </span>
        ) : null}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-ink-muted">Komoditas</p>
          <p className="mt-0.5 font-medium text-ink">{season?.crop ?? "—"}</p>
        </div>
        <div>
          <p className="text-ink-muted">Luas</p>
          <p className="mt-0.5 font-medium text-ink">
            {haFromM2(field.areaM2).toFixed(1)} ha
          </p>
        </div>
      </div>

      {season ? (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span>Progress musim {season.year}</span>
            <span className="font-medium text-ink">{season.progress}%</span>
          </div>
          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-leaf-500"
              style={progressStyle(season.progress)}
            />
          </div>
          <p className="mt-3 flex items-center gap-1 text-xs text-ink-muted">
            <FiCalendar size={12} /> Panen: {formatDate(season.harvestDate)}
          </p>
        </div>
      ) : null}
    </button>
  );
}
