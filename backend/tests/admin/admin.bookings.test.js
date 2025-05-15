import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import app from "../../server.js";
import User from "../../models/user.model.js";
import Booking from "../../models/booking.model.js";

let adminToken, booking, customer, provider;

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
    endTime: new Date(Date.now() + 60 * 60 * 1000),
    hourlyRate: 50,
    notes: "Initial note"
  });

  adminToken = jwt.sign({ id: admin._id, role: "admin" }, process.env.JWT_SECRET);
});

describe("GET /api/admin/bookings", () => {
  it("should return all bookings", async () => {
    const res = await request(app)
      .get("/api/admin/bookings")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
});

describe("GET /api/admin/bookings/:id", () => {
  it("should return specific booking", async () => {
    const res = await request(app)
      .get(`/api/admin/bookings/${booking._id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.serviceType).toBe("Cleaning");
  });

  it("should return 404 if booking not found", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .get(`/api/admin/bookings/${fakeId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(404);
  });
});

describe("PUT /api/admin/bookings/:id", () => {
  it("should update booking notes", async () => {
    const res = await request(app)
      .put(`/api/admin/bookings/${booking._id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ notes: "Updated by admin" });

    expect(res.statusCode).toBe(200);
    expect(res.body.notes).toBe("Updated by admin");
  });

  it("should return 404 for nonexistent booking", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put(`/api/admin/bookings/${fakeId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ notes: "This will fail" });

    expect(res.statusCode).toBe(404);
  });
});

describe("DELETE /api/admin/bookings/:id", () => {
  it("should delete booking successfully", async () => {
    const res = await request(app)
      .delete(`/api/admin/bookings/${booking._id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/deleted successfully/i);
  });

  it("should return 404 if booking not found", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .delete(`/api/admin/bookings/${fakeId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(404);
  });
});
