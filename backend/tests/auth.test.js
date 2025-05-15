import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import app from "../server.js";
import User from "../models/user.model.js";

let token, userId, verifyToken;

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
});

describe("POST /api/auth/register", () => {
  it("should register a user successfully", async () => {
    const res = await request(app).post("/api/auth/register").send({
      firstName: "Test1",
      lastName: "User1",
      email: "test1@example.com",
      password: "Password123",
      role: "customer"
    });

    console.log("📦 REGISTER ERROR RESPONSE:", res.statusCode, res.body); //Andy say: if it fail, check the env file for the email password

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe("test1@example.com");

    userId = res.body.user._id;
    token = res.body.token;

    // Save emailVerifyToken for next test
    const user = await User.findOne({ email: "test1@example.com" });
    verifyToken = user.emailVerifyToken;
  });

  it("should fail if password is too short", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "short@example.com",
      password: "123", 
      role: "customer"
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/longer than 8/i);
  });

  it("should fail if password lacks uppercase", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "noupper@example.com",
      password: "longpassword123", 
      role: "customer"
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/uppercase/i);
  });

  it("should fail if password lacks uppercase", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "nolowper@example.com",
      password: "ASDFGHJKLMNB123", 
      role: "customer"
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/lowercase/i);
  });

  it("should fail if password lacks uppercase", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "nonumber@example.com",
      password: "ASDFGHJKLMNBasdasdqwe", 
      role: "customer"
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/number/i);
  });


  it("should fail if role is not 'customer'", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "admin@example.com",
      password: "Password123",
      role: "admin"
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/only customer/i);
  });

  it("should fail if email already exists", async () => {
    await User.create({
      email: "exists@example.com",
      password: "Password123",
      role: "customer",
      username: "exists",
      emailVerified: false,
      location: { type: "Point", coordinates: [0, 0] }
    });

    const res = await request(app).post("/api/auth/register").send({
      email: "exists@example.com",
      password: "Password123",
      role: "customer"
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/email.*in use/i);
  });
});

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    const user = await User.create({
      email: "login@example.com",
      password: await bcryptHash("Password123"),
      role: "customer",
      username: "loginuser",
      emailVerified: true,
      location: { type: "Point", coordinates: [0, 0] }
    });
  });

  it("should login with correct credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "login@example.com",
      password: "Password123"
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  it("should fail with wrong password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "login@example.com",
      password: "WrongPassword"
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/wrong password/i);
  });

  it("should fail with non-existent email", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "nope@example.com",
      password: "Password123"
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/not found/i);
  });
});

describe("GET /api/auth/me", () => {
  it("should return current user profile", async () => {
    const user = await User.create({
      email: "me@example.com",
      password: "Password123",
      role: "customer",
      username: "meuser",
      location: { type: "Point", coordinates: [0, 0] }
    });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);

    const res = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.user.email).toBe("me@example.com");
  });

  it("should fail without token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.statusCode).toBe(401);
  });
});

describe("GET /api/auth/verify-email", () => {
  it("should verify email with correct token", async () => {
    const user = await User.create({
      email: "verify@example.com",
      password: "Password123",
      role: "customer",
      username: "verifyuser",
      emailVerifyToken: "validtoken",
      emailVerified: false,
      location: { type: "Point", coordinates: [0, 0] }
    });

    const res = await request(app).get("/api/auth/verify-email?token=validtoken");
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/verified/i);
  });

  it("should fail if token is missing", async () => {
    const res = await request(app).get("/api/auth/verify-email");
    expect(res.statusCode).toBe(400);
  });

  it("should fail with invalid token", async () => {
    const res = await request(app).get("/api/auth/verify-email?token=invalid");
    expect(res.statusCode).toBe(400);
  });
});


// Helper function to hash password
import bcrypt from "bcryptjs";
const bcryptHash = async (plain) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
};
