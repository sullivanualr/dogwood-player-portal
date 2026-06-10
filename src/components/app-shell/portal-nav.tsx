import Link from "next/link";
import { signOut } from "@/app/(auth)/actions";
import {
  getDefaultPathForRoles,
  ROLE_LABELS,
  type AppRole
} from "@/lib/auth/roles";

const NAV_ITEMS: Array<{
  href: string;
  label: string;
  roles: AppRole[];
}> = [
  { href: "/admin", label: "Admin", roles: ["admin"] },
  { href: "/admin/students", label: "Students", roles: ["admin"] },
  { href: "/coach", label: "Students", roles: ["coach"] },
  { href: "/student", label: "Student", roles: ["student"] },
  { href: "/parent", label: "Parent", roles: ["parent"] },
  { href: "/fitness", label: "Fitness/PT", roles: ["fitness_pt"] }
];

export function PortalNav({ roles }: { roles: AppRole[] }) {
  const visibleItems = NAV_ITEMS.filter((item) =>
    item.roles.some((role) => roles.includes(role))
  );
  const homeHref = getDefaultPathForRoles(roles);

  return (
    <header className="border-b border-dogwood-green/10 bg-white/90 backdrop-blur lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-72 lg:flex-col lg:border-b-0 lg:border-r lg:bg-dogwood-green lg:text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 lg:mx-0 lg:h-full lg:max-w-none lg:flex-col lg:items-stretch lg:justify-start lg:px-5 lg:py-6">
        <Link
          className="flex items-center gap-3 font-semibold text-dogwood-ink lg:text-white"
          href={homeHref}
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md border border-dogwood-green/20 bg-dogwood-cream text-xs font-bold tracking-wide text-dogwood-green shadow-sm lg:border-white/15">
            DG
          </span>
          <span className="leading-tight">
            <span className="block text-base">Dogwood</span>
            <span className="block text-xs font-medium uppercase tracking-wide text-dogwood-ink/60 lg:text-white/60">
              Player Portal
            </span>
          </span>
        </Link>
        <nav className="hidden items-center gap-2 text-sm md:flex lg:mt-8 lg:grid lg:items-stretch">
          {visibleItems.map((item) => (
            <Link
              className="rounded-md px-3 py-2 font-medium text-dogwood-ink/70 hover:bg-dogwood-cream hover:text-dogwood-ink lg:text-white/75 lg:hover:bg-white/10 lg:hover:text-white"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3 lg:mt-auto lg:grid lg:gap-4">
          <span className="hidden text-xs text-dogwood-ink/60 sm:inline lg:block lg:rounded-md lg:border lg:border-white/10 lg:bg-white/10 lg:px-3 lg:py-2 lg:text-white/65">
            {roles.map((role) => ROLE_LABELS[role]).join(", ")}
          </span>
          <form action={signOut}>
            <button
              className="rounded-md bg-dogwood-green px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-dogwood-ink lg:w-full lg:bg-white lg:text-dogwood-green lg:hover:bg-dogwood-cream"
              type="submit"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
      <nav className="flex gap-2 overflow-x-auto border-t border-dogwood-green/10 px-5 py-3 text-sm md:hidden">
        {visibleItems.map((item) => (
          <Link
            className="shrink-0 rounded-md border border-dogwood-green/15 bg-white px-3 py-2 font-medium text-dogwood-ink/75"
            href={item.href}
            key={item.href}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
