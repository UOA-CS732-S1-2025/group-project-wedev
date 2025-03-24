import React, { useEffect } from "react";
import {
  Container,
  SimpleGrid,
  VStack,
  Text,
  Button,
  Box,
} from "@chakra-ui/react";
import { useUserStore } from "../store/user";
import UserCard from "../components/UserCard";
const HomePage = () => {
  const { users, fetchUsers } = useUserStore();
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  console.log(users);

  return (
    <Container maxW={"container.sm"} py={12}>
      <ul>
        {users.map((user) => (
          <li key={user._id}>{user.name}</li>
        ))}
      </ul>
    </Container>
  );
};

export default HomePage;
