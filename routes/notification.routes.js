import express from "express";
import { verifyJWT, authorizeRoles } from "../middleware/auth.middleware.js";
import {
  createNotification,
  deleteNotification,
  getNotificationsForUser,
  markNotificationAsRead,
  
} from "../controllers/notification.controller.js";

const router = express.Router();

router.post("/", verifyJWT, createNotification);
router.get("/", getNotificationsForUser);
router.patch("/:id/read", markNotificationAsRead);
router.delete("/:id", verifyJWT, deleteNotification);
export default router;
