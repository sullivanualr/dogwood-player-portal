import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/db/types";

type AssetType = "file" | "video" | "thumbnail";
type VideoAsset = Database["public"]["Tables"]["video_assets"]["Row"];

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

function notFound() {
  return NextResponse.json({ error: "Asset not found." }, { status: 404 });
}

async function getAsset(
  supabase: Awaited<ReturnType<typeof createClient>>,
  assetType: AssetType,
  assetId: string
) {
  if (assetType === "file") {
    const { data, error } = await supabase
      .from("file_assets")
      .select("*")
      .eq("id", assetId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return {
      bucket: data.storage_bucket,
      fileName: data.file_name,
      key: data.storage_key
    };
  }

  const { data, error } = await supabase
    .from("video_assets")
    .select("*")
    .eq("id", assetId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const video = data as VideoAsset;

  if (assetType === "thumbnail") {
    return video.thumbnail_key
      ? {
          bucket: "thumbnails",
          fileName: video.file_name,
          key: video.thumbnail_key
        }
      : null;
  }

  return {
    bucket: video.storage_bucket,
    fileName: video.file_name,
    key: video.storage_key
  };
}

export async function GET(request: NextRequest) {
  const assetType = request.nextUrl.searchParams.get("type") as AssetType | null;
  const assetId = request.nextUrl.searchParams.get("id");

  if (
    assetType !== "file" &&
    assetType !== "video" &&
    assetType !== "thumbnail"
  ) {
    return badRequest("Invalid asset type.");
  }

  if (!assetId || !UUID_PATTERN.test(assetId)) {
    return badRequest("Invalid asset id.");
  }

  const supabase = await createClient();
  const asset = await getAsset(supabase, assetType, assetId);

  if (!asset) {
    return notFound();
  }

  const adminSupabase = createAdminClient();
  const signedUrlOptions =
    assetType === "file" ? { download: asset.fileName } : undefined;
  const { data, error } = await adminSupabase.storage
    .from(asset.bucket)
    .createSignedUrl(asset.key, 60 * 10, signedUrlOptions);

  if (error || !data?.signedUrl) {
    return notFound();
  }

  return NextResponse.redirect(data.signedUrl);
}
