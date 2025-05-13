import Review from "../models/review.model.js";
import Booking from "../models/booking.model.js";

export const createReview = async (req, res) => {
<<<<<<< HEAD
=======

>>>>>>> origin/develop
  try {
    const { bookingId, providerId, customerId, rating, comment } = req.body;

    if (!bookingId || !providerId || !customerId || !rating) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // 检查 booking 是否存在
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // 检查是否已评价
    const exist = await Review.findOne({ bookingId, customerId });
    if (exist) {
      return res.status(400).json({ success: false, message: "Already reviewed" });
    }

    // 创建 review
    const review = await Review.create({
      bookingId,
      providerId,
      customerId,
      rating,
      comment,
      customerName: req.user?.username,
      providerName: booking.provider?.username,
      serviceType: booking.serviceType,
    });

    res.status(201).json({ success: true, review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
<<<<<<< HEAD
=======

>>>>>>> origin/develop
};

export const getReviews = async (req, res) => {
  const { bookingId } = req.params;
  const reviews = await Review.find({ bookingId });
  res.status(200).json(reviews);
};
