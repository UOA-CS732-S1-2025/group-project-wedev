import React, { useEffect } from "react";
import {
  Container,
  SimpleGrid,
  Text,
  Button,
  Box,
  HStack,
  VStack,
  Card,
  CardBody,
} from "@chakra-ui/react";
import { useUserStore } from "../store/user";
import UserCard from "../components/UserCard";
const HomePage = () => {
  const { users, fetchUsers, deleteUser } = useUserStore();
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  console.log(users);

  return (
    <Container maxW="container.sm" py={6}>
      <VStack spacing={3} align="stretch">
        {users.map((user) => (
          <HStack key={user._id} user={user} p={3} borderWidth={1} borderRadius="md" justify="space-between" 
          _hover={{ 
            bg: "gray.100",
            transform: "scale(1.01)",
            boxShadow: "md"
            }}
        transition={"all 0.1s ease-in-out"}>
            <Box>
              <Text fontWeight="bold">{user.name}</Text>
              <Text fontSize="sm" color="gray.500">{user.email}</Text>
            </Box>
            <Button colorScheme="red" size="sm" onClick={() => deleteUser(user._id)}>Delete</Button>
          </HStack>
        ))}
      </VStack>
    </Container>
  );
};

export default HomePage;
