import { Flex, Text, Avatar, HStack, Box, Badge, Menu, Portal } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaAngleDown } from "react-icons/fa";

const UserNavActions = ({ user, logout }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  // Get the full name from firstName and lastName if available
  const displayName = user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}`
    : user?.username || "User";
  
  useEffect(() => {
    if (user?._id) {
      // Fetch unread message count
      const fetchUnreadCount = async () => {
        try {
<<<<<<< HEAD
          const response = await fetch(`/api/messages/unread-count?userId=${user._id}`);
=======
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/messages/unread-count?userId=${user._id}`);
>>>>>>> origin/main
          if (response.ok) {
            const data = await response.json();
            setUnreadCount(data.unreadCount);
          }
        } catch (error) {
          console.error("Error fetching unread count:", error);
        }
      };

      fetchUnreadCount();
      
      // Set up polling to check for new messages every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);
    
  return (
    <Menu.Root >
      <Menu.Trigger asChild >
        <Flex 
          variant="ghost" 
          p={1} 
          borderRadius="md" 
          aria-label="User menu"
          cursor="pointer"
          _hover={{ bg: "gray.300" }}
          transition="background-color 0.2s ease"
        >
          <HStack spacing="2">
            <Avatar.Root size="xs">
              <Avatar.Fallback name={displayName} />
              <Avatar.Image src={user?.profilePictureUrl || "https://bit.ly/sage-adebayo"} />
            </Avatar.Root>
            <Text fontWeight="medium" fontSize="sm">{displayName}</Text>
            <FaAngleDown />

          </HStack>
        </Flex>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            {user?.role === "admin" && (
              <>
                <Menu.Item value="admin" as={RouterLink} to="/profile?tab=admin" cursor="pointer" >
                  Admin
                </Menu.Item>
                <Menu.Separator />
              </>
            )}
            
            <Menu.Item value="home" as={RouterLink} to="/" cursor="pointer">
              Home
            </Menu.Item>
            <Menu.Item value="dashboard" as={RouterLink} to="/profile?tab=dashboard" cursor="pointer">
              Dashboard
            </Menu.Item>
            <Menu.Item value="messages" as={RouterLink} to="/profile?tab=messages" cursor="pointer">
              <HStack justifyContent="space-between" w="full">
                <Text>Messages</Text>
                {unreadCount > 0 && (
                  <Badge colorScheme="red" variant="solid" borderRadius="full" px="1.5" fontSize="xs">
                    {unreadCount}
                  </Badge>
                )}
              </HStack>
            </Menu.Item>
            <Menu.Item value="profile" as={RouterLink} to="/profile?tab=profile" cursor="pointer">
              Profile
            </Menu.Item>
            <Menu.Item value="orders" as={RouterLink} to="/profile?tab=orders" cursor="pointer">
              My Orders
            </Menu.Item>

            <Menu.Separator />
            <Menu.Item value="logout" onClick={logout} color="red.500" cursor="pointer">
              Logout
            </Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
};

export default UserNavActions;