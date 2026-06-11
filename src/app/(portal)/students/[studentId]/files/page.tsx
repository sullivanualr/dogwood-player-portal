import Link from "next/link";
import { StudentRecordNav } from "@/components/app-shell/student-record-nav";
import {
  archiveFileAsset,
  archiveVideoAsset
} from "@/features/files/actions";
import { FITNESS_ASSET_CATEGORIES } from "@/features/files/constants";
import {
  FileMetadataForm,
  FileUploadForm,
  VideoMetadataForm,
  VideoUploadForm
} from "@/features/files/asset-forms";
import {
  getAssetsPageData,
  type FileAsset,
  type VideoAsset
} from "@/features/files/queries";
import { isStudentFeatureUnavailable } from "@/features/students/page-access";
import { StudentFeatureUnavailableState } from "@/features/students/unavailable-state";

type AssetsPageProps = {
  params: Promise<{
    studentId: string;
  }>;
};

export const dynamic = "force-dynamic";

function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatLabel(value: string) {
  return value
    .split("_")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function AssetBadges({
  category,
  status,
  visibility
}: {
  category: string;
  status: string;
  visibility: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="rounded-full bg-dogwood-green/10 px-2.5 py-1 text-xs font-semibold uppercase text-dogwood-ink/65">
        {formatLabel(category)}
      </span>
      <span className="rounded-full bg-dogwood-cream px-2.5 py-1 text-xs font-semibold uppercase text-dogwood-ink/65">
        {formatLabel(status)}
      </span>
      <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold uppercase text-dogwood-ink/65">
        {formatLabel(visibility)}
      </span>
    </div>
  );
}

function FileCard({
  asset,
  studentId,
  canManage,
  fitnessOnly
}: {
  asset: FileAsset;
  studentId: string;
  canManage: boolean;
  fitnessOnly: boolean;
}) {
  return (
    <article className="rounded-lg border border-dogwood-green/15 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-dogwood-ink">
            {asset.title}
          </h3>
          <div className="mt-2">
            <AssetBadges
              category={asset.category}
              status={asset.status}
              visibility={asset.visibility}
            />
          </div>
          <p className="mt-3 text-sm leading-6 text-dogwood-ink/70">
            {asset.description || "No description provided."}
          </p>
          <p className="mt-3 text-xs font-medium text-dogwood-ink/55">
            {asset.file_name} | {asset.mime_type} | {formatBytes(asset.file_size)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            className="rounded-md bg-dogwood-green px-3 py-2 text-sm font-medium text-white"
            href={`/api/storage/signed-url?type=file&id=${asset.id}`}
          >
            Download
          </Link>
          {canManage && asset.status !== "archived" ? (
            <form action={archiveFileAsset}>
              <input name="studentId" type="hidden" value={studentId} />
              <input name="assetId" type="hidden" value={asset.id} />
              <button
                className="rounded-md border border-dogwood-green/20 px-3 py-2 text-sm font-medium text-dogwood-ink"
                type="submit"
              >
                Archive
              </button>
            </form>
          ) : null}
        </div>
      </div>
      {canManage ? (
        <details className="mt-5 rounded-md border border-dogwood-green/15 bg-dogwood-cream/50 p-4">
          <summary className="cursor-pointer text-sm font-semibold text-dogwood-ink">
            Edit file metadata
          </summary>
          <div className="mt-4">
            <FileMetadataForm
              asset={asset}
              fitnessOnly={fitnessOnly}
              studentId={studentId}
            />
          </div>
        </details>
      ) : null}
    </article>
  );
}

function VideoCard({
  asset,
  studentId,
  canManage,
  fitnessOnly
}: {
  asset: VideoAsset;
  studentId: string;
  canManage: boolean;
  fitnessOnly: boolean;
}) {
  return (
    <article className="rounded-lg border border-dogwood-green/15 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-dogwood-ink">
            {asset.title}
          </h3>
          <div className="mt-2">
            <AssetBadges
              category={asset.category}
              status={asset.status}
              visibility={asset.visibility}
            />
          </div>
          <p className="mt-3 text-sm leading-6 text-dogwood-ink/70">
            {asset.description || "No description provided."}
          </p>
          <p className="mt-3 text-xs font-medium text-dogwood-ink/55">
            {asset.file_name} | {asset.mime_type} | {formatBytes(asset.file_size)}
            {asset.duration_seconds === null
              ? ""
              : ` | ${asset.duration_seconds}s`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            className="rounded-md bg-dogwood-green px-3 py-2 text-sm font-medium text-white"
            href={`/api/storage/signed-url?type=video&id=${asset.id}`}
          >
            View
          </Link>
          {canManage && asset.status !== "archived" ? (
            <form action={archiveVideoAsset}>
              <input name="studentId" type="hidden" value={studentId} />
              <input name="assetId" type="hidden" value={asset.id} />
              <button
                className="rounded-md border border-dogwood-green/20 px-3 py-2 text-sm font-medium text-dogwood-ink"
                type="submit"
              >
                Archive
              </button>
            </form>
          ) : null}
        </div>
      </div>
      {canManage ? (
        <details className="mt-5 rounded-md border border-dogwood-green/15 bg-dogwood-cream/50 p-4">
          <summary className="cursor-pointer text-sm font-semibold text-dogwood-ink">
            Edit video metadata
          </summary>
          <div className="mt-4">
            <VideoMetadataForm
              asset={asset}
              fitnessOnly={fitnessOnly}
              studentId={studentId}
            />
          </div>
        </details>
      ) : null}
    </article>
  );
}

export default async function AssetsPage({ params }: AssetsPageProps) {
  const { studentId } = await params;
  const pageData = await getAssetsPageData(studentId);

  if (isStudentFeatureUnavailable(pageData)) {
    return <StudentFeatureUnavailableState status={pageData.status} />;
  }

  const { student, files, videos, canManageAll, canManageFitness } = pageData;
  const canManage = canManageAll || canManageFitness;
  const fullName = `${student.firstName} ${student.lastName}`;

  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-dogwood-leaf">
            Files & Videos
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-dogwood-ink">
            {fullName}
          </h1>
          <p className="mt-2 text-sm leading-6 text-dogwood-ink/65">
            Private files, videos, movement screens, and shared player assets.
          </p>
        </div>
        <Link
          className="text-sm font-medium text-dogwood-leaf hover:text-dogwood-green"
          href={`/students/${student.id}/snapshot`}
        >
          Back to snapshot
        </Link>
      </div>
      <StudentRecordNav active="files" studentId={student.id} />

      {canManage ? (
        <div className="mb-6 grid gap-4 lg:grid-cols-2">
          <details className="rounded-lg border border-dogwood-green/15 bg-white p-5 shadow-sm">
            <summary className="cursor-pointer text-base font-semibold text-dogwood-ink">
              Upload file
            </summary>
            <div className="mt-5">
              <FileUploadForm
                fitnessOnly={!canManageAll && canManageFitness}
                studentId={student.id}
              />
            </div>
          </details>
          <details className="rounded-lg border border-dogwood-green/15 bg-white p-5 shadow-sm">
            <summary className="cursor-pointer text-base font-semibold text-dogwood-ink">
              Upload video
            </summary>
            <div className="mt-5">
              <VideoUploadForm
                fitnessOnly={!canManageAll && canManageFitness}
                studentId={student.id}
              />
            </div>
          </details>
        </div>
      ) : null}

      <div className="grid gap-8">
        <section>
          <h2 className="mb-4 text-xl font-semibold text-dogwood-ink">Videos</h2>
          {videos.length ? (
            <div className="grid gap-4">
              {videos.map((asset) => {
                const canManageAsset =
                  canManageAll ||
                  (canManageFitness &&
                    FITNESS_ASSET_CATEGORIES.has(asset.category));

                return (
                  <VideoCard
                    asset={asset}
                    canManage={canManageAsset}
                    fitnessOnly={!canManageAll && canManageFitness}
                    key={asset.id}
                    studentId={student.id}
                  />
                );
              })}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-dogwood-green/20 bg-white px-5 py-8 text-sm leading-6 text-dogwood-ink/65">
              No visible videos are available yet.
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-dogwood-ink">Files</h2>
          {files.length ? (
            <div className="grid gap-4">
              {files.map((asset) => {
                const canManageAsset =
                  canManageAll ||
                  (canManageFitness &&
                    FITNESS_ASSET_CATEGORIES.has(asset.category));

                return (
                  <FileCard
                    asset={asset}
                    canManage={canManageAsset}
                    fitnessOnly={!canManageAll && canManageFitness}
                    key={asset.id}
                    studentId={student.id}
                  />
                );
              })}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-dogwood-green/20 bg-white px-5 py-8 text-sm leading-6 text-dogwood-ink/65">
              No visible files are available yet.
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
