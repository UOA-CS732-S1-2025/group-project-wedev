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

export const findOrCreateConversation = async (req, res) => {
  try {
    const { userId1, userId2 } = req.body; // userId1 is current user, userId2 is provider

    if (!userId1 || !userId2) {
      return res.status(400).json({ message: "User IDs (userId1, userId2) are required." });
    }

    if (userId1 === userId2) {
        return res.status(400).json({ message: "Cannot create a conversation with oneself." });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [userId1, userId2], $size: 2 },
    }).populate("participants", "username profilePictureUrl firstName lastName _id email role");

    let isNew = false;
    if (!conversation) {
      conversation = new Conversation({
        participants: [userId1, userId2],
        lastMessageTimestamp: new Date(),
      });
      await conversation.save();
      // Repopulate to get the full participant details consistent with an existing conversation
      conversation = await Conversation.findById(conversation._id)
                         .populate("participants", "username profilePictureUrl firstName lastName _id email role");
      isNew = true;
    }

    // Determine the 'otherUser' from the perspective of userId1 (the initiating user)
    const otherUserParticipant = conversation.participants.find(p => p._id.toString() === userId2.toString());

    res.status(200).json({
      success: true,
      conversationId: conversation._id,
      otherUser: { // Structure this to match what UserInbox expects for 'conversation.otherUser'
        _id: otherUserParticipant._id,
        username: otherUserParticipant.username,
        profilePictureUrl: otherUserParticipant.profilePictureUrl,
        firstName: otherUserParticipant.firstName,
        lastName: otherUserParticipant.lastName,
        // Add any other fields UserInbox might directly access from conversation.otherUser
      },
      isNew,
    });

  } catch (error) {
    console.error("Error in findOrCreateConversation:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
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
  