import { redirect } from "next/navigation";
import { requireRole, requireUser } from "@/lib/auth/server";

export default async function StudentDashboardPage() {
  await requireRole("student");
  const user = await requireUser();

  redirect(`/students/${user.id}/snapshot`);
}
