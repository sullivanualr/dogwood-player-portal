import type { ReactNode } from "react";
import { PortalNav } from "@/components/app-shell/portal-nav";
import { getCurrentUserRoles, requireUser } from "@/lib/auth/server";

export default async function PortalLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  await requireUser();
  const roles = await getCurrentUserRoles();

  return (
    <main className="min-h-screen bg-dogwood-linen text-dogwood-ink">
      <div className="min-h-screen lg:flex">
        <PortalNav roles={roles} />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </main>
  );
}
