import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  customerName: {
    type: String
  },
  providerName: {
    type: String
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  serviceType: {
    type: String
  },
  comment: {
    type: String
  }
}, { timestamps: true }); // Automatically add createdAt and updatedAt

const Review = mongoose.model("Review", reviewSchema);

export default Review;
