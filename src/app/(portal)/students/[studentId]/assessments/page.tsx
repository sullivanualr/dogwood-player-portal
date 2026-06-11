import Link from "next/link";
import { StudentRecordNav } from "@/components/app-shell/student-record-nav";
import { archiveAssessment } from "@/features/assessments/actions";
import { AssessmentForm } from "@/features/assessments/assessment-form";
import {
  ASSESSMENT_TYPE_OPTIONS,
  FITNESS_ASSESSMENT_TYPES
} from "@/features/assessments/constants";
import {
  getAssessmentsPageData,
  type Assessment
} from "@/features/assessments/queries";
import { isStudentFeatureUnavailable } from "@/features/students/page-access";
import { StudentFeatureUnavailableState } from "@/features/students/unavailable-state";

type AssessmentsPageProps = {
  params: Promise<{
    studentId: string;
  }>;
};

export const dynamic = "force-dynamic";

const ASSESSMENT_TYPE_LABELS = new Map(
  ASSESSMENT_TYPE_OPTIONS.map((option) => [option.value, option.label])
);

function formatDate(date: string | null) {
  if (!date) {
    return "Not set";
  }

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function formatLabel(value: string) {
  return value
    .split("_")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function formatAssessmentScore(assessment: Assessment) {
  if (assessment.score === null) {
    return "Not scored";
  }

  return `${assessment.score}${assessment.score_unit ? ` ${assessment.score_unit}` : ""}`;
}

function AssessmentCard({
  assessment,
  studentId,
  canManage,
  fitnessOnly
}: {
  assessment: Assessment;
  studentId: string;
  canManage: boolean;
  fitnessOnly: boolean;
}) {
  return (
    <article className="rounded-lg border border-dogwood-green/15 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-dogwood-ink">
              {assessment.title}
            </h2>
            <span className="rounded-full bg-dogwood-green/10 px-2.5 py-1 text-xs font-semibold uppercase text-dogwood-ink/65">
              {formatLabel(assessment.status)}
            </span>
            <span className="rounded-full bg-dogwood-cream px-2.5 py-1 text-xs font-semibold uppercase text-dogwood-ink/65">
              {formatLabel(assessment.visibility)}
            </span>
          </div>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="font-medium text-dogwood-ink/55">Type</dt>
              <dd className="mt-1 text-dogwood-ink">
                {ASSESSMENT_TYPE_LABELS.get(assessment.assessment_type) ??
                  formatLabel(assessment.assessment_type)}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-dogwood-ink/55">
                Assessment date
              </dt>
              <dd className="mt-1 text-dogwood-ink">
                {formatDate(assessment.assessment_date)}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-dogwood-ink/55">Score</dt>
              <dd className="mt-1 text-dogwood-ink">
                {formatAssessmentScore(assessment)}
              </dd>
            </div>
          </dl>
          <p className="mt-4 text-sm leading-6 text-dogwood-ink/70">
            {assessment.summary || "No summary provided."}
          </p>
          {assessment.findings ? (
            <p className="mt-3 whitespace-pre-line text-sm leading-6 text-dogwood-ink/70">
              {assessment.findings}
            </p>
          ) : null}
        </div>

        {canManage && assessment.status !== "archived" ? (
          <form action={archiveAssessment}>
            <input name="studentId" type="hidden" value={studentId} />
            <input name="assessmentId" type="hidden" value={assessment.id} />
            <button
              className="rounded-md border border-dogwood-green/20 px-3 py-2 text-sm font-medium text-dogwood-ink"
              type="submit"
            >
              Archive
            </button>
          </form>
        ) : null}
      </div>
      {canManage ? (
        <details className="mt-5 rounded-md border border-dogwood-green/15 bg-dogwood-cream/50 p-4">
          <summary className="cursor-pointer text-sm font-semibold text-dogwood-ink">
            Edit assessment
          </summary>
          <div className="mt-4">
            <AssessmentForm
              assessment={assessment}
              fitnessOnly={fitnessOnly}
              studentId={studentId}
            />
          </div>
        </details>
      ) : null}
    </article>
  );
}

export default async function AssessmentsPage({
  params
}: AssessmentsPageProps) {
  const { studentId } = await params;
  const pageData = await getAssessmentsPageData(studentId);

  if (isStudentFeatureUnavailable(pageData)) {
    return <StudentFeatureUnavailableState status={pageData.status} />;
  }

  const { student, assessments, canManageAll, canManageFitness } = pageData;
  const canManage = canManageAll || canManageFitness;
  const fullName = `${student.firstName} ${student.lastName}`;

  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-dogwood-leaf">
            Assessments
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-dogwood-ink">
            {fullName}
          </h1>
          <p className="mt-2 text-sm leading-6 text-dogwood-ink/65">
            Player testing, screens, scores, and findings.
          </p>
        </div>
        <Link
          className="text-sm font-medium text-dogwood-leaf hover:text-dogwood-green"
          href={`/students/${student.id}/snapshot`}
        >
          Back to snapshot
        </Link>
      </div>

      <StudentRecordNav active="assessments" studentId={student.id} />

      {canManage ? (
        <details className="mb-6 rounded-lg border border-dogwood-green/15 bg-white p-5 shadow-sm">
          <summary className="cursor-pointer text-base font-semibold text-dogwood-ink">
            Create assessment
          </summary>
          <div className="mt-5">
            <AssessmentForm
              fitnessOnly={!canManageAll && canManageFitness}
              studentId={student.id}
            />
          </div>
        </details>
      ) : null}

      {assessments.length ? (
        <div className="grid gap-4">
          {assessments.map((assessment) => {
            const canManageAssessment =
              canManageAll ||
              (canManageFitness &&
                FITNESS_ASSESSMENT_TYPES.has(assessment.assessment_type));

            return (
              <AssessmentCard
                assessment={assessment}
                canManage={canManageAssessment}
                fitnessOnly={!canManageAll && canManageFitness}
                key={assessment.id}
                studentId={student.id}
              />
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-dogwood-green/20 bg-white px-5 py-8 text-sm leading-6 text-dogwood-ink/65">
          No visible assessments are available yet.
        </div>
      )}
    </section>
  );
}
