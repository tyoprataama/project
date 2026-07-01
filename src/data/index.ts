import { useSyncExternalStore } from "react";
import type {
  Field,
  Season,
  Activity,
  Expense,
  Revenue,
  GalleryItem,
  Report,
  Practice,
  Decision,
  CropMonitor,
} from "../types";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

import { fields as seedFields } from "./fields";
import { seasons as seedSeasons } from "./seasons";
import { activities as seedActivities } from "./activities";
import { expenses as seedExpenses, revenues as seedRevenues } from "./finance";
import { gallery as seedGallery } from "./gallery";
import { reports as seedReports } from "./reports";
import { practices as seedPractices } from "./practices";
import { decisions as seedDecisions } from "./decisions";
import { cropMonitors as seedCropMonitors } from "./crops";

// =====================================================
// SINGLE SOURCE OF TRUTH
//
// Komponen membaca data ini secara SINKRON (selektor di bawah). Di balik
// layar ada dua mode:
//
//   * Mode Supabase (bila .env terisi): saat app dibuka, data ditarik
//     sekali dari Supabase lalu disimpan di memori. Setiap perubahan admin
//     diterapkan ke memori (UI instan) DAN dikirim ke Supabase
//     (write-through) sehingga tersinkron lintas perangkat.
//
//   * Mode demo (bila .env kosong): data berasal dari seed dan disimpan ke
//     localStorage — persis perilaku lama. Berguna untuk pengembangan UI
//     tanpa backend.
//
// Reaktivitas dipicu lewat hook `useDataVersion()`.
// =====================================================

interface DataState {
  fields: Field[];
  seasons: Season[];
  activities: Activity[];
  expenses: Expense[];
  revenues: Revenue[];
  gallery: GalleryItem[];
  reports: Report[];
  practices: Practice[];
  decisions: Decision[];
  cropMonitors: CropMonitor[];
}

type EntityKey = keyof DataState;

// Nama tabel di Supabase memakai prefix `fms_` agar tidak bentrok dengan tabel
// lain (portfolio/blog) yang berbagi project Supabase yang sama.
const TABLE: Record<EntityKey, string> = {
  fields: "fms_fields",
  seasons: "fms_seasons",
  activities: "fms_activities",
  expenses: "fms_expenses",
  revenues: "fms_revenues",
  gallery: "fms_gallery",
  reports: "fms_reports",
  practices: "fms_practices",
  decisions: "fms_decisions",
  cropMonitors: "fms_cropMonitors",
};

const STORAGE_KEY = "fms-data-v7";

const clone = <T>(value: T): T =>
  typeof structuredClone === "function"
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value));

const seedState = (): DataState =>
  clone({
    fields: seedFields,
    seasons: seedSeasons,
    activities: seedActivities,
    expenses: seedExpenses,
    revenues: seedRevenues,
    gallery: seedGallery,
    reports: seedReports,
    practices: seedPractices,
    decisions: seedDecisions,
    cropMonitors: seedCropMonitors,
  });

const emptyState = (): DataState => ({
  fields: [],
  seasons: [],
  activities: [],
  expenses: [],
  revenues: [],
  gallery: [],
  reports: [],
  practices: [],
  decisions: [],
  cropMonitors: [],
});

// Hanya dipakai pada mode demo (tanpa Supabase).
function loadInitial(): DataState {
  if (typeof window === "undefined") return seedState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<DataState>;
      // Gabungkan dengan seed agar field baru tidak hilang.
      return { ...seedState(), ...parsed } as DataState;
    }
  } catch {
    // abaikan, pakai seed
  }
  return seedState();
}

// Mode Supabase mulai kosong (diisi initData). Mode demo pakai seed/localStorage.
let state: DataState = isSupabaseConfigured ? emptyState() : loadInitial();

// ---- Live bindings (dipakai komponen yang mengimpor array langsung) ----
export let fields = state.fields;
export let seasons = state.seasons;
export let activities = state.activities;
export let expenses = state.expenses;
export let revenues = state.revenues;
export let gallery = state.gallery;
export let reports = state.reports;
export let practices = state.practices;
export let decisions = state.decisions;
export let cropMonitors = state.cropMonitors;

function syncBindings() {
  fields = state.fields;
  seasons = state.seasons;
  activities = state.activities;
  expenses = state.expenses;
  revenues = state.revenues;
  gallery = state.gallery;
  reports = state.reports;
  practices = state.practices;
  decisions = state.decisions;
  cropMonitors = state.cropMonitors;
}

// ---- Pub/sub untuk reaktivitas ----
const listeners = new Set<() => void>();
let version = 0;

function notify() {
  version += 1;
  listeners.forEach((l) => l());
}

function persist() {
  // Pada mode Supabase, server adalah sumber kebenaran — jangan cache ke
  // localStorage agar tidak ada data basi.
  if (isSupabaseConfigured) return;
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage penuh / tidak tersedia
  }
}

function commit(next: Partial<DataState>) {
  state = { ...state, ...next };
  syncBindings();
  persist();
  notify();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/** Hook reaktif: komponen yang memanggilnya akan render ulang saat data berubah. */
export function useDataVersion(): number {
  return useSyncExternalStore(
    subscribe,
    () => version,
    () => version,
  );
}

// =====================================================
// Status pemuatan data (mode Supabase)
// =====================================================

export type DataStatus = "loading" | "ready" | "error";

let dataStatus: DataStatus = isSupabaseConfigured ? "loading" : "ready";
let dataError: string | null = null;

/** Pesan error pemuatan terakhir (bila ada). */
export function getDataError(): string | null {
  return dataError;
}

/** Hook status pemuatan data dari Supabase. */
export function useDataStatus(): DataStatus {
  return useSyncExternalStore(
    subscribe,
    () => dataStatus,
    () => dataStatus,
  );
}

// =====================================================
// Sinkronisasi Supabase
// =====================================================

async function loadFromSupabase(): Promise<void> {
  if (!supabase) return;
  const [f, s, a, e, r, g, rp, p, d, c] = await Promise.all([
    supabase.from(TABLE.fields).select("*"),
    supabase.from(TABLE.seasons).select("*"),
    supabase.from(TABLE.activities).select("*"),
    supabase.from(TABLE.expenses).select("*"),
    supabase.from(TABLE.revenues).select("*"),
    supabase.from(TABLE.gallery).select("*"),
    supabase.from(TABLE.reports).select("*"),
    supabase.from(TABLE.practices).select("*"),
    supabase.from(TABLE.decisions).select("*"),
    supabase.from(TABLE.cropMonitors).select("*"),
  ]);

  const firstError = [f, s, a, e, r, g, rp, p, d, c].find((x) => x.error)?.error;
  if (firstError) throw firstError;

  state = {
    fields: (f.data ?? []) as Field[],
    seasons: (s.data ?? []) as Season[],
    activities: (a.data ?? []) as Activity[],
    expenses: (e.data ?? []) as Expense[],
    revenues: (r.data ?? []) as Revenue[],
    gallery: (g.data ?? []) as GalleryItem[],
    reports: (rp.data ?? []) as Report[],
    practices: (p.data ?? []) as Practice[],
    decisions: (d.data ?? []) as Decision[],
    cropMonitors: (c.data ?? []) as CropMonitor[],
  };
  syncBindings();
}

let initStarted = false;

/** Muat data awal. Dipanggil sekali saat app start (lihat App.tsx). */
export async function initData(): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    dataStatus = "ready";
    notify();
    return;
  }
  if (initStarted) return;
  initStarted = true;
  dataStatus = "loading";
  notify();
  try {
    await loadFromSupabase();
    dataError = null;
    dataStatus = "ready";
    notify();
  } catch (err) {
    dataError = err instanceof Error ? err.message : String(err);
    dataStatus = "error";
    notify();
  }
}

/** Muat ulang seluruh data dari Supabase (mis. setelah migrasi). */
export async function reloadData(): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    await loadFromSupabase();
    dataError = null;
    dataStatus = "ready";
  } catch (err) {
    dataError = err instanceof Error ? err.message : String(err);
    dataStatus = "error";
  }
  notify();
}

// Write-through ke Supabase. No-op pada mode demo.
function push(
  table: EntityKey,
  op: "insert" | "update" | "delete",
  payload?: Record<string, unknown>,
  id?: string,
): void {
  if (!isSupabaseConfigured || !supabase) return;
  const client = supabase;
  const tableName = TABLE[table];
  void (async () => {
    try {
      if (op === "insert") {
        const { error } = await client.from(tableName).insert(payload ?? {});
        if (error) throw error;
      } else if (op === "update") {
        const { error } = await client
          .from(tableName)
          .update(payload ?? {})
          .eq("id", id ?? "");
        if (error) throw error;
      } else {
        const { error } = await client.from(tableName).delete().eq("id", id ?? "");
        if (error) throw error;
      }
    } catch (err) {
      // Tidak mengganggu UI; cukup catat di console.
      console.error(`[Supabase] gagal sinkron ${op} pada ${table}:`, err);
    }
  })();
}

/**
 * Migrasikan / timpa data seed bawaan ke Supabase (idempotent via upsert).
 * Dipakai sekali untuk mengisi database pertama kali. Wajib sudah login.
 */
export async function importSeedToSupabase(): Promise<{
  ok: boolean;
  message: string;
}> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      ok: false,
      message: "Supabase belum dikonfigurasi. Isi .env terlebih dahulu.",
    };
  }
  const client = supabase;
  const seed = seedState();
  // Urutan penting: induk (fields, seasons) sebelum anak agar FK terpenuhi.
  const order: EntityKey[] = [
    "fields",
    "seasons",
    "activities",
    "expenses",
    "revenues",
    "gallery",
    "reports",
    "practices",
    "decisions",
    "cropMonitors",
  ];
  try {
    for (const table of order) {
      const rows = seed[table] as unknown as Record<string, unknown>[];
      if (!rows.length) continue;
      const { error } = await client
        .from(TABLE[table])
        .upsert(rows, { onConflict: "id" });
      if (error) throw error;
    }
    await loadFromSupabase();
    notify();
    return { ok: true, message: "Data awal berhasil dimigrasikan ke Supabase." };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : String(err),
    };
  }
}

/** Kembalikan seluruh data ke kondisi awal (seed). Hanya untuk mode demo. */
export function resetData() {
  state = seedState();
  syncBindings();
  persist();
  notify();
}

// =====================================================
// Helper selektor (membaca state hidup)
// =====================================================

// ---- Lahan ----
export const getFieldById = (id: string) =>
  state.fields.find((f) => f.id === id);

export const getFieldName = (id: string) =>
  getFieldById(id)?.name ?? "Tidak diketahui";

/** Konversi luas m² menjadi hektar. */
export const haFromM2 = (m2: number) => m2 / 10000;

// ---- Musim (season) ----
export const getSeasonById = (id: string) =>
  state.seasons.find((s) => s.id === id);

export const getSeasonsByField = (fieldId: string) =>
  state.seasons
    .filter((s) => s.fieldId === fieldId)
    .sort((a, b) => b.year - a.year);

export const getSeasonByFieldYear = (fieldId: string, year: number) =>
  state.seasons.find((s) => s.fieldId === fieldId && s.year === year);

/** Musim terbaru sebuah lahan (tahun tertinggi). */
export const getLatestSeason = (fieldId: string) =>
  getSeasonsByField(fieldId)[0];

/** Daftar tahun musim yang tersedia, urut menurun (terbaru dulu). */
export const getAvailableYears = () =>
  Array.from(new Set(state.seasons.map((s) => s.year))).sort((a, b) => b - a);

export const getLatestYear = () =>
  getAvailableYears()[0] ?? new Date().getFullYear();

/** Musim-musim pada satu tahun tertentu. */
export const seasonsByYear = (year: number) =>
  state.seasons.filter((s) => s.year === year);

/** Lahan yang memiliki musim pada tahun tertentu. */
export const fieldsByYear = (year: number) =>
  state.fields.filter((f) =>
    state.seasons.some((s) => s.fieldId === f.id && s.year === year),
  );

// ---- Record per-musim ----
export const getActivitiesBySeason = (seasonId: string) =>
  state.activities
    .filter((a) => a.seasonId === seasonId)
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));

export const getExpensesBySeason = (seasonId: string) =>
  state.expenses.filter((e) => e.seasonId === seasonId);

export const getRevenuesBySeason = (seasonId: string) =>
  state.revenues.filter((r) => r.seasonId === seasonId);

export const getGalleryBySeason = (seasonId: string) =>
  state.gallery.filter((g) => g.seasonId === seasonId);

export const getReportBySeason = (seasonId: string) =>
  state.reports.find((r) => r.seasonId === seasonId);

export const getMonitorsBySeason = (seasonId: string) =>
  state.cropMonitors
    .filter((c) => c.seasonId === seasonId)
    .sort((a, b) => a.week - b.week);

export const getDecisionsBySeason = (seasonId: string) =>
  state.decisions
    .filter((d) => d.seasonId === seasonId)
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));

export const getPracticesBySeason = (seasonId: string) =>
  state.practices.filter((p) => p.seasonId === seasonId);

export const totalExpensesBySeason = (seasonId: string) =>
  getExpensesBySeason(seasonId).reduce((s, e) => s + e.amount, 0);

export const totalRevenueBySeason = (seasonId: string) =>
  getRevenuesBySeason(seasonId).reduce((s, r) => s + r.amount, 0);

// ---- Agregat per tahun ----
export const totalRevenueByYear = (year: number) =>
  state.revenues
    .filter((r) => seasonsByYear(year).some((s) => s.id === r.seasonId))
    .reduce((s, r) => s + r.amount, 0);

export const totalExpensesByYear = (year: number) =>
  state.expenses
    .filter((e) => seasonsByYear(year).some((s) => s.id === e.seasonId))
    .reduce((s, e) => s + e.amount, 0);

// ---- Record per-lahan (agregat lintas musim) ----
export const getActivitiesByField = (fieldId: string) =>
  state.activities.filter((a) => a.fieldId === fieldId);

export const getExpensesByField = (fieldId: string) =>
  state.expenses.filter((e) => e.fieldId === fieldId);

export const getRevenuesByField = (fieldId: string) =>
  state.revenues.filter((r) => r.fieldId === fieldId);

export const getGalleryByField = (fieldId: string) =>
  state.gallery.filter((g) => g.fieldId === fieldId);

export const getReportByField = (fieldId: string) =>
  state.reports.find((r) => r.fieldId === fieldId);

export const getMonitorsByField = (fieldId: string) =>
  state.cropMonitors
    .filter((c) => c.fieldId === fieldId)
    .sort((a, b) => a.week - b.week);

export const totalExpenses = (fieldId?: string) =>
  (fieldId ? getExpensesByField(fieldId) : state.expenses).reduce(
    (s, e) => s + e.amount,
    0,
  );

export const totalRevenue = (fieldId?: string) =>
  (fieldId ? getRevenuesByField(fieldId) : state.revenues).reduce(
    (s, r) => s + r.amount,
    0,
  );

// =====================================================
// MUTATORS (dipakai sisi admin) — update memori + write-through Supabase
// =====================================================

const rid = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

// ---- Lahan ----
export function addField(input: Omit<Field, "id">): Field {
  const nums = state.fields.map((f) => Number(f.id.replace(/\D/g, "")) || 0);
  const id = `F-${(Math.max(0, ...nums) + 1).toString().padStart(2, "0")}`;
  const field: Field = { ...input, id };
  commit({ fields: [...state.fields, field] });
  push("fields", "insert", field as unknown as Record<string, unknown>);
  return field;
}

export function updateField(id: string, patch: Partial<Field>) {
  commit({
    fields: state.fields.map((f) => (f.id === id ? { ...f, ...patch } : f)),
  });
  push("fields", "update", patch as Record<string, unknown>, id);
}

export function removeField(id: string) {
  commit({
    fields: state.fields.filter((f) => f.id !== id),
    seasons: state.seasons.filter((s) => s.fieldId !== id),
    activities: state.activities.filter((a) => a.fieldId !== id),
    expenses: state.expenses.filter((e) => e.fieldId !== id),
    revenues: state.revenues.filter((r) => r.fieldId !== id),
    gallery: state.gallery.filter((g) => g.fieldId !== id),
    reports: state.reports.filter((r) => r.fieldId !== id),
    practices: state.practices.filter((p) => p.fieldId !== id),
    decisions: state.decisions.filter((d) => d.fieldId !== id),
    cropMonitors: state.cropMonitors.filter((c) => c.fieldId !== id),
  });
  // FK ON DELETE CASCADE di Supabase otomatis menghapus seluruh anak.
  push("fields", "delete", undefined, id);
}

// ---- Musim ----
export function addSeason(input: Omit<Season, "id">): Season {
  const suffix = input.fieldId.replace(/\D/g, "") || input.fieldId;
  let id = `S-${input.year}-${suffix}`;
  if (state.seasons.some((s) => s.id === id)) id = rid("S");
  const season: Season = { ...input, id };
  commit({ seasons: [...state.seasons, season] });
  push("seasons", "insert", season as unknown as Record<string, unknown>);
  return season;
}

export function updateSeason(id: string, patch: Partial<Season>) {
  commit({
    seasons: state.seasons.map((s) => (s.id === id ? { ...s, ...patch } : s)),
  });
  push("seasons", "update", patch as Record<string, unknown>, id);
}

export function removeSeason(id: string) {
  commit({
    seasons: state.seasons.filter((s) => s.id !== id),
    activities: state.activities.filter((a) => a.seasonId !== id),
    expenses: state.expenses.filter((e) => e.seasonId !== id),
    revenues: state.revenues.filter((r) => r.seasonId !== id),
    gallery: state.gallery.filter((g) => g.seasonId !== id),
    reports: state.reports.filter((r) => r.seasonId !== id),
    practices: state.practices.filter((p) => p.seasonId !== id),
    decisions: state.decisions.filter((d) => d.seasonId !== id),
    cropMonitors: state.cropMonitors.filter((c) => c.seasonId !== id),
  });
  push("seasons", "delete", undefined, id);
}

// ---- Record operasional ----
export function addActivity(input: Omit<Activity, "id">) {
  const rec: Activity = { ...input, id: rid("A") };
  commit({ activities: [...state.activities, rec] });
  push("activities", "insert", rec as unknown as Record<string, unknown>);
}
export function removeActivity(id: string) {
  commit({ activities: state.activities.filter((a) => a.id !== id) });
  push("activities", "delete", undefined, id);
}

export function addExpense(input: Omit<Expense, "id">) {
  const rec: Expense = { ...input, id: rid("E") };
  commit({ expenses: [...state.expenses, rec] });
  push("expenses", "insert", rec as unknown as Record<string, unknown>);
}
export function updateExpense(id: string, patch: Partial<Expense>) {
  commit({
    expenses: state.expenses.map((e) => (e.id === id ? { ...e, ...patch } : e)),
  });
  push("expenses", "update", patch as Record<string, unknown>, id);
}
export function removeExpense(id: string) {
  commit({ expenses: state.expenses.filter((e) => e.id !== id) });
  push("expenses", "delete", undefined, id);
}

export function addRevenue(input: Omit<Revenue, "id">) {
  const rec: Revenue = { ...input, id: rid("R") };
  commit({ revenues: [...state.revenues, rec] });
  push("revenues", "insert", rec as unknown as Record<string, unknown>);
}
export function updateRevenue(id: string, patch: Partial<Revenue>) {
  commit({
    revenues: state.revenues.map((r) => (r.id === id ? { ...r, ...patch } : r)),
  });
  push("revenues", "update", patch as Record<string, unknown>, id);
}
export function removeRevenue(id: string) {
  commit({ revenues: state.revenues.filter((r) => r.id !== id) });
  push("revenues", "delete", undefined, id);
}

export async function uploadGalleryImage(file: File): Promise<string> {
  if (!supabase) throw new Error("Supabase belum dikonfigurasi.");
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
  const { error } = await supabase.storage
    .from("fms-gallery")
    .upload(path, file, { contentType: "image/jpeg", upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from("fms-gallery").getPublicUrl(path);
  return data.publicUrl;
}
// Hapus file dari Storage jika imageUrl berasal dari bucket fms-gallery.
// Link Google Drive / data URL / picsum diabaikan (return aman).
export async function deleteGalleryImage(imageUrl: string): Promise<void> {
  if (!supabase || !imageUrl) return;
  const marker = "/storage/v1/object/public/fms-gallery/";
  const idx = imageUrl.indexOf(marker);
  if (idx === -1) return; // bukan file milik bucket kita
  const path = decodeURIComponent(imageUrl.slice(idx + marker.length));
  if (!path) return;
  const { data, error } = await supabase.storage.from("fms-gallery").remove([path]);
  if (error) console.error("[Supabase] gagal hapus file storage:", error);
  else if (!data || data.length === 0)
  console.warn("[Supabase] file TIDAK terhapus — cek policy DELETE / path:", path);
}
export function addGalleryItem(input: Omit<GalleryItem, "id">) {
  const rec: GalleryItem = { ...input, id: rid("G") };
  commit({ gallery: [...state.gallery, rec] });
  push("gallery", "insert", rec as unknown as Record<string, unknown>);
}
export function removeGalleryItem(id: string) {
  const item = state.gallery.find((g) => g.id === id);
  commit({ gallery: state.gallery.filter((g) => g.id !== id) });
  push("gallery", "delete", undefined, id);
  // Hapus juga file fisik di Storage (kalau ada)
  if (item) void deleteGalleryImage(item.imageUrl);
}

export function addReport(input: Omit<Report, "id">) {
  const rec: Report = { ...input, id: rid("RP") };
  commit({ reports: [...state.reports, rec] });
  push("reports", "insert", rec as unknown as Record<string, unknown>);
}
export function updateReport(id: string, patch: Partial<Report>) {
  commit({
    reports: state.reports.map((r) => (r.id === id ? { ...r, ...patch } : r)),
  });
  push("reports", "update", patch as Record<string, unknown>, id);
}
export function removeReport(id: string) {
  commit({ reports: state.reports.filter((r) => r.id !== id) });
  push("reports", "delete", undefined, id);
}

/**
 * Set target & hasil panen untuk sebuah musim. Membuat report baru bila belum
 * ada, atau memperbarui yang sudah ada. Dipakai admin (Economic Dashboard).
 */
export function upsertSeasonReport(
  seasonId: string,
  fieldId: string,
  patch: Partial<Pick<Report, "yieldTon" | "targetTon" | "period" | "summary">>,
) {
  const existing = state.reports.find((r) => r.seasonId === seasonId);
  if (existing) {
    commit({
      reports: state.reports.map((r) =>
        r.id === existing.id ? { ...r, ...patch } : r,
      ),
    });
    push("reports", "update", patch as Record<string, unknown>, existing.id);
    return;
  }
  const season = state.seasons.find((s) => s.id === seasonId);
  const rec: Report = {
    id: rid("RP"),
    seasonId,
    fieldId,
    period: patch.period ?? season?.label ?? "",
    yieldTon: patch.yieldTon ?? 0,
    targetTon: patch.targetTon ?? 0,
    summary: patch.summary ?? "",
  };
  commit({ reports: [...state.reports, rec] });
  push("reports", "insert", rec as unknown as Record<string, unknown>);
}

export function addPractice(input: Omit<Practice, "id">) {
  const rec: Practice = { ...input, id: rid("P") };
  commit({ practices: [...state.practices, rec] });
  push("practices", "insert", rec as unknown as Record<string, unknown>);
}
export function removePractice(id: string) {
  commit({ practices: state.practices.filter((p) => p.id !== id) });
  push("practices", "delete", undefined, id);
}

export function addDecision(input: Omit<Decision, "id">) {
  const rec: Decision = { ...input, id: rid("D") };
  commit({ decisions: [...state.decisions, rec] });
  push("decisions", "insert", rec as unknown as Record<string, unknown>);
}
export function removeDecision(id: string) {
  commit({ decisions: state.decisions.filter((d) => d.id !== id) });
  push("decisions", "delete", undefined, id);
}

export function addCropMonitor(input: Omit<CropMonitor, "id">) {
  const rec: CropMonitor = { ...input, id: rid("C") };
  commit({ cropMonitors: [...state.cropMonitors, rec] });
  push("cropMonitors", "insert", rec as unknown as Record<string, unknown>);
}
export function removeCropMonitor(id: string) {
  commit({ cropMonitors: state.cropMonitors.filter((c) => c.id !== id) });
  push("cropMonitors", "delete", undefined, id);
}
