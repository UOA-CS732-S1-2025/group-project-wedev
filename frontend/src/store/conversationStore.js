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
      // 先查找对话以获取接收者ID
      const conversation = get().conversations.find(conv => conv._id === conversationId);
      if (!conversation) {
        throw new Error("Conversation not found");
      }
      
      const recipientId = conversation.otherUser._id;
      
      // 先更新本地状态，提高响应速度
      const optimisticMessage = {
        _id: `temp-${Date.now()}`,
        sender: senderId,
        content,
        createdAt: new Date().toISOString(),
      };

      // 立即更新UI
      set((state) => ({
        activeMessages: [...state.activeMessages, optimisticMessage]
      }));
      
      // 然后发送请求，注意这里使用了 recipientId 而不是 conversationId
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
      
      const newMessage = await response.json();
      
      // 用真实消息替换临时消息
      set((state) => ({
        activeMessages: state.activeMessages
          .filter(msg => msg._id !== optimisticMessage._id)
          .concat(newMessage)
      }));
      
      // 刷新会话列表
      get().fetchConversations(senderId);
      
      return newMessage;
    } catch (error) {
      console.error("Error sending message:", error);
      // 移除临时消息
      set((state) => ({
        activeMessages: state.activeMessages.filter(msg => !msg._id.startsWith('temp-'))
      }));
      return null;
    }
  }
}));