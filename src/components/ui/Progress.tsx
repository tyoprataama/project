interface ProgressProps {
  value: number;
  label?: string;
  colorClass?: string;
}

export function Progress({
  value,
  label,
  colorClass = "bg-brand-500",
}: ProgressProps) {
  const v = Math.min(100, Math.max(0, value));
  return (
    <div>
      {label && (
        <div className="mb-1 flex justify-between text-xs text-slate-500">
          <span>{label}</span>
          <span>{v}%</span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all ${colorClass}`}
          style={{ width: `${v}%` }}
        />
      </div>
    </div>
  );
}
