import mongoose, { Schema, models } from "mongoose";

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: false,
    },
    image: {
      type: String,
      required: false,
    },
    googleId: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      enum: ["member", "admin"],
      default: "member",
    },
    cp: {
      type: Number,
      default: 0,
    },
    mastery: {
      type: String,
      default: "",
    },
    isOnboarded: {
      type: Boolean,
      default: false,
    },
    gearLog: [
      {
        equipment: {
          type: Schema.Types.ObjectId,
          ref: "Equipment",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Delete cached model in development to pick up schema changes
if (models.User) {
  mongoose.deleteModel("User");
}

export const User = mongoose.model("User", userSchema);
