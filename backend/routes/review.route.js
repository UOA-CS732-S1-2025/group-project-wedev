import express from "express";
import { createReview, getReviews, getProviderReviews } from "../controllers/review.controller.js";

const router = express.Router();

router.post("/", createReview);
router.get("/provider/:providerId", getProviderReviews);
router.get("/booking/:bookingId", getReviews);

export default router;