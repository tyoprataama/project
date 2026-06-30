import { useState } from "react";
import { useForm } from "react-hook-form";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { PageTransition } from "../components/ui/PageTransition";
import { PageHeader } from "../components/ui/PageHeader";
import { TimelineCard } from "../components/cards/TimelineCard";
import { Badge } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/EmptyState";
import { Modal } from "../components/ui/Modal";
import { Button } from "../components/ui/Button";
import {
  activities,
  expenses,
  fields,
  getFieldName,
  getSeasonsByField,
  getSeasonById,
  addActivity,
  removeActivity,
  useDataVersion,
} from "../data";
import { formatCurrency, formatDate } from "../utils/format";
import type {
  ActivityStatus,
  ActivityType,
  Expense,
  ExpenseCategory,
} from "../types";

const expenseCategoryLabel: Record<ExpenseCategory, string> = {
  seeds: "Benih",
  fertilizer: "Pupuk",
  labor: "Tenaga Kerja",
  equipment: "Peralatan",
  irrigation: "Irigasi",
  pesticide: "Pestisida",
  logistics: "Logistik",
  rent: "Sewa",
  tax: "Pajak",
  other: "Lain-lain",
};

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";
const labelClass = "mb-1 block text-xs font-medium text-slate-600";

interface FormValues {
  fieldId: string;
  seasonId: string;
  date: string;
  type: ActivityType;
  title: string;
  description: string;
  performedBy: string;
  status: ActivityStatus;
}

export default function ActivityTimeline() {
  useDataVersion();
  const [fieldId, setFieldId] = useState<string>("all");
  const [open, setOpen] = useState(false);

  // Linimasa menggabungkan aktivitas lapangan + pengeluaran (tanggal & biaya),
  // bisa difilter per lahan atau ditampilkan semua.
  const filtered = [
    ...activities
      .filter((a) => fieldId === "all" || a.fieldId === fieldId)
      .map((a) => ({ kind: "activity" as const, date: a.date, data: a })),
    ...expenses
      .filter((e) => fieldId === "all" || e.fieldId === fieldId)
      .map((e) => ({ kind: "expense" as const, date: e.date, data: e })),
  ].sort((a, b) => +new Date(b.date) - +new Date(a.date));

  return (
    <PageTransition>
      <PageHeader
        title="Activity Timeline"
        description="Linimasa aktivitas operasional lapangan."
        actions={
          <Button onClick={() => setOpen(true)}>
            <FiPlus size={16} /> Tambah Aktivitas
          </Button>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <FilterChip
          active={fieldId === "all"}
          onClick={() => setFieldId("all")}
          label="Semua"
        />
        {fields.map((f) => (
          <FilterChip
            key={f.id}
            active={fieldId === f.id}
            onClick={() => setFieldId(f.id)}
            label={f.name}
          />
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Tidak ada aktivitas"
          description="Belum ada aktivitas untuk lahan ini."
        />
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          {filtered.map((item, i) =>
            item.kind === "activity" ? (
              <div key={`act-${item.data.id}`} className="group relative">
                <button
                  onClick={() => removeActivity(item.data.id)}
                  aria-label="Hapus aktivitas"
                  className="absolute right-0 top-2 z-10 rounded-lg p-1.5 text-slate-300 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                >
                  <FiTrash2 size={14} />
                </button>
                <TimelineCard
                  activity={item.data}
                  isLast={i === filtered.length - 1}
                />
              </div>
            ) : (
              <ExpenseTimelineRow
                key={`exp-${item.data.id}`}
                expense={item.data}
                isLast={i === filtered.length - 1}
              />
            ),
          )}
        </div>
      )}

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Tambah Aktivitas"
      >
        <ActivityForm onDone={() => setOpen(false)} />
      </Modal>
    </PageTransition>
  );
}

function ActivityForm({ onDone }: { onDone: () => void }) {
  const { register, handleSubmit, watch, formState } = useForm<FormValues>({
    defaultValues: {
      fieldId: fields[0]?.id ?? "",
      seasonId: "",
      date: new Date().toISOString().slice(0, 10),
      type: "maintenance",
      status: "completed",
      performedBy: "Tyo Pratama",
    },
  });
  const fid = watch("fieldId");
  const seasonOptions = fid ? getSeasonsByField(fid) : [];

  const onSubmit = (v: FormValues) => {
    const season = getSeasonById(v.seasonId);
    if (!season) return;
    addActivity({
      seasonId: v.seasonId,
      fieldId: season.fieldId,
      date: v.date,
      type: v.type,
      title: v.title,
      description: v.description,
      performedBy: v.performedBy,
      status: v.status,
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
          placeholder="mis. Pemupukan susulan"
          {...register("title", { required: true })}
        />
      </div>
      <div>
        <label className={labelClass}>Deskripsi</label>
        <textarea
          rows={2}
          className={inputClass}
          {...register("description")}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Jenis</label>
          <select className={inputClass} {...register("type")}>
            <option value="planting">Penanaman</option>
            <option value="fertilizing">Pemupukan</option>
            <option value="irrigation">Pengairan</option>
            <option value="pest-control">Pengendalian Hama</option>
            <option value="harvest">Panen</option>
            <option value="maintenance">Perawatan</option>
            <option value="inspection">Inspeksi</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Status</label>
          <select className={inputClass} {...register("status")}>
            <option value="completed">Selesai</option>
            <option value="in-progress">Berjalan</option>
            <option value="planned">Rencana</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Tanggal</label>
          <input type="date" className={inputClass} {...register("date")} />
        </div>
        <div>
          <label className={labelClass}>Oleh</label>
          <input className={inputClass} {...register("performedBy")} />
        </div>
      </div>
      {formState.errors.seasonId ? (
        <p className="text-xs text-red-500">Pilih musim terlebih dahulu.</p>
      ) : null}
      <div className="flex justify-end gap-2 pt-1">
        <Button type="submit">Simpan Aktivitas</Button>
      </div>
    </form>
  );
}

function ExpenseTimelineRow({
  expense,
  isLast,
}: {
  expense: Expense;
  isLast?: boolean;
}) {
  return (
    <div className="relative pl-8">
      <span className="absolute left-0 top-1.5 h-3 w-3 rounded-full border-2 border-amber-500 bg-white" />
      {!isLast && (
        <span className="absolute left-1.5 top-4 h-full w-px bg-slate-200" />
      )}
      <div className="pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs text-slate-400">{formatDate(expense.date)}</p>
          <Badge tone="amber">Pengeluaran</Badge>
          <span className="text-xs font-medium text-red-600">
            − {formatCurrency(expense.amount)}
          </span>
        </div>
        <h4 className="mt-1 font-medium text-slate-800">
          {expenseCategoryLabel[expense.category]} ·{" "}
          {getFieldName(expense.fieldId)}
        </h4>
        <p className="text-sm text-slate-500">{expense.description}</p>
      </div>
    </div>
  );
}

function FilterChip({
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
          ? "bg-brand-600 text-white"
          : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
      }`}
    >
      {label}
    </button>
  );
}
