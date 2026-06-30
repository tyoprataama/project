import { useEffect, useState } from "react";

// =====================================================
// useWeather — cuaca "hari ini" untuk kartu lahan.
//
// Sumber utama: API publik BMKG (prakiraan cuaca per desa / adm4).
//   https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=<kode>
// Jika kode tidak tersedia, jaringan gagal, atau respons tidak terbaca
// (mis. pembatasan CORS saat di GitHub Pages), kartu otomatis memakai
// ESTIMASI lokal yang deterministik sehingga selalu "hidup".
// =====================================================

export type WeatherKind = "cerah" | "berawan" | "hujan";

export interface WeatherInfo {
  kind: WeatherKind;
  tempC: number;
  label: string;
  loading: boolean;
  source: "bmkg" | "estimasi";
}

const LABEL: Record<WeatherKind, string> = {
  cerah: "Cerah",
  berawan: "Berawan",
  hujan: "Hujan",
};

// Pemetaan kode cuaca BMKG ke 3 kategori sederhana.
function kindFromBmkgCode(code: number): WeatherKind {
  if (code >= 60) return "hujan"; // hujan ringan/sedang/lebat, badai
  if (code >= 1) return "berawan"; // berawan / kabut
  return "cerah"; // 0 = cerah
}

function kindFromDesc(desc: string): WeatherKind {
  const d = desc.toLowerCase();
  if (d.includes("hujan") || d.includes("petir")) return "hujan";
  if (d.includes("berawan") || d.includes("awan") || d.includes("kabut"))
    return "berawan";
  return "cerah";
}

// Estimasi deterministik berdasarkan seed + tanggal hari ini.
function estimate(seed: string): { kind: WeatherKind; tempC: number } {
  const today = new Date();
  const key = `${seed}-${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  let h = 0;
  for (let i = 0; i < key.length; i++) {
    h = (h * 31 + key.charCodeAt(i)) >>> 0;
  }
  const kinds: WeatherKind[] = ["cerah", "berawan", "hujan"];
  const kind = kinds[h % 3];
  const tempC = 26 + (h % 7); // 26–32°C, khas dataran Kediri
  return { kind, tempC };
}

interface UseWeatherOptions {
  bmkgCode?: string;
  seed: string;
}

export function useWeather({ bmkgCode, seed }: UseWeatherOptions): WeatherInfo {
  const [info, setInfo] = useState<WeatherInfo>(() => {
    const est = estimate(seed);
    return {
      kind: est.kind,
      tempC: est.tempC,
      label: LABEL[est.kind],
      loading: Boolean(bmkgCode),
      source: "estimasi",
    };
  });

  useEffect(() => {
    let cancelled = false;

    // Selalu siapkan estimasi terlebih dulu.
    const est = estimate(seed);
    setInfo({
      kind: est.kind,
      tempC: est.tempC,
      label: LABEL[est.kind],
      loading: Boolean(bmkgCode),
      source: "estimasi",
    });

    if (!bmkgCode) return;

    const url =
      "https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=" + bmkgCode;

    fetch(url)
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((json) => {
        if (cancelled) return;
        const current = pickCurrentForecast(json);
        if (!current) {
          setInfo((prev) => ({ ...prev, loading: false }));
          return;
        }
        const kind =
          typeof current.weather === "number"
            ? kindFromBmkgCode(current.weather)
            : kindFromDesc(String(current.weather_desc ?? ""));
        const tempC =
          typeof current.t === "number" ? Math.round(current.t) : est.tempC;
        setInfo({
          kind,
          tempC,
          label: LABEL[kind],
          loading: false,
          source: "bmkg",
        });
      })
      .catch(() => {
        if (!cancelled) setInfo((prev) => ({ ...prev, loading: false }));
      });

    return () => {
      cancelled = true;
    };
  }, [bmkgCode, seed]);

  return info;
}

// Respons BMKG: { data: [ { cuaca: [ [ {datetime,t,weather,weather_desc}... ] ] } ] }
interface BmkgForecast {
  datetime?: string;
  local_datetime?: string;
  t?: number;
  weather?: number;
  weather_desc?: string;
}

function pickCurrentForecast(json: unknown): BmkgForecast | null {
  try {
    const data = (json as { data?: unknown }).data;
    const first = Array.isArray(data) ? (data[0] as { cuaca?: unknown }) : null;
    const cuaca = first?.cuaca;
    if (!Array.isArray(cuaca)) return null;
    const flat: BmkgForecast[] = cuaca
      .flat()
      .filter((x): x is BmkgForecast => Boolean(x) && typeof x === "object");
    if (!flat.length) return null;
    const now = Date.now();
    let best = flat[0];
    let bestDiff = Infinity;
    for (const f of flat) {
      const ts = Date.parse(f.local_datetime ?? f.datetime ?? "");
      if (Number.isNaN(ts)) continue;
      const diff = Math.abs(ts - now);
      if (diff < bestDiff) {
        bestDiff = diff;
        best = f;
      }
    }
    return best;
  } catch {
    return null;
  }
}
