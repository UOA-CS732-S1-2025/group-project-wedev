import React, { useEffect, useCallback, useState } from 'react';
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
  Grid,
  GridItem,
} from '@chakra-ui/react';
import { FaCircle } from 'react-icons/fa';
import { useConversationStore } from '../store/conversationStore';
import { useChatDialogStore } from '../store/chatDialogStore';
import useAuthStore from '../store/authStore';
import { formatDistanceToNow } from 'date-fns';
import ConversationView from './ConversationView'; // We'll create this component next

const UserInbox = () => {
  const { user } = useAuthStore();
  const { 
    conversations, 
    loading, 
    error, 
    fetchConversations, 
    markConversationAsRead 
  } = useConversationStore();
  
  const { openDialog, conversationId: targetConversationIdFromStore } = useChatDialogStore();
  const [selectedConversation, setSelectedConversation] = useState(null);

  useEffect(() => {
    if (user?._id) {
      fetchConversations(user._id);
    }
  }, [user, fetchConversations]);

  // Effect to auto-select conversation based on targetConversationIdFromStore
  useEffect(() => {
    if (targetConversationIdFromStore && conversations.length > 0) {
      const conversationToSelect = conversations.find(c => c._id === targetConversationIdFromStore);
      if (conversationToSelect) {
        // Avoid re-selecting if already selected, or if selectedConversation is programmatically set
        if (!selectedConversation || selectedConversation._id !== conversationToSelect._id) {
          setSelectedConversation(conversationToSelect);
          if (user?._id) {
            // Mark as read when programmatically selected
            markConversationAsRead(conversationToSelect._id, user._id);
          }
        }
      } 
      // If not found, it might be that `fetchConversations` (called on mount) will soon provide it.
      // The list will re-render, and this effect will run again.
    }
  }, [targetConversationIdFromStore, conversations, user, markConversationAsRead, selectedConversation]);

  const handleConversationClick = useCallback((conversation) => {
    if (user?._id) {
      markConversationAsRead(conversation._id, user._id);
      openDialog(conversation._id, conversation.otherUser);
      setSelectedConversation(conversation);
    }
  }, [user, markConversationAsRead, openDialog]);

  // Helper function to format timestamp
  const formatTimestamp = useCallback((timestamp) => {
    if (!timestamp) return '';
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (e) {
      return timestamp;
    }
  }, []);

  const renderConversationList = () => {
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
        <Box p={6} textAlign="center">
          <Text fontSize="md" color="gray.500">No conversations yet</Text>
        </Box>
      );
    }

    return (
      <VStack spacing={0} align="stretch" h="100%" overflowY="auto">
        {conversations.map((conversation, index) => (
          <Box 
            key={conversation._id}
            borderBottom={index < conversations.length - 1 ? "1px solid" : "none"} 
            borderColor="gray.200"
          >
            <Box 
              p={4} 
              bg={
                selectedConversation?._id === conversation._id 
                  ? "blue.100" 
                  : conversation.unreadCount > 0 
                    ? "blue.50" 
                    : "white"
              }
              _hover={{ bg: "gray.50" }}
              transition="background 0.2s"
              cursor="pointer"
              onClick={() => handleConversationClick(conversation)}
            >
              <HStack spacing={3} align="center">
                <Image
                  src={conversation.otherUser?.profilePictureUrl || "https://bit.ly/sage-adebayo"}
                  boxSize="40px"
                  borderRadius="full"
                  objectFit="cover"
                  alt={conversation.otherUser?.username || "User"}
                  loading="eager"
                  crossOrigin="anonymous"
                />
                
                <Flex flex="1" direction="column">
                  <HStack justify="space-between" mb={1}>
                    <HStack>
                      <Text fontWeight="bold" fontSize="sm">{conversation.otherUser?.username || "User"}</Text>
                      {conversation.unreadCount > 0 && (
                        <Icon as={FaCircle} color="blue.500" boxSize={2} />
                      )}
                    </HStack>
                  </HStack>
                  
                  <Text fontSize="xs" color="gray.500">
                    {formatTimestamp(conversation.lastMessageTimestamp)}
                  </Text>
                </Flex>
              </HStack>
            </Box>
          </Box>
        ))}
      </VStack>
    );
  };

  return (
    <Box py={4} position="relative" zIndex={1}>
      <Grid 
        templateColumns={{ base: "1fr", md: "300px 1fr" }}
        gap={4}
        w="100%" 
        bg="white" 
        borderRadius="lg" 
        boxShadow="md" 
        overflow="hidden"
        minH="550px"
        maxH="calc(100vh - 200px)"
      >
        {/* Left sidebar: Conversation list */}
        <GridItem 
          borderRight="1px solid" 
          borderColor="gray.200" 
          overflowY="auto"
          maxH="calc(100vh - 200px)"
        >
          <Box p={2} borderBottom="1px solid" borderColor="gray.200">
            <Text fontWeight="bold" fontSize="lg" py={2} px={4}>
              Messages
            </Text>
          </Box>
          {renderConversationList()}
        </GridItem>

        {/* Right content: Selected conversation */}
        <GridItem overflowY="auto" maxH="calc(100vh - 200px)">
          {selectedConversation ? (
            <ConversationView 
              conversation={selectedConversation} 
              user={user}
            />
          ) : (
            <Center h="100%">
              <Text color="gray.500">Select a conversation to start messaging</Text>
            </Center>
          )}
        </GridItem>
      </Grid>
    </Box>
  );
};

export default React.memo(UserInbox);