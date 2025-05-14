import request from "supertest";
import mongoose from "mongoose";
import app from "../server.js";
import User from "../models/user.model.js";
import Report from "../models/report.model.js";

let testUser;

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
  await Report.deleteMany({});

  testUser = await User.create({
    username: "testuser",
    email: "test@example.com",
    password: "Password123",
    role: "customer",
    location: { type: "Point", coordinates: [174.76, -36.84] }
  });
});

describe("POST /api/reports", () => {
  it("should successfully create a report with full fields", async () => {
    const res = await request(app).post("/api/reports").send({
      userId: testUser._id,
      subject: "Late provider",
      description: "The provider arrived 2 hours late.",
      category: "service"
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.report).toBeDefined();
    expect(res.body.report.subject).toBe("Late provider");
    expect(res.body.report.category).toBe("service");
    expect(res.body.report.status).toBe("pending");
  });

  it("should use default category when not provided", async () => {
    const res = await request(app).post("/api/reports").send({
      userId: testUser._id,
      subject: "Issue with system",
      description: "Booking system failed"
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.report.category).toBe("other");
  });

  it("should return 400 if required fields are missing", async () => {
    const res = await request(app).post("/api/reports").send({
      userId: testUser._id,
      description: "No subject provided"
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/missing required fields/i);
  });
});
