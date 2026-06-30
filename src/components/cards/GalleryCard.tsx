import type { GalleryItem } from "../../types";
import { formatDate } from "../../utils/format";
import { normalizeImageUrl } from "../../utils/image";

export function GalleryCard({
  item,
  onClick,
}: {
  item: GalleryItem;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-sm transition hover:shadow-md"
    >
      <div className="aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={normalizeImageUrl(item.imageUrl)}
          alt={item.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-3">
        <p className="text-xs text-slate-400">{formatDate(item.date)}</p>
        <h4 className="font-medium text-slate-800">{item.title}</h4>
        <p className="text-xs text-slate-500">{item.stage}</p>
      </div>
    </button>
  );
}
