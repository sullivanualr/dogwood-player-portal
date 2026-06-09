import {
  uploadFileAsset,
  uploadVideoAsset,
  updateFileAsset,
  updateVideoAsset
} from "@/features/files/actions";
import {
  ASSET_CATEGORY_OPTIONS,
  ASSET_STATUS_OPTIONS,
  FITNESS_ASSET_CATEGORIES
} from "@/features/files/constants";
import type { FileAsset, VideoAsset } from "@/features/files/queries";
import type { VisibilityLevel } from "@/lib/db/types";

const VISIBILITY_OPTIONS: Array<{ value: VisibilityLevel; label: string }> = [
  { value: "internal", label: "Internal" },
  { value: "staff", label: "Staff" },
  { value: "student_parent", label: "Student/Parent" },
  { value: "private", label: "Private" }
];

const inputClassName =
  "mt-2 w-full rounded-md border border-dogwood-green/20 bg-white px-3 py-2 text-sm text-dogwood-ink outline-none focus:border-dogwood-leaf focus:ring-2 focus:ring-dogwood-leaf/20";
const labelClassName = "text-sm font-medium text-dogwood-ink";

function getCategoryOptions(fitnessOnly: boolean) {
  if (!fitnessOnly) {
    return ASSET_CATEGORY_OPTIONS;
  }

  return ASSET_CATEGORY_OPTIONS.filter((option) =>
    FITNESS_ASSET_CATEGORIES.has(option.value)
  );
}

function SharedMetadataFields({
  idPrefix,
  title,
  description,
  category,
  visibility,
  status,
  fitnessOnly
}: {
  idPrefix: string;
  title?: string;
  description?: string | null;
  category?: string;
  visibility?: VisibilityLevel;
  status?: string;
  fitnessOnly: boolean;
}) {
  const categoryOptions = getCategoryOptions(fitnessOnly);

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={labelClassName} htmlFor={`${idPrefix}-title`}>
            Title
          </label>
          <input
            className={inputClassName}
            defaultValue={title}
            id={`${idPrefix}-title`}
            name="title"
            required
            type="text"
          />
        </div>

        <div>
          <label className={labelClassName} htmlFor={`${idPrefix}-category`}>
            Category
          </label>
          <select
            className={inputClassName}
            defaultValue={category ?? categoryOptions[0]?.value ?? "general"}
            id={`${idPrefix}-category`}
            name="category"
          >
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClassName} htmlFor={`${idPrefix}-description`}>
          Description
        </label>
        <textarea
          className={`${inputClassName} min-h-20`}
          defaultValue={description ?? ""}
          id={`${idPrefix}-description`}
          name="description"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={labelClassName} htmlFor={`${idPrefix}-visibility`}>
            Visibility
          </label>
          <select
            className={inputClassName}
            defaultValue={visibility ?? "internal"}
            id={`${idPrefix}-visibility`}
            name="visibility"
          >
            {VISIBILITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClassName} htmlFor={`${idPrefix}-status`}>
            Status
          </label>
          <select
            className={inputClassName}
            defaultValue={status ?? "draft"}
            id={`${idPrefix}-status`}
            name="status"
          >
            {ASSET_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
}

export function FileUploadForm({
  studentId,
  fitnessOnly
}: {
  studentId: string;
  fitnessOnly: boolean;
}) {
  return (
    <form
      action={uploadFileAsset}
      className="grid gap-4"
      encType="multipart/form-data"
    >
      <input name="studentId" type="hidden" value={studentId} />
      <SharedMetadataFields idPrefix="new-file" fitnessOnly={fitnessOnly} />
      <div>
        <label className={labelClassName} htmlFor="new-file-asset">
          File
        </label>
        <input
          className={inputClassName}
          id="new-file-asset"
          name="asset"
          required
          type="file"
        />
      </div>
      <button
        className="rounded-md bg-dogwood-green px-4 py-2 text-sm font-medium text-white"
        type="submit"
      >
        Upload file
      </button>
    </form>
  );
}

export function VideoUploadForm({
  studentId,
  fitnessOnly
}: {
  studentId: string;
  fitnessOnly: boolean;
}) {
  return (
    <form
      action={uploadVideoAsset}
      className="grid gap-4"
      encType="multipart/form-data"
    >
      <input name="studentId" type="hidden" value={studentId} />
      <SharedMetadataFields idPrefix="new-video" fitnessOnly={fitnessOnly} />
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className={labelClassName} htmlFor="new-video-asset">
            Video
          </label>
          <input
            accept="video/*"
            className={inputClassName}
            id="new-video-asset"
            name="asset"
            required
            type="file"
          />
        </div>
        <div>
          <label className={labelClassName} htmlFor="new-video-thumbnail">
            Thumbnail key
          </label>
          <input
            className={inputClassName}
            id="new-video-thumbnail"
            name="thumbnailKey"
            type="text"
          />
        </div>
        <div>
          <label className={labelClassName} htmlFor="new-video-duration">
            Duration seconds
          </label>
          <input
            className={inputClassName}
            id="new-video-duration"
            min={0}
            name="durationSeconds"
            type="number"
          />
        </div>
      </div>
      <button
        className="rounded-md bg-dogwood-green px-4 py-2 text-sm font-medium text-white"
        type="submit"
      >
        Upload video
      </button>
    </form>
  );
}

export function FileMetadataForm({
  studentId,
  asset,
  fitnessOnly
}: {
  studentId: string;
  asset: FileAsset;
  fitnessOnly: boolean;
}) {
  return (
    <form action={updateFileAsset} className="grid gap-4">
      <input name="studentId" type="hidden" value={studentId} />
      <input name="assetId" type="hidden" value={asset.id} />
      <SharedMetadataFields
        category={asset.category}
        description={asset.description}
        fitnessOnly={fitnessOnly}
        idPrefix={asset.id}
        status={asset.status}
        title={asset.title}
        visibility={asset.visibility}
      />
      <button
        className="rounded-md bg-dogwood-green px-4 py-2 text-sm font-medium text-white"
        type="submit"
      >
        Save file metadata
      </button>
    </form>
  );
}

export function VideoMetadataForm({
  studentId,
  asset,
  fitnessOnly
}: {
  studentId: string;
  asset: VideoAsset;
  fitnessOnly: boolean;
}) {
  return (
    <form action={updateVideoAsset} className="grid gap-4">
      <input name="studentId" type="hidden" value={studentId} />
      <input name="assetId" type="hidden" value={asset.id} />
      <SharedMetadataFields
        category={asset.category}
        description={asset.description}
        fitnessOnly={fitnessOnly}
        idPrefix={asset.id}
        status={asset.status}
        title={asset.title}
        visibility={asset.visibility}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={labelClassName} htmlFor={`${asset.id}-thumbnail`}>
            Thumbnail key
          </label>
          <input
            className={inputClassName}
            defaultValue={asset.thumbnail_key ?? ""}
            id={`${asset.id}-thumbnail`}
            name="thumbnailKey"
            type="text"
          />
        </div>
        <div>
          <label className={labelClassName} htmlFor={`${asset.id}-duration`}>
            Duration seconds
          </label>
          <input
            className={inputClassName}
            defaultValue={asset.duration_seconds ?? ""}
            id={`${asset.id}-duration`}
            min={0}
            name="durationSeconds"
            type="number"
          />
        </div>
      </div>
      <button
        className="rounded-md bg-dogwood-green px-4 py-2 text-sm font-medium text-white"
        type="submit"
      >
        Save video metadata
      </button>
    </form>
  );
}
