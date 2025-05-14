import express from 'express';
const router = express.Router();
import * as bookingController from '../controllers/booking.controller.js';
import { authMiddleware } from "../middleware/auth.middleware.js";
// Assuming you have an auth middleware, e.g., protect, to secure routes
// const { protect, authorizeProvider, authorizeCustomerOrProvider } = require('../middleware/auth.middleware'); 
// For simplicity in this setup, I'll just use a placeholder 'protect' if I uncomment its usage.
// You should implement proper authentication and authorization.

// Example: const { protect } = require('../middleware/auth.middleware'); 

// Create a new booking (typically by a customer)
router.post('/', authMiddleware, bookingController.createBooking);

// Get all bookings for the logged-in customer
router.get('/my-bookings', authMiddleware, bookingController.getCustomerBookings);

// Get all bookings for the logged-in provider
router.get('/provider-bookings', authMiddleware, bookingController.getProviderBookings); // Provider needs to be identified via req.user

// Get a single booking by ID (accessible by customer/provider involved, or admin)
router.get('/:id', authMiddleware, bookingController.getBookingById);

// Update booking status (e.g., provider confirms/completes, customer cancels)
// Specific roles might be required for specific status changes.
router.patch('/:id/status', authMiddleware, bookingController.updateBookingStatus);

// Update booking payment status
router.patch('/:id/payment', authMiddleware, bookingController.updateBookingPayment);

// General update for a booking (e.g., notes, agreed upon time changes by admin/involved parties)
// Be cautious with what fields are updatable and by whom.
router.put('/:id', authMiddleware, bookingController.updateBooking);

// Delete a booking (typically admin, or customer/provider under specific conditions like 'pending')
router.delete('/:id', authMiddleware, bookingController.deleteBooking); 


// --- More specific/advanced routes you might consider later ---

// // Customer requests to cancel a booking
// router.post('/:id/request-cancellation', /* protect, authorizeCustomer, */ bookingController.requestCustomerCancellation);

// // Provider confirms a booking
// router.post('/:id/confirm', /* protect, authorizeProvider, */ bookingController.confirmBooking);

// // Provider marks a booking as completed
// router.post('/:id/complete', /* protect, authorizeProvider, */ bookingController.completeBooking);

// // Search or filter bookings (e.g., by date range, status, admin view)
// router.get('/search', /* protect, authorizeAdmin, */ bookingController.searchBookings);

export default router; 
