import { useState } from "react";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { FiTrash2 } from "react-icons/fi";
import { PageTransition } from "../components/ui/PageTransition";
import { PageHeader } from "../components/ui/PageHeader";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import {
  decisions,
  fields,
  getSeasonsByField,
  getFieldName,
  addDecision,
  removeDecision,
  useDataVersion,
} from "../data";
import { formatDate } from "../utils/format";
import type { DecisionImpact } from "../types";
import type { BadgeTone } from "../components/ui/Badge";

const impactTone: Record<DecisionImpact, BadgeTone> = {
  high: "red",
  medium: "amber",
  low: "slate",
};
const impactLabel: Record<DecisionImpact, string> = {
  high: "Tinggi",
  medium: "Sedang",
  low: "Rendah",
};
const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";

interface FormValues {
  fieldId: string;
  seasonId: string;
  title: string;
  context: string;
  decision: string;
  rationale: string;
  impact: DecisionImpact;
  decidedBy: string;
}

export default function DecisionLog() {
  useDataVersion();
  const { register, handleSubmit, reset, watch, formState } =
    useForm<FormValues>({
      defaultValues: {
        impact: "medium",
        decidedBy: "Tyo Pratama",
        fieldId: fields[0]?.id ?? "",
        seasonId: "",
      },
    });

  const selectedFieldId = watch("fieldId");
  const seasonOptions = selectedFieldId
    ? getSeasonsByField(selectedFieldId)
    : [];

  const onSubmit = (values: FormValues) => {
    addDecision({
      date: new Date().toISOString().slice(0, 10),
      fieldId: values.fieldId,
      seasonId: values.seasonId || undefined,
      title: values.title,
      context: values.context,
      decision: values.decision,
      rationale: values.rationale,
      impact: values.impact,
      decidedBy: values.decidedBy,
    });
    reset({
      impact: "medium",
      decidedBy: "Tyo Pratama",
      fieldId: values.fieldId,
      seasonId: "",
      title: "",
      context: "",
      decision: "",
      rationale: "",
    });
  };

  const sorted = [...decisions].sort(
    (a, b) => +new Date(b.date) - +new Date(a.date),
  );

  return (
    <PageTransition>
      <PageHeader
        title="Decision Log"
        description="Catatan keputusan operasional beserta konteks & alasannya. Tersimpan ke sumber data bersama."
      />

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <Card className="h-fit p-5">
          <h3 className="mb-4 font-semibold text-slate-800">
            Tambah Keputusan
          </h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Lahan">
                <select className={inputClass} {...register("fieldId")}>
                  {fields.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Musim (opsional)">
                <select className={inputClass} {...register("seasonId")}>
                  <option value="">— Tidak terkait —</option>
                  {seasonOptions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.year} · {s.crop}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>
            <FormField label="Judul" error={formState.errors.title?.message}>
              <input
                className={inputClass}
                placeholder="Judul keputusan"
                {...register("title", { required: "Judul wajib diisi" })}
              />
            </FormField>
            <FormField
              label="Konteks"
              error={formState.errors.context?.message}
            >
              <textarea
                rows={2}
                className={inputClass}
                placeholder="Situasi yang melatarbelakangi"
                {...register("context", { required: "Konteks wajib diisi" })}
              />
            </FormField>
            <FormField
              label="Keputusan"
              error={formState.errors.decision?.message}
            >
              <textarea
                rows={2}
                className={inputClass}
                placeholder="Keputusan yang diambil"
                {...register("decision", { required: "Keputusan wajib diisi" })}
              />
            </FormField>
            <FormField label="Alasan">
              <textarea
                rows={2}
                className={inputClass}
                placeholder="Alasan / pertimbangan"
                {...register("rationale")}
              />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Dampak">
                <select className={inputClass} {...register("impact")}>
                  <option value="high">Tinggi</option>
                  <option value="medium">Sedang</option>
                  <option value="low">Rendah</option>
                </select>
              </FormField>
              <FormField label="Diputuskan oleh">
                <input className={inputClass} {...register("decidedBy")} />
              </FormField>
            </div>
            <Button type="submit" fullWidth>
              Simpan Keputusan
            </Button>
          </form>
        </Card>

        <div className="space-y-3">
          {sorted.length === 0 ? (
            <EmptyState title="Belum ada keputusan" />
          ) : (
            sorted.map((d) => (
              <Card key={d.id} className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold text-slate-800">{d.title}</h3>
                  <div className="flex items-center gap-2">
                    <Badge tone={impactTone[d.impact]}>
                      Dampak {impactLabel[d.impact]}
                    </Badge>
                    <button
                      onClick={() => removeDecision(d.id)}
                      aria-label="Hapus keputusan"
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                    >
                      <FiTrash2 size={15} />
                    </button>
                  </div>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  {formatDate(d.date)} · {d.decidedBy}
                  {d.fieldId ? ` · ${getFieldName(d.fieldId)}` : ""}
                </p>
                <dl className="mt-3 space-y-1.5 text-sm">
                  <Row label="Konteks" value={d.context} />
                  <Row label="Keputusan" value={d.decision} />
                  <Row label="Alasan" value={d.rationale} />
                  {d.outcome ? <Row label="Hasil" value={d.outcome} /> : null}
                </dl>
              </Card>
            ))
          )}
        </div>
      </div>
    </PageTransition>
  );
}

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-600">
        {label}
      </label>
      {children}
      {error ? <p className="mt-1 text-xs text-red-500">{error}</p> : null}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="shrink-0 font-medium text-slate-500">{label}:</dt>
      <dd className="text-slate-600">{value}</dd>
    </div>
  );
}
