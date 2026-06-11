import Link from "next/link";

export type SetupChecklistItem = {
  label: string;
  complete: boolean;
  href: string;
};

export function SetupChecklist({ items }: { items: SetupChecklistItem[] }) {
  return (
    <div className="grid gap-2">
      {items.map((item) => (
        <Link
          className="group flex items-center justify-between gap-3 rounded-md border border-dogwood-green/10 bg-white/70 px-3.5 py-3 hover:border-dogwood-green/20 hover:bg-dogwood-cream/45"
          href={item.href}
          key={item.label}
        >
          <span className="flex items-center gap-3 text-sm font-medium text-dogwood-ink">
            <span
              className={
                item.complete
                  ? "grid h-5 w-5 place-items-center rounded-full bg-dogwood-green text-[0.68rem] text-white"
                  : "grid h-5 w-5 place-items-center rounded-full border border-dogwood-green/20 text-[0.68rem] text-dogwood-ink/45"
              }
            >
              {item.complete ? "OK" : ""}
            </span>
            {item.label}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wide text-dogwood-ink/45 group-hover:text-dogwood-green">
            Open
          </span>
        </Link>
      ))}
    </div>
  );
}
