import { cache } from "react";
import { notFound } from "next/navigation";
import {
  canManagePracticePlans,
  canViewAssignedFitnessPracticePlans,
  canViewStudent
} from "@/lib/auth/permissions";
import type { Database } from "@/lib/db/types";
import { createClient } from "@/lib/supabase/server";

export const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i;

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
): Promise<PracticePlansPageData> => {
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
      id: profile.id,
      firstName: profile.first_name,
      lastName: profile.last_name,
      email: profile.email
    },
    plans: (plans ?? []).map((plan) => ({
      ...plan,
      items: items.filter((item) => item.practice_plan_id === plan.id)
    })),
    canManage
  };
});
