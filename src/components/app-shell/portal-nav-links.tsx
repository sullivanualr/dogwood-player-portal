"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type PortalNavItem = {
  href: string;
  label: string;
};

function isActivePath(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PortalNavLinks({ items }: { items: PortalNavItem[] }) {
  const pathname = usePathname();

  return (
    <>
      {items.map((item) => {
        const isActive = isActivePath(pathname, item.href);

        return (
          <Link
            aria-current={isActive ? "page" : undefined}
            className={
              isActive
                ? "shrink-0 rounded-md bg-white px-3 py-2.5 font-semibold text-dogwood-green shadow-sm"
                : "shrink-0 rounded-md px-3 py-2.5 font-medium text-dogwood-ink/70 hover:bg-dogwood-cream hover:text-dogwood-ink lg:text-white/72 lg:hover:bg-white/10 lg:hover:text-white"
            }
            href={item.href}
            key={item.href}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}
