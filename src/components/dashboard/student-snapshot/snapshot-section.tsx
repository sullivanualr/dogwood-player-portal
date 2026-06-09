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
    <section className="rounded-lg border border-dogwood-green/15 bg-white/95 p-5 shadow-sm">
      <div>
        <h2 className="text-base font-semibold text-dogwood-ink">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm leading-6 text-dogwood-ink/65">
            {description}
          </p>
        ) : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function EmptySnapshotState({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-dashed border-dogwood-green/25 bg-dogwood-cream/55 px-4 py-5 text-sm leading-6 text-dogwood-ink/65">
      {message}
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
      <dt className="text-xs font-semibold uppercase tracking-wide text-dogwood-ink/50">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-dogwood-ink">{value || "Not set"}</dd>
    </div>
  );
}
