import { cache } from "react";
import { canManageLessonNotes } from "@/lib/auth/permissions";
import type { Database } from "@/lib/db/types";
import {
  getStudentPageAccess,
  type StudentFeatureUnavailableData
} from "@/features/students/page-access";

export { UUID_PATTERN } from "@/features/students/page-access";

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
): Promise<LessonNotesPageData | StudentFeatureUnavailableData> => {
  const access = await getStudentPageAccess(studentId);

  if (access.status !== "ok") {
    return { status: access.status };
  }

  const { student, supabase } = access;
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
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email
    },
    lessonNotes: lessonNotes ?? [],
    canManage
  };
});
