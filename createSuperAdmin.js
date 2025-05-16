// createSuperAdmin.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "./models/user.model.js"; // Adjust path as needed

dotenv.config();
console.log("🔍 MONGO_URI:", process.env.MONGO_URI);

const createSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const existing = await User.findOne({ email: "admin@aegcl.com" });
    if (existing) {
      console.log("⚠️ Super Admin already exists.");
    } else {
      const superAdmin = new User({
        firstName: "Super",
        lastName: "Admin",
        email: "admin@aegcl.com",
        password: "yourStrongPassword123", // will be hashed by model
        role: "superadmin",
      });
      await superAdmin.save();
      console.log("✅ Super Admin created successfully.");
    }
  } catch (err) {
    console.error("❌ Error creating Super Admin:", err.message);
  } finally {
    mongoose.disconnect();
  }
};

createSuperAdmin();
