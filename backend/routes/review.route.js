import express from "express";
import { AddReview, GetReview } from "../controllers/review.controller.js";

const router = express.Router();

router.post("/", AddReview);
router.get("/providers/:providerId/reviews", GetReview);

export default router;
