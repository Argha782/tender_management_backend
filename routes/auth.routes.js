import express from "express";
import {
  registerUser,
  loginUser,
  verifyOTP,
  logoutUser,
  forgotPassword,
  resetPassword
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();

// Register route
router.post("/register", registerUser);

// Verify OTP route
router.post("/otp-verification", verifyOTP);

// Login route
router.post("/login", loginUser);

// Logout route
router.get("/logout",verifyJWT, logoutUser);

// Password forgot route
router.post("/password/forgot", forgotPassword);

// Reset password route
router.put("/password/reset/:token", resetPassword);

export default router;

