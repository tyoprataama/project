import type { ReactNode } from "react";

export function Stat({
  value,
  label,
  sub,
}: {
  value: ReactNode;
  label: string;
  sub?: string;
}) {
  return (
    <div>
      <div className="font-display text-3xl font-medium leading-none text-ink dark:text-white sm:text-4xl">
        {value}
      </div>
      <div className="mt-2 text-sm font-medium text-ink dark:text-white/90">
        {label}
      </div>
      {sub ? (
        <div className="mt-0.5 text-xs text-ink-muted dark:text-white/50">
          {sub}
        </div>
      ) : null}
    </div>
  );
}
