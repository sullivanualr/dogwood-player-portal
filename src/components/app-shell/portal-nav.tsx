import Link from "next/link";
import { signOut } from "@/app/(auth)/actions";
import { PortalNavLinks } from "@/components/app-shell/portal-nav-links";
import {
  getDefaultPathForRoles,
  ROLE_LABELS,
  type AppRole
} from "@/lib/auth/roles";

const NAV_GROUPS: Array<{
  label: string;
  items: Array<{
  href: string;
  label: string;
  roles: AppRole[];
  }>;
}> = [
  {
    label: "Main",
    items: [
      { href: "/admin", label: "Dashboard", roles: ["admin"] },
      { href: "/admin/students", label: "Players", roles: ["admin"] },
      { href: "/coach", label: "Coach Dashboard", roles: ["admin", "coach"] },
      { href: "/student", label: "Snapshot", roles: ["student"] },
      { href: "/parent", label: "Players", roles: ["parent"] },
      { href: "/fitness", label: "Fitness/PT", roles: ["fitness_pt"] }
    ]
  },
  {
    label: "Operations",
    items: [
      { href: "/admin/programs", label: "Programs", roles: ["admin"] },
      { href: "/admin/assignments", label: "Assignments", roles: ["admin"] },
      { href: "/admin/users", label: "Users", roles: ["admin"] }
    ]
  }
];

export function PortalNav({ roles }: { roles: AppRole[] }) {
  const visibleGroups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) =>
      item.roles.some((role) => roles.includes(role))
    )
  })).filter((group) => group.items.length);
  const homeHref = getDefaultPathForRoles(roles);

  return (
    <header className="border-b border-dogwood-green/10 bg-white/92 backdrop-blur lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-72 lg:flex-col lg:border-b-0 lg:bg-dogwood-green lg:text-white lg:shadow-[10px_0_35px_rgba(24,35,29,0.18)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 lg:mx-0 lg:h-full lg:max-w-none lg:flex-col lg:items-stretch lg:justify-start lg:px-6 lg:py-8">
        <Link
          className="flex items-center gap-3 font-semibold text-dogwood-ink lg:block lg:text-white"
          href={homeHref}
        >
          <span className="grid h-12 w-36 shrink-0 place-items-center bg-transparent p-0">
            <img
              alt="Dogwood Golf & Social logo"
              className="h-full w-full object-contain"
              height={48}
              src="/brand/logos/Dogwood-Full-Cream.svg"
              width={144}
            />
          </span>
        </Link>
        <nav className="hidden items-center gap-1.5 text-sm md:flex lg:mt-12 lg:grid lg:items-stretch lg:gap-7">
          {visibleGroups.map((group) => (
            <div className="lg:grid lg:gap-2" key={group.label}>
              <p className="hidden px-3 text-[0.68rem] font-semibold uppercase tracking-wide text-white/45 lg:block">
                {group.label}
              </p>
              <div className="flex items-center gap-1.5 lg:grid lg:gap-1">
                <PortalNavLinks items={group.items} />
              </div>
            </div>
          ))}
        </nav>
        <div className="flex items-center gap-3 lg:mt-auto lg:grid lg:gap-4">
          <span className="hidden text-xs text-dogwood-ink/60 sm:inline lg:block lg:rounded-md lg:border lg:border-white/10 lg:bg-white/5 lg:px-3 lg:py-2 lg:text-white/60">
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
        <PortalNavLinks items={visibleGroups.flatMap((group) => group.items)} />
      </nav>
    </header>
  );
}
