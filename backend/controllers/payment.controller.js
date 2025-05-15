import Payment from "../models/payment.model.js";
import Booking from "../models/booking.model.js";

export const createPayment = async (req, res) => {
  try {
    const { provider, booking, amount, method } = req.body;
    const customer = req.userId; // 从 token 中获取用户 ID

    const payment = new Payment({
      customer,
      provider,
      booking,
      amount,
      method,
      status: "pending",
      paidAt: new Date(),
    });

    await payment.save();

    res.status(201).json(payment);
  } catch (error) {
    console.error("Payment error:", error);
    res.status(500).json({ message: "Payment failed", error: error.message });
  }
};

export const updatePayment = async (req, res) => {
  try {
    const paymentId = req.params.id;
    const updateFields = req.body;

    const updated = await Payment.findByIdAndUpdate(paymentId, updateFields, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (updateFields.status === "paid") {
      await Booking.findByIdAndUpdate(updated.booking, {
        "paymentDetails.paymentStatus": "succeeded",
        "paymentDetails.paymentMethod": updated.method,
        "paymentDetails.paidAmount": updated.amount,
        "paymentDetails.paymentDate": updated.paidAt || new Date(),
      });
    }

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update payment", error: err.message });
  }
};

export const getPaymentByBookingId = async (req, res) => {
  try {
    const payment = await Payment.findOne({ booking: req.params.bookingId });
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve payment", error: err.message });
  }
};