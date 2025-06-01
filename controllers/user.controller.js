import { User } from "../models/user.model.js";
// import { UserLog } from "../models/userLog.model.js";
import { Tender } from "../models/tender.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asynchandler.js";
import bcrypt from "bcrypt";

// Get All Users
export const createUser = asyncHandler(async (req, res) => {
  console.log("🔥 Incoming user form data:", req.body);

  const {
    firstName,
    lastName,
    email,
    password,       
    phoneNumber,
    department,
    designation,
    role
  } = req.body;

  if (!firstName || !lastName || !email || !password || !role) {
    console.log("❌ Missing required fields");

    throw new ApiError(400, "All required user fields must be filled.");
  }

  const user = new User({
    firstName,
    lastName,
    email,
    password,       
    phoneNumber,
    department,
    designation,
    role,
    accountVerified: role === "vendor" ? false : true, // 🔥 This line ensures vendors are unverified, others are verified
  });

  await user.save();

  return res
    .status(201)
    .json(new ApiResponse(201, user, "User created successfully."));
});

// Get All Users
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find()
    // .select("-password");
    res.status(200).json(new ApiResponse(200, users, "All users fethched."));
  } catch (err) {
    next(new ApiError("Failed to fetch users", 500));
  }
};

// Get Single User by ID
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
    // .select("-password");
    if (!user) return next(new ApiError("User not found", 404));
    res.status(200).json(user);
  } catch (err) {
    next(new ApiError("Failed to fetch user", 500));
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { password, ...rest } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: rest },
      { new: true }
    )
    // .select("-password");

    if (!updatedUser) return next(new ApiError("User not found", 404));
    res.status(200).json(updatedUser);
  } catch (err) {
    next(new ApiError("Failed to update user", 500));
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return next(new ApiError("User not found", 404));
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    next(new ApiError("Failed to delete user", 500));
  }
};

export const userActivity = async (req, res, next) => {
    try {
      const { id } = req.params;
  
      const user = await User.findById(id).select("firstName lastName email role lastActiveAt");
      if (!user) return res.status(404).json({ message: "User not found" });
  
      const tenders = await Tender.find({ createdBy: id })
        .sort({ updatedAt: -1 })
        .select("tenderNo updatedAt status");
  
      const userData = {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role,
        isOnline: user.lastActiveAt && (new Date() - new Date(user.lastActiveAt)) < 10 * 60 * 1000,
        lastActiveAt: user.lastActiveAt,
        tenders,
      };
  
      res.status(200).json(userData);
    } catch (err) {
      console.error("❌ Failed to fetch user activity:", err);
      next(new ApiError("Unable to fetch user activity", 500));
    }
  };

// Get current logged-in user profile
export const getMyProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(404).json({ message: "User not found" });
    }
    const user = req.user.toObject();
    delete user.password;
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update current logged-in user profile
export const updateMyProfile =asyncHandler(async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { firstName, lastName, phoneNumber, department, designation } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, phoneNumber, department, designation },
      { new: true }
    ).select("-password");

    if (!updatedUser) return next(new ApiError("User not found", 404));
    res.status(200).json(updatedUser);
  } catch (err) {
    next(new ApiError("Failed to update user", 500));
  }
});

// Update password for logged-in user
// PUT /users/change-password
export const changePassword = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
};

  