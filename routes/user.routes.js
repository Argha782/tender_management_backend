import express from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  userActivity,
  getMyProfile,
  updateMyProfile,
  changePassword
} from "../controllers/user.controller.js";
import { verifyJWT, authorizeRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

// Routes for current logged-in user's profile
router.get("/me",verifyJWT, getMyProfile);
router.put("/me",verifyJWT, updateMyProfile);
router.put("/change-password",verifyJWT, changePassword);

// Routes below are protected for SuperAdmin only
router.use(verifyJWT, authorizeRoles("superadmin"));

router.get("/", getAllUsers);
router.get("/activity/:id", userActivity);
router.get("/:id", getUserById);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);



export default router;
