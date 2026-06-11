import { requestPasswordReset, updatePassword } from "@/app/(auth)/actions";
import { getCurrentUser } from "@/lib/auth/server";
import Image from "next/image";

type ResetPasswordPageProps = {
  searchParams?: Promise<{
    message?: string;
  }>;
};

export default async function ResetPasswordPage({
  searchParams
}: ResetPasswordPageProps) {
  const params = await searchParams;
  const user = await getCurrentUser();

  return (
    <main className="flex min-h-screen items-center justify-center bg-dogwood-linen p-6">
      <section className="w-full max-w-md rounded-lg border border-dogwood-green/15 bg-white/95 p-6 shadow-sm sm:p-8">
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
              Account access
            </p>
          </div>
        </div>
        <h1 className="font-display text-3xl font-semibold text-dogwood-ink">
          Reset password
        </h1>
        <form
          action={user ? updatePassword : requestPasswordReset}
          className="mt-8 space-y-4"
        >
          {user ? (
            <label className="block">
              <span className="text-sm font-medium text-dogwood-ink">
                New password
              </span>
              <input
                autoComplete="new-password"
                className="mt-1 w-full rounded-md border border-dogwood-green/20 px-3 py-2 text-dogwood-ink outline-none focus:border-dogwood-green"
                minLength={8}
                name="password"
                required
                type="password"
              />
            </label>
          ) : (
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
          )}
          {params?.message ? (
            <p className="rounded-md bg-dogwood-cream px-3 py-2 text-sm text-dogwood-ink">
              {params.message}
            </p>
          ) : null}
          <button
            className="w-full rounded-md bg-dogwood-green px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-dogwood-ink"
            type="submit"
          >
            {user ? "Update password" : "Send reset email"}
          </button>
        </form>
      </section>
    </main>
  );
}
