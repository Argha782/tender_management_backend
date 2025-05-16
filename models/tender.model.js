import mongoose, {Schema} from "mongoose";

const tenderSchema = new Schema(
  {
    tenderNo: {
      type: String,
      required: true,
      unique: true,
    },
    tenderDetails: {
      type: String,
      required: true,
    },
    publishDate: {
      type: Date,
      required: true,
    },
    submissionStartDate: {
      type: Date,
      required: true,
    },
    tenderEndDate: {
      type: Date,
      required: true,
    },
    tenderOpeningDate: {
      type: Date,
      required: true,
    },
    preBidMeetingDate: {
      type: Date,
      required: true,
    },
    priceBidOpeningDate: {
      type: Date,
      required: true,
    },
    workType: {
      type: String,
      required: true,
    },
    invitingAuthorityDesignation: {
      type: String,
      required: true,
    },
    invitingAuthorityAddress: {
      type: String,
      required: true,
    },
    totalTenderValue: {
      type: Number,
      required: true,
    },
    documents: [
      {
        title: { type: String},
        url: { type: String}, // Cloudinary URL
      }
    ],
    remarks: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Open", "Ongoing", "Completed"],
      default: "Open",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      // required: false                                                          
      required: true, // after authetication     
    }
  },
  { timestamps: true }
);

export const Tender = mongoose.model("Tender", tenderSchema);
