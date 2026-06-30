import type { IconType } from "react-icons";
import { Card } from "../ui/Card";

interface StatisticCardProps {
  label: string;
  value: string;
  icon: IconType;
  trend?: { value: string; positive: boolean };
  accentClass?: string;
}

export function StatisticCard({
  label,
  value,
  icon: Icon,
  trend,
  accentClass = "bg-brand-50 text-brand-600",
}: StatisticCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-slate-800">{value}</p>
        </div>
        <div className={`rounded-lg p-2.5 ${accentClass}`}>
          <Icon size={20} />
        </div>
      </div>
      {trend && (
        <p
          className={`mt-3 text-xs font-medium ${trend.positive ? "text-emerald-600" : "text-red-600"}`}
        >
          {trend.positive ? "▲" : "▼"} {trend.value}
        </p>
      )}
    </Card>
  );
}
