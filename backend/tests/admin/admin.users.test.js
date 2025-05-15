import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import app from "../../server.js";
import User from "../../models/user.model.js";

let adminToken, user;

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

  const admin = await User.create({
    username: "admin1",
    email: "admin@example.com",
    password: "Password123",
    role: "admin",
    location: { type: "Point", coordinates: [174.76, -36.84] }
  });

  user = await User.create({
    username: "user1",
    email: "user1@example.com",
    password: "Password123",
    role: "customer",
    location: { type: "Point", coordinates: [174.76, -36.84] }
  });

  adminToken = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET);
});

describe("GET /api/admin/users", () => {
  it("should return all users", async () => {
    const res = await request(app)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });
});

describe("GET /api/admin/users/:id", () => {
  it("should return a specific user", async () => {
    const res = await request(app)
      .get(`/api/admin/users/${user._id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe("user1@example.com");
  });

  it("should return 404 for invalid user ID", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .get(`/api/admin/users/${fakeId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(404);
  });
});

describe("PUT /api/admin/users/:id", () => {
  it("should update user information", async () => {
    const res = await request(app)
      .put(`/api/admin/users/${user._id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ firstName: "Updated", phoneNumber: "12345678" });

    expect(res.statusCode).toBe(200);
    expect(res.body.firstName).toBe("Updated");
  });

  it("should return 404 if user not found", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put(`/api/admin/users/${fakeId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ firstName: "NoUser" });

    expect(res.statusCode).toBe(404);
  });
});

describe("DELETE /api/admin/users/:id", () => {
  it("should delete a user", async () => {
    const res = await request(app)
      .delete(`/api/admin/users/${user._id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
  });

  it("should return 404 if user not found", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .delete(`/api/admin/users/${fakeId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(404);
  });
});
