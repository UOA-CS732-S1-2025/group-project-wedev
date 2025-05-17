import { create } from 'zustand';

export const useConversationStore = create((set, get) => ({
  conversations: [],
  loading: false,
  error: null,
  activeConversation: null,
  activeMessages: [],
  messageLoading: false,
  
  fetchConversations: async (userId) => {
    if (!userId) return;
    
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/conversations?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }
      
      const data = await response.json();
      set({ conversations: data, loading: false });
    } catch (error) {
      console.error("Error fetching conversations:", error);
      set({ error: error.message, loading: false });
    }
  },
  
  setActiveConversation: (conversationId) => {
    set({ activeConversation: conversationId });
  },
  
  markConversationAsRead: async (conversationId, userId) => {
    if (!conversationId || !userId) return;
    
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/conversations/${conversationId}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
      });
      
      // Update local state to mark messages as read
      set((state) => ({
        conversations: state.conversations.map(conv => {
          if (conv._id === conversationId) {
            return {...conv, unreadCount: 0};
          }
          return conv;
        })
      }));
    } catch (error) {
      console.error("Error marking conversation as read:", error);
    }
  },
  
  fetchMessages: async (conversationId, skipLoading = false) => {
    if (!conversationId) return false;
    
    // Show loading state only when not in polling mode
    if (!skipLoading) {
      set({ messageLoading: true });
    }
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/conversations/${conversationId}/messages`);
      
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Get the current message list and the data currently being displayed
      const currentMessages = get().activeMessages;
      
      // Check if there are new messages
      let hasNewMessages = false;
      
      // If the number of messages is different, there is definitely a change
      if (data.length !== currentMessages.length) {
        hasNewMessages = true;
      } else if (data.length > 0 && currentMessages.length > 0) {
        // Check if the last message ID is different (indicating new messages)
        const lastNewMsg = data[data.length - 1];
        const lastCurrentMsg = currentMessages[currentMessages.length - 1];
        
        if (lastNewMsg._id !== lastCurrentMsg._id && 
            lastNewMsg._id !== lastCurrentMsg.id) {
          hasNewMessages = true;
        } else {
          // Check if message status has been updated (e.g., booking status change)
          // Only compare key fields instead of the entire object
          const statusChanged = lastNewMsg.bookingStatus !== lastCurrentMsg.bookingStatus;
          const contentChanged = lastNewMsg.content !== lastCurrentMsg.content;
          
          hasNewMessages = statusChanged || contentChanged;
        }
      }
      
      // Update only when there are new messages or status changes
      if (hasNewMessages) {
        // Preserve the updated state in the current UI to avoid UI flicker caused by polling
        const updatedMessages = data.map(newMsg => {
          // Find the current message with the same ID
          const existingMsg = currentMessages.find(msg => 
            msg._id === newMsg._id || msg.id === newMsg._id
          );
          
          // If a matching message is found, preserve some UI state
          if (existingMsg) {
            return {
              ...newMsg,
              // Ensure other fields used for UI display are preserved
              isCurrentUserSender: existingMsg.isCurrentUserSender,
              id: newMsg._id // Ensure the id field is consistent
            };
          }
          
          return newMsg;
        });
        
        set({ activeMessages: updatedMessages });
      }
      
      if (!skipLoading) {
        set({ messageLoading: false });
      }
      
      return hasNewMessages;
    } catch (error) {
      console.error("Error fetching messages:", error);
      if (!skipLoading) {
        set({ messageLoading: false });
      }
      return false;
    }
  },
  
  sendMessage: async (conversationId, senderId, content) => {
    if (!conversationId || !senderId || !content) return;
    
    try {
      // Find conversation to get recipient ID
      const conversation = get().conversations.find(conv => conv._id === conversationId);
      if (!conversation) {
        throw new Error("Conversation not found");
      }
      
      const recipientId = conversation.otherUser._id;
      
      // Create optimistic message for instant UI feedback
      const optimisticMessage = {
        _id: `temp-${Date.now()}`,
        sender: {
          _id: senderId // Make sure sender is an object with _id
        },
        content,
        createdAt: new Date().toISOString(),
      };

      // Update local state immediately
      set((state) => ({
        activeMessages: [...state.activeMessages, optimisticMessage]
      }));
      
      // Send the API request
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderId,
          recipientId,
          content
        })
      });
      
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }
      
      const responseData = await response.json();
      
      // The actual message is in responseData.data
      const newMessage = responseData.data || responseData;
      
      // Update with the real message and update conversation locally
      set((state) => ({
        activeMessages: state.activeMessages
          .filter(msg => msg._id !== optimisticMessage._id)
          .concat(newMessage),
        
        // Update the conversation list directly without refetching
        conversations: state.conversations.map(conv => {
          if (conv._id === conversationId) {
            return {
              ...conv,
              lastMessageTimestamp: new Date().toISOString(),
              lastMessage: content // Update the last message preview
            };
          }
          return conv;
        })
      }));
      
      return newMessage;
    } catch (error) {
      console.error("Error sending message:", error);
      // Remove temporary message on error
      set((state) => ({
        activeMessages: state.activeMessages.filter(msg => !msg._id.startsWith('temp-'))
      }));
      return null;
    }
  },
  
  updateLocalMessage: (updatedMessage) => {
    if (!updatedMessage || !updatedMessage.id) return;
    
    set((state) => ({
      activeMessages: state.activeMessages.map(message => 
        message._id === updatedMessage.id || message.id === updatedMessage.id 
          ? { 
              ...message, 
              bookingStatus: updatedMessage.bookingStatus,
              senderDisplayText: updatedMessage.senderDisplayText,
              receiverDisplayText: updatedMessage.receiverDisplayText
            }
          : message
      )
    }));
    
    // Also update the conversation list if this is the last message
    const conversationId = get().activeConversation;
    if (conversationId) {
      set((state) => ({
        conversations: state.conversations.map(conv => {
          if (conv._id === conversationId) {
            return {
              ...conv,
              lastMessageTimestamp: new Date().toISOString(),
            };
          }
          return conv;
        })
      }));
    }
  }
}));