import { cache } from "react";
import {
  canManagePracticePlans,
  canViewAssignedFitnessPracticePlans
} from "@/lib/auth/permissions";
import type { Database } from "@/lib/db/types";
import {
  getStudentPageAccess,
  type StudentFeatureUnavailableData
} from "@/features/students/page-access";

export { UUID_PATTERN } from "@/features/students/page-access";

export type PracticePlan =
  Database["public"]["Tables"]["practice_plans"]["Row"];
export type PracticePlanItem =
  Database["public"]["Tables"]["practice_plan_items"]["Row"];
export type PracticePlanWithItems = PracticePlan & {
  items: PracticePlanItem[];
};

export type PracticePlansPageData = {
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  plans: PracticePlanWithItems[];
  canManage: boolean;
};

export const getPracticePlansPageData = cache(async (
  studentId: string
): Promise<PracticePlansPageData | StudentFeatureUnavailableData> => {
  const access = await getStudentPageAccess(studentId);

  if (access.status !== "ok") {
    return { status: access.status };
  }

  const { student, supabase } = access;
  const canManage = await canManagePracticePlans(supabase, studentId);
  const canViewAll = canManage
    ? true
    : await canViewAssignedFitnessPracticePlans(supabase, studentId);
  let plansQuery = supabase
    .from("practice_plans")
    .select("*")
    .eq("student_user_id", studentId);

  if (!canViewAll) {
    plansQuery = plansQuery.eq("status", "active");
  }

  const { data: plans, error: plansError } = await plansQuery
    .order("status", { ascending: true })
    .order("assigned_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (plansError) {
    throw plansError;
  }

  const planIds = plans?.map((plan) => plan.id) ?? [];
  let items: PracticePlanItem[] = [];

  if (planIds.length) {
    const { data: itemRows, error: itemsError } = await supabase
      .from("practice_plan_items")
      .select("*")
      .in("practice_plan_id", planIds)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (itemsError) {
      throw itemsError;
    }

    items = itemRows ?? [];
  }

  return {
    student: {
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email
    },
    plans: (plans ?? []).map((plan) => ({
      ...plan,
      items: items.filter((item) => item.practice_plan_id === plan.id)
    })),
    canManage
  };
});
