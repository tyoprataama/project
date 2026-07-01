import { useState } from "react";
import { useForm } from "react-hook-form";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { PageTransition } from "../components/ui/PageTransition";
import { PageHeader } from "../components/ui/PageHeader";
import { GalleryCard } from "../components/cards/GalleryCard";
import { Modal } from "../components/ui/Modal";
import { Button } from "../components/ui/Button";
import {
  gallery,
  fields,
  getSeasonsByField,
  getSeasonById,
  getFieldName,
  addGalleryItem,
  removeGalleryItem,
  uploadGalleryImage,
  useDataVersion,
} from "../data";
import { formatDate } from "../utils/format";
import type { GalleryItem } from "../types";
import { isSupabaseConfigured } from "../lib/supabase";
import {
  compressImage,
  fileToDataUrl,
  normalizeImageUrl,
} from "../utils/image";


const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";
const labelClass = "mb-1 block text-xs font-medium text-slate-600";

interface FormValues {
  fieldId: string;
  seasonId: string;
  date: string;
  title: string;
  stage: string;
  imageUrl: string;
  notes: string;
}

export default function GrowthGallery() {
  useDataVersion();
  const [fieldId, setFieldId] = useState<string>("all");
  const [active, setActive] = useState<GalleryItem | null>(null);
  const [open, setOpen] = useState(false);
  const items = gallery.filter(
    (g) => fieldId === "all" || g.fieldId === fieldId,
  );

  return (
    <PageTransition>
      <PageHeader
        title="Growth Gallery"
        description="Dokumentasi visual pertumbuhan tanaman antar fase."
        actions={
          <Button onClick={() => setOpen(true)}>
            <FiPlus size={16} /> Tambah Foto
          </Button>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <Chip
          active={fieldId === "all"}
          onClick={() => setFieldId("all")}
          label="Semua"
        />
        {fields.map((f) => (
          <Chip
            key={f.id}
            active={fieldId === f.id}
            onClick={() => setFieldId(f.id)}
            label={f.name}
          />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.id} className="group relative">
            <button
              onClick={() => {
                if (window.confirm("Hapus foto ini? Tindakan ini tidak bisa dibatalkan.")) {
                removeGalleryItem(item.id);}}
              }
              aria-label="Hapus foto"
              className="absolute right-2 top-2 z-10 rounded-lg bg-white/90 p-1.5 text-slate-400 opacity-0 shadow-sm transition hover:text-red-600 group-hover:opacity-100"
            >
              <FiTrash2 size={14} />
            </button>
            <GalleryCard item={item} onClick={() => setActive(item)} />
          </div>
        ))}
      </div>

      <Modal
        isOpen={active !== null}
        onClose={() => setActive(null)}
        title={active?.title}
      >
        {active && (
          <div className="space-y-3">
            <img
              src={normalizeImageUrl(active.imageUrl)}
              alt={active.title}
              className="w-full rounded-lg"
            />
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">
                {getFieldName(active.fieldId)}
              </span>
              <span className="text-slate-400">{formatDate(active.date)}</span>
            </div>
            <p className="text-sm text-slate-600">Fase: {active.stage}</p>
            <p className="text-sm text-slate-600">{active.notes}</p>
          </div>
        )}
      </Modal>

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Tambah Foto">
        <GalleryForm onDone={() => setOpen(false)} />
      </Modal>
    </PageTransition>
  );
}

function GalleryForm({ onDone }: { onDone: () => void }) {
  const { register, handleSubmit, watch } = useForm<FormValues>({
    defaultValues: {
      fieldId: fields[0]?.id ?? "",
      seasonId: "",
      date: new Date().toISOString().slice(0, 10),
      stage: "Vegetatif",
      imageUrl: "",
    },
  });
  const fid = watch("fieldId");
  const seasonOptions = fid ? getSeasonsByField(fid) : [];
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const onSubmit = async (v: FormValues) => {
  const season = getSeasonById(v.seasonId);
  if (!season) return;
  setErr("");

  let finalUrl = normalizeImageUrl(v.imageUrl);

  if (file) {
    if (file.size > 15_000_000) {
      setErr("File terlalu besar (maks 15MB sebelum kompresi).");
      return;
    }
    try {
      setBusy(true);
      // Kompres sampai <= 1MB
      const compressed = await compressImage(file, { maxBytes: 1_000_000 });
      if (compressed.size > 1_000_000) {
        setErr("Gambar masih > 1MB setelah dikompres. Pilih gambar lain.");
        setBusy(false);
        return;
      }
      finalUrl = isSupabaseConfigured
        ? await uploadGalleryImage(compressed)   // upload ke Storage
        : await fileToDataUrl(compressed);        // fallback mode lokal
    } catch (e) {
      setErr("Gagal mengunggah gambar: " + (e as Error).message);
      setBusy(false);
      return;
    }
    setBusy(false);
  }

  addGalleryItem({
    seasonId: v.seasonId,
    fieldId: season.fieldId,
    date: v.date,
    title: v.title,
    stage: v.stage,
    imageUrl:
      finalUrl || "https://picsum.photos/seed/" + Date.now() + "/640/480",
    notes: v.notes,
  });
  onDone();
};

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Lahan</label>
          <select className={inputClass} {...register("fieldId")}>
            {fields.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Musim</label>
          <select
            className={inputClass}
            {...register("seasonId", { required: true })}
          >
            <option value="">— pilih musim —</option>
            {seasonOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.year} · {s.crop}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className={labelClass}>Judul</label>
        <input
          className={inputClass}
          placeholder="mis. Tunas mulai tumbuh"
          {...register("title", { required: true })}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Fase</label>
          <input
            className={inputClass}
            placeholder="mis. Vegetatif"
            {...register("stage")}
          />
        </div>
        <div>
          <label className={labelClass}>Tanggal</label>
          <input type="date" className={inputClass} {...register("date")} />
        </div>
      </div>
      <div>
        <label className={labelClass}>
          Link Google Drive / URL gambar (opsional)
        </label>
        <input
          className={inputClass}
          placeholder="Tempel link Drive (set 'Anyone with the link')"
          {...register("imageUrl")}
        />
      </div>
      <div>
        <label className={labelClass}>
          Atau upload dari perangkat (maks 1MB, dikompres otomatis)
        </label>
        <input
          type="file"
          accept="image/*"
          className={inputClass}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        {file && (
          <p className="mt-1 text-xs text-slate-500">
            {file.name} · {(file.size / 1024).toFixed(0)} KB
          </p>
        )}
      </div>
      {err && <p className="text-xs text-rose-600">{err}</p>}
      <div>
        <label className={labelClass}>Catatan</label>
        <textarea rows={2} className={inputClass} {...register("notes")} />
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <Button type="submit" disabled={busy}>
          {busy ? "Mengunggah..." : "Simpan Foto"}
        </Button>
      </div>
    </form>
  );
}

function Chip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
        active
          ? "bg-tulus-600 text-white"
          : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
      }`}
    >
      {label}
    </button>
  );
}
