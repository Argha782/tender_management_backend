import express from "express";
import { verifyJWT, authorizeRoles } from "../middleware/auth.middleware.js";
import { uploadTenderDocs } from "../middleware/multer.middleware.js" 
import { createTender, getAllTenders, getTenderById, updateTender, deleteTender, getMyTenders } from "../controllers/tender.controller.js"

const router = express.Router();

// router.use(verifyJWT, authorizeRoles("superadmin"));
/**
 * @route POST /api/tenders
 * @desc Create a new tender (Admin only)
 * @access Private
 */
router.post("/", verifyJWT, uploadTenderDocs, createTender);

/**
 * @route GET /api/tenders
 * @desc Get all tenders
 * @access Public
 */
// router.get("/",verifyJWT, authorizeRoles("superadmin", "tenderowner", "vendor"), getAllTenders);
router.get("/", getAllTenders);
/**
 * @route GET /api/tenders/my-tenders
 * @desc Get all tenders of a particular tender owner
 * @access Tender owner only
 */
router.get("/my-tenders", verifyJWT,authorizeRoles("tenderowner"), getMyTenders);

/**
 * @route GET /api/tenders/:id
 * @desc Get tender by ID
 * @access Public
 */
router.get("/:id", getTenderById);
router.put("/:id",verifyJWT, uploadTenderDocs, updateTender);
/**
 * @route Delete /api/tenders/:id
 * @desc Delete tender by ID
 * @access Public
 */
router.delete('/:id',verifyJWT, deleteTender);



export default router;
