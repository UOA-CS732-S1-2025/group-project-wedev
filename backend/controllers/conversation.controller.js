import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

export const getUserConversations = async (req, res) => {
  try {
    const userId = req.query.userId;

    if (!userId) {
      return res.status(400).json({ message: "Miss userId" });
    }

    // Find all conversations the current user is a member of
    const conversations = await Conversation.find({ participants: userId })
      .sort({ lastMessageTimestamp: -1 }) // Most recent conversations first
      .lean();

    const enriched = await Promise.all(
      conversations.map(async (conversation) => {
        // find other party's user info
        const otherUserId = conversation.participants.find(
          (id) => id.toString() !== userId
        );

        const otherUser = await User.findById(otherUserId).select("username profilePictureUrl");

        // count under read messages
        const unreadCount = await Message.countDocuments({
          conversation: conversation._id,
          sender: { $ne: userId },
          isRead: false,
        });

        return {
          _id: conversation._id,
          lastMessageTimestamp: conversation.lastMessageTimestamp,
          otherUser,
          unreadCount,
        };
      })
    );

    res.status(200).json(enriched);
  } catch (error) {
    console.error("Error getting conversation:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


export const getMessagesByConversationId = async (req, res) => {
    try {
      const conversationId = req.params.id;
  
      const messages = await Message.find({ conversation: conversationId })
        .sort({ createdAt: 1 }) // The oldest conversations are prioritized
        .populate("sender", "username profilePictureUrl")
        .lean();
  
      res.status(200).json(messages);
    } catch (error) {
      console.error("Error getting conversation:", error);
      res.status(500).json({ message: "Server Error" });
    }
  };



  export const markConversationAsRead = async (req, res) => {
    try {
      const conversationId = req.params.id;
      const userId = req.body.userId;
  
      if (!userId) {
        return res.status(400).json({ message: "Missing userId" });
      }
  
      // Mark only messages sent to me as read
      const result = await Message.updateMany(
        {
          conversation: conversationId,
          sender: { $ne: userId },
          isRead: false,
        },
        { $set: { isRead: true } }
      );
  
      res.status(200).json({
        message: `Success will ${result.modifiedCount} message marked as read`,
      });
    } catch (error) {
      console.error("Mark as read failed:", error);
      res.status(500).json({ message: "Server Error" });
    }
  };
  