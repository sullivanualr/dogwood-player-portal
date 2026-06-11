import Image from "next/image";
import { redirect } from "next/navigation";
import { getCurrentUser, getCurrentUserDefaultPath } from "@/lib/auth/server";

export default async function AcceptInvitePage() {
  if (await getCurrentUser()) {
    redirect(await getCurrentUserDefaultPath());
  }

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
              Invitation
            </p>
          </div>
        </div>
        <h1 className="font-display text-3xl font-semibold text-dogwood-ink">
          Accept invite
        </h1>
        <p className="mt-4 text-sm leading-6 text-dogwood-ink/75">
          Invite acceptance will use Supabase invitation links. Complete the
          account setup from the email link, then sign in to continue.
        </p>
        <a
          className="mt-6 inline-flex rounded-md bg-dogwood-green px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-dogwood-ink"
          href="/login"
        >
          Go to sign in
        </a>
      </section>
    </main>
  );
}
