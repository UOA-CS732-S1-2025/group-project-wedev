import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "paid", "failed", "refunded"],
    default: "pending",
  },
  method: {
    type: String,
    enum: ["credit_card", "paypal", "bank_transfer", "other"],
    default: "credit_card",
  },
  paidAt: {
    type: Date,
  },
}, { timestamps: true });

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
