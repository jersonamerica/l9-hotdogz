import mongoose, { Schema, models } from "mongoose";

const userSchema = new Schema(
  {
    providerId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: false,
    },
    image: {
      type: String,
      required: false,
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
    equipmentType: {
      type: String,
      enum: ["Plate", "Leather", "Cloth"],
      default: "Plate",
    },
    userEquipmentItems: [
      {
        type: String,
        default: "",
      },
    ],
    userEquipmentAccessories: {
      type: [String],
      default: [],
    },
    userAbilities: {
      type: [String],
      default: [],
    },
    userMounts: {
      type: [String],
      default: [],
    },
    isOnboarded: {
      type: Boolean,
      default: false,
    },
    attendancePoints: {
      type: Number,
      default: 0,
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
