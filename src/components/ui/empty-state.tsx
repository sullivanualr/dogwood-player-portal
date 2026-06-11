import type { ReactNode } from "react";

export function EmptyState({
  title,
  message,
  action,
  compact = false
}: {
  title: string;
  message: string;
  action?: ReactNode;
  compact?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border border-dashed border-dogwood-green/20 bg-dogwood-cream/40 text-center ${
        compact ? "px-4 py-5" : "px-6 py-8"
      }`}
    >
      <p className="text-sm font-semibold text-dogwood-ink">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-dogwood-ink/62">
        {message}
      </p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}
