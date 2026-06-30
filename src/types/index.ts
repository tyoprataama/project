// =====================================================
// Tipe data domain untuk Field Management System
//
// Catatan arsitektur:
// - `Field` hanya menyimpan informasi PERMANEN (tidak berubah tiap tahun).
// - `Season` (musim tanam) menyimpan data yang berganti tiap periode.
// - Seluruh record operasional terhubung ke sebuah Season lewat `seasonId`.
//   `fieldId` disimpan sebagai denormalisasi agar query per-lahan mudah.
// - SEMUA data ini bersumber & dapat diubah dari sisi admin (single source
//   of truth). Lihat src/data/index.ts.
// =====================================================

export type FieldStatus = "active" | "preparing" | "harvested" | "fallow";

export type Ownership = "owned" | "rental";

/** Informasi permanen sebuah lahan. Tidak diduplikasi tiap tahun. */
export interface Field {
  id: string;
  name: string;
  /** Luas lahan dalam meter persegi (m²). */
  areaM2: number;
  ownership: Ownership;
  /** Biaya sewa per musim (opsional, hanya untuk lahan sewa). */
  rentalCost?: number;
  notes: string;
  location: string;
  /** Deskripsi kondisi tanah dengan bahasa awam (mis. "Tanah liat keras"). */
  soilType: string;
  /** Kode wilayah BMKG (adm4) untuk prakiraan cuaca. Opsional. */
  bmkgCode?: string;
}

/** Satu musim tanam pada sebuah lahan. */
export interface Season {
  id: string;
  fieldId: string;
  /** Tahun musim, mis. 2025, 2026. */
  year: number;
  /** Label tampil, mis. "Musim Tanam 2026". */
  label: string;
  crop: string;
  status: FieldStatus;
  /** Tanggal tanam. */
  plantingDate: string;
  /** Perkiraan panen = tanggal tanam + 1 tahun (bisa diubah admin). */
  harvestDate: string;
  /** Tanggal aktualisasi panen (diisi saat sudah dipanen). */
  actualHarvestDate?: string;
  /** Alasan / catatan deviasi panen (mis. "dipercepat mengejar giling"). */
  harvestNote?: string;
  /** Progress pertumbuhan 0-100. */
  progress: number;
  notes: string;
}

export type ActivityType =
  | "planting"
  | "fertilizing"
  | "irrigation"
  | "pest-control"
  | "harvest"
  | "maintenance"
  | "inspection";

export type ActivityStatus = "completed" | "in-progress" | "planned";

export interface Activity {
  id: string;
  seasonId: string;
  fieldId: string;
  date: string;
  type: ActivityType;
  title: string;
  description: string;
  performedBy: string;
  cost?: number;
  status: ActivityStatus;
}

export type ExpenseCategory =
  | "seeds"
  | "fertilizer"
  | "labor"
  | "equipment"
  | "irrigation"
  | "pesticide"
  | "logistics"
  | "rent"
  | "tax"
  | "other";

export interface Expense {
  id: string;
  seasonId: string;
  fieldId: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
}

export interface Revenue {
  id: string;
  seasonId: string;
  fieldId: string;
  date: string;
  product: string;
  /** Berat terjual (kg). Opsional — penjualan tebu kadang per luas lahan. */
  quantityKg?: number;
  /** Harga per kg (opsional, hanya bila berat diketahui). */
  pricePerKg?: number;
  /** Total pendapatan (Rp) — selalu diisi langsung. */
  amount: number;
}

export interface GalleryItem {
  id: string;
  seasonId: string;
  fieldId: string;
  date: string;
  title: string;
  stage: string;
  imageUrl: string;
  notes: string;
}

export interface Report {
  id: string;
  seasonId: string;
  fieldId: string;
  period: string;
  yieldTon: number;
  targetTon: number;
  summary: string;
}

export interface Practice {
  id: string;
  seasonId: string;
  fieldId: string;
  category: string;
  title: string;
  description: string;
  steps: string[];
}

export type DecisionImpact = "high" | "medium" | "low";

export interface Decision {
  id: string;
  date: string;
  seasonId?: string;
  fieldId?: string;
  title: string;
  context: string;
  decision: string;
  rationale: string;
  impact: DecisionImpact;
  outcome?: string;
  decidedBy: string;
}

export type PestRisk = "low" | "medium" | "high";

export interface CropMonitor {
  id: string;
  seasonId: string;
  fieldId: string;
  week: number;
  date: string;
  heightCm: number;
  /** Skor kesehatan tanaman 0-100. */
  healthScore: number;
  pestRisk: PestRisk;
  notes: string;
}
