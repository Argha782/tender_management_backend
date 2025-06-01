import { Tender } from "../models/tender.model.js";
import { Notification } from "../models/notification.model.js";
import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asynchandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// Create Tender
const createTender = asyncHandler(async (req, res) => {
  console.log("🔥 Incoming tender form data:", req.body);
  console.log("📄 Uploaded files:", req.files);

  const {
    tenderNo,
    tenderDetails,
    publishDate,
    submissionStartDate,
    tenderEndDate,
    tenderOpeningDate,
    preBidMeetingDate,
    priceBidOpeningDate,
    workType,
    invitingAuthorityDesignation,
    invitingAuthorityAddress,
    totalTenderValue,
    remarks,
    status,
  } = req.body;

  if (
    !tenderNo ||
    !tenderDetails ||
    !publishDate ||
    !submissionStartDate ||
    !tenderEndDate ||
    !tenderOpeningDate ||
    !preBidMeetingDate ||
    !priceBidOpeningDate ||
    !workType ||
    !invitingAuthorityDesignation ||
    !invitingAuthorityAddress ||
    !totalTenderValue
  ) {
    console.log("❌ Missing required fields");

    throw new ApiError(400, "All required tender fields must be filled.");
  }

  let documents = [];

  // Parse document titles JSON string from req.body
  let documentTitles = [];
  if (req.body.documentTitles) {
    try {
      documentTitles = JSON.parse(req.body.documentTitles);
    } catch (err) {
      console.error("Error parsing documentTitles JSON:", err);
    }
  }

  if (req.files && req.files.length > 0) {
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      try {
        const cloudinaryResponse = await uploadOnCloudinary(file.path);
        if (!cloudinaryResponse) {
          throw new Error("Cloudinary upload returned null.");
        }
        // Use title from documentTitles array if available
        const title =
          documentTitles[i] || file.originalname || "Untitled Document";
        documents.push({
          title,
          url: cloudinaryResponse.secure_url,
        });
      } catch (uploadErr) {
        console.error("❌ Cloudinary upload error:", uploadErr);
        throw new ApiError(500, "Document upload failed: " + uploadErr.message);
      }
    }
  }

  const tender = await Tender.create({
    tenderNo,
    tenderDetails,
    publishDate,
    submissionStartDate,
    tenderEndDate,
    tenderOpeningDate,
    preBidMeetingDate,
    priceBidOpeningDate,
    workType,
    invitingAuthorityDesignation,
    invitingAuthorityAddress,
    totalTenderValue,
    remarks,
    status,
    documents,
    // createdBy: req.user?._id || "6612c25ae3c4f26d306eabb9", // TEMP ID if auth disabled
    createdBy: req.user._id,
  });

   await Notification.create({
    type: "TENDER_UPDATE",
    subject: "New Tender Published",
    message: `A new tender "${tender.tenderNo}" has been published.`,
    tenderId: tender._id,
    sender: req.user._id,
    method: ["IN_APP", "EMAIL"],
  });

  return res
    .status(201)
    .json(new ApiResponse(201, tender, "Tender created successfully."));
});

// Get All Tenders
const getAllTenders = asyncHandler(async (req, res) => {
  const tenders = await Tender.find()
    .populate("createdBy", "firstName lastName email") // Populate name and email of creator
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, tenders, "All tenders fetched."));
});

// Get Single Tender by ID
const getTenderById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  // const tender = await Tender.findById(id);
  const tender = await Tender.findById(req.params.id).populate(
    "createdBy",
    "firstName lastName email"
  );
  if (!tender) {
    throw new ApiError(404, "Tender not found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tender, "Tender fetched successfully."));
});

// Get Tenders of from a particular Tender owner
export const getMyTenders = async (req, res) => {
  try {
    const ownerId = req.user._id; // Make sure JWT middleware sets req.user
    const tenders = await Tender.find({ createdBy: ownerId }).populate(
      "createdBy",
      "firstName lastName"
    );
    res.status(200).json({ data: tenders });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tenders", error });
  }
};

// Update Tender
const updateTender = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existingTender = await Tender.findById(id);
  if (!existingTender) {
    return res.status(404).json({ message: "Tender not found" });
  }

  // Parse document titles JSON string from req.body
  let documentTitles = [];
  try {
    documentTitles = JSON.parse(req.body.documentTitles || "[]");
  } catch (err) {
    console.error("❌ Failed to parse documentTitles:", err);
  }

  // Parse existingDocuments JSON string from req.body
  let existingDocumentsToKeep = [];
  try {
    existingDocumentsToKeep = JSON.parse(req.body.existingDocuments || "[]");
  } catch (err) {
    console.error("❌ Failed to parse existingDocuments:", err);
  }

  // Filter existing documents to keep only those in existingDocumentsToKeep
  let documents = existingTender.documents.filter((doc) =>
    existingDocumentsToKeep.some((keepDoc) => keepDoc.url === doc.url)
  );

  // Upload new files and add to documents array
  if (req.files && req.files.length > 0) {
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      console.log("🛠️ Incoming tender form data:", req.body);
      console.log("📂 Incoming Files in updateTender:", req.files);
      try {
        const cloudinaryResponse = await uploadOnCloudinary(file.path);
        if (!cloudinaryResponse) {
          throw new Error("Cloudinary upload returned null.");
        }
        const title =
          documentTitles[i] || file.originalname || "Untitled Document";
        documents.push({
          title,
          url: cloudinaryResponse.secure_url,
        });
        // Optionally delete local temp file if needed
        // fs.unlinkSync(file.path);
      } catch (uploadErr) {
        console.error("❌ Cloudinary upload error:", uploadErr);
        throw new ApiError(500, "Document upload failed: " + uploadErr.message);
      }
    }
  }

  // Update tender fields
  // const updateData = {
  //   ...req.body,
  //   documents,
  // };

  // Build update payload
  const updateData = {
    tenderNo: req.body.tenderNo,
    tenderDetails: req.body.tenderDetails,
    publishDate: req.body.publishDate,
    submissionStartDate: req.body.submissionStartDate,
    tenderEndDate: req.body.tenderEndDate,
    tenderOpeningDate: req.body.tenderOpeningDate,
    preBidMeetingDate: req.body.preBidMeetingDate,
    priceBidOpeningDate: req.body.priceBidOpeningDate,
    workType: req.body.workType,
    invitingAuthorityDesignation: req.body.invitingAuthorityDesignation,
    invitingAuthorityAddress: req.body.invitingAuthorityAddress,
    totalTenderValue: req.body.totalTenderValue,
    remarks: req.body.remarks,
    status: req.body.status,
    documents,
  };

  // Remove documentTitles and existingDocuments from updateData to avoid saving them in DB
  delete updateData.documentTitles;
  delete updateData.existingDocuments;

  const updatedTender = await Tender.findByIdAndUpdate(id, updateData, {
    new: true,
  });

 await Notification.create({
    type: "TENDER_UPDATE",
    subject: "Tender Updated",
    message: `Tender "${updatedTender.tenderNo}" has been updated.`,
    tenderId: updatedTender._id,
    sender: req.user._id,
    method: ["IN_APP", "EMAIL"],
  });


  res.status(200).json(updatedTender);
});

// Delete Tender
const deleteTender = asyncHandler(async (req, res) => {
  try {
    const deleted = await Tender.findByIdAndDelete(req.params.id);
    if (!deleted) throw new ApiError("Tender not found", 404);
    return res
      .status(200)
      .json(new ApiResponse(200, deleted, "Tender deleted successfully"));
  } catch (err) {
    throw new ApiError(500, "Failed to delete Tender", err);
  }
});

export {
  createTender,
  getAllTenders,
  getTenderById,
  updateTender,
  deleteTender,
};
