import { cache } from "react";
import {
  canManageAssets,
  canManageFitnessAssets
} from "@/lib/auth/permissions";
import type { Database } from "@/lib/db/types";
import { FITNESS_ASSET_CATEGORIES } from "@/features/files/constants";
import {
  getStudentPageAccess,
  type StudentFeatureUnavailableData
} from "@/features/students/page-access";

export type FileAsset = Database["public"]["Tables"]["file_assets"]["Row"];
export type VideoAsset = Database["public"]["Tables"]["video_assets"]["Row"];

export type AssetsPageData = {
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  files: FileAsset[];
  videos: VideoAsset[];
  canManageAll: boolean;
  canManageFitness: boolean;
};

export const getAssetsPageData = cache(async (
  studentId: string
): Promise<AssetsPageData | StudentFeatureUnavailableData> => {
  const access = await getStudentPageAccess(studentId);

  if (access.status !== "ok") {
    return { status: access.status };
  }

  const { student, supabase } = access;
  const canManageAll = await canManageAssets(supabase, studentId);
  const canManageFitness = canManageAll
    ? false
    : await canManageFitnessAssets(supabase, studentId);
  let filesQuery = supabase
    .from("file_assets")
    .select("*")
    .eq("student_user_id", studentId);
  let videosQuery = supabase
    .from("video_assets")
    .select("*")
    .eq("student_user_id", studentId);

  if (canManageFitness) {
    const fitnessCategories = Array.from(FITNESS_ASSET_CATEGORIES);
    filesQuery = filesQuery.in("category", fitnessCategories);
    videosQuery = videosQuery.in("category", fitnessCategories);
  } else if (!canManageAll) {
    filesQuery = filesQuery.neq("status", "archived");
    videosQuery = videosQuery.neq("status", "archived");
  }

  const { data: files, error: filesError } = await filesQuery
    .order("created_at", { ascending: false });

  if (filesError) {
    throw filesError;
  }

  const { data: videos, error: videosError } = await videosQuery
    .order("created_at", { ascending: false });

  if (videosError) {
    throw videosError;
  }

  return {
    student: {
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email
    },
    files: files ?? [],
    videos: videos ?? [],
    canManageAll,
    canManageFitness
  };
});
