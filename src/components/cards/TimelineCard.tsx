import type { Activity } from "../../types";
import { formatDate } from "../../utils/format";
import { Badge } from "../ui/Badge";

export function TimelineCard({
  activity,
  isLast,
}: {
  activity: Activity;
  isLast?: boolean;
}) {
  return (
    <div className="relative pl-8">
      <span className="absolute left-0 top-1.5 h-3 w-3 rounded-full border-2 border-brand-500 bg-white" />
      {!isLast && (
        <span className="absolute left-1.5 top-4 h-full w-px bg-slate-200" />
      )}
      <div className="pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs text-slate-400">{formatDate(activity.date)}</p>
          <Badge tone="blue">{activity.type}</Badge>
        </div>
        <h4 className="mt-1 font-medium text-slate-800">{activity.title}</h4>
        <p className="text-sm text-slate-500">{activity.description}</p>
      </div>
    </div>
  );
}
