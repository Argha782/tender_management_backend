const Bid = require('../models/bid.model');
const Tender = require('../models/tender.model');
const Notification = require('../models/notification.model');

exports.createBid = async (req, res) => {
  try {
    const { tenderId, bidAmount, remarks, documents } = req.body;

    const bid = await Bid.create({
      tender: tenderId,
      vendor: req.user._id,
      bidAmount,
      remarks,
      documents,
    });

    const tender = await Tender.findById(tenderId).populate('createdBy');

    // Send notification to Tender Owner
    await Notification.create({
      recipient: tender.createdBy._id,
      recipientType: 'TenderOwner',
      message: `New bid placed on Tender #${tender.tenderNo}`,
    });

    res.status(201).json({ success: true, bid });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBidsForTender = async (req, res) => {
  try {
    const { tenderId } = req.params;

    const bids = await Bid.find({ tender: tenderId })
      .populate('vendor', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, bids });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyBids = async (req, res) => {
  try {
    const bids = await Bid.find({ vendor: req.user._id }).populate('tender');
    res.status(200).json({ success: true, bids });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
