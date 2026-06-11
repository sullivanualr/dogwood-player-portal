import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

const baseButtonClass =
  "inline-flex items-center justify-center rounded-md px-3.5 py-2 text-sm font-semibold shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

export function PrimaryButton({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`${baseButtonClass} bg-dogwood-green text-white hover:bg-dogwood-ink focus-visible:outline-dogwood-brass ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`${baseButtonClass} border border-dogwood-green/15 bg-dogwood-cream/55 text-dogwood-green hover:border-dogwood-green/25 hover:bg-dogwood-cream focus-visible:outline-dogwood-brass ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function PrimaryButtonLink({
  children,
  className = "",
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children: ReactNode }) {
  return (
    <Link
      className={`${baseButtonClass} bg-dogwood-green text-white hover:bg-dogwood-ink focus-visible:outline-dogwood-brass ${className}`}
      {...props}
    >
      {children}
    </Link>
  );
}

export function SecondaryButtonLink({
  children,
  className = "",
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children: ReactNode }) {
  return (
    <Link
      className={`${baseButtonClass} border border-dogwood-green/15 bg-dogwood-cream/55 text-dogwood-green hover:border-dogwood-green/25 hover:bg-dogwood-cream focus-visible:outline-dogwood-brass ${className}`}
      {...props}
    >
      {children}
    </Link>
  );
}
