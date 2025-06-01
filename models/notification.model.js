// models/notification.model.js
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ["SYSTEM", "TENDER_UPDATE"], required: true },
    tenderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tender",
      default: null,
    },
    method: { type: [String], default: ["IN_APP"] },
    isPublic: { type: Boolean, default: true }, // ← important for visibility
    isRead: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export const Notification = mongoose.model("Notification", notificationSchema);
