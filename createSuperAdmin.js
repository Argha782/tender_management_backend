// createSuperAdmin.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "./models/user.model.js"; // Adjust path as needed

dotenv.config();
console.log("🔍 MONGO_URI:", process.env.MONGO_URI);

const createSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const existing = await User.findOne({ role: "superadmin" });
    if (existing) {
      console.log("⚠️ Super Admin already exists.");
    } else {
      const superAdmin = new User({
      firstName: "Super",
      lastName: "Admin",
      email: "bibekdas591@gmail.com",
      phoneNumber: "+916000263287",
      password: "SuperAdminPassword123!", // Change to a secure password
      role: "superadmin",
      accountVerified: true,
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
