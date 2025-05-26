import express from "express";
import { verifyJWT, authorizeRoles } from "../middleware/auth.middleware.js";
import {
  createNotification,
  getNotificationsForUser,
  markNotificationAsRead,
} from "../controllers/notification.controller.js";

const router = express.Router();

router.post("/", verifyJWT, createNotification);
router.get("/", verifyJWT, getNotificationsForUser);
router.patch("/:id/read", verifyJWT, markNotificationAsRead);

export default router;
