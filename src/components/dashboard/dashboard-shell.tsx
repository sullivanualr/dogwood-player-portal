import type { ReactNode } from "react";

export function DashboardShell({
  title,
  eyebrow,
  children
}: {
  title: string;
  eyebrow: string;
  children: ReactNode;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="border-b border-dogwood-green/10 pb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-dogwood-leaf">
          {eyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-dogwood-ink sm:text-4xl">
          {title}
        </h1>
      </div>
      <div className="mt-6 rounded-lg border border-dogwood-green/10 bg-white/92 p-5 shadow-sm sm:p-6">
        {children}
      </div>
    </section>
  );
}
