import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <span className="h-px w-6 bg-leaf-500" />
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-tulus-600">
            Dashboard
          </span>
        </div>
        <h1 className="mt-2 font-display text-3xl font-medium text-ink">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-muted">
            {description}
          </p>
        )}
      </div>
      {actions}
    </div>
  );
}
