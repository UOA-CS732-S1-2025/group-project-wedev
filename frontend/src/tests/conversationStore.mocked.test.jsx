import { describe, test, expect, vi, beforeEach } from 'vitest';
import { useConversationStore } from '../store/conversationStore';

// Mock fetch
global.fetch = vi.fn();

describe('conversationStore Tests', () => {
  let store;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset store
    useConversationStore.setState({
      conversations: [],
      loading: false,
      error: null,
      activeConversation: null,
      activeMessages: [],
      messageLoading: false,
    });
    
    // Get store instance
    store = useConversationStore.getState();
    
    // Mock successful fetch response
    fetch.mockResolvedValue({
      ok: true,
      json: async () => [],
    });
  });

  test('Initial state should be set correctly', () => {
    expect(store.conversations).toEqual([]);
    expect(store.loading).toBe(false);
    expect(store.error).toBeNull();
    expect(store.activeConversation).toBeNull();
    expect(store.activeMessages).toEqual([]);
    expect(store.messageLoading).toBe(false);
  });

  test('fetchConversations should get user conversation list', async () => {
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

  test('fetchConversations should handle errors', async () => {
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

  test('setActiveConversation should update current active conversation', () => {
    const conversationId = 'conv123';
    
    store.setActiveConversation(conversationId);
    
    const updatedStore = useConversationStore.getState();
    expect(updatedStore.activeConversation).toBe(conversationId);
  });

  test('markConversationAsRead should update conversation unread count', async () => {
    // Set initial state
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

  test('fetchMessages should get conversation messages', async () => {
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
    expect(result).toBe(true); // Has new messages
    
    const updatedStore = useConversationStore.getState();
    expect(updatedStore.activeMessages).toEqual(mockMessages);
    expect(updatedStore.messageLoading).toBe(false);
  });

  test('fetchMessages should handle errors', async () => {
    const conversationId = 'conv123';
    
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });
    
    const result = await store.fetchMessages(conversationId);
    
    expect(result).toBe(false); // No new messages
    
    const updatedStore = useConversationStore.getState();
    expect(updatedStore.messageLoading).toBe(false);
  });

  test('fetchMessages should not show loading state in polling mode', async () => {
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

  test('Send message function should work correctly', async () => {
    // Set initial state
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
    
    // Mock successful message sending response
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
    
    // Send message
    const result = await store.sendMessage(conversationId, senderId, content);
    
    // Verify API call
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
    
    // Verify return value
    expect(result).toEqual(newMessage);
    
    // Verify store state update
    const updatedStore = useConversationStore.getState();
    
    // Check if message list is updated
    expect(updatedStore.activeMessages).toContainEqual(newMessage);
    
    // Check if conversation list is updated
    const updatedConversation = updatedStore.conversations.find(c => c._id === conversationId);
    expect(updatedConversation.lastMessage).toBe(content);
  });

  test('updateLocalMessage should update local message state', () => {
    // Set initial state
    const initialMessages = [
      { _id: 'msg1', id: 'msg1', content: 'Hello' },
      { _id: 'msg2', id: 'msg2', content: 'Hi there', bookingStatus: 'pending' },
    ];
    
    useConversationStore.setState({
      activeMessages: initialMessages,
    });
    
    // Update message
    store.updateLocalMessage('msg2', { bookingStatus: 'confirmed' });
    
    // Verify state update
    const updatedStore = useConversationStore.getState();
    const updatedMessage = updatedStore.activeMessages.find(m => m._id === 'msg2');
    
    expect(updatedMessage.bookingStatus).toBe('confirmed');
  });
}); 