const express = require('express');
const router = express.Router();
const bidController = require('../controllers/bid.controller');
const { authMiddleware, restrictTo } = require('../middleware/auth.middleware');

// POST /api/bids - Vendor places a bid
router.post('/', authMiddleware, restrictTo('Vendor'), bidController.createBid);

// GET /api/bids/my - Vendor's own bids
router.get('/my', authMiddleware, restrictTo('Vendor'), bidController.getMyBids);

// GET /api/bids/tender/:tenderId - Tender Owner views all bids
router.get('/tender/:tenderId', authMiddleware, restrictTo('TenderOwner'), bidController.getBidsForTender);

module.exports = router;
