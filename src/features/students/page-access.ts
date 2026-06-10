import type { SupabaseClient } from "@supabase/supabase-js";
import { canViewStudent } from "@/lib/auth/permissions";
import type { Database } from "@/lib/db/types";
import { createClient } from "@/lib/supabase/server";

export const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type StudentPageAccessIssue =
  | "access_denied"
  | "student_profile_not_found";

export type StudentFeatureProfile = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export type StudentPageAccess =
  | {
      status: "ok";
      supabase: SupabaseClient<Database>;
      student: StudentFeatureProfile;
    }
  | {
      status: StudentPageAccessIssue;
      supabase: SupabaseClient<Database>;
    };

export type StudentFeatureUnavailableData = {
  status: StudentPageAccessIssue;
};

export function isStudentFeatureUnavailable(
  data: unknown
): data is StudentFeatureUnavailableData {
  return (
    typeof data === "object" &&
    data !== null &&
    "status" in data &&
    ((data as StudentFeatureUnavailableData).status === "access_denied" ||
      (data as StudentFeatureUnavailableData).status ===
        "student_profile_not_found")
  );
}

export async function getStudentPageAccess(
  studentId: string
): Promise<StudentPageAccess> {
  const supabase = await createClient();

  if (!UUID_PATTERN.test(studentId)) {
    return {
      status: "student_profile_not_found",
      supabase
    };
  }

  const canView = await canViewStudent(supabase, studentId);

  if (!canView) {
    return {
      status: "access_denied",
      supabase
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, email")
    .eq("id", studentId)
    .maybeSingle();

  if (profileError) {
    throw profileError;
  }

  if (!profile) {
    return {
      status: "student_profile_not_found",
      supabase
    };
  }

  const { data: studentProfile, error: studentProfileError } = await supabase
    .from("student_profiles")
    .select("user_id")
    .eq("user_id", studentId)
    .maybeSingle();

  if (studentProfileError) {
    throw studentProfileError;
  }

  if (!studentProfile) {
    return {
      status: "student_profile_not_found",
      supabase
    };
  }

  return {
    status: "ok",
    supabase,
    student: {
      id: profile.id,
      firstName: profile.first_name,
      lastName: profile.last_name,
      email: profile.email
    }
  };
}
