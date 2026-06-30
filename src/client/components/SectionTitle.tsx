import type { ReactNode } from "react";

export function SectionTitle({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
}) {
  const isCenter = align === "center";
  return (
    <div className={`max-w-2xl ${isCenter ? "mx-auto text-center" : ""}`}>
      {eyebrow ? (
        <div
          className={`flex items-center gap-2 ${isCenter ? "justify-center" : ""}`}
        >
          <span className="h-px w-6 bg-leaf-500" />
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-tulus-600">
            {eyebrow}
          </span>
        </div>
      ) : null}
      <h2 className="mt-3 font-display text-3xl font-medium leading-tight text-ink sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-base leading-relaxed text-ink-muted">
          {description}
        </p>
      ) : null}
    </div>
  );
}
