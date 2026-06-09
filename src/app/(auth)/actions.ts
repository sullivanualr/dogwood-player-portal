"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserDefaultPath } from "@/lib/auth/server";

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

function requireSupabaseEnv() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    redirect("/login?message=Supabase%20environment%20variables%20are%20missing");
  }
}

export async function signIn(formData: FormData) {
  requireSupabaseEnv();

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/login?message=Email%20and%20password%20are%20required");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    redirect(`/login?message=${encodeURIComponent(error.message)}`);
  }

  redirect(await getCurrentUserDefaultPath());
}

export async function signOut() {
  requireSupabaseEnv();

  const supabase = await createClient();
  await supabase.auth.signOut();

  redirect("/login");
}

export async function requestPasswordReset(formData: FormData) {
  requireSupabaseEnv();

  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    redirect("/reset-password?message=Email%20is%20required");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getAppUrl()}/auth/callback?next=/reset-password`
  });

  if (error) {
    redirect(`/reset-password?message=${encodeURIComponent(error.message)}`);
  }

  redirect("/reset-password?message=Password%20reset%20email%20sent");
}

export async function updatePassword(formData: FormData) {
  requireSupabaseEnv();

  const password = String(formData.get("password") ?? "");

  if (password.length < 8) {
    redirect("/reset-password?message=Password%20must%20be%20at%20least%208%20characters");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password
  });

  if (error) {
    redirect(`/reset-password?message=${encodeURIComponent(error.message)}`);
  }

  redirect(await getCurrentUserDefaultPath());
}
