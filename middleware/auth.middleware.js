import asyncHandler from "../utils/asynchandler.js";
import ApiError from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    // const { token } = req.cookies;
    const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>

    if (!token) {
      console.error("No token provided in request headers");
      return next(new ApiError("No token Provided", 400));
      // return res.status(401).json({ message: "No token provided" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (verifyError) {
      console.error("JWT verification error:", verifyError);
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    req.user = await User.findById(decoded.id).select("-password");            //////////////
    if (!req.user) {
      console.error("User not found for decoded token id:", decoded.id);
      return res.status(401).json({ message: "User not found" });
    }

    next();
  } catch (err) {
    console.error("Unexpected error in verifyJWT middleware:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};
