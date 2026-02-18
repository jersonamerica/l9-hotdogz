import { ActivityLog } from "@/models/ActivityLog";

type ActivityAction =
  | "equipment_added"
  | "equipment_updated"
  | "equipment_deleted"
  | "announcement_created"
  | "announcement_updated"
  | "announcement_deleted"
  | "member_joined"
  | "profile_updated"
  | "gear_marked_done";

export async function logActivity(
  userId: string,
  action: ActivityAction,
  details: string = "",
) {
  try {
    await ActivityLog.create({ action, user: userId, details });
  } catch (error) {
    // Don't let activity logging failures break the main operation
    console.error("Failed to log activity:", error);
  }
}
