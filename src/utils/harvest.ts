// =====================================================
// Utilitas status & deviasi panen tebu.
//
// Siklus tebu ≈ 12 bulan: PERKIRAAN panen (harvestDate) default = tanggal
// tanam + 1 tahun (bisa di-custom admin). Tanggal AKTUALISASI panen
// (actualHarvestDate) diisi saat sudah dipanen. Selisih aktualisasi −
// perkiraan menentukan apakah panen lebih cepat, tepat, atau telat (overdue).
// =====================================================

const MS_PER_DAY = 86_400_000;

// Toleransi hari agar selisih kecil tetap dianggap "tepat target".
const TOLERANCE_DAYS = 3;

export type HarvestState = "harvested" | "overdue" | "upcoming";

export interface HarvestInfo {
  state: HarvestState;
  /** Selisih hari (hari ini − perkiraan). Positif = lewat perkiraan. */
  diffDays: number;
  label: string;
  detail: string;
}

/** Perkiraan panen default = tanggal tanam + 1 tahun (format YYYY-MM-DD). */
export function defaultHarvestDate(plantingISO: string): string {
  if (!plantingISO) return "";
  const d = new Date(plantingISO);
  if (Number.isNaN(d.getTime())) return "";
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}

/** Format durasi ramah-baca: "18 hari" atau "2 bln 5 hari". */
export function humanDuration(days: number): string {
  const abs = Math.abs(Math.round(days));
  if (abs < 31) return `${abs} hari`;
  const months = Math.floor(abs / 30);
  const rem = abs % 30;
  return rem > 0 ? `${months} bln ${rem} hari` : `${months} bln`;
}

/**
 * Status panen untuk musim yang BELUM dipanen (dipakai badge overdue di Field
 * Management & hitung overdue di Overview). Untuk musim yang sudah dipanen,
 * gunakan `deviationInfo`.
 */
export function harvestInfo(
  season: { status: string; harvestDate: string },
  now: Date = new Date(),
): HarvestInfo {
  if (season.status === "harvested") {
    return {
      state: "harvested",
      diffDays: 0,
      label: "Panen selesai",
      detail: "Tebang & angkut sudah selesai.",
    };
  }

  const target = new Date(season.harvestDate);
  if (Number.isNaN(target.getTime())) {
    return {
      state: "upcoming",
      diffDays: 0,
      label: "Menunggu jadwal",
      detail: "Perkiraan panen belum diatur.",
    };
  }

  const diffDays = Math.round((now.getTime() - target.getTime()) / MS_PER_DAY);
  if (diffDays > 0) {
    return {
      state: "overdue",
      diffDays,
      label: "Overdue",
      detail: `Terlambat ${humanDuration(diffDays)} dari perkiraan panen.`,
    };
  }
  return {
    state: "upcoming",
    diffDays,
    label: "Menuju panen",
    detail: `${humanDuration(diffDays)} lagi menuju perkiraan panen.`,
  };
}

export type DeviationCategory = "cepat" | "sesuai" | "telat" | "berjalan";

export interface DeviationInfo {
  category: DeviationCategory;
  /** Selisih hari. Positif = telat, negatif = lebih cepat / belum jatuh tempo. */
  days: number;
  label: string;
  detail: string;
}

/**
 * Deviasi panen berdasarkan tanggal AKTUALISASI vs PERKIRAAN panen.
 * - harvested: bandingkan actualHarvestDate dengan harvestDate (perkiraan).
 * - belum panen: bandingkan hari ini dengan harvestDate (perkiraan).
 */
export function deviationInfo(
  season: {
    status: string;
    harvestDate: string;
    actualHarvestDate?: string;
  },
  now: Date = new Date(),
): DeviationInfo {
  const estimate = new Date(season.harvestDate).getTime();

  if (season.status === "harvested") {
    const actual = new Date(
      season.actualHarvestDate || season.harvestDate,
    ).getTime();
    if (Number.isNaN(actual) || Number.isNaN(estimate)) {
      return {
        category: "sesuai",
        days: 0,
        label: "Tepat target",
        detail: "Panen selesai.",
      };
    }
    const days = Math.round((actual - estimate) / MS_PER_DAY);
    if (days > TOLERANCE_DAYS) {
      return {
        category: "telat",
        days,
        label: "Telat / overdue",
        detail: `Panen telat ${humanDuration(days)} dari perkiraan.`,
      };
    }
    if (days < -TOLERANCE_DAYS) {
      return {
        category: "cepat",
        days,
        label: "Panen cepat",
        detail: `Panen lebih cepat ${humanDuration(days)} dari perkiraan.`,
      };
    }
    return {
      category: "sesuai",
      days,
      label: "Tepat target",
      detail: "Panen tepat sesuai perkiraan.",
    };
  }

  if (Number.isNaN(estimate)) {
    return {
      category: "berjalan",
      days: 0,
      label: "Sedang berjalan",
      detail: "Perkiraan panen belum diatur.",
    };
  }

  const days = Math.round((now.getTime() - estimate) / MS_PER_DAY);
  if (days > 0) {
    return {
      category: "telat",
      days,
      label: "Telat / overdue",
      detail: `Belum panen, lewat ${humanDuration(days)} dari perkiraan.`,
    };
  }
  return {
    category: "berjalan",
    days,
    label: "Sedang berjalan",
    detail: `${humanDuration(days)} lagi menuju perkiraan panen.`,
  };
}

// Lama siklus tebu acuan (hari) bila tanggal tanam/perkiraan tidak valid.
const CYCLE_DAYS = 365;

/**
 * Lama PERTUMBUHAN terencana (hari) = perkiraan panen − tanggal tanam.
 * Dipakai sebagai penyebut prorata: progress pertumbuhan & biaya sewa harian.
 */
export function plannedGrowthDays(season: {
  plantingDate: string;
  harvestDate: string;
}): number {
  const plant = new Date(season.plantingDate).getTime();
  const est = new Date(season.harvestDate).getTime();
  if (Number.isNaN(plant) || Number.isNaN(est)) return CYCLE_DAYS;
  const days = Math.round((est - plant) / MS_PER_DAY);
  return days > 0 ? days : CYCLE_DAYS;
}

// =====================================================
// Progress pertumbuhan relatif terhadap perkiraan panen.
// Basis 100% pada perkiraan; selisih aktualisasi DIPRORATA ke lama siklus
// tanam (bukan -1% per hari). Contoh: panen 4 hari lebih cepat pada siklus
// 365 hari -> 100 - (4/365 x 100) = 98,9%. Overdue -> > 100%.
// Musim yang belum panen memakai progress yang diisi admin.
// =====================================================
export function growthProgress(
  season: {
    status: string;
    plantingDate: string;
    harvestDate: string;
    actualHarvestDate?: string;
    progress: number;
  },
  now: Date = new Date(),
): number {
  // Progress berbasis TANGGAL untuk SEMUA status (bukan angka manual admin):
  // - harvested: deviasi aktualisasi vs perkiraan panen.
  // - belum panen: posisi hari ini relatif terhadap perkiraan panen
  //   (tepat di perkiraan = 100%, sudah lewat / overdue = > 100%).
  const dev = deviationInfo(season, now);
  const planned = plannedGrowthDays(season);
  const pct = 100 + (dev.days / planned) * 100;
  // Satu angka di belakang koma agar lebih presisi (mis. 98,9%).
  return Math.max(0, Math.round(pct * 10) / 10);
}

export interface ScheduleImpact {
  /** Berlaku hanya untuk lahan sewa yang punya biaya sewa. */
  applicable: boolean;
  category: DeviationCategory;
  /** Hari overdue (> 0 hanya jika telat / overdue). */
  overdueDays: number;
  /** Jumlah hari panen lebih cepat dari perkiraan (> 0 hanya jika cepat). */
  fasterDays: number;
  /** Estimasi tambahan biaya sewa karena overdue (>= 0, kerugian). */
  amount: number;
  /** Estimasi penghematan sewa karena panen lebih cepat (>= 0, keuntungan). */
  savingAmount: number;
  /** Estimasi sewa harian (biaya sewa / lama siklus tanam). */
  dailyRent: number;
  label: string;
  detail: string;
}

/**
 * Estimasi dampak jadwal panen terhadap biaya sewa.
 * - Lahan milik sendiri -> tidak berlaku (applicable false).
 * - Lahan sewa & OVERDUE -> masa sewa molor, ada tambahan biaya sewa =
 *   (biaya sewa / lama siklus) x hari overdue (KERUGIAN).
 * - Lahan sewa & LEBIH CEPAT -> masa sewa lebih singkat, ada estimasi
 *   penghematan sewa = (biaya sewa / lama siklus) x hari lebih cepat (KEUNTUNGAN).
 * - Lahan sewa & tepat -> tidak ada selisih biaya sewa.
 */
export function rentalScheduleImpact(
  field: { ownership: string; rentalCost?: number },
  season: {
    status: string;
    plantingDate: string;
    harvestDate: string;
    actualHarvestDate?: string;
  },
  now: Date = new Date(),
): ScheduleImpact {
  const dev = deviationInfo(season, now);

  if (field.ownership !== "rental" || !field.rentalCost) {
    return {
      applicable: false,
      category: dev.category,
      overdueDays: 0,
      fasterDays: 0,
      amount: 0,
      savingAmount: 0,
      dailyRent: 0,
      label: "Lahan milik sendiri",
      detail: "Tidak ada beban sewa.",
    };
  }

  const dailyRent = field.rentalCost / plannedGrowthDays(season);

  if (dev.category === "telat") {
    const overdueDays = dev.days;
    return {
      applicable: true,
      category: "telat",
      overdueDays,
      fasterDays: 0,
      amount: Math.round(dailyRent * overdueDays),
      savingAmount: 0,
      dailyRent,
      label: `Overdue ${humanDuration(overdueDays)}`,
      detail: `Panen telat ${humanDuration(overdueDays)} dari perkiraan sehingga masa sewa molor.`,
    };
  }

  if (dev.category === "cepat") {
    const fasterDays = Math.abs(dev.days);
    return {
      applicable: true,
      category: "cepat",
      overdueDays: 0,
      fasterDays,
      amount: 0,
      savingAmount: Math.round(dailyRent * fasterDays),
      dailyRent,
      label: `Panen lebih cepat ${humanDuration(fasterDays)}`,
      detail: `Panen ${humanDuration(fasterDays)} lebih cepat dari perkiraan sehingga masa sewa lebih singkat.`,
    };
  }

  if (dev.category === "berjalan") {
    return {
      applicable: true,
      category: "berjalan",
      overdueDays: 0,
      fasterDays: 0,
      amount: 0,
      savingAmount: 0,
      dailyRent,
      label: "Musim berjalan",
      detail: "Belum panen. Dampak sewa dihitung saat aktualisasi panen.",
    };
  }

  return {
    applicable: true,
    category: "sesuai",
    overdueDays: 0,
    fasterDays: 0,
    amount: 0,
    savingAmount: 0,
    dailyRent,
    label: "Tepat panen",
    detail: "Panen sesuai perkiraan, tidak ada selisih biaya sewa.",
  };
}
