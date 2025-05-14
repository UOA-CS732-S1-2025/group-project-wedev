import { Box, Button, Container, Flex, HStack, Text, Image} from "@chakra-ui/react";
import { useNavigate , Link as RouterLink } from "react-router-dom";
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
        {/* Left icons */}
        <HStack spacing={4} color="green.500">
          <Image
            src="https://urbaneaseproject.s3.us-east-1.amazonaws.com/UEase.png"
            alt="UrbanEase Logo"
            w="120px"
            h="auto"
            objectFit="contain"
            cursor="pointer"
            onClick={() => navigate("/")}
          />
        </HStack>

        {/* Right side */}
        <HStack spacing={4}>
            {!user ? (
              <>
                <Button
                  as={RouterLink}
                  to="/login"
                  pos="relative"
                  bg="black"
                  color="white"
                  transition="color 0.2s ease"
                  _before={{
                    content: '""',
                    pos: "absolute",
                    top: 0, left: 0, bottom: 0,
                    width: "0%",
                    bg: "blue.500",
                    transition: "width 0.1s ease",
                    zIndex: 0,
                  }}
                  _active={{
                    _before: { width: "100%" },
                    color: "white",
                  }}
                >
                  <Box pos="relative" zIndex={1}>Log in</Box>
                </Button>

                <Button
                  as={RouterLink}
                  to="/signup"
                  pos="relative"
                  overflow="hidden"
                  bg="black"
                  color="White"
                  transition="color 0.1s ease"
                  _before={{
                    content: '""',
                    pos: "absolute",
                    top: 0, left: 0, bottom: 0,
                    width: "0%",
                    bg: "blue.500",
                    transition: "width 0.1s ease",
                    zIndex: 0,
                  }}
                  _active={{
                    _before: { width: "100%" },
                    color: "white",
                  }}
                >
                  <Box pos="relative" zIndex={1}>Sign up</Box>
                </Button>
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