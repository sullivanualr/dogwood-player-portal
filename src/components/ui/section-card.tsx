import type { ReactNode } from "react";

export function SectionCard({
  title,
  description,
  actions,
  children,
  className = ""
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-lg border border-dogwood-green/10 bg-white/90 shadow-[0_14px_40px_rgba(24,35,29,0.06)] ${className}`}
    >
      {title || description || actions ? (
        <div className="flex flex-col gap-3 border-b border-dogwood-green/8 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {title ? (
              <h2 className="text-lg font-semibold leading-tight text-dogwood-ink">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="mt-1 text-sm leading-6 text-dogwood-ink/60">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
        </div>
      ) : null}
      <div className="p-5">{children}</div>
    </section>
  );
}
