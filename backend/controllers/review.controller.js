import Review from "../models/review.model.js";
import Booking from "../models/booking.model.js";

export const createReview = async (req, res) => {
  const { bookingId, rating, comment } = req.body;
};

export const getReviews = async (req, res) => {
  const { bookingId } = req.params;
  const reviews = await Review.find({ bookingId });
  res.status(200).json(reviews);
};
