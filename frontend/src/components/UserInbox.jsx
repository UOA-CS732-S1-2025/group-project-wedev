import React, { useEffect, useState, useCallback } from 'react';
import { 
  Box, 
  VStack, 
  HStack, 
  Text, 
  Image, 
  Flex, 
  Icon,
  Spinner,
  Center,
  Alert,
} from '@chakra-ui/react';
import { FaCircle } from 'react-icons/fa';
import { useConversationStore } from '../store/conversationStore';
import useAuthStore from '../store/authStore';
import { formatDistanceToNow } from 'date-fns';
import ChatDialog from './ChatDialog';

const UserInbox = () => {
  const { user } = useAuthStore();
  const { 
    conversations, 
    loading, 
    error, 
    fetchConversations, 
    markConversationAsRead 
  } = useConversationStore();
  
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (user?._id) {
      fetchConversations(user._id);
    }
  }, [user, fetchConversations]);

  const handleConversationClick = useCallback((conversation) => {
    if (user?._id) {
      markConversationAsRead(conversation._id, user._id);
      setSelectedConversation(conversation);
      setIsDialogOpen(true);
    }
  }, [user, markConversationAsRead]);

  const handleDialogClose = useCallback(() => {
    setIsDialogOpen(false);
  }, []);

  // Helper function to format timestamp
  const formatTimestamp = useCallback((timestamp) => {
    if (!timestamp) return '';
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (e) {
      return timestamp;
    }
  }, []);

  if (loading) {
    return (
      <Center h="300px">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }

  if (error) {
    return (
      <Alert status="error" mx={4} my={4} borderRadius="md">
        <Alert.Icon />
        {error}
      </Alert>
    );
  }

  if (!conversations || conversations.length === 0) {
    return (
      <Box p={8} textAlign="center">
        <Text fontSize="lg" color="gray.500">No conversations yet</Text>
      </Box>
    );
  }

  return (
    <>
      <Box bg="gray.50" minH="100vh" py={8} px={4}>
        <Box 
          w={{ base: "95%", md: "85%", lg: "90%" }} 
          minH="500px"
          mx="auto" 
          bg="white" 
          borderRadius="lg" 
          boxShadow="md" 
          overflow="hidden"
        >
          <Box maxH="calc(100vh - 200px)" overflowY="auto" p={2}>
            <VStack spacing={0} align="stretch">
              {conversations.map((conversation, index) => (
                <Box key={conversation._id}>
                  <Box 
                    p={4} 
                    bg={conversation.unreadCount > 0 ? "blue.50" : "white"}
                    _hover={{ bg: conversation.unreadCount > 0 ? "blue.100" : "gray.50" }}
                    transition="background 0.2s"
                    cursor="pointer"
                    onClick={() => handleConversationClick(conversation)}
                  >
                    <HStack spacing={4} align="center">
                      <Image
                        src={conversation.otherUser?.profilePictureUrl || "https://bit.ly/sage-adebayo"}
                        boxSize="50px"
                        borderRadius="full"
                        objectFit="cover"
                        alt={conversation.otherUser?.username || "User"}
                        loading="eager"
                        crossOrigin="anonymous"
                      />
                      
                      <Flex flex="1" direction="column">
                        <HStack justify="space-between" mb={1}>
                          <HStack>
                            <Text fontWeight="bold">{conversation.otherUser?.username || "User"}</Text>
                            {conversation.unreadCount > 0 && (
                              <Icon as={FaCircle} color="blue.500" boxSize={2} />
                            )}
                          </HStack>
                          <Text fontSize="xs" color="gray.500">
                            {formatTimestamp(conversation.lastMessageTimestamp)}
                          </Text>
                        </HStack>
                        
                        {conversation.lastMessage && (
                          <Text fontSize="sm" color="gray.600" noOfLines={1}>
                            {conversation.lastMessage}
                          </Text>
                        )}
                        
                        {conversation.unreadCount > 0 && (
                          <Text fontSize="sm" fontWeight="semibold" color="blue.500">
                            {conversation.unreadCount} new {conversation.unreadCount === 1 ? 'message' : 'messages'}
                          </Text>
                        )}
                      </Flex>
                    </HStack>
                  </Box>
                  {index < conversations.length - 1 && (
                    <Box borderBottom="1px solid" borderColor="gray.200" />
                  )}
                </Box>
              ))}
            </VStack>
          </Box>
        </Box>
      </Box>
      
      {selectedConversation && (
        <ChatDialog
          isOpen={isDialogOpen}
          onClose={handleDialogClose}
          conversationId={selectedConversation._id}
          otherUser={selectedConversation.otherUser}
        />
      )}
    </>
  );
};

export default React.memo(UserInbox);