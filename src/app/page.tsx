import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-dogwood-linen p-6">
      <div className="w-full max-w-2xl rounded-lg border border-dogwood-green/15 bg-white/90 p-8 shadow-sm">
        <div className="grid h-16 w-44 place-items-center rounded-md border border-dogwood-green/15 bg-dogwood-cream p-2">
          <Image
            alt="Dogwood Golf & Social logo"
            className="h-full w-full object-contain"
            height={64}
            priority
            src="/brand/logos/Dogwood-Full-Green.svg"
            width={160}
          />
        </div>
        <p className="mt-8 text-sm font-semibold uppercase tracking-wide text-dogwood-leaf">
          Dogwood Golf & Social
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-dogwood-ink sm:text-5xl">
          Player Portal
        </h1>
        <p className="mt-4 text-base leading-7 text-dogwood-ink/75">
          A private academy workspace for development priorities, practice,
          lessons, assessments, files, and fitness plans.
        </p>
        <Link
          className="mt-8 inline-flex rounded-md bg-dogwood-green px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-dogwood-ink"
          href="/login"
        >
          Continue
        </Link>
      </div>
    </main>
  );
}
