export const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

export const formatCompactCurrency = (value: number): string => {
  // Singkat nilai besar (jt/M) untuk positif MAUPUN negatif agar tidak
  // meluber dari card. Tanda minus tetap ditampilkan di depan angka.
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000)
    return `Rp ${sign}${(abs / 1_000_000_000).toFixed(1)} M`;
  if (abs >= 1_000_000) return `Rp ${sign}${(abs / 1_000_000).toFixed(1)} jt`;
  if (abs >= 1_000) return `Rp ${sign}${(abs / 1_000).toFixed(0)} rb`;
  return `Rp ${sign}${formatNumber(abs)}`;
};

export const formatDate = (iso: string): string =>
  new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));

export const formatNumber = (value: number): string =>
  new Intl.NumberFormat("id-ID").format(value);
