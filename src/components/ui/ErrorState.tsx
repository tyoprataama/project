import type { ReactNode } from "react";
import { FiAlertTriangle } from "react-icons/fi";

interface ErrorStateProps {
  title?: string;
  description?: string;
  action?: ReactNode;
}

export function ErrorState({
  title = "Terjadi kesalahan",
  description = "Tidak dapat memuat data. Silakan coba lagi.",
  action,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-red-200 bg-red-50/50 py-16 text-center">
      <FiAlertTriangle className="text-red-400" size={40} />
      <div>
        <p className="font-medium text-slate-800">{title}</p>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      {action}
    </div>
  );
}
