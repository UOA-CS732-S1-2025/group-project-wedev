import express from "express";
import { getAllPayments } from "../../controllers/admin/payment.admin.controller.js";

const router = express.Router();

//GET /api/admin/payments/
router.get("/", getAllPayments);

export default router;
//Add identity authentication and administrator authority verification