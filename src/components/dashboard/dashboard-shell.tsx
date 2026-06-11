import type { ReactNode } from "react";
import { PageHeader } from "@/components/ui/page-header";

export function DashboardShell({
  title,
  eyebrow,
  description,
  actions,
  children
}: {
  title: string;
  eyebrow: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
      <PageHeader
        actions={actions}
        description={description}
        eyebrow={eyebrow}
        title={title}
      />
      <div className="mt-6">{children}</div>
    </section>
  );
}
