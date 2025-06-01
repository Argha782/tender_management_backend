import { Notification } from "../models/notification.model.js";
import { User } from "../models/user.model.js";
import { Tender } from "../models/tender.model.js";
import { sendEmail } from "../utils/sendEmail.js"; // create this utility
// import { sendSMS } from "../utils/sendSMS.js"; // create this utility

// CREATE Notification
export const createNotification = async (req, res) => {
  try {
    const { type, subject, message, tenderId, method = ["IN_APP"] } = req.body;
    const sender = req.user;

    // Role-based restrictions
    if (sender.role === "tenderowner" && type !== "TENDER_UPDATE") {
      return res
        .status(403)
        .json({ message: "Unauthorized notification type" });
    }

    if (!["superadmin", "tenderowner"].includes(sender.role)) {
      return res
        .status(403)
        .json({
          message: "Only superadmin or tenderowner can create notifications",
        });
    }

    const notification = await Notification.create({
      sender: sender._id,
      type,
      subject,
      message,
      tenderId: tenderId || null,
      method,
      isPublic: true,
    });

    // Optional: send email/SMS logic here

    res.status(201).json({ success: true, notification });
  } catch (error) {
    console.error("Error creating notification:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to create notification" });
  }
};

// GET All Notifications for a User
export const getNotificationsForUser = async (req, res) => {
  try {
    // const userId = req.user._id;
    const notifications = await Notification.find({})
      .sort({ createdAt: -1 })
      .populate("sender", "name email role")
      .populate("tenderId", "tenderNo");

    res.status(200).json({ success: true, notifications });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch notifications" });
  }
};

// MARK as Read
export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { isRead: true });
    res
      .status(200)
      .json({ success: true, message: "Notification marked as read" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to update notification" });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Only superadmin OR the sender of the notification can delete
    if (
      currentUser.role !== "superadmin" &&
      notification.sender.toString() !== currentUser._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this notification" });
    }

    await notification.deleteOne();

    res.status(200).json({ success: true, message: "Notification deleted" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete notification" });
  }
};
