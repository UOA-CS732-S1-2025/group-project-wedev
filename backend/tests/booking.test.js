import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import app from "../server.js";
import User from "../models/user.model.js";
import Booking from "../models/booking.model.js";

let customer, provider, customerToken, providerToken, bookingId;

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

  customer = await User.create({
    username: "Customer1",
    email: "customer1@example.com",
    password: "123456",
    role: "customer",
    location: { type: "Point", coordinates: [174.76, -36.84] }
  });

  provider = await User.create({
    username: "Provider1",
    email: "provider1@example.com",
    password: "123456",
    role: "provider",
    location: { type: "Point", coordinates: [174.76, -36.84] }
  });

  customerToken = jwt.sign({ id: customer._id, role: customer.role }, process.env.JWT_SECRET);
  providerToken = jwt.sign({ id: provider._id, role: provider.role }, process.env.JWT_SECRET);
});

describe("POST /api/bookings", () => {
  it("should create a booking successfully", async () => {
    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        providerId: provider._id,
        serviceType: "Cleaning",
        serviceAddress: { street: "1 Main St", city: "Auckland" },
        startTime: new Date(),
        endTime: new Date(Date.now() + 60 * 60 * 1000),
        hourlyRate: 50
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    bookingId = res.body.booking._id;
  });

  it("should fail with missing fields", async () => {
    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe("GET /api/bookings/my-bookings", () => {
  it("should return customer bookings", async () => {
    await Booking.create({
      customer: customer._id,
      provider: provider._id,
      serviceType: "Gardening",
      serviceAddress: { street: "10 Park Ave", city: "Auckland" },
      startTime: new Date(),
      endTime: new Date(Date.now() + 60 * 60 * 1000),
      hourlyRate: 40
    });

    const res = await request(app)
      .get("/api/bookings/my-bookings")
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.bookings.length).toBeGreaterThanOrEqual(1);
  });

  it("should return 401 if no token", async () => {
    const res = await request(app).get("/api/bookings/my-bookings");
    expect(res.statusCode).toBe(401);
  });
});

describe("PATCH /api/bookings/:id/status", () => {
  it("should update booking status", async () => {
    const booking = await Booking.create({
      customer: customer._id,
      provider: provider._id,
      serviceType: "Cleaning",
      serviceAddress: { street: "1 Main St", city: "Auckland" },
      startTime: new Date(),
      endTime: new Date(Date.now() + 60 * 60 * 1000),
      hourlyRate: 50
    });

    const res = await request(app)
      .patch(`/api/bookings/${booking._id}/status`)
      .set("Authorization", `Bearer ${providerToken}`)
      .send({ status: "confirmed" });

    expect(res.statusCode).toBe(200);
    expect(res.body.booking.status).toBe("confirmed");
  });

  it("should return 404 for invalid ID", async () => {
    const res = await request(app)
      .patch("/api/bookings/64b000000000000000000000/status")
      .set("Authorization", `Bearer ${providerToken}`)
      .send({ status: "confirmed" });

    expect(res.statusCode).toBe(404);
  });
});

describe("DELETE /api/bookings/:id", () => {
  it("should delete booking if customer and status is pending", async () => {
    const booking = await Booking.create({
      customer: customer._id,
      provider: provider._id,
      serviceType: "Cleaning",
      serviceAddress: { street: "1 Main St", city: "Auckland" },
      startTime: new Date(),
      endTime: new Date(Date.now() + 60 * 60 * 1000),
      hourlyRate: 50,
      status: "pending_confirmation"
    });

    const res = await request(app)
      .delete(`/api/bookings/${booking._id}`)
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("should return 403 if booking not deletable", async () => {
    const booking = await Booking.create({
      customer: customer._id,
      provider: provider._id,
      serviceType: "Cleaning",
      serviceAddress: { street: "1 Main St", city: "Auckland" },
      startTime: new Date(),
      endTime: new Date(Date.now() + 60 * 60 * 1000),
      hourlyRate: 50,
      status: "confirmed"
    });

    const res = await request(app)
      .delete(`/api/bookings/${booking._id}`)
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.statusCode).toBe(403);
  });
});
