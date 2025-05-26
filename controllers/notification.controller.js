import { Notification } from "../models/notification.model.js";
import { User } from "../models/user.model.js";
import { Tender } from "../models/tender.model.js";
import { sendEmail } from "../utils/sendEmail.js"; // create this utility
// import { sendSMS } from "../utils/sendSMS.js"; // create this utility

// CREATE Notification
export const createNotification = async (req, res) => {
  try {
    const {
      tenderId,
      receiver,
      type,
      subject,
      message,
      method = ["IN_APP"],
    } = req.body;
    const sender = req.user._id;

    const notification = await Notification.create({
      tenderId,
      sender,
      receiver,
      type,
      subject,
      message,
      method,
    });

    // Send Email or SMS if selected
    const recipient = await User.findById(receiver);

    if (method.includes("EMAIL") && recipient.email) {
      await sendEmail(recipient.email, subject || "Notification", message);
    }

    if (method.includes("SMS") && recipient.phone) {
      await sendSMS(recipient.phone, message);
    }

    res.status(201).json({ success: true, notification });
  } catch (error) {
    console.error("Notification error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to send notification" });
  }
};

// GET All Notifications for a User
export const getNotificationsForUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const notifications = await Notification.find({ receiver: userId })
      .populate("sender", "name role")
      .populate("tenderId", "tenderNo")
      .sort({ createdAt: -1 });

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
