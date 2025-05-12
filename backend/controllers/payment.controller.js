import Payment from "../models/payment.model.js";

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
      status: "paid",
      paidAt: new Date(),
    });

    await payment.save();

    res.status(201).json(payment);
  } catch (error) {
    console.error("Payment error:", error);
    res.status(500).json({ message: "Payment failed", error: error.message });
  }
};
