import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";



export const sendMessage = async (req, res) => {
    try {
      const { recipientId, content, messageType = "text", bookingStatus, senderDisplayText, receiverDisplayText } = req.body;
  
      const senderId = req.body.senderId ; 
  
      if (!recipientId || !content) {
        return res.status(400).json({ message: "Missing recipientId or/and content" });
      }

      // booking 类型校验
      if (messageType === 'booking') {
        if (!bookingStatus || !senderDisplayText || !receiverDisplayText) {
          return res.status(400).json({ message: "Missing booking fields for booking message" });
        }
      }
  
      // Check conversation
      let conversation = await Conversation.findOne({
        participants: { $all: [senderId, recipientId], $size: 2 },
      });
  
      // Create conversation
      if (!conversation) {
        conversation = await Conversation.create({
          participants: [senderId, recipientId],
          lastMessageTimestamp: new Date(),
        });
      }
  
      // Create message
      const messageData = {
        conversation: conversation._id,
        sender: senderId,
        content,
        messageType,
      };
      if (messageType === 'booking') {
        messageData.bookingStatus = bookingStatus;
        messageData.senderDisplayText = senderDisplayText;
        messageData.receiverDisplayText = receiverDisplayText;
      }
      const message = await Message.create(messageData);
  
      // Update timestamp
      conversation.lastMessageTimestamp = message.createdAt;
      await conversation.save();
  
      const populatedMessage = await message.populate("sender", "username profilePictureUrl");
  
      res.status(201).json({
        message: "Message sent successfully",
        data: populatedMessage,
        conversationId: conversation._id,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Server Error" });
    }
  };


  export const getUnreadMessageCount = async (req, res) => {
    try {
      const userId = req.query.userId;
  
      if (!userId) {
        return res.status(400).json({ message: "Missing userId" });
      }
  
      // Find all unread messages from other people
      const unreadCount = await Message.countDocuments({
        isRead: false,
        sender: { $ne: userId }, 
      });
  
      res.status(200).json({ unreadCount });
    } catch (error) {
      console.error("Failed to count unread messages:", error);
      res.status(500).json({ message: "Server Error" });
    }
  };