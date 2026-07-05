import type { FieldStatus } from "../../types";

export interface StatusMeta {
  label: string;
  className: string;
  dot: string;
}

export const fieldStatusMeta: Record<FieldStatus, StatusMeta> = {
  active: {
    label: "Aktif",
    className:
      "bg-leaf-50 text-leaf-700 ring-leaf-600/20 dark:bg-[#72BC8F]/15 dark:text-[#8fdcae] dark:ring-[#72BC8F]/30",
    dot: "bg-leaf-500",
  },
  preparing: {
    label: "Persiapan",
    className:
      "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-400/15 dark:text-[#e8c07a] dark:ring-amber-400/25",
    dot: "bg-amber-500",
  },
  harvested: {
    label: "Panen Selesai",
    className:
      "bg-tulus-50 text-tulus-700 ring-tulus-600/20 dark:bg-[#5E9FE8]/15 dark:text-[#8fbdf0] dark:ring-[#5E9FE8]/30",
    dot: "bg-tulus-500",
  },
  fallow: {
    label: "Bera",
    className:
      "bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-white/10 dark:text-white/70 dark:ring-white/20",
    dot: "bg-slate-400",
  },
};
