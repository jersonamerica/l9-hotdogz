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
  | "gear_marked_done"
  // User profile field updates
  | "name_updated"
  | "cp_updated"
  | "mastery_updated"
  | "equipment_type_updated"
  // Legendary equipment
  | "legendary_equipment_added"
  | "legendary_equipment_removed"
  // Accessories
  | "accessory_added"
  | "accessory_removed"
  // Abilities
  | "ability_added"
  | "ability_removed"
  // Mounts
  | "mount_added"
  | "mount_removed"
  // Gear log (item log)
  | "item_log_added"
  | "item_log_removed"
  // Admin actions
  | "admin_updated_user";

export interface ActivityLogEntry {
  action: ActivityAction;
  user: string;
  details: string;
}

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

export async function logActivitiesBatch(entries: ActivityLogEntry[]) {
  if (entries.length === 0) return;

  try {
    await ActivityLog.insertMany(entries);
  } catch (error) {
    // Don't let activity logging failures break the main operation
    console.error("Failed to log activities in batch:", error);
  }
}
