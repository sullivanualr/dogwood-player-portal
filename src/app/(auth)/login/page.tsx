import { signIn } from "@/app/(auth)/actions";
import { getCurrentUser, getCurrentUserDefaultPath } from "@/lib/auth/server";
import Image from "next/image";
import { redirect } from "next/navigation";

type LoginPageProps = {
  searchParams?: Promise<{
    message?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  if (await getCurrentUser()) {
    redirect(await getCurrentUserDefaultPath());
  }

  const params = await searchParams;

  return (
    <main className="grid min-h-screen bg-dogwood-linen p-4 lg:grid-cols-[1fr_28rem] lg:p-6">
      <section className="hidden rounded-lg bg-dogwood-green p-8 text-white shadow-sm lg:flex lg:flex-col lg:justify-between">
        <div>
          <div className="grid h-20 w-48 place-items-center rounded-md border border-white/15 bg-white/5 p-3">
            <Image
              alt="Dogwood Golf & Social logo"
              className="h-full w-full object-contain"
              height={80}
              priority
              src="/brand/logos/Dogwood-Full-Cream.svg"
              width={160}
            />
          </div>
          <p className="mt-8 text-sm font-semibold uppercase tracking-wide text-white/65">
            Dogwood Golf & Social
          </p>
          <h1 className="mt-3 max-w-xl font-display text-5xl font-semibold leading-tight">
            Private player development, organized.
          </h1>
        </div>
        <p className="max-w-lg text-sm leading-6 text-white/70">
          Lesson history, practice plans, goals, assessments, files, and fitness
          work in one secure academy portal.
        </p>
      </section>

      <section className="flex items-center justify-center px-2 py-8 lg:px-8">
        <div className="w-full max-w-md rounded-lg border border-dogwood-green/15 bg-white/95 p-6 shadow-sm sm:p-8">
          <div className="mb-8 flex items-center gap-3">
            <div className="grid h-14 w-36 place-items-center rounded-md border border-dogwood-green/15 bg-dogwood-cream p-2">
              <Image
                alt="Dogwood Golf & Social logo"
                className="h-full w-full object-contain"
                height={56}
                priority
                src="/brand/logos/Dogwood-Full-Green.svg"
                width={144}
              />
            </div>
            <div>
              <p className="font-display text-base font-semibold text-dogwood-ink">
                Dogwood Player Portal
              </p>
              <p className="text-xs uppercase tracking-wide text-dogwood-ink/55">
                Member access
              </p>
            </div>
          </div>
          <h2 className="font-display text-3xl font-semibold text-dogwood-ink">
            Sign in
          </h2>
          <form action={signIn} className="mt-8 space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-dogwood-ink">Email</span>
              <input
                autoComplete="email"
                className="mt-1 w-full rounded-md border border-dogwood-green/20 px-3 py-2 text-dogwood-ink outline-none focus:border-dogwood-green"
                name="email"
                required
                type="email"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-dogwood-ink">
                Password
              </span>
              <input
                autoComplete="current-password"
                className="mt-1 w-full rounded-md border border-dogwood-green/20 px-3 py-2 text-dogwood-ink outline-none focus:border-dogwood-green"
                name="password"
                required
                type="password"
              />
            </label>
            {params?.message ? (
              <p className="rounded-md bg-dogwood-cream px-3 py-2 text-sm text-dogwood-ink">
                {params.message}
              </p>
            ) : null}
            <button
              className="w-full rounded-md bg-dogwood-green px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-dogwood-ink"
              type="submit"
            >
              Sign in
            </button>
          </form>
          <a
            className="mt-4 inline-block text-sm text-dogwood-green underline"
            href="/reset-password"
          >
            Reset password
          </a>
        </div>
      </section>
    </main>
  );
}
