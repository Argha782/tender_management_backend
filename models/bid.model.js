import mongoose from "mongoose";

const bidSchema = new mongoose.Schema({
  tender: { type: Schema.Types.ObjectId, ref: 'Tender', required: true },
  vendor: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
  bidAmount: { type: Number, required: true },
  documents: [{
    title: { type: String},
    url: { type: String}, // Cloudinary URL
  }],
  remarks: { type: String },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected'],
    default: 'Pending',
  },
  createdAt: { type: Date, default: Date.now },
},
{ timestamps: true }
);

export const Bid = mongoose.model("Bid", bidSchema);
