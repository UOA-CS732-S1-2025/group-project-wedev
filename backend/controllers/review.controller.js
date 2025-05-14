import Review from "../models/review.model.js";
import Booking from "../models/booking.model.js";
<<<<<<< HEAD
=======
import User from "../models/user.model.js";
>>>>>>> origin/main

export const createReview = async (req, res) => {

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

<<<<<<< HEAD
=======
    // 更新 Provider 的 averageRating 和 reviewCount
    const reviewsForProvider = await Review.find({ providerId });
    const totalRating = reviewsForProvider.reduce((sum, r) => sum + r.rating, 0);
    const newAverageRating = reviewsForProvider.length > 0 ? totalRating / reviewsForProvider.length : 0;
    const newReviewCount = reviewsForProvider.length;

    await User.findByIdAndUpdate(providerId, {
      averageRating: newAverageRating,
      reviewCount: newReviewCount,
    });

>>>>>>> origin/main
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

// 新增获取指定服务提供者的所有评价的方法
export const getProviderReviews = async (req, res) => {
  try {
    const { providerId } = req.params;
    
    if (!providerId) {
      return res.status(400).json({ success: false, message: "Provider ID is required" });
    }
    
    // 查找该服务提供者的所有评价，按创建时间降序排列（最新的评价排在前面）
    const reviews = await Review.find({ providerId })
      .sort({ createdAt: -1 })
      .lean();
    
    // 计算平均评分
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
