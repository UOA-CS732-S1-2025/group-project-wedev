import request from "supertest";
import mongoose from "mongoose";
import app from "../server.js";

import User from "../models/user.model.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";

let user1, user2, conversationId;

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
  await Conversation.deleteMany({});
  await Message.deleteMany({});

  user1 = await User.create({
    username: "Alice",
    email: "alice@example.com",
    password: "123456",
    role: "customer",
    location: { type: "Point", coordinates: [174.7633, -36.8485] }
  });

  user2 = await User.create({
    username: "Bob",
    email: "bob@example.com",
    password: "123456",
    role: "provider",
    location: { type: "Point", coordinates: [174.7633, -36.8485] }
  });
});

describe("POST /api/conversations/find-or-create", () => {
  it("should create a new conversation between two users", async () => {
    const res = await request(app)
      .post("/api/conversations/find-or-create")
      .send({ userId1: user1._id, userId2: user2._id });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.isNew).toBe(true);
    conversationId = res.body.conversationId;
  });

  it("should find existing conversation instead of creating duplicate", async () => {
    await request(app)
      .post("/api/conversations/find-or-create")
      .send({ userId1: user1._id, userId2: user2._id });

    const res = await request(app)
      .post("/api/conversations/find-or-create")
      .send({ userId1: user1._id, userId2: user2._id });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.isNew).toBe(false);
  });

  it("should not allow creating conversation with self", async () => {
    const res = await request(app)
      .post("/api/conversations/find-or-create")
      .send({ userId1: user1._id, userId2: user1._id });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/cannot create.*oneself/i);
  });
});

describe("GET /api/conversations?userId=...", () => {
  it("should return user's conversations", async () => {
    await request(app)
      .post("/api/conversations/find-or-create")
      .send({ userId1: user1._id, userId2: user2._id });

    const res = await request(app).get(`/api/conversations?userId=${user1._id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].otherUser.username).toBe("Bob");
  });

  it("should return 400 if userId is missing", async () => {
    const res = await request(app).get("/api/conversations");
    expect(res.statusCode).toBe(400);
  });
});

describe("GET /api/conversations/:id/messages", () => {
  it("should return messages for a conversation", async () => {
    const convoRes = await request(app)
      .post("/api/conversations/find-or-create")
      .send({ userId1: user1._id, userId2: user2._id });

    const convId = convoRes.body.conversationId;

    await Message.create({
      conversation: convId,
      sender: user1._id,
      receiver: user2._id,
      content: "Hello Bob",
      messageType: "text"
    });

    const res = await request(app).get(`/api/conversations/${convId}/messages`);
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].content).toBe("Hello Bob");
  });
});

describe("PUT /api/conversations/:id/read", () => {
  it("should mark messages as read", async () => {
    const convo = await Conversation.create({ participants: [user1._id, user2._id] });

    await Message.create({
      conversation: convo._id,
      sender: user2._id,
      receiver: user1._id,
      content: "Unread message",
      messageType: "text"
    });

    const res = await request(app)
      .put(`/api/conversations/${convo._id}/read`)
      .send({ userId: user1._id });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/message marked as read/i);
  });

  it("should return 400 if userId is missing", async () => {
    const convo = await Conversation.create({ participants: [user1._id, user2._id] });

    const res = await request(app)
      .put(`/api/conversations/${convo._id}/read`)
      .send({}); // no userId

    expect(res.statusCode).toBe(400);
  });
});
