import type { ReactNode } from "react";
import { FiInbox } from "react-icons/fi";

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export function EmptyState({
  title = "Belum ada data",
  description,
  action,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center">
      <div className="text-slate-300">{icon ?? <FiInbox size={40} />}</div>
      <div>
        <p className="font-medium text-slate-700">{title}</p>
        {description && (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
