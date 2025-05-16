import dotenv from "dotenv";
import express from "express"
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import tenderRoutes from "./routes/tender.routes.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";

dotenv.config();
console.log("✅ Cloudinary Keys:", {
  name: process.env.CLOUDINARY_CLOUD_NAME,
  key: process.env.CLOUDINARY_API_KEY,
  secret: process.env.CLOUDINARY_API_SECRET ? "Loaded ✅" : "Missing ❌"
});

const app = express();

// app.use(cors());
app.use(cors({
  origin: "http://localhost:5173", // your Vite frontend
  credentials: true
}));

app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", authRoutes);
app.use("/api/tenders", tenderRoutes);
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
