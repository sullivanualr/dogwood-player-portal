import type { ReactNode } from "react";

export function SnapshotSection({
  title,
  description,
  children
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-dogwood-green/10 bg-white/92 p-4 shadow-[0_12px_34px_rgba(24,35,29,0.05)] sm:p-5">
      <div className="flex items-start justify-between gap-4 border-b border-dogwood-green/8 pb-3">
        <h2 className="text-lg font-semibold leading-tight text-dogwood-ink">
          {title}
        </h2>
        {description ? (
          <p className="max-w-sm text-sm leading-6 text-dogwood-ink/60">
            {description}
          </p>
        ) : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function EmptySnapshotState({
  title = "Ready for the next update",
  message,
  action
}: {
  title?: string;
  message: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-dashed border-dogwood-green/20 bg-dogwood-cream/40 px-4 py-5 text-sm leading-6 text-dogwood-ink/62">
      <p className="font-semibold text-dogwood-ink/78">{title}</p>
      <p className="mt-1">{message}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function SnapshotField({
  label,
  value
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-dogwood-ink/45">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-dogwood-ink">
        {value || "Not set"}
      </dd>
    </div>
  );
}
