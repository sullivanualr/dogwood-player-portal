import type { AssetStatus } from "@/lib/db/types";

export const ASSET_STATUS_OPTIONS: Array<{ value: AssetStatus; label: string }> =
  [
    { value: "draft", label: "Draft" },
    { value: "published", label: "Published" },
    { value: "archived", label: "Archived" }
  ];

export const ASSET_CATEGORY_OPTIONS = [
  { value: "general", label: "General" },
  { value: "lesson", label: "Lesson" },
  { value: "practice", label: "Practice" },
  { value: "assessment", label: "Assessment" },
  { value: "fitness", label: "Fitness" },
  { value: "movement", label: "Movement" },
  { value: "movement_screen", label: "Movement Screen" }
];

export const FITNESS_ASSET_CATEGORIES = new Set([
  "fitness",
  "movement",
  "movement_screen"
]);

export const FILE_BUCKET = "student-files";
export const VIDEO_BUCKET = "student-videos";
export const MOVEMENT_BUCKET = "movement-screens";

export const GENERAL_FILE_MAX_SIZE = 25 * 1024 * 1024;
export const IMAGE_MAX_SIZE = 15 * 1024 * 1024;
export const VIDEO_MAX_SIZE = 500 * 1024 * 1024;
