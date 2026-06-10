import { cache } from "react";
import { notFound } from "next/navigation";
import { canManageLessonNotes, canViewStudent } from "@/lib/auth/permissions";
import type { Database } from "@/lib/db/types";
import { createClient } from "@/lib/supabase/server";

export const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i;

export type LessonNote = Database["public"]["Tables"]["lesson_notes"]["Row"];

export type LessonNotesPageData = {
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  lessonNotes: LessonNote[];
  canManage: boolean;
};

export const getLessonNotesPageData = cache(async (
  studentId: string
): Promise<LessonNotesPageData> => {
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

  const canManage = await canManageLessonNotes(supabase, studentId);
  let lessonNotesQuery = supabase
    .from("lesson_notes")
    .select("*")
    .eq("student_user_id", studentId);

  if (!canManage) {
    lessonNotesQuery = lessonNotesQuery.eq("status", "published");
  }

  const { data: lessonNotes, error: lessonNotesError } = await lessonNotesQuery
    .order("lesson_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (lessonNotesError) {
    throw lessonNotesError;
  }

  return {
    student: {
      id: profile.id,
      firstName: profile.first_name,
      lastName: profile.last_name,
      email: profile.email
    },
    lessonNotes: lessonNotes ?? [],
    canManage
  };
});
