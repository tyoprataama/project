import { FiSun, FiCloud, FiCloudRain } from "react-icons/fi";
import { useWeather } from "../hooks/useWeather";
import type { WeatherKind } from "../hooks/useWeather";

const ICONS: Record<WeatherKind, typeof FiSun> = {
  cerah: FiSun,
  berawan: FiCloud,
  hujan: FiCloudRain,
};

const TONE: Record<WeatherKind, string> = {
  cerah: "bg-amber-50 text-amber-700 ring-amber-600/20",
  berawan: "bg-slate-100 text-slate-600 ring-slate-500/20",
  hujan: "bg-blue-50 text-blue-700 ring-blue-600/20",
};

// Badge cuaca "hari ini" untuk membuat kartu lahan terasa hidup.
// Menampilkan ikon (cerah/berawan/hujan) + suhu. Sumber BMKG bila tersedia,
// jika tidak memakai estimasi lokal (lihat useWeather).
export function WeatherBadge({
  bmkgCode,
  seed,
  className = "",
}: {
  bmkgCode?: string;
  seed: string;
  className?: string;
}) {
  const w = useWeather({ bmkgCode, seed });
  const Icon = ICONS[w.kind];
  const sourceLabel = w.source === "bmkg" ? "data BMKG" : "estimasi lokal";
  return (
    <span
      title={`Cuaca hari ini: ${w.label} · ${w.tempC}°C (${sourceLabel})`}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${TONE[w.kind]} ${className}`}
    >
      <Icon size={13} />
      <span>{w.tempC}°C</span>
      <span className="hidden sm:inline">· {w.label}</span>
    </span>
  );
}
