import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Conversation",
    required: true,
  },
  sender: { // Message sender
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: { // For "text" type messages, this is the main content.
             // For "booking" type messages, this stores the original booking request information,
             // e.g., "Booking: Haircut service on Tuesday at 3pm". This content doesn't change with status.
    type: String,
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  messageType: { // Message type, "text" or "booking"
    type: String,
    enum: ["text", "booking"],
    required: true,
    default: "text",
  },

  // --- Properties specific to "booking" type messages ---
  bookingStatus: { // Booking order status
    type: String,
    enum: ["pending", "accepted", "rejected"], // pending, accepted, rejected
    // Only relevant when messageType is "booking".
    // Should be set by application logic when creating a booking message (defaults to "pending").
    required: function() { return this.messageType === 'booking'; },
  },
  senderDisplayText: { // Text shown to the booking initiator (sender)
    type: String,
    // Only relevant when messageType is "booking".
    // Content is updated by application logic based on bookingStatus.
    required: function() { return this.messageType === 'booking'; },
  },
  receiverDisplayText: { // Text shown to the booking recipient
    type: String,
    // Only relevant when messageType is "booking".
    // Content is updated by application logic based on bookingStatus.
    required: function() { return this.messageType === 'booking'; },
  }
}, { timestamps: true }); // timestamps automatically adds createdAt and updatedAt fields

const Message = mongoose.model("Message", messageSchema);
export default Message;