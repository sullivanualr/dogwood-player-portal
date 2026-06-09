import { cache } from "react";
import { notFound } from "next/navigation";
import {
  canManageDevelopmentPriorities,
  canViewStudent
} from "@/lib/auth/permissions";
import type { Database } from "@/lib/db/types";
import { createClient } from "@/lib/supabase/server";

export const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i;

export type DevelopmentPriority =
  Database["public"]["Tables"]["development_priorities"]["Row"];

export type DevelopmentPrioritiesPageData = {
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  priorities: DevelopmentPriority[];
  canManage: boolean;
};

export const getDevelopmentPrioritiesPageData = cache(async (
  studentId: string
): Promise<DevelopmentPrioritiesPageData> => {
  if (!UUID_PATTERN.test(studentId)) {
    notFound();
  }

  const supabase = await createClient();
  const canView = await canViewStudent(supabase, studentId);

  if (!canView) {
    notFound();
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, email")
    .eq("id", studentId)
    .maybeSingle();

  if (profileError || !profile) {
    notFound();
  }

  const { data: studentProfile, error: studentProfileError } = await supabase
    .from("student_profiles")
    .select("id")
    .eq("user_id", studentId)
    .maybeSingle();

  if (studentProfileError || !studentProfile) {
    notFound();
  }

  const canManage = await canManageDevelopmentPriorities(supabase, studentId);
  let prioritiesQuery = supabase
    .from("development_priorities")
    .select("*")
    .eq("student_user_id", studentId);

  if (!canManage) {
    prioritiesQuery = prioritiesQuery.eq("status", "active");
  }

  const { data: priorities, error: prioritiesError } = await prioritiesQuery
    .order("sort_order", { ascending: true })
    .order("target_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });

  if (prioritiesError) {
    throw prioritiesError;
  }

  return {
    student: {
      id: profile.id,
      firstName: profile.first_name,
      lastName: profile.last_name,
      email: profile.email
    },
    priorities: priorities ?? [],
    canManage
  };
});
