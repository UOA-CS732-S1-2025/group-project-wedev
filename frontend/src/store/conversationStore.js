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
      const response = await fetch(`/api/conversations?userId=${userId}`);
      
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
      await fetch(`/api/conversations/${conversationId}/read`, {
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
  
  fetchMessages: async (conversationId) => {
    if (!conversationId) return;
    
    set({ messageLoading: true });
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`);
      
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }
      
      const data = await response.json();
      set({ 
        activeMessages: data,
        messageLoading: false 
      });
    } catch (error) {
      console.error("Error fetching messages:", error);
      set({ messageLoading: false });
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
      const response = await fetch('/api/messages', {
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
  }
}));