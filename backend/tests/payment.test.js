import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import app from "../server.js";
import User from "../models/user.model.js";
import Booking from "../models/booking.model.js";
import Payment from "../models/payment.model.js";

let customer, provider, booking, token;

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect("mongodb+srv://wedev:d4bw4kWtwckH4Ck2@wedev732.9ja99.mongodb.net/testdb?retryWrites=true&w=majority&appName=wedev732");
  }
});
afterAll(async () => {
  await mongoose.disconnect();
});

beforeEach(async () => {
  await User.deleteMany({});
  await Booking.deleteMany({});
  await Payment.deleteMany({});

  customer = await User.create({
    username: "customer1",
    email: "customer1@example.com",
    password: "Password123",
    role: "customer",
    location: { type: "Point", coordinates: [174.76, -36.84] }
  });

  provider = await User.create({
    username: "provider1",
    email: "provider1@example.com",
    password: "Password123",
    role: "provider",
    location: { type: "Point", coordinates: [174.76, -36.84] }
  });

  booking = await Booking.create({
    customer: customer._id,
    provider: provider._id,
    serviceType: "Cleaning",
    serviceAddress: { street: "123 Main St", city: "Auckland" },
    startTime: new Date(),
    endTime: new Date(Date.now() + 3600000),
    hourlyRate: 50
  });

  token = jwt.sign({ id: customer._id, role: customer.role }, process.env.JWT_SECRET);
});

describe("POST /api/payments", () => {
  it("should create a payment successfully", async () => {
    const res = await request(app)
      .post("/api/payments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        provider: provider._id,
        booking: booking._id,
        amount: 100,
        method: "credit_card"
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.amount).toBe(100);
    expect(res.body.status).toBe("pending");
  });

  it("should fail with missing fields", async () => {
    const res = await request(app)
      .post("/api/payments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        provider: provider._id,
        amount: 100
        // booking is missing
      });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toMatch(/Payment failed/i);
  });
});

describe("PATCH /api/payments/:id", () => {
  it("should update payment status to paid and update booking", async () => {
    const payment = await Payment.create({
      customer: customer._id,
      provider: provider._id,
      booking: booking._id,
      amount: 100,
      method: "paypal"
    });

    const res = await request(app)
      .patch(`/api/payments/${payment._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "paid" });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("paid");

    const updatedBooking = await Booking.findById(booking._id);
    expect(updatedBooking.paymentDetails.paymentStatus).toBe("succeeded");
  });

  it("should return 404 for invalid payment ID", async () => {
    const res = await request(app)
      .patch("/api/payments/64b000000000000000000000")
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "paid" });

    expect(res.statusCode).toBe(404);
  });
});

describe("GET /api/payments/booking/:bookingId", () => {
  it("should return payment by booking ID", async () => {
    const payment = await Payment.create({
      customer: customer._id,
      provider: provider._id,
      booking: booking._id,
      amount: 150,
      method: "visa"
    });

    const res = await request(app)
      .get(`/api/payments/booking/${booking._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.amount).toBe(150);
  });

  it("should return 404 if payment not found", async () => {
    const fakeBookingId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .get(`/api/payments/booking/${fakeBookingId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
  });
});
