import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import app from "../../server.js";
import User from "../../models/user.model.js";
import Payment from "../../models/payment.model.js";
import Booking from "../../models/booking.model.js";

let adminToken, customer, provider, booking;

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

  const admin = await User.create({
    username: "admin1",
    email: "admin@example.com",
    password: "Password123",
    role: "admin",
    location: { type: "Point", coordinates: [174.76, -36.84] }
  });

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

  await Payment.create({
    customer: customer._id,
    provider: provider._id,
    booking: booking._id,
    amount: 150,
    method: "credit_card",
    status: "paid",
    paidAt: new Date()
  });

  adminToken = jwt.sign({ id: admin._id, role: "admin" }, process.env.JWT_SECRET);
});

describe("GET /api/admin/payments", () => {
  it("should return all payments with populated fields", async () => {
    const res = await request(app)
      .get("/api/admin/payments")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0].amount).toBe(150);
    expect(res.body[0].customer.email).toBe("customer1@example.com");
    expect(res.body[0].provider.username).toBe("provider1");
    expect(res.body[0].booking.serviceType).toBe("Cleaning");
  });

  it("should return empty array if no payments exist", async () => {
    await Payment.deleteMany({});
    const res = await request(app)
      .get("/api/admin/payments")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });
});
