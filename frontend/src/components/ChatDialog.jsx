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
import { useChatDialogStore } from '../store/chatDialogStore';
import useAuthStore from '../store/authStore';
import ChatMessage from './ChatMessage';
import CachedAvatar from './CachedAvatar';

const ChatDialog = () => {
  const { user } = useAuthStore();
  const { activeMessages, messageLoading, fetchMessages, sendMessage } = useConversationStore();
  const { isOpen, conversationId, otherUser, closeDialog } = useChatDialogStore();
  
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  
  // Cache user information
  const currentUserInfo = useMemo(() => ({
    id: user?._id,
    username: user?.username,
    profilePictureUrl: user?.profilePictureUrl
  }), [user?._id, user?.username, user?.profilePictureUrl]);
  
  const otherUserInfo = useMemo(() => ({
    id: otherUser?._id,
    username: otherUser?.username,
    profilePictureUrl: otherUser?.profilePictureUrl
  }), [otherUser]);
  
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
    
    // Clear input field first for better UX
    const messageToSend = newMessage;
    setNewMessage('');
    
    await sendMessage(conversationId, user._id, messageToSend);
  }, [newMessage, user?._id, conversationId, sendMessage]);
  
  const handleOpenChange = useCallback(({open}) => {
    if (!open && isOpen) {
      closeDialog();
    }
  }, [closeDialog, isOpen]);
  
  // Process and cache message data
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
  
  // Cache dialog title
  const dialogTitle = useMemo(() => {
    return otherUser?.firstName && otherUser?.lastName
      ? `${otherUser.firstName} ${otherUser.lastName}`
      : otherUser?.username || "User";
  }, [otherUser]);
  
  // If not open or no otherUser, don't render anything
  if (!isOpen || !otherUser) return null;
  
  return (
    <Dialog.Root 
      open={isOpen} 
      onOpenChange={handleOpenChange}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner 
          display="flex" 
          alignItems="center" 
          justifyContent="center" 
          w="full" 
          h="full"
        >
          <Dialog.Content 
            h="80vh" 
            w="600px"
            maxW="90%" 
            maxH="90%" 
            display="flex" 
            flexDirection="column"
            overflow="hidden"
          >
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