import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { 
  Box,
  Input,
  VStack, 
  HStack, 
  Flex, 
  Spinner,
  IconButton,
  Dialog,
  Portal,
} from '@chakra-ui/react';
import { LuSend } from 'react-icons/lu';
import { useConversationStore } from '../store/conversationStore';
import useAuthStore from '../store/authStore';
import ChatMessage from './ChatMessage';
import CachedAvatar from './CachedAvatar';

const ChatDialog = ({ 
  isOpen, 
  onClose, 
  conversationId,
  otherUser
}) => {
  const { user } = useAuthStore();
  const { activeMessages, messageLoading, fetchMessages, sendMessage } = useConversationStore();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const dialogOpenRef = useRef(isOpen);
  
  // 缓存用户信息，避免重新渲染时重新创建
  const currentUserInfo = useMemo(() => ({
    id: user?._id,
    username: user?.username,
    profilePictureUrl: user?.profilePictureUrl
  }), [user?._id, user?.username, user?.profilePictureUrl]);
  
  const otherUserInfo = useMemo(() => ({
    id: otherUser?._id,
    username: otherUser?.username,
    profilePictureUrl: otherUser?.profilePictureUrl
  }), [otherUser?._id, otherUser?.username, otherUser?.profilePictureUrl]);
  
  // 保持最新的 isOpen 状态在 ref 中
  useEffect(() => {
    dialogOpenRef.current = isOpen;
  }, [isOpen]);
  
  useEffect(() => {
    if (isOpen && conversationId) {
      fetchMessages(conversationId);
    }
  }, [isOpen, conversationId, fetchMessages]);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeMessages]);
  
  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !user?._id || !conversationId) return;
    
    // 先清空输入框，提高响应速度
    const messageToSend = newMessage;
    setNewMessage('');
    
    await sendMessage(conversationId, user._id, messageToSend);
  }, [newMessage, user?._id, conversationId, sendMessage]);
  
  // 使用 useCallback 包装对话框关闭处理函数
  const handleOpenChange = useCallback(({open}) => {
    if (!open && dialogOpenRef.current) {
      onClose();
    }
  }, [onClose]);
  
  // 预处理和缓存消息数据
  const processedMessages = useMemo(() => {
    if (!Array.isArray(activeMessages)) return [];
    
    return activeMessages.map(message => {
      const messageSenderId = String(message.sender?._id || message.sender);
      const isCurrentUserSender = messageSenderId === String(user?._id);
      
      return {
        ...message,
        id: message._id || `msg-${Math.random()}`,
        isCurrentUserSender
      };
    });
  }, [activeMessages, user?._id]);
  
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  }, [handleSendMessage]);
  
  // 缓存对话框标题
  const dialogTitle = useMemo(() => {
    return otherUser?.firstName && otherUser?.lastName
      ? `${otherUser.firstName} ${otherUser.lastName}`
      : otherUser?.username || "User";
  }, [otherUser?.firstName, otherUser?.lastName, otherUser?.username]);
  
  return (
    <Dialog.Root 
      open={isOpen} 
      onOpenChange={handleOpenChange}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner maxW="90%" maxH="90%" w="600px">
          <Dialog.Content h="80vh" display="flex" flexDirection="column">
            <Dialog.Header>
              <HStack spacing={3}>
                <CachedAvatar
                  name={otherUser?.username || "User"}
                  src={otherUser?.profilePictureUrl}
                  size="sm"
                />
                <Dialog.Title>{dialogTitle}</Dialog.Title>
              </HStack>
              <Dialog.CloseTrigger />
            </Dialog.Header>

            <Dialog.Body 
              flex="1" 
              overflowY="auto" 
              py={4} 
              px={2}
              bg="gray.50"
            >
              {messageLoading ? (
                <Flex justify="center" align="center" h="100%">
                  <Spinner size="xl" color="blue.500" />
                </Flex>
              ) : (
                <VStack spacing={4} align="stretch">
                  {processedMessages.map((message) => (
                    <ChatMessage 
                      key={message.id}
                      message={message}
                      isCurrentUserSender={message.isCurrentUserSender}
                      currentUser={currentUserInfo}
                      otherUser={otherUserInfo}
                    />
                  ))}
                  <Box ref={messagesEndRef} />
                </VStack>
              )}
            </Dialog.Body>

            <Dialog.Footer as={HStack}>
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                flex="1"
              />
              <IconButton 
                icon={<LuSend />} 
                onClick={handleSendMessage} 
                isDisabled={!newMessage.trim()} 
                colorScheme="blue"
                aria-label="Send message"
              />
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default React.memo(ChatDialog);