import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  detail,
  tone = "default"
}: {
  label: string;
  value: ReactNode;
  detail?: string;
  tone?: "default" | "attention";
}) {
  return (
    <div
      className={
        tone === "attention"
          ? "rounded-lg border border-dogwood-brass/25 bg-dogwood-cream/55 p-5 shadow-[0_12px_30px_rgba(24,35,29,0.05)]"
          : "rounded-lg border border-dogwood-green/10 bg-white/90 p-5 shadow-[0_12px_30px_rgba(24,35,29,0.05)]"
      }
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-dogwood-ink/50">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold leading-none text-dogwood-green">
        {value}
      </p>
      {detail ? (
        <p className="mt-3 text-sm leading-5 text-dogwood-ink/60">{detail}</p>
      ) : null}
    </div>
  );
}
