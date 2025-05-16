import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, refPath: 'recipientType' },
  recipientType: { type: String, enum: ['Vendor', 'TenderOwner'] },
  message: String,
  isRead: { type: Boolean, default: false },
},
{ timestamps: true }
);
export const Notification = mongoose.model("Notification", notificationSchema);
