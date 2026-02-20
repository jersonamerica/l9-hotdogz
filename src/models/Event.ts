import mongoose, { Schema, models } from "mongoose";

const eventSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

eventSchema.index({ createdAt: -1 });

if (models.Event) {
  mongoose.deleteModel("Event");
}

export const Event = mongoose.model("Event", eventSchema);
