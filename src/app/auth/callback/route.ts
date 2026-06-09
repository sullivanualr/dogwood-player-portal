import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUserDefaultPath } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";

function getSafeNextPath(next: string | null) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return null;
  }

  return next;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = getSafeNextPath(requestUrl.searchParams.get("next"));

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return NextResponse.redirect(
      new URL("/login?message=Supabase%20environment%20variables%20are%20missing", request.url)
    );
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(
        new URL(`/login?message=${encodeURIComponent(error.message)}`, request.url)
      );
    }
  }

  const redirectTo = next ?? (await getCurrentUserDefaultPath());

  return NextResponse.redirect(new URL(redirectTo, request.url));
}
