import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import app from "../server.js";
import User from "../models/user.model.js";

let provider, otherProvider, token;

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

  provider = await User.create({
    username: "provider1",
    email: "p1@example.com",
    password: "Password123",
    role: "provider",
    serviceType: "Cleaning",
    hourlyRate: 50,
    location: { type: "Point", coordinates: [174.76, -36.84] },
    address: { state: "Auckland" },
    availability: [
      { dayOfWeek: 1, startTime: "08:00", endTime: "16:00", isAvailable: true }
    ]
  });

  otherProvider = await User.create({
    username: "provider2",
    email: "p2@example.com",
    password: "Password123",
    role: "provider",
    serviceType: "Gardening",
    hourlyRate: 100,
    location: { type: "Point", coordinates: [174.76, -36.84] },
    address: { state: "Wellington" }
  });

  token = jwt.sign({ id: provider._id, role: "provider" }, process.env.JWT_SECRET);
});

describe("GET /api/users/providers", () => {
  it("should return all providers", async () => {
    const res = await request(app).get("/api/users/providers");
    expect(res.statusCode).toBe(200);
    expect(res.body.providers.length).toBe(2);
  });
});

describe("POST /api/users/providers/search", () => {
  it("should return provider based on serviceType and hourlyRate", async () => {
    const res = await request(app).post("/api/users/providers/search").send({
      serviceType: "Cleaning",
      maxHourlyRate: 60,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.providers.length).toBe(1);
    expect(res.body.providers[0].username).toBe("provider1");
  });

  it("should return no match if criteria are too strict", async () => {
    const res = await request(app).post("/api/users/providers/search").send({
      serviceType: "Cleaning",
      maxHourlyRate: 10,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.providers.length).toBe(0);
  });
});

describe("GET /api/users/providers/:id", () => {
  it("should return specific provider info", async () => {
    const res = await request(app).get(`/api/users/providers/${provider._id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.username).toBe("provider1");
  });

  it("should return 404 for non-existent provider", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/users/providers/${fakeId}`);
    expect(res.statusCode).toBe(404);
  });
});

describe("GET /api/users/providers/:id/availability", () => {
  it("should get provider availability with auth", async () => {
    const res = await request(app)
      .get(`/api/users/providers/${provider._id}/availability`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.availability.length).toBeGreaterThan(0);
  });

  it("should return 404 if provider not found", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .get(`/api/users/providers/${fakeId}/availability`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
  });
});

describe("PUT /api/users/providers/:id/availability", () => {
  it("should update own availability", async () => {
    const res = await request(app)
      .put(`/api/users/providers/${provider._id}/availability`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        availability: [{ dayOfWeek: 2, startTime: "10:00", endTime: "18:00", isAvailable: true }]
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.availability[0].dayOfWeek).toBe(2);
  });

  it("should return 403 if trying to update another provider", async () => {
    const res = await request(app)
      .put(`/api/users/providers/${otherProvider._id}/availability`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        availability: [{ dayOfWeek: 3, startTime: "10:00", endTime: "18:00", isAvailable: true }]
      });

    expect(res.statusCode).toBe(403);
  });

  it("should return 400 if no data is provided", async () => {
    const res = await request(app)
      .put(`/api/users/providers/${provider._id}/availability`)
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.statusCode).toBe(400);
  });
});
