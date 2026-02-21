import mongoose, { Schema, models } from "mongoose";

const activityLogSchema = new Schema(
  {
    action: {
      type: String,
      enum: [
        "equipment_added",
        "equipment_updated",
        "equipment_deleted",
        "announcement_created",
        "announcement_updated",
        "announcement_deleted",
        "member_joined",
        "profile_updated",
        "gear_marked_done",
        // User profile field updates
        "name_updated",
        "cp_updated",
        "mastery_updated",
        "equipment_type_updated",
        // Legendary equipment
        "legendary_equipment_added",
        "legendary_equipment_removed",
        // Accessories
        "accessory_added",
        "accessory_removed",
        // Abilities
        "ability_added",
        "ability_removed",
        // Mounts
        "mount_added",
        "mount_removed",
        // Gear log (item log)
        "item_log_added",
        "item_log_removed",
        // Admin actions
        "admin_updated_user",
      ],
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    details: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

// Index for fast queries sorted by newest first
activityLogSchema.index({ createdAt: -1 });

if (models.ActivityLog) {
  mongoose.deleteModel("ActivityLog");
}

export const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);
