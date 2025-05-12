import { Box, Button, Container, Flex, HStack, Image } from "@chakra-ui/react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import React from "react";
import UserNavActions from "./UserNavActions";

import useAuthStore from "../store/authStore";

const Navbar = () => {
  const { user, login, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <Container maxW="1920px" px={4} bg="gray.100" py={4}>
      <Flex
        justify="space-between"
        align="center"
        flexDir={{ base: "column", sm: "row" }}
      >
        {/* Left: logo */}
        <HStack spacing={4}>
          <Image
            src="https://urbaneaseproject.s3.us-east-1.amazonaws.com/hopme+pageUE.svg"
            alt="UrbanEase Logo"
            w="100px"
            h="40px"
            transition="transform 0.2s ease"            // animate the transform
           _hover={{ transform: "scale(1.2)" }}         // adjust dimensions as needed
            objectFit="contain"
            cursor="pointer"
            onClick={() => navigate("/")}
          />
        </HStack>

        {/* Right side */}
        <HStack spacing={4}>
          {!user ? (
            <>
              <Button as={RouterLink} to="/login">Log in</Button>
              <Button as={RouterLink} to="/signup">Sign up</Button>
            </>
          ) : (
            <UserNavActions user={user} logout={logout} />
          )}
        </HStack>
      </Flex>
    </Container>
  );
};

export default Navbar;
