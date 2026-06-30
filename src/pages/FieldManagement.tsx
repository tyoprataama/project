import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiMapPin,
  FiCalendar,
  FiRefreshCw,
  FiDatabase,
} from "react-icons/fi";
import { PageTransition } from "../components/ui/PageTransition";
import { PageHeader } from "../components/ui/PageHeader";
import { Modal } from "../components/ui/Modal";
import { Button } from "../components/ui/Button";
import { CurrencyInput } from "../components/ui/CurrencyInput";
import {
  fields,
  seasons,
  addField,
  updateField,
  removeField,
  addSeason,
  updateSeason,
  removeSeason,
  resetData,
  importSeedToSupabase,
  useDataVersion,
} from "../data";
import { isSupabaseConfigured } from "../lib/supabase";
import { fieldStatusMeta } from "../client/constants/fieldMeta";
import {
  formatNumber,
  formatCompactCurrency,
  formatDate,
} from "../utils/format";
import { defaultHarvestDate, deviationInfo } from "../utils/harvest";
import type { Field, Season, FieldStatus, Ownership } from "../types";
import type { DeviationCategory } from "../utils/harvest";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-tulus-600 focus:ring-2 focus:ring-tulus-600/20";
const labelClass = "mb-1.5 block text-sm font-medium text-ink-soft";
const helpClass = "mt-1 text-xs text-ink-muted";

const ownershipLabel: Record<Ownership, string> = {
  owned: "Milik Sendiri",
  rental: "Sewa",
};

const cardHidden = { opacity: 0, y: 16 };
const cardShown = { opacity: 1, y: 0 };

const devBadge: Record<
  DeviationCategory,
  { label: string; className: string } | null
> = {
  cepat: {
    label: "Panen cepat",
    className: "bg-leaf-50 text-leaf-700 ring-leaf-600/20",
  },
  sesuai: {
    label: "Tepat target",
    className: "bg-slate-100 text-slate-600 ring-slate-400/30",
  },
  telat: {
    label: "Overdue",
    className: "bg-red-50 text-red-700 ring-red-600/20",
  },
  berjalan: null,
};

interface FieldForm {
  name: string;
  areaM2: number;
  ownership: Ownership;
  rentalCost?: number;
  notes: string;
  location: string;
  soilType: string;
  bmkgCode?: string;
}

interface SeasonForm {
  year: number;
  crop: string;
  status: FieldStatus;
  plantingDate: string;
  harvestDate: string;
  actualHarvestDate?: string;
  harvestNote?: string;
  notes: string;
}

export default function FieldManagement() {
  // Reaktif terhadap store: setiap perubahan langsung tampil di sisi client.
  useDataVersion();

  const [fieldModal, setFieldModal] = useState<{
    open: boolean;
    editing: Field | null;
  }>({ open: false, editing: null });
  const [seasonModal, setSeasonModal] = useState<{
    open: boolean;
    fieldId: string | null;
    editing: Season | null;
  }>({ open: false, fieldId: null, editing: null });

  const seasonsByField = useMemo(() => {
    const map: Record<string, Season[]> = {};
    for (const s of seasons) {
      (map[s.fieldId] ??= []).push(s);
    }
    for (const id of Object.keys(map)) {
      map[id].sort((a, b) => b.year - a.year);
    }
    return map;
  }, [seasons]);

  const saveField = (values: FieldForm) => {
    const payload = {
      name: values.name,
      areaM2: values.areaM2,
      ownership: values.ownership,
      rentalCost: values.ownership === "rental" ? values.rentalCost : undefined,
      notes: values.notes,
      location: values.location || "Betet, Kota Kediri",
      soilType: values.soilType || "-",
      bmkgCode: values.bmkgCode?.trim() || undefined,
    };
    if (fieldModal.editing) {
      updateField(fieldModal.editing.id, payload);
    } else {
      addField(payload);
    }
    setFieldModal({ open: false, editing: null });
  };

  const deleteField = (id: string) => {
    const ok = window.confirm(
      "Hapus lahan ini beserta seluruh musim & catatannya? Tindakan ini tidak bisa dibatalkan.",
    );
    if (!ok) return;
    removeField(id);
  };

  const saveSeason = (values: SeasonForm) => {
    const fieldId = seasonModal.fieldId;
    if (!fieldId) return;
    const payload = {
      fieldId,
      year: values.year,
      label: `Musim Tanam ${values.year}`,
      crop: values.crop,
      status: values.status,
      plantingDate: values.plantingDate,
      harvestDate:
        values.harvestDate || defaultHarvestDate(values.plantingDate),
      actualHarvestDate:
        values.status === "harvested"
          ? values.actualHarvestDate || undefined
          : undefined,
      harvestNote:
        values.status === "harvested"
          ? values.harvestNote?.trim() || undefined
          : undefined,
      progress:
        values.status === "harvested"
          ? 100
          : values.status === "preparing"
            ? 5
            : 50,
      notes: values.notes,
    };
    if (seasonModal.editing) {
      updateSeason(seasonModal.editing.id, payload);
    } else {
      addSeason(payload);
    }
    setSeasonModal({ open: false, fieldId: null, editing: null });
  };

  const [migrating, setMigrating] = useState(false);
  const hasData = fields.length > 0 || seasons.length > 0;

  const handleReset = () => {
    const ok = window.confirm(
      "Kembalikan SEMUA data ke kondisi awal (seed)? Perubahan yang Anda buat akan hilang.",
    );
    if (ok) resetData();
  };

  const handleImport = async () => {
    const ok = window.confirm(
      "Migrasikan data awal (seed) ke Supabase? Berguna untuk mengisi database pertama kali. Data dengan ID sama akan ditimpa.",
    );
    if (!ok) return;
    setMigrating(true);
    const res = await importSeedToSupabase();
    setMigrating(false);
    window.alert(res.message);
  };

  return (
    <PageTransition>
      <PageHeader
        title="Field Management"
        description="Sumber utama seluruh data. Apa pun yang Anda ubah di sini langsung tercermin di sisi client."
        actions={
          <div className="flex flex-wrap gap-2">
            {isSupabaseConfigured ? (
              hasData ? null : ( // ← tombol disembunyikan jika sudah ada data
                <Button
                  variant="outline"
                  onClick={handleImport}
                  disabled={migrating}
                >
                  <FiDatabase size={15} />{" "}
                  {migrating ? "Memigrasi..." : "Migrasi Data Awal"}
                </Button>
              )
            ) : (
              <Button variant="outline" onClick={handleReset}>
                <FiRefreshCw size={15} /> Reset Data
              </Button>
            )}
            <Button
              onClick={() => setFieldModal({ open: true, editing: null })}
            >
              <FiPlus size={16} /> Tambah Lahan
            </Button>
          </div>
        }
      />

      <div className="grid gap-5 md:grid-cols-2">
        {fields.map((field, i) => {
          const fieldSeasons = seasonsByField[field.id] ?? [];
          return (
            <motion.div
              key={field.id}
              initial={cardHidden}
              animate={cardShown}
              transition={transitionFor(i)}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-display text-lg font-semibold text-tulus-900">
                    {field.name}
                  </h3>
                  <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-ink-muted">
                    <FiMapPin size={13} /> {field.location}
                  </p>
                </div>
                <span
                  className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
                    field.ownership === "owned"
                      ? "bg-leaf-50 text-leaf-700 ring-leaf-600/20"
                      : "bg-amber-50 text-amber-700 ring-amber-600/20"
                  }`}
                >
                  {ownershipLabel[field.ownership]}
                </span>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-ink-muted">Luas</dt>
                  <dd className="mt-0.5 font-medium text-ink">
                    {formatNumber(field.areaM2)} m²
                  </dd>
                </div>
                <div>
                  <dt className="text-ink-muted">Biaya Sewa</dt>
                  <dd className="mt-0.5 font-medium text-ink">
                    {field.ownership === "rental" && field.rentalCost
                      ? formatCompactCurrency(field.rentalCost)
                      : "—"}
                  </dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-ink-muted">Kondisi Tanah</dt>
                  <dd className="mt-0.5 font-medium text-ink">
                    {field.soilType}
                  </dd>
                </div>
              </dl>

              {field.notes ? (
                <p className="mt-3 rounded-xl bg-slate-50 px-3.5 py-2.5 text-sm leading-relaxed text-ink-muted">
                  {field.notes}
                </p>
              ) : null}

              {/* Musim tanam */}
              <div className="mt-5 border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                    Musim Tanam ({fieldSeasons.length})
                  </p>
                  <button
                    onClick={() =>
                      setSeasonModal({
                        open: true,
                        fieldId: field.id,
                        editing: null,
                      })
                    }
                    className="inline-flex items-center gap-1 text-xs font-medium text-tulus-700 hover:text-tulus-800"
                  >
                    <FiPlus size={13} /> Tambah Musim
                  </button>
                </div>
                <ul className="mt-3 space-y-2">
                  {fieldSeasons.length ? (
                    fieldSeasons.map((s) => {
                      const meta = fieldStatusMeta[s.status];
                      const dev = deviationInfo({
                        status: s.status,
                        harvestDate: s.harvestDate,
                        actualHarvestDate: s.actualHarvestDate,
                      });
                      const badge = devBadge[dev.category];
                      const telat = dev.category === "telat";
                      return (
                        <li
                          key={s.id}
                          className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-3.5 py-2.5"
                        >
                          <div className="min-w-0">
                            <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-ink">
                              <FiCalendar
                                size={12}
                                className="text-tulus-600"
                              />
                              {s.year} · {s.crop}
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${meta.className}`}
                              >
                                {meta.label}
                              </span>
                              {badge ? (
                                <span
                                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${badge.className}`}
                                >
                                  {badge.label}
                                </span>
                              ) : null}
                            </p>
                            <p className="mt-0.5 text-xs text-ink-muted">
                              Tanam {formatDate(s.plantingDate)} · Perkiraan{" "}
                              {formatDate(s.harvestDate)}
                            </p>
                            {s.actualHarvestDate ? (
                              <p className="mt-0.5 text-xs text-ink-muted">
                                Panen aktual {formatDate(s.actualHarvestDate)}
                              </p>
                            ) : null}
                            <p
                              className={`mt-0.5 text-xs ${
                                telat
                                  ? "font-medium text-red-600"
                                  : "text-ink-muted"
                              }`}
                            >
                              {dev.detail}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-1">
                            <button
                              onClick={() =>
                                setSeasonModal({
                                  open: true,
                                  fieldId: field.id,
                                  editing: s,
                                })
                              }
                              aria-label="Edit musim"
                              className="rounded-lg p-1.5 text-ink-muted transition hover:bg-tulus-50 hover:text-tulus-700"
                            >
                              <FiEdit2 size={14} />
                            </button>
                            <button
                              onClick={() => removeSeason(s.id)}
                              aria-label="Hapus musim"
                              className="rounded-lg p-1.5 text-ink-muted transition hover:bg-red-50 hover:text-red-600"
                            >
                              <FiTrash2 size={14} />
                            </button>
                          </div>
                        </li>
                      );
                    })
                  ) : (
                    <li className="rounded-xl border border-dashed border-slate-200 px-3.5 py-3 text-center text-xs text-ink-muted">
                      Belum ada musim tanam.
                    </li>
                  )}
                </ul>
              </div>

              <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFieldModal({ open: true, editing: field })}
                >
                  <FiEdit2 size={14} /> Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:bg-red-50"
                  onClick={() => deleteField(field.id)}
                >
                  <FiTrash2 size={14} /> Hapus
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {fields.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 py-16 text-center text-sm text-ink-muted">
          Belum ada lahan. Klik “Tambah Lahan” untuk membuat yang pertama.
        </div>
      ) : null}

      {/* Modal form lahan */}
      <Modal
        isOpen={fieldModal.open}
        onClose={() => setFieldModal({ open: false, editing: null })}
        title={fieldModal.editing ? "Edit Lahan" : "Tambah Lahan"}
      >
        <FieldFormFields
          editing={fieldModal.editing}
          onSubmit={saveField}
          onCancel={() => setFieldModal({ open: false, editing: null })}
        />
      </Modal>

      {/* Modal form musim */}
      <Modal
        isOpen={seasonModal.open}
        onClose={() =>
          setSeasonModal({ open: false, fieldId: null, editing: null })
        }
        title={seasonModal.editing ? "Edit Musim Tanam" : "Tambah Musim Tanam"}
      >
        <SeasonFormFields
          editing={seasonModal.editing}
          onSubmit={saveSeason}
          onCancel={() =>
            setSeasonModal({ open: false, fieldId: null, editing: null })
          }
        />
      </Modal>
    </PageTransition>
  );
}

const transitionFor = (i: number) => ({
  duration: 0.35,
  delay: Math.min(i * 0.05, 0.3),
  ease: [0.22, 1, 0.36, 1] as const,
});

function FieldFormFields({
  editing,
  onSubmit,
  onCancel,
}: {
  editing: Field | null;
  onSubmit: (v: FieldForm) => void;
  onCancel: () => void;
}) {
  const defaults: FieldForm = {
    name: editing?.name ?? "",
    areaM2: editing?.areaM2 ?? 0,
    ownership: editing?.ownership ?? "owned",
    rentalCost: editing?.rentalCost,
    notes: editing?.notes ?? "",
    location: editing?.location ?? "Betet, Kota Kediri",
    soilType: editing?.soilType ?? "",
    bmkgCode: editing?.bmkgCode ?? "",
  };
  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<FieldForm>({ defaultValues: defaults });
  const ownership = watch("ownership");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className={labelClass}>Nama Lahan</label>
        <input
          className={inputClass}
          placeholder="mis. Sumber Rejeki 1"
          {...register("name", { required: "Nama wajib diisi" })}
        />
        {errors.name ? (
          <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Luas (m²)</label>
          <input
            type="number"
            min={0}
            className={inputClass}
            {...register("areaM2", {
              valueAsNumber: true,
              required: "Luas wajib diisi",
              min: { value: 1, message: "Luas harus lebih dari 0" },
            })}
          />
          {errors.areaM2 ? (
            <p className="mt-1 text-xs text-red-600">{errors.areaM2.message}</p>
          ) : null}
        </div>
        <div>
          <label className={labelClass}>Status Kepemilikan</label>
          <select className={inputClass} {...register("ownership")}>
            <option value="owned">Milik Sendiri</option>
            <option value="rental">Sewa</option>
          </select>
        </div>
      </div>

      {ownership === "rental" ? (
        <div>
          <label className={labelClass}>Biaya Sewa (opsional)</label>
          <CurrencyInput
            control={control}
            name="rentalCost"
            prefix="Rp"
            className={inputClass}
            placeholder="3.000.000"
          />
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Lokasi</label>
          <input className={inputClass} {...register("location")} />
        </div>
        <div>
          <label className={labelClass}>Kondisi Tanah</label>
          <input
            className={inputClass}
            placeholder="mis. Tanah gembur"
            {...register("soilType")}
          />
          <p className={helpClass}>
            Pakai istilah awam: gembur, keras, berpasir, dll.
          </p>
        </div>
      </div>

      <div>
        <label className={labelClass}>Kode Wilayah BMKG (opsional)</label>
        <input
          className={inputClass}
          placeholder="mis. 35.06.13.2001"
          {...register("bmkgCode")}
        />
        <p className={helpClass}>
          Kode adm4 (desa) untuk cuaca hari ini. Kosongkan untuk memakai
          estimasi.
        </p>
      </div>

      <div>
        <label className={labelClass}>Catatan</label>
        <textarea
          rows={3}
          className={inputClass}
          placeholder="Informasi permanen lahan..."
          {...register("notes")}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit">Simpan</Button>
      </div>
    </form>
  );
}

function SeasonFormFields({
  editing,
  onSubmit,
  onCancel,
}: {
  editing: Season | null;
  onSubmit: (v: SeasonForm) => void;
  onCancel: () => void;
}) {
  const defaults: SeasonForm = {
    year: editing?.year ?? new Date().getFullYear(),
    crop: editing?.crop ?? "Tebu",
    status: editing?.status ?? "preparing",
    plantingDate: editing?.plantingDate ?? "",
    harvestDate: editing?.harvestDate ?? "",
    actualHarvestDate: editing?.actualHarvestDate ?? "",
    harvestNote: editing?.harvestNote ?? "",
    notes: editing?.notes ?? "",
  };
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SeasonForm>({ defaultValues: defaults });

  // Siklus tebu ≈ 1 tahun: target panen otomatis = tanggal tanam + 1 tahun,
  // selama admin belum mengubahnya manual.
  const [harvestTouched, setHarvestTouched] = useState(
    Boolean(editing?.harvestDate),
  );
  const planting = watch("plantingDate");
  const status = watch("status");
  useEffect(() => {
    if (planting && !harvestTouched) {
      const d = defaultHarvestDate(planting);
      if (d) setValue("harvestDate", d);
    }
  }, [planting, harvestTouched, setValue]);
  const harvestReg = register("harvestDate", {
    required: "Tanggal target panen wajib diisi",
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Tahun Musim</label>
          <input
            type="number"
            className={inputClass}
            {...register("year", { valueAsNumber: true, required: true })}
          />
        </div>
        <div>
          <label className={labelClass}>Komoditas</label>
          <input
            className={inputClass}
            {...register("crop", { required: true })}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Status</label>
        <select className={inputClass} {...register("status")}>
          <option value="preparing">Persiapan</option>
          <option value="active">Aktif / Tumbuh</option>
          <option value="harvested">Panen Selesai</option>
          <option value="fallow">Bera</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Tanggal Tanam</label>
          <input
            type="date"
            className={inputClass}
            {...register("plantingDate", {
              required: "Tanggal tanam wajib diisi",
            })}
          />
          {errors.plantingDate ? (
            <p className="mt-1 text-xs text-red-600">
              {errors.plantingDate.message}
            </p>
          ) : null}
        </div>
        <div>
          <label className={labelClass}>Perkiraan Panen</label>
          <input
            type="date"
            className={inputClass}
            {...harvestReg}
            onChange={(e) => {
              setHarvestTouched(true);
              harvestReg.onChange(e);
            }}
          />
          <p className={helpClass}>
            Otomatis 1 tahun setelah tanggal tanam (siklus tebu) — bisa diubah
            manual.
          </p>
          {errors.harvestDate ? (
            <p className="mt-1 text-xs text-red-600">
              {errors.harvestDate.message}
            </p>
          ) : null}
        </div>
      </div>

      {status === "harvested" ? (
        <div>
          <label className={labelClass}>Tanggal Aktualisasi Panen</label>
          <input
            type="date"
            className={inputClass}
            {...register("actualHarvestDate", {
              required:
                "Tanggal aktualisasi panen wajib diisi saat status panen",
            })}
          />
          <p className={helpClass}>
            Tanggal panen sebenarnya. Selisih dengan perkiraan panen menentukan
            apakah panen cepat, tepat, atau overdue.
          </p>
          {errors.actualHarvestDate ? (
            <p className="mt-1 text-xs text-red-600">
              {errors.actualHarvestDate.message}
            </p>
          ) : null}
          <div className="mt-4">
            <label className={labelClass}>Catatan / Alasan Panen</label>
            <textarea
              rows={2}
              className={inputClass}
              placeholder="mis. Panen lebih cepat untuk mengejar jadwal giling."
              {...register("harvestNote")}
            />
            <p className={helpClass}>
              Alasan panen cepat / tepat / overdue. Tampil di callout detail
              lahan sisi client.
            </p>
          </div>
        </div>
      ) : null}

      <div>
        <label className={labelClass}>Catatan</label>
        <textarea
          rows={3}
          className={inputClass}
          placeholder="Catatan musim tanam..."
          {...register("notes")}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit">Simpan Musim</Button>
      </div>
    </form>
  );
}
