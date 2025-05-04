import Payment from "../../models/payment.model.js";

export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("customer", "username email")
      .populate("provider", "username email")
      .populate("booking", "_id serviceType startTime endTime")
      .sort({ createdAt: -1 });

    res.status(200).json(payments);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch payments" });
  }
};
