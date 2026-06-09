"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  canManageAssets,
  canManageFitnessAssets,
  canViewStudent
} from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/server";
import type { AssetStatus, VisibilityLevel } from "@/lib/db/types";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  ASSET_STATUS_OPTIONS,
  FILE_BUCKET,
  FITNESS_ASSET_CATEGORIES,
  GENERAL_FILE_MAX_SIZE,
  IMAGE_MAX_SIZE,
  MOVEMENT_BUCKET,
  VIDEO_BUCKET,
  VIDEO_MAX_SIZE
} from "@/features/files/constants";
import { UUID_PATTERN } from "@/features/files/queries";

const ASSET_STATUSES = new Set<AssetStatus>(
  ASSET_STATUS_OPTIONS.map((option) => option.value)
);
const VISIBILITY_LEVELS = new Set<VisibilityLevel>([
  "internal",
  "staff",
  "student_parent",
  "private"
]);

function getText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getNullableText(formData: FormData, key: string) {
  const value = getText(formData, key);
  return value.length ? value : null;
}

function getStatus(formData: FormData) {
  const value = getText(formData, "status") as AssetStatus;
  return ASSET_STATUSES.has(value) ? value : "draft";
}

function getVisibility(formData: FormData) {
  const value = getText(formData, "visibility") as VisibilityLevel;
  return VISIBILITY_LEVELS.has(value) ? value : "internal";
}

function getCategory(formData: FormData) {
  return getText(formData, "category").toLowerCase() || "general";
}

function getRequiredFile(formData: FormData, key: string) {
  const value = formData.get(key);

  if (!(value instanceof File) || value.size <= 0) {
    throw new Error("A file is required.");
  }

  return value;
}

function getNullableInteger(formData: FormData, key: string, label: string) {
  const value = getText(formData, key);

  if (!value) {
    return null;
  }

  const numberValue = Number(value);

  if (!Number.isInteger(numberValue) || numberValue < 0) {
    throw new Error(`${label} must be a non-negative whole number.`);
  }

  return numberValue;
}

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function getFileExtension(fileName: string) {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts.pop()?.toLowerCase() ?? null : null;
}

function assertFileSize(file: File, isVideo: boolean) {
  if (isVideo) {
    if (!file.type.startsWith("video/")) {
      throw new Error("Video uploads must use a video MIME type.");
    }

    if (file.size > VIDEO_MAX_SIZE) {
      throw new Error("Videos must be 500 MB or smaller.");
    }

    return;
  }

  if (file.type.startsWith("video/")) {
    throw new Error("Videos must be uploaded as video assets.");
  }

  if (file.type.startsWith("image/")) {
    if (file.size > IMAGE_MAX_SIZE) {
      throw new Error("Images must be 15 MB or smaller.");
    }
  } else if (file.size > GENERAL_FILE_MAX_SIZE) {
    throw new Error("Files must be 25 MB or smaller.");
  }
}

async function assertCanManage(studentId: string, category: string) {
  if (!UUID_PATTERN.test(studentId)) {
    throw new Error("Invalid student id.");
  }

  await requireUser();
  const supabase = await createClient();
  const canView = await canViewStudent(supabase, studentId);
  const canManageAll = canView ? await canManageAssets(supabase, studentId) : false;
  const canManageFitness = canManageAll
    ? false
    : await canManageFitnessAssets(supabase, studentId);
  const canManage =
    canManageAll ||
    (canManageFitness && FITNESS_ASSET_CATEGORIES.has(category));

  if (!canManage) {
    throw new Error("You do not have permission to manage this asset.");
  }

  const { data: studentProfile, error: studentProfileError } = await supabase
    .from("student_profiles")
    .select("id")
    .eq("user_id", studentId)
    .maybeSingle();

  if (studentProfileError || !studentProfile) {
    throw new Error("Assets can only be managed for students.");
  }

  return { supabase };
}

function getStorageKey(studentId: string, fileName: string) {
  return `${studentId}/${crypto.randomUUID()}-${sanitizeFileName(fileName)}`;
}

function revalidateAssetRoutes(studentId: string) {
  revalidatePath(`/students/${studentId}/files`);
  revalidatePath(`/students/${studentId}/snapshot`);
}

async function getExistingAssetCategory(
  supabase: Awaited<ReturnType<typeof createClient>>,
  table: "file_assets" | "video_assets",
  studentId: string,
  assetId: string
) {
  const { data, error } =
    table === "file_assets"
      ? await supabase
          .from("file_assets")
          .select("category")
          .eq("id", assetId)
          .eq("student_user_id", studentId)
          .maybeSingle()
      : await supabase
          .from("video_assets")
          .select("category")
          .eq("id", assetId)
          .eq("student_user_id", studentId)
          .maybeSingle();

  if (error || !data) {
    throw new Error("Asset not found.");
  }

  return data.category;
}

export async function uploadFileAsset(formData: FormData) {
  const studentId = getText(formData, "studentId");
  const title = getText(formData, "title");
  const category = getCategory(formData);
  const file = getRequiredFile(formData, "asset");

  if (!title) {
    throw new Error("Title is required.");
  }

  assertFileSize(file, false);

  const user = await requireUser();
  const { supabase } = await assertCanManage(studentId, category);
  const adminSupabase = createAdminClient();
  const storageBucket = FITNESS_ASSET_CATEGORIES.has(category)
    ? MOVEMENT_BUCKET
    : FILE_BUCKET;
  const storageKey = getStorageKey(studentId, file.name);
  const { error: uploadError } = await adminSupabase.storage
    .from(storageBucket)
    .upload(storageKey, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false
    });

  if (uploadError) {
    throw uploadError;
  }

  const { error } = await supabase.from("file_assets").insert({
    student_user_id: studentId,
    created_by_user_id: user.id,
    title,
    description: getNullableText(formData, "description"),
    category,
    visibility: getVisibility(formData),
    status: getStatus(formData),
    file_name: file.name,
    file_type: getFileExtension(file.name),
    mime_type: file.type || "application/octet-stream",
    file_size: file.size,
    storage_bucket: storageBucket,
    storage_key: storageKey
  });

  if (error) {
    await adminSupabase.storage.from(storageBucket).remove([storageKey]);
    throw error;
  }

  revalidateAssetRoutes(studentId);
  redirect(`/students/${studentId}/files`);
}

export async function uploadVideoAsset(formData: FormData) {
  const studentId = getText(formData, "studentId");
  const title = getText(formData, "title");
  const category = getCategory(formData);
  const file = getRequiredFile(formData, "asset");

  if (!title) {
    throw new Error("Title is required.");
  }

  assertFileSize(file, true);

  const user = await requireUser();
  const { supabase } = await assertCanManage(studentId, category);
  const adminSupabase = createAdminClient();
  const storageBucket = FITNESS_ASSET_CATEGORIES.has(category)
    ? MOVEMENT_BUCKET
    : VIDEO_BUCKET;
  const storageKey = getStorageKey(studentId, file.name);
  const { error: uploadError } = await adminSupabase.storage
    .from(storageBucket)
    .upload(storageKey, file, {
      contentType: file.type || "video/mp4",
      upsert: false
    });

  if (uploadError) {
    throw uploadError;
  }

  const { error } = await supabase.from("video_assets").insert({
    student_user_id: studentId,
    created_by_user_id: user.id,
    title,
    description: getNullableText(formData, "description"),
    category,
    visibility: getVisibility(formData),
    status: getStatus(formData),
    file_name: file.name,
    mime_type: file.type || "video/mp4",
    file_size: file.size,
    storage_bucket: storageBucket,
    storage_key: storageKey,
    thumbnail_key: getNullableText(formData, "thumbnailKey"),
    duration_seconds: getNullableInteger(formData, "durationSeconds", "Duration")
  });

  if (error) {
    await adminSupabase.storage.from(storageBucket).remove([storageKey]);
    throw error;
  }

  revalidateAssetRoutes(studentId);
  redirect(`/students/${studentId}/files`);
}

export async function updateFileAsset(formData: FormData) {
  const studentId = getText(formData, "studentId");
  const assetId = getText(formData, "assetId");
  const title = getText(formData, "title");
  const category = getCategory(formData);

  if (!UUID_PATTERN.test(assetId)) {
    throw new Error("Invalid asset id.");
  }

  if (!title) {
    throw new Error("Title is required.");
  }

  const { supabase } = await assertCanManage(studentId, category);
  const { data, error } = await supabase
    .from("file_assets")
    .update({
      title,
      description: getNullableText(formData, "description"),
      category,
      visibility: getVisibility(formData),
      status: getStatus(formData)
    })
    .eq("id", assetId)
    .eq("student_user_id", studentId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("File asset was not updated.");
  }

  revalidateAssetRoutes(studentId);
  redirect(`/students/${studentId}/files`);
}

export async function updateVideoAsset(formData: FormData) {
  const studentId = getText(formData, "studentId");
  const assetId = getText(formData, "assetId");
  const title = getText(formData, "title");
  const category = getCategory(formData);

  if (!UUID_PATTERN.test(assetId)) {
    throw new Error("Invalid asset id.");
  }

  if (!title) {
    throw new Error("Title is required.");
  }

  const { supabase } = await assertCanManage(studentId, category);
  const { data, error } = await supabase
    .from("video_assets")
    .update({
      title,
      description: getNullableText(formData, "description"),
      category,
      visibility: getVisibility(formData),
      status: getStatus(formData),
      thumbnail_key: getNullableText(formData, "thumbnailKey"),
      duration_seconds: getNullableInteger(formData, "durationSeconds", "Duration")
    })
    .eq("id", assetId)
    .eq("student_user_id", studentId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Video asset was not updated.");
  }

  revalidateAssetRoutes(studentId);
  redirect(`/students/${studentId}/files`);
}

export async function archiveFileAsset(formData: FormData) {
  const studentId = getText(formData, "studentId");
  const assetId = getText(formData, "assetId");

  if (!UUID_PATTERN.test(assetId)) {
    throw new Error("Invalid asset id.");
  }

  await requireUser();
  const userSupabase = await createClient();
  const category = await getExistingAssetCategory(
    userSupabase,
    "file_assets",
    studentId,
    assetId
  );
  const { supabase } = await assertCanManage(studentId, category);
  const { data, error } = await supabase
    .from("file_assets")
    .update({ status: "archived" })
    .eq("id", assetId)
    .eq("student_user_id", studentId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("File asset was not archived.");
  }

  revalidateAssetRoutes(studentId);
  redirect(`/students/${studentId}/files`);
}

export async function archiveVideoAsset(formData: FormData) {
  const studentId = getText(formData, "studentId");
  const assetId = getText(formData, "assetId");

  if (!UUID_PATTERN.test(assetId)) {
    throw new Error("Invalid asset id.");
  }

  await requireUser();
  const userSupabase = await createClient();
  const category = await getExistingAssetCategory(
    userSupabase,
    "video_assets",
    studentId,
    assetId
  );
  const { supabase } = await assertCanManage(studentId, category);
  const { data, error } = await supabase
    .from("video_assets")
    .update({ status: "archived" })
    .eq("id", assetId)
    .eq("student_user_id", studentId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Video asset was not archived.");
  }

  revalidateAssetRoutes(studentId);
  redirect(`/students/${studentId}/files`);
}
