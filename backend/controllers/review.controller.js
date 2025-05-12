const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Review = require('../models/Review');
const Booking = require('../models/Booking');

export const AddReview = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;

    if (!bookingId || !rating) {
      return res.status(400).json({ message: 'Booking ID and rating are required' });
    }

    const booking = await Booking.findById(bookingId);
    const provider = await Booking.findById(booking.provider);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'Booking is not completed' });
    }

    const review = new Review({
      bookingId,
      customerId: req.user.id,
      customerName: req.user.username,
      providerId: booking.provider,
      providerName: provider.username,
      rating,
      comment,
      serviceType: booking.serviceType
    });

    await review.save();

    res.status(201).json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const GetReview  = async (req, res) => {
  try {
    const { providerId } = req.params;

    const provider = await User.findById(providerId);
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    const reviews = await Review.find({ providerId })
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Server error' });
  }
};