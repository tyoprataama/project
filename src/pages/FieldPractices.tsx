import { useState } from "react";
import { useForm } from "react-hook-form";
import { FiChevronDown, FiPlus, FiTrash2 } from "react-icons/fi";
import { PageTransition } from "../components/ui/PageTransition";
import { PageHeader } from "../components/ui/PageHeader";
import { Badge } from "../components/ui/Badge";
import { Modal } from "../components/ui/Modal";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import {
  practices,
  fields,
  getSeasonsByField,
  getSeasonById,
  getFieldName,
  addPractice,
  removePractice,
  useDataVersion,
} from "../data";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";
const labelClass = "mb-1 block text-xs font-medium text-slate-600";

interface FormValues {
  fieldId: string;
  seasonId: string;
  category: string;
  title: string;
  description: string;
  steps: string;
}

export default function FieldPractices() {
  useDataVersion();
  const [openId, setOpenId] = useState<string | null>(practices[0]?.id ?? null);
  const [open, setOpen] = useState(false);

  return (
    <PageTransition>
      <PageHeader
        title="Field Practices"
        description="Praktik & SOP operasional yang diterapkan di lapangan."
        actions={
          <Button onClick={() => setOpen(true)}>
            <FiPlus size={16} /> Tambah Praktik
          </Button>
        }
      />

      {practices.length === 0 ? (
        <EmptyState title="Belum ada praktik" />
      ) : (
        <div className="space-y-3">
          {practices.map((p) => {
            const isOpen = openId === p.id;
            return (
              <div
                key={p.id}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white"
              >
                <div className="flex items-center">
                  <button
                    onClick={() => setOpenId(isOpen ? null : p.id)}
                    className="flex flex-1 items-center justify-between gap-3 px-5 py-4 text-left"
                  >
                    <div>
                      <Badge tone="green">{p.category}</Badge>
                      <h3 className="mt-1 font-semibold text-slate-800">
                        {p.title}
                      </h3>
                    </div>
                    <FiChevronDown
                      className={`shrink-0 text-slate-400 transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => removePractice(p.id)}
                    aria-label="Hapus praktik"
                    className="mr-3 rounded-lg p-2 text-slate-300 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <FiTrash2 size={15} />
                  </button>
                </div>
                {isOpen && (
                  <div className="border-t border-slate-100 px-5 py-4">
                    <p className="text-sm text-slate-600">{p.description}</p>
                    <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-slate-600">
                      {p.steps.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ol>
                    <p className="mt-3 text-xs text-slate-400">
                      Diterapkan di: {getFieldName(p.fieldId)}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Tambah Praktik"
      >
        <PracticeForm onDone={() => setOpen(false)} />
      </Modal>
    </PageTransition>
  );
}

function PracticeForm({ onDone }: { onDone: () => void }) {
  const { register, handleSubmit, watch } = useForm<FormValues>({
    defaultValues: {
      fieldId: fields[0]?.id ?? "",
      seasonId: "",
      category: "Budidaya",
    },
  });
  const fid = watch("fieldId");
  const seasonOptions = fid ? getSeasonsByField(fid) : [];

  const onSubmit = (v: FormValues) => {
    const season = getSeasonById(v.seasonId);
    if (!season) return;
    addPractice({
      seasonId: v.seasonId,
      fieldId: season.fieldId,
      category: v.category,
      title: v.title,
      description: v.description,
      steps: v.steps
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
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
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Kategori</label>
          <input
            className={inputClass}
            placeholder="mis. Pemupukan"
            {...register("category")}
          />
        </div>
        <div>
          <label className={labelClass}>Judul</label>
          <input
            className={inputClass}
            placeholder="mis. SOP pemupukan tebu"
            {...register("title", { required: true })}
          />
        </div>
      </div>
      <div>
        <label className={labelClass}>Deskripsi</label>
        <textarea
          rows={2}
          className={inputClass}
          {...register("description")}
        />
      </div>
      <div>
        <label className={labelClass}>Langkah (satu per baris)</label>
        <textarea
          rows={4}
          className={inputClass}
          placeholder={"Langkah 1\nLangkah 2\nLangkah 3"}
          {...register("steps")}
        />
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <Button type="submit">Simpan Praktik</Button>
      </div>
    </form>
  );
}
