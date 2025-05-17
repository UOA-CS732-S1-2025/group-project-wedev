import Review from "../models/review.model.js";
import Booking from "../models/booking.model.js";
import User from "../models/user.model.js";

export const createReview = async (req, res) => {

  try {
    const { bookingId, providerId, customerId, rating, comment } = req.body;

    if (!bookingId || !providerId || !customerId || !rating) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Check if booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // Check if already reviewed
    const exist = await Review.findOne({ bookingId, customerId });
    if (exist) {
      return res.status(400).json({ success: false, message: "Already reviewed" });
    }

    // Create review
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

    // Update provider’s averageRating and reviewCount
    const reviewsForProvider = await Review.find({ providerId });
    const totalRating = reviewsForProvider.reduce((sum, r) => sum + r.rating, 0);
    const newAverageRating = reviewsForProvider.length > 0 ? totalRating / reviewsForProvider.length : 0;
    const newReviewCount = reviewsForProvider.length;

    await User.findByIdAndUpdate(providerId, {
      averageRating: newAverageRating,
      reviewCount: newReviewCount,
    });

    res.status(201).json({ success: true, data: review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }

};

export const getReviews = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    if (!bookingId) {
      return res.status(400).json({ success: false, message: "Booking ID is required" });
    }
    
    const reviews = await Review.find({ bookingId });
    
    res.status(200).json({ 
      success: true, 
      data: reviews 
    });
  } catch (err) {
    console.error("Error fetching booking reviews:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Add method to get all reviews for a specified service provider
export const getProviderReviews = async (req, res) => {
  try {
    const { providerId } = req.params;
    
    if (!providerId) {
      return res.status(400).json({ success: false, message: "Provider ID is required" });
    }
    
    // Find all reviews for the service provider, sorted by creation date in descending order (latest reviews first)
    const reviews = await Review.find({ providerId })
      .sort({ createdAt: -1 })
      .lean();
    
    // Calculate average rating
    let averageRating = 0;
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      averageRating = totalRating / reviews.length;
    }
    
    res.status(200).json({ 
      success: true, 
      data: {
        reviews,
        count: reviews.length,
        averageRating
      }
    });
  } catch (err) {
    console.error("Error fetching provider reviews:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
