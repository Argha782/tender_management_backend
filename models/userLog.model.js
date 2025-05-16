import mongoose from "mongoose";

const userLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  ip: String,
  userAgent: String,
},
{ timestamps: true });

export const UserLog = mongoose.model("UserLog", userLogSchema);
