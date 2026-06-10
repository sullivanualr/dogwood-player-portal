import { cache } from "react";
import { notFound } from "next/navigation";
import {
  canManageAssets,
  canManageFitnessAssets,
  canViewStudent
} from "@/lib/auth/permissions";
import type { Database } from "@/lib/db/types";
import { createClient } from "@/lib/supabase/server";
import { FITNESS_ASSET_CATEGORIES } from "@/features/files/constants";

export const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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
): Promise<AssetsPageData> => {
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
      id: profile.id,
      firstName: profile.first_name,
      lastName: profile.last_name,
      email: profile.email
    },
    files: files ?? [],
    videos: videos ?? [],
    canManageAll,
    canManageFitness
  };
});
