// models/Notification.js
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["query", "response", "tender-update", "system", "broadcast"],
      required: true,
    },
    tender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tender",
      required: false, // For tender-specific notifications
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Can be Vendor or Admin
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Admin, Vendor, or Super Admin
      required: false, // Optional for broadcasts
    },
    message: {
      type: String,
      required: true,
    },
    method: {
      type: [String],
      enum: ["in-app", "email", "sms"],
      default: ["in-app"],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isResolved: {
      type: Boolean,
      default: false, // Only for queries
    },
    responseTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Notification",
      default: null, // If this is a reply
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const Notification = mongoose.model("Notification", notificationSchema);
