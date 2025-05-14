import request from "supertest";
import mongoose from "mongoose";
import app from "../server.js";
import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";
import User from "../models/user.model.js";

let senderId, recipientId, messageId;

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect("mongodb+srv://wedev:d4bw4kWtwckH4Ck2@wedev732.9ja99.mongodb.net/testdb?retryWrites=true&w=majority&appName=wedev732");
  }
});

afterAll(async () => {
    await Message.deleteMany({});
    await Conversation.deleteMany({});
    await User.deleteMany({});
    await mongoose.disconnect();
  });

beforeEach(async () => {
  await Message.deleteMany({});
  await Conversation.deleteMany({});
  await User.deleteMany({});

  const sender = await User.create({ username: "Alice", email: "alice@example.com", password: "123456", role: "customer",  location: {
    type: "Point",
    coordinates: [174.7633, -36.8485] // Auckland 示例坐标
  } });
  const recipient = await User.create({ username: "Bob", email: "bob@example.com", password: "123456", role: "provider",  location: {
    type: "Point",
    coordinates: [174.7633, -36.8485] // Auckland 示例坐标
  } });

  senderId = sender._id;
  recipientId = recipient._id;
});

describe("POST /api/messages", () => {
  it("should send a normal message", async () => {
    const res = await request(app).post("/api/messages").send({
      senderId,
      recipientId,
      content: "Hello Bob"
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.content).toBe("Hello Bob");
    expect(res.body.data.messageType).toBe("text");
    messageId = res.body.data._id;
  });

  it("should send a booking message", async () => {
    const res = await request(app).post("/api/messages").send({
      senderId,
      recipientId,
      content: "Booking: Haircut next week",
      messageType: "booking",
      bookingStatus: "pending",
      senderDisplayText: "Booking sent.",
      receiverDisplayText: "You have a new booking request."
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.messageType).toBe("booking");
    expect(res.body.data.bookingStatus).toBe("pending");
  });

  it("should fail if booking fields are missing", async () => {
    const res = await request(app).post("/api/messages").send({
      senderId,
      recipientId,
      content: "Invalid booking",
      messageType: "booking"
    });

    expect(res.statusCode).toBe(400);
  });
});

describe("GET /api/messages/unread-count", () => {
  it("should return unread message count", async () => {
    // Send 2 unread messages
    await Message.create({
      sender: senderId,
      receiver: recipientId,
      content: "Unread 1",
      conversation: (await Conversation.create({ participants: [senderId, recipientId] }))._id,
      messageType: "text"
    });
    await Message.create({
      sender: senderId,
      receiver: recipientId,
      content: "Unread 2",
      conversation: (await Conversation.create({ participants: [senderId, recipientId] }))._id,
      messageType: "text"
    });

    const res = await request(app).get(`/api/messages/unread-count?userId=${recipientId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.unreadCount).toBe(2);
  });
});

describe("PATCH /api/messages/:id/booking-status", () => {
  it("should update booking status", async () => {
    const msg = await Message.create({
      sender: senderId,
      receiver: recipientId,
      content: "Booking test",
      conversation: (await Conversation.create({ participants: [senderId, recipientId] }))._id,
      messageType: "booking",
      bookingStatus: "pending",
      senderDisplayText: "Pending...",
      receiverDisplayText: "Waiting..."
    });

    const res = await request(app)
      .patch(`/api/messages/${msg._id}/booking-status`)
      .send({ status: "accepted" });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.bookingStatus).toBe("accepted");
    expect(res.body.data.senderDisplayText).toMatch(/accepted/i);
  });

  it("should fail for invalid status", async () => {
    const msg = await Message.create({
      sender: senderId,
      receiver: recipientId,
      content: "Booking test",
      conversation: (await Conversation.create({ participants: [senderId, recipientId] }))._id,
      messageType: "booking",
      bookingStatus: "pending",
      senderDisplayText: "Pending...",
      receiverDisplayText: "Waiting..."
    });

    const res = await request(app)
      .patch(`/api/messages/${msg._id}/booking-status`)
      .send({ status: "unknown" });

    expect(res.statusCode).toBe(400);
  });
});
