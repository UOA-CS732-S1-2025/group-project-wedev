import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Conversation",
    required: true,
  },
  sender: { // 消息的发送者
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: { // 对于 "text" 类型的消息，这是主要内容。
             // 对于 "booking" 类型的消息，这可以用来存储预订的原始请求信息或核心描述，
             // 例如 "预订：周二下午3点理发服务"。这部分信息通常不随状态改变。
    type: String,
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  messageType: { // 消息类型，"text" 或 "booking"
    type: String,
    enum: ["text", "booking"],
    required: true,
    default: "text",
  },

  // --- 专门用于 "booking" 类型消息的属性 ---
  bookingStatus: { // 预订订单的状态
    type: String,
    enum: ["pending", "accepted", "rejected"], // 等待中，已接受，已拒绝
    // 仅当 messageType 为 "booking" 时，此字段才相关。
    // 在创建 booking 消息时，应由应用逻辑设置（例如默认为 "pending"）。
    required: function() { return this.messageType === 'booking'; },
  },
  senderDisplayText: { // 显示给预订发起方（sender）的文本
    type: String,
    // 仅当 messageType 为 "booking" 时，此字段才相关。
    // 其内容会根据 bookingStatus 由应用逻辑更新。
    required: function() { return this.messageType === 'booking'; },
  },
  receiverDisplayText: { // 显示给预订接收方的文本
    type: String,
    // 仅当 messageType 为 "booking" 时，此字段才相关。
    // 其内容会根据 bookingStatus 由应用逻辑更新。
    required: function() { return this.messageType === 'booking'; },
  }
}, { timestamps: true }); // timestamps 会自动添加 createdAt 和 updatedAt 字段

const Message = mongoose.model("Message", messageSchema);
export default Message;