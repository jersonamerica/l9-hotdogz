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
