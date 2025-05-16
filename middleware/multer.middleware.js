import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/temp"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// Initialize multer with our storage engine
const upload = multer({ storage });
// Middleware for multiple-file uploads (field name: "documents", up to 10 files)
export const uploadTenderDocs = upload.array("documents", 10);    // max 10 files

// Default export in case you want generic `upload` in other routes
export default upload;
