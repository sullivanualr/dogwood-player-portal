import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getDefaultPathForRoles,
  ROLE_PRIORITY,
  type AppRole
} from "@/lib/auth/roles";

export async function getCurrentUser() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return user;
}

export async function getCurrentUserRoles(): Promise<AppRole[]> {
  const user = await getCurrentUser();

  if (!user) {
    return [];
  }

  const supabase = await createClient();
  const { data: userRoleRows, error: userRolesError } = await supabase
    .from("user_roles")
    .select("role_id")
    .eq("user_id", user.id);

  if (userRolesError || !userRoleRows?.length) {
    return [];
  }

  const roleIds = userRoleRows.map((row) => row.role_id);
  const { data: roleRows, error: rolesError } = await supabase
    .from("roles")
    .select("name")
    .in("id", roleIds);

  if (rolesError || !roleRows) {
    return [];
  }

  return roleRows.map((row) => row.name);
}

export function getPrimaryRole(roles: AppRole[]) {
  return ROLE_PRIORITY.find((role) => roles.includes(role)) ?? null;
}

export async function getCurrentUserDefaultPath() {
  const roles = await getCurrentUserRoles();
  return getDefaultPathForRoles(roles);
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireRole(role: AppRole) {
  await requireUser();

  const roles = await getCurrentUserRoles();

  if (!roles.includes(role)) {
    redirect(await getCurrentUserDefaultPath());
  }

  return roles;
}
