import type { TournamentResultStatus } from "@/lib/db/types";

export const TOURNAMENT_STATUS_OPTIONS: Array<{
  value: TournamentResultStatus;
  label: string;
}> = [
  { value: "upcoming", label: "Upcoming" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "archived", label: "Archived" }
];
