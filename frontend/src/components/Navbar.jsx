import { Box, Button, Container, Flex, HStack, Icon } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import React from "react";
import { FaLeaf, FaStar, FaCircle } from "react-icons/fa";

const Navbar = () => {
  return (
    <Container maxW="1920px" px={4} bg={"yellow.100"} py={4}>
      <Flex
        justify="space-between"
        align="center"
        flexDir={{ base: "column", sm: "row" }}
      >
        {/* 左侧图标 */}
        <HStack spacing={4} color="green.500">
          <Icon as={FaLeaf} boxSize={8} />
          <Icon as={FaStar} boxSize={8} />
          <Icon as={FaCircle} boxSize={8} />
        </HStack>

        {/* 右侧按钮 */}
        <HStack spacing={4}>
          <Button>Log in</Button>
          <Button>Sign up</Button>
          <Button as={RouterLink} to="/">Home</Button>
          <Button as={RouterLink} to="/booking">Book</Button>
        </HStack>
      </Flex>
    </Container>
  );
};

export default Navbar;