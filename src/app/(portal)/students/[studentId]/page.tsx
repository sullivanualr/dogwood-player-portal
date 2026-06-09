import { redirect } from "next/navigation";

type StudentPageProps = {
  params: Promise<{
    studentId: string;
  }>;
};

export default async function StudentPage({ params }: StudentPageProps) {
  const { studentId } = await params;

  redirect(`/students/${encodeURIComponent(studentId)}/snapshot`);
}
