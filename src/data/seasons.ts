import type { Season } from "../types";

// Data musim tanam NYATA (sumber: Laporan Keuangan Pertanian).
// Konvensi:
// - "Laba Kotor" di laporan = TOTAL PENDAPATAN (lihat finance.ts -> revenues).
// - "Total Biaya" di laporan = total expenses musim tsb (lihat finance.ts).
// - Laba bersih = pendapatan - biaya, dihitung otomatis oleh aplikasi.
// - year = tahun "bucket" musim (dipakai filter & perbandingan antar tahun),
//   dipilih agar tiap lahan unik per tahun.
// - harvestDate = PERKIRAAN panen; actualHarvestDate = panen sebenarnya.
export const seasons: Season[] = [
  // ===== F-01 Sumber Rempi =====
  {
    id: "S-2023-01",
    fieldId: "F-01",
    year: 2023,
    label: "Jagung 2023/2024 (Periode 1)",
    crop: "Jagung",
    status: "harvested",
    plantingDate: "2023-10-18",
    harvestDate: "2024-01-24",
    actualHarvestDate: "2024-01-24",
    progress: 100,
    notes:
      "Periode jagung pertama. Untung: pendapatan Rp15,5 jt atas biaya Rp9 jt (di luar sewa tahunan).",
  },
  {
    id: "S-2024-01",
    fieldId: "F-01",
    year: 2024,
    label: "Jagung 2024 (Periode 2)",
    crop: "Jagung",
    status: "harvested",
    plantingDate: "2024-01-27",
    harvestDate: "2024-04-30",
    actualHarvestDate: "2024-04-30",
    harvestNote:
      "Harga jual jagung sedang anjlok saat panen sehingga periode ini merugi.",
    progress: 100,
    notes: "Rugi: pendapatan Rp5,5 jt lebih kecil dari biaya Rp9,33 jt.",
  },
  {
    id: "S-2025-01",
    fieldId: "F-01",
    year: 2025,
    label: "Tebu 2024/2025",
    crop: "Tebu",
    status: "harvested",
    plantingDate: "2024-05-20",
    harvestDate: "2025-05-20",
    actualHarvestDate: "2025-02-20",
    harvestNote:
      "Panen lebih cepat dari perkiraan 12 bulan; hasil tebu pertama sangat baik.",
    progress: 100,
    notes:
      "Untung besar: pendapatan Rp32 jt atas biaya Rp22,63 jt (termasuk sewa).",
  },
  {
    id: "S-2026-01",
    fieldId: "F-01",
    year: 2026,
    label: "Tebu 2025/2026",
    crop: "Tebu",
    status: "active",
    plantingDate: "2025-05-05",
    harvestDate: "2026-05-05",
    progress: 97,
    notes:
      "Keprasan tebu. Perkiraan panen 1 tahun setelah tanam (5 Mei 2026); rencana panen aktual 2-3 Juli 2026 sehingga overdue.",
  },

  // ===== F-02 Sugeng =====
  {
    id: "S-2024-02",
    fieldId: "F-02",
    year: 2024,
    label: "Tebu 2023/2024",
    crop: "Tebu",
    status: "harvested",
    plantingDate: "2023-06-05",
    harvestDate: "2024-06-05",
    actualHarvestDate: "2024-05-01",
    harvestNote:
      "Panen sedikit lebih cepat dari perkiraan. Angka laba kotor Rp10,5 jt (perlu dikonfirmasi ulang).",
    progress: 100,
    notes:
      "Rugi tipis: pendapatan Rp10,5 jt di bawah biaya Rp11,58 jt (termasuk sewa).",
  },
  {
    id: "S-2025-02",
    fieldId: "F-02",
    year: 2025,
    label: "Tebu 2024/2025 (Periode 2)",
    crop: "Tebu",
    status: "harvested",
    plantingDate: "2024-06-04",
    harvestDate: "2025-06-04",
    actualHarvestDate: "2025-07-03",
    harvestNote:
      "Panen 3 Juli 2025, sedikit melewati perkiraan 1 tahun (overdue ~1 bln).",
    progress: 100,
    notes:
      "Untung: pendapatan Rp14,75 jt atas biaya Rp9,75 jt (sesuai data akhir laporan).",
  },
  {
    id: "S-2026-02",
    fieldId: "F-02",
    year: 2026,
    label: "Tebu 2025/2026",
    crop: "Tebu",
    status: "active",
    plantingDate: "2025-05-05",
    harvestDate: "2026-05-05",
    progress: 97,
    notes:
      "Keprasan tebu berjalan. Rincian biaya belum lengkap; total mengikuti data akhir. Perkiraan panen 5 Mei 2026; rencana panen aktual 2-3 Juli 2026 sehingga overdue.",
  },

  // ===== F-03 Atik =====
  {
    id: "S-2026-03",
    fieldId: "F-03",
    year: 2026,
    label: "Tebu 2025/2026",
    crop: "Tebu",
    status: "active",
    plantingDate: "2025-08-13",
    harvestDate: "2026-08-13",
    progress: 94,
    notes:
      "Tanam tebu pertama (beli benih). Perkiraan panen 1 tahun setelah tanam (13 Agu 2026); rencana panen aktual 2-3 Juli 2026.",
  },

  // ===== F-04 Gatut (milik sendiri) =====
  {
    id: "S-2025-04",
    fieldId: "F-04",
    year: 2025,
    label: "Tebu 2024/2025",
    crop: "Tebu",
    status: "harvested",
    plantingDate: "2024-07-26",
    harvestDate: "2025-07-26",
    actualHarvestDate: "2025-07-03",
    harvestNote:
      "Panen tepat menjelang perkiraan; lahan milik sendiri tanpa beban sewa.",
    progress: 100,
    notes:
      "Untung sehat: pendapatan Rp14,75 jt atas biaya Rp7,56 jt, tanpa biaya sewa.",
  },
  {
    id: "S-2026-04",
    fieldId: "F-04",
    year: 2026,
    label: "Tebu 2025/2026",
    crop: "Tebu",
    status: "active",
    plantingDate: "2025-07-14",
    harvestDate: "2026-07-14",
    progress: 98,
    notes:
      "Keprasan tebu, lahan sendiri. Perkiraan panen 1 tahun setelah tanam (14 Jul 2026); rencana panen aktual 2-3 Juli 2026.",
  },
];
