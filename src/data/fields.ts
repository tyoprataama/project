import type { Field } from "../types";

// Hanya informasi PERMANEN lahan. Data per-musim ada di seasons.ts
// Portofolio NYATA: 4 blok lahan (3 sewa + 1 milik sendiri) di sekitar Kediri.
// `bmkgCode` (adm4) dipakai untuk prakiraan cuaca. Lokasi & jenis tanah tiap
// lahan masih placeholder (belum tercantum di laporan) -> silakan dilengkapi.
const BETET_BMKG = "35.71.03.1006"; // Betet, Pesantren, Kota Kediri (adm4)

export const fields: Field[] = [
  {
    id: "F-01",
    name: "Lahan Sumber Rempi",
    areaM2: 2780,
    ownership: "rental",
    rentalCost: 7000000,
    notes:
      "Lahan sewa terluas. Sempat ditanami jagung dua periode sebelum beralih ke tebu.",
    location: "Kediri",
    soilType: "-",
    bmkgCode: BETET_BMKG,
  },
  {
    id: "F-02",
    name: "Lahan Sugeng",
    areaM2: 1390,
    ownership: "rental",
    rentalCost: 4000000,
    notes:
      "Lahan sewa tahunan, ditanami tebu. Sistem keprasan (tidak selalu beli benih).",
    location: "Kediri",
    soilType: "-",
    bmkgCode: BETET_BMKG,
  },
  {
    id: "F-03",
    name: "Lahan Atik",
    areaM2: 1390,
    ownership: "rental",
    rentalCost: 4000000,
    notes:
      "Lahan sewa, mulai ditanami tebu pertengahan 2025. Sedang berjalan menuju panen pertama.",
    location: "Kediri",
    soilType: "-",
    bmkgCode: BETET_BMKG,
  },
  {
    id: "F-04",
    name: "Lahan Gatut",
    areaM2: 1600,
    ownership: "owned",
    notes:
      "Lahan milik sendiri (tanpa biaya sewa). Margin paling sehat di antara seluruh lahan.",
    location: "Kediri",
    soilType: "-",
    bmkgCode: BETET_BMKG,
  },
];
