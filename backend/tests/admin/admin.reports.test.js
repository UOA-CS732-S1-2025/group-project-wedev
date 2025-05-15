import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import app from "../../server.js";
import User from "../../models/user.model.js";
import Report from "../../models/report.model.js";

let adminToken, reporter, report;

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

  const admin = await User.create({
    username: "adminUser",
    email: "admin@example.com",
    password: "Password123",
    role: "admin",
    location: { type: "Point", coordinates: [174.76, -36.84] }
  });

  reporter = await User.create({
    username: "reporter",
    email: "reporter@example.com",
    password: "Password123",
    role: "customer",
    location: { type: "Point", coordinates: [174.76, -36.84] }
  });

  adminToken = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET);

  report = await Report.create({
    user: reporter._id,
    reporter: reporter._id,
    subject: "Inappropriate behavior",
    description: "User was offensive",
    category: "user"
  });
});

describe("GET /api/admin/reports", () => {
  it("should return all reports", async () => {
    const res = await request(app)
      .get("/api/admin/reports")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });
});

describe("GET /api/admin/reports/:id", () => {
  it("should return a single report by ID", async () => {
    const res = await request(app)
      .get(`/api/admin/reports/${report._id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.subject).toBe("Inappropriate behavior");
  });

  it("should return 404 if report not found", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .get(`/api/admin/reports/${fakeId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(404);
  });
});

describe("PUT /api/admin/reports/:id", () => {
  it("should update report status and add adminNotes", async () => {
    const res = await request(app)
      .put(`/api/admin/reports/${report._id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "reviewed", adminNotes: "Checked and under review" });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("reviewed");
    expect(res.body.adminNotes).toBe("Checked and under review");
  });

  it("should auto-set resolvedAt when status is resolved", async () => {
    const res = await request(app)
      .put(`/api/admin/reports/${report._id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "resolved" });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("resolved");
    expect(res.body.resolvedAt).toBeDefined();
  });

  it("should return 404 for non-existent report", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put(`/api/admin/reports/${fakeId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "reviewed" });

    expect(res.statusCode).toBe(404);
  });
});

describe("DELETE /api/admin/reports/:id", () => {
  it("should delete a report successfully", async () => {
    const res = await request(app)
      .delete(`/api/admin/reports/${report._id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/deleted successfully/i);
  });

  it("should return 404 if report does not exist", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .delete(`/api/admin/reports/${fakeId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(404);
  });
});
