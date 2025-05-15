import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import userRoutes from "./routes/user.route.js";
import messageRoutes from "./routes/message.route.js";
import conversationRoutes from "./routes/conversation.route.js";
import reportRoutes from "./routes/report.route.js";
import adminUserRoutes from "./routes/admin/user.admin.route.js";
import adminBookingRoutes from "./routes/admin/booking.admin.route.js";
import adminPaymentRoutes from "./routes/admin/payment.admin.route.js";
import adminReportRoutes from "./routes/admin/report.admin.route.js";
import authRoutes from "./routes/auth.route.js";
import paymentRoutes from "./routes/payment.route.js";
import bookingRoutes from "./routes/booking.route.js";
import reviewRoutes from "./routes/review.route.js";
import cors from "cors";

dotenv.config();

const user = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASS;
const from = process.env.EMAIL_FROM;

console.log("🔍 Nodemailer config:");
console.log("EMAIL_USER:", user);
console.log("EMAIL_PASS:", pass ? "✅ Present" : "❌ Missing");
console.log("EMAIL_FROM:", from);
const app = express();

const PORT = process.env.PORT || 3000;

console.log(process.env.MONGO_URI);

app.use(express.json());
app.use(cors({
  origin: ["https://wedev-liard.vercel.app","http://localhost:5173","https://wedevv.vercel.app"], // 允许前端访问的源
  credentials: true // 如果使用 cookies 或认证头
}));

app.use("/api/users", userRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/admin/bookings", adminBookingRoutes);
app.use("/api/admin/payments", adminPaymentRoutes);
app.use("/api/admin/reports", adminReportRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/payments", paymentRoutes);


//Only used to test whether the backend is actually started, delete before deployment
app.get("/", (req, res) => {
  res.send("BACKEND is running"); 
});


//Development environment
app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on http://localhost:${PORT}`);
});


// export default app; // Test environment


