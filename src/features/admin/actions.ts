"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/server";
import type { AppRole, RecordStatus } from "@/lib/db/types";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const APP_ROLES = new Set<AppRole>([
  "admin",
  "coach",
  "student",
  "parent",
  "fitness_pt"
]);
const RECORD_STATUSES = new Set<RecordStatus>([
  "active",
  "inactive",
  "archived"
]);
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getNullableText(formData: FormData, key: string) {
  const value = getText(formData, key);
  return value.length ? value : null;
}

function getRole(formData: FormData) {
  const value = getText(formData, "role") as AppRole;

  if (!APP_ROLES.has(value)) {
    throw new Error("A valid role is required.");
  }

  return value;
}

function getStatus(formData: FormData) {
  const value = getText(formData, "status") as RecordStatus;
  return RECORD_STATUSES.has(value) ? value : "active";
}

function getRequiredUuid(formData: FormData, key: string, label: string) {
  const value = getText(formData, key);

  if (!UUID_PATTERN.test(value)) {
    throw new Error(`${label} is required.`);
  }

  return value;
}

function getDate(formData: FormData, key: string, label: string) {
  const value = getText(formData, key);

  if (!value) {
    throw new Error(`${label} is required.`);
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`${label} must use YYYY-MM-DD.`);
  }

  return value;
}

function getNullableDate(formData: FormData, key: string, label: string) {
  const value = getText(formData, key);

  if (!value) {
    return null;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`${label} must use YYYY-MM-DD.`);
  }

  return value;
}

function assertDateRange(startDate: string, endDate: string | null) {
  if (endDate && endDate < startDate) {
    throw new Error("End date cannot be before start date.");
  }
}

function revalidateAdminPaths() {
  revalidatePath("/admin");
  revalidatePath("/admin/users");
  revalidatePath("/admin/programs");
  revalidatePath("/admin/assignments");
}

async function assignRoleToUser(userId: string, role: AppRole) {
  const supabase = await createClient();
  const { data: roleRow, error: roleError } = await supabase
    .from("roles")
    .select("id")
    .eq("name", role)
    .maybeSingle();

  if (roleError || !roleRow) {
    throw new Error("Role not found.");
  }

  const { error } = await supabase.from("user_roles").upsert(
    {
      user_id: userId,
      role_id: roleRow.id
    },
    {
      onConflict: "user_id,role_id"
    }
  );

  if (error) {
    throw error;
  }
}

async function ensureRoleProfile(userId: string, role: AppRole) {
  const supabase = await createClient();

  if (role === "student") {
    const { error } = await supabase.from("student_profiles").upsert(
      {
        user_id: userId,
        junior_player: false,
        status: "active"
      },
      { onConflict: "user_id" }
    );

    if (error) {
      throw error;
    }
  }

  if (role === "coach") {
    const { error } = await supabase.from("coach_profiles").upsert(
      {
        user_id: userId,
        status: "active"
      },
      { onConflict: "user_id" }
    );

    if (error) {
      throw error;
    }
  }

  if (role === "fitness_pt") {
    const { error } = await supabase.from("fitness_profiles").upsert(
      {
        user_id: userId,
        status: "active"
      },
      { onConflict: "user_id" }
    );

    if (error) {
      throw error;
    }
  }
}

async function assertUserHasRole(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  role: AppRole,
  label: string
) {
  const { data, error } = await supabase.rpc("has_role", {
    role_name: role,
    user_id: userId
  });

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error(`${label} must have the ${role} role.`);
  }
}

async function assertProfileExists(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("User profile was not found.");
  }
}

async function assertStudentProfile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  studentUserId: string
) {
  const { data, error } = await supabase
    .from("student_profiles")
    .select("id")
    .eq("user_id", studentUserId)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Student must have an active student profile.");
  }
}

async function assertActiveProgram(
  supabase: Awaited<ReturnType<typeof createClient>>,
  programId: string
) {
  const { data, error } = await supabase
    .from("programs")
    .select("id")
    .eq("id", programId)
    .neq("status", "archived")
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Program must be active or inactive, not archived.");
  }
}

async function updateExistingCoachAssignment({
  coachUserId,
  studentUserId,
  isPrimary,
  startDate,
  endDate
}: {
  coachUserId: string;
  studentUserId: string;
  isPrimary: boolean;
  startDate: string;
  endDate: string | null;
}) {
  const supabase = await createClient();

  if (isPrimary) {
    const { error: primaryError } = await supabase
      .from("coach_student_assignments")
      .update({ is_primary: false })
      .eq("student_user_id", studentUserId)
      .eq("status", "active")
      .eq("is_primary", true)
      .neq("coach_user_id", coachUserId);

    if (primaryError) {
      throw primaryError;
    }
  }

  const { data: existing, error: existingError } = await supabase
    .from("coach_student_assignments")
    .select("id")
    .eq("coach_user_id", coachUserId)
    .eq("student_user_id", studentUserId)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (existingError) {
    throw existingError;
  }

  const assignments = existing ?? [];
  const assignment = assignments[0];

  if (!assignment) {
    return false;
  }

  const { error } = await supabase
    .from("coach_student_assignments")
    .update({
      is_primary: isPrimary,
      start_date: startDate,
      end_date: endDate
    })
    .eq("id", assignment.id);

  if (error) {
    throw error;
  }

  const duplicateIds = assignments.slice(1).map((row) => row.id);

  if (duplicateIds.length) {
    const { error: duplicateError } = await supabase
      .from("coach_student_assignments")
      .update({ status: "inactive" })
      .in("id", duplicateIds);

    if (duplicateError) {
      throw duplicateError;
    }
  }

  return true;
}

async function updateExistingFitnessAssignment({
  fitnessUserId,
  studentUserId,
  startDate,
  endDate
}: {
  fitnessUserId: string;
  studentUserId: string;
  startDate: string;
  endDate: string | null;
}) {
  const supabase = await createClient();
  const { data: existing, error: existingError } = await supabase
    .from("fitness_student_assignments")
    .select("id")
    .eq("fitness_user_id", fitnessUserId)
    .eq("student_user_id", studentUserId)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (existingError) {
    throw existingError;
  }

  const assignments = existing ?? [];
  const assignment = assignments[0];

  if (!assignment) {
    return false;
  }

  const { error } = await supabase
    .from("fitness_student_assignments")
    .update({
      start_date: startDate,
      end_date: endDate
    })
    .eq("id", assignment.id);

  if (error) {
    throw error;
  }

  const duplicateIds = assignments.slice(1).map((row) => row.id);

  if (duplicateIds.length) {
    const { error: duplicateError } = await supabase
      .from("fitness_student_assignments")
      .update({ status: "inactive" })
      .in("id", duplicateIds);

    if (duplicateError) {
      throw duplicateError;
    }
  }

  return true;
}

async function updateExistingProgramEnrollment({
  studentUserId,
  programId,
  startDate,
  endDate
}: {
  studentUserId: string;
  programId: string;
  startDate: string;
  endDate: string | null;
}) {
  const supabase = await createClient();
  const { data: existing, error: existingError } = await supabase
    .from("student_program_enrollments")
    .select("id")
    .eq("student_user_id", studentUserId)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (existingError) {
    throw existingError;
  }

  const enrollments = existing ?? [];
  const enrollment = enrollments[0];

  if (!enrollment) {
    return false;
  }

  const { error } = await supabase
    .from("student_program_enrollments")
    .update({
      program_id: programId,
      start_date: startDate,
      end_date: endDate
    })
    .eq("id", enrollment.id);

  if (error) {
    throw error;
  }

  const duplicateIds = enrollments.slice(1).map((row) => row.id);

  if (duplicateIds.length) {
    const { error: duplicateError } = await supabase
      .from("student_program_enrollments")
      .update({ status: "inactive" })
      .in("id", duplicateIds);

    if (duplicateError) {
      throw duplicateError;
    }
  }

  return true;
}

export async function createBasicUser(formData: FormData) {
  await requireRole("admin");

  const firstName = getText(formData, "firstName");
  const lastName = getText(formData, "lastName");
  const email = getText(formData, "email").toLowerCase();
  const password = getText(formData, "password");
  const role = getRole(formData);

  if (!firstName || !lastName || !email || !password) {
    throw new Error("First name, last name, email, and password are required.");
  }

  if (!EMAIL_PATTERN.test(email)) {
    throw new Error("A valid email address is required.");
  }

  if (password.length < 8) {
    throw new Error("Temporary password must be at least 8 characters.");
  }

  const adminSupabase = createAdminClient();
  const { data, error: authError } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      first_name: firstName,
      last_name: lastName
    }
  });

  if (authError || !data.user) {
    throw authError ?? new Error("User could not be created.");
  }

  const { error: profileError } = await adminSupabase.from("profiles").upsert({
    id: data.user.id,
    first_name: firstName,
    last_name: lastName,
    email,
    phone: getNullableText(formData, "phone"),
    status: "active"
  });

  if (profileError) {
    throw profileError;
  }

  await assignRoleToUser(data.user.id, role);
  await ensureRoleProfile(data.user.id, role);

  revalidateAdminPaths();
  redirect("/admin/users");
}

export async function assignRole(formData: FormData) {
  await requireRole("admin");

  const userId = getRequiredUuid(formData, "userId", "User");
  const role = getRole(formData);
  const supabase = await createClient();

  await assertProfileExists(supabase, userId);
  await assignRoleToUser(userId, role);
  await ensureRoleProfile(userId, role);

  revalidateAdminPaths();
  redirect("/admin/users");
}

export async function createProgram(formData: FormData) {
  await requireRole("admin");

  const name = getText(formData, "name");

  if (!name) {
    throw new Error("Program name is required.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("programs").insert({
    name,
    description: getNullableText(formData, "description"),
    status: getStatus(formData)
  });

  if (error) {
    throw error;
  }

  revalidateAdminPaths();
  redirect("/admin/programs");
}

export async function updateProgram(formData: FormData) {
  await requireRole("admin");

  const programId = getRequiredUuid(formData, "programId", "Program");
  const name = getText(formData, "name");

  if (!name) {
    throw new Error("Program name is required.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("programs")
    .update({
      name,
      description: getNullableText(formData, "description"),
      status: getStatus(formData)
    })
    .eq("id", programId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Program was not updated.");
  }

  revalidateAdminPaths();
  redirect("/admin/programs");
}

export async function archiveProgram(formData: FormData) {
  await requireRole("admin");

  const programId = getRequiredUuid(formData, "programId", "Program");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("programs")
    .update({ status: "archived" })
    .eq("id", programId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Program was not archived.");
  }

  revalidateAdminPaths();
  redirect("/admin/programs");
}

export async function assignCoachToStudent(formData: FormData) {
  await requireRole("admin");

  const coachUserId = getRequiredUuid(formData, "coachUserId", "Coach");
  const studentUserId = getRequiredUuid(formData, "studentUserId", "Student");
  const startDate = getDate(formData, "startDate", "Start date");
  const endDate = getNullableDate(formData, "endDate", "End date");
  assertDateRange(startDate, endDate);

  const supabase = await createClient();
  await assertUserHasRole(supabase, coachUserId, "coach", "Coach");
  await assertStudentProfile(supabase, studentUserId);
  const isPrimary = formData.get("isPrimary") === "on";
  const updatedExisting = await updateExistingCoachAssignment({
    coachUserId,
    studentUserId,
    isPrimary,
    startDate,
    endDate
  });

  if (updatedExisting) {
    revalidateAdminPaths();
    redirect("/admin/assignments");
  }

  const { error } = await supabase.from("coach_student_assignments").insert({
    coach_user_id: coachUserId,
    student_user_id: studentUserId,
    is_primary: isPrimary,
    start_date: startDate,
    end_date: endDate,
    status: "active"
  });

  if (error) {
    throw error;
  }

  revalidateAdminPaths();
  redirect("/admin/assignments");
}

export async function assignParentToStudent(formData: FormData) {
  await requireRole("admin");

  const parentUserId = getRequiredUuid(formData, "parentUserId", "Parent");
  const studentUserId = getRequiredUuid(formData, "studentUserId", "Student");
  const supabase = await createClient();
  await assertUserHasRole(supabase, parentUserId, "parent", "Parent");
  await assertStudentProfile(supabase, studentUserId);
  const { error } = await supabase.from("parent_student_links").upsert(
    {
      parent_user_id: parentUserId,
      student_user_id: studentUserId,
      relationship: getNullableText(formData, "relationship"),
      status: "active"
    },
    {
      onConflict: "parent_user_id,student_user_id"
    }
  );

  if (error) {
    throw error;
  }

  revalidateAdminPaths();
  redirect("/admin/assignments");
}

export async function assignFitnessToStudent(formData: FormData) {
  await requireRole("admin");

  const fitnessUserId = getRequiredUuid(formData, "fitnessUserId", "Fitness/PT");
  const studentUserId = getRequiredUuid(formData, "studentUserId", "Student");
  const startDate = getDate(formData, "startDate", "Start date");
  const endDate = getNullableDate(formData, "endDate", "End date");
  assertDateRange(startDate, endDate);

  const supabase = await createClient();
  await assertUserHasRole(supabase, fitnessUserId, "fitness_pt", "Fitness/PT");
  await assertStudentProfile(supabase, studentUserId);
  const updatedExisting = await updateExistingFitnessAssignment({
    fitnessUserId,
    studentUserId,
    startDate,
    endDate
  });

  if (updatedExisting) {
    revalidateAdminPaths();
    redirect("/admin/assignments");
  }

  const { error } = await supabase.from("fitness_student_assignments").insert({
    fitness_user_id: fitnessUserId,
    student_user_id: studentUserId,
    start_date: startDate,
    end_date: endDate,
    status: "active"
  });

  if (error) {
    throw error;
  }

  revalidateAdminPaths();
  redirect("/admin/assignments");
}

export async function assignProgramToStudent(formData: FormData) {
  await requireRole("admin");

  const studentUserId = getRequiredUuid(formData, "studentUserId", "Student");
  const programId = getRequiredUuid(formData, "programId", "Program");
  const startDate = getDate(formData, "startDate", "Start date");
  const endDate = getNullableDate(formData, "endDate", "End date");
  assertDateRange(startDate, endDate);

  const supabase = await createClient();
  await assertStudentProfile(supabase, studentUserId);
  await assertActiveProgram(supabase, programId);
  const updatedExisting = await updateExistingProgramEnrollment({
    studentUserId,
    programId,
    startDate,
    endDate
  });

  if (updatedExisting) {
    revalidateAdminPaths();
    redirect("/admin/assignments");
  }

  const { error } = await supabase
    .from("student_program_enrollments")
    .insert({
      student_user_id: studentUserId,
      program_id: programId,
      start_date: startDate,
      end_date: endDate,
      status: "active"
    });

  if (error) {
    throw error;
  }

  revalidateAdminPaths();
  redirect("/admin/assignments");
}
