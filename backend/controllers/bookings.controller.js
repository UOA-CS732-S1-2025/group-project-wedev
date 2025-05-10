import Booking from "../models/booking.model.js";

export const getBookingHistory = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.params.id }).sort({ bookingDate: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
