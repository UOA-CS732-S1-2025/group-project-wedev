
import express from "express";
import {
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
} from "../../controllers/admin/booking.admin.controller.js";

const router = express.Router();
//GET /api/admin/bookings/
router.get("/", getAllBookings);
//GET /api/admin/bookings/booking_id
router.get("/:id", getBookingById);
//PUT /api/admin/bookings/booking_id
// {
//     "notes": "XXXX"
// }
router.put("/:id", updateBooking);
//DELETE  /api/admin/bookings/booking_id
router.delete("/:id", deleteBooking);

export default router;
