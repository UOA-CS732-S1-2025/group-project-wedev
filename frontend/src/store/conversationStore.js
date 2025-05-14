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
  
  fetchMessages: async (conversationId, skipLoading = false) => {
    if (!conversationId) return false;
    
    // 只有在非轮询模式下才显示加载状态
    if (!skipLoading) {
      set({ messageLoading: true });
    }
    
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`);
      
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }
      
      const data = await response.json();
      
      // 获取当前的消息列表和当前正在显示的数据
      const currentMessages = get().activeMessages;
      
      // 检查是否有新消息
      let hasNewMessages = false;
      
      // 如果消息数量不同，肯定有变化
      if (data.length !== currentMessages.length) {
        hasNewMessages = true;
      } else if (data.length > 0 && currentMessages.length > 0) {
        // 检查最后一条消息的ID是否不同（有新消息）
        const lastNewMsg = data[data.length - 1];
        const lastCurrentMsg = currentMessages[currentMessages.length - 1];
        
        if (lastNewMsg._id !== lastCurrentMsg._id && 
            lastNewMsg._id !== lastCurrentMsg.id) {
          hasNewMessages = true;
        } else {
          // 检查消息状态是否有更新（如booking状态变化）
          // 只需要比较关键字段而不是整个对象
          const statusChanged = lastNewMsg.bookingStatus !== lastCurrentMsg.bookingStatus;
          const contentChanged = lastNewMsg.content !== lastCurrentMsg.content;
          
          hasNewMessages = statusChanged || contentChanged;
        }
      }
      
      // 只有当有新消息或状态变化时才更新
      if (hasNewMessages) {
        // 保留当前UI中的更新状态，避免轮询引起的UI跳动
        const updatedMessages = data.map(newMsg => {
          // 查找相同ID的当前消息
          const existingMsg = currentMessages.find(msg => 
            msg._id === newMsg._id || msg.id === newMsg._id
          );
          
          // 如果找到匹配的消息，保留一些UI状态
          if (existingMsg) {
            return {
              ...newMsg,
              // 确保保留用于UI显示的其他字段
              isCurrentUserSender: existingMsg.isCurrentUserSender,
              id: newMsg._id // 确保id字段一致
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