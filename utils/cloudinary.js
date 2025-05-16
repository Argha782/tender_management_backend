import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";

// Load env vars
dotenv.config(); // ✅ Load early

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    console.log("📤 Uploading to Cloudinary:", localFilePath);
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    console.log("✅ Cloudinary upload success:", response.secure_url);

    fs.unlinkSync(localFilePath); // delete local file
    return response;
  } catch (error) {
    console.error("❌ Cloudinary upload error:", error.message);
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
      console.log(`Deleted local file after failed upload: ${localFilePath}`);
    }
    return null;
  }
};

export { uploadOnCloudinary };
