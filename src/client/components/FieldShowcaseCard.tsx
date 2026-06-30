import { FiMapPin, FiMaximize2 } from "react-icons/fi";
import type { Field, Season } from "../../types";
import { fieldStatusMeta } from "../constants/fieldMeta";
import { haFromM2 } from "../../data";
import { formatNumber } from "../../utils/format";
import { growthProgress } from "../../utils/harvest";
import { WeatherBadge } from "./WeatherBadge";

const progressStyle = (pct: number) => ({
  width: `${Math.min(100, Math.max(0, pct))}%`,
});

export function FieldShowcaseCard({
  field,
  season,
  onSelect,
}: {
  field: Field;
  season: Season;
  onSelect: () => void;
}) {
  const meta = fieldStatusMeta[season.status];
  const isLive = season.status === "active";
  // Progress berbasis tanggal (sinkron dengan detail modal), bukan angka manual.
  const progressPct = growthProgress(season);
  return (
    <button
      type="button"
      onClick={onSelect}
      className="group flex h-full w-full flex-col rounded-2xl border border-slate-200 bg-white p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:border-tulus-200 hover:shadow-[0_22px_45px_-28px_rgba(16,35,66,0.5)] focus:outline-none focus-visible:ring-2 focus-visible:ring-tulus-600/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-xl font-medium text-ink">
            {field.name}
          </h3>
          <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-ink-muted">
            <FiMapPin size={13} /> {field.location}
          </p>
        </div>
        {/* Cuaca hari ini di samping nama & lokasi lahan */}
        <WeatherBadge bmkgCode={field.bmkgCode} seed={field.location} />
      </div>

      <div className="mt-3">
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
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-ink-muted">Komoditas</dt>
          <dd className="mt-0.5 font-medium text-ink">{season.crop}</dd>
        </div>
        <div>
          <dt className="text-ink-muted">Luas</dt>
          <dd className="mt-0.5 font-medium text-ink">
            {formatNumber(haFromM2(field.areaM2))} ha
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-ink-muted">Kondisi Tanah</dt>
          <dd className="mt-0.5 font-medium text-ink">{field.soilType}</dd>
        </div>
      </dl>

      <div className="mt-auto pt-6">
        <div className="flex items-center justify-between gap-3 text-xs text-ink-muted">
          <span className="min-w-0 flex-1 truncate">
            Progress · {season.label}
          </span>
          <span
            className={`shrink-0 font-semibold ${
              progressPct > 100 ? "text-red-600" : "text-tulus-700"
            }`}
          >
            {formatNumber(progressPct)}%
          </span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all ${
              progressPct > 100 ? "bg-red-500" : "bg-tulus-600"
            }`}
            style={progressStyle(progressPct)}
          />
        </div>
        <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-tulus-700 opacity-0 transition group-hover:opacity-100">
          <FiMaximize2 size={12} /> Klik untuk lihat detail
        </span>
      </div>
    </button>
  );
}
