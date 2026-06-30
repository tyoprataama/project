import type { Activity, ActivityStatus } from "../../types";
import type { BadgeTone } from "../ui/Badge";
import { Badge } from "../ui/Badge";
import { formatCurrency, formatDate } from "../../utils/format";
import { getFieldName } from "../../data";

const statusTone: Record<ActivityStatus, BadgeTone> = {
  completed: "green",
  "in-progress": "amber",
  planned: "slate",
};

const statusLabel: Record<ActivityStatus, string> = {
  completed: "Selesai",
  "in-progress": "Berjalan",
  planned: "Direncanakan",
};

export function ActivityCard({ activity }: { activity: Activity }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400">
            {formatDate(activity.date)}
          </span>
          <Badge tone="blue">{activity.type}</Badge>
          <Badge tone={statusTone[activity.status]}>
            {statusLabel[activity.status]}
          </Badge>
        </div>
        <h4 className="mt-1 font-medium text-slate-800">{activity.title}</h4>
        <p className="text-sm text-slate-500">{activity.description}</p>
        <p className="mt-1 text-xs text-slate-400">
          {getFieldName(activity.fieldId)} · {activity.performedBy}
        </p>
      </div>
      {activity.cost !== undefined && (
        <span className="shrink-0 text-sm font-medium text-slate-700">
          {formatCurrency(activity.cost)}
        </span>
      )}
    </div>
  );
}
