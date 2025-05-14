import { describe, test, expect, vi, beforeEach } from 'vitest';
import { useConversationStore } from '../store/conversationStore';

// 模拟 fetch
global.fetch = vi.fn();

describe('conversationStore 测试', () => {
  let store;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // 重置 store
    useConversationStore.setState({
      conversations: [],
      loading: false,
      error: null,
      activeConversation: null,
      activeMessages: [],
      messageLoading: false,
    });
    
    // 获取 store 实例
    store = useConversationStore.getState();
    
    // 模拟成功的 fetch 响应
    fetch.mockResolvedValue({
      ok: true,
      json: async () => [],
    });
  });

  test('初始状态应正确设置', () => {
    expect(store.conversations).toEqual([]);
    expect(store.loading).toBe(false);
    expect(store.error).toBeNull();
    expect(store.activeConversation).toBeNull();
    expect(store.activeMessages).toEqual([]);
    expect(store.messageLoading).toBe(false);
  });

  test('fetchConversations 应获取用户对话列表', async () => {
    const mockUserId = 'user123';
    const mockConversations = [
      { _id: 'conv1', otherUser: { _id: 'other1' } },
      { _id: 'conv2', otherUser: { _id: 'other2' } },
    ];
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockConversations,
    });
    
    await store.fetchConversations(mockUserId);
    
    expect(fetch).toHaveBeenCalledWith(`/api/conversations?userId=${mockUserId}`);
    
    const updatedStore = useConversationStore.getState();
    expect(updatedStore.conversations).toEqual(mockConversations);
    expect(updatedStore.loading).toBe(false);
    expect(updatedStore.error).toBeNull();
  });

  test('fetchConversations 应处理错误', async () => {
    const mockUserId = 'user123';
    
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });
    
    await store.fetchConversations(mockUserId);
    
    const updatedStore = useConversationStore.getState();
    expect(updatedStore.error).not.toBeNull();
    expect(updatedStore.loading).toBe(false);
  });

  test('setActiveConversation 应更新当前活动对话', () => {
    const conversationId = 'conv123';
    
    store.setActiveConversation(conversationId);
    
    const updatedStore = useConversationStore.getState();
    expect(updatedStore.activeConversation).toBe(conversationId);
  });

  test('markConversationAsRead 应更新对话的未读计数', async () => {
    // 设置初始状态
    const initialConversations = [
      { _id: 'conv1', unreadCount: 5, otherUser: { _id: 'other1' } },
      { _id: 'conv2', unreadCount: 3, otherUser: { _id: 'other2' } },
    ];
    
    useConversationStore.setState({
      conversations: initialConversations,
    });
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });
    
    await store.markConversationAsRead('conv1', 'user123');
    
    expect(fetch).toHaveBeenCalledWith('/api/conversations/conv1/read', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: 'user123' })
    });
    
    const updatedStore = useConversationStore.getState();
    const updatedConv = updatedStore.conversations.find(c => c._id === 'conv1');
    expect(updatedConv.unreadCount).toBe(0);
  });

  test('fetchMessages 应获取对话消息', async () => {
    const conversationId = 'conv123';
    const mockMessages = [
      { _id: 'msg1', content: 'Hello' },
      { _id: 'msg2', content: 'Hi there' },
    ];
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockMessages,
    });
    
    const result = await store.fetchMessages(conversationId);
    
    expect(fetch).toHaveBeenCalledWith(`/api/conversations/${conversationId}/messages`);
    expect(result).toBe(true); // 有新消息
    
    const updatedStore = useConversationStore.getState();
    expect(updatedStore.activeMessages).toEqual(mockMessages);
    expect(updatedStore.messageLoading).toBe(false);
  });

  test('fetchMessages 应处理错误', async () => {
    const conversationId = 'conv123';
    
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });
    
    const result = await store.fetchMessages(conversationId);
    
    expect(result).toBe(false); // 没有新消息
    
    const updatedStore = useConversationStore.getState();
    expect(updatedStore.messageLoading).toBe(false);
  });

  test('fetchMessages 在轮询模式下不应显示加载状态', async () => {
    const conversationId = 'conv123';
    const mockMessages = [
      { _id: 'msg1', content: 'Hello' },
    ];
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockMessages,
    });
    
    await store.fetchMessages(conversationId, true); // skipLoading = true
    
    const updatedStore = useConversationStore.getState();
    expect(updatedStore.messageLoading).toBe(false);
  });

  test('发送消息功能应正确工作', async () => {
    // 设置初始状态
    const conversationId = 'conv123';
    const senderId = 'user123';
    const recipientId = 'user456';
    const content = 'Hello there!';
    
    const initialConversations = [
      { 
        _id: conversationId, 
        otherUser: { _id: recipientId },
        lastMessage: 'Previous message',
      },
    ];
    
    useConversationStore.setState({
      conversations: initialConversations,
      activeConversation: conversationId,
      activeMessages: [],
    });
    
    // 模拟成功的消息发送响应
    const newMessage = {
      _id: 'msg123',
      sender: {
        _id: senderId,
      },
      content,
      createdAt: new Date().toISOString(),
    };
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: newMessage }),
    });
    
    // 发送消息
    const result = await store.sendMessage(conversationId, senderId, content);
    
    // 验证 API 调用
    expect(fetch).toHaveBeenCalledWith('/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        senderId,
        recipientId,
        content,
      }),
    });
    
    // 验证返回值
    expect(result).toEqual(newMessage);
    
    // 验证 store 状态更新
    const updatedStore = useConversationStore.getState();
    
    // 检查消息列表是否更新
    expect(updatedStore.activeMessages).toContainEqual(newMessage);
    
    // 检查对话列表是否更新
    const updatedConversation = updatedStore.conversations.find(c => c._id === conversationId);
    expect(updatedConversation.lastMessage).toBe(content);
  });

  test('updateLocalMessage 应更新本地消息状态', () => {
    // 设置初始状态
    const initialMessages = [
      { _id: 'msg1', id: 'msg1', content: 'Hello' },
      { _id: 'msg2', id: 'msg2', content: 'Hi there', bookingStatus: 'pending' },
    ];
    
    useConversationStore.setState({
      activeMessages: initialMessages,
    });
    
    // 更新消息
    const updatedMessageData = {
      id: 'msg2',
      bookingStatus: 'accepted',
      senderDisplayText: 'You accepted the booking',
      receiverDisplayText: 'Your booking was accepted',
    };
    
    store.updateLocalMessage(updatedMessageData);
    
    // 验证 store 状态更新
    const updatedStore = useConversationStore.getState();
    const updatedMessage = updatedStore.activeMessages.find(m => m.id === 'msg2');
    
    expect(updatedMessage.bookingStatus).toBe('accepted');
    expect(updatedMessage.senderDisplayText).toBe('You accepted the booking');
    expect(updatedMessage.receiverDisplayText).toBe('Your booking was accepted');
  });
}); 