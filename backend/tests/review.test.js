import request from "supertest";
import mongoose from "mongoose";
import app from "../server.js";
import User from "../models/user.model.js";
import Booking from "../models/booking.model.js";
import Review from "../models/review.model.js";

let customer, provider, booking;

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
  await Review.deleteMany({});

  customer = await User.create({
    username: "customer1",
    email: "customer@example.com",
    password: "Password123",
    role: "customer",
    location: { type: "Point", coordinates: [174.76, -36.84] }
  });

  provider = await User.create({
    username: "provider1",
    email: "provider@example.com",
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
});

describe("POST /api/reviews", () => {
  it("should create a review successfully", async () => {
    const res = await request(app).post("/api/reviews").send({
      bookingId: booking._id,
      providerId: provider._id,
      customerId: customer._id,
      rating: 4,
      comment: "Good service",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.rating).toBe(4);
  });

  it("should fail if review already exists", async () => {
    await Review.create({
      bookingId: booking._id,
      providerId: provider._id,
      customerId: customer._id,
      rating: 5,
      comment: "First review"
    });

    const res = await request(app).post("/api/reviews").send({
      bookingId: booking._id,
      providerId: provider._id,
      customerId: customer._id,
      rating: 4,
      comment: "Duplicate review"
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/already reviewed/i);
  });

  it("should return 400 if required fields are missing", async () => {
    const res = await request(app).post("/api/reviews").send({
      providerId: provider._id,
      customerId: customer._id,
      rating: 5
    });

    expect(res.statusCode).toBe(400);
  });

  it("should return 404 if booking not found", async () => {
    const fakeBookingId = new mongoose.Types.ObjectId();
    const res = await request(app).post("/api/reviews").send({
      bookingId: fakeBookingId,
      providerId: provider._id,
      customerId: customer._id,
      rating: 5
    });

    expect(res.statusCode).toBe(404);
  });
});

describe("GET /api/reviews/booking/:bookingId", () => {
  it("should return review(s) for a booking", async () => {
    await Review.create({
      bookingId: booking._id,
      providerId: provider._id,
      customerId: customer._id,
      rating: 4,
      comment: "Nice work"
    });

    const res = await request(app).get(`/api/reviews/booking/${booking._id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].comment).toBe("Nice work");
  });
});

describe("GET /api/reviews/provider/:providerId", () => {
  it("should return all reviews for a provider and calculate average rating", async () => {
    await Review.create([
      {
        bookingId: booking._id,
        providerId: provider._id,
        customerId: customer._id,
        rating: 5,
        comment: "Great job!"
      },
      {
        bookingId: new mongoose.Types.ObjectId(), // simulate another booking
        providerId: provider._id,
        customerId: customer._id,
        rating: 3,
        comment: "Okay"
      }
    ]);

    const res = await request(app).get(`/api/reviews/provider/${provider._id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.reviews.length).toBe(2);
    expect(res.body.data.averageRating).toBe(4); // (5 + 3) / 2
  });
});
