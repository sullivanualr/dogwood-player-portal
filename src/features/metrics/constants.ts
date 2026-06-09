import type { MetricCategory } from "@/lib/db/types";

export const FITNESS_METRIC_CATEGORIES = new Set<MetricCategory>(["fitness"]);

export const METRIC_CATEGORY_OPTIONS: Array<{
  value: MetricCategory;
  label: string;
}> = [
  { value: "swing", label: "Swing" },
  { value: "scoring", label: "Scoring" },
  { value: "skills", label: "Skills" },
  { value: "putting", label: "Putting" },
  { value: "wedge", label: "Wedge" },
  { value: "speed", label: "Speed" },
  { value: "fitness", label: "Fitness" },
  { value: "practice", label: "Practice" },
  { value: "custom", label: "Custom" }
];
