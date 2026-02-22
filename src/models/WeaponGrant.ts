import mongoose, { Schema, models } from "mongoose";

const weaponGrantSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    weapon: {
      type: String,
      required: true,
      trim: true,
    },
    grantedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    grantedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

weaponGrantSchema.index({ grantedAt: -1 });

export const WeaponGrant =
  models.WeaponGrant || mongoose.model("WeaponGrant", weaponGrantSchema);
